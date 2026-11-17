/* The Last Light: the Haven Ridge radio room (scene 1 of the redesign).
   This file only PRESENTS The Signal. Every rule, word, cost, flag and save field stays in index.html: the room shows the
   page's own mission panel when you stand at the receiver (or at the notebook for the journal), and presses the page's own
   buttons for the door and the supply shelf. Nothing here decides an outcome, and nothing here is saved in the game save.
   No image or audio files: the art is drawn in room-art.js and every sound is synthesized. No network calls. */
(function () {
  'use strict';
  var A = window.LLRoomArt, T = A.T, PW = A.PW, PH = A.PH, WH = A.WH;
  var K = 2 / 3, GW = Math.round(PW * K), GH = Math.round(PH * K);          /* smaller internal canvas, scaled up by the page */
  var LK = K / 2, LW = Math.round(PW * LK), LH = Math.round(PH * LK);       /* the light map is half of that again */
  var LX = T * 6.05, LY = T * 2.35, DARK = 0.76, PR = 22, SPEED = 250;
  var VIEW_KEY = 'ho-last-light-view';
  var API = null, game = null, scene = null, host = null, failed = false, loading = false, mounted = false, after = false;
  var prev = null, autoLow = false, keys = {}, stick = { x: 0, y: 0, on: false }, target = null, pendingUse = null;
  var view = loadView();

  /* ---------- text (approved lines; marked as game material in the pull request) ---------- */
  var LINES = {
    receiver: 'The old receiver. Its needle is twitching.',
    crate: 'Batteries. Count them before you spend one.',
    crank: 'A hand crank, wired to the bench.',
    shelf: 'Everything you have, on one shelf.',
    door: 'The door to the yard. The wind is pushing on it.',
    notebook: 'Your notebook.',
    window: 'Dark fields. Nothing moving.',
    tape: 'Pencil marks on the tape beside the dial. Each one sits a little further along than the last.',
    phones: 'Hold one cup to your ear. Under the static, a low, even hum.',
    card: 'A faded procedures card. One line is underlined: repeat until acknowledged.'
  };
  var GUIDE_POWER = 'Walk to the receiver and power it.', GUIDE_LEAVE = 'Write in your notebook, then leave by the door.';
  var CAP = { wind: '[wind in the grain elevator]', hum: '[the receiver hums]', stat: '[static]', fade: '[static, fading]', tone: '[a steady tone under the static]', click: '[click]', lock: '[the signal locks]', steps: '[footsteps]', batt: '[a battery slots in]', crank: '[the crank whirrs]', gust: '[wind at the door]', horn: '[a low horn, far off]', bell: '[a slow, hollow ring, far off]', chime: '[three steady chimes]', creak: '[a faint creak, like iron]', dog: '[a dog barks once, far off]', deep: '[a deep, slow hum, far off]' };
  /* each scenario's transmission has one [BACKGROUND] line; this picks its sound and caption from that existing text */
  var BG = [['horn', /horn/i], ['bell', /ship/i], ['chime', /chime/i], ['creak', /creak/i], ['dog', /dog/i], ['deep', /deep, slow hum/i]];
  function bgKey() { var line = ((API.SC().signal.tx || []).filter(function (x) { return /\[BACKGROUND\]/.test(x); })[0]) || ''; for (var i = 0; i < BG.length; i++) if (BG[i][1].test(line)) return BG[i][0]; return ''; }
  var bgSeen = typeof WeakSet === 'function' ? new WeakSet() : null;      /* a background sound plays once per transmission view: never again on re-render, going back, or reload */

  /* ---------- the room: what is where (1344 by 864 space) ---------- */
  var BX = T * 5.2, BY = WH - 14, BW = T * 5.2, BH = T * 1.25, FRONT = BY + BH + 44;      /* the bench, and the line you stand on in front of it */
  var RX = BX + T * 1.15, RY = BY + 12, RW = T * 2.05, RH = T * 0.92;
  var CX0 = T * 0.8, CY0 = PH - T * 2.55, CW = T * 2.7, CH = T * 1.25;
  var OBJ = [
    { id: 'phones', hit: [BX + 14, BY + 26, 92, 80], ap: [BX + 58, FRONT], when: function (s) { return s.step >= 1; } },
    { id: 'receiver', hit: [RX, RY, RW, RH], ap: [RX + RW / 2, FRONT] },
    { id: 'tape', hit: [RX + RW + 10, RY + 8, 70, 34], ap: [RX + RW + 62, FRONT] },
    { id: 'crank', hit: [BX + BW - 104, BY + 12, 100, 84], ap: [BX + BW - 70, FRONT], when: function (s) { return s.crank; } },
    { id: 'card', hit: [T * 10.75 - 6, 38, 58, 72], ap: [T * 10.95, WH + 50] },
    { id: 'window', hit: [T * 2.1, 18, T * 1.7, 70], ap: [T * 2.95, WH + 50] },
    { id: 'crate', hit: [T * 0.95, T * 3.4, T * 1.05, T * 0.86], ap: [T * 2.55, T * 3.83] },
    { id: 'shelf', hit: [PW - T * 1.55, T * 3.1, T, T * 2.9], ap: [PW - T * 2.05, T * 4.55] },
    { id: 'notebook', hit: [CX0, CY0, CW, CH], ap: [CX0 + CW * 0.58, CY0 - 46] },
    { id: 'door', hit: [T * 6.3, PH - T * 0.5, T * 1.4, T * 0.5], ap: [T * 7, PH - T * 0.5 - 46] }
  ];
  var SOLID = [[BX, BY, BW, BH], [T * 0.95, T * 3.4, T * 1.05, T * 0.86], [PW - T * 1.55, T * 3.1, T, T * 2.9], [CX0, CY0, CW, CH], [PW - T * 3.25, PH - T * 2.0, T * 2.1, T * 1.25], [PW - T * 2.0, WH, T * 1.5, T * 1.35]];
  var NEAR = T * 0.8, PANEL_R = T * 1.25;

  /* ---------- view settings (kept apart from the game save; written only when a student changes one) ---------- */
  function loadView() { var v = { text: false, low: false, bright: 0, contrast: 0, vol: 70 }; try { var o = JSON.parse(localStorage.getItem(VIEW_KEY) || 'null'); if (o && typeof o === 'object') { v.text = !!o.text; v.low = !!o.low; v.bright = [0, 1, 2].indexOf(+o.bright) >= 0 ? +o.bright : 0; v.contrast = [0, 1, 2].indexOf(+o.contrast) >= 0 ? +o.contrast : 0; v.vol = Math.max(0, Math.min(100, isFinite(+o.vol) ? +o.vol : 70)); } } catch (e) { /* storage blocked: defaults */ } return v; }
  function saveView() { try { localStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch (e) { /* storage blocked */ } applyView(); }
  function reduced() { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function low() { return view.low || autoLow || reduced(); }
  function applyView() { if (!host) return; host.style.filter = 'brightness(' + [1, 1.25, 1.5][view.bright] + ') contrast(' + [1, 1.2, 1.4][view.contrast] + ')'; host.classList.toggle('rr-low', low()); if (scene) scene.dirty = true; Snd.vol(); }
  function settingsHTML() {
    function sel(key, opts) { return '<select data-rr-set="' + key + '">' + opts.map(function (o, i) { return '<option value="' + i + '"' + (view[key] === i ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>'; }
    return '<div class="panel rr-settings" style="margin-top:1rem"><h3>Radio room</h3>' +
      '<label class="rr-chk"><input type="checkbox" data-rr-set="text"' + (view.text ? ' checked' : '') + '>Text mode</label>' +
      '<label class="rr-chk"><input type="checkbox" data-rr-set="low"' + (view.low ? ' checked' : '') + '>Low effects</label>' +
      '<label>Brightness ' + sel('bright', ['Normal', 'Brighter', 'Brightest']) + '</label>' +
      '<label>Contrast ' + sel('contrast', ['Normal', 'Higher', 'Highest']) + '</label>' +
      '<label>Volume <input type="range" min="0" max="100" step="5" value="' + view.vol + '" data-rr-set="vol"></label></div>';
  }
  document.addEventListener('change', function (ev) { var el = ev.target, k = el && el.dataset && el.dataset.rrSet; if (!k) return; if (k === 'text' || k === 'low') view[k] = el.checked; else view[k] = +el.value; saveView(); });
  document.addEventListener('input', function (ev) { var el = ev.target; if (el && el.dataset && el.dataset.rrSet === 'vol') { view.vol = +el.value; Snd.vol(); } });

  /* ---------- sound: all synthesized, quiet, never sudden; every sound has a caption ---------- */
  var Snd = (function () {
    var ctx = null, master = null, noiseBuf = null, wind = null, hum = null, tone = null, lastClick = 0, lastStep = 0;
    function on() { return !!(API && API.S().sound) && view.vol > 0; }
    function ac() { if (ctx) return ctx; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = view.vol / 100; master.connect(ctx.destination); var len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; noiseBuf = b; } catch (e) { ctx = null; } return ctx; }
    function noise(freq, type, gain, dur, attack, at) { if (!on() || !ac()) return; try { master.gain.value = view.vol / 100; var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; var g = ctx.createGain(), t = ctx.currentTime + (at || 0); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05); } catch (e) { /* audio blocked */ } }
    function osc(freq, type, gain, dur, attack, to, at) { if (!on() || !ac()) return; try { master.gain.value = view.vol / 100; var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (at || 0); o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.linearRampToValueAtTime(to, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); } catch (e) { /* audio blocked */ } }
    function loopStop(l) { if (!l) return null; try { l.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2); l.s.forEach(function (x) { x.stop(ctx.currentTime + 0.8); }); } catch (e) { /* already stopped */ } return null; }
    /* background sounds: [kind, frequency, wave or filter, level, length, fade-in, start offset, glide-to]. Every part fades in over at least a fifth of a second.
       No sound's parts playing together may add up to more than the horn's (checked when the file loads, and by a test). */
    var BGS = {
      horn: [['o', 147, 'sine', 0.04, 2.6, 0.7, 0], ['o', 185, 'sine', 0.03, 2.6, 0.8, 0]],
      bell: [['o', 220, 'sine', 0.045, 3.5, 0.5, 0], ['o', 554, 'sine', 0.012, 2.4, 0.5, 0]],
      chime: [['o', 660, 'sine', 0.035, 0.6, 0.2, 0], ['o', 660, 'sine', 0.035, 0.6, 0.2, 0.75], ['o', 660, 'sine', 0.035, 0.6, 0.2, 1.5]],
      creak: [['o', 92, 'sawtooth', 0.02, 1.5, 0.35, 0, 128], ['n', 700, 'bandpass', 0.012, 1.5, 0.35, 0]],
      dog: [['n', 420, 'bandpass', 0.035, 0.5, 0.2, 0], ['o', 290, 'triangle', 0.015, 0.5, 0.2, 0, 200]],
      deep: [['o', 55, 'sine', 0.05, 4.5, 1.5, 0, 51], ['o', 82, 'sine', 0.018, 4.5, 1.5, 0]]
    }, log = [];
    function bgPeak(key) { var parts = BGS[key] || [], best = 0; parts.forEach(function (p) { var sum = 0; parts.forEach(function (q) { if (q[6] < p[6] + p[4] && p[6] < q[6] + q[4]) sum += q[3]; }); best = Math.max(best, sum); }); return best; }
    Object.keys(BGS).forEach(function (k) { var cap = bgPeak('horn'), pk = bgPeak(k); if (pk > cap) BGS[k].forEach(function (p) { p[3] *= cap / pk; }); });
    return {
      vol: function () { if (master) try { master.gain.value = on() ? view.vol / 100 : 0; } catch (e) { /* closed */ } },      /* muting silences anything still ringing */
      on: on, log: log, bgPeak: bgPeak,
      bg: function (key) { var parts = BGS[key]; if (!parts || !on() || !ac()) return false; this.vol(); parts.forEach(function (p) { if (p[0] === 'n') noise(p[1], p[2], p[3], p[4], p[5], p[6]); else osc(p[1], p[2], p[3], p[4], p[5], p[7], p[6]); }); log.push({ key: key, peak: bgPeak(key) }); return true; },
      loops: function (st) {                                                           /* wind, hum and the carrier tone follow the state */
        var want = mounted && on() && ac(), t;
        if (!want) { wind = loopStop(wind); hum = loopStop(hum); tone = loopStop(tone); return; }
        try {
          t = ctx.currentTime; master.gain.value = view.vol / 100;
          if (!wind) { var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true; var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 320; var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 2); s.connect(f); f.connect(g); g.connect(master); s.start(); wind = { s: [s], g: g }; }
          var powered = st.step >= 1;
          if (powered && !hum) { var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), hg = ctx.createGain(); o1.frequency.value = 60; o2.frequency.value = 120; hg.gain.setValueAtTime(0.0001, t); hg.gain.linearRampToValueAtTime(0.02, t + 1); o1.connect(hg); o2.connect(hg); hg.connect(master); o1.start(); o2.start(); hum = { s: [o1, o2], g: hg }; }
          if (!powered) hum = loopStop(hum);
          var tuning = st.step === 1 && !st.sub;
          if (tuning && !tone) { var o3 = ctx.createOscillator(), tg = ctx.createGain(); o3.type = 'sine'; o3.frequency.value = 620; tg.gain.value = 0.0001; o3.connect(tg); tg.connect(master); o3.start(); tone = { s: [o3], g: tg }; }
          if (!tuning) tone = loopStop(tone);
          if (tone) tone.g.gain.setTargetAtTime(Math.max(0.0001, Math.pow(st.clar, 3) * 0.03), t, 0.08);
        } catch (e) { /* audio blocked */ }
      },
      click: function () { var n = Date.now(); if (n - lastClick < 45) return; lastClick = n; noise(2400, 'bandpass', 0.05, 0.03, 0.004); },
      step: function () { var n = Date.now(); if (n - lastStep < 360) return; lastStep = n; noise(160, 'lowpass', 0.09, 0.09, 0.012); },
      batt: function () { noise(300, 'lowpass', 0.1, 0.12, 0.02); setTimeout(function () { noise(500, 'lowpass', 0.07, 0.08, 0.02); }, 160); },
      crank: function () { osc(70, 'sawtooth', 0.025, 0.9, 0.08, 150); },
      gust: function () { noise(500, 'bandpass', 0.07, 1.6, 0.6); },
      lock: function () { /* the page already plays its lock tone; the room adds the caption */ }
    };
  })();
  document.addEventListener('click', function (ev) { if (ev.target && ev.target.dataset && ev.target.dataset.act === 'sound') setTimeout(function () { Snd.vol(); Snd.loops(prev || { step: -1 }); }, 0); });
  var capT = 0;
  function caption(key) { var el = host && host.querySelector('#rr-cap'); if (!el) return; el.textContent = CAP[key]; el.hidden = false; clearTimeout(capT); capT = setTimeout(function () { el.hidden = true; }, 4200); }

  /* ---------- state read from the page (never written here) ---------- */
  function snap() {
    var S = API.S(), m = S.m || {}, sig = S.screen === 'mission' && S.m && S.m.id === 'signal';
    return { sig: sig, step: sig ? (m.step || 0) : (after ? 4 : -1), sub: sig ? (m.sub || '') : '', freq: m.freq || 900, clar: sig && m.step === 1 ? API.clarity(m.freq || 900) : 0, batt: S.res.batt, crank: !!S.flags.crank, checked: !!m.checked, judged: !!m.judged, done: !!S.done.signal };
  }
  
  /* ---------- the page calls these ---------- */
  function frame(html) {
    return '<div class="rr"><div class="rr-stage" id="rr-slot"></div><div class="rr-side"><p class="rr-guide" id="rr-guide" role="status"></p><div id="rr-panel">' + html + '</div></div></div>';
  }
  function sync(api) {
    API = api || API; if (!API) return;
    var S = API.S(), slot = document.getElementById('rr-slot'), now = snap();
    if (!slot && mounted && !after && prev && prev.sig && prev.step === 4 && S.screen === 'map' && S.done.signal && !failed && scene) {       /* the journal was just saved: stay in the room until the student uses the door */
      var app = document.getElementById('app'), map = app.querySelector('.wrap'), blk = document.createElement('div'); blk.className = 'wrap'; blk.id = 'rr-after';
      blk.innerHTML = '<div class="rr"><div class="rr-stage" id="rr-slot"></div><div class="rr-side"><p class="rr-guide" id="rr-guide" role="status"></p></div></div>';
      if (map) { map.hidden = true; map.setAttribute('data-rr-held', '1'); app.insertBefore(blk, map); slot = blk.querySelector('#rr-slot'); after = true; now = snap(); }
    } else if (after) after = false;
    if (!slot) { unmount(); prev = now; return; }
    ensureHost(); if (host.parentNode !== slot) slot.appendChild(host);
    if (!mounted) { mounted = true; host.hidden = false; place(now); if (game) game.loop.wake(); start(); if (now.step === 0) intro(true); caption('wind'); stackedScroll(); }
    transitions(prev, now); prev = now;
    enhanceDial(); guide(now); panel(); applyView(); if (scene) { scene.dirty = true; scene.redrawRoom(now); } Snd.loops(now);
  }
  /* stacked layout (phone, tablet): open with the room at the top of the screen instead of under the top bar. After the page's own scroll to the top. */
  function stackedScroll() { var mq = false; try { mq = window.matchMedia('(max-width: 1000px)').matches; } catch (e) { /* old browser */ } if (!mq) return; setTimeout(function () { if (mounted && host && host.parentNode) try { host.parentNode.scrollIntoView({ block: 'start' }); } catch (e) { /* fine */ } }, 0); }
  function unmount() { if (!mounted) return; mounted = false; after = false; target = null; pendingUse = null; keys = {}; stick.x = stick.y = 0; if (game) game.loop.sleep(); if (host && host.parentNode) host.parentNode.removeChild(host); Snd.loops({ step: -1 }); }
  function leaveAfter() { var app = document.getElementById('app'), blk = document.getElementById('rr-after'), map = app.querySelector('[data-rr-held]'); unmount(); if (blk) blk.remove(); if (map) { map.hidden = false; map.removeAttribute('data-rr-held'); } prev = snap(); window.scrollTo(0, 0); var f = app.querySelector('.mk, [data-loc]'); if (f) try { f.focus(); } catch (e) { /* not focusable */ } }
  function transitions(a, b) {
    if (!a || !a.sig || !b.sig) return;
    if (a.step === 0 && b.step === 1) { if (b.batt < a.batt) { Snd.batt(); caption('batt'); } else if (b.crank) { Snd.crank(); caption('crank'); } setTimeout(function () { if (mounted) caption('hum'); }, 1600); setTimeout(function () { if (mounted && snap().step === 1) caption('stat'); }, 3600); intro(false); }
    if (a.step === 1 && !a.sub && (b.sub === 'decode' || b.step === 2)) caption('lock');
    if (a.step < 2 && b.step === 2) { var key = bgKey(), m = API.S().m; if (key && m && !(bgSeen && bgSeen.has(m))) { if (bgSeen) bgSeen.add(m); setTimeout(function () { var S2 = API.S(); if (!mounted || S2.m !== m || m.step !== 2) return; Snd.bg(key); caption(key); }, 2200); } }
  }
  function guide(s) {
    var el = document.getElementById('rr-guide'), SC = API.SC(), t = ''; if (!el) return;
    if (s.step === 0) t = GUIDE_POWER;
    else if (s.step === 1) t = s.sub === 'decode' ? SC.signal.decode.intro : 'Turn the dial until the message comes in clearly.';
    else if (s.step === 2) t = 'What stands out? (Choose everything that raises a question.)';
    else if (s.step === 3) t = 'The message loops again. Your settlement is asleep. You are the only one who has heard it.';
    else t = GUIDE_LEAVE;
    if (el.textContent !== t) el.textContent = t;
  }
  /* the page's own mission panel is shown while you stand at the receiver (or at the notebook for the journal). Until the scene is ready it is always shown, so nothing is ever blocked. */
  function panelSpot(s) { return s.step === 4 ? 'notebook' : 'receiver'; }
  function panel() {
    var el = document.getElementById('rr-panel'); if (!el) return; var s = prev || snap(), show = true;
    if (scene && scene.ready) { var o = obj(panelSpot(s)); show = dist(scene.px, scene.py, o.ap[0], o.ap[1]) <= PANEL_R; }
    if (el.hidden === show) el.hidden = !show;
  }
  function intro(on) { var el = host && host.querySelector('#rr-intro'); if (!el) return; if (on) el.textContent = API.SC().signal.room; el.hidden = !on; }

  /* ---------- the dial as an instrument (the page's slider stays as the accessible control and does the work) ---------- */
  function enhanceDial() {
    var tune = document.getElementById('tune'); if (!tune || document.getElementById('rr-dial')) { knob(); return; }
    var d = document.createElement('div'); d.id = 'rr-dial'; d.className = 'rr-dial';
    d.innerHTML = '<button type="button" class="btn ghost" data-rr-turn="-1">Turn left</button><div class="rr-knob" id="rr-knob" aria-hidden="true"><i></i></div><button type="button" class="btn ghost" data-rr-turn="1">Turn right</button>';
    var lab = tune.parentNode.querySelector('label[for="tune"]'); tune.parentNode.insertBefore(d, lab || tune); knob();
    var kn = d.querySelector('#rr-knob'), drag = null;
    function ang(e) { var r = kn.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); }
    kn.addEventListener('pointerdown', function (e) { e.preventDefault(); drag = { a: ang(e), acc: 0 }; try { kn.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ } });
    kn.addEventListener('pointermove', function (e) { if (!drag) return; var a = ang(e), da = a - drag.a; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; drag.a = a; drag.acc += da * 180 / Math.PI / 3; var n = drag.acc > 0 ? Math.floor(drag.acc) : Math.ceil(drag.acc); if (n) { drag.acc -= n; turn(n); } });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { kn.addEventListener(n, function () { drag = null; }); });
  }
  function turn(n) { var tune = document.getElementById('tune'); if (!tune) return; var v = Math.max(+tune.min, Math.min(+tune.max, +tune.value + n)); if (v === +tune.value) return; tune.value = v; tune.dispatchEvent(new Event('input', { bubbles: true })); }
  function knob() { var kn = document.getElementById('rr-knob'), tune = document.getElementById('tune'); if (kn && tune) kn.firstChild.style.transform = 'rotate(' + ((+tune.value - 980) * 1.35) + 'deg)'; }
  var holdT = 0;
  document.addEventListener('pointerdown', function (ev) { var b = ev.target.closest && ev.target.closest('[data-rr-turn]'); if (!b) return; var n = +b.dataset.rrTurn; clearInterval(holdT); var t0 = Date.now(); holdT = setInterval(function () { if (Date.now() - t0 > 350) turn(n); }, 60); });
  ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () { clearInterval(holdT); }); });
  document.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('[data-rr-turn]'); if (b) turn(+b.dataset.rrTurn); });
  var lastStat = '';
  document.addEventListener('input', function (ev) {
    var el = ev.target; if (!mounted || !el || !el.dataset || !el.dataset.tune) return;
    knob(); Snd.click(); var s = snap(); prev = s; Snd.loops(s); if (scene) scene.dirty = true;
    var k = s.clar >= 0.75 ? 'tone' : s.clar >= 0.4 ? 'fade' : 'stat'; if (k !== lastStat) { lastStat = k; caption(k); }
  });

  /* ---------- geometry ---------- */
  function obj(id) { for (var i = 0; i < OBJ.length; i++) if (OBJ[i].id === id) return OBJ[i]; return null; }
  function dist(a, b, c, d) { return Math.hypot(a - c, b - d); }
  function live(o, s) { return !o.when || o.when(s); }
  function blocked(x, y) { if (x < T * 0.5 + PR || x > PW - T * 0.5 - PR || y < WH + PR - 6 || y > PH - T * 0.5 - PR) return true; for (var i = 0; i < SOLID.length; i++) { var r = SOLID[i]; if (x > r[0] - PR && x < r[0] + r[2] + PR && y > r[1] - PR && y < r[1] + r[3] + PR) return true; } return false; }
  function place(s) { if (!scene) return; var a = s.step === 0 ? [T * 4.3, PH - T * 3.1] : obj('receiver').ap; scene.px = a[0]; scene.py = a[1]; scene.ang = s.step === 0 ? -0.9 : -Math.PI / 2; scene.dirty = true; }
  function nearest() { if (!scene) return null; var s = prev || snap(), best = null, bd = NEAR; OBJ.forEach(function (o) { if (!live(o, s)) return; var d = dist(scene.px, scene.py, o.ap[0], o.ap[1]); if (d < bd) { bd = d; best = o; } }); return best; }

  /* ---------- using things: each one presses the page's own control, or only shows its line ---------- */
  function use(o) {
    if (!o) return; var s = prev || snap(), pan = document.getElementById('rr-panel'), b;
    say(LINES[o.id]);
    if (o.id === 'door') { Snd.gust(); caption('gust'); if (after) { leaveAfter(); return; } if (s.step === 0 && pan) { b = pan.querySelector('[data-act="backmap"]'); if (b) b.click(); } return; }
    if (o.id === 'shelf' && s.step === 3 && pan) { b = pan.querySelector('[data-act="sig-dec"][data-v="supplies"]'); if (b) b.click(); return; }
    if (o.id === panelSpot(s) && pan) { panel(); var f = pan.querySelector('button:not([disabled]), input:not([disabled]), textarea'); if (f) try { f.focus({ preventScroll: false }); } catch (e) { /* not focusable */ } }
  }
  function say(t) { var el = host && host.querySelector('#rr-say'); if (el) { el.textContent = ''; el.textContent = t; } }
  function prompt() {
    var el = host && host.querySelector('#rr-prompt'); if (!el) return; var o = nearest(), t = o ? LINES[o.id] : '';
    if (el.dataset.t !== t) { el.dataset.t = t; el.hidden = !t; el.innerHTML = t ? '<kbd>E</kbd> <span></span>' : ''; if (t) el.lastChild.textContent = t; }
    el.classList.toggle('rr-up', !!o && o.hit[1] + o.hit[3] / 2 < PH * 0.45);      /* the object is in the top part of the room: on touch screens the prompt moves below it */
    var ub = host.querySelector('#rr-use'); if (ub) ub.disabled = !o;
  }

  /* ---------- the host element: canvas, the lines of text over it, touch controls ---------- */
  function ensureHost() {
    if (host) return; host = document.createElement('div'); host.id = 'rr-host'; host.className = 'rr-host';
    host.innerHTML = '<div id="rr-canvas" class="rr-canvas" tabindex="0" role="application" aria-label="The radio room. Move with the arrow keys or W A S D. Press E or Enter to use what is next to you. Text mode is in Save and settings."></div>' +
      '<p id="rr-intro" class="rr-intro" hidden></p><p id="rr-cap" class="rr-cap" aria-live="polite" hidden></p><p id="rr-prompt" class="rr-prompt" hidden></p><p id="rr-say" class="rr-sr" aria-live="polite"></p>' +
      '<div id="rr-stick" class="rr-stick" aria-hidden="true"><i></i></div><button type="button" id="rr-use" class="btn rr-use" disabled>Use</button>';
    var cv = host.querySelector('#rr-canvas'), st = host.querySelector('#rr-stick');
    cv.addEventListener('pointerdown', function (e) {
      if (!scene || !scene.ready) return; var r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * PW, y = (e.clientY - r.top) / r.height * PH, s = prev || snap(), hit = null; intro(false);
      OBJ.forEach(function (o) { if (live(o, s) && x >= o.hit[0] - 8 && x <= o.hit[0] + o.hit[2] + 8 && y >= o.hit[1] - 8 && y <= o.hit[1] + o.hit[3] + 8) hit = o; });
      if (hit) { target = hit.ap.slice(); pendingUse = hit; } else { target = [x, y]; pendingUse = null; } scene.stuck = 0; try { cv.focus({ preventScroll: true }); } catch (x2) { /* fine */ }
    });
    function sv(e) { var r = st.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2), dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2), d = Math.hypot(dx, dy); if (d > 1) { dx /= d; dy /= d; } stick.x = dx; stick.y = dy; st.firstChild.style.transform = 'translate(' + (dx * 26) + 'px,' + (dy * 26) + 'px)'; }
    st.addEventListener('pointerdown', function (e) { e.preventDefault(); stick.on = true; target = null; intro(false); try { st.setPointerCapture(e.pointerId); } catch (x) { /* older browsers */ } sv(e); });
    st.addEventListener('pointermove', function (e) { if (stick.on) sv(e); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (n) { st.addEventListener(n, function () { stick.on = false; stick.x = stick.y = 0; st.firstChild.style.transform = ''; }); });
    host.querySelector('#rr-use').addEventListener('click', function () { use(nearest()); });
  }
  var MOVE = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  function typing(e) { var t = e.target, n = t && t.tagName; return n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT' || (t && t.isContentEditable); }
  document.addEventListener('keydown', function (e) {
    if (!mounted || !scene || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Escape' && typing(e)) { try { e.target.blur(); host.querySelector('#rr-canvas').focus({ preventScroll: true }); } catch (x) { /* fine */ } return; }
    if (typing(e) || document.querySelector('.how-ov')) return;
    if (MOVE[e.code]) { keys[MOVE[e.code]] = true; target = null; intro(false); e.preventDefault(); return; }
    if ((e.code === 'KeyE' || (e.key === 'Enter' && !(e.target.closest && e.target.closest('button, a, summary')))) && !e.repeat) { var o = nearest(); if (o) { e.preventDefault(); use(o); } }
  });
  document.addEventListener('keyup', function (e) { if (MOVE[e.code]) keys[MOVE[e.code]] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  /* ---------- Phaser: loaded only when the room is first needed ---------- */
  function start() {
    if (game || loading || failed) return; loading = true;
    function fail() { failed = true; loading = false; mounted = false; if (host && host.parentNode) host.parentNode.removeChild(host); if (API) API.render(); }
    function boot() { loading = false; try { build(); } catch (e) { fail(); } }
    if (window.Phaser) { boot(); return; }
    var s = document.createElement('script'); s.src = '../games-shared/vendor/phaser.min.js'; s.onload = boot; s.onerror = fail; document.head.appendChild(s);
  }
  function layer(w, h, fn) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; fn(cv.getContext('2d')); return cv; }
  function build() {
    var Phaser = window.Phaser, probe = document.createElement('canvas'); if (!probe.getContext || !probe.getContext('2d')) throw new Error('no canvas');
    function Scene() { Phaser.Scene.call(this, 'room'); }
    Scene.prototype = Object.create(Phaser.Scene.prototype);
    Scene.prototype.create = function () {
      scene = this; this.sig = ''; this.t = 0; this.acc = 0; this.lkey = ''; this.fpsN = 0; this.fpsT = 0; this.fps = 60; this.slow = 0; this.stuck = 0; this.walked = false;
      this.roomTex = this.textures.createCanvas('room', GW, GH); this.add.image(0, 0, 'room').setOrigin(0);
      var pl = this.textures.createCanvas('pl', Math.round(96 * K), Math.round(96 * K)), pc = pl.getContext(); pc.scale(K, K); A.drawPlayer(pc); pl.refresh();
      this.gfx = this.add.graphics().setScale(K);                                         /* the needle */
      this.player = this.add.image(0, 0, 'pl');
      this.light = this.textures.createCanvas('light', LW, LH); this.add.image(0, 0, 'light').setOrigin(0).setScale(GW / LW);
      this.hi = this.add.graphics().setScale(K);                                          /* outline when near: drawn above the darkness so it is never hidden */
      this.buildLight(); var R = A.rng(7); this.motes = []; for (var i = 0; i < 60; i++) this.motes.push({ x: LX + (R() - 0.5) * 480, y: LY + (R() - 0.3) * 400, r: 0.6 + R() * 1.2, a: 0.15 + R() * 0.55, vx: (R() - 0.5) * 12, vy: (R() - 0.5) * 8 });
      var s = prev || snap(); place(s); this.redrawRoom(s); this.ready = true; this.dirty = true; panel(); applyView();
    };
    Scene.prototype.redrawRoom = function (s) {
      var sig = (s.step >= 1 ? 'p' : 'o') + '|' + Math.min(6, s.batt) + '|' + (s.crank ? 1 : 0); if (sig === this.sig) return; this.sig = sig;
      var c = this.roomTex.getContext(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, GW, GH); c.scale(K, K); A.drawRoom(c, { powered: s.step >= 1, batt: s.batt, crank: s.crank }); c.setTransform(1, 0, 0, 1, 0, 0); this.roomTex.refresh(); this.dirty = true;
    };
    /* Lighting for slow Chromebooks: everything that does not move (lamp pool, moonlight, door glow, dial glow, vignette) is painted ONCE
       into two layers. A frame that needs new light is one fill and a few image draws on a small canvas, and that happens at most 20 times a second. */
    Scene.prototype.buildLight = function () {
      var g, i;
      this.cut = layer(LW, LH, function (c) { c.scale(LK, LK);
        g = c.createRadialGradient(LX, LY, 10, LX, LY, 500); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.4, 'rgba(0,0,0,.86)'); g.addColorStop(0.75, 'rgba(0,0,0,.36)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
        c.save(); c.translate(T * 2.95, T * 1.25); c.transform(1, 0, 0.55, 1, 0, 0); for (i = 0; i < 6; i++) { g = c.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(-80 + i * 27, 0, 15, 340); } c.restore();
        g = c.createRadialGradient(T * 7, PH - T * 0.4, 4, T * 7, PH - T * 0.4, 190); g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, PH - 240, PW, 240); });
      this.dialCut = layer(LW, LH, function (c) { c.scale(LK, LK); g = c.createRadialGradient(T * 7.58, T * 1.5, 2, T * 7.58, T * 1.5, 90); g.addColorStop(0, 'rgba(0,0,0,.8)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); });
      this.tint = layer(LW, LH, function (c) { c.scale(LK, LK);
        g = c.createRadialGradient(LX, LY, 10, LX, LY, 450); g.addColorStop(0, 'rgba(255,190,105,.30)'); g.addColorStop(0.5, 'rgba(255,160,70,.13)'); g.addColorStop(1, 'rgba(255,150,60,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
        c.save(); c.translate(T * 2.95, T * 1.25); c.transform(1, 0, 0.55, 1, 0, 0); for (i = 0; i < 6; i++) { g = c.createLinearGradient(0, 0, 0, 340); g.addColorStop(0, 'rgba(140,175,230,.22)'); g.addColorStop(1, 'rgba(140,175,230,0)'); c.fillStyle = g; c.fillRect(-80 + i * 27, 0, 15, 340); } c.restore();
        c.strokeStyle = 'rgba(10,10,10,.9)'; c.lineWidth = 3; c.beginPath(); c.moveTo(LX, 0); c.lineTo(LX, LY); c.stroke();
        g = c.createRadialGradient(LX, LY, 2, LX, LY, 34); g.addColorStop(0, '#fff3cf'); g.addColorStop(0.25, '#ffd27a'); g.addColorStop(0.3, '#2b2f2c'); g.addColorStop(1, '#141715'); c.fillStyle = g; c.beginPath(); c.arc(LX, LY, 34, 0, 7); c.fill();
        g = c.createRadialGradient(LX, LY, 4, LX, LY, 130); g.addColorStop(0, 'rgba(255,225,160,.34)'); g.addColorStop(1, 'rgba(255,225,160,0)'); c.fillStyle = g; c.fillRect(LX - 140, LY - 140, 280, 280);
        g = c.createRadialGradient(PW / 2, PH / 2, PH * 0.5, PW / 2, PH / 2, PW * 0.74); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.38)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); });
      var CR = Math.round(620 * LK);
      function cone(c0, c1, half) { return layer(CR + 20, CR * 2, function (c) { c.translate(10, CR); g = c.createRadialGradient(0, 0, 3, 0, 0, CR); g.addColorStop(0, c0); g.addColorStop(0.6, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.filter = 'blur(5px)'; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, CR, -half, half); c.closePath(); c.fill(); c.filter = 'none'; g = c.createRadialGradient(0, 0, 2, 0, 0, 36); g.addColorStop(0, c1); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 36, 0, 7); c.fill(); }); }
      this.coneCut = cone('rgba(0,0,0,1)', 'rgba(0,0,0,.8)', 0.38); this.coneTint = cone('rgba(215,232,255,.24)', 'rgba(215,232,255,.10)', 0.35); this.CR = CR;
    };
    Scene.prototype.paint = function (dt) {
      var c = this.light.getContext(), i, s = prev || {}, powered = s.step >= 1;
      c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, LW, LH);
      if (low()) { c.fillStyle = 'rgba(8,10,14,.26)'; c.fillRect(0, 0, LW, LH); this.light.refresh(); return; }     /* low effects: flat, even light; nothing moves */
      var flick = 1 + Math.sin(this.t * 13) * 0.012 + Math.sin(this.t * 3.1) * 0.02;
      c.fillStyle = 'rgba(4,6,10,' + DARK + ')'; c.fillRect(0, 0, LW, LH);
      c.globalCompositeOperation = 'destination-out'; c.globalAlpha = Math.min(1, flick); c.drawImage(this.cut, 0, 0); c.globalAlpha = 1; if (powered) c.drawImage(this.dialCut, 0, 0);
      c.translate(this.px * LK, this.py * LK); c.rotate(this.ang); c.drawImage(this.coneCut, -10, -this.CR);
      c.globalCompositeOperation = 'source-over'; c.drawImage(this.coneTint, -10, -this.CR); c.setTransform(1, 0, 0, 1, 0, 0);
      c.drawImage(this.tint, 0, 0);
      for (i = 0; i < this.motes.length; i++) { var m = this.motes[i]; m.x += m.vx * dt; m.y += m.vy * dt; if (Math.abs(m.x - LX) > 300) m.vx = -m.vx; if (Math.abs(m.y - LY - 40) > 240) m.vy = -m.vy; var a = Math.max(0, 1 - dist(m.x, m.y, LX, LY) / 330) * m.a; if (a > 0.03) { c.fillStyle = 'rgba(255,225,170,' + a.toFixed(2) + ')'; c.fillRect(m.x * LK, m.y * LK, m.r, m.r); } }
      this.light.refresh();
    };
    Scene.prototype.update = function (time, delta) {
      if (!mounted) return; var dt = Math.min(0.05, delta / 1000), s = prev || {}; this.t += dt;
      /* movement: keys, the on-screen stick, or walking to a tapped spot */
      var dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0) + stick.x, dy = (keys.d ? 1 : 0) - (keys.u ? 1 : 0) + stick.y;
      if (!dx && !dy && target) { var tx = target[0] - this.px, ty = target[1] - this.py, td = Math.hypot(tx, ty); if (td < 6) { target = null; if (pendingUse) { var pu = pendingUse; pendingUse = null; use(pu); } } else { dx = tx / td; dy = ty / td; } }
      var mag = Math.hypot(dx, dy), moved = false;
      if (mag > 0.15) {
        if (mag > 1) { dx /= mag; dy /= mag; } var nx = this.px + dx * SPEED * dt, ny = this.py + dy * SPEED * dt, ox = this.px, oy = this.py;
        if (!blocked(nx, this.py)) this.px = nx; if (!blocked(this.px, ny)) this.py = ny; moved = Math.hypot(this.px - ox, this.py - oy) > 0.3;
        var want = Math.atan2(dy, dx), da = want - this.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; this.ang += low() ? da : da * Math.min(1, dt * 12);
        if (moved) { Snd.step(); if (!this.walked) { this.walked = true; caption('steps'); } }
        if (target) { this.stuck = moved ? 0 : this.stuck + dt; if (this.stuck > 0.35) { if (pendingUse && dist(this.px, this.py, pendingUse.ap[0], pendingUse.ap[1]) < NEAR) use(pendingUse); target = null; pendingUse = null; } }
      }
      this.player.setPosition(this.px * K, this.py * K).setRotation(this.ang + Math.PI / 2);
      if (moved || this.dirty) { panel(); prompt(); }
      /* the needle follows the dial; it twitches a little before the radio is powered (not in low effects) */
      var f = s.step >= 1 ? (s.freq - 880) / 200 : 0.5 + (low() ? 0 : Math.sin(this.t * 9) * 0.012 + Math.sin(this.t * 2.3) * 0.01), nxp = RX + 70 + 4 + f * 88;
      if (this.needle !== nxp || this.dirty) { this.needle = nxp; this.gfx.clear(); this.gfx.fillStyle(0xa3140e, 1); this.gfx.fillRect(nxp, RY + 14, 2.4, 26); }
      /* outline when near */
      var o = nearest(), oid = o ? o.id : ''; if (oid !== this.hiId || this.dirty) { this.hiId = oid; this.hi.clear(); if (o) { this.hi.lineStyle(3, 0xffd27a, 0.95); this.hi.strokeRoundedRect(o.hit[0] - 5, o.hit[1] - 5, o.hit[2] + 10, o.hit[3] + 10, 8); this.hi.lineStyle(7, 0xffd27a, 0.22); this.hi.strokeRoundedRect(o.hit[0] - 8, o.hit[1] - 8, o.hit[2] + 16, o.hit[3] + 16, 10); } }
      /* light: redrawn at most 20 times a second, and only when something changed (or for the slow lamp flicker) */
      this.acc += delta; var key = (this.px | 0) + '|' + (this.py | 0) + '|' + this.ang.toFixed(2);
      if (this.dirty || (key !== this.lkey && this.acc >= 50) || (!low() && this.acc >= 110)) { this.paint(this.acc / 1000); this.acc = 0; this.lkey = key; this.paints = (this.paints || 0) + 1; }
      this.dirty = false;
      /* frame rate: if it stays under 30 the room drops to low effects by itself for this visit */
      this.frames = (this.frames || 0) + 1; this.fpsN++; this.fpsT += delta; if (this.fpsT >= 2000) { this.fps = this.fpsN * 1000 / this.fpsT; this.fpsN = 0; this.fpsT = 0; if (time - (this.t0 || (this.t0 = time)) > 3000 && !low()) { this.slow = this.fps < 29 ? this.slow + 1 : 0; if (this.slow >= 2) { autoLow = true; applyView(); } } }
    };
    game = new Phaser.Game({ type: Phaser.CANVAS, parent: host.querySelector('#rr-canvas'), width: GW, height: GH, backgroundColor: '#05070a', banner: false, audio: { noAudio: true }, input: { keyboard: false, mouse: false, touch: false, gamepad: false }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.NO_CENTER }, scene: [Scene] });
  }

  window.LLRoom = {
    on: function () { return !failed && !view.text && !window.LL_TEXT_MODE; }   /* LL_TEXT_MODE: a page can ask for the page-style mission before load (the tests of that mission do) */, frame: frame, sync: sync, settingsHTML: settingsHTML, volume: function () { return view.vol / 100; },
    debug: function () { var o = nearest(), p = document.getElementById('rr-panel'); return { ready: !!(scene && scene.ready), mounted: mounted, after: after, x: scene ? scene.px : 0, y: scene ? scene.py : 0, ang: scene ? scene.ang : 0, near: o ? o.id : '', panel: !!p && !p.hidden, low: low(), autoLow: autoLow, fps: scene ? scene.fps : 0, frames: scene ? scene.frames || 0 : 0, paints: scene ? scene.paints || 0 : 0, failed: failed, objects: OBJ.map(function (x) { return { id: x.id, ap: x.ap, hit: x.hit, live: live(x, prev || snap()) }; }), size: [PW, PH], children: scene ? scene.children.list.length : 0, sounds: Snd.log.slice(), soundOn: Snd.on(), peaks: ['horn', 'bell', 'chime', 'creak', 'dog', 'deep'].reduce(function (o, k) { o[k] = Snd.bgPeak(k); return o; }, {}), guide: (document.getElementById('rr-guide') || {}).textContent || '' }; },
    _warp: function (x, y) { if (scene) { scene.px = x; scene.py = y; scene.dirty = true; } },      /* tests only: put the survivor somewhere */
    _fail: function () { unmount(); failed = true; if (API) API.render(); }                                    /* tests only: pretend the canvas could not start */
  };
})();
