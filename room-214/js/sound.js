/* ROOM 214: sound. Every level is in the LEVELS table below, so the sound can be tuned by ear in one place.
   All sounds are synthesized (no audio files). Every sound shows a caption (with a direction when it has one), also with sound off,
   so the game never depends on hearing. Laptop and Chromebook speakers play almost nothing below about 250 Hz, so every haunted sound
   here has most of its energy above 300 Hz (a test checks this). The shared "no" buzz is NOT defined or changed here. */
(function (root) {
  'use strict';
  var HOG = root.HOG, R = root.HOG_R214 = root.HOG_R214 || {};

  /* ---------- LEVELS: tune here. gain is the peak level of each part (before the volume slider). f is pitch or filter frequency in Hz. ---------- */
  var LEVELS = {
    limiterThreshold: -6,                                                                   /* dB after the volume control; peaks above it are rounded off, quieter sounds pass unchanged */
    porterStep:   { gain: 0.30, f: 900,  q: 0.8, dur: 0.09, click: 0.06, clickF: 1500 },  /* was a 220 Hz rumble at 0.12 */
    porterNear:   { gain: 0.16, f: 900,  q: 1.6, dur: 0.9,  attack: 0.3 },                 /* was 0.08 at 500 Hz */
    doorCreak:    { gain: 0.18, from: 600, to: 350, dur: 0.55, grain: 0.05, grainF: 1300 }, /* was a 170 to 120 Hz buzz at 0.07 */
    playerLoud:   { gain: 0.27, f: 700,  q: 0.7, dur: 0.12 },                              /* was 0.16, lowpass 400 Hz */
    alertHeard:   { gain: 0.18, from: 420, to: 320, dur: 0.3 },                            /* was 0.12, 300 to 220 Hz */
    alertSeen:    { gain: 0.20, f: 880, dur: 0.5, f2: 1320, gain2: 0.10 },                 /* unchanged */
    bellLand:     { gain: 0.22, f: 520, dur: 1.2, f2: 1250, gain2: 0.08 },                 /* unchanged */
    checkedOut:   { gain: 0.14, f: 196, dur: 0.7, f2: 392, gain2: 0.06 },                  /* a soft added overtone so laptops play it */
    pulse:        { gain: 0.10, f: 70, click: 0.14, clickF: 1100, clickDur: 0.06, near: 1.0, far: 5, fastGap: 0.55, slowGap: 1.15 },
    /* ambience: very soft layers */
    hum:          { gain: 0.018, f: 110, f2: 330, gain2: 0.012, floor3: 0.6 },
    wind:         { gain: 0.045, f: 520, q: 0.7, swell: 0.6, floor3: 1.6 },
    radioHiss:    { gain: 0.012, f: 3200, near: 4 },
    pipes:        { gain: 0.12, f: 380, f2: 820, every: [20, 40], lobby: 0.6 },
    creakFar:     { gain: 0.07, from: 520, to: 380, dur: 0.7, every: [15, 30] },
    latch:        { gain: 0.09, f: 2400, f2: 900, every: [25, 50] },
    overhead:     { gain: 0.14, f: 650, q: 0.9, dur: 0.08, gap: 0.7, near: 7 },
    drip:         { gain: 0.07, from: 1500, to: 900, dur: 0.09, every: [6, 12] },
    notice:       { gain: 0.08, f: 880, f2: 1320 },                                         /* a soft tone when a detail is noticed */
    lowIntensity: 0.5                                                                      /* the Low effects setting: ambience at half, no pulse */
  };

  /* ---------- recipes (each takes the audio context and the output it plays into) ---------- */
  function recipes(A) {
    var L = LEVELS, T = A.tone, N = A.noise;
    return {
      porterStep: function (c, o) { var l = L.porterStep; N(c, o, { f: l.f, q: l.q, dur: l.dur, gain: l.gain }); T(c, o, { f: l.clickF, dur: 0.03, gain: l.click, type: 'triangle' }); },
      porterNear: function (c, o) { var l = L.porterNear; N(c, o, { f: l.f, q: l.q, dur: l.dur, attack: l.attack, gain: l.gain }); },
      doorCreak: function (c, o) { var l = L.doorCreak; T(c, o, { f: l.from, to: l.to, dur: l.dur, type: 'sawtooth', gain: l.gain, attack: 0.04 }); N(c, o, { f: l.grainF, q: 3, dur: l.dur, gain: l.grain, attack: 0.04 }); },
      playerLoud: function (c, o) { var l = L.playerLoud; N(c, o, { f: l.f, q: l.q, dur: l.dur, gain: l.gain }); },
      alertHeard: function (c, o) { var l = L.alertHeard; T(c, o, { f: l.from, to: l.to, dur: l.dur, type: 'triangle', gain: l.gain }); },
      alertSeen: function (c, o) { var l = L.alertSeen; T(c, o, { f: l.f, dur: l.dur, gain: l.gain }); T(c, o, { f: l.f2, dur: 0.4, gain: l.gain2, at: 0.05 }); },
      bellLand: function (c, o) { var l = L.bellLand; T(c, o, { f: l.f, dur: l.dur, gain: l.gain }); T(c, o, { f: l.f2, dur: 0.8, gain: l.gain2 }); },
      checkedOut: function (c, o) { var l = L.checkedOut; T(c, o, { f: l.f, dur: l.dur, gain: l.gain }); T(c, o, { f: l.f2, dur: l.dur, gain: l.gain2 }); },
      pulse: function (c, o) { var l = L.pulse; [0, 0.22].forEach(function (at, i) { T(c, o, { f: l.f, dur: 0.16, gain: l.gain * (i ? 0.7 : 1), at: at }); N(c, o, { f: l.clickF, q: 1.2, dur: l.clickDur, gain: l.click * (i ? 0.7 : 1), at: at }); }); },
      pipes: function (c, o) { var l = L.pipes, n = 2 + (Math.random() < 0.5 ? 1 : 0); for (var i = 0; i < n; i++) { T(c, o, { f: l.f, dur: 0.09, gain: l.gain, type: 'triangle', at: i * 0.28, attack: 0.005 }); N(c, o, { f: l.f2, q: 2, dur: 0.06, gain: l.gain * 0.5, at: i * 0.28 }); } },
      creakFar: function (c, o) { var l = L.creakFar; T(c, o, { f: l.from, to: l.to, dur: l.dur, type: 'sawtooth', gain: l.gain, attack: 0.2 }); },
      latch: function (c, o) { var l = L.latch; N(c, o, { f: l.f, q: 2, dur: 0.04, gain: l.gain }); T(c, o, { f: l.f2, dur: 0.05, gain: l.gain * 0.5, at: 0.05, type: 'square' }); },
      overhead: function (c, o) { var l = L.overhead; N(c, o, { f: l.f, q: l.q, dur: l.dur, gain: l.gain }); },
      notice: function (c, o) { var l = L.notice; T(c, o, { f: l.f, dur: 0.5, gain: l.gain, attack: 0.02 }); T(c, o, { f: l.f2, dur: 0.6, gain: l.gain * 0.5, at: 0.12, attack: 0.02 }); },
      drip: function (c, o) { var l = L.drip; T(c, o, { f: l.from, to: l.to, dur: l.dur, gain: l.gain, attack: 0.005 }); }
    };
  }
  var CAPTIONS = {                                                       /* existing captions are kept word for word; the rest were approved */
    porterStep: 'slow footsteps', porterNear: 'slow breathing close by', alertSeen: 'a sharp bell: he has seen you', alertHeard: 'the footsteps turn toward the sound',
    playerLoud: 'your footsteps echo', bellLand: 'a bell clangs', doorCreak: 'a door creaks', checkedOut: 'a calm voice: "Checking you out, guest."',
    pulse: 'a slow pulse: he is close', hum: 'the building hums', wind: 'wind moans in the vents', pipes: 'pipes knock in the walls', creakFar: 'a floorboard creaks somewhere',
    latch: 'a latch clicks down the hall', notice: 'a soft tone', overhead: 'footsteps on the floor above', radioHiss: 'faint radio hiss', drip: 'water drips'
  };
  var HAUNTED = ['porterStep', 'porterNear', 'doorCreak', 'playerLoud', 'alertHeard', 'pulse', 'pipes', 'creakFar', 'latch', 'overhead', 'drip', 'hum', 'wind', 'radioHiss'];

  function define(A) { var rc = recipes(A); Object.keys(rc).forEach(function (k) { A.define(k, { caption: CAPTIONS[k], important: k === 'alertSeen', make: function (c, out, opt) { var lv = opt && opt.level != null ? opt.level : 1; if (lv < 1) { var g = c.createGain(); g.gain.value = Math.max(0, lv); g.connect(out); out = g; } rc[k](c, out); } }); }); A.useLimiter({ threshold: LEVELS.limiterThreshold }); return rc; }

  /* ---------- the lasting layers (hum, wind, radio hiss): each builder plays into g ---------- */
  function noiseSrc(c) { var len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; var s = c.createBufferSource(); s.buffer = buf; s.loop = true; return s; }
  var BUILD = {
    hum: function (c, g) { var l = LEVELS.hum, a = c.createOscillator(), b = c.createOscillator(), gb = c.createGain(); a.frequency.value = l.f; b.frequency.value = l.f2; gb.gain.value = l.gain2 / l.gain; a.connect(g); b.connect(gb); gb.connect(g); a.start(); b.start(); return [a, b]; },
    wind: function (c, g) { var l = LEVELS.wind, s = noiseSrc(c), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = l.f; f.Q.value = l.q; s.connect(f); f.connect(g); s.start(); return [s]; },
    radioHiss: function (c, g) { var l = LEVELS.radioHiss, s = noiseSrc(c), f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = l.f; s.connect(f); f.connect(g); s.start(); return [s]; }
  };

  /* ---------- the ambience: soft layers that follow where you are and how close he is ---------- */
  function ambience(game, shell) {
    var A = HOG.audio, D = R.data, amb = { log: [], loops: {}, next: {}, pulseOn: false, pulseT: 0, overT: 0 }, rnd = Math.random;
    function low() { return !!(shell.settings && shell.settings.low); }
    function dirTo(x, y) { var pl = game.pl, dx = x - pl.x, dy = y - pl.y, d = Math.hypot(dx, dy); if (d < 2.6) return 'near'; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }
    function cue(name, dir, level) { amb.log.push(name); if (amb.log.length > 60) amb.log.shift(); A.cue(name, { dir: dir || null, level: level == null ? 1 : level }); }
    function soon(name) { var e = LEVELS[name].every; amb.next[name] = game.t + e[0] + rnd() * (e[1] - e[0]); }
    ['pipes', 'creakFar', 'latch', 'drip'].forEach(function (k) { amb.next[k] = game.t + 4 + rnd() * 8; });
    /* lasting layers: built on the shared master, so mute, volume and the limiter apply; their caption shows when they start or change */
    function loopNode(name, build) { var b = A.bus(); if (!b) return null; try { var g = b.ctx.createGain(); g.gain.value = 0.0001; g.connect(b.out); var parts = build(b.ctx, g); return { g: g, parts: parts, c: b.ctx }; } catch (e) { return null; } }
    function setLoop(name, level, capKey) {
      var on = level > 0.0005, L0 = amb.loops[name];
      if (on && (!L0 || L0.cap !== capKey)) { shell.caption({ caption: CAPTIONS[name] }); amb.log.push(name); }
      if (!L0) L0 = amb.loops[name] = { node: null, cap: null, level: 0 };
      L0.cap = on ? capKey : null; L0.level = level;
      if (on && !L0.node) L0.node = loopNode(name, BUILD[name]);
      if (L0.node) try { L0.node.g.gain.setTargetAtTime(Math.max(0.0001, level), L0.node.c.currentTime, 0.6); } catch (e) { /* closed */ }      /* fades over about a second and a half */
    }
    amb.tick = function (dt) {
      if (!game.pl || game.s.done) { ['hum', 'wind', 'radioHiss'].forEach(function (k) { if (amb.loops[k]) setLoop(k, 0, null); }); return; }
      var pl = game.pl, f = pl.f, k = low() ? LEVELS.lowIntensity : 1, t = game.t;
      /* hum everywhere (softer on floor 3); wind swells, more on floor 3; radio hiss only near the front desk */
      setLoop('hum', LEVELS.hum.gain * (f === 2 ? LEVELS.hum.floor3 : 1) * k, 'f' + (f === 2 ? 3 : 0));
      var sw = 1 - LEVELS.wind.swell * 0.5 * (1 + Math.sin(t * 0.35)); setLoop('wind', LEVELS.wind.gain * (f === 2 ? LEVELS.wind.floor3 : 1) * sw * k, 'on');
      var desk = game.d.items.filter(function (it) { return it.id === 'note0'; })[0], nearDesk = f === 0 && desk && Math.hypot(desk.x + 0.5 - pl.x, desk.y + 0.5 - pl.y) < LEVELS.radioHiss.near;
      setLoop('radioHiss', nearDesk ? LEVELS.radioHiss.gain * k : 0, 'on');
      /* now-and-then sounds, each from a direction */
      var rndSpot = function () { return [1 + rnd() * (D.W - 2), 1 + rnd() * (D.H - 2)]; };
      if (t >= amb.next.pipes) { var p = rndSpot(); cue('pipes', dirTo(p[0], p[1]), k); soon('pipes'); if (f === 0) amb.next.pipes -= (amb.next.pipes - t) * (1 - LEVELS.pipes.lobby); }
      if (t >= amb.next.creakFar) { var q = rndSpot(); cue('creakFar', dirTo(q[0], q[1]), k); soon('creakFar'); }
      if (t >= amb.next.latch) { var doors = D.ROOMS.map(function (r) { return r.door; }).filter(function (d) { return Math.hypot(d[0] + 0.5 - pl.x, d[1] + 0.5 - pl.y) > 3; }); if (doors.length) { var dd = doors[Math.floor(rnd() * doors.length)]; cue('latch', dirTo(dd[0] + 0.5, dd[1] + 0.5), k); } soon('latch'); }
      if (f === 1 && t >= amb.next.drip) { var w = rndSpot(); cue('drip', dirTo(w[0], w[1]), k); soon('drip'); } else if (f !== 1) amb.next.drip = Math.max(amb.next.drip, t + 2);
      /* footsteps on the floor above: only when that floor's Porter is walking above you */
      var up = game.por[f + 1]; amb.overT -= dt;
      if (up && up.freeze <= 0 && Math.hypot(up.x - pl.x, up.y - pl.y) < LEVELS.overhead.near && amb.overT <= 0) { cue('overhead', 'up', k); amb.overT = LEVELS.overhead.gap + 0.4; }
      /* the pulse: within about 5 tiles of him on this floor; faster as he nears; never in Low effects. Its caption shows when it starts. */
      var po = game.por[f], d = po ? Math.hypot(po.x - pl.x, po.y - pl.y) : 99, P = LEVELS.pulse, want = !low() && po && po.freeze <= 0 && d <= P.far;
      if (want && !amb.pulseOn) { amb.pulseOn = true; amb.pulseT = 0; shell.caption({ caption: CAPTIONS.pulse, dir: dirTo(po.x, po.y) }); amb.log.push('pulse-start'); }
      if (!want) amb.pulseOn = false;
      if (amb.pulseOn) { amb.pulseT -= dt; if (amb.pulseT <= 0) { var r = Math.max(0, Math.min(1, (d - P.near) / (P.far - P.near))); amb.pulseT = P.fastGap + (P.slowGap - P.fastGap) * r; amb.log.push('pulse'); playQuiet('pulse', 1 - 0.4 * r); } }
    };
    /* a repeat beat of the pulse plays without a new caption line (its caption showed when it started) */
    function playQuiet(name, level) { if (A.isMuted() || A.getVolume() <= 0) return; var b = A.bus(); if (!b) return; try { var g = b.ctx.createGain(); g.gain.value = level; g.connect(b.out); A.recipe(name)(b.ctx, g); setTimeout(function () { try { g.disconnect(); } catch (e) { /* gone */ } }, 1500); } catch (e) { /* silent */ } }
    amb.stop = function () { Object.keys(amb.loops).forEach(function (k) { var L0 = amb.loops[k]; if (L0.node) try { L0.node.parts.forEach(function (p) { p.stop(); }); L0.node.g.disconnect(); } catch (e) { /* gone */ } }); amb.loops = {}; };
    return amb;
  }

  R.sound = { BUILD: BUILD, LEVELS: LEVELS, CAPTIONS: CAPTIONS, HAUNTED: HAUNTED, recipes: recipes, define: define, ambience: ambience };
})(window);
