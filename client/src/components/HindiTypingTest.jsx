import { useEffect, useState, useCallback, useRef } from "react";
import { createInitialState, appendChar, backspace, commitWord, checkTimeout, computeStats } from "../engine/engine";
import { toGraphemeSpans } from "../engine/graphemes";
import { toKrutiSpans } from "../engine/krutiSpans";
import { resolvePhysicalKey, resolveAltGrKey } from "../engine/physicalKey";
import { getNextKeyInfo } from "../engine/nextKey";
import { getNextKrutiKeyInfo } from "../engine/krutiNextKey";
import { prepareCustomParagraph } from "../engine/customText";
import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { HINDI_PARAGRAPHS, KRUTIDEV_PARAGRAPHS } from "../lessons/HindiParagraphs";
import VirtualKeyboard from "./VirtualKeyboard";
import ExamMode from "./ExamMode";
import { downloadResultPdf } from "../utils/downloadPdf";

import keySoundFile from '../assets/key.mp3';
import errorSoundFile from '../assets/error.mp3';
import finishSoundFile from '../assets/finish.mp3';

const keySound = new Audio(keySoundFile);
const errorSound = new Audio(errorSoundFile);
const finishSound = new Audio(finishSoundFile);
keySound.volume = 0.08;
errorSound.volume = 0.12;
finishSound.volume = 0.2;

const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
]);

const TIME_OPTIONS_MIN = [1, 2, 3, 5, 10, 15];

const TIME_EXAM_LABELS = {
  10: "SSC / Railway / Court",
  15: "CPCT",
};

const MODE_LABELS = {
  mangal: "Mangal (InScript)",
  gail: "Mangal (Remington GAIL)",
  krutidev: "Krutidev 010",
};

const DEFAULT_MINUTES = 1;
const MIN_WORDS = 70;

function randomParagraph(source) {
  const usedIndexes = new Set();
  let combined = "";
  let wordCount = 0;

  while (wordCount < MIN_WORDS && usedIndexes.size < source.length) {
    const idx = Math.floor(Math.random() * source.length);
    if (usedIndexes.has(idx)) continue;
    usedIndexes.add(idx);

    const piece = source[idx];
    combined = combined ? combined + " " + piece : piece;
    wordCount += piece.split(/\s+/).filter(Boolean).length;
  }

  return combined;
}

function encouragement(cpm) {
  if (cpm >= 150) return "🏆 शानदार! सरकारी परीक्षा के लिए तैयार!";
  if (cpm >= 100) return "🔥 बहुत अच्छा! अभ्यास जारी रखें!";
  if (cpm >= 50) return "💪 अच्छी प्रगति!";
  return "🌱 रोज अभ्यास करते रहें!";
}

