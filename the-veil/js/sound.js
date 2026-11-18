/* THE VEIL: sound. Every level is in the LEVELS table below, so the sound can be tuned by ear in one place.
   All sounds are synthesized (no audio files) and quiet: no speech, nothing sudden. Every sound shows a caption (with a direction when it has
   one), also with sound off. Laptop speakers play almost nothing below about 250 Hz, so every sound here has energy above 300 Hz (a test checks).
   The bell-pattern puzzle's own bells are not changed; the far bell only rings after that puzzle is solved, so it can never be mistaken for a clue. */
(function (root) {
  'use strict';
  var HOG = root.HOG, V = root.HOG_VEIL = root.HOG_VEIL || {};

  /* ---------- LEVELS: tune here. gain is the peak level of each part (before the volume slider); f is pitch or filter frequency in Hz. ---------- */
  var LEVELS = {
    limiterThreshold: -6,                                            /* dB after the volume control; peaks above it are rounded off, quieter sounds pass unchanged */
    wind:     { gain: 0.045, f: 520, q: 0.7, swell: 0.5 },           /* distant wind, outside in the Living World */
    hum:      { gain: 0.020, f: 220, f2: 440, gain2: 0.6, f3: 660, gain3: 0.35 },   /* a faint hum, in the Echo only */
    farBell:  { gain: 0.05, f: 523, f2: 1250, gain2: 0.25, every: [35, 60] },        /* after the doors are open */
    grass:    { gain: 0.10, f: 1800, q: 0.9, dur: 0.07, gap: 0.42 }, /* footsteps on grass, outside */
    gate:     { gain: 0.10, from: 520, to: 330, dur: 0.8, grain: 0.04, grainF: 1400 },
    lowIntensity: 0.5                                                /* the Low effects setting: ambience at half */
  };
  var CAPTIONS = { wind: 'distant wind', hum: 'a faint hum', farBell: 'a far bell', grass: 'grass underfoot', gate: 'a gate creaks' };
  var HAUNTED = ['wind', 'hum', 'farBell', 'grass', 'gate'];

  function noiseSrc(c) { var len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0), s = 9301; for (var i = 0; i < len; i++) { s = (s * 1664525 + 1013904223) >>> 0; d[i] = (s / 4294967296) * 2 - 1; } var n = c.createBufferSource(); n.buffer = buf; n.loop = true; return n; }
  var BUILD = {   /* lasting layers: each plays into g at full scale; g sets its level */
    wind: function (c, g) { var l = LEVELS.wind, s = noiseSrc(c), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = l.f; f.Q.value = l.q; s.connect(f); f.connect(g); s.start(); return [s]; },
    hum: function (c, g) { var l = LEVELS.hum, out = []; [[l.f, 1], [l.f2, l.gain2], [l.f3, l.gain3]].forEach(function (p) { var o = c.createOscillator(), k = c.createGain(); o.frequency.value = p[0]; k.gain.value = p[1]; o.connect(k); k.connect(g); o.start(); out.push(o); }); return out; }
  };
  function recipes(A) {
    var L = LEVELS, T = A.tone, N = A.noise;
    return {
      farBell: function (c, o) { var l = L.farBell; T(c, o, { f: l.f, dur: 3, gain: l.gain, attack: 0.3 }); T(c, o, { f: l.f2, dur: 2, gain: l.gain * l.gain2, attack: 0.3 }); },
      grass: function (c, o) { var l = L.grass; N(c, o, { f: l.f, q: l.q, dur: l.dur, gain: l.gain, attack: 0.01 }); },
      gate: function (c, o) { var l = L.gate; T(c, o, { f: l.from, to: l.to, dur: l.dur, type: 'sawtooth', gain: l.gain, attack: 0.2 }); N(c, o, { f: l.grainF, q: 3, dur: l.dur, gain: l.grain, attack: 0.2 }); }
    };
  }
  function define(A) { var rc = recipes(A); Object.keys(rc).forEach(function (k) { A.define(k, { caption: CAPTIONS[k], make: function (c, out, opt) { var lv = opt && opt.level != null ? opt.level : 1; if (lv < 1) { var g = c.createGain(); g.gain.value = Math.max(0, lv); g.connect(out); out = g; } rc[k](c, out); } }); }); A.useLimiter({ threshold: LEVELS.limiterThreshold }); return rc; }

  /* ---------- the ambience ---------- */
  function ambience(game, shell) {
    var A = HOG.audio, amb = { log: [], loops: {}, next: { farBell: 0 }, grassT: 0, last: null, gateNear: false }, rnd = Math.random;
    function low() { return !!(shell.settings && shell.settings.low); }
    function inside(x, y) { return x >= 8 && x <= 31 && y >= 2 && y <= 13; }          /* the chapel's walls in data.js */
    function loopNode(name) { var b = A.bus(); if (!b) return null; try { var g = b.ctx.createGain(); g.gain.value = 0.0001; g.connect(b.out); return { g: g, parts: BUILD[name](b.ctx, g), c: b.ctx }; } catch (e) { return null; } }
    function setLoop(name, level) {
      var on = level > 0.0005, L0 = amb.loops[name] || (amb.loops[name] = { node: null, on: false, level: 0 });
      if (on && !L0.on) { shell.caption({ caption: CAPTIONS[name] }); amb.log.push(name); }        /* its caption shows when it starts */
      L0.on = on; L0.level = level; if (on && !L0.node) L0.node = loopNode(name);
      if (L0.node) try { L0.node.g.gain.setTargetAtTime(Math.max(0.0001, level), L0.node.c.currentTime, 0.6); } catch (e) { /* closed */ }
    }
    amb.tick = function (dt) {
      var s = game.s, k = low() ? LEVELS.lowIntensity : 1, t = (amb.t = (amb.t || 0) + dt), out = !inside(s.px, s.py);
      setLoop('wind', s.world === 'L' && out ? LEVELS.wind.gain * (1 - LEVELS.wind.swell * 0.5 * (1 + Math.sin(t * 0.3))) * k : 0);
      setLoop('hum', s.world === 'E' ? LEVELS.hum.gain * k : 0);
      /* grass underfoot: while walking outside; its caption shows once each time you start walking on it */
      var moved = amb.last && (amb.last[0] !== s.px || amb.last[1] !== s.py); amb.last = [s.px, s.py]; amb.grassT -= dt;
      if (moved && out) { if (!amb.walking) { amb.walking = true; A.cue('grass', { level: k }); amb.log.push('grass'); amb.grassT = LEVELS.grass.gap; } else if (amb.grassT <= 0) { playQuiet('grass', k); amb.grassT = LEVELS.grass.gap; } }
      if (!moved) { amb.idle = (amb.idle || 0) + dt; if (amb.idle > 1.2) amb.walking = false; } else amb.idle = 0;
      /* the gate creaks when you come up to it */
      var g = game.ents.filter(function (e) { return e.id === 'gate'; })[0], near = g && Math.hypot(g.x - s.px, g.y - s.py) < 2.2;
      if (near && !amb.gateNear) { A.cue('gate', { level: k, dir: 'near' }); amb.log.push('gate'); } amb.gateNear = !!near;
      /* a far bell, now and then, only after the bell-plate puzzle is solved */
      if (s.doors) { if (!amb.next.farBell) amb.next.farBell = t + 20 + rnd() * 20; if (t >= amb.next.farBell) { A.cue('farBell', { level: k, dir: 'up' }); amb.log.push('farBell'); var e = LEVELS.farBell.every; amb.next.farBell = t + e[0] + rnd() * (e[1] - e[0]); } }
    };
    function playQuiet(name, level) { if (A.isMuted() || A.getVolume() <= 0) return; var b = A.bus(); if (!b) return; try { var g = b.ctx.createGain(); g.gain.value = level; g.connect(b.out); A.recipe(name)(b.ctx, g); setTimeout(function () { try { g.disconnect(); } catch (e) { /* gone */ } }, 600); } catch (e) { /* silent */ } }
    return amb;
  }
  V.sound = { LEVELS: LEVELS, CAPTIONS: CAPTIONS, HAUNTED: HAUNTED, BUILD: BUILD, define: define, ambience: ambience };
})(window);
