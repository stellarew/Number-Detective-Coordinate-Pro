
export const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
export const ROWS = Array.from({ length: 24 }, (_, i) => i + 1);
export const TOTAL_ANOMALIES = 15;
export const SEARCH_DURATION = 600; // 10 minutes as requested
export const REVEAL_DURATION = 30; // 30 seconds as requested

export const CHAR_PAIRS = [
  // Numeric-ish
  { bg: '8', anomaly: 'B', type: 'numeric' },
  { bg: '0', anomaly: 'Q', type: 'numeric' },
  { bg: '5', anomaly: 'S', type: 'numeric' },
  { bg: '2', anomaly: 'Z', type: 'numeric' },
  { bg: '6', anomaly: 'G', type: 'numeric' },
  { bg: '9', anomaly: 'P', type: 'numeric' },
  { bg: '1', anomaly: 'I', type: 'numeric' },
  // Text-based (Harder)
  { bg: 'W', anomaly: 'V', type: 'text' },
  { bg: 'E', anomaly: 'F', type: 'text' },
  { bg: 'M', anomaly: 'N', type: 'text' },
  { bg: 'O', anomaly: 'D', type: 'text' },
  { bg: 'X', anomaly: 'Y', type: 'text' },
  { bg: 'U', anomaly: 'V', type: 'text' },
  { bg: 'K', anomaly: 'X', type: 'text' },
  { bg: 'C', anomaly: 'G', type: 'text' },
];
