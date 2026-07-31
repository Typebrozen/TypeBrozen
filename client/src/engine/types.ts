export interface EngineState {
  words: string[];
  wordIndex: number;
  typed: string;
  wordResults: (null | "correct" | "incorrect")[];
  finished: boolean;
  startTime: number | null;
  durationMs: number;
  totalCharsTyped: number; // Gross characters — CPCT/SSC/RSMSSB formulas ke liye
  totalErrors: number;      // Character-level mismatches
}

export interface Stats {
  cpm: number;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
  grossWpm: number;
  netWpmSSC: number;     // (Total Chars - Errors) / 5 / Time — CPCT/SSC/High Court method
  netWpmRSMSSB: number;  // Gross WPM - Full Mistakes — RSMSSB method
}