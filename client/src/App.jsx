import { useState, useEffect } from 'react';
import TypingTest from './components/TypingTest';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerRace from './components/MultiplayerRace';
import useMultiplayer from './hooks/useMultiplayer.jsx';

const THEMES = {
  dark: {
    bg: 'bg-zinc-950',
    text: 'text-zinc-100',
    header: 'text-zinc-100',
    sub: 'text-zinc-500',
    btn: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
    activebtn: 'bg-zinc-100 text-zinc-900',
  },
  light: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    header: 'text-gray-900',
    sub: 'text-gray-500',
    btn: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    activebtn: 'bg-gray-900 text-white',
  },
  sepia: {
    bg: 'bg-[#f4f0e8]',
    text: 'text-[#5a4a2e]',
    header: 'text-[#5a4a2e]',
    sub: 'text-[#a0906e]',
    btn: 'bg-[#e8e0d0] hover:bg-[#ddd5c0] text-[#5a4a2e]',
    activebtn: 'bg-[#5a4a2e] text-[#f4f0e8]',
  },
};

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('typing');
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

    // Check if already installed
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

      <header className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className={`text-xs ${t.sub}`}>Jai Shree Ram</p>
          <h1 className={`text-xl font-semibold tracking-tight ${t.header}`}>
            TypeHanuman
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            <button
              onClick={() => setPage('typing')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${page === 'typing' ? t.activebtn : t.btn}`}
            >
              ⌨️ Typing
            </button>
            <button
              onClick={() => setPage('multiplayer')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${page === 'multiplayer' ? t.activebtn : t.btn}`}
            >
              🏁 Race
            </button>
          </div>

          <div className="flex gap-1">
            {Object.keys(THEMES).map((th) => (
              <button
                key={th}
                onClick={() => setTheme(th)}
                className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-colors ${theme === th ? t.activebtn : t.btn}`}
              >
                {th}
              </button>
            ))}
          </div>

          {/* Install Button */}
          {installPrompt && !isInstalled && (
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105 bg-yellow-500 hover:bg-yellow-400 text-black"
            >
              ⬇️ Install App
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col px-4 pb-6">
        {page === 'typing' && (
          <TypingTest theme={theme} themeStyles={t} />
        )}

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
            theme={theme} myId={myId} roomState={roomState}
            raceText={raceText} raceStarted={raceStarted}
            raceFinished={raceFinished} countdown={countdown}
            sendProgress={sendProgress} sendFinished={sendFinished}
            leaveRoom={leaveRoom} resetRace={resetRace}
            timeLimit={timeLimit}
          />
        )}
      </main>

      {/* Install Banner — Mobile */}
      {installPrompt && !isInstalled && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-yellow-500 text-black flex items-center justify-between gap-3 z-50">
          <div>
            <p className="font-bold text-sm">Install TypeHanuman!</p>
            <p className="text-xs opacity-70">Offline typing + faster loading</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setInstallPrompt(null)}
              className="px-3 py-1.5 rounded-lg text-xs bg-black/20 hover:bg-black/30 transition"
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-black text-white hover:bg-black/80 transition"
            >
              Install ⬇️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}