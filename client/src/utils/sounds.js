// client/src/utils/sounds.js
// Saare sounds code se bante hain (Web Audio API). Koi audio file nahi, isliye delay almost zero.

let ctx = null;
let noiseBuffer = null;
let guitarBuffer = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = !!value;
}

export function isSoundEnabled() {
  return enabled;
}

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC({ latencyHint: 'interactive' });
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
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
    const len = Math.floor(c.sampleRate * 0.06);
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
  o.connect(g).connect(c.destination);
  o.start(start);
  o.stop(start + dur + 0.05);
}

// ⌨️ Mechanical keyboard click
export function playKeySound() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  prepareBuffers(c);
  const t = c.currentTime;

  // 1) Sharp "click" (noise burst)
  const noise = c.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.playbackRate.value = 0.9 + Math.random() * 0.3;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 2200 + Math.random() * 900;
  bp.Q.value = 0.9;
  const nGain = c.createGain();
  nGain.gain.setValueAtTime(0.55, t);
  nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
  noise.connect(bp).connect(nGain).connect(c.destination);
  noise.start(t);
  noise.stop(t + 0.05);

  // 2) Low "thock" (keyboard body ki awaaz)
  const osc = c.createOscillator();
  osc.type = 'sine';
  const base = 170 + Math.random() * 30;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(65, t + 0.05);
  const oGain = c.createGain();
  oGain.gain.setValueAtTime(0.45, t);
  oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  osc.connect(oGain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

// 🎸 Galat key par guitar jaisa beep
export function playWrongSound() {
  if (!enabled) return;
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
  src.connect(lp).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + 0.7);
}

// 🏆 Test khatam hone par victory sound
export function playVictorySound() {
  if (!enabled) return;
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

// ✨ COMBO: sahi word par "ting", lagatar sahi words par pitch seedhi ki tarah upar chadhta hai
const COMBO_SCALE = [
  523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51,
]; // C D E G A C D E (pentatonic, hamesha sureeli lagti hai)

export function playComboSound(streak = 1) {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;

  const idx = Math.max(0, streak - 1) % COMBO_SCALE.length;
  const level = Math.floor(Math.max(0, streak - 1) / COMBO_SCALE.length); // har 8 words par ek level
  const f = COMBO_SCALE[idx];

  tone(c, f, t, 0.18, 'triangle', 0.16);
  tone(c, f * 2, t, 0.12, 'sine', 0.06); // chamak (sparkle)

  // Level badhne par halki si extra shimmer
  if (level >= 1) tone(c, f * 3, t + 0.02, 0.15, 'sine', 0.04 + Math.min(level, 3) * 0.015);
}

// 🎉 MILESTONE: har 10 sahi words par mini celebration
export function playMilestoneSound() {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  const t0 = c.currentTime + 0.03;

  tone(c, 783.99, t0, 0.14, 'triangle', 0.18);
  tone(c, 987.77, t0 + 0.09, 0.14, 'triangle', 0.18);
  tone(c, 1174.66, t0 + 0.18, 0.14, 'triangle', 0.18);
  tone(c, 1567.98, t0 + 0.27, 0.35, 'sine', 0.2);
  tone(c, 783.99, t0 + 0.27, 0.35, 'triangle', 0.12);
}

// 💔 COMBO BREAK: badi streak tootne par neeche girta "whoomp"
export function playComboBreakSound() {
  if (!enabled) return;
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
  o.connect(lp).connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.45);
}