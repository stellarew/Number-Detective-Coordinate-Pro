
export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
export const ROWS = Array.from({ length: 24 }, (_, i) => i + 1);
export const TOTAL_ANOMALIES = 15;
export const SEARCH_DURATION = 600; 
export const REVEAL_DURATION = 30; 

export const MUSIC_PLAYLIST = [
  'bgm1.mp3',
  'bgm2.mp3',
  'bgm3.mp3'
];

export const SFX_FILES = {
  CORRECT: 'correct.mp3',
  WRONG: 'wrong.mp3',
  CLICK: 'click.mp3',
  VICTORY: 'victory.mp3',
  LOSER: 'loser.mp3'
};

export const CHAR_PAIRS = [
  { bg: '8', anomaly: 'B', type: 'numeric' },
  { bg: '0', anomaly: 'Q', type: 'numeric' },
  { bg: '5', anomaly: 'S', type: 'numeric' },
  { bg: '2', anomaly: 'Z', type: 'numeric' },
  { bg: '6', anomaly: 'G', type: 'numeric' },
  { bg: '9', anomaly: 'P', type: 'numeric' },
  { bg: '1', anomaly: 'I', type: 'numeric' },
  { bg: 'W', anomaly: 'V', type: 'text' },
  { bg: 'E', anomaly: 'F', type: 'text' },
  { bg: 'M', anomaly: 'N', type: 'text' },
  { bg: 'O', anomaly: 'D', type: 'text' },
  { bg: 'X', anomaly: 'Y', type: 'text' },
  { bg: 'U', anomaly: 'V', type: 'text' },
  { bg: 'K', anomaly: 'X', type: 'text' },
  { bg: 'C', anomaly: 'G', type: 'text' },
];
