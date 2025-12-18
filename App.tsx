
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, GameState, GridCell } from './types';
import { COLS, ROWS, TOTAL_ANOMALIES, SEARCH_DURATION, REVEAL_DURATION, CHAR_PAIRS } from './constants';
import Header from './components/Header';
import GameGrid from './components/GameGrid';
import StatusPanel from './components/StatusPanel';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.SEARCH,
    grid: [],
    foundCount: 0,
    totalAnomalies: TOTAL_ANOMALIES,
    timeLeft: SEARCH_DURATION,
    bgChar: '8',
    anomalyChar: 'B',
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateLevel = useCallback(() => {
    const pair = CHAR_PAIRS[Math.floor(Math.random() * CHAR_PAIRS.length)];
    const newGrid: GridCell[] = [];
    
    // Fill 9x24 background
    for (const row of ROWS) {
      for (const col of COLS) {
        newGrid.push({
          id: `${col}${row}`,
          row,
          col,
          value: pair.bg.repeat(5),
          isAnomaly: false,
          isFound: false,
        });
      }
    }

    // Place 15 anomalies
    let placed = 0;
    while (placed < TOTAL_ANOMALIES) {
      const randomIndex = Math.floor(Math.random() * newGrid.length);
      if (!newGrid[randomIndex].isAnomaly) {
        const chars = pair.bg.repeat(5).split('');
        const anomalyIndex = Math.floor(Math.random() * 5);
        chars[anomalyIndex] = pair.anomaly;
        
        newGrid[randomIndex].isAnomaly = true;
        newGrid[randomIndex].value = chars.join('');
        placed++;
      }
    }

    setGameState(prev => ({
      ...prev,
      phase: GamePhase.SEARCH,
      grid: newGrid,
      foundCount: 0,
      timeLeft: SEARCH_DURATION,
      bgChar: pair.bg,
      anomalyChar: pair.anomaly,
    }));
  }, []);

  const startReveal = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.REVEAL,
      timeLeft: REVEAL_DURATION
    }));
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          if (prev.phase === GamePhase.SEARCH) {
            return { ...prev, phase: GamePhase.REVEAL, timeLeft: REVEAL_DURATION };
          } else {
            return { ...prev, timeLeft: 0 }; 
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState.phase === GamePhase.REVEAL && gameState.timeLeft === 0) {
      generateLevel();
    }
    if (gameState.phase === GamePhase.SEARCH && gameState.foundCount === TOTAL_ANOMALIES) {
      startReveal();
    }
  }, [gameState.phase, gameState.timeLeft, gameState.foundCount, generateLevel, startReveal]);

  const handleCellClick = (id: string) => {
    if (gameState.phase !== GamePhase.SEARCH) return;

    setGameState(prev => {
      const cell = prev.grid.find(c => c.id === id);
      if (cell && cell.isAnomaly && !cell.isFound) {
        const newGrid = prev.grid.map(c => 
          c.id === id ? { ...c, isFound: true } : c
        );
        return {
          ...prev,
          grid: newGrid,
          foundCount: prev.foundCount + 1,
        };
      }
      return prev;
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center bg-slate-950 text-slate-50 select-none overflow-hidden">
      {/* Striking Top Banner - Fixed Height */}
      <div className="w-full flex-none bg-gradient-to-r from-emerald-600 to-cyan-700 py-1 sm:py-2 px-4 flex items-center justify-center gap-3 animate-gradient-x border-b border-emerald-400/20 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <span className="bg-white text-emerald-700 text-[8px] sm:text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm">Hot</span>
          <p className="text-[9px] sm:text-xs md:text-sm font-black text-white uppercase tracking-widest drop-shadow-md">
            SUBSCRIBE TO COMMENT & JOIN THE INVESTIGATION
          </p>
        </div>
        <button className="hidden md:block bg-slate-950 text-white text-[10px] font-black px-4 py-1 rounded-full hover:bg-white hover:text-emerald-700 transition-all border border-emerald-400/30">
          SUBSCRIBE
        </button>
      </div>

      {/* Main App Container - Takes Remaining Height */}
      <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
        <Header 
          phase={gameState.phase} 
          timeLeft={gameState.timeLeft}
          onRevealNow={startReveal}
        />
        
        <main className="flex-1 w-full max-w-[1800px] mx-auto flex flex-col items-center justify-start min-h-0 overflow-hidden p-1 sm:p-2">
          <div className="w-full flex-none">
            <StatusPanel 
              foundCount={gameState.foundCount} 
              total={TOTAL_ANOMALIES} 
              phase={gameState.phase}
            />
          </div>

          <div className="flex-1 w-full bg-slate-900/40 rounded-lg border border-slate-900/50 shadow-2xl mt-1 sm:mt-2 p-0.5 sm:p-1 overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 w-full min-h-0 relative">
              <GameGrid 
                grid={gameState.grid} 
                phase={gameState.phase}
                onCellClick={handleCellClick}
              />
            </div>
          </div>

          <footer className="w-full flex-none flex items-center justify-center py-1">
            <div className="text-slate-600 text-[6px] sm:text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase text-center px-4">
              {gameState.phase === GamePhase.SEARCH 
                ? `ACTIVE SCANNING | 9x24 GRID PROTOCOL | ${gameState.totalAnomalies} ANOMALIES` 
                : `RECALIBRATING SENSORS... NEXT ROUND IN ${gameState.timeLeft}S`}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
