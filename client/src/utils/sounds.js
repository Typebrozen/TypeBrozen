// client/src/utils/sounds.js
// Saare sounds code se bante hain (Web Audio API). Koi audio file nahi, isliye delay almost zero.
// Volume, mute aur keyboard sound type yahan se control hote hain (browser mein save rehte hain).

let ctx = null;
let master = null;
let noiseBuffer = null;
let guitarBuffer = null;

const STORAGE_KEY = 'typehanuman_sound_settings';

export const KEY_PROFILES = [
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'blue', label: 'Blue Switch' },
  { id: 'thock', label: 'Soft Thock' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'bubble', label: 'Bubble Pop' },
  { id: 'retro', label: 'Retro 8-bit' },
  { id: 'laptop', label: 'Laptop Tap' },
  { id: 'off', label: 'Off (no key sound)' },
];

const DEFAULTS = { volume: 0.8, muted: false, keyProfile: 'mechanical' };

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    const profileOk = KEY_PROFILES.some((p) => p.id === parsed.keyProfile);
    return {
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : DEFAULTS.volume,
      muted: !!parsed.muted,
      keyProfile: profileOk ? parsed.keyProfile : DEFAULTS.keyProfile,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

let settings = loadSettings();

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function applyMasterGain() {
  if (master) master.gain.value = settings.muted ? 0 : settings.volume;
}

// ---------- Settings API (SoundControls isko use karega) ----------
export function getSoundSettings() {
  return { ...settings };
}

export function setVolume(v) {
  settings.volume = Math.min(1, Math.max(0, v));
  if (settings.volume > 0 && settings.muted) settings.muted = false;
  applyMasterGain();
  saveSettings();
}

export function setMuted(m) {
  settings.muted = !!m;
  applyMasterGain();
  saveSettings();
}

export function setKeyProfile(id) {
  if (!KEY_PROFILES.some((p) => p.id === id)) return;
  settings.keyProfile = id;
  saveSettings();
}

// Purane code ke saath compatible rakha hai
export function setSoundEnabled(value) {
  setMuted(!value);
}
export function isSoundEnabled() {
  return !settings.muted;
}

// ---------- Audio engine ----------
function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.connect(ctx.destination);
    applyMasterGain();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function out() {
  return master;
}

function canPlay() {
  return !settings.muted && settings.volume > 0;
}

// Pehli click ya key par audio ko ready kar do, taaki pehle hi key par delay na ho
export function unlockAudio() {
  const c = getCtx();
  if (c) prepareBuffers(c);
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

function prepareBuffers(c) {
  // Click ke liye white noise buffer
  if (!noiseBuffer) {
    const len = Math.floor(c.sampleRate * 0.08);
    noiseBuffer = c.createBuffer(1, len, c.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }

  // Guitar pluck (Karplus-Strong) ek baar pehle se bana ke rakh lo
  if (!guitarBuffer) {
    const sr = c.sampleRate;
    const freq = 146.83; // D3
    const dur = 0.7;
    const N = Math.round(sr / freq);
    const total = Math.floor(sr * dur);
    guitarBuffer = c.createBuffer(1, total, sr);
    const d = guitarBuffer.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (let i = N; i < total; i++) {
      const prev = i - N - 1 >= 0 ? d[i - N - 1] : d[i - N];
      d[i] = 0.5 * (d[i - N] + prev) * 0.997;
    }
  }
}

// Ek note bajane ka helper
function tone(c, freq, start, dur, type = 'sine', vol = 0.2) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.001, start + dur);
  o.connect(g).connect(out());
  o.start(start);
  o.stop(start + dur + 0.05);
}

// Noise ka chhota burst (click jaisi awaaz ke liye)
function noiseBurst(c, t, { type = 'bandpass', freq = 2500, q = 1, vol = 0.5, dur = 0.04, rate = 1 }) {
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
  src.playbackRate.value = rate * (0.92 + Math.random() * 0.16);
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(f).connect(g).connect(out());
  src.start(t);
  src.stop(t + dur + 0.02);
}

// Frequency sweep wali awaaz (thock / pop ke liye)
function sweep(c, t, { type = 'sine', from = 200, to = 70, vol = 0.4, dur = 0.07, attack = 0 }) {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + dur * 0.8);
  const g = c.createGain();
  if (attack > 0) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
  } else {
    g.gain.setValueAtTime(vol, t);
  }
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g).connect(out());
  o.start(t);
  o.stop(t + dur + 0.02);
}

