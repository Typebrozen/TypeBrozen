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

  // Hybrid backspace ke liye: har committed word ka asli typed
  // text yahan store hota hai (target text nahi, jo user ne
  // WAKAI type kiya tha) — taaki reopen karne par wapas mil sake.
  typedHistory: (string | null)[];
  // Kitne committed words abhi "reopen" karke wapas khole gaye
  // hain, is forward-progress cycle mein. Naya word commit hote
  // hi 0 par reset ho jaata hai. Exam ke backspaceMode (jaise
  // "currentPlusOneWord" = max 1) isi se apni limit check karta hai.
  reopenedCount: number;
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