import { useEffect, useRef, useState } from 'react';
import {
  KEY_PROFILES,
  getSoundSettings,
  setVolume,
  setMuted,
  setKeyProfile,
  previewKeySound,
} from '../utils/sounds';

export default function SoundControls({ themeStyles: t }) {
  const [s, setS] = useState(getSoundSettings);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const refresh = () => setS(getSoundSettings());

  // Bahar click karne par panel band ho jaye
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

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
    <div className="relative" ref={wrapRef}>
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={toggleMute}
          title={isMuted ? 'Sound on karo' : 'Sound band karo'}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${t.glassButton} ${t.textNormal}`}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          type="button"
          onMouseDown={keepFocus}
          onClick={() => setOpen((o) => !o)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${open ? t.glassButtonActive : t.glassButton} ${t.textNormal}`}
        >
          🎹 Sound {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div
          onMouseDown={keepFocus}
          className={`absolute right-0 mt-2 w-72 p-4 rounded-2xl shadow-2xl z-50 backdrop-blur-xl ${t.glassCard}`}
        >
          {/* Volume */}
          <p className={`text-xs uppercase tracking-wider mb-2 ${t.textMuted}`}>Volume</p>
          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => changeVolume(-0.1)}
              className={`w-9 h-9 rounded-lg text-lg font-bold transition-all ${t.glassButton} ${t.textNormal}`}
            >
              −
            </button>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-yellow-400 transition-all"
                style={{ width: `${isMuted ? 0 : volumePct}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => changeVolume(0.1)}
              className={`w-9 h-9 rounded-lg text-lg font-bold transition-all ${t.glassButton} ${t.textNormal}`}
            >
              +
            </button>
            <span className={`text-xs w-9 text-right font-mono ${t.textMuted}`}>
              {isMuted ? '0%' : `${volumePct}%`}
            </span>
          </div>

          {/* Keyboard sound type */}
          <p className={`text-xs uppercase tracking-wider mb-2 ${t.textMuted}`}>Keyboard Sound</p>
          <div className="grid grid-cols-2 gap-2">
            {KEY_PROFILES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => pickProfile(p.id)}
                className={`px-2 py-2 rounded-lg text-xs text-left transition-all ${
                  s.keyProfile === p.id ? t.glassButtonActive : t.glassButton
                } ${t.textNormal}`}
              >
                {s.keyProfile === p.id ? '✓ ' : ''}
                {p.label}
              </button>
            ))}
          </div>
          <p className={`text-[10px] mt-3 ${t.textMuted}`}>
            Kisi bhi sound par click karo, turant sunai dega.
          </p>
        </div>
      )}
    </div>
  );
}