import { useState, useEffect, useRef, useCallback } from 'react';
import { HINDI_PARAGRAPHS, KRUTIDEV_PARAGRAPHS } from "../lessons/HindiParagraphs";

// ── FONT STYLES ──
const MANGAL_FONT = {
  fontFamily: "'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', sans-serif",
  fontWeight: 500,
};
const KRUTIDEV_FONT = {
  fontFamily: "'KrutiDev', serif",
  fontWeight: 400,
};

// ── INSCRIPT MAP: English key → Hindi Unicode character ──
const INSCRIPT_MAP = {
  'q':'ौ','Q':'औ','w':'ै','W':'ऐ','e':'ा','E':'आ','r':'ी','R':'ई',
  't':'ू','T':'ऊ','y':'ब','Y':'भ','u':'ह','U':'ङ','i':'ग','I':'घ',
  'o':'द','O':'ध','p':'ज','P':'झ','[':'ड','{':'ढ',']':'ञ','}':'ञ',
  '\\':'ऑ','|':'ऑ','a':'ो','A':'ओ','s':'े','S':'ए','d':'्','D':'अ',
  'f':'ि','F':'इ','g':'ु','G':'उ','h':'प','H':'फ','j':'र','J':'ड़',
  'k':'क','K':'ख','l':'त','L':'थ',';':'च',':':'छ',"'":'ट','"':'ठ',
  'z':'ं','Z':'ँ','x':'म','X':'ण','c':'न','C':'ञ','v':'व','V':'ऱ',
  'b':'ल','B':'ळ','n':'स','N':'श','m':'य','M':'ष',',':',','<':'ण',
  '.':'।','>':'ॉ','/':'/','?':'?',
  '1':'१','2':'२','3':'३','4':'४','5':'५',
  '6':'६','7':'७','8':'८','9':'९','0':'०',
};

// ── KRUTIDEV MAP: English key → Krutidev ASCII character ──
// In Krutidev, the key pressed IS the character stored in KRUTIDEV_PARAGRAPHS
const KRUTIDEV_MAP = {
  'a':'a','b':'b','c':'c','d':'d','e':'e','f':'f','g':'g','h':'h',
  'i':'i','j':'j','k':'k','l':'l','m':'m','n':'n','o':'o','p':'p',
  'q':'q','r':'r','s':'s','t':'t','u':'u','v':'v','w':'w','x':'x',
  'y':'y','z':'z',
  'A':'A','B':'B','C':'C','D':'D','E':'E','F':'F','G':'G','H':'H',
  'I':'I','J':'J','K':'K','L':'L','M':'M','N':'N','O':'O','P':'P',
  'Q':'Q','R':'R','S':'S','T':'T','U':'U','V':'V','W':'W','X':'X',
  'Y':'Y','Z':'Z',
  '1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9','0':'0',
  ';':';',':':':','\'':'\'','"':'"',',':',','<':'<','.':'>','/':'/','?':'?',
  '[':'[','{':'{',']':']','}':'}','\\':'\\','|':'|','`':'`','~':'~',
  '-':'-','_':'_','=':'=','+':'+',
};

// ── FINGER COLORS ──
const FINGER_COLORS = {
  q:'#ef4444',a:'#ef4444',z:'#ef4444',
  w:'#f97316',s:'#f97316',x:'#f97316',
  e:'#eab308',d:'#eab308',c:'#eab308',
  r:'#22c55e',f:'#22c55e',v:'#22c55e',t:'#22c55e',g:'#22c55e',b:'#22c55e',
  y:'#3b82f6',h:'#3b82f6',n:'#3b82f6',u:'#3b82f6',j:'#3b82f6',m:'#3b82f6',
  i:'#8b5cf6',k:'#8b5cf6',
  o:'#ec4899',l:'#ec4899',
  p:'#f43f5e',';':'#f43f5e',
};

