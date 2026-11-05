/* Haunted Ohio Games: audio. Every sound is synthesized with WebAudio (no files). Every cue ALWAYS emits a caption event, even when muted or when
   WebAudio is missing, so nothing in a game depends on hearing. No cue repeats faster than ~3 times a second. See docs/agents/CONTRACTS.md. */
(function (root) {
  'use strict';
  var HOG = root.HOG = root.HOG || {};
  var ctx = null, master = null, muted = false, volume = 0.6, defs = {}, listeners = [], last = {}, MIN_GAP = 340;

  function ensure() {
    if (ctx) return ctx;
    try { var AC = root.AudioContext || root.webkitAudioContext; if (!AC) return null; ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : volume; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() { var c = ensure(); if (c && c.state === 'suspended') { try { c.resume(); } catch (e) { /* ignore */ } } }
  if (root.document) { ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { root.document.addEventListener(ev, unlock, { passive: true }); }); }

  /* building blocks for cue recipes */
  function tone(c, out, o) {
    var t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + o.dur);
    var peak = (o.gain == null ? 0.25 : o.gain), a = o.attack || 0.01;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    osc.connect(g); g.connect(out); osc.start(t); osc.stop(t + o.dur + 0.05);
  }
  var noiseBuf = null;
  function noise(c, out, o) {
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); var d = noiseBuf.getChannelData(0), s = 1234567; for (var i = 0; i < d.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = (s / 4294967296) * 2 - 1; } }
    var t = c.currentTime + (o.at || 0), src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    src.buffer = noiseBuf; src.loop = true; f.type = o.filter || 'bandpass'; f.frequency.value = o.f || 800; f.Q.value = o.q || 1;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.gain || 0.2, t + (o.attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    src.connect(f); f.connect(g); g.connect(out); src.start(t); src.stop(t + o.dur + 0.05);
  }

  var api = {
    tone: tone, noise: noise,
    define: function (name, d) { defs[name] = d; },
    /* d.caption is the text shown; d.make(ctx, out) builds the sound. */
    cue: function (name, o) {
      var d = defs[name]; if (!d) return false;
      var now = Date.now(); if (last[name] && now - last[name] < MIN_GAP) return false; last[name] = now;
      var e = { name: name, caption: d.caption, dir: (o && o.dir) || null, level: (o && o.level) || 1, important: !!d.important };
      for (var i = 0; i < listeners.length; i++) { try { listeners[i](e); } catch (x) { /* never break the game */ } }
      if (!muted && volume > 0) { var c = ensure(); if (c && c.state !== 'closed') { try { if (c.state === 'suspended') c.resume(); d.make(c, master, o || {}); } catch (x) { /* silent */ } } }
      return true;
    },
    onCue: function (fn) { listeners.push(fn); },
    setMute: function (m) { muted = !!m; if (master) master.gain.value = muted ? 0 : volume; },
    setVolume: function (v) { volume = Math.max(0, Math.min(1, +v || 0)); if (master && !muted) master.gain.value = volume; },
    isMuted: function () { return muted; }, getVolume: function () { return volume; },
    names: function () { return Object.keys(defs); },
    unlock: unlock
  };

  /* generic cues every game can use */
  api.define('click', { caption: 'a soft click', make: function (c, o) { tone(c, o, { f: 880, to: 600, dur: 0.07, type: 'square', gain: 0.08 }); } });
  api.define('chime', { caption: 'a clear chime', make: function (c, o) { tone(c, o, { f: 660, dur: 0.6, gain: 0.2 }); tone(c, o, { f: 990, dur: 0.8, gain: 0.12, at: 0.05 }); } });
  api.define('success', { caption: 'a rising tone: that worked', make: function (c, o) { tone(c, o, { f: 440, dur: 0.18, gain: 0.18 }); tone(c, o, { f: 660, dur: 0.22, gain: 0.18, at: 0.14 }); tone(c, o, { f: 880, dur: 0.35, gain: 0.16, at: 0.3 }); } });
  api.define('no', { caption: 'a low buzz: not that', make: function (c, o) { tone(c, o, { f: 140, to: 100, dur: 0.22, type: 'sawtooth', gain: 0.16 }); } });
  api.define('shift', { caption: 'a sweeping hum as the world shifts', important: true, make: function (c, o) { tone(c, o, { f: 220, to: 660, dur: 0.7, type: 'triangle', gain: 0.2 }); noise(c, o, { f: 1200, dur: 0.7, gain: 0.08 }); } });
  api.define('whisper', { caption: 'a faint whisper', make: function (c, o) { noise(c, o, { f: 2400, q: 3, dur: 1.1, attack: 0.4, gain: 0.07 }); } });
  api.define('bell', { caption: 'a bell rings', important: true, make: function (c, o) { var f = (o && o.f) || 392; tone(c, o, { f: f, dur: 1.6, gain: 0.22 }); tone(c, o, { f: f * 2.4, dur: 1.1, gain: 0.08 }); } });
  api.define('thud', { caption: 'a dull thud', make: function (c, o) { tone(c, o, { f: 90, to: 45, dur: 0.25, gain: 0.3 }); } });
  api.define('creak', { caption: 'a slow creak', make: function (c, o) { tone(c, o, { f: 180, to: 130, dur: 0.6, type: 'sawtooth', gain: 0.08 }); } });
  api.define('footstep', { caption: 'footsteps', make: function (c, o) { noise(c, o, { f: 300, dur: 0.08, gain: 0.12, filter: 'lowpass' }); } });

  HOG.audio = api;
})(typeof window !== 'undefined' ? window : globalThis);
