import { useState } from 'react';
import {
  KEY_PROFILES,
  getSoundSettings,
  setVolume,
  setMuted,
  setKeyProfile,
  previewKeySound,
} from '../utils/sounds';

export default function SoundSettings({ themeStyles: t }) {
  const [s, setS] = useState(getSoundSettings);

  const refresh = () => setS(getSoundSettings());
  const volumePct = Math.round(s.volume * 100);
  const isMuted = s.muted || s.volume === 0;

  const changeVolume = (delta) => {
    const next = Math.min(1, Math.max(0, Math.round((s.volume + delta) * 10) / 10));
    setVolume(next);
    refresh();
  };

  const toggleMute = () => {
    if (s.volume === 0) setVolume(0.5);
    setMuted(!s.muted);
    refresh();
  };

  const pickProfile = (id) => {
    setKeyProfile(id);
    refresh();
    previewKeySound(id);
  };

  // Click karne par typing box ka focus na hate
  const keepFocus = (e) => e.preventDefault();

  return (
    <div className="flex flex-col gap-2" onMouseDown={keepFocus}>
      <p className="text-[10px] uppercase tracking-wider opacity-60">Sound</p>

      {/* Sound ON / OFF */}
      <button
        type="button"
        onClick={toggleMute}
        className={`btn-hover px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${isMuted ? t.btn : t.activebtn}`}
      >
        {isMuted ? '🔇 Sound: OFF (tap to turn on)' : '🔊 Sound: ON (tap to mute)'}
      </button>

      {/* Volume */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => changeVolume(-0.1)}
          aria-label="Volume down"
          className={`btn-hover w-8 h-8 rounded-lg text-base font-bold transition-colors ${t.btn}`}
        >
          −
        </button>
        <div className="flex-1">
          <p className="text-[10px] opacity-60 text-center mb-1">Volume {isMuted ? '0%' : `${volumePct}%`}</p>
          <div className="h-1.5 rounded-full bg-gray-500/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all"
              style={{ width: `${isMuted ? 0 : volumePct}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => changeVolume(0.1)}
          aria-label="Volume up"
          className={`btn-hover w-8 h-8 rounded-lg text-base font-bold transition-colors ${t.btn}`}
        >
          +
        </button>
      </div>

      {/* Keyboard sound type */}
      <p className="text-[10px] uppercase tracking-wider opacity-60 mt-1">Keyboard sound (tap to hear)</p>
      <div className="flex flex-col gap-1">
        {KEY_PROFILES.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pickProfile(p.id)}
            className={`btn-hover px-3 py-1.5 rounded-lg text-xs text-left transition-colors ${
              s.keyProfile === p.id ? t.activebtn : t.btn
            }`}
          >
            {s.keyProfile === p.id ? '✓ ' : ''}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}