// ── INSCRIPT KEYBOARD LAYOUT ──
const INSCRIPT_LAYOUT = [
  [
    {key:'`',hi:'',shift:''},{key:'1',hi:'१',shift:'!'},{key:'2',hi:'२',shift:'@'},
    {key:'3',hi:'३',shift:'#'},{key:'4',hi:'४',shift:'$'},{key:'5',hi:'५',shift:'%'},
    {key:'6',hi:'६',shift:'^'},{key:'7',hi:'७',shift:'&'},{key:'8',hi:'८',shift:'*'},
    {key:'9',hi:'९',shift:'('},{key:'0',hi:'०',shift:')'},{key:'-',hi:'-',shift:'_'},
    {key:'=',hi:'=',shift:'+'},{key:'BKSP',hi:'⌫',shift:'',wide:true},
  ],
  [
    {key:'TAB',hi:'Tab',shift:'',wide:true},
    {key:'q',hi:'ौ',shift:'औ'},{key:'w',hi:'ै',shift:'ऐ'},{key:'e',hi:'ा',shift:'आ'},
    {key:'r',hi:'ी',shift:'ई'},{key:'t',hi:'ू',shift:'ऊ'},{key:'y',hi:'ब',shift:'भ'},
    {key:'u',hi:'ह',shift:'ङ'},{key:'i',hi:'ग',shift:'घ'},{key:'o',hi:'द',shift:'ध'},
    {key:'p',hi:'ज',shift:'झ'},{key:'[',hi:'ड',shift:'ढ'},{key:']',hi:'ञ',shift:'ञ'},
    {key:'\\',hi:'ऑ',shift:'ऑ'},
  ],
  [
    {key:'CAPS',hi:'Caps',shift:'',wide:true},
    {key:'a',hi:'ो',shift:'ओ'},{key:'s',hi:'े',shift:'ए'},{key:'d',hi:'्',shift:'अ'},
    {key:'f',hi:'ि',shift:'इ'},{key:'g',hi:'ु',shift:'उ'},{key:'h',hi:'प',shift:'फ'},
    {key:'j',hi:'र',shift:'ड़'},{key:'k',hi:'क',shift:'ख'},{key:'l',hi:'त',shift:'थ'},
    {key:';',hi:'च',shift:'छ'},{key:"'",hi:'ट',shift:'ठ'},
    {key:'ENTER',hi:'Enter',shift:'',wide:true},
  ],
  [
    {key:'SHIFT',hi:'Shift',shift:'',wide:true},
    {key:'z',hi:'ं',shift:'ँ'},{key:'x',hi:'म',shift:'ण'},{key:'c',hi:'न',shift:'ञ'},
    {key:'v',hi:'व',shift:'ऱ'},{key:'b',hi:'ल',shift:'ळ'},{key:'n',hi:'स',shift:'श'},
    {key:'m',hi:'य',shift:'ष'},{key:',',hi:',',shift:'ण'},{key:'.',hi:'।',shift:'ॉ'},
    {key:'/',hi:'/',shift:'?'},{key:'SHIFT2',hi:'Shift',shift:'',wide:true},
  ],
];

// ── KRUTIDEV KEYBOARD LAYOUT ──
const KRUTIDEV_LAYOUT = [
  [
    {key:'`',hi:'~',shift:'~'},{key:'1',hi:'1',shift:'!'},{key:'2',hi:'2',shift:'@'},
    {key:'3',hi:'3',shift:'#'},{key:'4',hi:'4',shift:'$'},{key:'5',hi:'5',shift:'%'},
    {key:'6',hi:'6',shift:'^'},{key:'7',hi:'7',shift:'&'},{key:'8',hi:'8',shift:'*'},
    {key:'9',hi:'9',shift:'('},{key:'0',hi:'0',shift:')'},{key:'-',hi:'-',shift:'_'},
    {key:'=',hi:'=',shift:'+'},{key:'BKSP',hi:'⌫',shift:'',wide:true},
  ],
  [
    {key:'TAB',hi:'Tab',shift:'',wide:true},
    {key:'q',hi:'q',shift:'Q'},{key:'w',hi:'w',shift:'W'},{key:'e',hi:'e',shift:'E'},
    {key:'r',hi:'r',shift:'R'},{key:'t',hi:'t',shift:'T'},{key:'y',hi:'y',shift:'Y'},
    {key:'u',hi:'u',shift:'U'},{key:'i',hi:'i',shift:'I'},{key:'o',hi:'o',shift:'O'},
    {key:'p',hi:'p',shift:'P'},{key:'[',hi:'[',shift:'{'},{key:']',hi:']',shift:'}'},
    {key:'\\',hi:'\\',shift:'|'},
  ],
  [
    {key:'CAPS',hi:'Caps',shift:'',wide:true},
    {key:'a',hi:'a',shift:'A'},{key:'s',hi:'s',shift:'S'},{key:'d',hi:'d',shift:'D'},
    {key:'f',hi:'f',shift:'F'},{key:'g',hi:'g',shift:'G'},{key:'h',hi:'h',shift:'H'},
    {key:'j',hi:'j',shift:'J'},{key:'k',hi:'k',shift:'K'},{key:'l',hi:'l',shift:'L'},
    {key:';',hi:';',shift:':'},{key:"'",hi:"'",shift:'"'},
    {key:'ENTER',hi:'Enter',shift:'',wide:true},
  ],
  [
    {key:'SHIFT',hi:'Shift',shift:'',wide:true},
    {key:'z',hi:'z',shift:'Z'},{key:'x',hi:'x',shift:'X'},{key:'c',hi:'c',shift:'C'},
    {key:'v',hi:'v',shift:'V'},{key:'b',hi:'b',shift:'B'},{key:'n',hi:'n',shift:'N'},
    {key:'m',hi:'m',shift:'M'},{key:',',hi:',',shift:'<'},{key:'.',hi:'.',shift:'>'},
    {key:'/',hi:'/',shift:'?'},{key:'SHIFT2',hi:'Shift',shift:'',wide:true},
  ],
];

