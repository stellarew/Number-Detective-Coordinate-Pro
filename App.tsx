
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, GameState, GridCell, PlaybackMode } from './types';
import { COLS, ROWS, TOTAL_ANOMALIES, SEARCH_DURATION, REVEAL_DURATION, CHAR_PAIRS, MUSIC_PLAYLIST, SFX_FILES } from './constants';
import Header from './components/Header';
import GameGrid from './components/GameGrid';
import StatusPanel from './components/StatusPanel';
import OutcomeOverlay from './components/OutcomeOverlay';

const App: React.FC = () => {
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
  const [lastFeedback, setLastFeedback] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });
  
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('detective_muted') === 'true');
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => Number(localStorage.getItem('detective_track_idx')) || 0);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() => (localStorage.getItem('detective_play_mode') as PlaybackMode) || 'repeat-all');
  const [isShuffle, setIsShuffle] = useState(() => localStorage.getItem('detective_shuffle') === 'true');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(() => Number(localStorage.getItem('detective_bgm_vol')) || 50);

  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const outcomeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxCorrectRef = useRef<HTMLAudioElement | null>(null);
  const sfxWrongRef = useRef<HTMLAudioElement | null>(null);
  const sfxVictoryRef = useRef<HTMLAudioElement | null>(null);
  const sfxLoserRef = useRef<HTMLAudioElement | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

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
    sfxVictoryRef.current = createAudio(`/media/sfx/${SFX_FILES.VICTORY}`, false, 0.6);
    sfxLoserRef.current = createAudio(`/media/sfx/${SFX_FILES.LOSER}`, false, 0.6);

    return () => { 
      bgmRef.current?.pause();
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const initWebAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, []);

  const playTrack = useCallback((index: number) => {
    initWebAudio();
    if (bgmRef.current) {
      bgmRef.current.pause();
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
      }
    }
    
    const trackName = MUSIC_PLAYLIST[index];
    const audio = new Audio(`/media/music/${trackName}`);
    audio.crossOrigin = "anonymous";
    audio.muted = isMuted;
    audio.onended = () => handleTrackEnded();
    
    if (audioCtxRef.current && gainNodeRef.current) {
      sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audio);
      sourceNodeRef.current.connect(gainNodeRef.current);
    }

    bgmRef.current = audio;
    setCurrentTrackIndex(index);
    localStorage.setItem('detective_track_idx', String(index));
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : bgmVolume / 100;
    }

    if (audioUnlocked && isMusicPlaying) audio.play().catch(() => {});
  }, [audioUnlocked, isMusicPlaying, isMuted, bgmVolume, initWebAudio]);

  const handleTrackEnded = useCallback(() => {
    if (playbackMode === 'repeat-one') { bgmRef.current?.play(); return; }
    let nextIndex = isShuffle ? Math.floor(Math.random() * MUSIC_PLAYLIST.length) : (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
    if (playbackMode === 'no-repeat' && nextIndex === 0) { setIsMusicPlaying(false); return; }
    playTrack(nextIndex);
  }, [playbackMode, isShuffle, currentTrackIndex, playTrack]);

  const skipTrack = useCallback((direction: 'next' | 'prev') => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * MUSIC_PLAYLIST.length);
    } else {
      if (direction === 'next') {
        nextIndex = (currentTrackIndex + 1) % MUSIC_PLAYLIST.length;
      } else {
        nextIndex = (currentTrackIndex - 1 + MUSIC_PLAYLIST.length) % MUSIC_PLAYLIST.length;
      }
    }
    playTrack(nextIndex);
  }, [currentTrackIndex, isShuffle, playTrack]);

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
    // Fix: Added missing totalAnomalies property to satisfy GameState interface
    setGameState({ 
      phase: GamePhase.SEARCH, 
      grid: newGrid, 
      foundCount: 0, 
      foundIds: [], 
      totalAnomalies: TOTAL_ANOMALIES,
      timeLeft: SEARCH_DURATION, 
      bgChar: pair.bg, 
      anomalyChar: pair.anomaly 
    });
    setOutcome(null);
    setLastFeedback({ msg: 'READY TO SCAN', type: null });
  }, []);

  const triggerOutcome = useCallback((type: 'victory' | 'loser') => {
    setOutcome(type);
    playSFX(type);
    
    // Matikan timer utama saat popup muncul
    if (timerRef.current) clearInterval(timerRef.current);

    if (outcomeTimerRef.current) clearTimeout(outcomeTimerRef.current);
    outcomeTimerRef.current = setTimeout(() => {
      setOutcome(null);
      // Pindah ke fase REVEAL setelah popup 5 detik selesai
      setGameState(prev => ({ ...prev, phase: GamePhase.REVEAL, timeLeft: REVEAL_DURATION }));
    }, 5000);
  }, [playSFX]);

  const startSurrender = useCallback(() => { 
    if (gameState.phase === GamePhase.SEARCH) {
      triggerOutcome('loser');
    }
  }, [gameState.phase, triggerOutcome]);

  // Main Timer Effect
  useEffect(() => {
    // Generate grid jika kosong
    if (gameState.grid.length === 0) generateLevel();

    // Jalankan timer hanya jika tidak ada outcome popup
    if (!outcome) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            //SEARCH habis -> LOSER popup -> REVEAL
            if (prev.phase === GamePhase.SEARCH) {
              triggerOutcome('loser');
              return { ...prev, timeLeft: 0 };
            }
            //REVEAL habis -> Reset ke SEARCH level baru
            if (prev.phase === GamePhase.REVEAL) {
              generateLevel();
              return prev; // generateLevel akan set state baru
            }
            return { ...prev, timeLeft: 0 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [outcome, generateLevel, triggerOutcome, gameState.grid.length]);

  const processDetection = (id: string) => {
    if (gameState.phase !== GamePhase.SEARCH || outcome) return;
    const targetId = id.toUpperCase();
    setGameState(prev => {
      const cell = prev.grid.find(c => c.id === targetId);
      if (!cell || cell.isFound) { playSFX('wrong'); showFeedback(cell ? "DUPLICATE" : "ERROR COORD", "error"); return prev; }
      if (cell.isAnomaly) { 
        playSFX('correct'); 
        showFeedback("ANOMALY FOUND!", "success"); 
        const newFoundCount = prev.foundCount + 1;
        
        const updatedGrid = prev.grid.map(c => c.id === targetId ? { ...c, isFound: true } : c);
        const updatedIds = [...prev.foundIds, targetId];

        if (newFoundCount === TOTAL_ANOMALIES) {
          // Gunakan timeout sedikit agar state update terakhir terlihat sebelum triggerOutcome (yang menghentikan timer)
          setTimeout(() => triggerOutcome('victory'), 100);
        }

        return { 
          ...prev, 
          grid: updatedGrid, 
          foundCount: newFoundCount,
          foundIds: updatedIds
        }; 
      }
      else { playSFX('wrong'); showFeedback("SCAN CLEAR", "error"); return prev; }
    });
  };

  const showFeedback = (msg: string, type: 'success' | 'error') => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setLastFeedback({ msg, type });
    feedbackTimeoutRef.current = setTimeout(() => setLastFeedback(f => ({ ...f, type: null })), 2500);
  };

  const handleInteraction = () => {
    if(!audioUnlocked) {
      setAudioUnlocked(true);
      setIsMusicPlaying(true);
      initWebAudio();
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-slate-950 text-slate-50 select-none overflow-hidden" onClick={handleInteraction}>
      <div className="w-full flex-none bg-gradient-to-r from-emerald-600 to-cyan-700 py-1.5 px-4 flex items-center justify-center border-b border-emerald-400/20 shadow-lg z-50 animate-gradient-x">
        <p className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-widest drop-shadow-md text-center">
          Himbauan: Bagi yang mau komentar dan mau jawab, SUBSCRIBE dulu!
        </p>
      </div>

      <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden relative">
        {outcome && <OutcomeOverlay type={outcome} />}
        
        <Header 
          phase={gameState.phase} 
          timeLeft={gameState.timeLeft}
          onRevealNow={startSurrender}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          audioUnlocked={audioUnlocked}
          isMusicPlaying={isMusicPlaying}
          onToggleBgm={() => setIsMusicPlaying(!isMusicPlaying)}
          playbackMode={playbackMode}
          onCycleMode={() => {
            const modes: PlaybackMode[] = ['no-repeat', 'repeat-all', 'repeat-one'];
            setPlaybackMode(modes[(modes.indexOf(playbackMode) + 1) % modes.length]);
          }}
          isShuffle={isShuffle}
          onToggleShuffle={() => setIsShuffle(!isShuffle)}
          onNext={() => skipTrack('next')}
          onPrev={() => skipTrack('prev')}
          currentTrackName={MUSIC_PLAYLIST[currentTrackIndex]}
          bgmVolume={bgmVolume}
          onVolumeChange={setBgmVolume}
          lastFeedback={lastFeedback}
        />
        
        <main className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col items-center justify-start min-h-0 overflow-hidden p-1 sm:p-2">
          <div className="w-full flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
            <form onSubmit={(e) => { e.preventDefault(); if (commandInput) processDetection(commandInput); setCommandInput(''); }} className="flex-none flex items-center bg-slate-900 border border-slate-700 rounded overflow-hidden shadow-2xl">
              <input 
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="COORD"
                className="bg-transparent text-emerald-400 font-mono font-bold text-xs px-3 py-2 outline-none w-28 sm:w-36 uppercase placeholder:text-slate-800"
              />
              <button type="submit" className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-500 text-[10px] font-black px-5 h-full border-l border-slate-700 transition-all uppercase">Scan</button>
            </form>

            <div className="flex-1 flex justify-center">
              <StatusPanel foundIds={gameState.foundIds} total={TOTAL_ANOMALIES} phase={gameState.phase} />
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-900/40 rounded-lg border border-slate-900/50 p-0.5 overflow-hidden flex flex-col min-h-0 shadow-inner">
            <GameGrid grid={gameState.grid} phase={gameState.phase} onCellClick={processDetection} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