// ---------- 7 keyboard sound types ----------
const KEY_PLAYERS = {
  // ⌨️ Mechanical: crisp click + low thock
  mechanical(c, t) {
    noiseBurst(c, t, { freq: 2200 + Math.random() * 900, q: 0.9, vol: 0.55, dur: 0.04 });
    sweep(c, t, { from: 170 + Math.random() * 30, to: 65, vol: 0.45, dur: 0.07 });
  },

  // 🔵 Blue Switch: tez, clicky, double-click
  blue(c, t) {
    noiseBurst(c, t, { freq: 4200 + Math.random() * 600, q: 1.4, vol: 0.55, dur: 0.025 });
    noiseBurst(c, t + 0.028, { freq: 3000, q: 1.1, vol: 0.35, dur: 0.03 });
    sweep(c, t, { type: 'triangle', from: 1100, to: 450, vol: 0.12, dur: 0.04 });
  },

  // 🪵 Soft Thock: gehri, naram, shaant awaaz
  thock(c, t) {
    noiseBurst(c, t, { type: 'lowpass', freq: 900, q: 0.7, vol: 0.4, dur: 0.05 });
    sweep(c, t, { from: 140 + Math.random() * 20, to: 55, vol: 0.55, dur: 0.1 });
  },

  // 📠 Typewriter: metal ping + thud
  typewriter(c, t) {
    noiseBurst(c, t, { freq: 1800 + Math.random() * 400, q: 0.8, vol: 0.6, dur: 0.05 });
    sweep(c, t, { from: 110, to: 60, vol: 0.45, dur: 0.08 });
    tone(c, 2600 + Math.random() * 300, t + 0.005, 0.07, 'triangle', 0.07);
  },

  // 🫧 Bubble Pop: chhota sa pop
  bubble(c, t) {
    const base = 380 + Math.random() * 160;
    sweep(c, t, { from: base, to: base * 2.2, vol: 0.32, dur: 0.07, attack: 0.004 });
  },

  // 🕹️ Retro 8-bit: game jaisi beep
  retro(c, t) {
    const f = 740 + Math.floor(Math.random() * 3) * 110;
    const o = c.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(f, t);
    o.frequency.setValueAtTime(f * 1.5, t + 0.025);
    const g = c.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    o.connect(g).connect(out());
    o.start(t);
    o.stop(t + 0.07);
  },

  // 💻 Laptop Tap: halka, patla tap
  laptop(c, t) {
    noiseBurst(c, t, { type: 'highpass', freq: 1800, q: 0.7, vol: 0.4, dur: 0.02 });
    sweep(c, t, { from: 260, to: 130, vol: 0.28, dur: 0.045 });
  },
};

function playProfile(id) {
  const c = getCtx();
  if (!c) return;
  prepareBuffers(c);
  const fn = KEY_PLAYERS[id];
  if (fn) fn(c, c.currentTime);
}

// ⌨️ Key press — jo keyboard sound user ne chuna hai
export function playKeySound() {
  if (!canPlay()) return;
  if (settings.keyProfile === 'off') return;
  playProfile(settings.keyProfile);
}

// 👂 Picker mein sunne ke liye (mute na ho toh)
export function previewKeySound(id) {
  if (!canPlay()) return;
  if (id === 'off') return;
  playProfile(id);
}

// ␣ Space / word skip sound
export function playSkipSound() {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  prepareBuffers(c);
  const t = c.currentTime;
  noiseBurst(c, t, { type: 'lowpass', freq: 1200, q: 0.7, vol: 0.35, dur: 0.05 });
  sweep(c, t, { type: 'triangle', from: 320, to: 150, vol: 0.3, dur: 0.09 });
}

// 🎸 Galat key / galat word par guitar jaisa beep
export function playWrongSound() {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  prepareBuffers(c);
  const t = c.currentTime;

  const src = c.createBufferSource();
  src.buffer = guitarBuffer;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2500;
  const g = c.createGain();
  g.gain.setValueAtTime(0.5, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
  src.connect(lp).connect(g).connect(out());
  src.start(t);
  src.stop(t + 0.7);
}

// 🏆 Test khatam hone par victory sound
export function playVictorySound() {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + 0.02;

  const note = (freq, start, dur, type = 'triangle', vol = 0.22) =>
    tone(c, freq, t0 + start, dur, type, vol);

  // C5 E5 G5 C6 arpeggio
  note(523.25, 0.0, 0.25);
  note(659.25, 0.12, 0.25);
  note(783.99, 0.24, 0.25);
  note(1046.5, 0.36, 0.3);

  // Final victory chord
  note(523.25, 0.55, 1.0, 'triangle', 0.2);
  note(659.25, 0.55, 1.0, 'triangle', 0.2);
  note(783.99, 0.55, 1.0, 'triangle', 0.2);
  note(1046.5, 0.55, 1.1, 'sine', 0.22);
}

// ---------- Hindi test ke liye combo sounds (English mein use nahi honge) ----------
const COMBO_SCALE = [
  523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51,
]; // C D E G A C D E (pentatonic)

export function playComboSound(streak = 1) {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const idx = Math.max(0, streak - 1) % COMBO_SCALE.length;
  const level = Math.floor(Math.max(0, streak - 1) / COMBO_SCALE.length);
  const f = COMBO_SCALE[idx];

  tone(c, f, t, 0.18, 'triangle', 0.16);
  tone(c, f * 2, t, 0.12, 'sine', 0.06);
  if (level >= 1) tone(c, f * 3, t + 0.02, 0.15, 'sine', 0.04 + Math.min(level, 3) * 0.015);
}

export function playMilestoneSound() {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + 0.03;

  tone(c, 783.99, t0, 0.14, 'triangle', 0.18);
  tone(c, 987.77, t0 + 0.09, 0.14, 'triangle', 0.18);
  tone(c, 1174.66, t0 + 0.18, 0.14, 'triangle', 0.18);
  tone(c, 1567.98, t0 + 0.27, 0.35, 'sine', 0.2);
  tone(c, 783.99, t0 + 0.27, 0.35, 'triangle', 0.12);
}

export function playComboBreakSound() {
  if (!canPlay()) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(70, t + 0.35);
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(1800, t);
  lp.frequency.exponentialRampToValueAtTime(200, t + 0.35);
  const g = c.createGain();
  g.gain.setValueAtTime(0.28, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  o.connect(lp).connect(g).connect(out());
  o.start(t);
  o.stop(t + 0.45);
}