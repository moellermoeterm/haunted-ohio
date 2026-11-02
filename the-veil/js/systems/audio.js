// Procedural audio (WebAudio). No audio files, so there is nothing to license and nothing to download.
// Important sounds also raise a caption for players who cannot hear them.
import { settings } from './state.js';

let ctx = null, master, music, sfx, windGain, veilGain, noiseBuf;
let captionFn = () => {};
export const BELL_NOTES = { low: 196, mid: 262, high: 392 };

export function onCaption(fn) { captionFn = fn; }
function caption(t) { if (settings.captions) captionFn(t); }

export function unlock() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    music = ctx.createGain(); sfx = ctx.createGain();
    music.connect(master); sfx.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startAmbience();
    applyVolumes();
  } catch (e) { ctx = null; }
}
export function applyVolumes() {
  if (!ctx) return;
  music.gain.setTargetAtTime(settings.music * 0.5, ctx.currentTime, 0.05);
  sfx.gain.setTargetAtTime(settings.sfx, ctx.currentTime, 0.05);
}

function startAmbience() {
  // low drone
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.connect(music);
  [55, 82.5, 110.3].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = 0.10 / (i + 1);
    o.connect(g); g.connect(lp); o.start();
  });
  // wind
  const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.7;
  windGain = ctx.createGain(); windGain.gain.value = 0.06;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
  const lg = ctx.createGain(); lg.gain.value = 0.04; lfo.connect(lg); lg.connect(windGain.gain); lfo.start();
  n.connect(bp); bp.connect(windGain); windGain.connect(music); n.start();
  // veil shimmer (only audible in the Veil)
  veilGain = ctx.createGain(); veilGain.gain.value = 0; veilGain.connect(music);
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f * (1 + i * 0.002);
    const g = ctx.createGain(); g.gain.value = 0.03;
    const t = ctx.createOscillator(); t.frequency.value = 0.2 + i * 0.07;
    const tg = ctx.createGain(); tg.gain.value = 0.025; t.connect(tg); tg.connect(g.gain); t.start();
    o.connect(g); g.connect(veilGain); o.start();
  });
}
export function setWorld(w) {
  if (!ctx) return;
  veilGain.gain.setTargetAtTime(w === 'veil' ? 1 : 0, ctx.currentTime, 0.4);
  windGain.gain.setTargetAtTime(w === 'veil' ? 0.02 : 0.06, ctx.currentTime, 0.4);
}

function tone(freq, dur, type = 'sine', gain = 0.2, when = 0, slideTo = null) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(sfx); o.start(t); o.stop(t + dur + 0.05);
}
function noise(dur, freq, type, gain, when = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + when;
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05);
}

export function bellTone(name, withCaption = true) {
  const f = BELL_NOTES[name] || 262;
  [[1, 0.28, 2.2], [2.76, 0.12, 1.4], [5.4, 0.06, 0.9], [8.93, 0.03, 0.5]].forEach(([m, g, d]) => tone(f * m, d, 'sine', g));
  if (withCaption) caption('[Bell tone: ' + name + ']');
}
export function bellToll() { bellTone('low', false); caption('[A bell tolls once, far away]'); }
export function playSequence(seq, onNote, gap = 750) {
  seq.forEach((n, i) => setTimeout(() => { bellTone(n, false); if (onNote) onNote(n, i); }, i * gap));
  caption('[A bell rings: ' + seq.join(', ') + ']');
  return seq.length * gap;
}
export function step(kind) { if (kind === 'grass') noise(0.07, 600, 'lowpass', 0.16); else noise(0.06, 1500, 'highpass', 0.12); }
export function shiftSound(toVeil) {
  tone(toVeil ? 180 : 700, 0.6, 'sawtooth', 0.12, 0, toVeil ? 900 : 120);
  noise(0.5, toVeil ? 2500 : 600, 'bandpass', 0.12);
  caption(toVeil ? '[A rising, glassy hum as the world thins]' : '[The hum falls away; the room feels solid again]');
}
export function pickup() { tone(660, 0.12, 'triangle', 0.15); tone(990, 0.2, 'triangle', 0.12, 0.08); }
export function deny() { tone(120, 0.18, 'square', 0.1); }
export function uiBlip() { tone(520, 0.05, 'square', 0.04); }
export function success() { [523, 659, 784].forEach((f, i) => tone(f, 0.4, 'triangle', 0.15, i * 0.1)); }
export function creak() { tone(90, 0.7, 'sawtooth', 0.07, 0, 60); noise(0.6, 300, 'lowpass', 0.1); caption('[A long creak of old wood]'); }
export function whisper() { noise(1.2, 2200, 'bandpass', 0.07); caption('[A whisper, too quiet to make out]'); }
