import { useState, useEffect } from 'react';

const AVATARS = [
  { id: 1, emoji: '🏎️', name: 'Racer', color: 'from-red-500 to-orange-500' },
  { id: 2, emoji: '🐅', name: 'Tiger', color: 'from-orange-500 to-yellow-500' },
  { id: 3, emoji: '🦅', name: 'Eagle', color: 'from-blue-500 to-cyan-500' },
  { id: 4, emoji: '🐍', name: 'Python', color: 'from-green-500 to-emerald-500' },
  { id: 5, emoji: '🐺', name: 'Wolf', color: 'from-gray-500 to-slate-500' },
  { id: 6, emoji: '🐉', name: 'Dragon', color: 'from-purple-500 to-pink-500' },
  { id: 7, emoji: '🦁', name: 'Lion', color: 'from-amber-500 to-yellow-600' },
  { id: 8, emoji: '🐧', name: 'Penguin', color: 'from-cyan-500 to-blue-600' },
];

export default function JoinRace({ roomId, onJoin, theme }) {
  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [challenge, setChallenge] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load challenge data from localStorage
    const challengeData = localStorage.getItem(`challenge_${roomId}`);
    if (challengeData) {
      setChallenge(JSON.parse(challengeData));
    } else {
      setError('Challenge not found or expired');
    }
  }, [roomId]);

  const handleJoin = () => {
    if (!playerName.trim()) return;
    
    const player = {
      id: Date.now(),
      name: playerName.trim(),
      avatar: selectedAvatar,
      isBot: false,
    };
    
    // Store join request in localStorage for host to see
    localStorage.setItem(`room_${roomId}_join`, JSON.stringify(player));
    
    onJoin(player, challenge);
  };

  const getGlassStyle = () => {
    if (theme === 'dark') return 'bg-white/5 border-white/10 hover:bg-white/10';
    if (theme === 'sepia') return 'bg-black/10 border-amber-800/20 hover:bg-black/20';
    return 'bg-black/5 border-gray-300/30 hover:bg-black/10';
  };

  const getTextColor = () => {
    if (theme === 'dark') return 'text-white';
    if (theme === 'sepia') return 'text-[#5a4a2e]';
    return 'text-gray-800';
  };

  const getMutedColor = () => {
    if (theme === 'dark') return 'text-white/40';
    if (theme === 'sepia') return 'text-[#8a6e4a]';
    return 'text-gray-500';
  };

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className={`mt-4 px-4 py-2 rounded-xl ${getGlassStyle()} ${getTextColor()}`}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 max-w-md mx-auto w-full p-6 ${getGlassStyle()} rounded-2xl`}>
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${getTextColor()}`}>🏁 Join Race</h2>
        <p className={`text-sm ${getMutedColor()}`}>Room: {roomId}</p>
      </div>
      
      {challenge && (
        <div className={`p-3 rounded-xl text-xs ${getMutedColor()} ${getGlassStyle()}`}>
          <p>📝 Challenge: {challenge.text.substring(0, 100)}...</p>
          <p>⏱️ Time Limit: {challenge.timeLimit === 60 ? '1 min' : challenge.timeLimit === 120 ? '2 min' : `${challenge.timeLimit} sec`}</p>
        </div>
      )}
      
      <div className="flex justify-center">
        <div className={`text-6xl bg-gradient-to-br ${selectedAvatar.color} rounded-full w-24 h-24 flex items-center justify-center`}>
          {selectedAvatar.emoji}
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        {AVATARS.slice(0, 6).map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => setSelectedAvatar(avatar)}
            className={`text-2xl p-2 rounded-xl transition-all ${selectedAvatar.id === avatar.id ? getGlassStyle() : 'opacity-50'}`}
          >
            {avatar.emoji}
          </button>
        ))}
      </div>
      
      <input
        type="text"
        placeholder="Your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl text-sm outline-none ${getGlassStyle()} ${getTextColor()}`}
        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
      />
      
      <button
        onClick={handleJoin}
        disabled={!playerName.trim()}
        className={`py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 ${
          !playerName.trim()
            ? 'opacity-50 cursor-not-allowed bg-gray-500'
            : theme === 'dark' ? 'bg-white text-black' : theme === 'sepia' ? 'bg-[#5a4a2e] text-white' : 'bg-gray-800 text-white'
        }`}
      >
        Join Race 🏁
      </button>
    </div>
  );
}