
import React, { useState, useEffect } from 'react';
import { GamePhase } from '../types';

interface HeaderProps {
  phase: GamePhase;
  timeLeft: number;
  onRevealNow: () => void;
}

const Header: React.FC<HeaderProps> = ({ phase, timeLeft, onRevealNow }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatClock = (date: Date) => {
    // Force Asia/Jakarta timezone for WIB (GMT+7)
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    });
  };

  const isWarning = timeLeft < 10 && phase === GamePhase.SEARCH;

  return (
    <header className="w-full flex items-center justify-between py-1 sm:py-2 px-2 sm:px-4 border-b border-slate-900 bg-slate-950/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-sm sm:text-lg md:text-2xl font-black tracking-tighter text-emerald-500 italic leading-none">
            COORD DETECTIVE
          </h1>
          <p className="text-[6px] sm:text-[9px] font-bold text-slate-600 tracking-widest uppercase">
            BLITZ EDITION
          </p>
        </div>

        {/* Local WIB Clock - Visible on Desktop/Tablet */}
        <div className="hidden md:flex flex-col border-l border-slate-800 pl-4 py-1">
          <span className="text-[7px] font-black text-slate-500 tracking-[0.2em] uppercase leading-none mb-1">Local Time (WIB)</span>
          <span className="text-sm lg:text-base font-black text-cyan-400 font-mono tabular-nums tracking-wider drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
            {formatClock(currentTime)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-8">
        {phase === GamePhase.SEARCH && (
          <button 
            onClick={onRevealNow}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all duration-200 group"
          >
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-emerald-400 whitespace-nowrap">Reveal Now</span>
          </button>
        )}

        <div className={`flex flex-col items-end transition-colors duration-300 ${isWarning ? 'text-red-500' : 'text-slate-400'}`}>
          <span className="text-[6px] sm:text-[9px] font-black uppercase tracking-widest leading-none">
            {phase === GamePhase.SEARCH ? 'SCANNING' : 'REVEALING'}
          </span>
          <span className={`text-lg sm:text-2xl md:text-4xl font-black tabular-nums ${isWarning ? 'animate-pulse' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
