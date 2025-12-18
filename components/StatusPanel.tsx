
import React from 'react';
import { GamePhase } from '../types';

interface StatusPanelProps {
  foundCount: number;
  total: number;
  phase: GamePhase;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ foundCount, total, phase }) => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 max-w-full px-2 py-0.5 sm:py-1">
      <div className="flex gap-0.5 sm:gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-[1px] border-[1px] flex items-center justify-center transition-all duration-300 transform ${
              i < foundCount 
                ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            {i < foundCount && (
              <svg className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
        <span className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-emerald-500 uppercase tracking-tighter tabular-nums">
          PROGRESS: {foundCount} / {total}
        </span>
      </div>
    </div>
  );
};

export default StatusPanel;
