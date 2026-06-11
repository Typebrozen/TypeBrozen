import { useState } from 'react';

const PRESET_TEXTS = [
  {
    title: '🌍 Countries of the World',
    text: 'There are more than 195 countries in the world spread across seven continents each with its own culture history language and traditions. Asia is the largest and most populated continent in the world known as the birthplace of many ancient civilizations religions and inventions. Africa is often called the cradle of humanity because some of the earliest human civilizations began there. Europe is known for its rich history art science and architecture. North America is a continent filled with natural wonders advanced cities and diverse cultures. South America is known for the Amazon Rainforest the Andes Mountains and colorful traditions.',
  },
  {
    title: '🗳️ What is Democracy',
    text: 'Democracy is a system of government where the people of a country choose their leaders by voting. In simple words democracy means rule by the people. Instead of one king or dictator controlling everything the citizens have the power to decide who will lead the country. In a democracy people vote in elections every few years. Different political parties and leaders explain their ideas plans and promises to the public. Citizens then choose the leaders they trust the most. Every citizen has equal rights and an equal vote. Laws apply to everyone equally including leaders.',
  },
  {
    title: '⚖️ What is Socialism',
    text: 'Socialism is a political and economic system where the government controls important things like healthcare education transportation electricity and water so that everyone in society can benefit equally. The main idea of socialism is fairness making sure rich and poor people both have access to basic needs and opportunities. Socialism believes that a country wealth and resources should help all people not only a small number of rich individuals. It tries to reduce the gap between the rich and the poor.',
  },
  {
    title: '👨‍👩‍👧 Why Parents Want Engineers',
    text: 'In India many parents dream that their children will become engineers or doctors. This thinking has been common for many decades and comes from deep cultural economic and social reasons. Engineering has long been seen as a symbol of stability and success in India. After independence India focused heavily on industrialization and technical development. Over time this created a cultural belief that engineering equals a good life. Parents who struggled financially naturally wanted their children to have secure well paying jobs.',
  },
];

const MAX_PLAYERS = 5;
const MIN_PLAYERS = 2;
const TIME_OPTIONS = [1, 2, 3, 5, 10];

