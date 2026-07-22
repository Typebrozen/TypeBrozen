export interface EngineState {
  words: string[];
  wordIndex: number;
  typed: string;
  wordResults: (null | "correct" | "incorrect")[];
  finished: boolean;
  startTime: number | null;
  durationMs: number;
}

export interface Stats {
  cpm: number;
  wpm: number;
  accuracy: number;
  correctWords: number;
  incorrectWords: number;
}