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

  const note = (freq, start, dur, type = 'triangle', vol = 0.22) => {
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t0 + start);
    g.gain.exponentialRampToValueAtTime(vol, t0 + start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
    o.connect(g).connect(c.destination);
    o.start(t0 + start);
    o.stop(t0 + start + dur + 0.05);
  };

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