export default function MultiplayerLobby({
  theme, themeStyles, myId, connected,
  createRoom, joinRoom, error, roomState,
  startRace, leaveRoom
}) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [playerEmoji, setPlayerEmoji] = useState('🏎️');
  const [selectedText, setSelectedText] = useState(PRESET_TEXTS[0]);
  const [customText, setCustomText] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLimit, setTimeLimit] = useState(2);

  const emojis = ['🏎️', '🚀', '🐱', '🥷', '🦁', '🦄', '🤖', '🦊'];

  const handleStartRace = () => {
    const text = useCustom && customText.trim() ? customText.trim() : selectedText.text;
    startRace(text, timeLimit * 60);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomState.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── WAITING ROOM ──
  if (roomState) {
    const isHost = roomState.hostId === myId;
    const playerCount = roomState.players?.length || 0;
    const canStart = playerCount >= MIN_PLAYERS;

    return (
      <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl text-zinc-100 space-y-5">

        {/* Room Code */}
        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-5xl font-black tracking-widest text-yellow-500 font-mono">{roomState.code}</p>
          <p className="text-xs text-zinc-500 mt-1">Share this code with friends!</p>
          <button onClick={copyCode} className="mt-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg transition">
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>

        {/* Players List — Live */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
              Players
            </h3>
            <span className="text-xs font-mono text-yellow-400 font-bold">
              {playerCount}/{MAX_PLAYERS}
            </span>
          </div>

          {/* Progress bar for players */}
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-3">
            <div
              className="bg-yellow-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(playerCount / MAX_PLAYERS) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {roomState.players?.map((player, idx) => (
              <div key={player.id} className="flex items-center gap-3 bg-zinc-800 p-3 rounded-lg animate-pulse-once">
                <span className="text-xs text-zinc-500 w-4">{idx + 1}</span>
                <span className="text-2xl">{player.emoji}</span>
                <span className="font-bold flex-1">{player.name}</span>
                {player.id === roomState.hostId && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">HOST</span>
                )}
                {player.id === myId && (
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded font-bold">YOU</span>
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: MAX_PLAYERS - playerCount }).map((_, i) => (
              <div key={`empty-${i}`} className="flex items-center gap-3 bg-zinc-800/40 p-3 rounded-lg border border-dashed border-zinc-700">
                <span className="text-xs text-zinc-600 w-4">{playerCount + i + 1}</span>
                <span className="text-2xl opacity-20">👤</span>
                <span className="text-zinc-600 text-sm">Waiting for player...</span>
              </div>
            ))}
          </div>

          {playerCount < MIN_PLAYERS && (
            <p className="text-xs text-zinc-500 mt-2 text-center">
              ⏳ Need {MIN_PLAYERS - playerCount} more player{MIN_PLAYERS - playerCount > 1 ? 's' : ''} to start
            </p>
          )}
        </div>

        {/* Host Controls */}
        {isHost && (
          <>
            {/* Time Limit */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">⏱️ Time Limit</h3>
              <div className="flex gap-2 flex-wrap">
                {TIME_OPTIONS.map(t => (
                  <button key={t} onClick={() => setTimeLimit(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${timeLimit === t ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    {t} min
                  </button>
                ))}
              </div>
            </div>

            {/* Text Selection */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-2">📝 Race Text</h3>
              <div className="flex gap-2 mb-3">
                <button onClick={() => setUseCustom(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition ${!useCustom ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                  Preset
                </button>
                <button onClick={() => setUseCustom(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition ${useCustom ? 'bg-yellow-500 text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
                  Custom
                </button>
              </div>
              {!useCustom ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {PRESET_TEXTS.map(p => (
                    <button key={p.title} onClick={() => setSelectedText(p)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${selectedText.title === p.title ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                      <span className="font-medium">{p.title}</span>
                      <span className="ml-2 text-xs opacity-60">{p.text.split(' ').length} words</span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea value={customText} onChange={e => setCustomText(e.target.value)}
                  placeholder="Paste your paragraph here..."
                  className="w-full h-28 bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm resize-none outline-none text-zinc-100 placeholder-zinc-600 focus:border-yellow-500" />
              )}
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          {isHost ? (
            <button onClick={handleStartRace} disabled={!canStart}
              className={`w-full py-4 rounded-lg font-bold text-lg transition ${!canStart ? 'opacity-50 cursor-not-allowed bg-zinc-700 text-zinc-400' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
              {!canStart ? `Need ${MIN_PLAYERS - playerCount} more player${MIN_PLAYERS - playerCount > 1 ? 's' : ''}` : `🏁 Start Race! (${timeLimit} min)`}
            </button>
          ) : (
            <div className="w-full py-3 rounded-lg bg-zinc-800 text-zinc-400 text-center text-sm">
              ⏳ Waiting for host to start...
            </div>
          )}
          <button onClick={leaveRoom} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg transition">
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  // ── LOBBY ──
  return (
    <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl text-zinc-100">
      <h2 className="text-2xl font-black text-center mb-1 text-yellow-500">🏁 Multiplayer Race</h2>
      <p className="text-xs text-zinc-500 text-center mb-5">2 to 5 players • Real-time race</p>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-lg text-sm text-center mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 mb-5 text-xs">
        <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className={connected ? 'text-green-400' : 'text-red-400'}>
          {connected ? 'Connected to server' : 'Connecting...'}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Your Name</label>
          <input type="text" placeholder="Enter nickname..." maxLength={15} value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && playerName.trim() && createRoom(playerName, playerEmoji)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 transition" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Avatar {playerEmoji}</label>
          <div className="grid grid-cols-4 gap-2">
            {emojis.map(emo => (
              <button key={emo} onClick={() => setPlayerEmoji(emo)}
                className={`text-2xl p-2 rounded-xl transition ${playerEmoji === emo ? 'bg-yellow-500/20 border-2 border-yellow-500 scale-105' : 'bg-zinc-950 border border-zinc-800 opacity-60 hover:opacity-100'}`}>
                {emo}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-zinc-800" />

        <button onClick={() => createRoom(playerName, playerEmoji)} disabled={!playerName.trim()}
          className={`w-full py-3 rounded-lg font-bold transition ${!playerName.trim() ? 'opacity-50 cursor-not-allowed bg-zinc-700 text-zinc-400' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}>
          🏠 Create Room
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-xs text-zinc-600 font-bold uppercase">OR</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        <input type="text" placeholder="Room Code (e.g. ABC123)" maxLength={8} value={roomCode}
          onChange={e => setRoomCode(e.target.value.toUpperCase())}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center font-mono font-bold tracking-widest text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-yellow-500 transition" />

        <button onClick={() => joinRoom(roomCode, playerName, playerEmoji)}
          disabled={!playerName.trim() || !roomCode.trim()}
          className={`w-full py-3 rounded-lg font-bold transition ${!playerName.trim() || !roomCode.trim() ? 'opacity-50 cursor-not-allowed bg-zinc-700 text-zinc-400' : 'bg-yellow-500 hover:bg-yellow-400 text-black'}`}>
          🔗 Join Room
        </button>
      </div>
    </div>
  );
}