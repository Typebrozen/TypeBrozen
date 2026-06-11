import { useEffect, useRef, useState, useCallback } from 'react';
import keySoundFile from '../assets/key.mp3';
import errorSoundFile from '../assets/error.mp3';
import finishSoundFile from '../assets/finish.mp3';

const keySound = new Audio(keySoundFile);
const errorSound = new Audio(errorSoundFile);
const finishSound = new Audio(finishSoundFile);
keySound.volume = 0.08;
errorSound.volume = 0.12;
finishSound.volume = 0.2;

export default function MultiplayerRace({
  theme, myId, roomState, raceText,
  raceStarted, raceFinished, countdown,
  sendProgress, sendFinished, leaveRoom,
  timeLimit = 120,
}) {
  const [input, setInput] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const isCurrentWordWrong = useRef(false);
  const correctRef = useRef(0);
  const incorrectRef = useRef(0);
  correctRef.current = correctChars;
  incorrectRef.current = incorrectChars;

  const words = raceText.trim().split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const textColor = theme === 'dark' ? 'text-white' : theme === 'sepia' ? 'text-[#5a4a2e]' : 'text-gray-800';
  const mutedColor = theme === 'dark' ? 'text-white/40' : theme === 'sepia' ? 'text-[#8a6e4a]' : 'text-gray-500';
  const untypedColor = theme === 'dark' ? 'text-zinc-500' : theme === 'sepia' ? 'text-amber-700/40' : 'text-gray-300';
  const correctColor = theme === 'dark' ? 'text-zinc-200' : theme === 'sepia' ? 'text-[#5a4a2e]' : 'text-gray-700';
  const currentColor = theme === 'dark' ? 'text-yellow-400' : theme === 'sepia' ? 'text-amber-700 font-bold' : 'text-blue-600 font-bold';
  const cursorColor = theme === 'dark' ? '#eab308' : theme === 'sepia' ? '#b8860b' : '#3b82f6';

  const getGlass = () => {
    if (theme === 'dark') return 'backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl';
    if (theme === 'sepia') return 'backdrop-blur-xl bg-white/40 border border-amber-800/20 rounded-2xl';
    return 'backdrop-blur-xl bg-white/60 border border-gray-300/50 rounded-2xl';
  };

  const getBtn = (active = false) => {
    if (active) {
      if (theme === 'dark') return 'bg-white text-black';
      if (theme === 'sepia') return 'bg-[#5a4a2e] text-white';
      return 'bg-gray-800 text-white';
    }
    return theme === 'dark'
      ? 'backdrop-blur-sm bg-white/5 border border-white/10 text-white'
      : theme === 'sepia'
      ? 'backdrop-blur-sm bg-white/30 border border-amber-800/20 text-[#5a4a2e]'
      : 'backdrop-blur-sm bg-white/50 border border-gray-300/40 text-gray-800';
  };

  // Start timer when race starts
  useEffect(() => {
    if (!raceStarted || finished) return;
    setStartTime(Date.now());
    setTimeLeft(timeLimit);
    inputRef.current?.focus();

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [raceStarted, timeLimit]);

  // Auto finish when time runs out
  useEffect(() => {
    if (timeLeft === 0 && raceStarted && !finished) {
      clearInterval(progressIntervalRef.current);
      setFinished(true);
      const elapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
      const wpm = elapsed > 0 ? Math.round((correctRef.current / 5) / elapsed) : 0;
      const total = correctRef.current + incorrectRef.current;
      const accuracy = total > 0 ? Math.round((correctRef.current / total) * 100) : 100;
      finishSound.currentTime = 0;
      finishSound.play().catch(() => {});
      sendFinished(wpm, accuracy);
    }
  }, [timeLeft, raceStarted, finished, startTime, sendFinished]);

  // Send progress every second
  useEffect(() => {
    if (!raceStarted || finished) return;
    progressIntervalRef.current = setInterval(() => {
      if (!startTime) return;
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const wpm = elapsed > 0 ? Math.round((correctRef.current / 5) / elapsed) : 0;
      const total = correctRef.current + incorrectRef.current;
      const accuracy = total > 0 ? Math.round((correctRef.current / total) * 100) : 100;
      const progress = Math.round((wordIndex / totalWords) * 100);
      sendProgress(progress, wpm, accuracy);
    }, 1000);
    return () => clearInterval(progressIntervalRef.current);
  }, [raceStarted, finished, wordIndex, startTime, totalWords, sendProgress]);

  // Scroll to current word
  useEffect(() => {
    if (!containerRef.current) return;
    const active = containerRef.current.querySelector('[data-cursor="true"]');
    if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [wordIndex, input]);

  const calcStats = useCallback(() => {
    const elapsed = startTime ? (Date.now() - startTime) / 1000 / 60 : 0;
    const wpm = elapsed > 0 ? Math.round((correctRef.current / 5) / elapsed) : 0;
    const total = correctRef.current + incorrectRef.current;
    const accuracy = total > 0 ? Math.round((correctRef.current / total) * 100) : 100;
    return { wpm, accuracy };
  }, [startTime]);

  const handleInput = useCallback((value) => {
    if (!raceStarted || finished) return;
    const currentWord = words[wordIndex] ?? '';
    const prev = input;

    if (value.length < prev.length) {
      let nc = correctChars, ni = incorrectChars;
      for (let i = prev.length - 1; i >= value.length; i--) {
        const expected = currentWord[i];
        if (expected === undefined) ni = Math.max(0, ni - 1);
        else if (prev[i] === expected) nc = Math.max(0, nc - 1);
        else ni = Math.max(0, ni - 1);
      }
      setCorrectChars(nc);
      setIncorrectChars(ni);
      setInput(value);
      return;
    }

    const newChar = value[value.length - 1];
    const charIndex = value.length - 1;

    if (newChar === ' ' && value.endsWith(' ')) {
      if (isCurrentWordWrong.current) {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
      }
      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setInput('');
      isCurrentWordWrong.current = false;

      if (nextIndex >= totalWords) {
        clearInterval(progressIntervalRef.current);
        clearInterval(timerRef.current);
        setFinished(true);
        finishSound.currentTime = 0;
        finishSound.play().catch(() => {});
        const { wpm, accuracy } = calcStats();
        sendFinished(wpm, accuracy);
      }
      return;
    }

    if (charIndex < currentWord.length) {
      if (newChar === currentWord[charIndex]) {
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
        setCorrectChars(c => c + 1);
      } else {
        isCurrentWordWrong.current = true;
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
        setIncorrectChars(c => c + 1);
      }
    } else {
      isCurrentWordWrong.current = true;
      errorSound.currentTime = 0;
      errorSound.play().catch(() => {});
      setIncorrectChars(c => c + 1);
    }

    setInput(value);
  }, [raceStarted, finished, words, wordIndex, input, correctChars, incorrectChars, totalWords, calcStats, sendFinished]);

  const getCharStatus = useCallback((wIndex, charIndex) => {
    if (wIndex > wordIndex) return 'pending';
    if (wIndex < wordIndex) return 'correct';
    const typed = input;
    if (charIndex < typed.length) return typed[charIndex] === words[wIndex][charIndex] ? 'correct' : 'incorrect';
    if (charIndex === typed.length) return 'current';
    return 'pending';
  }, [wordIndex, words, input]);

  const myPlayer = roomState?.players?.find(p => p.id === myId);
  const sortedPlayers = roomState?.players
    ? [...roomState.players].sort((a, b) => (b.progress || 0) - (a.progress || 0))
    : [];

  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
  const timerColor = timeLeft > 30 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400';

  // COUNTDOWN
  if (!raceStarted && countdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[400px]">
        <p className={`text-xl font-medium ${mutedColor}`}>Race starting in...</p>
        <p className={`text-9xl font-bold tabular-nums ${textColor}`}>{countdown}</p>
        <p className={`text-sm ${mutedColor}`}>Get ready to type!</p>
      </div>
    );
  }

  // RESULTS
  if (raceFinished && roomState) {
    const sorted = [...roomState.players].sort((a, b) => {
      if (a.finished && b.finished) return (a.finishTime || 0) - (b.finishTime || 0);
      if (a.finished) return -1;
      if (b.finished) return 1;
      return (b.progress || 0) - (a.progress || 0);
    });

    return (
      <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full py-6">
        <div className="text-center">
          <p className="text-6xl mb-2">🏆</p>
          <h2 className={`text-3xl font-bold ${textColor}`}>Race Complete!</h2>
        </div>

        {sorted[0] && (
          <div className={`w-full ${getGlass()} p-4 text-center`}>
            <p className="text-4xl mb-1">{sorted[0].emoji}</p>
            <p className={`text-xl font-bold ${textColor}`}>🎉 {sorted[0].name} Wins!</p>
            <p className={`text-sm ${mutedColor}`}>{sorted[0].wpm} WPM • {sorted[0].accuracy}% Accuracy</p>
          </div>
        )}

        <div className={`w-full ${getGlass()} overflow-hidden`}>
          {sorted.map((player, idx) => (
            <div key={player.id} className={`flex items-center gap-4 px-4 py-3 border-b border-white/5 last:border-0 ${player.id === myId ? 'bg-white/5' : ''}`}>
              <span className="text-xl w-8 text-center">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </span>
              <span className="text-2xl">{player.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${textColor}`}>
                  {player.name} {player.id === myId && <span className={`text-xs ${mutedColor}`}>(You)</span>}
                </p>
                <p className={`text-xs ${mutedColor}`}>
                  {player.wpm > 0 ? `${player.wpm} WPM • ${player.accuracy}% acc` : `${Math.round(player.progress || 0)}% complete`}
                </p>
              </div>
              {player.finished && <span className="text-green-400 text-sm">✓</span>}
            </div>
          ))}
        </div>

        <button onClick={leaveRoom} className={`px-8 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 ${getBtn(true)}`}>
          Back to Lobby
        </button>
      </div>
    );
  }

  // RACING
  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full gap-4">

      {/* Timer + Stats */}
      <div className="flex justify-between items-center px-2">
        <div className={`text-4xl font-bold font-mono tabular-nums ${timerColor}`}>
          {formattedTime}
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className={`text-2xl font-bold ${textColor}`}>{myPlayer?.wpm || 0}</p>
            <p className={`text-xs uppercase ${mutedColor}`}>WPM</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${textColor}`}>{myPlayer?.accuracy || 100}%</p>
            <p className={`text-xs uppercase ${mutedColor}`}>ACC</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${textColor}`}>{Math.round(myPlayer?.progress || 0)}%</p>
            <p className={`text-xs uppercase ${mutedColor}`}>Done</p>
          </div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className={`${getGlass()} p-4`}>
        <p className={`text-xs uppercase tracking-wider mb-3 ${mutedColor}`}>🏁 Live Race</p>
        <div className="flex flex-col gap-2">
          {sortedPlayers.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-3">
              <span className={`text-xs w-4 ${mutedColor}`}>{idx + 1}</span>
              <span className="text-xl">{player.emoji}</span>
              <span className={`text-sm w-20 truncate ${player.id === myId ? textColor : mutedColor}`}>
                {player.name}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${player.id === myId ? (theme === 'dark' ? 'bg-yellow-400' : 'bg-blue-500') : 'bg-white/30'}`}
                  style={{ width: `${player.progress || 0}%` }}
                />
              </div>
              <span className={`text-xs w-10 text-right ${mutedColor}`}>
                {player.finished ? '✓' : `${Math.round(player.progress || 0)}%`}
              </span>
              <span className={`text-xs w-14 text-right font-mono ${mutedColor}`}>
                {player.wpm > 0 ? `${player.wpm}wpm` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Typing Area */}
      {!finished && (
        <div className="relative">
          <div ref={containerRef}
            className={`h-48 overflow-y-auto rounded-2xl p-4 shadow-xl cursor-text ${getGlass()}`}
            onClick={() => inputRef.current?.focus()}>
            <div className={`text-xl leading-loose select-none tracking-wide font-mono ${textColor}`}>
              {words.map((word, wIndex) => (
                <span key={`${word}-${wIndex}`} className="inline-block mr-3">
                  {word.split('').map((char, charIndex) => {
                    const status = getCharStatus(wIndex, charIndex);
                    let color = untypedColor;
                    if (status === 'correct') color = correctColor;
                    if (status === 'incorrect') color = 'text-red-400';
                    if (status === 'current') color = currentColor;
                    const showCursor = wIndex === wordIndex && charIndex === input.length + 1;
                    return (
                      <span key={charIndex} data-cursor={showCursor ? 'true' : undefined} className={`${color} relative inline-block`}>
                        {showCursor && (
                          <span className="absolute -left-0.5 top-0 bottom-0 w-0.5"
                            style={{ backgroundColor: cursorColor, animation: 'blinkCursor 1s step-end infinite' }} />
                        )}
                        {char}
                      </span>
                    );
                  })}
                </span>
              ))}
            </div>
          </div>
          <input ref={inputRef} value={input}
            onChange={e => handleInput(e.target.value)}
            disabled={finished || !raceStarted}
            className="absolute inset-0 opacity-0 cursor-text"
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
        </div>
      )}

      {finished && !raceFinished && (
        <div className={`${getGlass()} p-6 text-center`}>
          <p className="text-4xl mb-2">✅</p>
          <p className={`text-xl font-bold ${textColor}`}>You finished!</p>
          <p className={`text-sm ${mutedColor}`}>Waiting for other players...</p>
        </div>
      )}

      <button onClick={leaveRoom} className={`mx-auto text-xs px-4 py-2 rounded-lg transition-all ${getBtn()}`}>
        Leave Race
      </button>
    </div>
  );
}