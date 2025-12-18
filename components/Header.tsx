
import React, { useState } from 'react';
import { GamePhase, PlaybackMode } from '../types';

interface HeaderProps {
  phase: GamePhase;
  timeLeft: number;
  onRevealNow: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  audioUnlocked: boolean;
  isMusicPlaying: boolean;
  onToggleBgm: () => void;
  playbackMode: PlaybackMode;
  onCycleMode: () => void;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTrackName: string;
  bgmVolume: number;
  onVolumeChange: (val: number) => void;
  lastFeedback: { msg: string; type: 'success' | 'error' | null };
}

const Header: React.FC<HeaderProps> = ({ 
  phase, 
  timeLeft, 
  onRevealNow, 
  isMuted, 
  onToggleMute,
  audioUnlocked,
  isMusicPlaying,
  onToggleBgm,
  playbackMode,
  onCycleMode,
  isShuffle,
  onToggleShuffle,
  onNext,
  onPrev,
  currentTrackName,
  bgmVolume,
  onVolumeChange,
  lastFeedback
}) => {
  const [showVolume, setShowVolume] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    if (playbackMode === 'repeat-one') return '1';
    if (playbackMode === 'repeat-all') return '∞';
    return 'OFF';
  };

  const isBoosted = bgmVolume > 100;

  return (
    <header className="w-full flex items-center justify-between py-1 px-2 sm:px-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md shrink-0 z-40 overflow-hidden">
      {/* Left: Branding & Music Info */}
      <div className="flex items-center gap-2 sm:gap-3 flex-none min-w-0">
        <div className="flex flex-col shrink-0">
          <h1 className="text-[10px] sm:text-lg font-black tracking-tighter text-emerald-500 italic leading-none">
            COORD PRO
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <div className={`w-1 h-1 rounded-full ${isMusicPlaying ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'}`} />
            <p className="text-[6px] sm:text-[8px] font-bold text-slate-500 truncate uppercase tracking-tighter max-w-[40px] sm:max-w-[120px]">
              {audioUnlocked ? currentTrackName : "LOCKED"}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-900/60 p-0.5 sm:p-1 rounded-md border border-slate-800 shadow-sm shrink-0 scale-[0.85] sm:scale-100 origin-left">
          <button onClick={onPrev} className="text-slate-500 hover:text-white p-0.5 transition-colors">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
          </button>
          
          <button 
            onClick={onToggleBgm}
            className={`w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center transition-all ${isMusicPlaying ? 'text-cyan-400 bg-cyan-400/5' : 'text-slate-600'}`}
          >
            {isMusicPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>

          <button onClick={onNext} className="text-slate-500 hover:text-white p-0.5 transition-colors">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zM16 6h2v12h-2z"/></svg>
          </button>

          <div className="w-px h-3 bg-slate-800 mx-0.5" />

          {/* Shuffle Button */}
          <button 
            onClick={onToggleShuffle} 
            className={`p-1 rounded transition-colors ${isShuffle ? 'text-emerald-400 bg-emerald-400/5' : 'text-slate-600'}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          </button>

          {/* Repeat Mode */}
          <button 
            onClick={onCycleMode} 
            className={`text-[7px] sm:text-[9px] font-black px-1 flex items-center gap-0.5 transition-colors ${playbackMode !== 'no-repeat' ? 'text-cyan-400' : 'text-slate-600'}`}
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            <span className="bg-slate-800 px-0.5 rounded text-[6px]">{getRepeatIcon()}</span>
          </button>

          {/* VOLUME SLIDER SECTION */}
          <div 
            className="relative flex items-center group ml-1"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button onClick={onToggleMute} className={`p-1 transition-colors ${isMuted ? 'text-red-500' : (isBoosted ? 'text-amber-500' : 'text-slate-500')}`}>
              {isMuted ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              ) : bgmVolume === 0 ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 9v6h4l5 5V4L7 9H3z"/></svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
              )}
            </button>

            {/* Slider Popup */}
            <div className={`
              absolute left-full ml-2 flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded shadow-xl transition-all duration-200
              ${showVolume ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-2 scale-90 pointer-events-none'}
            `}>
              <span className={`text-[8px] font-black min-w-[20px] ${isBoosted ? 'text-amber-400' : 'text-emerald-400'}`}>
                {bgmVolume}%
              </span>
              <input 
                type="range"
                min="0"
                max="200"
                value={bgmVolume}
                onChange={(e) => onVolumeChange(parseInt(e.target.value))}
                className={`
                  w-20 h-1 rounded-lg appearance-none cursor-pointer accent-current
                  ${isBoosted ? 'text-amber-500 bg-amber-900/30' : 'text-emerald-500 bg-emerald-900/30'}
                `}
                style={{
                  background: `linear-gradient(to right, currentColor ${bgmVolume/2}%, #1e293b ${bgmVolume/2}%)`
                }}
              />
              {isBoosted && (
                <span className="text-[7px] font-black text-amber-500 animate-pulse">BOOST</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Feedback Box */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4">
        <div className={`
          flex items-center gap-2 px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-lg border-2 transition-all duration-300 w-full max-w-[450px]
          ${lastFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105' : 
            lastFeedback.type === 'error' ? 'bg-red-500/10 border-red-500' : 'bg-transparent border-transparent'}
        `}>
          <span className={`
            text-[9px] sm:text-2xl md:text-3xl font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate text-center w-full
            ${lastFeedback.type === 'success' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]' : 
              lastFeedback.type === 'error' ? 'text-red-400' : 'text-slate-800/40'}
          `}>
            {lastFeedback.msg || "SCANNING..."}
          </span>
        </div>
      </div>

      {/* Right: SURRENDER & Timer */}
      <div className="flex items-center gap-2 sm:gap-4 flex-none justify-end min-w-0 shrink-0">
        {phase === GamePhase.SEARCH && (
          <button 
            onClick={onRevealNow} 
            className="bg-red-950/30 border border-red-500/30 hover:border-red-500 hover:bg-red-500/20 px-1.5 sm:px-3 py-1 rounded transition-all group shrink-0"
          >
            <span className="text-[7px] sm:text-[10px] font-black uppercase text-red-500/70 group-hover:text-red-400 tracking-tighter sm:tracking-normal">
              MENYERAH
            </span>
          </button>
        )}
        
        <div className={`flex flex-col items-end ${timeLeft < 10 && phase === GamePhase.SEARCH ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
          <span className="text-[12px] sm:text-2xl font-black tabular-nums font-mono">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
