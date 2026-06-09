import { useEffect, useRef, useState, useCallback } from 'react';

// ========== SOUND ENGINE ==========
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playKeyPress() {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g);
  g.connect(c.destination);
  o.type = 'sine';
  o.frequency.setValueAtTime(600, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(400, c.currentTime + 0.05);
  g.gain.setValueAtTime(0.08, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.08);
}

function playMessagePing() {
  const c = getCtx();
  const o = c.createOscillator();
  const g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.frequency.setValueAtTime(880, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1100, c.currentTime + 0.08);
  g.gain.setValueAtTime(0.3, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
  o.start(c.currentTime);
  o.stop(c.currentTime + 0.2);
}

function playSuccess() {
  const c = getCtx();
  [523, 659, 784].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.2, c.currentTime + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.08 + 0.2);
    o.start(c.currentTime + i * 0.08);
    o.stop(c.currentTime + i * 0.08 + 0.2);
  });
}

function playExplosion() {
  const c = getCtx();
  const bufferSize = c.sampleRate * 0.4;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = c.createBufferSource();
  const g = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  source.buffer = buffer;
  source.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  g.gain.setValueAtTime(1.5, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
  source.start(c.currentTime);
}

function playStreak() {
  const c = getCtx();
  [523, 659, 784, 1047].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'triangle';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.15, c.currentTime + i * 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.06 + 0.15);
    o.start(c.currentTime + i * 0.06);
    o.stop(c.currentTime + i * 0.06 + 0.15);
  });
}

function playVictory() {
  const c = getCtx();
  const notes = [523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.2, c.currentTime + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.1 + 0.3);
    o.start(c.currentTime + i * 0.1);
    o.stop(c.currentTime + i * 0.1 + 0.3);
  });
}

function playDefeat() {
  const c = getCtx();
  [400, 300, 200].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sawtooth';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.2, c.currentTime + i * 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.15 + 0.25);
    o.start(c.currentTime + i * 0.15);
    o.stop(c.currentTime + i * 0.15 + 0.25);
  });
}
// ========== END SOUND ENGINE ==========

const MESSAGES = {
  work: [
    { prompt: "hey, can you send the file by 5pm?", reply: "yes sending now" },
    { prompt: "pls share the deck", reply: "sent on slack" },
    { prompt: "can we move call to 4?", reply: "works for me" },
    { prompt: "is the report ready?", reply: "almost done" },
    { prompt: "urgent client is waiting", reply: "on it right now" },
    { prompt: "where is the file", reply: "sending in 2 mins" },
    { prompt: "please confirm receipt", reply: "confirmed thanks" },
    { prompt: "can you join the standup", reply: "yes be there soon" },
    { prompt: "deadline is today", reply: "will finish by 6pm" },
    { prompt: "please review my PR", reply: "on it now" },
  ],
  hinglish: [
    { prompt: "kal movie chale", reply: "haan 7 baje" },
    { prompt: "kya kar raha hai", reply: "bas kaam chal raha" },
    { prompt: "lunch mein kya hai", reply: "ghar ka khana hai" },
    { prompt: "aaj gym jaayega", reply: "haan shaam ko" },
    { prompt: "bhai party kab hai", reply: "shanivar ko rakh" },
    { prompt: "project kab submit hai", reply: "kal subah tak" },
    { prompt: "chai piyo ge", reply: "bilkul abhi banao" },
    { prompt: "kahaan ho aajkal", reply: "ghar pe hi hoon" },
  ],
  code: [
    { prompt: "function is throwing error", reply: "check line 42" },
    { prompt: "git push is failing", reply: "try git pull first" },
    { prompt: "API returns 404", reply: "check the endpoint" },
    { prompt: "npm install is broken", reply: "delete node modules" },
    { prompt: "CSS is not loading", reply: "clear browser cache" },
    { prompt: "build is failing", reply: "check the error logs" },
    { prompt: "database connection failed", reply: "check env variables" },
  ],
  numbers: [
    { prompt: "share UPI id", reply: "abc at paytm" },
    { prompt: "what is the OTP", reply: "649281" },
    { prompt: "call me at", reply: "9876543210" },
    { prompt: "how much did it cost", reply: "around 2500 rupees" },
    { prompt: "what time is the meeting", reply: "4 30 pm today" },
  ],
};

