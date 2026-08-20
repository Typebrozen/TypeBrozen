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
    typedHistory: words.map(() => null),
    reopenedCount: 0,
  };
}

export function appendChar(state: EngineState, char: string): EngineState {
  if (state.finished) return state;
  const startTime = state.startTime ?? Date.now();
  return { ...state, typed: state.typed + char, startTime };
}

// GAIL mode ke liye: poora current-word ka typed text replace karta hai
// (single-char append kaafi nahi hai kyunki Kruti Dev-style raw input
// ko Unicode mein convert karne par pura word badal sakta hai — jaise
// "ks" ek saath milke ek matra banata hai).
export function setTyped(state: EngineState, newTyped: string): EngineState {
  if (state.finished) return state;
  const startTime = state.startTime ?? Date.now();
  return { ...state, typed: newTyped, startTime };
}

export function backspace(state: EngineState): EngineState {
  if (state.finished) return state;
  if (state.typed.length === 0) return state;
  return { ...state, typed: state.typed.slice(0, -1) };
}

// ── Hybrid backspace: pichla COMMITTED word wapas kholna ──
// Sirf tab kaam karta hai jab current word ka typed text khaali ho
// (matlab user abhi shuruaat mein hai) aur exam ka backspaceMode
// isse allow karta ho. maxWordsBack:
//   0         -> kabhi reopen nahi hoga ("currentWordOnly" mode
//                isi function ko kabhi call hi nahi karega)
//   1         -> sirf ek pichla word ("currentPlusOneWord")
//   Infinity  -> jitna chaho piche jao ("full")
export function reopenPreviousWord(state: EngineState, maxWordsBack: number): EngineState {
  if (state.finished) return state;
  if (state.typed.length > 0) return state;
  if (state.wordIndex === 0) return state;
  if (state.reopenedCount >= maxWordsBack) return state;

  const prevIndex = state.wordIndex - 1;
  const prevTyped = state.typedHistory[prevIndex] ?? "";

  const wordResults = [...state.wordResults];
  wordResults[prevIndex] = null; // dobara judge hoga jab commit hoga

  const typedHistory = [...state.typedHistory];
  typedHistory[prevIndex] = null;

  return {
    ...state,
    wordIndex: prevIndex,
    typed: prevTyped,
    wordResults,
    typedHistory,
    reopenedCount: state.reopenedCount + 1,
  };
}

export function commitWord(state: EngineState): EngineState {
  if (state.finished) return state;

  const target = state.words[state.wordIndex];
  const typed = state.typed;
  const isCorrect = target === typed;

  let charErrors = 0;
  const maxLen = Math.max(target.length, typed.length);
  for (let i = 0; i < maxLen; i++) {
    if (typed[i] !== target[i]) charErrors++;
  }

  const wordResults = [...state.wordResults];
  wordResults[state.wordIndex] = isCorrect ? "correct" : "incorrect";

  const typedHistory = [...state.typedHistory];
  typedHistory[state.wordIndex] = typed;

  const wordIndex = state.wordIndex + 1;
  const finished = wordIndex >= state.words.length;

  return {
    ...state,
    wordResults,
    typedHistory,
    wordIndex,
    typed: "",
    finished,
    totalCharsTyped: state.totalCharsTyped + typed.length + 1,
    totalErrors: state.totalErrors + charErrors,
    reopenedCount: 0, // naye word ki taraf badhe, purani reopen-limit reset
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

  const grossWpm =
    elapsedMin > 0 ? Math.round(state.totalCharsTyped / 5 / elapsedMin) : 0;

  const netWpmSSC =
    elapsedMin > 0
      ? Math.max(0, Math.round((state.totalCharsTyped - state.totalErrors) / 5 / elapsedMin))
      : 0;

  const netWpmRSMSSB = Math.max(0, grossWpm - incorrectWords);

  return { cpm, wpm, accuracy, correctWords, incorrectWords, grossWpm, netWpmSSC, netWpmRSMSSB };
}