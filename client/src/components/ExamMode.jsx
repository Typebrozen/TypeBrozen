import { useEffect, useState, useCallback, useRef } from "react";
import {
  createInitialState,
  appendChar,
  backspace,
  reopenPreviousWord,
  commitWord,
  checkTimeout,
  computeStats,
} from "../engine/engine";
import { toGraphemeSpans } from "../engine/graphemes";
import { toKrutiSpans } from "../engine/krutiSpans";
import { resolvePhysicalKey, resolveAltGrKey } from "../engine/physicalKey";
import { getNextKeyInfo } from "../engine/nextKey";
import { getNextKrutiKeyInfo } from "../engine/krutiNextKey";
import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { EXAM_CONFIGS } from "../lessons/examConfig";
import { resolveChapters } from "../lessons/contentResolver";

const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
]);

const LAYOUT_LABELS = {
  inscript: "Mangal (InScript)",
  gail: "Mangal (Remington GAIL)",
  krutidev: "Krutidev 010",
};

// "krutidev" aur "gail" dono raw Kruti-Dev-style physical keys use
// karte hain (target text already uni2kru se convert ho chuka hota
// hai contentResolver mein) — isliye typing-logic ke liye ye dono
// EK jaisa treat hote hain. Sirf "inscript" alag hai.
function isRawGlyphLayout(layout) {
  return layout === "krutidev" || layout === "gail";
}

function maxWordsBackFor(backspaceMode) {
  if (backspaceMode === "full") return Infinity;
  if (backspaceMode === "currentPlusOneWord") return 1;
  return 0; // "currentWordOnly" aur "none" dono ke liye 0
}

function buildLoopedParagraph(chapterText, durationSeconds) {
  const targetWords = Math.ceil((durationSeconds / 60) * 100);
  const chapterWordCount = chapterText.split(/\s+/).filter(Boolean).length;
  const repeats = Math.max(1, Math.ceil(targetWords / chapterWordCount));
  return Array(repeats).fill(chapterText).join(" ");
}

