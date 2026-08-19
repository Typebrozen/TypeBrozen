import { useEffect, useRef, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
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
  sendProgress, sendFinished, leaveRoom, resetRace,
  timeLimit = 120,
}) {
  const [input, setInput] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);
  const [finished, setFinished] = useState(false);
  const [finishStats, setFinishStats] = useState(null); // 🔒 frozen result, set ONCE when player finishes
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [wordStatuses, setWordStatuses] = useState({});
  // 📄 Stores every word the player got wrong, along with exactly what they typed instead,
  // so the PDF report can show letter-by-letter which part was wrong. Only used for
  // THIS player's own report — never sent to the server or shown to other players.
  const wrongWordsRef = useRef([]); // [{ correctWord, typedWord }]

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const timerRef = useRef(null);
  const correctWordsRef = useRef(0);
  const incorrectWordsRef = useRef(0);
  const correctCharsRef = useRef(0);
  const incorrectCharsRef = useRef(0);
  correctWordsRef.current = correctWords;
  incorrectWordsRef.current = incorrectWords;
  correctCharsRef.current = correctChars;
  incorrectCharsRef.current = incorrectChars;

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

  // Calculate Net WPM (Typing Master style)
  // 🔒 Pass an endTime to FREEZE the calculation at that exact moment.
  // Without it, this recalculates using "right now" every time it's called,
  // which is why results used to keep changing while waiting for others.
  const calcStats = useCallback((endTime) => {
    const now = endTime ?? Date.now();
    const elapsed = startTime ? (now - startTime) / 1000 / 60 : 0;
    if (elapsed === 0) return { wpm: 0, accuracy: 100, grossWpm: 0, errors: 0 };
    const grossWords = correctWordsRef.current + incorrectWordsRef.current;
    const grossWpm = Math.round(grossWords / elapsed);
    const errors = incorrectWordsRef.current;
    const netWpm = Math.max(0, Math.round((correctWordsRef.current / elapsed) - (errors / elapsed)));
    const accuracy = grossWords === 0 ? 100 : Math.round((correctWordsRef.current / grossWords) * 100);
    return { wpm: netWpm, grossWpm, errors, accuracy };
  }, [startTime]);

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

  // Auto finish when time runs out — locks the box instantly, freezes the score
  useEffect(() => {
    if (timeLeft === 0 && raceStarted && !finished) {
      clearInterval(progressIntervalRef.current);
      clearInterval(timerRef.current);
      const now = Date.now();
      const stats = calcStats(now);
      setFinishStats(stats);
      setFinished(true); // this instantly disables the typing box (see disabled={finished || !raceStarted} below)
      finishSound.currentTime = 0;
      finishSound.play().catch(() => {});
      // completed:false because the paragraph was NOT fully typed — timer ran out first
      sendFinished(stats.wpm, stats.accuracy, now, false);
    }
  }, [timeLeft, raceStarted, finished, calcStats, sendFinished]);

  // Send progress update every 2.5s instead of every 1s — much lighter on your server,
  // and the leaderboard bar doesn't need second-by-second precision.
  useEffect(() => {
    if (!raceStarted || finished) return;
    progressIntervalRef.current = setInterval(() => {
      const { wpm, accuracy } = calcStats();
      const progress = Math.round((wordIndex / totalWords) * 100);
      sendProgress(progress, wpm, accuracy);
    }, 2500);
    return () => clearInterval(progressIntervalRef.current);
  }, [raceStarted, finished, wordIndex, totalWords, sendProgress, calcStats]);

  // Scroll to current word
  useEffect(() => {
    if (!containerRef.current) return;
    const active = containerRef.current.querySelector('[data-active="true"]');
    if (active) active.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [wordIndex]);

  const handleInput = useCallback((value) => {
    if (!raceStarted || finished) return;
    const currentWord = words[wordIndex] ?? '';

    // Space pressed — move to next word
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const isCorrect = typedWord === currentWord;

      // Update word status
      setWordStatuses(prev => ({ ...prev, [wordIndex]: isCorrect ? 'correct' : 'incorrect' }));

      if (isCorrect) {
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
        setCorrectWords(c => c + 1);
        setCorrectChars(c => c + currentWord.length);
      } else {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
        setIncorrectWords(c => c + 1);
        setIncorrectChars(c => c + currentWord.length);
        // Save exactly what they typed vs. the correct word, for the report
        wrongWordsRef.current.push({ correctWord: currentWord, typedWord });
      }

      const nextIndex = wordIndex + 1;
      setInput('');
      setWordIndex(nextIndex);

      // Reached the end of the paragraph — lock instantly, freeze the score right here
      if (nextIndex >= totalWords) {
        clearInterval(progressIntervalRef.current);
        clearInterval(timerRef.current);
        const now = Date.now();
        const stats = calcStats(now);
        setFinishStats(stats);
        setFinished(true);
        finishSound.currentTime = 0;
        finishSound.play().catch(() => {});
        // completed:true because the whole paragraph was typed
        sendFinished(stats.wpm, stats.accuracy, now, true);
      }
      return;
    }

    // Normal typing — sound feedback
    if (value.length > input.length) {
      const newChar = value[value.length - 1];
      const charIndex = value.length - 1;
      if (charIndex < currentWord.length && newChar === currentWord[charIndex]) {
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
      } else {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
      }
    }

    setInput(value);
  }, [raceStarted, finished, words, wordIndex, input, totalWords, calcStats, sendFinished]);

  const getCharStatus = useCallback((wIndex, charIndex) => {
    if (wIndex < wordIndex) {
      return wordStatuses[wIndex] === 'correct' ? 'correct' : 'incorrect';
    }
    if (wIndex > wordIndex) return 'pending';
    const typed = input;
    if (charIndex < typed.length) {
      return typed[charIndex] === words[wIndex][charIndex] ? 'correct' : 'incorrect';
    }
    if (charIndex === typed.length) return 'current';
    return 'pending';
  }, [wordIndex, words, input, wordStatuses]);

  const myPlayer = roomState?.players?.find(p => p.id === myId);
  const sortedPlayers = roomState?.players
    ? [...roomState.players].sort((a, b) => (b.progress || 0) - (a.progress || 0))
    : [];

  // 🏆 Everyone's browser computes the SAME final ranking from the SAME data —
  // no need for the server to "decide" who won.
  // Rule: fully typed the paragraph > ran out of time.
  //       Among those who finished the paragraph: earliest finishTime wins.
  //       Among those who ran out of time: higher net WPM wins, accuracy breaks ties.
  const getRanking = (players) => {
    return [...(players || [])].sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if (a.completed && b.completed) return (a.finishTime || 0) - (b.finishTime || 0);
      if ((b.wpm || 0) !== (a.wpm || 0)) return (b.wpm || 0) - (a.wpm || 0);
      return (b.accuracy || 0) - (a.accuracy || 0);
    });
  };

  // Compares the correct word to what the player actually typed, letter by letter.
  // Returns a list of { char, wrong } so the PDF can color each letter individually.
  const diffWord = (correctWord, typedWord) => {
    const maxLen = Math.max(correctWord.length, typedWord.length);
    const result = [];
    for (let i = 0; i < maxLen; i++) {
      const correctChar = correctWord[i];
      const typedChar = typedWord[i];
      if (typedChar === undefined) {
        // player typed fewer letters than the correct word — show the missing letter in red
        result.push({ char: correctChar, wrong: true });
      } else if (correctChar === undefined) {
        // player typed extra letters beyond the correct word — show them in red too
        result.push({ char: typedChar, wrong: true });
      } else if (typedChar === correctChar) {
        result.push({ char: correctChar, wrong: false });
      } else {
        result.push({ char: correctChar, wrong: true });
      }
    }
    return result;
  };

  // 📄 Builds and downloads this player's personal PDF report.
  // Runs entirely in the browser (jsPDF) — no server call, no server load.
  const downloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(20, 20, 20);
    doc.text('Typing Race Report', pageWidth / 2, y, { align: 'center' });
    y += 12;

    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.text(`Player: ${myPlayer?.name || 'You'}`, 14, y);
    y += 8;
    doc.text(`Rank: ${myPosition ? `${myPosition}${myPosition === 2 ? 'nd' : myPosition === 3 ? 'rd' : myPosition === 1 ? 'st' : 'th'} Place` : '-'}`, 14, y);
    y += 8;
    doc.text(`Net WPM: ${finishStats?.wpm ?? myPlayer?.wpm ?? 0}`, 14, y);
    y += 8;
    doc.text(`Accuracy: ${finishStats?.accuracy ?? myPlayer?.accuracy ?? 0}%`, 14, y);
    y += 12;

    // Wrong words section
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('Words To Practice', 14, y);
    y += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;

    if (wrongWordsRef.current.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 130, 0);
      doc.text('No mistakes! Great job.', 14, y);
      y += 10;
    } else {
      doc.setFontSize(12);
      wrongWordsRef.current.forEach(({ correctWord, typedWord }) => {
        if (y > 270) { // start a new page if we run out of room
          doc.addPage();
          y = 20;
        }
        let x = 14;
        const diffed = diffWord(correctWord, typedWord);
        diffed.forEach(({ char, wrong }) => {
          doc.setTextColor(wrong ? 220 : 20, wrong ? 30 : 20, wrong ? 30 : 20);
          doc.text(char, x, y);
          x += doc.getTextWidth(char);
        });
        // show what they actually typed, in gray, next to it
        doc.setTextColor(150, 150, 150);
        doc.text(`   (you typed: ${typedWord})`, x + 2, y);
        y += 8;
      });

      // Simple practice tip based on the pattern of mistakes
      y += 6;
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      const endMistakes = wrongWordsRef.current.filter(w => {
        const diffed = diffWord(w.correctWord, w.typedWord);
        const wrongCount = diffed.filter(d => d.wrong).length;
        const lastTwoWrong = diffed.slice(-2).some(d => d.wrong);
        return wrongCount <= 2 && lastTwoWrong;
      }).length;
      let tip = 'Slow down slightly and double-check each word before moving to the next.';
      if (endMistakes >= Math.ceil(wrongWordsRef.current.length / 2)) {
        tip = 'You often get the last letters of a word wrong — try to fully finish typing each word before your fingers move on.';
      }
      doc.text(`Tip: ${tip}`, 14, y, { maxWidth: pageWidth - 28 });
    }

    doc.save(`${(myPlayer?.name || 'player').replace(/\s+/g, '_')}_race_report.pdf`);
  };

  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;
  const timerColor = timeLeft > 30 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400 animate-pulse';

  // Live stats — only used WHILE actively typing. Once finished, we always show
  // the frozen finishStats instead, never a re-calculated live value.
  const { wpm: liveWpm, accuracy: liveAccuracy } = calcStats();

  // ── COUNTDOWN ──
  if (!raceStarted && countdown > 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[400px]">
        <p className={`text-xl font-medium ${mutedColor}`}>Race starting in...</p>
        <p className={`text-9xl font-bold tabular-nums ${textColor}`}>{countdown}</p>
        <p className={`text-sm ${mutedColor}`}>Get ready to type!</p>
      </div>
    );
  }

  // ── RESULTS ──
  if (raceFinished && roomState) {
    const sorted = getRanking(roomState.players);

    const isHost = roomState.hostId === myId;
    const myPosition = sorted.findIndex(p => p.id === myId) + 1;
    const didIWin = myPosition === 1;

    return (
      <div className="flex flex-col items-center gap-5 max-w-2xl mx-auto w-full py-4">

        {/* My result banner */}
        <div className={`w-full p-4 rounded-2xl text-center ${didIWin ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5 border border-white/10'}`}>
          <p className="text-4xl mb-1">{didIWin ? '🏆' : myPosition === 2 ? '🥈' : myPosition === 3 ? '🥉' : '😔'}</p>
          <p className={`text-2xl font-black ${didIWin ? 'text-yellow-400' : textColor}`}>
            {didIWin ? 'You Won!' : `${myPosition}${myPosition === 2 ? 'nd' : myPosition === 3 ? 'rd' : 'th'} Place`}
          </p>
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className={`text-2xl font-bold ${textColor}`}>{myPlayer?.wpm || 0}</p>
              <p className={`text-xs ${mutedColor}`}>Net WPM</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${textColor}`}>{myPlayer?.accuracy || 0}%</p>
              <p className={`text-xs ${mutedColor}`}>Accuracy</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${textColor}`}>{Math.round(myPlayer?.progress || 0)}%</p>
              <p className={`text-xs ${mutedColor}`}>Completed</p>
            </div>
          </div>
          <button onClick={downloadReport}
            className="mt-4 mx-auto flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2.5 rounded-lg transition">
            📄 Download My Report (PDF)
          </button>
        </div>

        {/* All results */}
        <div className={`w-full ${getGlass()} overflow-hidden`}>
          <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider ${mutedColor} border-b border-white/5 grid grid-cols-12 gap-2`}>
            <div className="col-span-1">#</div>
            <div className="col-span-4">Player</div>
            <div className="col-span-2 text-center">WPM</div>
            <div className="col-span-2 text-center">ACC</div>
            <div className="col-span-3 text-center">Status</div>
          </div>
          {sorted.map((player, idx) => (
            <div key={player.id}
              className={`grid grid-cols-12 gap-2 items-center px-4 py-3 border-b border-white/5 last:border-0 ${player.id === myId ? 'bg-yellow-500/5' : ''}`}>
              <div className="col-span-1 text-lg">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}
              </div>
              <div className="col-span-4 flex items-center gap-2">
                <span className="text-xl">{player.emoji}</span>
                <span className={`text-sm font-medium truncate ${player.id === myId ? 'text-yellow-400' : textColor}`}>
                  {player.name}
                </span>
              </div>
              <div className={`col-span-2 text-center font-mono font-bold ${idx === 0 ? 'text-yellow-400' : textColor}`}>
                {player.wpm || 0}
              </div>
              <div className={`col-span-2 text-center font-mono ${textColor}`}>
                {player.accuracy || 0}%
              </div>
              <div className="col-span-3 text-center">
                {player.completed
                  ? <span className="text-green-400 text-xs font-bold">✓ Finished</span>
                  : <span className="text-red-400 text-xs">{Math.round(player.progress || 0)}% done</span>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-sm">
          {isHost && (
            <button onClick={() => resetRace()}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 bg-green-600 hover:bg-green-500 text-white">
              🔄 Race Again
            </button>
          )}
          <button onClick={leaveRoom}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 ${getBtn(true)}`}>
            🚪 Leave
          </button>
        </div>

        {!isHost && (
          <p className={`text-xs ${mutedColor}`}>Waiting for host to start a new race...</p>
        )}
      </div>
    );
  }

  // ── RACING ──
  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full gap-4">

      {/* Timer + Stats */}
      <div className="flex justify-between items-center px-2">
        <div className={`text-4xl font-bold font-mono tabular-nums ${timerColor}`}>
          {formattedTime}
        </div>
        <div className="flex gap-4 sm:gap-6">
          <div className="text-center">
            <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>{finished ? (finishStats?.wpm ?? 0) : liveWpm}</p>
            <p className={`text-xs uppercase ${mutedColor}`}>WPM</p>
          </div>
          <div className="text-center">
            <p className={`text-xl sm:text-2xl font-bold ${(finished ? finishStats?.accuracy ?? 0 : liveAccuracy) < 80 ? 'text-red-400' : (finished ? finishStats?.accuracy ?? 0 : liveAccuracy) < 95 ? 'text-yellow-400' : 'text-green-400'}`}>
              {finished ? (finishStats?.accuracy ?? 0) : liveAccuracy}%
            </p>
            <p className={`text-xs uppercase ${mutedColor}`}>ACC</p>
          </div>
          <div className="text-center">
            <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>{wordIndex}/{totalWords}</p>
            <p className={`text-xs uppercase ${mutedColor}`}>Words</p>
          </div>
        </div>
      </div>

      {/* Live Leaderboard */}
      <div className={`${getGlass()} p-4`}>
        <p className={`text-xs uppercase tracking-wider mb-3 ${mutedColor}`}>🏁 Live Race</p>
        <div className="flex flex-col gap-2">
          {sortedPlayers.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-2 sm:gap-3">
              <span className={`text-xs w-4 ${mutedColor}`}>{idx + 1}</span>
              <span className="text-lg sm:text-xl">{player.emoji}</span>
              <span className={`text-xs sm:text-sm w-16 sm:w-20 truncate ${player.id === myId ? 'text-yellow-400 font-bold' : mutedColor}`}>
                {player.name}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${player.id === myId ? 'bg-yellow-400' : 'bg-white/30'}`}
                  style={{ width: `${player.progress || 0}%` }}
                />
              </div>
              <span className={`text-xs w-8 text-right ${mutedColor}`}>
                {player.completed ? '✓' : `${Math.round(player.progress || 0)}%`}
              </span>
              <span className={`text-xs w-12 text-right font-mono ${player.id === myId ? 'text-yellow-400' : mutedColor}`}>
                {player.wpm > 0 ? `${player.wpm}w` : ''}
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
            <div className="text-xl leading-loose select-none tracking-wide font-mono flex flex-wrap gap-x-3">
              {words.map((word, wIndex) => {
                const isActive = wIndex === wordIndex;
                const wordStatus = wordStatuses[wIndex];
                const isPast = wIndex < wordIndex;

                return (
                  <span key={`${word}-${wIndex}`}
                    data-active={isActive ? 'true' : undefined}
                    className={`inline-block relative ${
                      isPast && wordStatus === 'incorrect'
                        ? 'underline decoration-red-500 decoration-2'
                        : ''
                    } ${isActive ? 'bg-white/5 rounded px-0.5' : ''}`}>
                    {word.split('').map((char, charIndex) => {
                      const status = getCharStatus(wIndex, charIndex);
                      let color = untypedColor;
                      if (status === 'correct') color = correctColor;
                      if (status === 'incorrect') color = 'text-red-400';
                      if (status === 'current') color = currentColor;
                      const showCursor = isActive && charIndex === input.length;
                      return (
                        <span key={charIndex} className={`${color} relative inline-block`}>
                          {showCursor && (
                            <span className="absolute -left-0.5 top-0 bottom-0 w-0.5"
                              style={{ backgroundColor: cursorColor, animation: 'blinkCursor 1s step-end infinite' }} />
                          )}
                          {char}
                        </span>
                      );
                    })}
                    {/* Show extra typed chars beyond word length */}
                    {isActive && input.length > word.length && (
                      <span className="text-red-400">
                        {input.slice(word.length)}
                      </span>
                    )}
                  </span>
                );
              })}
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
          <div className="flex justify-center gap-8 mt-3">
            <div>
              <p className={`text-xl font-bold text-yellow-400`}>{finishStats?.wpm ?? 0}</p>
              <p className={`text-xs ${mutedColor}`}>Net WPM</p>
            </div>
            <div>
              <p className={`text-xl font-bold text-green-400`}>{finishStats?.accuracy ?? 0}%</p>
              <p className={`text-xs ${mutedColor}`}>Accuracy</p>
            </div>
          </div>
        </div>
      )}

      <button onClick={leaveRoom} className={`mx-auto text-xs px-4 py-2 rounded-lg transition-all ${getBtn()}`}>
        Leave Race
      </button>
    </div>
  );
}