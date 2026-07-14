import { useState, useEffect, useRef, useCallback } from 'react';
import { HINDI_PARAGRAPHS } from "../lessons/HindiParagraphs";

// ── HINDI FONT STYLE ──
const HINDI_FONT = {
  fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif",
  fontWeight: 500,
};

// ── GRAPHEME SPLITTER ──
const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
function splitHindi(word) {
  if (!word) return [];
  return [...segmenter.segment(word)].map(s => s.segment);
}

// ── FINGER COLORS ──
const FINGER_COLORS = {
  q: '#ef4444', a: '#ef4444', z: '#ef4444',
  w: '#f97316', s: '#f97316', x: '#f97316',
  e: '#eab308', d: '#eab308', c: '#eab308',
  r: '#22c55e', f: '#22c55e', v: '#22c55e', t: '#22c55e', g: '#22c55e', b: '#22c55e',
  y: '#3b82f6', h: '#3b82f6', n: '#3b82f6', u: '#3b82f6', j: '#3b82f6', m: '#3b82f6',
  i: '#8b5cf6', k: '#8b5cf6',
  o: '#ec4899', l: '#ec4899',
  p: '#f43f5e', ';': '#f43f5e',
};

// ── FULL INSCRIPT KEYBOARD LAYOUT (all 4 rows like real keyboard) ──
const KEYBOARD_LAYOUT = [
  // Number row
  [
    { key: '`',  hi: '',   shift: '' },
    { key: '1',  hi: '१',  shift: '!' },
    { key: '2',  hi: '२',  shift: '@' },
    { key: '3',  hi: '३',  shift: '#' },
    { key: '4',  hi: '४',  shift: '$' },
    { key: '5',  hi: '५',  shift: '%' },
    { key: '6',  hi: '६',  shift: '^' },
    { key: '7',  hi: '७',  shift: '&' },
    { key: '8',  hi: '८',  shift: '*' },
    { key: '9',  hi: '९',  shift: '(' },
    { key: '0',  hi: '०',  shift: ')' },
    { key: '-',  hi: '-',  shift: '_' },
    { key: '=',  hi: '=',  shift: '+' },
    { key: 'BKSP', hi: '←', shift: '', wide: true },
  ],
  // QWERTY row
  [
    { key: 'TAB', hi: 'Tab', shift: '', wide: true },
    { key: 'q',  hi: 'ौ',  shift: 'औ' },
    { key: 'w',  hi: 'ै',  shift: 'ऐ' },
    { key: 'e',  hi: 'ा',  shift: 'आ' },
    { key: 'r',  hi: 'ी',  shift: 'ई' },
    { key: 't',  hi: 'ू',  shift: 'ऊ' },
    { key: 'y',  hi: 'ब',  shift: 'भ' },
    { key: 'u',  hi: 'ह',  shift: 'ङ' },
    { key: 'i',  hi: 'ग',  shift: 'घ' },
    { key: 'o',  hi: 'द',  shift: 'ध' },
    { key: 'p',  hi: 'ज',  shift: 'झ' },
    { key: '[',  hi: 'ड',  shift: 'ढ' },
    { key: ']',  hi: '़',  shift: 'ञ' },
    { key: '\\', hi: 'ऑ',  shift: 'ऑ' },
  ],
  // Home row
  [
    { key: 'CAPS', hi: 'Caps', shift: '', wide: true },
    { key: 'a',  hi: 'ो',  shift: 'ओ' },
    { key: 's',  hi: 'े',  shift: 'ए' },
    { key: 'd',  hi: '्',  shift: 'अ' },
    { key: 'f',  hi: 'ि',  shift: 'इ' },
    { key: 'g',  hi: 'ु',  shift: 'उ' },
    { key: 'h',  hi: 'प',  shift: 'फ' },
    { key: 'j',  hi: 'र',  shift: 'ड़' },
    { key: 'k',  hi: 'क',  shift: 'ख' },
    { key: 'l',  hi: 'त',  shift: 'थ' },
    { key: ';',  hi: 'च',  shift: 'छ' },
    { key: "'",  hi: 'ट',  shift: 'ठ' },
    { key: 'ENTER', hi: 'Enter', shift: '', wide: true },
  ],
  // Shift row
  [
    { key: 'SHIFT', hi: 'Shift', shift: '', wide: true },
    { key: 'z',  hi: 'ं',  shift: 'ँ' },
    { key: 'x',  hi: 'म',  shift: 'ण' },
    { key: 'c',  hi: 'न',  shift: 'ञ' },
    { key: 'v',  hi: 'व',  shift: 'ऱ' },
    { key: 'b',  hi: 'ल',  shift: 'ळ' },
    { key: 'n',  hi: 'स',  shift: 'श' },
    { key: 'm',  hi: 'य',  shift: 'ष' },
    { key: ',',  hi: ',',  shift: 'ण' },
    { key: '.',  hi: '।',  shift: 'ॉ' },
    { key: '/',  hi: 'य',  shift: '?' },
    { key: 'SHIFT2', hi: 'Shift', shift: '', wide: true },
  ],
];

