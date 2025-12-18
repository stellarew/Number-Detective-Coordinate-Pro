
import React from 'react';
import { GamePhase } from '../types';

interface StatusPanelProps {
  foundIds: string[];
  total: number;
  phase: GamePhase;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ foundIds, total, phase }) => {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 w-full max-w-4xl">
      {/* Container Kotak Progres - Rata Tengah & Adaptive */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5 w-full">
        {Array.from({ length: total }).map((_, i) => {
          const coord = foundIds[i];
          const isActive = !!coord;

          return (
            <div
              key={i}
              className={`
                flex items-center justify-center transition-all duration-300 transform
                w-6 h-4 sm:w-10 sm:h-7 md:w-12 md:h-8 
                rounded-[2px] border font-mono font-black text-[7px] sm:text-[10px] md:text-xs
                ${isActive 
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] scale-105' 
                  : 'bg-slate-900/40 border-slate-800 text-slate-800'}
              `}
            >
              {coord || "---"}
            </div>
          );
        })}
      </div>
      
      {/* Label Progres */}
      <div className="flex items-center bg-slate-900/80 px-3 py-0.5 rounded-full border border-slate-800 shadow-sm">
        <span className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest tabular-nums">
          DETECTION STATUS: {foundIds.length} / {total}
        </span>
      </div>
    </div>
  );
};

export default StatusPanel;