export default function HindiTypingTest({ theme, themeStyles: t }) {
  const [fontMode, setFontMode] = useState('mangal');
  const [words, setWords] = useState(() => {
    const p = HINDI_PARAGRAPHS[Math.floor(Math.random() * HINDI_PARAGRAPHS.length)];
    return p.split(' ');
  });
  const [typed, setTyped] = useState('');       // raw chars user pressed (converted)
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
  const [nextKey, setNextKey] = useState(null);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [pressedKey, setPressedKey] = useState(null);
  const [needsShift, setNeedsShift] = useState(false);
  const [spaceNeeded, setSpaceNeeded] = useState(false);

  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const correctCharsRef = useRef(0);
  const containerRef = useRef(null);

  const TIME_OPTIONS = [1, 2, 3, 5, 10];
  const ACTIVE_FONT = fontMode === 'krutidev' ? KRUTIDEV_FONT : MANGAL_FONT;
  const KEYBOARD_LAYOUT = fontMode === 'krutidev' ? KRUTIDEV_LAYOUT : INSCRIPT_LAYOUT;
  const ACTIVE_MAP = fontMode === 'krutidev' ? KRUTIDEV_MAP : INSCRIPT_MAP;

  const getColors = () => {
    if (theme === 'dark') return {
      bg:'bg-zinc-900 border-zinc-800',keyboardBg:'#18181b',text:'text-white',
      muted:'text-zinc-500',untyped:'text-zinc-500',correct:'text-zinc-200',
      incorrect:'text-red-400',current:'text-yellow-400',cursor:'#eab308',
      keyBg:'#27272a',keyBorder:'#3f3f46',keyText:'#e4e4e7',keyWideBg:'#1f1f23',
    };
    if (theme === 'sepia') return {
      bg:'bg-amber-50 border-amber-200',keyboardBg:'#fdf6e3',text:'text-[#5a4a2e]',
      muted:'text-amber-700/50',untyped:'text-amber-700/40',correct:'text-[#5a4a2e]',
      incorrect:'text-red-500',current:'text-amber-700 font-bold',cursor:'#b8860b',
      keyBg:'#fef3c7',keyBorder:'#d97706',keyText:'#5a4a2e',keyWideBg:'#fde68a',
    };
    return {
      bg:'bg-white border-gray-200',keyboardBg:'#f3f4f6',text:'text-gray-800',
      muted:'text-gray-400',untyped:'text-gray-300',correct:'text-gray-700',
      incorrect:'text-red-500',current:'text-blue-600 font-bold',cursor:'#3b82f6',
      keyBg:'#ffffff',keyBorder:'#d1d5db',keyText:'#374151',keyWideBg:'#e5e7eb',
    };
  };
  const c = getColors();

  // ── FIND NEXT KEY TO HIGHLIGHT ──
  const updateNextKey = useCallback((currentTyped, currentWordIndex, currentWords) => {
    const word = currentWords[currentWordIndex] ?? '';

    // Word complete — highlight space
    if (currentTyped.length >= word.length && word !== '') {
      setNextKey('SPACE');
      setNeedsShift(false);
      setSpaceNeeded(true);
      return;
    }

    setSpaceNeeded(false);
    if (!word) { setNextKey(null); return; }

    const nextChar = word[currentTyped.length];
    if (!nextChar) { setNextKey(null); return; }

    // Find which physical key produces this character
    for (const [physKey, charProduced] of Object.entries(ACTIVE_MAP)) {
      if (charProduced === nextChar && physKey.length === 1) {
        // Check if shift needed
        const isShift = physKey === physKey.toUpperCase() && physKey !== physKey.toLowerCase();
        setNextKey(physKey.toLowerCase());
        setNeedsShift(isShift);
        return;
      }
    }
    setNextKey(null);
    setNeedsShift(false);
  }, [ACTIVE_MAP]);

  // ── KEYBOARD EVENT HANDLER — pure client side ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (finished) return;

      const key = e.key;

      // Ignore modifier keys
      if (['Shift','Control','Alt','Meta','CapsLock','Tab','Escape',
           'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F1','F2',
           'F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(key)) {
        return;
      }

      e.preventDefault(); // prevent browser default

      // Show pressed key on keyboard
      setPressedKey(key.toLowerCase());
      setTimeout(() => setPressedKey(null), 150);

      // Handle space — go to next word
      if (key === ' ') {
        const currentWord = words[wordIndex] ?? '';
        const isCorrect = typed === currentWord;
        setWordStatuses(prev => ({ ...prev, [wordIndex]: isCorrect ? 'correct' : 'incorrect' }));
        if (isCorrect) {
          setCorrectWords(p => p + 1);
          correctCharsRef.current += currentWord.length + 1;
        } else {
          setIncorrectWords(p => p + 1);
        }
        const nextIndex = wordIndex + 1;
        setWordIndex(nextIndex);
        setTyped('');
        updateNextKey('', nextIndex, words);
        if (nextIndex >= words.length) {
          clearInterval(timerRef.current);
          setFinished(true);
          setStarted(false);
        }
        return;
      }

      // Handle backspace
      if (key === 'Backspace') {
        const newTyped = typed.slice(0, -1);
        setTyped(newTyped);
        updateNextKey(newTyped, wordIndex, words);
        return;
      }

      // Convert key to Hindi/Krutidev character
      const converted = ACTIVE_MAP[key];
      if (!converted) return; // ignore unknown keys

      // Start timer on first keypress
      if (!started) {
        setStarted(true);
        startTimeRef.current = Date.now();
      }

      const newTyped = typed + converted;
      setTyped(newTyped);
      updateNextKey(newTyped, wordIndex, words);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finished, started, words, wordIndex, typed, ACTIVE_MAP, updateNextKey]);

  // Initialize next key
  useEffect(() => {
    updateNextKey('', 0, words);
  }, [words]);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setFinished(true);
          setStarted(false);
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

  const reset = (modeToUse = fontMode) => {
    clearInterval(timerRef.current);
    const sourceArray = modeToUse === 'krutidev' ? KRUTIDEV_PARAGRAPHS : HINDI_PARAGRAPHS;
    const paragraph = sourceArray[Math.floor(Math.random() * sourceArray.length)];
    const newWords = paragraph.split(' ');
    setWords(newWords);
    setTyped('');
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
    updateNextKey('', 0, newWords);
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
            <p className={`text-xs uppercase ${c.muted} mt-1`}>WPM</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className={`text-4xl font-bold ${c.text}`}>{accuracy}%</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Accuracy</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className="text-4xl font-bold text-green-400">{correctWords}</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Correct Words</p>
          </div>
          <div className={`text-center p-6 rounded-2xl border ${c.bg}`}>
            <p className="text-4xl font-bold text-red-400">{incorrectWords}</p>
            <p className={`text-xs uppercase ${c.muted} mt-1`}>Wrong Words</p>
          </div>
        </div>
        <div className={`w-full p-4 rounded-2xl border text-center ${c.bg}`}>
          <p className={`text-sm ${c.muted}`} style={MANGAL_FONT}>
            {cpm >= 150 ? '🏆 शानदार! सरकारी परीक्षा के लिए तैयार!' :
             cpm >= 100 ? '🔥 बहुत अच्छा! अभ्यास जारी रखें!' :
             cpm >= 50 ? '💪 अच्छी प्रगति!' : '🌱 रोज अभ्यास करते रहें!'}
          </p>
          <p className={`text-xs mt-1 ${c.muted}`}>CPCT/SSC target: 150+ CPM with 90%+ accuracy</p>
        </div>
        <button onClick={() => reset()}
          className={`px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 ${theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white'}`}
          style={MANGAL_FONT}>
          फिर से कोशिश करें
        </button>
      </div>
    );
  }

  // ── TYPING AREA ──
  return (
    <div className="flex flex-col max-w-5xl mx-auto w-full gap-4">

      {/* Font Toggle */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => { setFontMode('mangal'); reset('mangal'); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fontMode === 'mangal'
            ? 'bg-yellow-500 text-black'
            : theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}
          style={MANGAL_FONT}>
          मंगल / Mangal
        </button>
        <button
          onClick={() => { setFontMode('krutidev'); reset('krutidev'); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${fontMode === 'krutidev'
            ? 'bg-orange-500 text-white'
            : theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
          Kruti Dev
        </button>
      </div>

      <p className={`text-center text-xs ${c.muted}`}>
        {fontMode === 'mangal'
          ? '📝 Mangal/Unicode — SSC, UPSC, Railway exams ke liye'
          : '📝 Kruti Dev — CPCT, State PSC, MP exams ke liye'}
      </p>

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
        className={`h-48 overflow-hidden rounded-2xl p-6 border cursor-text select-none ${c.bg}`}>
        <div className="text-2xl flex flex-wrap gap-x-4"
          style={{ ...ACTIVE_FONT, lineHeight: '3.8rem' }}>
          {words.map((word, wIdx) => {
            const isPast = wIdx < wordIndex;
            const isActive = wIdx === wordIndex;
            const status = wordStatuses[wIdx];

            if (isPast) {
              return (
                <span key={wIdx}
                  className={`inline-block ${status === 'correct' ? c.correct : c.incorrect} ${status === 'incorrect' ? 'underline decoration-red-500 decoration-2' : ''}`}>
                  {word}
                </span>
              );
            }

            if (isActive) {
              const correctPart = word.slice(0, typed.length > word.length ? word.length : typed.split('').filter((ch, i) => ch === word[i]).length);
              // Simple char by char comparison
              return (
                <span key={wIdx} className="inline-block relative">
                  {word.split('').map((char, cIdx) => {
                    let col = c.untyped;
                    if (cIdx < typed.length) {
                      col = typed[cIdx] === char ? c.correct : c.incorrect;
                    }
                    const showCursor = cIdx === typed.length;
                    return (
                      <span key={cIdx} className="relative">
                        {showCursor && (
                          <span className="absolute -left-0.5 top-0 bottom-0 w-0.5"
                            style={{ backgroundColor: c.cursor, animation: 'blinkCursor 1s step-end infinite' }} />
                        )}
                        <span className={col}>{char}</span>
                      </span>
                    );
                  })}
                  {/* Extra chars typed beyond word length */}
                  {typed.length > word.length && (
                    <span className="text-red-500 bg-red-500/20 px-0.5 rounded">
                      {typed.slice(word.length)}
                    </span>
                  )}
                </span>
              );
            }

            return (
              <span key={wIdx} className={`inline-block ${c.untyped}`}>{word}</span>
            );
          })}
        </div>
      </div>

      {/* Keyboard Toggle */}
      <div className="flex justify-center">
        <button onClick={() => setShowKeyboard(!showKeyboard)}
          className={`px-4 py-1.5 rounded-lg text-xs transition-all ${theme === 'dark' ? 'bg-white/5 border border-white/10 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
          {showKeyboard ? '⌨️ Hide Keyboard' : '⌨️ Show Keyboard'}
        </button>
      </div>

      {/* Visual Keyboard */}
      {showKeyboard && (
        <div className="rounded-2xl p-4 border" style={{ backgroundColor: c.keyboardBg, borderColor: c.keyBorder }}>
          <p className={`text-xs text-center mb-3 ${c.muted}`}>
            {fontMode === 'mangal' ? 'Inscript Hindi Keyboard' : 'Kruti Dev Keyboard'} — उंगलियों की स्थिति देखें
          </p>
          <div className="flex flex-col gap-1.5 items-center">
            {KEYBOARD_LAYOUT.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1">
                {row.map((keyData) => {
                  const isActive = nextKey === keyData.key;
                  const isShiftActive = needsShift && (keyData.key === 'SHIFT' || keyData.key === 'SHIFT2');
                  const isPressed = pressedKey === keyData.key;
                  const fingerColor = FINGER_COLORS[keyData.key] || '#6b7280';
                  const isFnKey = ['TAB','CAPS','SHIFT','SHIFT2','BKSP','ENTER'].includes(keyData.key);
                  let bgColor = c.keyBg;
                  let borderColor = fingerColor + '70';
                  let textColor = c.keyText;
                  let shadow = 'none';
                  if (isPressed) { bgColor='#22c55e'; borderColor='#16a34a'; textColor='#fff'; shadow='0 0 8px #22c55e'; }
                  else if (isActive || isShiftActive) { bgColor=fingerColor; borderColor=fingerColor; textColor='#fff'; shadow='0 0 14px '+fingerColor; }
                  else if (isFnKey) { bgColor=c.keyWideBg; borderColor=c.keyBorder; }
                  return (
                    <div key={keyData.key} style={{
                      backgroundColor: bgColor, border: '1.5px solid '+borderColor,
                      color: textColor, boxShadow: shadow,
                      width: isFnKey ? (keyData.key==='BKSP'?'72px':keyData.key==='ENTER'?'80px':'88px') : '40px',
                      height: '44px', borderRadius: '6px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', position: 'relative',
                      transition: 'all 0.1s', cursor: 'default', userSelect: 'none',
                    }}>
                      {isFnKey ? (
                        <span style={{ fontSize: '9px', opacity: 0.7, fontFamily: 'monospace' }}>{keyData.hi}</span>
                      ) : (
                        <>
                          <span style={{ fontSize: '8px', opacity: 0.5, lineHeight: 1, ...ACTIVE_FONT }}>{keyData.shift}</span>
                          <span style={{ fontSize: '13px', lineHeight: 1, ...ACTIVE_FONT }}>{keyData.hi}</span>
                          <span style={{ fontSize: '7px', opacity: 0.3, position: 'absolute', bottom: '2px', fontFamily: 'monospace' }}>{keyData.key.toUpperCase()}</span>
                        </>
                      )}
                      {!isFnKey && !isActive && !isPressed && (
                        <div style={{ position: 'absolute', top: '2px', right: '2px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: fingerColor, opacity: 0.8 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Spacebar */}
            <div className="flex gap-1 items-center">
              {[{w:'60px',label:'Ctrl'},{w:'40px',label:'Alt'}].map(b => (
                <div key={b.label} style={{ width: b.w, height: '36px', backgroundColor: c.keyWideBg, border: '1.5px solid '+c.keyBorder, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>{b.label}</span>
                </div>
              ))}
              <div style={{
                width: '260px', height: '36px',
                backgroundColor: pressedKey === ' ' ? '#22c55e' : spaceNeeded ? '#8b5cf6' : c.keyBg,
                border: '1.5px solid '+(pressedKey===' '?'#16a34a':spaceNeeded?'#8b5cf6':c.keyBorder),
                borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.1s',
                boxShadow: pressedKey===' '?'0 0 8px #22c55e':spaceNeeded?'0 0 14px #8b5cf6':'none',
                color: spaceNeeded ? '#fff' : c.keyText,
              }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', opacity: spaceNeeded ? 1 : 0.5 }}>SPACE — अगला शब्द</span>
              </div>
              {[{w:'40px',label:'Alt'},{w:'60px',label:'Ctrl'}].map(b => (
                <div key={b.label} style={{ width: b.w, height: '36px', backgroundColor: c.keyWideBg, border: '1.5px solid '+c.keyBorder, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '8px', opacity: 0.5, fontFamily: 'monospace' }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-3">
            {[
              {color:'#ef4444',hindi:'छोटी'},{color:'#f97316',hindi:'अनामिका'},
              {color:'#eab308',hindi:'मध्यमा'},{color:'#22c55e',hindi:'तर्जनी बाईं'},
              {color:'#3b82f6',hindi:'तर्जनी दाईं'},{color:'#8b5cf6',hindi:'मध्यमा दाईं'},
              {color:'#ec4899',hindi:'अनामिका दाईं'},
            ].map(f => (
              <div key={f.color} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: f.color }} />
                <span className={`text-xs ${c.muted}`} style={MANGAL_FONT}>{f.hindi}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={`text-center text-xs ${c.muted}`}>
        💡 Physical keyboard se type karo — keyboard pe next key glow karegi
      </p>
      <button onClick={() => reset()} className={`mx-auto text-sm ${c.muted}`}>Reset</button>
    </div>
  );
}