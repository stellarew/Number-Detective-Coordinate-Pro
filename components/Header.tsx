
import React from 'react';
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
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  phase, timeLeft, onRevealNow, isMuted, onToggleMute,
  audioUnlocked, isMusicPlaying, onToggleBgm, playbackMode, onCycleMode,
  isShuffle, onToggleShuffle, onNext, onPrev, currentTrackName,
  bgmVolume, onVolumeChange, isDarkMode, onToggleTheme
}) => {
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`;

  return (
    <header className={`w-full flex items-center justify-between py-1.5 sm:py-3 px-2 sm:px-6 border-b transition-colors z-50 flex-none ${isDarkMode ? 'bg-[#020617] border-slate-900 shadow-xl' : 'bg-slate-100 border-slate-300'}`}>
      
      {/* 1. Logo Section (Left) */}
      <div className="flex items-center gap-3 flex-none">
        <div className="flex flex-col cursor-pointer group" onClick={onToggleTheme}>
          <h1 className="text-[12px] sm:text-2xl font-black italic leading-none tracking-tighter text-[#00cba9] group-hover:brightness-110 transition-all">
            COORD PRO
          </h1>
          <p className="text-[6px] sm:text-[9px] font-black uppercase text-slate-500 tracking-tighter mt-1">
            SECURE ANALYTICS
          </p>
        </div>
      </div>

      {/* 2. Centered Music Player Section */}
      <div className="flex-1 flex items-center justify-center px-4 gap-2 sm:gap-4 overflow-hidden">
        <div className={`flex items-center gap-1 sm:gap-2 p-1 rounded border ${isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white border-slate-200'} shadow-lg`}>
          {/* Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="text-slate-500 hover:text-white p-0.5 sm:p-1 transition-colors">
               <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleBgm(); }} className="w-5 h-5 sm:w-8 sm:h-8 rounded bg-[#00cba9] text-[#020617] flex items-center justify-center hover:brightness-110 active:scale-95 transition-all">
              {isMusicPlaying ? <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-slate-500 hover:text-white p-0.5 sm:p-1 transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6zM16 6h2v12h-2z"/></svg>
            </button>
          </div>

          <div className="w-[1px] h-3 sm:h-5 bg-slate-800 mx-1" />

          {/* Volume Slider (Boxy design) */}
          <div className="hidden sm:flex items-center gap-2 group relative">
             <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className={`transition-colors ${isMuted ? 'text-red-500' : 'text-slate-500 hover:text-white'}`}>
                {isMuted || bgmVolume === 0 ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg> : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>}
             </button>
             <input 
               type="range" min="0" max="100" value={bgmVolume} 
               onChange={(e) => onVolumeChange(Number(e.target.value))}
               onClick={(e) => e.stopPropagation()}
               className="w-16 h-1 bg-slate-800 rounded-none appearance-none cursor-pointer accent-[#00cba9] hover:bg-slate-700 transition-all"
             />
          </div>

          <div className="w-[1px] h-3 sm:h-5 bg-slate-800 mx-1 hidden sm:block" />

          {/* Track Title (Right of controls) */}
          <div className="flex flex-col min-w-0 max-w-[80px] sm:max-w-[200px]">
            <span className="text-[6px] sm:text-[8px] font-black text-slate-600 uppercase tracking-tighter">NOW PLAYING</span>
            <span className="text-[8px] sm:text-[11px] font-black uppercase text-[#00cba9] truncate tracking-tight">
              {audioUnlocked ? currentTrackName.replace('.mp3', '') : "SYSTEM LOCKED"}
            </span>
          </div>

          <div className="w-[1px] h-3 sm:h-5 bg-slate-800 mx-1" />

          {/* Extra Audio Settings */}
          <div className="flex items-center">
            <button onClick={(e) => { e.stopPropagation(); onToggleShuffle(); }} className={`p-1 sm:p-1.5 transition-colors ${isShuffle ? 'text-[#00cba9]' : 'text-slate-600'}`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); onCycleMode(); }} className={`p-1 sm:p-1.5 flex items-center gap-0.5 transition-colors ${playbackMode !== 'no-repeat' ? 'text-[#00cba9]' : 'text-slate-600'}`}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
              <span className="text-[6px] sm:text-[8px] font-black">{playbackMode === 'repeat-one' ? '1' : playbackMode === 'repeat-all' ? 'A' : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Timer & Action (Right) */}
      <div className="flex items-center gap-2 sm:gap-6 flex-none">
        <div className="flex flex-col items-end">
           {phase === GamePhase.SEARCH && (
            <button onClick={(e) => { e.stopPropagation(); onRevealNow(); }} className="px-1.5 sm:px-4 py-0.5 sm:py-1 rounded border border-red-900/40 text-red-900 font-black text-[7px] sm:text-[10px] hover:bg-red-950 transition-all uppercase tracking-tighter">
              MENYERAH
            </button>
          )}
          <span className={`text-sm sm:text-4xl font-black tabular-nums font-mono leading-none mt-1 drop-shadow-lg ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
