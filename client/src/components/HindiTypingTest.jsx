import { useEffect, useState, useCallback } from "react";
import { createInitialState, appendChar, backspace, commitWord, checkTimeout, computeStats } from "../engine/engine";
import { toGraphemeSpans } from "../engine/graphemes";
import { toKrutiSpans } from "../engine/krutiSpans";
import { resolvePhysicalKey, resolveAltGrKey } from "../engine/physicalKey";
import { getNextKeyInfo } from "../engine/nextKey";
import { getNextKrutiKeyInfo } from "../engine/krutiNextKey";
import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { HINDI_PARAGRAPHS, KRUTIDEV_PARAGRAPHS } from "../lessons/HindiParagraphs";
import VirtualKeyboard from "./VirtualKeyboard";

const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
]);

const TIME_OPTIONS_MIN = [1, 2, 3, 5, 10];
const DEFAULT_MINUTES = 1;

function randomParagraph(source) {
  return source[Math.floor(Math.random() * source.length)];
}

function encouragement(cpm) {
  if (cpm >= 150) return "🏆 शानदार! सरकारी परीक्षा के लिए तैयार!";
  if (cpm >= 100) return "🔥 बहुत अच्छा! अभ्यास जारी रखें!";
  if (cpm >= 50) return "💪 अच्छी प्रगति!";
  return "🌱 रोज अभ्यास करते रहें!";
}