const DIFFICULTY = [
  { level: 'Easy',   time: 15, label: '😊 Easy',   color: 'text-green-400' },
  { level: 'Medium', time: 10, label: '😤 Medium', color: 'text-yellow-400' },
  { level: 'Hard',   time: 7,  label: '🔥 Hard',   color: 'text-orange-400' },
  { level: 'Pro',    time: 5,  label: '💀 Pro',     color: 'text-red-400' },
];

const TOTAL_MESSAGES = 10;
const MAX_LIVES = 3;
const MAX_BACKSPACES = 5;

function getAllMessages() {
  return [
    ...MESSAGES.work,
    ...MESSAGES.hinglish,
    ...MESSAGES.code,
    ...MESSAGES.numbers,
  ];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ChatBomb({ theme, themeStyles: t }) {
  const [screen, setScreen] = useState('menu');
  const [difficulty, setDifficulty] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState('');
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [replyTimes, setReplyTimes] = useState([]);
  const [defused, setDefused] = useState(0);
  const [resultData, setResultData] = useState(null);

  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const gameStateRef = useRef({});

  useEffect(() => {
    gameStateRef.current = { lives, score, defused, streak };
  }, [lives, score, defused, streak]);

  const diff = DIFFICULTY[difficulty];

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((timeSecs, onExpire) => {
    stopTimer();
    setTimeLeft(timeSecs);
    let remaining = timeSecs;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        stopTimer();
        onExpire();
      }
    }, 1000);
  }, [stopTimer]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const triggerFlash = (color) => {
    setFlash(color);
    setTimeout(() => setFlash(''), 400);
  };

  const showResult = useCallback((finalDefused, finalScore, finalLives, finalReplyTimes) => {
    stopTimer();
    if (finalDefused >= TOTAL_MESSAGES && finalLives > 0) {
      playVictory();
    } else {
      playDefeat();
    }
    setResultData({
      defused: finalDefused,
      score: finalScore,
      lives: finalLives,
      replyTimes: finalReplyTimes,
    });
    setScreen('result');
  }, [stopTimer]);

  const goToNextMessage = useCallback((
    nextIdx, curLives, curScore, curStreak, curReplyTimes
  ) => {
    if (nextIdx >= TOTAL_MESSAGES || curLives <= 0) {
      showResult(nextIdx > TOTAL_MESSAGES ? TOTAL_MESSAGES : nextIdx, curScore, curLives, curReplyTimes);
      return;
    }

    setCurrentIndex(nextIdx);
    setInput('');
    setBackspaceCount(0);
    playMessagePing();
    startTimeRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);

    startTimer(DIFFICULTY[difficulty].time, () => {
      playExplosion();
      triggerShake();
      triggerFlash('red');
      const newLives = curLives - 1;
      setLives(newLives);
      setStreak(0);
      setTimeout(() => {
        if (newLives <= 0) {
          showResult(nextIdx, curScore, newLives, curReplyTimes);
          return;
        }
        goToNextMessage(nextIdx, newLives, curScore, 0, curReplyTimes);
      }, 700);
    });
  }, [difficulty, startTimer, showResult]);

  const startGame = useCallback(() => {
    const msgs = shuffle(getAllMessages()).slice(0, TOTAL_MESSAGES);
    stopTimer();
    setMessages(msgs);
    setCurrentIndex(0);
    setInput('');
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setTimeLeft(DIFFICULTY[difficulty].time);
    setReplyTimes([]);
    setDefused(0);
    setBackspaceCount(0);
    setResultData(null);
    setFlash('');
    setShake(false);
    setScreen('playing');
    startTimeRef.current = Date.now();

    setTimeout(() => {
      inputRef.current?.focus();
      playMessagePing();
      startTimer(DIFFICULTY[difficulty].time, () => {
        playExplosion();
        triggerShake();
        triggerFlash('red');
        const newLives = MAX_LIVES - 1;
        setLives(newLives);
        setStreak(0);
        setTimeout(() => {
          if (newLives <= 0) {
            showResult(0, 0, newLives, []);
            return;
          }
          goToNextMessage(0, newLives, 0, 0, []);
        }, 700);
      });
    }, 100);
  }, [difficulty, startTimer, stopTimer, showResult, goToNextMessage]);

  const handleInput = useCallback((value) => {
    if (screen !== 'playing') return;

    // Play typing sound on every key press
    if (value.length !== input.length) {
      playKeyPress();
    }

    if (value.length < input.length) {
      const newCount = backspaceCount + 1;
      setBackspaceCount(newCount);
      if (newCount > MAX_BACKSPACES) {
        setTimeLeft(prev => Math.max(1, prev - 1));
      }
    }

    setInput(value);

    const currentMsg = messages[currentIndex];
    if (!currentMsg) return;

    const expected = currentMsg.reply;
    if (value === expected) {
      stopTimer();
      playSuccess();
      triggerFlash('green');

      const elapsed = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 1000
        : 0;

      const { lives: curLives, score: curScore, streak: curStreak, defused: curDefused } = gameStateRef.current;
      const newStreak = curStreak + 1;
      const bonus = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const newScore = curScore + 100 * bonus;
      const newDefused = curDefused + 1;
      const newReplyTimes = [...replyTimes, elapsed];

      setStreak(newStreak);
      setScore(newScore);
      setDefused(newDefused);
      setReplyTimes(newReplyTimes);

      if (newStreak >= 3) playStreak();

      setTimeout(() => {
        goToNextMessage(newDefused, curLives, newScore, newStreak, newReplyTimes);
      }, 350);
    }
  }, [screen, input, messages, currentIndex, backspaceCount, replyTimes, stopTimer, goToNextMessage]);

  useEffect(() => () => stopTimer(), [stopTimer]);

  const currentMsg = messages[currentIndex];
  const timerPercent = (timeLeft / diff.time) * 100;
  const timerColor = timerPercent > 50 ? 'bg-green-400' : timerPercent > 25 ? 'bg-yellow-400' : 'bg-red-400';
  const bubble = theme === 'dark' ? 'bg-zinc-800 text-zinc-100' : theme === 'sepia' ? 'bg-[#e8e0d0] text-[#5a4a2e]' : 'bg-gray-200 text-gray-900';
  const inputBg = theme === 'dark' ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-600' : theme === 'sepia' ? 'bg-[#f4f0e8] border-[#c4b89a] text-[#5a4a2e]' : 'bg-white border-gray-300 text-gray-900';

  // MENU
  if (screen === 'menu') {
    return (
      <div className="flex flex-col items-center gap-8 py-10 max-w-lg mx-auto w-full">
        <div className="text-center">
          <p className="text-6xl mb-3">💣</p>
          <h2 className="text-3xl font-bold">Chat Bomb</h2>
          <p className="text-sm opacity-50 mt-2">Reply fast or the bomb explodes!</p>
        </div>

        <div className="w-full">
          <p className="text-sm opacity-50 text-center mb-3">Select Difficulty</p>
          <div className="grid grid-cols-2 gap-3">
            {DIFFICULTY.map((d, i) => (
              <button
                key={d.level}
                onClick={() => setDifficulty(i)}
                className={`p-4 rounded-2xl text-left transition-all ${difficulty === i ? t.activebtn : t.btn}`}
              >
                <p className={`text-lg font-bold ${difficulty === i ? '' : d.color}`}>{d.label}</p>
                <p className="text-xs opacity-50 mt-1">{d.time}s per message</p>
              </button>
            ))}
          </div>
        </div>

        <div className={`w-full rounded-2xl p-4 text-sm opacity-70 ${t.btn}`}>
          <p className="font-medium mb-2">How to play:</p>
          <p>💬 A chat message appears</p>
          <p>⌨️ Type the reply shown below it</p>
          <p>💣 Too slow = bomb explodes = lose a life</p>
          <p>❤️ 3 lives total — good luck!</p>
          <p>🔥 Streaks give bonus points!</p>
        </div>

        <button
          onClick={startGame}
          className={`w-full py-4 rounded-2xl text-lg font-bold transition-all ${t.activebtn}`}
        >
          Start Game 💣
        </button>
      </div>
    );
  }

  // RESULT
  if (screen === 'result' && resultData) {
    const avgTime = resultData.replyTimes.length
      ? (resultData.replyTimes.reduce((a, b) => a + b, 0) / resultData.replyTimes.length).toFixed(1)
      : 0;
    const won = resultData.defused >= TOTAL_MESSAGES && resultData.lives > 0;

    return (
      <div className="flex flex-col items-center gap-6 py-10 max-w-lg mx-auto w-full">
        <div className="text-center">
          <p className="text-6xl mb-2">{won ? '🎉' : '💥'}</p>
          <h2 className="text-3xl font-bold">{won ? 'All Bombs Defused!' : 'BOOM!'}</h2>
          <p className="text-sm opacity-50 mt-1">{won ? 'You survived!' : 'Better luck next time!'}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full">
          <div className={`flex-1 min-w-[120px] rounded-2xl p-4 text-center ${t.btn}`}>
            <p className="text-3xl font-bold">{resultData.score}</p>
            <p className="text-xs opacity-50 uppercase tracking-wider mt-1">score</p>
          </div>
          <div className={`flex-1 min-w-[120px] rounded-2xl p-4 text-center ${t.btn}`}>
            <p className="text-3xl font-bold">{resultData.defused}/{TOTAL_MESSAGES}</p>
            <p className="text-xs opacity-50 uppercase tracking-wider mt-1">defused</p>
          </div>
          <div className={`flex-1 min-w-[120px] rounded-2xl p-4 text-center ${t.btn}`}>
            <p className="text-3xl font-bold">{avgTime}s</p>
            <p className="text-xs opacity-50 uppercase tracking-wider mt-1">avg reply</p>
          </div>
          <div className={`flex-1 min-w-[120px] rounded-2xl p-4 text-center ${t.btn}`}>
            <p className="text-3xl font-bold">{resultData.lives}❤️</p>
            <p className="text-xs opacity-50 uppercase tracking-wider mt-1">lives left</p>
          </div>
        </div>

        <p className="text-lg opacity-70">
          {resultData.score >= 800 ? '🔥 Unstoppable!' :
           resultData.score >= 500 ? '⚡ Great replies!' :
           resultData.score >= 300 ? '👍 Decent speed!' :
           '💪 Keep practicing!'}
        </p>

        <div className="flex gap-3 flex-wrap justify-center w-full">
          <button onClick={startGame} className={`flex-1 py-3 rounded-2xl text-sm font-bold ${t.activebtn}`}>
            Play Again 💣
          </button>
          <button onClick={() => setScreen('menu')} className={`flex-1 py-3 rounded-2xl text-sm ${t.btn}`}>
            Menu
          </button>
        </div>
      </div>
    );
  }

  // PLAYING
  if (screen === 'playing' && currentMsg) {
    return (
      <div className={`flex flex-col max-w-lg mx-auto w-full gap-4 ${shake ? 'animate-pulse' : ''}`}>
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <span key={i} className={`text-xl ${i < lives ? '' : 'opacity-20'}`}>❤️</span>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs opacity-50">Score</p>
            <p className="text-xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs opacity-50">Message</p>
            <p className="text-xl font-bold">{currentIndex + 1}/{TOTAL_MESSAGES}</p>
          </div>
        </div>

        {streak >= 3 && (
          <p className="text-center text-orange-400 font-bold text-sm">
            🔥 {streak} Streak! x{streak >= 5 ? 3 : 2} points!
          </p>
        )}

        <div className="w-full bg-zinc-800 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${Math.max(0, timerPercent)}%` }}
          />
        </div>
        <p className="text-center text-sm opacity-50">{timeLeft}s remaining</p>

        <div className={`rounded-2xl rounded-tl-sm p-4 max-w-[85%] ${bubble} ${flash === 'red' ? 'ring-2 ring-red-400' : flash === 'green' ? 'ring-2 ring-green-400' : ''}`}>
          <p className="text-xs opacity-40 mb-1">💬 Message</p>
          <p className="text-lg font-medium">{currentMsg.prompt}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs opacity-40 uppercase tracking-wider">Type this reply:</p>
          <p className={`text-base font-mono font-medium opacity-60 ${t.text}`}>
            {currentMsg.reply}
          </p>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Type reply here..."
            className={`w-full px-4 py-3 rounded-xl border-2 outline-none text-lg font-mono transition-all ${inputBg} ${flash === 'green' ? 'border-green-400' : flash === 'red' ? 'border-red-400' : ''}`}
          />
          {backspaceCount > MAX_BACKSPACES && (
            <p className="text-xs text-yellow-400">⚠️ Too many backspaces — time penalty!</p>
          )}
        </div>

        <div className="flex gap-0.5 flex-wrap">
          {currentMsg.reply.split('').map((char, i) => (
            <span
              key={i}
              className={`text-sm font-mono ${
                input[i] === char ? 'text-green-400' :
                input[i] !== undefined ? 'text-red-400' :
                'opacity-20'
              }`}
            >
              {char === ' ' ? '·' : char}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}