
import React from 'react';
import { GridCell, GamePhase } from '../types';
import { COLS, ROWS } from '../constants';

interface GameGridProps {
  grid: GridCell[];
  phase: GamePhase;
  onCellClick: (id: string) => void;
  isDarkMode: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ grid, phase, onCellClick, isDarkMode }) => {
  return (
    <div 
      className="grid w-full h-full select-none"
      style={{
        gridTemplateColumns: 'clamp(18px, 3vw, 40px) repeat(9, 1fr)',
        gridTemplateRows: 'auto repeat(24, minmax(0, 1fr))',
        gap: '1px'
      }}
    >
      <div className="bg-transparent" />
      {COLS.map(col => (
        <div key={col} className={`flex items-center justify-center font-black text-[9px] sm:text-[14px] uppercase py-1 sm:py-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
          {col}
        </div>
      ))}

      {ROWS.map(rowNum => (
        <React.Fragment key={rowNum}>
          <div className={`flex items-center justify-center font-black text-[7px] sm:text-[12px] border-r ${isDarkMode ? 'text-slate-600 border-slate-800' : 'text-slate-400 border-slate-200'}`}>
            {rowNum}
          </div>

          {COLS.map(colLabel => {
            const cell = grid.find(c => c.row === rowNum && c.col === colLabel);
            if (!cell) return null;

            const isRevealed = phase === GamePhase.REVEAL;
            
            let cellStyle = isDarkMode ? "bg-slate-900/10 border-slate-900/20 text-slate-700" : "bg-white border-slate-100 text-slate-300";
            
            if (cell.isFound) {
              cellStyle = "bg-[#00cba9]/5 border-[#00cba9] text-[#00cba9] shadow-[inset_0_0_10px_rgba(0,203,169,0.05)] z-10";
            } else if (isRevealed && cell.isAnomaly) {
              cellStyle = "bg-red-600/20 border-red-500 text-red-500 animate-pulse z-10";
            }

            return (
              <button
                key={cell.id}
                onClick={(e) => { e.stopPropagation(); onCellClick(cell.id); }}
                disabled={isRevealed || cell.isFound}
                className={`
                  relative flex items-center justify-center 
                  text-[0.6rem] sm:text-[1.3rem] font-bold border transition-all duration-200
                  h-full w-full overflow-hidden group
                  ${cellStyle}
                  ${!cell.isFound && !isRevealed ? (isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50') : ''}
                `}
              >
                {/* Micro ID Tag */}
                <span className={`absolute top-0.5 left-0.5 text-[4px] sm:text-[7px] font-bold opacity-10 tracking-tighter ${cell.isFound ? 'text-[#00cba9]' : 'text-slate-500'}`}>
                  {cell.id}
                </span>

                {/* Main Value */}
                <span className="font-mono tracking-tighter sm:tracking-widest">{cell.value}</span>

                {/* DET Badge */}
                {cell.isFound && (
                  <div className="absolute top-0 right-0 px-0.5 bg-[#00cba9] text-[#020617] text-[4px] sm:text-[6px] font-black rounded-bl">
                    DET
                  </div>
                )}
                
                {/* Horizontal Scanline */}
                {cell.isFound && (
                  <div className="absolute inset-x-0 h-[0.5px] sm:h-[1px] bg-[#00cba9]/30 top-1/2 -translate-y-1/2 pointer-events-none" />
                )}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default GameGrid;
