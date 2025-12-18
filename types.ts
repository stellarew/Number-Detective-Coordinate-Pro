
export enum GamePhase {
  SEARCH = 'SEARCH',
  REVEAL = 'REVEAL'
}

export type PlaybackMode = 'no-repeat' | 'repeat-all' | 'repeat-one';

export interface GridCell {
  id: string;
  row: number; // 1-24
  col: string; // A-I
  value: string;
  isAnomaly: boolean;
  isFound: boolean;
}

export interface GameState {
  phase: GamePhase;
  grid: GridCell[];
  foundCount: number;
  foundIds: string[]; // Melacak urutan ID yang ditemukan
  totalAnomalies: number;
  timeLeft: number;
  bgChar: string;
  anomalyChar: string;
}
