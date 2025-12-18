
export enum GamePhase {
  SEARCH = 'SEARCH',
  REVEAL = 'REVEAL'
}

export interface GridCell {
  id: string;
  row: number; // 1-9
  col: string; // A-F
  value: string;
  isAnomaly: boolean;
  isFound: boolean;
}

export interface GameState {
  phase: GamePhase;
  grid: GridCell[];
  foundCount: number;
  totalAnomalies: number;
  timeLeft: number;
  bgChar: string;
  anomalyChar: string;
}
