
import React from 'react';
import { GamePhase } from '../types';

interface StatusPanelProps {
  foundIds: string[];
  total: number;
  phase: GamePhase;
  isDarkMode: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ foundIds, total, phase, isDarkMode }) => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* BARIS 4: Index Benar (Solved Coordinates) */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 w-full">
        {Array.from({ length: total }).map((_, i) => {
          const coord = foundIds[i];
          const isActive = !!coord;

          return (
            <div
              key={i}
              className={`
                flex items-center justify-center transition-all duration-500
                w-6 h-5 sm:w-14 sm:h-11
                rounded border sm:border-2 font-black text-[6px] sm:text-[13px]
                ${isActive 
                  ? 'bg-[#00cba9] border-[#00ffcc] text-[#020617] shadow-[0_0_15px_rgba(0,203,169,0.4)] scale-110 z-10' 
                  : (isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-800' : 'bg-slate-200 border-slate-300 text-slate-400')}
              `}
            >
              {coord || "---"}
            </div>
          );
        })}
      </div>
      
      {/* BARIS 5: Total Deteksi */}
      <div className={`px-4 py-1 rounded border ${isDarkMode ? 'bg-black/40 border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
        <span className="text-[8px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-[#00cba9]">
          DETECTION STATUS: <span className="text-white ml-2">{foundIds.length} / {total}</span>
        </span>
      </div>
    </div>
  );
};

export default StatusPanel;