export default function HindiTypingTest() {
  // "mangal" or "krutidev" — decides font, data source, and key handling
  const [mode, setMode] = useState("mangal");
  const [selectedTime, setSelectedTime] = useState(DEFAULT_MINUTES * 60);
  const [state, setState] = useState(() =>
    createInitialState(randomParagraph(HINDI_PARAGRAPHS), DEFAULT_MINUTES * 60 * 1000)
  );
  const [now, setNow] = useState(() => Date.now());

  const sourceParagraphs = mode === "krutidev" ? KRUTIDEV_PARAGRAPHS : HINDI_PARAGRAPHS;

  const reset = useCallback(
    (durationSeconds = selectedTime, activeMode = mode) => {
      const source = activeMode === "krutidev" ? KRUTIDEV_PARAGRAPHS : HINDI_PARAGRAPHS;
      setState(createInitialState(randomParagraph(source), durationSeconds * 1000));
      setNow(Date.now());
    },
    [selectedTime, mode]
  );

  const handleSelectTime = (minutes) => {
    const seconds = minutes * 60;
    setSelectedTime(seconds);
    reset(seconds);
  };

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    reset(selectedTime, newMode);
  };

  // Keyboard input
  useEffect(() => {
    function handleKeyDown(e) {
      if (state.finished) return;
      if (IGNORED_KEYS.has(e.key)) return;

      e.preventDefault();

      if (e.code === "Space") {
        setState((prev) => commitWord(prev));
        setNow(Date.now());
        return;
      }
      if (e.code === "Backspace") {
        setState((prev) => backspace(prev));
        return;
      }

      const resolvedKey = resolvePhysicalKey(e);
      if (!resolvedKey) return;

      if (mode === "krutidev") {
        // Krutidev: physical key -> raw ASCII char, no keymap lookup needed.
        setState((prev) => appendChar(prev, resolvedKey));
      } else if (e.altKey) {
        // AltGr layer — nukta letters jaise ढ़
        const base = resolveAltGrKey(e);
        const nuktaChar = base ? NUKTA_KEYMAP[base] : null;
        if (!nuktaChar) return;
        setState((prev) => appendChar(prev, nuktaChar));
      } else {
        // Mangal: physical key -> Unicode Devanagari char via keymap.
        const char = MANGAL_KEYMAP[resolvedKey];
        if (!char) return;
        setState((prev) => appendChar(prev, char));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.finished, mode]);

  // Timer
  useEffect(() => {
    if (state.finished) return;
    const interval = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((prev) => checkTimeout(prev, t));
    }, 250);
    return () => clearInterval(interval);
  }, [state.finished]);

  const elapsedMs = state.startTime ? now - state.startTime : 0;
  const fontFamily =
    mode === "krutidev"
      ? "'Kruti Dev 010', sans-serif"
      : "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif";

  // ── RESULTS SCREEN ──
  if (state.finished) {
    const stats = computeStats(state, elapsedMs);
    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full py-8">
        <div className="text-center">
          <p className="text-8xl font-bold tabular-nums text-white">{stats.cpm}</p>
          <p className="text-xs uppercase tracking-widest mt-2 text-white/50">Characters Per Minute</p>
        </div>

        <div className="flex gap-6 flex-wrap justify-center">
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-4xl font-bold text-white">{stats.wpm}</p>
            <p className="text-xs uppercase text-white/50 mt-1">WPM</p>
          </div>
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-4xl font-bold text-white">{stats.accuracy}%</p>
            <p className="text-xs uppercase text-white/50 mt-1">Accuracy</p>
          </div>
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-4xl font-bold text-green-400">{stats.correctWords}</p>
            <p className="text-xs uppercase text-white/50 mt-1">Correct Words</p>
          </div>
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-4xl font-bold text-red-400">{stats.incorrectWords}</p>
            <p className="text-xs uppercase text-white/50 mt-1">Wrong Words</p>
          </div>
        </div>

        <div className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-sm text-white/70" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            {encouragement(stats.cpm)}
          </p>
          <p className="text-xs mt-1 text-white/40">CPCT/SSC target: 150+ CPM with 90%+ accuracy</p>
        </div>

        <button
          onClick={() => reset()}
          className="px-8 py-3 rounded-xl font-bold bg-white text-black transition-all hover:scale-105"
          style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
        >
          फिर से कोशिश करें
        </button>
      </div>
    );
  }

  // ── TYPING SCREEN ──
  const activeWord = state.words[state.wordIndex] ?? "";
  const nextKeyInfo =
    state.typed.length >= activeWord.length
      ? { label: " ", shift: false }
      : mode === "krutidev"
      ? getNextKrutiKeyInfo(activeWord[state.typed.length])
      : getNextKeyInfo(activeWord[state.typed.length]);

  const remainingSeconds = state.startTime
    ? Math.max(0, Math.ceil((state.durationMs - elapsedMs) / 1000))
    : Math.round(state.durationMs / 1000);
  const formattedTime = `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const timeColor =
    remainingSeconds <= 10 ? "text-red-400" : remainingSeconds <= 30 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8">
      {/* Mode selector — Mangal vs Krutidev */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => handleSelectMode("mangal")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            mode === "mangal" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Mangal (Unicode)
        </button>
        <button
          onClick={() => handleSelectMode("krutidev")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            mode === "krutidev" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Krutidev 010
        </button>
      </div>

      {/* Time selector */}
      <div className="flex justify-center gap-2 flex-wrap">
        {TIME_OPTIONS_MIN.map((min) => (
          <button
            key={min}
            onClick={() => handleSelectTime(min)}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${
              selectedTime === min * 60
                ? "bg-white/20 text-white"
                : "bg-white/5 border border-white/10 text-white/60"
            }`}
          >
            {min} min
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="text-center">
        <p className={`text-3xl font-bold font-mono tabular-nums ${timeColor}`}>{formattedTime}</p>
      </div>

      <div
        className="text-2xl flex flex-wrap gap-x-3"
        style={{ fontFamily, lineHeight: "3.5rem" }}
      >
        {state.words.map((word, wIdx) => {
          if (wIdx < state.wordIndex) {
            const result = state.wordResults[wIdx];
            return (
              <span
                key={wIdx}
                className={result === "correct" ? "text-green-600" : "text-red-500 underline decoration-2"}
              >
                {word}
              </span>
            );
          }

          if (wIdx === state.wordIndex) {
            const spans = mode === "krutidev" ? toKrutiSpans(word) : toGraphemeSpans(word);
            const typed = state.typed;

            return (
              <span key={wIdx} className="inline-flex">
                {spans.map((seg, sIdx) => {
                  let className = "text-gray-400";

                  if (typed.length >= seg.end) {
                    const typedSlice = typed.slice(seg.start, seg.end);
                    className = typedSlice === seg.text ? "text-green-600" : "text-red-500";
                  } else if (typed.length >= seg.start) {
                    className = "text-gray-400 border-l-2 border-blue-500 animate-pulse";
                  }

                  return (
                    <span key={sIdx} className={className}>
                      {seg.text}
                    </span>
                  );
                })}

                {typed.length > word.length && (
                  <span className="text-red-500 bg-red-100 rounded px-0.5">
                    {typed.slice(word.length)}
                  </span>
                )}
              </span>
            );
          }

          return (
            <span key={wIdx} className="text-gray-300">
              {word}
            </span>
          );
        })}
      </div>

      <VirtualKeyboard nextKey={nextKeyInfo} mode={mode} />

      {/* Notice board — sirf tab dikhta hai jab agla character special/
          hard-to-type ho (jaise AltGr wale nukta letters). Normal typing
          mein ye chhupa rehta hai, taaki flow disturb na ho. */}
      {nextKeyInfo?.altGr && (
        <div className="text-center p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
          <p className="text-sm text-yellow-200">
            ⚠️ विशेष अक्षर — <strong>Right Alt + {nextKeyInfo.label}</strong> एक साथ दबाएं
          </p>
        </div>
      )}

      <button onClick={() => reset()} className="mx-auto text-sm text-gray-500 underline">
        Reset
      </button>
    </div>
  );
}