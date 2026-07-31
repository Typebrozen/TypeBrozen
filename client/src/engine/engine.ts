// ======================================================
// Typing Engine — pure functions, no React, no classes.
// ======================================================

import { EngineState, Stats } from "./types";

export function createInitialState(paragraph: string, durationMs: number = 60000): EngineState {
  const words = paragraph.split(/\s+/).filter(Boolean);
  return {
    words,
    wordIndex: 0,
    typed: "",
    wordResults: words.map(() => null),
    finished: false,
    startTime: null,
    durationMs,
    totalCharsTyped: 0,
    totalErrors: 0,
  };
}

export function appendChar(state: EngineState, char: string): EngineState {
  if (state.finished) return state;
  const startTime = state.startTime ?? Date.now();
  return { ...state, typed: state.typed + char, startTime };
}

export function backspace(state: EngineState): EngineState {
  if (state.finished) return state;
  if (state.typed.length === 0) return state;
  return { ...state, typed: state.typed.slice(0, -1) };
}

export function commitWord(state: EngineState): EngineState {
  if (state.finished) return state;

  const target = state.words[state.wordIndex];
  const typed = state.typed;
  const isCorrect = target === typed;

  // Character-level error count — jitni bhi positions pe typed/target
  // match nahi karte, ya extra/missing characters hain, wo sab "error"
  // ginte hain. Ye asli exam-style formulas ke liye zaroori data hai.
  let charErrors = 0;
  const maxLen = Math.max(target.length, typed.length);
  for (let i = 0; i < maxLen; i++) {
    if (typed[i] !== target[i]) charErrors++;
  }

  const wordResults = [...state.wordResults];
  wordResults[state.wordIndex] = isCorrect ? "correct" : "incorrect";

  const wordIndex = state.wordIndex + 1;
  const finished = wordIndex >= state.words.length;

  return {
    ...state,
    wordResults,
    wordIndex,
    typed: "",
    finished,
    totalCharsTyped: state.totalCharsTyped + typed.length + 1, // +1 space keystroke
    totalErrors: state.totalErrors + charErrors,
  };
}

export function checkTimeout(state: EngineState, now: number): EngineState {
  if (state.finished || state.startTime === null) return state;
  if (now - state.startTime >= state.durationMs) {
    return { ...state, finished: true };
  }
  return state;
}

export function computeStats(state: EngineState, elapsedMs: number): Stats {
  let correctWords = 0;
  let incorrectWords = 0;
  let correctChars = 0;

  state.words.forEach((word, idx) => {
    const result = state.wordResults[idx];
    if (result === "correct") {
      correctWords++;
      correctChars += word.length + 1;
    } else if (result === "incorrect") {
      incorrectWords++;
    }
  });

  const elapsedMin = elapsedMs / 60000;
  const cpm = elapsedMin > 0 ? Math.round(correctChars / elapsedMin) : 0;
  const wpm = Math.round(cpm / 5);

  const totalJudged = correctWords + incorrectWords;
  const accuracy = totalJudged === 0 ? 100 : Math.round((correctWords / totalJudged) * 100);

  // ── Exam-style scoring formulas ──
  // Gross WPM: saari typed characters, bina errors ghataye
  const grossWpm =
    elapsedMin > 0 ? Math.round(state.totalCharsTyped / 5 / elapsedMin) : 0;

  // CPCT/SSC/High Court method: (Total Characters - Errors) / 5 / Time
  const netWpmSSC =
    elapsedMin > 0
      ? Math.max(0, Math.round((state.totalCharsTyped - state.totalErrors) / 5 / elapsedMin))
      : 0;

  // RSMSSB method: Gross WPM - Full Mistakes (galat words ki ginti)
  const netWpmRSMSSB = Math.max(0, grossWpm - incorrectWords);

  return { cpm, wpm, accuracy, correctWords, incorrectWords, grossWpm, netWpmSSC, netWpmRSMSSB };
}