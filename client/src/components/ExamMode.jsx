import { useEffect, useState, useCallback, useRef } from "react";
import { createInitialState, appendChar, backspace, commitWord, checkTimeout, computeStats } from "../engine/engine";
import { resolvePhysicalKey, resolveAltGrKey } from "../engine/physicalKey";
import { MANGAL_KEYMAP, NUKTA_KEYMAP } from "../layouts/mangal-keymap";
import { KRUTI_EXTENDED_KEYMAP } from "../layouts/krutidev-extended";
import { EXAM_CONFIGS } from "../lessons/examConfig";
import { EXAM_PARAGRAPHS } from "../lessons/examParagraphs";

const IGNORED_KEYS = new Set([
  "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape",
  "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
]);

// Ek chuna hua chapter poore exam-duration tak "loop" karna hai — jitni
// baar zaroorat pade utni baar wahi text dobara jod dete hain, taaki
// 100 WPM tak ke bahut fast typist ke liye bhi text kabhi khatam na ho.
function buildLoopedParagraph(chapterText, durationSeconds) {
  const targetWords = Math.ceil((durationSeconds / 60) * 100);
  const chapterWordCount = chapterText.split(/\s+/).filter(Boolean).length;
  const repeats = Math.max(1, Math.ceil(targetWords / chapterWordCount));

  return Array(repeats).fill(chapterText).join(" ");
}

export default function ExamMode({ onExit }) {
  const [examKey, setExamKey] = useState(null); // "cpct" | "ssc" | "highcourt" | "upsssc" | null
  const [chapterIndex, setChapterIndex] = useState(null); // index into EXAM_PARAGRAPHS[examKey]
  const [state, setState] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const config = examKey ? EXAM_CONFIGS[examKey] : null;
  const chapters = examKey ? EXAM_PARAGRAPHS[examKey] : [];
  const activeChapter = chapterIndex !== null ? chapters[chapterIndex] : null;

  const typedTrackRef = useRef("");
  useEffect(() => {
    typedTrackRef.current = state?.typed ?? "";
  }, [state?.typed]);

  // Passage box ko typing progress ke hisaab se scroll karo (proportional),
  // aur "aapki typing" box ko hamesha neeche (latest text) tak scroll karo.
  const passageRef = useRef(null);
  const typedBoxRef = useRef(null);
  useEffect(() => {
    if (!state) return;
    const typedSoFarLength =
      state.words.slice(0, state.wordIndex).join(" ").length +
      (state.wordIndex > 0 ? 1 : 0) +
      state.typed.length;
    const totalLength = state.words.join(" ").length;

    if (passageRef.current && totalLength > 0) {
      const el = passageRef.current;
      const progress = Math.min(1, typedSoFarLength / totalLength);
      el.scrollTop = progress * (el.scrollHeight - el.clientHeight);
    }
    if (typedBoxRef.current) {
      typedBoxRef.current.scrollTop = typedBoxRef.current.scrollHeight;
    }
  }, [state?.typed, state?.wordIndex]);

  const selectExam = (key) => {
    setExamKey(key);
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

  const exitExam = () => {
    setExamKey(null);
    setChapterIndex(null);
    setState(null);
  };

  // Keyboard input — sirf jab exam active ho
  useEffect(() => {
    if (!config || !state) return;

    function handleKeyDown(e) {
      if (state.finished) return;
      if (IGNORED_KEYS.has(e.key)) return;

      // Copy-paste block — real exam jaisa
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      if (e.code === "Space") {
        setState((prev) => commitWord(prev));
        setNow(Date.now());
        return;
      }
      if (e.code === "Backspace") {
        if (!config.backspaceAllowed) return; // real exam rule
        setState((prev) => backspace(prev));
        return;
      }

      let charToAppend = null;

      if (config.mode === "krutidev" && e.altKey) {
        const base = resolveAltGrKey(e);
        charToAppend = base ? KRUTI_EXTENDED_KEYMAP[base] : null;
      } else if (config.mode === "krutidev") {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, config]);

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

  const fontFamily = config?.mode === "krutidev"
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
              {cfg.fullName} · {Math.round(cfg.durationSeconds / 60)} min ·{" "}
              {cfg.mode === "mangal" ? "Mangal" : "Krutidev"} ·{" "}
              {cfg.backspaceAllowed ? "Backspace allowed" : "Backspace disabled"}
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

  // ── SCREEN 2: Chapter picker (jaise Type Master ke lessons) ──
  if (chapterIndex === null) {
    return (
      <div className="flex flex-col gap-3 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm text-center text-white/60 mb-2">
          {config.label} — ek chapter chuno
        </p>
        {chapters.map((chapter, idx) => {
          const wordCount = chapter.text.split(/\s+/).filter(Boolean).length;
          return (
            <button
              key={idx}
              onClick={() => startChapter(idx)}
              className="text-left px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white"
            >
              <span className="font-medium">
                {idx + 1}. {chapter.title}
              </span>
              <span className="ml-2 text-xs text-white/40">{wordCount} शब्द</span>
            </button>
          );
        })}
        <button onClick={exitExam} className="mx-auto mt-2 text-sm text-white/40 underline">
          ← दूसरा Exam चुनें
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

  // ── SCREEN 3: Result (only shown after finishing) ──
  if (state.finished) {
    const stats = computeStats(state, elapsedMs);
    const netScore = config.scoreMethod === "rsmssb" ? stats.netWpmRSMSSB : stats.netWpmSSC;

    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full py-8">
        <p className="text-sm uppercase tracking-widest text-white/40">
          {config.fullName} · {activeChapter?.title}
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

  // Ab tak type kiya hua poora text — plain, bina kisi color ke (blind mode)
  const typedSoFar =
    state.words.slice(0, state.wordIndex).join(" ") +
    (state.wordIndex > 0 ? " " : "") +
    state.typed;

  // ── SCREEN 4: Blind typing screen (real exam jaisa) ──
  return (
    <div
      className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-8"
      onContextMenu={(e) => e.preventDefault()}
    >
      <p className="text-center text-xs text-white/40 uppercase tracking-wider">
        {config.fullName} · {activeChapter?.title} —{" "}
        {config.backspaceAllowed ? "Backspace allowed" : "Backspace disabled"}
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
          className="text-xl text-gray-300 leading-relaxed select-none overflow-y-auto hide-scrollbar"
          style={{ fontFamily, maxHeight: "7.5rem" }}
        >
          {state.words.join(" ")}
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