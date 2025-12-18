
import React from 'react';
import { GridCell, GamePhase } from '../types';
import { COLS, ROWS } from '../constants';

interface GameGridProps {
  grid: GridCell[];
  phase: GamePhase;
  onCellClick: (id: string) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ grid, phase, onCellClick }) => {
  return (
    <div 
      className="grid w-full h-full"
      style={{
        gridTemplateColumns: 'clamp(20px, 4vw, 45px) repeat(9, 1fr)',
        gridTemplateRows: 'auto repeat(24, minmax(0, 1fr))',
        gap: '1px'
      }}
    >
      {/* Empty corner */}
      <div className="flex items-center justify-center bg-slate-950/20" />

      {/* Top Labels A-I */}
      {COLS.map(col => (
        <div 
          key={col} 
          className="flex items-center justify-center font-black text-slate-500 text-[7px] sm:text-[9px] md:text-[11px] uppercase border-b border-slate-800/40 h-3 sm:h-5 bg-slate-900/30"
        >
          {col}
        </div>
      ))}

      {/* Grid Rows (1-24) */}
      {ROWS.map(rowNum => (
        <React.Fragment key={rowNum}>
          {/* Side Label 1-24 */}
          <div className="flex items-center justify-center font-black text-slate-500 text-[7px] sm:text-[9px] md:text-[11px] bg-slate-950/20 border-r border-slate-800/40">
            {rowNum}
          </div>

          {/* Data Cells */}
          {COLS.map(colLabel => {
            const cell = grid.find(c => c.row === rowNum && c.col === colLabel);
            if (!cell) return null;

            const isRevealed = phase === GamePhase.REVEAL;
            
            let cellStyle = "bg-slate-800/10 border-slate-800/30 text-slate-600";
            if (cell.isFound) {
              cellStyle = "bg-emerald-950/40 border-emerald-500/50 text-emerald-400";
            } else if (isRevealed && cell.isAnomaly) {
              cellStyle = "bg-amber-950/40 border-amber-500/60 text-amber-400 animate-pulse-amber";
            }

            return (
              <button
                key={cell.id}
                onClick={() => onCellClick(cell.id)}
                disabled={isRevealed || cell.isFound}
                title={`${colLabel}${rowNum}`}
                className={`
                  relative flex items-center justify-center 
                  text-[0.6rem] sm:text-[0.8rem] md:text-[0.9rem] lg:text-[1.1rem] font-black rounded-[1px] border-[1px]
                  transition-all duration-150 transform tracking-tight
                  h-full min-h-0 w-full
                  ${cellStyle}
                  ${!cell.isFound && !isRevealed ? 'hover:bg-slate-700/30 hover:border-emerald-500/30 hover:scale-[1.01] active:scale-95 z-10' : ''}
                `}
              >
                {/* Micro Coordinate Label (Excel Corner Style) */}
                <span className={`absolute top-0.5 left-0.5 text-[4px] sm:text-[6px] font-bold opacity-30 select-none pointer-events-none tracking-tighter ${cell.isFound ? 'text-emerald-400 opacity-60' : 'text-slate-500'}`}>
                  {cell.id}
                </span>

                <span className="truncate w-full text-center px-0.5 font-mono">{cell.value}</span>
                
                {/* 5c indicator */}
                {cell.isFound && (
                   <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-emerald-500 text-white text-[4px] sm:text-[7px] px-0.5 sm:px-1 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)] font-black z-20 animate-bounce">
                     DET
                   </span>
                )}

                {/* Status Ring */}
                {cell.isFound && (
                   <div className="absolute inset-0 ring-1 ring-emerald-500/30 rounded-[1px] pointer-events-none"></div>
                )}
                
                {isRevealed && cell.isAnomaly && !cell.isFound && (
                   <span className="absolute inset-0 flex items-center justify-center bg-amber-500/10 text-amber-500/80 text-[6px] sm:text-[9px] font-black uppercase pointer-events-none">
                     !
                   </span>
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
