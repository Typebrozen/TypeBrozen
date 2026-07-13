import { useState, useEffect, useRef, useCallback } from 'react';

// ── HINDI WORD POOL ──
const HINDI_WORDS = [
  'आम', 'घर', 'पानी', 'खाना', 'काम', 'देश', 'लोग', 'बात', 'हाथ', 'दिन',
  'रात', 'समय', 'जगह', 'साल', 'बच्चा', 'महिला', 'पुरुष', 'सरकार', 'राज्य', 'शहर',
  'गांव', 'स्कूल', 'किताब', 'पढ़ना', 'लिखना', 'खेलना', 'दौड़ना', 'खाना', 'पीना', 'सोना',
  'उठना', 'बैठना', 'चलना', 'आना', 'जाना', 'करना', 'होना', 'देना', 'लेना', 'बोलना',
  'सुनना', 'देखना', 'सोचना', 'समझना', 'जानना', 'मानना', 'चाहना', 'मिलना', 'रहना', 'बनना',
  'नया', 'पुराना', 'बड़ा', 'छोटा', 'अच्छा', 'बुरा', 'सही', 'गलत', 'सुंदर', 'कठिन',
  'आसान', 'तेज', 'धीमा', 'ऊंचा', 'नीचा', 'लंबा', 'चौड़ा', 'गहरा', 'हल्का', 'भारी',
  'भारत', 'दिल्ली', 'मुंबई', 'जयपुर', 'लखनऊ', 'पटना', 'भोपाल', 'रायपुर', 'कोलकाता', 'चेन्नई',
  'नदी', 'पहाड़', 'जंगल', 'समुद्र', 'आकाश', 'धरती', 'हवा', 'आग', 'मिट्टी', 'पत्थर',
  'सूरज', 'चांद', 'तारा', 'बादल', 'बारिश', 'धूप', 'छाया', 'रोशनी', 'अंधेरा', 'शांति',
  'परिवार', 'मां', 'पिता', 'भाई', 'बहन', 'दोस्त', 'गुरु', 'छात्र', 'नेता', 'किसान',
  'डॉक्टर', 'वकील', 'इंजीनियर', 'शिक्षक', 'सैनिक', 'पुलिस', 'नर्स', 'व्यापारी', 'कारीगर', 'मजदूर',
  'स्वास्थ्य', 'शिक्षा', 'विकास', 'प्रगति', 'स्वतंत्रता', 'न्याय', 'सत्य', 'अहिंसा', 'प्रेम', 'करुणा',
  'खुशी', 'दुख', 'क्रोध', 'डर', 'आशा', 'विश्वास', 'साहस', 'धैर्य', 'ईमानदारी', 'मेहनत',
  'सफलता', 'असफलता', 'संघर्ष', 'जीत', 'हार', 'अवसर', 'चुनौती', 'लक्ष्य', 'सपना', 'उड़ान',
];

// ── INSCRIPT KEYBOARD LAYOUT ──
const KEYBOARD_ROWS = [
  [
    { display: 'ौ', key: 'q', shift: 'औ' },
    { display: 'ै', key: 'w', shift: 'ऐ' },
    { display: 'ा', key: 'e', shift: 'आ' },
    { display: 'ी', key: 'r', shift: 'ई' },
    { display: 'ू', key: 't', shift: 'ऊ' },
    { display: 'ब', key: 'y', shift: 'भ' },
    { display: 'ह', key: 'u', shift: 'ङ' },
    { display: 'ग', key: 'i', shift: 'घ' },
    { display: 'द', key: 'o', shift: 'ध' },
    { display: 'ज', key: 'p', shift: 'झ' },
  ],
  [
    { display: 'ो', key: 'a', shift: 'ओ' },
    { display: 'े', key: 's', shift: 'ए' },
    { display: '्', key: 'd', shift: 'अ' },
    { display: 'ि', key: 'f', shift: 'इ' },
    { display: 'ु', key: 'g', shift: 'उ' },
    { display: 'प', key: 'h', shift: 'फ' },
    { display: 'र', key: 'j', shift: 'ड़' },
    { display: 'क', key: 'k', shift: 'ख' },
    { display: 'त', key: 'l', shift: 'थ' },
    { display: 'च', key: ';', shift: 'छ' },
  ],
  [
    { display: 'ं', key: 'z', shift: 'ँ' },
    { display: 'म', key: 'x', shift: 'ण' },
    { display: 'न', key: 'c', shift: 'ञ' },
    { display: 'व', key: 'v', shift: 'ऱ' },
    { display: 'ल', key: 'b', shift: 'ळ' },
    { display: 'स', key: 'n', shift: 'श' },
    { display: 'य', key: 'm', shift: 'ष' },
  ],
];

