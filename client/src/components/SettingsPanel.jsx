import { useState } from 'react';
import {
  KEY_PROFILES,
  getSoundSettings,
  setVolume,
  setMuted,
  setKeyProfile,
  previewKeySound,
} from '../utils/sounds';

// Har section ke upar chhota title, dabane par khulta / band hota hai
function Section({ icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-1 py-2 text-[11px] uppercase tracking-widest opacity-70 hover:opacity-100 transition-opacity"
      >
        <span>
          {icon} {title}
        </span>
        <span className="text-[9px]">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-1 pb-3 flex flex-col gap-2.5">{children}</div>}
    </div>
  );
}

function Divider() {
  return <div className="h-px" style={{ backgroundColor: 'rgba(128,128,128,0.2)' }} />;
}

// ON / OFF switch
function Switch({ on, onClick, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className="flex items-center justify-between w-full text-xs py-0.5"
    >
      <span>{label}</span>
      <span
        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
          on ? 'bg-yellow-500' : 'bg-gray-500/40'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-4' : ''
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPanel({
  themeStyles: t,
  theme,
  themes,
  onThemeChange,
  page,
  onRaceToggle,
}) {
  const [s, setS] = useState(getSoundSettings);

  const refresh = () => setS(getSoundSettings());
  const isMuted = s.muted || s.volume === 0;
  const volumePct = Math.round(s.volume * 100);

  const toggleSound = () => {
    if (s.volume === 0) setVolume(0.5);
    setMuted(!isMuted);
    refresh();
  };

  const changeVolume = (delta) => {
    const next = Math.min(1, Math.max(0, Math.round((s.volume + delta) * 10) / 10));
    setVolume(next);
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
    <div className="flex flex-col" onMouseDown={keepFocus}>
      <p className="px-1 pb-2 text-sm font-semibold">Settings</p>
      <Divider />

      {/* 🔊 SOUND */}
      <Section icon="🔊" title="Sound">
        <Switch on={!isMuted} onClick={toggleSound} label="Sound on" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeVolume(-0.1)}
            aria-label="Volume down"
            className={`btn-hover w-7 h-7 rounded-lg text-sm font-bold transition-colors ${t.btn}`}
          >
            −
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-gray-500/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-yellow-500 transition-all"
              style={{ width: `${isMuted ? 0 : volumePct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => changeVolume(0.1)}
            aria-label="Volume up"
            className={`btn-hover w-7 h-7 rounded-lg text-sm font-bold transition-colors ${t.btn}`}
          >
            +
          </button>
          <span className="text-[11px] w-8 text-right font-mono opacity-70">
            {isMuted ? '0%' : `${volumePct}%`}
          </span>
        </div>

        <p className="text-[10px] opacity-60 -mb-1">Keyboard sound (tap to hear)</p>
        <div className="grid grid-cols-2 gap-1.5">
          {KEY_PROFILES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => pickProfile(p.id)}
              className={`btn-hover px-2 py-1.5 rounded-lg text-[11px] leading-tight text-center transition-colors ${
                s.keyProfile === p.id ? t.activebtn : t.btn
              }`}
            >
              {s.keyProfile === p.id ? '✓ ' : ''}
              {p.label}
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* 🎨 THEME */}
      <Section icon="🎨" title="Theme">
        <div className="flex gap-1.5">
          {themes.map((th) => (
            <button
              key={th}
              type="button"
              onClick={() => onThemeChange(th)}
              className={`btn-hover flex-1 px-2 py-1.5 rounded-lg text-[11px] capitalize text-center transition-colors ${
                theme === th ? t.activebtn : t.btn
              }`}
            >
              {th}
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* 🏁 GAME */}
      <Section icon="🏁" title="Game">
        <button
          type="button"
          onClick={onRaceToggle}
          className={`btn-hover px-3 py-2 rounded-lg text-xs text-left transition-colors ${
            page === 'multiplayer' ? t.activebtn : t.btn
          }`}
        >
          {page === 'multiplayer' ? '⌨️ Back to Typing' : '🏁 Race Mode'}
        </button>
      </Section>
    </div>
  );
}