export default function HindiTypingTest() {
  const [mode, setMode] = useState("mangal"); // "mangal" | "gail" | "krutidev"
  const [showExam, setShowExam] = useState(false);
  const [testMode, setTestMode] = useState("time"); // "time" | "custom"
  const [selectedTime, setSelectedTime] = useState(DEFAULT_MINUTES * 60);
  const [customText, setCustomText] = useState("");
  const [customReady, setCustomReady] = useState(false);
  const [customNotice, setCustomNotice] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [state, setState] = useState(() =>
    createInitialState(randomParagraph(HINDI_PARAGRAPHS), DEFAULT_MINUTES * 60 * 1000)
  );
  const [now, setNow] = useState(() => Date.now());
  const activeWordRef = useRef(null);
  const passageContainerRef = useRef(null);
  const lastLineTopRef = useRef(0);

  const hiddenInputRef = useRef(null);

  const typedTrackRef = useRef(state.typed);
  const currentWordRef = useRef(state.words[state.wordIndex] ?? "");
  useEffect(() => {
    typedTrackRef.current = state.typed;
    currentWordRef.current = state.words[state.wordIndex] ?? "";
  }, [state.typed, state.wordIndex, state.words]);

  const prevFinishedRef = useRef(state.finished);
  useEffect(() => {
    if (state.finished && !prevFinishedRef.current) {
      finishSound.currentTime = 0;
      finishSound.play().catch(() => {});
    }
    prevFinishedRef.current = state.finished;
  }, [state.finished]);

  useEffect(() => {
    const container = passageContainerRef.current;
    const activeEl = activeWordRef.current;
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();
    const relativeTop = activeRect.top - containerRect.top + container.scrollTop;

    if (relativeTop !== lastLineTopRef.current) {
      lastLineTopRef.current = relativeTop;
      container.scrollTo({ top: relativeTop, behavior: "smooth" });
    }
  }, [state.wordIndex]);

  const showTypingArea = testMode !== "custom" || customReady;
  useEffect(() => {
    if ((mode === "krutidev" || mode === "gail") && showTypingArea) {
      hiddenInputRef.current?.focus();
    }
  }, [mode, showTypingArea]);

  function refocusHiddenInput() {
    if ((mode === "krutidev" || mode === "gail") && showTypingArea) {
      hiddenInputRef.current?.focus();
    }
  }

  const reset = useCallback(
    (durationSeconds = selectedTime, activeMode = mode) => {
      if (testMode === "custom" && customReady) {
        const { paragraph } = prepareCustomParagraph(customText, activeMode === "gail" ? "krutidev" : activeMode);
        setState(createInitialState(paragraph, durationSeconds * 1000));
      } else {
        const source =
          activeMode === "krutidev" || activeMode === "gail" ? KRUTIDEV_PARAGRAPHS : HINDI_PARAGRAPHS;
        setState(createInitialState(randomParagraph(source), durationSeconds * 1000));
      }
      setNow(Date.now());
    },
    [selectedTime, mode, testMode, customReady, customText]
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

  const handleModeToggle = (m) => {
    setTestMode(m);
    setCustomReady(false);
    setCustomText("");
    setCustomNotice(null);
    reset(selectedTime, mode);
  };

  const handleStartCustom = () => {
    const { paragraph, skippedCount } = prepareCustomParagraph(customText, mode === "gail" ? "krutidev" : mode);

    if (!paragraph) return;

    setCustomNotice(
      skippedCount > 0
        ? `${skippedCount} शब्द अभी छोड़ दिए गए हैं — जल्द ही सपोर्ट होंगे 🙂`
        : null
    );
    setState(createInitialState(paragraph, selectedTime * 1000));
    setCustomReady(true);
    setNow(Date.now());
  };

  const handleDownloadPdf = (stats) => {
    setDownloadingPdf(true);
    try {
      downloadResultPdf({
        title: "TypeHanuman — Practice Report",
        meta: `${MODE_LABELS[mode]} · ${Math.round(state.durationMs / 60000)} min`,
        stats: {
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          grossWpm: stats.grossWpm,
          netWpm: stats.netWpmSSC,
          correctWords: stats.correctWords,
          incorrectWords: stats.incorrectWords,
        },
        words: state.words.slice(0, state.wordIndex),
        typedHistory: state.typedHistory.slice(0, state.wordIndex),
        mode,
        filename: `TypeHanuman-Report-${Date.now()}.pdf`,
      });
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    function playSoundFor(charToAppend) {
      const expectedChar = currentWordRef.current[typedTrackRef.current.length];
      if (charToAppend === expectedChar) {
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
      } else {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
      }
    }

    function handleKeyDown(e) {
      if (state.finished) return;
      if (testMode === "custom" && !customReady) return;

      if (mode === "krutidev" && e.altKey && e.code && e.code.startsWith("Numpad")) {
        return;
      }

      if (IGNORED_KEYS.has(e.key)) return;

      e.preventDefault();

      if (e.code === "Space") {
        const isWordCorrect = typedTrackRef.current === currentWordRef.current;
        if (isWordCorrect) {
          keySound.currentTime = 0;
          keySound.play().catch(() => {});
        } else {
          errorSound.currentTime = 0;
          errorSound.play().catch(() => {});
        }
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

      let charToAppend = null;

      if (mode === "krutidev" || mode === "gail") {
        charToAppend = resolvedKey;
      } else if (e.altKey) {
        const base = resolveAltGrKey(e);
        charToAppend = base ? NUKTA_KEYMAP[base] : null;
      } else {
        charToAppend = MANGAL_KEYMAP[resolvedKey];
      }

      if (!charToAppend) return;

      playSoundFor(charToAppend);
      setState((prev) => appendChar(prev, charToAppend));
    }

    function handleHiddenInput(e) {
      if (mode !== "krutidev" && mode !== "gail") return;
      const typedChar = e.target.value;
      e.target.value = "";
      if (!typedChar) return;
      if (state.finished) return;
      if (testMode === "custom" && !customReady) return;

      playSoundFor(typedChar);
      setState((prev) => appendChar(prev, typedChar));
    }

    window.addEventListener("keydown", handleKeyDown);
    const hiddenInput = hiddenInputRef.current;
    hiddenInput?.addEventListener("input", handleHiddenInput);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      hiddenInput?.removeEventListener("input", handleHiddenInput);
    };
  }, [state.finished, mode, testMode, customReady]);

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
    mode === "krutidev" || mode === "gail"
      ? "'Kruti Dev 010', sans-serif"
      : "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif";

  if (showExam) {
    return <ExamMode onExit={() => setShowExam(false)} />;
  }

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

        <div className="w-full max-w-2xl p-4 rounded-2xl border border-white/10 bg-white/5">
          <p className="text-xs text-center text-white/40 mb-3 uppercase tracking-wider">
            असली परीक्षा जैसा स्कोर
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <div className="text-center min-w-[100px]">
              <p className="text-2xl font-bold text-white">{stats.grossWpm}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Gross WPM</p>
            </div>
            <div className="text-center min-w-[100px]">
              <p className="text-2xl font-bold text-blue-400">{stats.netWpmSSC}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Net WPM (SSC/CPCT)</p>
            </div>
            <div className="text-center min-w-[100px]">
              <p className="text-2xl font-bold text-purple-400">{stats.netWpmRSMSSB}</p>
              <p className="text-[10px] text-white/40 mt-0.5">Net WPM (RSMSSB)</p>
            </div>
          </div>
        </div>

        <div className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
          <p className="text-sm text-white/70" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>
            {encouragement(stats.cpm)}
          </p>
          <p className="text-xs mt-1 text-white/40">CPCT/SSC target: 150+ CPM with 90%+ accuracy</p>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 rounded-xl font-bold bg-white text-black transition-all hover:scale-105"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
          >
            फिर से कोशिश करें
          </button>
          <button
            onClick={() => handleDownloadPdf(stats)}
            disabled={downloadingPdf}
            className="px-8 py-3 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            {downloadingPdf ? "तैयार हो रहा है..." : "📄 रिजल्ट डाउनलोड करें"}
          </button>
        </div>
      </div>
    );
  }

  // ── TYPING SCREEN ──
  const activeWord = state.words[state.wordIndex] ?? "";
  const nextKeyInfo =
    state.typed.length >= activeWord.length
      ? { label: " ", shift: false }
      : mode === "krutidev" || mode === "gail"
      ? getNextKrutiKeyInfo(activeWord[state.typed.length])
      : getNextKeyInfo(activeWord.slice(state.typed.length));

  const remainingSeconds = state.startTime
    ? Math.max(0, Math.ceil((state.durationMs - elapsedMs) / 1000))
    : Math.round(state.durationMs / 1000);
  const formattedTime = `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const timeColor =
    remainingSeconds <= 10 ? "text-red-400" : remainingSeconds <= 30 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8" onClick={refocusHiddenInput}>
      <input
        ref={hiddenInputRef}
        tabIndex={-1}
        className="fixed opacity-0 pointer-events-none"
        style={{ top: 0, left: 0, width: 1, height: 1 }}
      />

      <div className="flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => handleSelectMode("mangal")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            mode === "mangal" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Mangal (InScript)
        </button>
        <button
          onClick={() => handleSelectMode("gail")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            mode === "gail" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Mangal (Remington GAIL)
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

      {(mode === "krutidev" || mode === "gail") && (
        <p className="text-center text-xs text-white/40">
          विशेष अक्षरों (जैसे Alt+0184) के लिए फिजिकल नंबर-पैड जरूरी है — लैपटॉप पर बिना नंबर-पैड के ये काम नहीं करेंगे
        </p>
      )}

      <div className="flex justify-center gap-2">
        <button
          onClick={() => handleModeToggle("time")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            testMode === "time" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Time
        </button>
        <button
          onClick={() => handleModeToggle("custom")}
          className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
            testMode === "custom" ? "bg-white/20 text-white" : "bg-white/5 border border-white/10 text-white/60"
          }`}
        >
          Custom
        </button>
        <button
          onClick={() => setShowExam(true)}
          className="px-4 py-1.5 rounded-lg text-sm transition-all bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-white"
        >
          Exam
        </button>
      </div>

      {testMode === "custom" && !customReady && (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
          <p className="text-sm text-center text-white/60">
            Mangal ya Krutidev — jo bhi text paste karoge, hum khud pehchan lenge
          </p>
          <textarea
            className="w-full h-32 rounded-xl p-4 text-sm resize-none outline-none bg-white/5 border border-white/10 text-white"
            placeholder="Apna paragraph yahan paste karo..."
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
          />
          <button
            onClick={handleStartCustom}
            disabled={customText.trim().length === 0}
            className="mx-auto px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 bg-white text-black disabled:opacity-30 disabled:hover:scale-100"
          >
            Start Typing →
          </button>
        </div>
      )}

      {showTypingArea && (
        <>
          {testMode === "time" && (
            <div className="flex justify-center gap-2 flex-wrap">
              {TIME_OPTIONS_MIN.map((min) => (
                <button
                  key={min}
                  onClick={() => handleSelectTime(min)}
                  className={`px-3 py-1 rounded-lg text-xs transition-all flex flex-col items-center ${
                    selectedTime === min * 60
                      ? "bg-white/20 text-white"
                      : "bg-white/5 border border-white/10 text-white/60"
                  }`}
                >
                  <span>{min} min</span>
                  {TIME_EXAM_LABELS[min] && (
                    <span className="text-[9px] opacity-70">{TIME_EXAM_LABELS[min]}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="text-center">
            <p className={`text-3xl font-bold font-mono tabular-nums ${timeColor}`}>{formattedTime}</p>
          </div>

          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
            <div
              ref={passageContainerRef}
              className="text-2xl flex flex-wrap gap-x-3 overflow-y-auto hide-scrollbar"
              style={{ fontFamily, lineHeight: "3.5rem", maxHeight: "7.5rem" }}
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
                  const spans = mode === "krutidev" || mode === "gail" ? toKrutiSpans(word) : toGraphemeSpans(word);
                  const typed = state.typed;

                  return (
                    <span key={wIdx} ref={activeWordRef} className="inline-flex">
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
          </div>

          <VirtualKeyboard nextKey={nextKeyInfo} mode={mode} />

          {customNotice && (
            <p className="text-center text-xs text-white/40">{customNotice}</p>
          )}

          {((nextKeyInfo?.altGr && mode === "mangal") ||
            (nextKeyInfo?.altCode !== undefined && mode === "krutidev")) && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md">
              <div className="text-center p-3 rounded-xl border border-yellow-500/40 bg-yellow-500/95 shadow-xl backdrop-blur">
                <p className="text-sm text-black font-medium">
                  {mode === "mangal" ? (
                    <>
                      ⚠️ यह अक्षर <strong>Shift से नहीं</strong> बनता — कीबोर्ड की <strong>दाईं तरफ वाली Alt key</strong> दबाकर रखें, फिर <strong>{nextKeyInfo.label}</strong> दबाएं
                    </>
                  ) : (
                    <>
                      ⚠️ यह विशेष अक्षर है — <strong>Alt दबाकर रखें</strong>, फिर नंबर-पैड पर <strong>0{nextKeyInfo.altCode}</strong> टाइप करें, फिर Alt छोड़ दें
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <button onClick={() => reset()} className="mx-auto text-sm text-gray-500 underline">
            Reset
          </button>
        </>
      )}
    </div>
  );
}