// ======================================================
// Typing Engine — pure functions, no React, no classes.
// Each function takes a state and returns a NEW state.
// Call pattern from the component is always:
//   setState(prev => appendChar(prev, char))
//
// Mangal needs no composition/buffering logic: Unicode
// already stores characters in typing order (क then ि),
// the font's shaping engine handles the visual reordering
// on its own. So "typed" is just a plain growing string.
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
  };
}

export function appendChar(state: EngineState, char: string): EngineState {
  if (state.finished) return state;
  // Timer starts on the FIRST keystroke, not on page load.
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
  const isCorrect = target === state.typed;

  const wordResults = [...state.wordResults];
  wordResults[state.wordIndex] = isCorrect ? "correct" : "incorrect";

  const wordIndex = state.wordIndex + 1;
  const finished = wordIndex >= state.words.length;

  return { ...state, wordResults, wordIndex, typed: "", finished };
}

// Called periodically (not from a keystroke) to check whether the
// selected duration has run out. Returns the SAME state object when
// nothing changed, so React won't re-render on every harmless tick —
// only when the test actually needs to end.
export function checkTimeout(state: EngineState, now: number): EngineState {
  if (state.finished || state.startTime === null) return state;
  if (now - state.startTime >= state.durationMs) {
    return { ...state, finished: true };
  }
  return state;
}

// Only CORRECT words count toward CPM/WPM — standard typing-test
// convention, and matches CPCT/SSC scoring expectations.
export function computeStats(state: EngineState, elapsedMs: number): Stats {
  let correctWords = 0;
  let incorrectWords = 0;
  let correctChars = 0;

  state.words.forEach((word, idx) => {
    const result = state.wordResults[idx];
    if (result === "correct") {
      correctWords++;
      correctChars += word.length + 1; // +1 for the space after the word
    } else if (result === "incorrect") {
      incorrectWords++;
    }
  });

  const elapsedMin = elapsedMs / 60000;
  const cpm = elapsedMin > 0 ? Math.round(correctChars / elapsedMin) : 0;
  const wpm = Math.round(cpm / 5);

  const totalJudged = correctWords + incorrectWords;
  const accuracy = totalJudged === 0 ? 100 : Math.round((correctWords / totalJudged) * 100);

  return { cpm, wpm, accuracy, correctWords, incorrectWords };
}