// Finger color mapping
const FINGER_COLORS = {
  q: '#ef4444', w: '#f97316', e: '#eab308', r: '#22c55e', t: '#22c55e',
  y: '#3b82f6', u: '#3b82f6', i: '#8b5cf6', o: '#ec4899', p: '#ec4899',
  a: '#ef4444', s: '#f97316', d: '#eab308', f: '#22c55e', g: '#22c55e',
  h: '#3b82f6', j: '#3b82f6', k: '#8b5cf6', l: '#ec4899', ';': '#ec4899',
  z: '#ef4444', x: '#f97316', c: '#eab308', v: '#22c55e', b: '#22c55e',
  n: '#3b82f6', m: '#3b82f6',
};

const FINGER_NAMES = {
  '#ef4444': 'Little Finger',
  '#f97316': 'Ring Finger',
  '#eab308': 'Middle Finger',
  '#22c55e': 'Index Finger',
  '#3b82f6': 'Index Finger',
  '#8b5cf6': 'Middle Finger',
  '#ec4899': 'Ring/Little Finger',
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HindiTypingTest({ theme, themeStyles: t }) {
  const [words, setWords] = useState(() => shuffle(HINDI_WORDS).slice(0, 50));
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
      text: 'text-white',
      muted: 'text-zinc-500',
      untyped: 'text-zinc-500',
      correct: 'text-zinc-200',
      incorrect: 'text-red-400',
      current: 'text-yellow-400',
      cursor: '#eab308',
      keyBg: 'bg-zinc-800 border-zinc-700 text-zinc-200',
      keyActive: 'bg-yellow-500 border-yellow-400 text-black',
      keyPressed: 'bg-green-500 border-green-400 text-black',
    };
    if (theme === 'sepia') return {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-[#5a4a2e]',
      muted: 'text-amber-700/50',
      untyped: 'text-amber-700/40',
      correct: 'text-[#5a4a2e]',
      incorrect: 'text-red-500',
      current: 'text-amber-700 font-bold',
      cursor: '#b8860b',
      keyBg: 'bg-amber-100 border-amber-300 text-[#5a4a2e]',
      keyActive: 'bg-amber-500 border-amber-400 text-white',
      keyPressed: 'bg-green-500 border-green-400 text-white',
    };
    return {
      bg: 'bg-white border-gray-200',
      text: 'text-gray-800',
      muted: 'text-gray-400',
      untyped: 'text-gray-300',
      correct: 'text-gray-700',
      incorrect: 'text-red-500',
      current: 'text-blue-600 font-bold',
      cursor: '#3b82f6',
      keyBg: 'bg-gray-100 border-gray-300 text-gray-700',
      keyActive: 'bg-blue-500 border-blue-400 text-white',
      keyPressed: 'bg-green-500 border-green-400 text-white',
    };
  };

  const c = getColors();

  // Find which key to press for next character
  const getNextKey = useCallback(() => {
    const currentWord = words[wordIndex] ?? '';
    if (!currentWord || input.length >= currentWord.length) return null;
    const nextChar = currentWord[input.length];
    for (const row of KEYBOARD_ROWS) {
      for (const key of row) {
        if (key.display === nextChar || key.shift === nextChar) {
          return key.key;
        }
      }
    }
    return null;
  }, [words, wordIndex, input]);

  useEffect(() => {
    setActiveKey(getNextKey());
  }, [getNextKey]);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  // CPM update
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

  // Physical keyboard highlight
  useEffect(() => {
    const handleKeyDown = (e) => {
      setPressedKey(e.key.toLowerCase());
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

      if (isCorrect) {
        setCorrectWords(c => c + 1);
        correctCharsRef.current += currentWord.length + 1;
      } else {
        setIncorrectWords(c => c + 1);
      }

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setInput('');

      if (nextIndex >= words.length) finishTest();
      return;
    }

    setInput(value);
  }, [finished, started, words, wordIndex, finishTest]);

  // Virtual keyboard click
  const handleVirtualKey = (char) => {
    if (finished) return;
    const newInput = input + char;
    handleInput(newInput);
    inputRef.current?.focus();
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setWords(shuffle(HINDI_WORDS).slice(0, 50));
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
          <p className={`text-sm ${c.muted}`}>
            {cpm >= 150 ? '🏆 Excellent! Government exam ready!' :
             cpm >= 100 ? '🔥 Great! Keep practicing!' :
             cpm >= 50 ? '💪 Good progress!' :
             '🌱 Keep practicing daily!'}
          </p>
          <p className={`text-xs mt-1 ${c.muted}`}>
            CPCT/SSC target: 150+ CPM with 90%+ accuracy
          </p>
        </div>

        <button onClick={reset}
          className={`px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 ${theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white'}`}>
          Try Again
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
        <div className="text-2xl leading-loose font-mono select-none flex flex-wrap gap-x-4"
          style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif", lineHeight: '3.5rem', letterSpacing: '0.05em' }}>
          {words.map((word, wIdx) => {
            const isPast = wIdx < wordIndex;
            const isActive = wIdx === wordIndex;
            const status = wordStatuses[wIdx];
            return (
              <span key={wIdx}
                className={`inline-block relative ${isPast && status === 'incorrect' ? 'underline decoration-red-500 decoration-2' : ''} ${isActive ? 'relative' : ''}`}>
                {word.split('').map((char, cIdx) => {
                  let color = c.untyped;
                  if (isPast) color = status === 'correct' ? c.correct : c.incorrect;
                  else if (isActive) {
                    if (cIdx < input.length) {
                      color = input[cIdx] === char ? c.correct : c.incorrect;
                    } else if (cIdx === input.length) {
                      color = c.current;
                    }
                  }
                  const showCursor = isActive && cIdx === input.length;
                  return (
                    <span key={cIdx} className={`${color} relative inline-block`}>
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

      <input ref={inputRef} value={input}
        onChange={e => handleInput(e.target.value)}
        disabled={finished}
        className="opacity-0 absolute pointer-events-none"
        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />

      {/* Next key hint */}
      {activeKey && started && !finished && (
        <div className="text-center">
          <span className={`text-xs ${c.muted}`}>
            Press: <kbd className={`px-2 py-0.5 rounded text-xs font-mono border ${c.bg}`}
              style={{ color: FINGER_COLORS[activeKey] }}>
              {activeKey.toUpperCase()}
            </kbd>
            <span className="ml-2" style={{ color: FINGER_COLORS[activeKey] }}>
              ({FINGER_NAMES[FINGER_COLORS[activeKey]]})
            </span>
          </span>
        </div>
      )}

      {/* Virtual Keyboard Toggle */}
      <div className="flex justify-center">
        <button onClick={() => setShowKeyboard(!showKeyboard)}
          className={`px-4 py-1.5 rounded-lg text-xs transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
          {showKeyboard ? '⌨️ Hide Keyboard' : '⌨️ Show Keyboard'}
        </button>
      </div>

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <div className={`rounded-2xl p-4 border ${c.bg}`}>
          <p className={`text-xs text-center mb-3 ${c.muted}`}>
            Inscript Keyboard Layout — Click or use physical keyboard
          </p>
          <div className="flex flex-col gap-2 items-center">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1 flex-wrap justify-center">
                {row.map((keyData) => {
                  const isActive = activeKey === keyData.key;
                  const isPressed = pressedKey === keyData.key;
                  const fingerColor = FINGER_COLORS[keyData.key];
                  return (
                    <button
                      key={keyData.key}
                      onClick={() => handleVirtualKey(keyData.display)}
                      className={`w-12 h-12 rounded-lg text-sm border-2 transition-all font-mono flex flex-col items-center justify-center relative
                        ${isPressed ? c.keyPressed : isActive ? c.keyActive : c.keyBg}
                        hover:scale-110`}
                      style={{
                        borderColor: isActive || isPressed ? undefined : fingerColor + '60',
                        boxShadow: isActive ? `0 0 12px ${fingerColor}` : undefined,
                      }}
                    >
                      <span className="text-xs opacity-50">{keyData.shift}</span>
                      <span className="text-base leading-none"
                        style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>
                        {keyData.display}
                      </span>
                      <span className="text-[8px] opacity-30 absolute bottom-0.5">
                        {keyData.key.toUpperCase()}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Space bar */}
            <button
              onClick={() => handleInput(input + ' ')}
              className={`w-48 h-10 rounded-lg text-xs border-2 transition-all ${c.keyBg} hover:scale-105`}>
              Space (अगला शब्द)
            </button>
          </div>

          {/* Finger color legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            {[
              { color: '#ef4444', name: 'Little', hindi: 'छोटी' },
              { color: '#f97316', name: 'Ring', hindi: 'अनामिका' },
              { color: '#eab308', name: 'Middle', hindi: 'मध्यमा' },
              { color: '#22c55e', name: 'Index L', hindi: 'तर्जनी बाईं' },
              { color: '#3b82f6', name: 'Index R', hindi: 'तर्जनी दाईं' },
            ].map(f => (
              <div key={f.color} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                <span className={`text-xs ${c.muted}`}>{f.hindi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={`text-center text-xs ${c.muted}`}>
        Click here or start typing — press space after each word
      </p>
      <button onClick={reset} className={`mx-auto text-sm ${c.muted}`}>Reset</button>
    </div>
  );
}