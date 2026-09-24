import { useState, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import HindiTypingTest from './components/HindiTypingTest';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerRace from './components/MultiplayerRace';
import useMultiplayer from './hooks/useMultiplayer.jsx';
import { THEMES } from './theme';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('typing');
  const [language, setLanguage] = useState('en');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const t = THEMES[theme];

  const [autoRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });

  useEffect(() => {
    if (autoRoomCode) setPage('multiplayer');
  }, [autoRoomCode]);

  // Capture install prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const {
    myId, connected, roomState, error,
    countdown, raceText, raceStarted, raceFinished, timeLimit,
    createRoom, joinRoom, startRace,
    sendProgress, sendFinished, leaveRoom, resetRace,
  } = useMultiplayer();

  const isInRace = raceStarted || (countdown !== null && countdown > 0) || raceFinished;

  return (
    <div className={`min-h-screen font-mono flex flex-col ${t.bg} ${t.text}`}>

      {/* Logo animations: continuous glow, one-time bounce-in on load, hover scale on "Hanuman" */}
      <style>{`
        @keyframes typeGlow {
          0%, 100% {
            text-shadow: 0 0 4px rgba(255,255,255,0.6), 0 0 10px rgba(255,255,255,0.35);
          }
          50% {
            text-shadow: 0 0 10px rgba(255,255,255,0.9), 0 0 22px rgba(255,255,255,0.55);
          }
        }
        @keyframes hanumanGlow {
          0%, 100% {
            text-shadow: 0 0 2px rgba(234,179,8,0.35), 0 0 5px rgba(234,179,8,0.2);
          }
          50% {
            text-shadow: 0 0 4px rgba(234,179,8,0.5), 0 0 8px rgba(234,179,8,0.3);
          }
        }
        @keyframes logoBounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          55% {
            transform: scale(1.15);
            opacity: 1;
          }
          75% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .glow-type {
          display: inline-block;
          animation: typeGlow 2s ease-in-out infinite;
          transition: transform 0.25s ease;
        }
        .glow-type:hover {
          transform: scale(1.12);
          animation-duration: 0.6s;
        }
        .glow-hanuman {
          display: inline-block;
          animation: hanumanGlow 2s ease-in-out infinite;
          transition: transform 0.25s ease;
        }
        .glow-hanuman:hover {
          transform: scale(1.12);
          animation-duration: 0.6s;
        }
        .logo-bounce-in {
          display: inline-block;
          animation: logoBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .btn-hover {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .btn-hover:hover {
          transform: scale(1.07);
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }
        .btn-hover:active {
          transform: scale(0.96);
        }
      `}</style>

      <header className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className={`text-xl font-semibold tracking-tight logo-bounce-in ${t.header}`}>
            <span className="glow-type">Type</span>
            <span className="text-yellow-500 glow-hanuman">Hanuman</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* Page Switcher */}
          <div className="flex gap-1">
            <button
              onClick={() => setPage('typing')}
              className={`btn-hover px-3 py-1.5 rounded-lg text-xs transition-colors ${page === 'typing' ? t.activebtn : t.btn}`}
            >
              ⌨️ Typing
            </button>
            <button
              onClick={() => setPage('multiplayer')}
              className={`btn-hover px-3 py-1.5 rounded-lg text-xs transition-colors ${page === 'multiplayer' ? t.activebtn : t.btn}`}
            >
              🏁 Race
            </button>
          </div>

          {/* Language Toggle — only on typing page */}
          {page === 'typing' && (
            <div className="flex gap-1">
              <button
                onClick={() => setLanguage('en')}
                className={`btn-hover px-3 py-1.5 rounded-lg text-xs transition-colors ${language === 'en' ? t.activebtn : t.btn}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`btn-hover px-3 py-1.5 rounded-lg text-xs transition-colors ${language === 'hi' ? t.activebtn : t.btn}`}
                style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
              >
                हिं
              </button>
            </div>
          )}

          {/* Theme Switcher */}
          <div className="flex gap-1">
            {Object.keys(THEMES).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={`btn-hover px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${theme === th ? t.activebtn : t.btn}`}
              >
                {th}
              </button>
            ))}
          </div>

          {/* Install Button */}
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="btn-hover px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              ⬇️ Install App
            </button>
          )}
        </div>
      </header>

      {/*
        Page shell: [gutter] [content, capped width] [gutter].
        On phones/small laptops there's no room for gutters, so they
        shrink to zero and content gets the full screen — nothing wasted,
        nothing cut off. On a big monitor or TV, content stays a
        comfortable, readable width in the center, and the leftover space
        on both sides is exactly where future ad slots go — no rework
        needed later, just fill those columns when ready.
      */}
      <main
        className="flex-1 grid"
        style={{ gridTemplateColumns: "minmax(0,1fr) min(100%, 64rem) minmax(0,1fr)" }}
      >
        <div aria-hidden="true" />

        <div className="flex flex-col px-4 pb-6 min-w-0">

        {/* Typing Pages */}
        {page === 'typing' && language === 'en' && (
          <TypingTest theme={theme} themeStyles={t} />
        )}

        {page === 'typing' && language === 'hi' && (
          <HindiTypingTest theme={theme} themeStyles={t} />
        )}

        {/* Multiplayer */}
        {page === 'multiplayer' && !isInRace && (
          <MultiplayerLobby
            theme={theme} themeStyles={t} myId={myId}
            connected={connected} roomState={roomState} error={error}
            createRoom={createRoom} joinRoom={joinRoom}
            startRace={startRace} leaveRoom={leaveRoom}
            autoRoomCode={autoRoomCode}
          />
        )}

        {page === 'multiplayer' && isInRace && (
          <MultiplayerRace
            theme={theme} themeStyles={t} myId={myId} roomState={roomState}
            raceText={raceText} raceStarted={raceStarted}
            raceFinished={raceFinished} countdown={countdown}
            sendProgress={sendProgress} sendFinished={sendFinished}
            leaveRoom={leaveRoom} resetRace={resetRace}
            timeLimit={timeLimit}
          />
        )}
        </div>

        <div aria-hidden="true" />
      </main>
    </div>
  );
}