import { useState } from 'react';
import TypingTest from './components/TypingTest';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerRace from './components/MultiplayerRace';
import useMultiplayer from './hooks/useMultiplayer.jsx';
import logo from './assets/logo.jpg';

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
  const t = THEMES[theme];

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
        <div className="flex items-center gap-2">
          <img src={logo} alt="TypeHanuman" className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg" />
          <div>
            <h1 className={`text-xl font-semibold tracking-tight ${t.header}`}>
              TypeHanuman
            </h1>
            <p className={`text-xs ${t.sub}`}>Jai Shree Ram 🙏</p>
          </div>
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
    </div>
  );
}