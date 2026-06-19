import { useCallback, useEffect, useRef, useState } from 'react';

import keySoundFile from '../assets/key.mp3';
import errorSoundFile from '../assets/error.mp3';
import finishSoundFile from '../assets/finish.mp3';

const keySound = new Audio(keySoundFile);
const errorSound = new Audio(errorSoundFile);
const finishSound = new Audio(finishSoundFile);

keySound.volume = 0.08;
errorSound.volume = 0.12;
finishSound.volume = 0.2;

const WORD_COUNT = 200;

export default function useTypingTest(mode = 'time', customWords = [], duration = 60) {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [incorrectWords, setIncorrectWords] = useState(0);
  const [wordStatuses, setWordStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(duration);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [consistencyScore, setConsistencyScore] = useState(0);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [personalBest, setPersonalBest] = useState(() => {
    const saved = localStorage.getItem('typing_personal_best');
    return saved ? parseInt(saved) : 0;
  });
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [keyErrors, setKeyErrors] = useState({});

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);
  const correctWordsRef = useRef(0);
  const incorrectWordsRef = useRef(0);
  const durationRef = useRef(duration);
  const isCurrentWordWrong = useRef(false);
  const lastWpmUpdateRef = useRef(0);
  const isFinishingRef = useRef(false);
  const wpmHistoryRef = useRef([]);

  correctWordsRef.current = correctWords;
  incorrectWordsRef.current = incorrectWords;

  useEffect(() => {
    durationRef.current = duration;
    setTimeLeft(duration);
  }, [duration]);

  // Net WPM = correctWords per minute - errorWords per minute
  const calcNetWpm = useCallback((elapsedMs) => {
    const minutes = Math.max(elapsedMs / 60000, 1 / 60000);
    const grossWpm = (correctWordsRef.current + incorrectWordsRef.current) / minutes;
    const netWpm = Math.max(0, Math.round(correctWordsRef.current / minutes - incorrectWordsRef.current / minutes));
    const total = correctWordsRef.current + incorrectWordsRef.current;
    const accuracy = total === 0 ? 100 : Math.round((correctWordsRef.current / total) * 100);
    return { wpm: netWpm, grossWpm: Math.round(grossWpm), accuracy };
  }, []);

  const calculateConsistencyScore = useCallback((wpmValues) => {
    if (wpmValues.length < 2) return 100;
    const avg = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
    if (avg === 0) return 100;
    const variance = wpmValues.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / wpmValues.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg;
    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
  }, []);

  const trackKeyError = useCallback((char) => {
    setKeyErrors(prev => ({ ...prev, [char]: (prev[char] || 0) + 1 }));
  }, []);

  const stopAllTimers = useCallback(() => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const finishTest = useCallback(() => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    stopAllTimers();
    finishSound.currentTime = 0;
    finishSound.play().catch(() => {});
    const elapsed = startTimeRef.current ? Date.now() - startTimeRef.current : 0;
    const stats = calcNetWpm(elapsed);
    const consistency = calculateConsistencyScore(wpmHistoryRef.current);
    setFinished(true);
    setStarted(false);
    setWpm(stats.wpm);
    setAccuracy(stats.accuracy);
    setConsistencyScore(consistency);
    setPersonalBest(prev => {
      if (stats.wpm > prev && stats.wpm > 0) {
        localStorage.setItem('typing_personal_best', stats.wpm.toString());
        setIsNewRecord(true);
        return stats.wpm;
      }
      return prev;
    });
  }, [stopAllTimers, calcNetWpm, calculateConsistencyScore]);

  const loadWords = useCallback(async () => {
    if (mode === 'custom') { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/words?count=${WORD_COUNT}`);
      if (!res.ok) throw new Error('Failed to load words');
      const data = await res.json();
      setWords(data.words);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadWords(); }, [loadWords]);

  // TIMER
  useEffect(() => {
    if (!started || finished) return;
    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          setTimeout(() => finishTest(), 0);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const stats = calcNetWpm(elapsed);
      setWpm(stats.wpm);
      setAccuracy(stats.accuracy);
      const now = Math.floor(elapsed / 1000);
      if (now - lastWpmUpdateRef.current >= 2 && now > 0) {
        lastWpmUpdateRef.current = now;
        wpmHistoryRef.current = [...wpmHistoryRef.current, stats.wpm];
        setWpmHistory([...wpmHistoryRef.current]);
        setConsistencyScore(calculateConsistencyScore(wpmHistoryRef.current));
      }
    }, 100);

    return () => stopAllTimers();
  }, [started, finished, finishTest, calcNetWpm, calculateConsistencyScore, stopAllTimers]);

  const reset = useCallback(() => {
    stopAllTimers();
    isFinishingRef.current = false;
    startTimeRef.current = null;
    wpmHistoryRef.current = [];
    lastWpmUpdateRef.current = 0;
    isCurrentWordWrong.current = false;
    setInput('');
    setWordIndex(0);
    setCorrectWords(0);
    setIncorrectWords(0);
    setWordStatuses({});
    setTimeLeft(durationRef.current);
    setStarted(false);
    setFinished(false);
    setWpm(0);
    setAccuracy(100);
    setBestStreak(0);
    setCurrentStreak(0);
    setWpmHistory([]);
    setConsistencyScore(0);
    setIsNewRecord(false);
    setKeyErrors({});
    loadWords();
  }, [stopAllTimers, loadWords]);

  const activeWords = mode === 'custom' ? customWords : words;

  const handleInput = useCallback((value) => {
    if (finished || activeWords.length === 0) return;

    if (!started && value.length > 0) {
      setStarted(true);
      startTimeRef.current = Date.now();
    }

    const currentWord = activeWords[wordIndex] ?? '';

    // Space — move to next word
    if (value.endsWith(' ')) {
      const typedWord = value.trim();
      const isCorrect = typedWord === currentWord;

      // Update word status
      setWordStatuses(prev => ({ ...prev, [wordIndex]: isCorrect ? 'correct' : 'incorrect' }));

      if (isCorrect) {
        keySound.currentTime = 0;
        keySound.play().catch(() => {});
        setCorrectWords(c => c + 1);
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          setBestStreak(best => Math.max(best, newStreak));
          return newStreak;
        });
      } else {
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
        setIncorrectWords(c => c + 1);
        setCurrentStreak(0);
        // Track which keys were wrong
        typedWord.split('').forEach((char, i) => {
          if (char !== currentWord[i]) trackKeyError(char);
        });
      }

      const nextIndex = wordIndex + 1;
      setWordIndex(nextIndex);
      setInput('');
      isCurrentWordWrong.current = false;

      if (mode === 'custom' && nextIndex >= activeWords.length) {
        finishTest();
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
        isCurrentWordWrong.current = true;
        errorSound.currentTime = 0;
        errorSound.play().catch(() => {});
        trackKeyError(newChar);
      }
    }

    setInput(value);
  }, [finished, activeWords, wordIndex, input, started, finishTest, mode, trackKeyError]);

  const getCharStatus = useCallback((wIndex, charIndex) => {
    const word = activeWords[wIndex];
    if (!word) return 'pending';
    if (wIndex > wordIndex) return 'pending';
    if (wIndex < wordIndex) {
      return wordStatuses[wIndex] === 'correct' ? 'correct' : 'incorrect';
    }
    const typed = input;
    if (charIndex < typed.length) {
      return typed[charIndex] === word[charIndex] ? 'correct' : 'incorrect';
    }
    if (charIndex === typed.length) return 'current';
    return 'pending';
  }, [wordIndex, activeWords, input, wordStatuses]);

  return {
    words: activeWords,
    loading,
    error,
    input,
    wordIndex,
    wordStatuses,
    timeLeft,
    started,
    finished,
    wpm,
    accuracy,
    consistencyScore,
    bestStreak,
    personalBest,
    isNewRecord,
    keyErrors,
    wpmHistory,
    handleInput,
    reset,
    getCharStatus,
    loadWords,
  };
}