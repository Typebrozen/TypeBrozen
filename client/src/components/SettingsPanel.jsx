import { useState } from 'react';
import {
  KEY_PROFILES,
  getSoundSettings,
  setVolume,
  setMuted,
  setKeyProfile,
  previewKeySound,
} from '../utils/sounds';

/*
  ─────────────────────────────────────────────────────────────
  HOW TO ADD A NEW SETTINGS CATEGORY LATER
  1. Copy any <AccordionSection ...> block at the bottom of this file
  2. Give it a new id, icon, title and a short summary
  3. Put your buttons / switches inside it
  That's it — it will appear as a new row automatically.
  ─────────────────────────────────────────────────────────────
*/

// Small arrow that rotates when a section is open
function Chevron({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-60 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
      aria-hidden="true"
    >
      <path d="M5 8l5 5 5-5" />
    </svg>
  );
}

// One category row: icon + title + small summary + arrow. Click to open/close.
function AccordionSection({ id, icon, title, summary, openId, setOpenId, children }) {
  const open = openId === id;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-colors duration-200"
      style={{
        borderColor: open ? 'rgba(234,179,8,0.45)' : 'rgba(128,128,128,0.2)',
        backgroundColor: open ? 'rgba(128,128,128,0.08)' : 'transparent',
      }}
    >
      <button
        type="button"
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
      >
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg text-base shrink-0"
          style={{ backgroundColor: 'rgba(128,128,128,0.15)' }}
        >
          {icon}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-medium leading-tight">{title}</span>
          {summary && (
            <span className="block text-[11px] opacity-60 leading-tight mt-0.5 truncate">
              {summary}
            </span>
          )}
        </span>
        <Chevron open={open} />
      </button>

      {/* Smooth open / close */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div
          className="overflow-hidden"
          style={{
            visibility: open ? 'visible' : 'hidden',
            transition: open ? 'visibility 0s' : 'visibility 0s linear 0.2s',
          }}
        >
          <div className="px-3 pt-1 pb-3 flex flex-col gap-3">{children}</div>
        </div>
      </div>
    </div>
  );
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
  const [openId, setOpenId] = useState(null); // which category is open (none at start)

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

  const activeProfileLabel = KEY_PROFILES.find((p) => p.id === s.keyProfile)?.label;
  const soundSummary = isMuted
    ? 'Off'
    : `${volumePct}%${activeProfileLabel ? ` · ${activeProfileLabel}` : ''}`;
  const themeSummary = theme.charAt(0).toUpperCase() + theme.slice(1);
  const gameSummary = page === 'multiplayer' ? 'Race Mode is on' : 'Race with friends';

  return (
    <div className="flex flex-col gap-2" onMouseDown={keepFocus}>
      <div className="px-1 pb-1">
        <p className="text-sm font-semibold leading-tight">Settings</p>
        <p className="text-[11px] opacity-60 mt-0.5">Customize your TypeHanuman</p>
      </div>

      {/* 🔊 SOUND */}
      <AccordionSection
        id="sound"
        icon="🔊"
        title="Sound"
        summary={soundSummary}
        openId={openId}
        setOpenId={setOpenId}
      >
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
      </AccordionSection>

      {/* 🎨 THEME */}
      <AccordionSection
        id="theme"
        icon="🎨"
        title="Theme"
        summary={themeSummary}
        openId={openId}
        setOpenId={setOpenId}
      >
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
      </AccordionSection>

      {/* 🎮 GAME */}
      <AccordionSection
        id="game"
        icon="🎮"
        title="Game"
        summary={gameSummary}
        openId={openId}
        setOpenId={setOpenId}
      >
        <button
          type="button"
          onClick={onRaceToggle}
          className={`btn-hover px-3 py-2 rounded-lg text-xs text-left transition-colors ${
            page === 'multiplayer' ? t.activebtn : t.btn
          }`}
        >
          {page === 'multiplayer' ? '⌨️ Back to Typing' : '🏁 Race Mode'}
        </button>
      </AccordionSection>
    </div>
  );
}