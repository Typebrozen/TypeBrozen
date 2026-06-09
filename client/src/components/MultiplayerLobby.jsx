import { useState, useEffect } from 'react';

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
  const [showSharePopup, setShowSharePopup] = useState(false);

  const emojis = ['🏎️', '🚀', '🐱', '🥷', '🦁', '🦄', '🤖', '🦊'];

  const getBtn = (active) => {
    return active
      ? 'bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md'
      : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold py-3 px-6 rounded-lg transition';
  };

  const handleStartRace = () => {
    const text = useCustom && customText.trim() ? customText.trim() : selectedText.text;
    startRace(text);
  };

  const shareRoomLink = async () => {
    const roomLink = `${window.location.origin}?room=${roomState.code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my TypeHanuman Race!',
          text: `Join my typing race! Room code: ${roomState.code}`,
          url: roomLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(roomLink);
        setShowSharePopup(true);
        setTimeout(() => setShowSharePopup(false), 3000);
      } catch (err) {
        alert('Failed to copy link');
      }
    }
  };

  // WAITING ROOM (when in a room)
  if (roomState) {
    const isHost = roomState.hostId === myId;

    return (
      <div className="max-w-lg mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl text-zinc-100 space-y-6">
        {showSharePopup && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            ✅ Link copied!
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Room Code</p>
          <p className="text-5xl font-black tracking-widest text-yellow-500 font-mono">{roomState.code}</p>
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(roomState.code)}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg"
            >
              📋 Copy Code
            </button>
            <button
              onClick={shareRoomLink}
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg"
            >
              🔗 Share Link
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Players ({roomState.players?.length || 0}/8)
          </h3>
          <div className="space-y-2">
            {roomState.players?.map((player) => (
              <div key={player.id} className="flex items-center gap-3 bg-zinc-800 p-3 rounded-lg">
                <span className="text-2xl">{player.emoji}</span>
                <span className="font-bold flex-1">{player.name}</span>
                {player.id === roomState.hostId && (
                  <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">HOST</span>
                )}
                {player.id === myId && (
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded">YOU</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">📝 Choose Race Text</h3>
            <div className="flex gap-2 mb-3">
              <button onClick={() => setUseCustom(false)} className={`px-3 py-1.5 rounded-lg text-xs ${!useCustom ? 'bg-yellow-500 text-black' : 'bg-zinc-800'}`}>Preset</button>
              <button onClick={() => setUseCustom(true)} className={`px-3 py-1.5 rounded-lg text-xs ${useCustom ? 'bg-yellow-500 text-black' : 'bg-zinc-800'}`}>Custom</button>
            </div>
            {!useCustom ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {PRESET_TEXTS.map(p => (
                  <button key={p.title} onClick={() => setSelectedText(p)} className={`w-full text-left px-4 py-3 rounded-xl text-sm ${selectedText.title === p.title ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-zinc-800'}`}>
                    {p.title} <span className="text-xs opacity-60">({p.text.split(' ').length} words)</span>
                  </button>
                ))}
              </div>
            ) : (
              <textarea value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Paste your paragraph..." className="w-full h-28 bg-zinc-950 border rounded-xl p-3 text-sm" />
            )}
          </div>
        )}

        <div className="space-y-3">
          {isHost ? (
            <button onClick={handleStartRace} disabled={roomState.players?.length < 2} className={`w-full py-3 rounded-lg font-bold ${roomState.players?.length < 2 ? 'bg-zinc-700 opacity-50' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
              {roomState.players?.length < 2 ? `Need 2+ players (${roomState.players?.length}/2)` : '🏁 Start Race!'}
            </button>
          ) : (
            <div className="w-full py-3 rounded-lg bg-zinc-800 text-center text-sm">⏳ Waiting for host to start...</div>
          )}
          <button onClick={leaveRoom} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg">Leave Room</button>
        </div>
      </div>
    );
  }

  // LOBBY VIEW (when not in a room)
  return (
    <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-black text-center mb-6 text-yellow-500">Multiplayer Race</h2>
      
      {error && <div className="bg-red-950/50 border border-red-800 text-red-400 p-3 rounded-lg text-sm text-center mb-4">{error}</div>}
      
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? 'Connected' : 'Connecting...'}</span>
      </div>

      <input type="text" placeholder="Your Name" maxLength={15} value={playerName} onChange={e => setPlayerName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 mb-4" />
      
      <div className="mb-6">
        <label className="text-xs mb-2 block">Avatar {playerEmoji}</label>
        <div className="grid grid-cols-4 gap-2">
          {emojis.map(emo => (
            <button key={emo} onClick={() => setPlayerEmoji(emo)} className={`text-2xl p-2 rounded-xl ${playerEmoji === emo ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-zinc-800'}`}>{emo}</button>
          ))}
        </div>
      </div>

      <button onClick={() => createRoom(playerName, playerEmoji)} disabled={!playerName.trim()} className={`w-full py-3 rounded-lg font-bold mb-4 ${!playerName.trim() ? 'bg-zinc-700 opacity-50' : 'bg-yellow-500 text-black'}`}>🏠 Create Room</button>
      
      <div className="text-center text-zinc-600 my-2">OR</div>
      
      <input type="text" placeholder="Room Code" maxLength={8} value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-center font-mono mb-3" />
      <button onClick={() => joinRoom(roomCode, playerName, playerEmoji)} disabled={!playerName.trim() || !roomCode.trim()} className={`w-full py-3 rounded-lg font-bold ${!playerName.trim() || !roomCode.trim() ? 'bg-zinc-700 opacity-50' : 'bg-yellow-500 text-black'}`}>🔗 Join Room</button>
    </div>
  );
}