export default function HindiTypingTest({ theme, themeStyles: t }) {
  const [words, setWords] = useState(() => {
    const paragraph = HINDI_PARAGRAPHS[Math.floor(Math.random() * HINDI_PARAGRAPHS.length)];
    return paragraph.split(' ');
  });
  const [input, setInput] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [wordStatuses, setWordStatuses] = useState({});
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedTime, setSelectedTime] = useState(60);
  const [cpm, setCpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [activeKey, setActiveKey] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [pressedKey, setPressedKey] = useState(null);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const correctCharsRef = useRef(0);

  const TIME_OPTIONS = [1, 2, 3, 5, 10];

  const getColors = () => {
    if (theme === 'dark') return {
      bg: 'bg-zinc-900 border-zinc-800',
      keyboardBg: '#18181b',
      text: 'text-white',
      muted: 'text-zinc-500',
      untyped: 'text-zinc-500',
      correct: 'text-zinc-200',
      incorrect: 'text-red-400',
      current: 'text-yellow-400',
      cursor: '#eab308',
      keyBg: '#27272a',
      keyBorder: '#3f3f46',
      keyText: '#e4e4e7',
      keyWideBg: '#1f1f23',
    };
    if (theme === 'sepia') return {
      bg: 'bg-amber-50 border-amber-200',
      keyboardBg: '#fdf6e3',
      text: 'text-[#5a4a2e]',
      muted: 'text-amber-700/50',
      untyped: 'text-amber-700/40',
      correct: 'text-[#5a4a2e]',
      incorrect: 'text-red-500',
      current: 'text-amber-700 font-bold',
      cursor: '#b8860b',
      keyBg: '#fef3c7',
      keyBorder: '#d97706',
      keyText: '#5a4a2e',
      keyWideBg: '#fde68a',
    };
    return {
      bg: 'bg-white border-gray-200',
      keyboardBg: '#f3f4f6',
      text: 'text-gray-800',
      muted: 'text-gray-400',
      untyped: 'text-gray-300',
      correct: 'text-gray-700',
      incorrect: 'text-red-500',
      current: 'text-blue-600 font-bold',
      cursor: '#3b82f6',
      keyBg: '#ffffff',
      keyBorder: '#d1d5db',
      keyText: '#374151',
      keyWideBg: '#e5e7eb',
    };
  };

  const c = getColors();

  // Find next key to press
  const getNextKey = useCallback(() => {
    const currentWord = words[wordIndex] ?? '';
    if (!currentWord || input.length >= currentWord.length) return null;
    const nextChar = currentWord[input.length];
    for (const row of KEYBOARD_LAYOUT) {
      for (const keyData of row) {
        if (keyData.hi === nextChar || keyData.shift === nextChar) return keyData.key;
      }
    }
    return null;
  }, [words, wordIndex, input]);

  useEffect(() => { setActiveKey(getNextKey()); }, [getNextKey]);

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (!started || finished || !startTimeRef.current) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
      if (elapsed > 0) {
        setCpm(Math.round(correctCharsRef.current / elapsed));
        const total = correctWords + incorrectWords;
        setAccuracy(total === 0 ? 100 : Math.round((correctWords / total) * 100));
      }
    }, 500);
    return () => clearInterval(interval);
  }, [started, finished, correctWords, incorrectWords]);

  // Track physical key presses for highlight
  useEffect(() => {
    const handleKeyDown = (e) => {
      const k = e.key.toLowerCase();
      setPressedKey(k);
      setTimeout(() => setPressedKey(null), 200);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current);
    setFinished(true);
    setStarted(false);
  }, []);

  const handleInput = useCallback((value) => {
    if (finished) return;
    if (!started && value.length > 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }
    const currentWord = words[wordIndex] ?? '';
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const isCorrect = typedWord === currentWord;
      setWordStatuses(prev => ({ ...prev, [wordIndex]: isCorrect ? 'correct' : 'incorrect' }));
      if (isCorrect) { setCorrectWords(c => c + 1); correctCharsRef.current += currentWord.length + 1; }
      else setIncorrectWords(c => c + 1);
      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setInput('');
      if (nextIndex >= words.length) finishTest();
      return;
    }
    setInput(value);
  }, [finished, started, words, wordIndex, finishTest]);

  const reset = () => {
    clearInterval(timerRef.current);
    const paragraph = HINDI_PARAGRAPHS[Math.floor(Math.random() * HINDI_PARAGRAPHS.length)];
    setWords(paragraph.split(' '));
    setInput('');
    setWordIndex(0);
    setWordStatuses({});
    setCorrectWords(0);
    setIncorrectWords(0);
    setStarted(false);
    setFinished(false);
    setTimeLeft(selectedTime);
    setCpm(0);
    setAccuracy(100);
    correctCharsRef.current = 0;
    startTimeRef.current = null;
  };

  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  // ── RESULTS ──
  if (finished) {
    const wpm = Math.round(cpm / 5);
    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full py-8">
        <div className="text-center">
          <p className={`text-8xl font-bold tabular-nums ${c.text}`}>{cpm}</p>
          <p className={`text-xs uppercase tracking-widest mt-2 ${c.muted}`}>Characters Per Minute</p>
        </div>
        <div className="flex gap-6 flex-wrap justify-center">
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className={`text-4xl font-bold ${c.text}`}>{wpm}</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>WPM (approx)</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className={`text-4xl font-bold ${c.text}`}>{accuracy}%</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Accuracy</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className={`text-4xl font-bold text-green-400`}>{correctWords}</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Correct Words</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className={`text-4xl font-bold text-red-400`}>{incorrectWords}</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Wrong Words</p>
          </div>
        </div>
        <div className={`w-full p-4 rounded-2xl border text-center ${c.bg}`}>
          <p className={`text-sm ${c.muted}`} style={HINDI_FONT}>
            {cpm >= 150 ? '🏆 शानदार! सरकारी परीक्षा के लिए तैयार!' :
             cpm >= 100 ? '🔥 बहुत अच्छा! अभ्यास जारी रखें!' :
             cpm >= 50 ? '💪 अच्छी प्रगति!' : '🌱 रोज अभ्यास करते रहें!'}
          </p>
          <p className={`text-xs mt-1 ${c.muted}`}>CPCT/SSC target: 150+ CPM with 90%+ accuracy</p>
        </div>
        <button onClick={reset}
          className={`px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 ${theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white'}`}
          style={HINDI_FONT}>
          फिर से कोशिश करें
        </button>
      </div>
    );
  }

  // ── TYPING AREA ──
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-4">

      {/* Time Options */}
      <div className="flex justify-center gap-2 flex-wrap">
        {TIME_OPTIONS.map(min => (
          <button key={min}
            onClick={() => { setSelectedTime(min * 60); setTimeLeft(min * 60); reset(); }}
            className={`px-3 py-1 rounded-lg text-xs transition-all ${selectedTime === min * 60
              ? theme === 'dark' ? 'bg-white/20 text-white' : 'bg-gray-800 text-white'
              : theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
            {min} min
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-10">
        <div className="text-center">
          <p className={`text-3xl font-bold font-mono tabular-nums ${timeLeft <= 10 ? 'text-red-400' : timeLeft <= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
            {formattedTime}
          </p>
          <p className={`text-xs uppercase ${c.muted}`}>Time</p>
        </div>
        <div className="text-center">
          <p className={`text-3xl font-bold ${c.text}`}>{cpm}</p>
          <p className={`text-xs uppercase ${c.muted}`}>CPM</p>
        </div>
        <div className="text-center">
          <p className={`text-3xl font-bold ${accuracy < 80 ? 'text-red-400' : accuracy < 95 ? 'text-yellow-400' : 'text-green-400'}`}>
            {accuracy}%
          </p>
          <p className={`text-xs uppercase ${c.muted}`}>Accuracy</p>
        </div>
      </div>

      {/* Text Display */}
      <div ref={containerRef}
        className={`h-48 overflow-hidden rounded-2xl p-6 border cursor-text ${c.bg}`}
        onClick={() => inputRef.current?.focus()}>
        <div className="text-2xl select-none flex flex-wrap gap-x-4"
          style={{ ...HINDI_FONT, lineHeight: '3.8rem' }}>
          {words.map((word, wIdx) => {
            const isPast = wIdx < wordIndex;
            const isActive = wIdx === wordIndex;
            const status = wordStatuses[wIdx];
            const graphemes = splitHindi(word);
            const inputGraphemes = splitHindi(input);
            return (
              <span key={wIdx}
                className={`inline-block relative ${isPast && status === 'incorrect' ? 'underline decoration-red-500 decoration-2' : ''}`}>
                {graphemes.map((char, cIdx) => {
                  let colorClass = c.untyped;
                  if (isPast) colorClass = status === 'correct' ? c.correct : c.incorrect;
                  else if (isActive) {
                    if (cIdx < inputGraphemes.length)
                      colorClass = inputGraphemes[cIdx] === char ? c.correct : c.incorrect;
                    else if (cIdx === inputGraphemes.length) colorClass = c.current;
                  }
                  const showCursor = isActive && cIdx === inputGraphemes.length;
                  return (
                    <span key={cIdx} className={`${colorClass} relative`}>
                      {showCursor && (
                        <span className="absolute -left-0.5 top-0 bottom-0 w-0.5"
                          style={{ backgroundColor: c.cursor, animation: 'blinkCursor 1s step-end infinite' }} />
                      )}
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>

      {/* Hidden input — physical keyboard types here */}
      <input ref={inputRef} value={input}
        onChange={e => handleInput(e.target.value)}
        disabled={finished}
        className="opacity-0 absolute pointer-events-none"
        lang="hi"
        inputMode="text" />

      {/* Keyboard Toggle */}
      <div className="flex justify-center">
        <button onClick={() => setShowKeyboard(!showKeyboard)}
          className={`px-4 py-1.5 rounded-lg text-xs transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
          {showKeyboard ? '⌨️ Hide Keyboard' : '⌨️ Show Keyboard'}
        </button>
      </div>

      {/* ── VISUAL KEYBOARD — display only, no click to type ── */}
      {showKeyboard && (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: c.keyboardBg, borderColor: c.keyBorder }}>
          <p className={`text-xs text-center mb-3 ${c.muted}`}>
            Inscript Hindi Keyboard — अपनी उंगलियों की स्थिति देखें
          </p>

          <div className="flex flex-col gap-1.5 items-center">
            {KEYBOARD_LAYOUT.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1">
                {row.map((keyData) => {
                  const isActive = activeKey === keyData.key;
                  const isPressed = pressedKey === keyData.key;
                  const fingerColor = FINGER_COLORS[keyData.key] || '#6b7280';
                  const isWide = keyData.wide;
                  const isFnKey = ['TAB','CAPS','SHIFT','SHIFT2','BKSP','ENTER'].includes(keyData.key);

                  let bgColor = c.keyBg;
                  let borderColor = fingerColor + '70';
                  let textColor = c.keyText;
                  let shadow = 'none';

                  if (isPressed) {
                    bgColor = '#22c55e';
                    borderColor = '#16a34a';
                    textColor = '#fff';
                    shadow = '0 0 8px #22c55e';
                  } else if (isActive) {
                    bgColor = fingerColor;
                    borderColor = fingerColor;
                    textColor = '#fff';
                    shadow = `0 0 14px ${fingerColor}`;
                  } else if (isFnKey) {
                    bgColor = c.keyWideBg;
                    borderColor = c.keyBorder;
                  }

                  return (
                    <div
                      key={keyData.key}
                      style={{
                        backgroundColor: bgColor,
                        border: `1.5px solid ${borderColor}`,
                        color: textColor,
                        boxShadow: shadow,
                        width: isWide ? (keyData.key === 'BKSP' ? '72px' : keyData.key === 'ENTER' ? '80px' : keyData.key === 'SHIFT' || keyData.key === 'SHIFT2' ? '88px' : '60px') : '40px',
                        height: '44px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.1s',
                        cursor: 'default',
                        userSelect: 'none',
                      }}
                    >
                      {isFnKey ? (
                        <span style={{ fontSize: '9px', opacity: 0.7, fontFamily: 'monospace' }}>{keyData.hi}</span>
                      ) : (
                        <>
                          {/* Shift label top */}
                          <span style={{ fontSize: '8px', opacity: 0.5, lineHeight: 1, ...HINDI_FONT }}>
                            {keyData.shift}
                          </span>
                          {/* Main Hindi label */}
                          <span style={{ fontSize: '13px', lineHeight: 1, ...HINDI_FONT }}>
                            {keyData.hi}
                          </span>
                          {/* Physical key label bottom */}
                          <span style={{ fontSize: '7px', opacity: 0.3, position: 'absolute', bottom: '2px', fontFamily: 'monospace' }}>
                            {keyData.key.toUpperCase()}
                          </span>
                        </>
                      )}
                      {/* Finger color dot */}
                      {!isFnKey && !isActive && !isPressed && (
                        <div style={{
                          position: 'absolute', top: '2px', right: '2px',
                          width: '4px', height: '4px', borderRadius: '50%',
                          backgroundColor: fingerColor, opacity: 0.8,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Spacebar row */}
            <div className="flex gap-1 items-center">
              <div style={{ width: '60px', height: '36px', backgroundColor: c.keyWideBg, border: `1.5px solid ${c.keyBorder}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>Ctrl</span>
              </div>
              <div style={{ width: '40px', height: '36px', backgroundColor: c.keyWideBg, border: `1.5px solid ${c.keyBorder}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>Alt</span>
              </div>
              <div style={{
                width: '260px', height: '36px',
                backgroundColor: pressedKey === ' ' ? '#22c55e' : c.keyBg,
                border: `1.5px solid ${pressedKey === ' ' ? '#16a34a' : c.keyBorder}`,
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'default', transition: 'all 0.1s',
                boxShadow: pressedKey === ' ' ? '0 0 8px #22c55e' : 'none',
              }}>
                <span style={{ fontSize: '9px', opacity: 0.5, fontFamily: 'monospace', color: c.keyText }}>SPACE — अगला शब्द</span>
              </div>
              <div style={{ width: '40px', height: '36px', backgroundColor: c.keyWideBg, border: `1.5px solid ${c.keyBorder}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>Alt</span>
              </div>
              <div style={{ width: '60px', height: '36px', backgroundColor: c.keyWideBg, border: `1.5px solid ${c.keyBorder}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }}>
                <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>Ctrl</span>
              </div>
            </div>
          </div>

          {/* Finger color legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            {[
              { color: '#ef4444', hindi: 'छोटी' },
              { color: '#f97316', hindi: 'अनामिका' },
              { color: '#eab308', hindi: 'मध्यमा' },
              { color: '#22c55e', hindi: 'तर्जनी बाईं' },
              { color: '#3b82f6', hindi: 'तर्जनी दाईं' },
              { color: '#8b5cf6', hindi: 'मध्यमा दाईं' },
              { color: '#ec4899', hindi: 'अनामिका दाईं' },
            ].map(f => (
              <div key={f.color} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                <span className={`text-xs ${c.muted}`} style={HINDI_FONT}>{f.hindi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={`text-center text-xs ${c.muted}`}>
        💡 Physical keyboard se type karo — keyboard pe next key highlight hogi
      </p>
      <button onClick={reset} className={`mx-auto text-sm ${c.muted}`}>Reset</button>
    </div>
  );
}