export default function ExamMode({ onExit }) {
  const [examKey, setExamKey] = useState(null);
  const [layout, setLayout] = useState(null); 
  const [chapterIndex, setChapterIndex] = useState(null);
  const [state, setState] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const config = examKey ? EXAM_CONFIGS[examKey] : null;
  const needsLayoutChoice = config && config.layouts.length > 1;
  const activeLayout = config ? layout ?? (config.layouts.length === 1 ? config.layouts[0] : null) : null;

  const chapters = config && activeLayout ? resolveChapters(config.contentCategories, activeLayout) : [];
  const activeChapter = chapterIndex !== null ? chapters[chapterIndex] : null;

  const typedTrackRef = useRef("");
  useEffect(() => {
    typedTrackRef.current = state?.typed ?? "";
  }, [state?.typed]);

  const hiddenInputRef = useRef(null);

  const activeWordRef = useRef(null);
  const passageRef = useRef(null);
  const typedBoxRef = useRef(null);
  const lastLineTopRef = useRef(0);

  // --- UPDATED useEffect BLOCK START ---
  useEffect(() => {
    const container = passageRef.current;
    const activeEl = activeWordRef.current;

    if (container && activeEl) {
      // getBoundingClientRect se hisaab lagate hain — offsetTop ki
      // tarah container ke position: relative hone par depend nahi
      // karta, isliye kabhi galat/bada number nahi deta.
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const relativeTop = activeRect.top - containerRect.top + container.scrollTop;

      if (relativeTop !== lastLineTopRef.current) {
        lastLineTopRef.current = relativeTop;
        container.scrollTo({ top: relativeTop, behavior: "smooth" });
      }
    }
    if (typedBoxRef.current) {
      typedBoxRef.current.scrollTop = typedBoxRef.current.scrollHeight;
    }
  }, [state?.wordIndex]);
  // --- UPDATED useEffect BLOCK END ---

  useEffect(() => {
    if (activeLayout === "krutidev" && state && !state.finished) {
      hiddenInputRef.current?.focus();
    }
  }, [activeLayout, state]);

  function refocusHiddenInput() {
    if (activeLayout === "krutidev" && state && !state.finished) {
      hiddenInputRef.current?.focus();
    }
  }

  const selectExam = (key) => {
    setExamKey(key);
    setLayout(null);
    setChapterIndex(null);
  };

  const selectLayout = (l) => {
    setLayout(l);
    setChapterIndex(null);
  };

  const startChapter = (idx) => {
    const cfg = EXAM_CONFIGS[examKey];
    const chapter = chapters[idx];
    setChapterIndex(idx);
    setState(createInitialState(buildLoopedParagraph(chapter.text, cfg.durationSeconds), cfg.durationSeconds * 1000));
    setNow(Date.now());
  };

  const restartChapter = useCallback(() => {
    if (!examKey || chapterIndex === null) return;
    const cfg = EXAM_CONFIGS[examKey];
    const chapter = chapters[chapterIndex];
    setState(createInitialState(buildLoopedParagraph(chapter.text, cfg.durationSeconds), cfg.durationSeconds * 1000));
    setNow(Date.now());
  }, [examKey, chapterIndex, chapters]);

  const backToChapterList = () => {
    setChapterIndex(null);
    setState(null);
  };

  const backToLayoutChoice = () => {
    setLayout(null);
    setChapterIndex(null);
    setState(null);
  };

  const exitExam = () => {
    setExamKey(null);
    setLayout(null);
    setChapterIndex(null);
    setState(null);
  };

  // Keyboard input
  useEffect(() => {
    if (!config || !state || !activeLayout) return;

    function handleKeyDown(e) {
      if (state.finished) return;
      if (IGNORED_KEYS.has(e.key)) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        return;
      }

      if (activeLayout === "krutidev" && e.altKey && e.code && e.code.startsWith("Numpad")) {
        return;
      }

      e.preventDefault();

      if (e.code === "Space") {
        setState((prev) => commitWord(prev));
        setNow(Date.now());
        return;
      }

      if (e.code === "Backspace") {
        if (config.backspaceMode === "none") return; 
        if (state.typed.length > 0) {
          setState((prev) => backspace(prev));
          return;
        }
        setState((prev) => reopenPreviousWord(prev, maxWordsBackFor(config.backspaceMode)));
        return;
      }

      let charToAppend = null;

      if (isRawGlyphLayout(activeLayout)) {
        charToAppend = resolvePhysicalKey(e);
      } else if (e.altKey) {
        const base = resolveAltGrKey(e);
        charToAppend = base ? NUKTA_KEYMAP[base] : null;
      } else {
        const resolvedKey = resolvePhysicalKey(e);
        charToAppend = resolvedKey ? MANGAL_KEYMAP[resolvedKey] : null;
      }

      if (!charToAppend) return;
      setState((prev) => appendChar(prev, charToAppend));
    }

    function handleHiddenInput(e) {
      if (activeLayout !== "krutidev") return;
      const typedChar = e.target.value;
      e.target.value = "";
      if (!typedChar) return;
      if (state.finished) return;
      setState((prev) => appendChar(prev, typedChar));
    }

    window.addEventListener("keydown", handleKeyDown);
    const hiddenInput = hiddenInputRef.current;
    hiddenInput?.addEventListener("input", handleHiddenInput);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      hiddenInput?.removeEventListener("input", handleHiddenInput);
    };
  }, [state, config, activeLayout]);

  // Timer
  useEffect(() => {
    if (!state || state.finished) return;
    const interval = setInterval(() => {
      const t = Date.now();
      setNow(t);
      setState((prev) => (prev ? checkTimeout(prev, t) : prev));
    }, 250);
    return () => clearInterval(interval);
  }, [state?.finished]);

  const fontFamily = isRawGlyphLayout(activeLayout)
    ? "'Kruti Dev 010', sans-serif"
    : "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif";

  // ── SCREEN 1: Exam picker ──
  if (!config) {
    return (
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm text-center text-white/60 mb-2">
          Apna exam chuno — duration, backspace rule aur layout automatically set ho jayenge
        </p>
        {Object.entries(EXAM_CONFIGS).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => selectExam(key)}
            className="text-left px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
          >
            <span className="font-medium">{cfg.label}</span>
            <span className="ml-2 text-xs text-white/40">
              {cfg.fullName} · {Math.round(cfg.durationSeconds / 60)} min
            </span>
          </button>
        ))}
        {onExit && (
          <button onClick={onExit} className="mx-auto mt-2 text-sm text-white/40 underline">
            ← वापस जाएं
          </button>
        )}
      </div>
    );
  }

  // ── SCREEN 2: Layout picker ──
  if (needsLayoutChoice && !activeLayout) {
    return (
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm text-center text-white/60 mb-2">
          {config.label} — apna keyboard layout chuno
        </p>
        {config.layouts.map((l) => (
          <button
            key={l}
            onClick={() => selectLayout(l)}
            className="text-left px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
          >
            <span className="font-medium">{LAYOUT_LABELS[l]}</span>
          </button>
        ))}
        <button onClick={exitExam} className="mx-auto mt-2 text-sm text-white/40 underline">
          ← दूसरा Exam चुनें
        </button>
      </div>
    );
  }

  // ── SCREEN 3: Chapter picker ──
  if (chapterIndex === null) {
    return (
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm text-center text-white/60 mb-2">
          {config.label} ({LAYOUT_LABELS[activeLayout]}) — ek chapter चुनो
        </p>
        {chapters.map((chapter, idx) => {
          const wordCount = chapter.text.split(/\s+/).filter(Boolean).length;
          return (
            <button
              key={chapter.id}
              onClick={() => startChapter(idx)}
              className="text-left px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
              style={{ fontFamily }}
            >
              <span className="font-medium">
                {idx + 1}. {chapter.title}
              </span>
              <span className="ml-2 text-xs text-white/40" style={{ fontFamily: "inherit" }}>
                {wordCount} शब्द
              </span>
            </button>
          );
        })}
        <button onClick={needsLayoutChoice ? backToLayoutChoice : exitExam} className="mx-auto mt-2 text-sm text-white/40 underline">
          ← वापस जाएं
        </button>
      </div>
    );
  }

  const elapsedMs = state.startTime ? now - state.startTime : 0;
  const remainingSeconds = state.startTime
    ? Math.max(0, Math.ceil((state.durationMs - elapsedMs) / 1000))
    : Math.round(state.durationMs / 1000);
  const formattedTime = `${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const timeColor =
    remainingSeconds <= 10 ? "text-red-400" : remainingSeconds <= 30 ? "text-yellow-400" : "text-green-400";

  // ── SCREEN 4: Result ──
  if (state.finished) {
    const stats = computeStats(state, elapsedMs);
    const netScore = config.scoreMethod === "rsmssb" ? stats.netWpmRSMSSB : stats.netWpmSSC;

    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm uppercase tracking-widest text-white/40">
          {config.fullName} · {LAYOUT_LABELS[activeLayout]}
        </p>
        <div className="text-center">
          <p className="text-8xl font-bold tabular-nums text-white">{netScore}</p>
          <p className="text-xs uppercase tracking-widest mt-2 text-white/50">Net WPM</p>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">{stats.grossWpm}</p>
            <p className="text-xs uppercase text-white/50 mt-1">Gross WPM</p>
          </div>
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-white">{stats.accuracy}%</p>
            <p className="text-xs uppercase text-white/50 mt-1">Accuracy</p>
          </div>
          <div className="text-center p-6 rounded-2xl border border-white/10 bg-white/5">
            <p className="text-3xl font-bold text-red-400">{stats.incorrectWords}</p>
            <p className="text-xs uppercase text-white/50 mt-1">Wrong Words</p>
          </div>
        </div>
        <p className="text-xs text-white/40 text-center max-w-md">
          Exact threshold apni exam ki official notification mein check karo — ye score sirf practice ke liye hai.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={restartChapter}
            className="px-8 py-3 rounded-xl font-bold bg-white text-black transition-all hover:scale-105"
          >
            फिर से कोशिश करें
          </button>
          <button
            onClick={backToChapterList}
            className="px-8 py-3 rounded-xl text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-all"
          >
            दूसरा Chapter चुनें
          </button>
          {onExit && (
            <button onClick={onExit} className="px-8 py-3 rounded-xl text-sm text-white/40 underline">
              सामान्य Typing Test पर जाएं
            </button>
          )}
        </div>
      </div>
    );
  }

  const typedSoFar =
    state.words.slice(0, state.wordIndex).join(" ") +
    (state.wordIndex > 0 ? " " : "") +
    state.typed;

  // ── SCREEN 5: Blind typing screen ──
  return (
    <div
      className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8"
      onContextMenu={(e) => e.preventDefault()}
      onClick={refocusHiddenInput}
    >
      <input
        ref={hiddenInputRef}
        tabIndex={-1}
        className="fixed opacity-0 pointer-events-none"
        style={{ top: 0, left: 0, width: 1, height: 1 }}
      />

      <p className="text-center text-xs text-white/40 uppercase tracking-wider">
        {config.fullName} · {LAYOUT_LABELS[activeLayout]} — Backspace:{" "}
        {config.backspaceMode === "full" && "पूरी तरह Allowed"}
        {config.backspaceMode === "none" && "बंद"}
        {config.backspaceMode === "currentWordOnly" && "सिर्फ मौजूदा शब्द तक"}
        {config.backspaceMode === "currentPlusOneWord" && "मौजूदा + 1 पिछला शब्द"}
      </p>
      <button onClick={backToChapterList} className="mx-auto text-xs text-white/30 underline">
        Chapter बदलें
      </button>

      <div className="text-center">
        <p className={`text-3xl font-bold font-mono tabular-nums ${timeColor}`}>{formattedTime}</p>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Passage</p>
        <div
          ref={passageRef}
          className="text-xl text-gray-300 leading-relaxed select-none overflow-y-auto hide-scrollbar flex flex-wrap gap-x-2"
          style={{ fontFamily, maxHeight: "7.5rem" }}
        >
          {state.words.map((word, idx) => (
            <span key={idx} ref={idx === state.wordIndex ? activeWordRef : null}>
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
        <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">आपकी टाइपिंग</p>
        <div
          ref={typedBoxRef}
          className="text-xl text-white leading-relaxed overflow-y-auto hide-scrollbar"
          style={{ fontFamily, maxHeight: "7.5rem" }}
        >
          {typedSoFar}
          <span className="inline-block w-0.5 h-5 bg-white/70 animate-pulse ml-0.5 align-middle" />
        </div>
      </div>

      <button onClick={restartChapter} className="mx-auto text-sm text-gray-500 underline">
        Reset
      </button>
    </div>
  );
}