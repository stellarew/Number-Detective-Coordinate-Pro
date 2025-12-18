
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, GameState, GridCell, PlaybackMode } from './types';
import { COLS, ROWS, TOTAL_ANOMALIES, SEARCH_DURATION, REVEAL_DURATION, CHAR_PAIRS, MUSIC_PLAYLIST, SFX_FILES } from './constants';
import Header from './components/Header';
import GameGrid from './components/GameGrid';
import StatusPanel from './components/StatusPanel';
import OutcomeOverlay from './components/OutcomeOverlay';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('detective_theme') !== 'light');
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SEARCH,
    grid: [],
    foundCount: 0,
    foundIds: [],
    totalAnomalies: TOTAL_ANOMALIES,
    timeLeft: SEARCH_DURATION,
    bgChar: '8',
    anomalyChar: 'B',
  });

  const [outcome, setOutcome] = useState<'victory' | 'loser' | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [lastFeedback, setLastFeedback] = useState<{ msg: string; type: 'success' | 'error' | null; key: number }>({ msg: 'SCAN CLEAR', type: null, key: 0 });
  
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('detective_muted') === 'true');
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [isDucking, setIsDucking] = useState(false);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Number(localStorage.getItem('detective_track_idx')) || 0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() => (localStorage.getItem('detective_play_mode') as PlaybackMode) || 'repeat-all');
  const [isShuffle, setIsShuffle] = useState(() => localStorage.getItem('detective_shuffle') === 'true');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(() => Number(localStorage.getItem('detective_bgm_vol')) || 50);
  const [isSearchingMusic, setIsSearchingMusic] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const outcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstErrorIndexRef = useRef<number | null>(null);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxCorrectRef = useRef<HTMLAudioElement | null>(null);
  const sfxWrongRef = useRef<HTMLAudioElement | null>(null);
  const sfxVictoryRef = useRef<HTMLAudioElement | null>(null);
  const sfxLoserRef = useRef<HTMLAudioElement | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const skipTrackRef = useRef<(direction: 'next' | 'prev') => void>(null!);
  const handleTrackEndedRef = useRef<() => void>(null!);

  useEffect(() => {
    document.body.className = isDarkMode ? 'theme-dark' : 'theme-light';
    localStorage.setItem('detective_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const createAudio = (url: string, loop = false, vol = 0.5) => {
      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = vol;
      audio.preload = "auto";
      return audio;
    };
    sfxCorrectRef.current = createAudio(`/media/sfx/${SFX_FILES.CORRECT}`, false, 0.4);
    sfxWrongRef.current = createAudio(`/media/sfx/${SFX_FILES.WRONG}`, false, 0.3);
    sfxVictoryRef.current = createAudio(`/media/sfx/${SFX_FILES.VICTORY}`, false, 1.0);
    sfxLoserRef.current = createAudio(`/media/sfx/${SFX_FILES.LOSER}`, false, 1.0);
  }, []);

  const initWebAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  }, []);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const baseGain = isMuted ? 0 : bgmVolume / 100;
      const targetGain = isDucking ? baseGain * 0.1 : baseGain; 
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.2);
    }
  }, [bgmVolume, isMuted, isDucking]);

  const playTrack = useCallback((index: number) => {
    initWebAudio();
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.onended = null;
      bgmRef.current.onerror = null;
    }
    const trackName = MUSIC_PLAYLIST[index];
    const audio = new Audio(`/media/music/${trackName}`);
    audio.onended = () => { firstErrorIndexRef.current = null; setIsSearchingMusic(false); handleTrackEndedRef.current(); };
    audio.onerror = () => { 
      if (firstErrorIndexRef.current === null) firstErrorIndexRef.current = index; 
      setIsSearchingMusic(true); 
      skipTrackRef.current('next'); 
    };
    if (audioCtxRef.current && gainNodeRef.current) {
      if (sourceNodeRef.current) sourceNodeRef.current.disconnect();
      sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audio);
      sourceNodeRef.current.connect(gainNodeRef.current);
    }
    bgmRef.current = audio;
    setCurrentTrackIndex(index);
    localStorage.setItem('detective_track_idx', String(index));
    if (audioUnlocked && isMusicPlaying) audio.play().then(() => { firstErrorIndexRef.current = null; setIsSearchingMusic(false); }).catch(() => {});
  }, [audioUnlocked, isMusicPlaying, initWebAudio]);

  const handleTrackEnded = useCallback(() => {
    if (playbackMode === 'repeat-one') { bgmRef.current?.play(); return; }
    let nextIndex = isShuffle ? Math.floor(Math.random() * MUSIC_PLAYLIST.length) : (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
    playTrack(nextIndex);
  }, [playbackMode, isShuffle, currentTrackIndex, playTrack]);

  const skipTrack = useCallback((direction: 'next' | 'prev') => {
    let nextIndex;
    if (isShuffle) nextIndex = Math.floor(Math.random() * MUSIC_PLAYLIST.length);
    else {
      if (direction === 'next') nextIndex = (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
      else nextIndex = (currentTrackIndex - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
    }
    if (firstErrorIndexRef.current !== null && nextIndex === firstErrorIndexRef.current) {
      setIsMusicPlaying(false); setIsSearchingMusic(false); firstErrorIndexRef.current = null; return;
    }
    if (skipThrottleRef.current) clearTimeout(skipThrottleRef.current);
    skipThrottleRef.current = setTimeout(() => playTrack(nextIndex), firstErrorIndexRef.current !== null ? 10 : 0);
  }, [currentTrackIndex, isShuffle, playTrack]);

  useEffect(() => {
    skipTrackRef.current = skipTrack;
    handleTrackEndedRef.current = handleTrackEnded;
  }, [skipTrack, handleTrackEnded]);

  const playSFX = (type: 'correct' | 'wrong' | 'victory' | 'loser') => {
    if (isMuted || !audioUnlocked) return;
    let sound;
    if (type === 'correct') sound = sfxCorrectRef.current;
    else if (type === 'wrong') sound = sfxWrongRef.current;
    else if (type === 'victory') sound = sfxVictoryRef.current;
    else if (type === 'loser') sound = sfxLoserRef.current;
    if (sound) { sound.currentTime = 0; sound.play().catch(() => {}); }
  };

  const generateLevel = useCallback(() => {
    const pair = CHAR_PAIRS[Math.floor(Math.random() * CHAR_PAIRS.length)];
    const newGrid: GridCell[] = [];
    for (const row of ROWS) {
      for (const col of COLS) {
        newGrid.push({ id: `${col}${row}`, row, col, value: pair.bg.repeat(5), isAnomaly: false, isFound: false });
      }
    }
    let placed = 0;
    while (placed < TOTAL_ANOMALIES) {
      const randomIndex = Math.floor(Math.random() * newGrid.length);
      if (!newGrid[randomIndex].isAnomaly) {
        const chars = pair.bg.repeat(5).split('');
        chars[Math.floor(Math.random() * 5)] = pair.anomaly;
        newGrid[randomIndex].isAnomaly = true;
        newGrid[randomIndex].value = chars.join('');
        placed++;
      }
    }
    setGameState({ phase: GamePhase.SEARCH, grid: newGrid, foundCount: 0, foundIds: [], totalAnomalies: TOTAL_ANOMALIES, timeLeft: SEARCH_DURATION, bgChar: pair.bg, anomalyChar: pair.anomaly });
    setOutcome(null); 
    setLastFeedback({ msg: 'SCAN CLEAR', type: null, key: Date.now() });
  }, []);

  const triggerOutcome = useCallback((type: 'victory' | 'loser') => {
    setOutcome(type); setIsDucking(true); playSFX(type);
    if (timerRef.current) clearInterval(timerRef.current);
    outcomeTimerRef.current = setTimeout(() => {
      setOutcome(null); setGameState(prev => ({ ...prev, phase: GamePhase.REVEAL, timeLeft: REVEAL_DURATION }));
      setIsDucking(false);
    }, 6000);
  }, [playSFX]);

  useEffect(() => {
    if (gameState.grid.length === 0) generateLevel();
    if (!outcome) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            if (prev.phase === GamePhase.SEARCH) { triggerOutcome('loser'); return { ...prev, timeLeft: 0 }; }
            if (prev.phase === GamePhase.REVEAL) { generateLevel(); return prev; }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [outcome, generateLevel, triggerOutcome, gameState.grid.length]);

  const processDetection = (id: string) => {
    if (gameState.phase !== GamePhase.SEARCH || outcome) return;
    const targetId = id.toUpperCase().trim();
    setGameState(prev => {
      const cell = prev.grid.find(c => c.id === targetId);
      if (!cell || cell.isFound) { 
        playSFX('wrong'); 
        setLastFeedback({ msg: 'COORDINATE INVALID', type: 'error', key: Date.now() });
        return prev; 
      }
      if (cell.isAnomaly) { 
        playSFX('correct'); 
        setLastFeedback({ msg: 'ANOMALY DETECTED', type: 'success', key: Date.now() });
        const updatedGrid = prev.grid.map(c => c.id === targetId ? { ...c, isFound: true } : c);
        const newCount = prev.foundCount + 1;
        if (newCount === TOTAL_ANOMALIES) setTimeout(() => triggerOutcome('victory'), 100);
        return { ...prev, grid: updatedGrid, foundCount: newCount, foundIds: [...prev.foundIds, targetId] }; 
      }
      else { 
        playSFX('wrong'); 
        setLastFeedback({ msg: 'SCAN NEGATIVE', type: 'error', key: Date.now() });
        return prev; 
      }
    });
  };

  const handleGlobalUnlock = () => {
    if(!audioUnlocked) { 
      setAudioUnlocked(true); 
      setIsMusicPlaying(true); 
      initWebAudio(); 
      if (!bgmRef.current) playTrack(currentTrackIndex); 
    }
  };

  return (
    <div className={`h-screen w-screen flex flex-col items-center select-none overflow-hidden transition-colors ${isDarkMode ? 'bg-[#020617] text-slate-100' : 'bg-slate-100 text-slate-900'}`} 
         onClick={handleGlobalUnlock}>
      
      {/* BARIS 1: Banner Himbauan */}
      <div className="w-full h-7 sm:h-8 bg-[#009688] flex items-center justify-center z-[60] shadow-md border-b border-black/20 flex-none">
        <p className="text-white text-[9px] sm:text-[14px] font-black uppercase tracking-widest px-4 text-center">
          HIMBAUAN: BAGI YANG MAU KOMENTAR DAN MAU JAWAB, SUBSCRIBE DULU!
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden relative">
        {outcome && <OutcomeOverlay type={outcome} />}
        
        {/* BARIS 2: Header (Logo, Centered Music Player, Timer, Surrender) */}
        <Header 
          phase={gameState.phase} timeLeft={gameState.timeLeft} onRevealNow={() => triggerOutcome('loser')}
          isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)}
          audioUnlocked={audioUnlocked} isMusicPlaying={isMusicPlaying} onToggleBgm={() => { handleGlobalUnlock(); setIsMusicPlaying(!isMusicPlaying); }}
          playbackMode={playbackMode} onCycleMode={() => {
            const next = (['no-repeat', 'repeat-all', 'repeat-one'] as PlaybackMode[])[(['no-repeat', 'repeat-all', 'repeat-one'].indexOf(playbackMode) + 1) % 3];
            setPlaybackMode(next); localStorage.setItem('detective_play_mode', next);
          }}
          isShuffle={isShuffle} onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onNext={() => skipTrack('next')} onPrev={() => skipTrack('prev')}
          currentTrackName={isSearchingMusic ? "SCANNING MEDIA..." : MUSIC_PLAYLIST[currentTrackIndex]}
          bgmVolume={bgmVolume} onVolumeChange={(v) => { setBgmVolume(v); localStorage.setItem('detective_bgm_vol', String(v)); }}
          lastFeedback={lastFeedback}
          isDarkMode={isDarkMode} onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className="flex-1 w-full flex flex-col items-center justify-start min-h-0 overflow-hidden px-1 sm:px-4 py-1 sm:py-2 gap-2 sm:gap-4">
          
          {/* BARIS 3: Status Feedback + Coord Scan */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 max-w-[1700px] flex-none">
             {/* Feedback Row (Mobile Row 3 Part A) */}
             <div key={lastFeedback.key} className={`flex-1 text-center sm:text-left ${lastFeedback.type === 'error' ? 'animate-error' : ''}`}>
                <h2 className={`text-xl sm:text-5xl font-black uppercase tracking-widest transition-all duration-300 ${lastFeedback.type === 'error' ? 'text-red-500' : lastFeedback.type === 'success' ? 'text-[#00cba9]' : 'text-slate-500 sm:opacity-20'}`}>
                   {lastFeedback.msg}
                </h2>
             </div>

             {/* Coord Input Row (Mobile Row 3 Part B) */}
             <div className="flex items-center gap-2 justify-center flex-none">
                <form onSubmit={(e) => { e.preventDefault(); if (commandInput) processDetection(commandInput); setCommandInput(''); }} 
                      className={`flex items-center rounded overflow-hidden border ${isDarkMode ? 'bg-[#0f172a] border-slate-700' : 'bg-white border-slate-300'} shadow-xl`}>
                  <div className="px-2 sm:px-3 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase text-slate-500 border-r border-slate-800">COORD</div>
                  <input 
                    type="text" value={commandInput} onChange={(e) => setCommandInput(e.target.value)}
                    className={`bg-transparent font-mono font-black text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 outline-none w-20 sm:w-28 uppercase ${isDarkMode ? 'text-[#00cba9]' : 'text-slate-900'}`}
                  />
                  <button type="submit" className={`bg-[#00cba9] text-[#020617] text-[8px] sm:text-[10px] font-black px-3 sm:px-4 py-1.5 sm:py-2 h-full transition-all uppercase hover:brightness-110 active:scale-95`}>SCAN</button>
                </form>
             </div>
          </div>

          {/* BARIS 4 & 5 (Solved Index & Total Status) are contained in StatusPanel */}
          <div className="w-full max-w-[1700px] flex-none">
            <StatusPanel foundIds={gameState.foundIds} total={TOTAL_ANOMALIES} phase={gameState.phase} isDarkMode={isDarkMode} />
          </div>

          {/* BARIS 6: Game Grid */}
          <div className={`flex-1 w-full max-w-[1700px] rounded border overflow-hidden flex flex-col min-h-0 ${isDarkMode ? 'bg-[#020617] border-[#1e293b]' : 'bg-white border-slate-300'}`}>
            <GameGrid grid={gameState.grid} phase={gameState.phase} onCellClick={processDetection} isDarkMode={isDarkMode} />
          </div>

          {/* BARIS 7: Footer Reset Instruksi */}
          <footer className="w-full py-1 sm:py-2 border-t border-slate-800/30 bg-black/20 flex flex-col items-center justify-center flex-none text-center">
             <p className="text-[7px] sm:text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                CARA MERESET: HAPUS CACHE DAN COOKIE WEB INI DARI BROWSER ANDA
             </p>
             <p className="text-[6px] sm:text-[8px] text-slate-700 mt-1 uppercase">
                SYSTEM VER. 2.5 // COORD PRO SECURITY PROTOCOL ACTIVE
             </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
