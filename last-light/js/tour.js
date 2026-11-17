/* Haunted Ohio: the tour. A skippable intro of up to 3 cards, then small bubbles, one at a time, each pointing at the thing to use and
   going away when the player does it (there is no Next button). A "?" Help list of one-line tips can replay any tip. Completion is kept per
   game, per device, in one small key. Nothing here ever blocks play: every bubble can be closed and the game works the same with the tour skipped.
   Written so other games can reuse it; for now only The Last Light uses it. No network calls; nothing the player types is read or stored. */
(function (root) {
  'use strict';
  var doc = root.document;
  var ICONS = {   /* small line icons, drawn in code */
    radio: '<rect x="4" y="9" width="24" height="16" rx="3"/><circle cx="11" cy="17" r="4"/><path d="M18 14h6M18 18h6M18 22h4M9 9 22 4"/>',
    backpack: '<path d="M9 11a7 7 0 0 1 14 0v14H9z"/><path d="M12 6V4h8v2M12 18h8v4h-8z"/>',
    pencil: '<path d="M6 26l2-7L21 6l5 5-13 13z"/><path d="M18 9l5 5M6 26l7-2"/>',
    folder: '<path d="M4 9h9l2 3h13v13H4z"/>', magnifier: '<circle cx="13" cy="13" r="7"/><path d="M18 18l8 8"/>', bell: '<path d="M10 22V14a6 6 0 0 1 12 0v8l2 2H8z"/><path d="M14 27h4"/>',
    eye: '<path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z"/><circle cx="16" cy="16" r="4"/>', hotel: '<path d="M6 27V6h20v21M11 11h3M18 11h3M11 16h3M18 16h3M14 27v-5h4v5"/>', flashlight: '<path d="M4 12h12l6-5v18l-6-5H4z"/><path d="M25 12l3-2M25 16h4M25 20l3 2"/>'
  };
  function icon(n) { return '<svg class="hot-ic" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>'; }
  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function reduced() { try { return root.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }

  function create(o) {
    /* o: { key, cards: [{icon, text}], steps: [{id, when(), target(), text: string | {key, touch, mouse}, done(), auto?}], tips: [{label, text, step?}], purpose, connect, helpButton: element or selector, low() } */
    var T = { o: o, shown: null, shownAt: 0, idled: false, device: 'mouse' }, store = load();
    function load() { var d = { intro: false, done: [], off: false }; try { var v = JSON.parse(root.localStorage.getItem(o.key) || 'null'); if (v && typeof v === 'object') { d.intro = !!v.intro; d.off = !!v.off; d.done = Array.isArray(v.done) ? v.done.filter(function (x) { return typeof x === 'string'; }).slice(0, 80) : []; } } catch (e) { /* storage blocked: kept in memory */ } return d; }
    function save() { try { root.localStorage.setItem(o.key, JSON.stringify(store)); } catch (e) { /* storage blocked */ } }
    /* controls that match the device the player last used */
    doc.addEventListener('keydown', function (e) { var n = e.target && e.target.tagName; if (n !== 'INPUT' && n !== 'TEXTAREA' && n !== 'SELECT') T.device = 'key'; }, true);   /* typing a name does not count */
    doc.addEventListener('pointerdown', function (e) { T.device = e.pointerType === 'touch' || e.pointerType === 'pen' ? 'touch' : 'mouse'; }, true);
    try { if (root.matchMedia('(pointer: coarse)').matches) T.device = 'touch'; } catch (e) { /* fine */ }
    function textOf(s) { var t = s.text; if (typeof t === 'string') return t; return t[T.device] || t.mouse || t.key || t.touch; }

    /* ---------- the intro cards ---------- */
    T.intro = function (force) {
      if (!force && (store.intro || store.off)) return false;
      var i = 0, bg = el('div', 'hot-ov'), box = el('div', 'hot-intro'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Tour'); bg.appendChild(box);
      var face = el('div', 'hot-card'), dots = el('div', 'hot-dots'), row = el('div', 'hot-row'), skip = el('button', 'btn ghost hot-skip', 'Skip tour'), go = el('button', 'btn hot-go', 'Start'); skip.type = go.type = 'button';
      face.setAttribute('aria-live', 'polite'); row.appendChild(skip); row.appendChild(go); box.appendChild(face); box.appendChild(dots); box.appendChild(row);
      function draw() { face.innerHTML = icon(o.cards[i].icon) + '<p></p>'; face.lastChild.textContent = o.cards[i].text; dots.innerHTML = o.cards.map(function (_, k) { return '<i' + (k === i ? ' class="on"' : '') + '></i>'; }).join(''); }
      function end(skipped) { store.intro = true; if (skipped) store.off = true; save(); doc.removeEventListener('keydown', key, true); bg.remove(); T.tick(); }
      function next() { if (i < o.cards.length - 1) { i++; draw(); } else end(false); }
      function key(e) { if (e.key === 'Escape') { e.preventDefault(); end(true); } else if (e.key === 'ArrowRight') { e.preventDefault(); next(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); if (i) { i--; draw(); } } }
      var sx = null; face.addEventListener('pointerdown', function (e) { sx = e.clientX; }); face.addEventListener('pointerup', function (e) { if (sx != null && Math.abs(e.clientX - sx) > 40) { if (e.clientX < sx) next(); else if (i) { i--; draw(); } } else if (sx != null) next(); sx = null; });
      skip.addEventListener('click', function () { end(true); }); go.addEventListener('click', function () { end(false); });
      doc.addEventListener('keydown', key, true); draw(); doc.body.appendChild(bg); try { go.focus(); } catch (e) { /* fine */ } T.introOpen = bg; return true;
    };

    /* ---------- bubbles ---------- */
    var bub = el('div', 'hot-bub'), msg = el('p', 'hot-msg'), x = el('button', 'hot-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); bub.appendChild(msg); bub.appendChild(x); bub.hidden = true;
    var live = el('p', 'hot-sr'); live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status');
    x.addEventListener('click', function () { if (T.shown) { mark(T.shown.id); hide(); } });
    function mark(id) { if (store.done.indexOf(id) < 0) { store.done.push(id); save(); } }
    function hide() { bub.hidden = true; if (T.glow) T.glow.classList.remove('hot-glow'); T.glow = null; T.shown = null; T.replay = null; }
    function place(t) {
      if (!bub.parentNode) { doc.body.appendChild(bub); doc.body.appendChild(live); }
      var r = t.getBoundingClientRect ? t.getBoundingClientRect() : t, vw = root.innerWidth, vh = root.innerHeight; bub.style.maxWidth = Math.min(320, vw - 24) + 'px';
      var bw = bub.offsetWidth, bh = bub.offsetHeight, below = r.bottom + bh + 14 < vh || r.top - bh - 14 < 0, left = Math.max(12, Math.min(vw - bw - 12, r.left + r.width / 2 - bw / 2));
      bub.style.left = (left + root.scrollX) + 'px'; bub.style.top = ((below ? r.bottom + 10 : r.top - bh - 10) + root.scrollY) + 'px'; bub.classList.toggle('up', !below);
      bub.style.setProperty('--arrow', Math.max(14, Math.min(bw - 14, r.left + r.width / 2 - left)) + 'px');
    }
    function show(s, t, replay) {
      var txt = textOf(s); if (!T.shown || T.shown.id !== s.id || msg.textContent !== txt) { msg.textContent = txt; live.textContent = ''; setTimeout(function () { live.textContent = txt; }, 30); T.shownAt = Date.now(); T.idled = false; }
      T.shown = s; T.replay = replay ? s.id : null; bub.hidden = false; place(t);
      if (t.classList && T.glow !== t) { if (T.glow) T.glow.classList.remove('hot-glow'); T.glow = t; }
      /* idle hint: after about 15 seconds the bubble pulses once and the target glows (no pulse in reduced motion or low effects; the glow stays) */
      if (!T.idled && Date.now() - T.shownAt > 15000) { T.idled = true; if (T.glow) T.glow.classList.add('hot-glow'); if (!reduced() && !(o.low && o.low())) { bub.classList.remove('hot-pulse'); void bub.offsetWidth; bub.classList.add('hot-pulse'); } }
    }
    T.tick = function () {
      if (T.introOpen && T.introOpen.parentNode) return;
      /* the bubble on screen is done as soon as its action is done, even if the game has already moved on */
      if (T.shown && !T.replay && T.shown.done && store.done.indexOf(T.shown.id) < 0) { var dn = false; try { dn = T.shown.done(); } catch (e) { dn = false; } if (dn) { mark(T.shown.id); hide(); } }
      /* a replayed tip stays until its action is done or it is closed */
      var list = o.steps, s = null, t = null;
      if (T.replay) { s = list.filter(function (q) { return q.id === T.replay; })[0]; if (s && s.done()) { hide(); s = null; } else if (s) { t = s.target(); if (!t) { hide(); s = null; } } }
      if (!s && !store.off) for (var i = 0; i < list.length; i++) { var q = list[i]; if (store.done.indexOf(q.id) >= 0) continue; var w = false; try { w = q.when(); } catch (e) { w = false; } if (!w) continue; if (q.done()) { mark(q.id); continue; } var tt = q.target(); if (!tt) continue; s = q; t = tt; break; }
      if (!s) { if (T.shown) hide(); return; }
      if (T.shown && T.shown.id !== s.id && !T.replay && store.done.indexOf(T.shown.id) < 0 && T.shown.done()) mark(T.shown.id);
      show(s, t, !!T.replay);
      if (s.auto && Date.now() - T.shownAt > s.auto) { mark(s.id); hide(); }
    };
    setInterval(T.tick, 250); root.addEventListener('resize', function () { if (T.shown) T.tick(); }); root.addEventListener('scroll', function () { if (T.shown) T.tick(); }, { passive: true });

    /* ---------- the "?" Help list ---------- */
    T.help = function (opener) {
      var bg = el('div', 'hot-ov'), box = el('div', 'hot-help'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'hot-help-h'); bg.appendChild(box);
      var h = el('h2', null, 'Help'); h.id = 'hot-help-h'; h.tabIndex = -1; box.appendChild(h);
      if (o.purpose) box.appendChild(el('p', 'hot-purpose', o.purpose)); if (o.connect) box.appendChild(el('p', 'hot-connect', o.connect));
      var ul = el('ul', 'hot-tips'); o.tips.forEach(function (tp) { var li = el('li'), b = el('button', 'hot-tip'); b.type = 'button'; b.innerHTML = '<b></b> <span></span>'; b.firstChild.textContent = tp.label; b.lastChild.textContent = tp.text; b.dataset.tip = tp.label; li.appendChild(b); ul.appendChild(li);
        b.addEventListener('click', function () { close(); var s = tp.step && o.steps.filter(function (q) { return q.id === tp.step; })[0], t = s && s.target(); if (s && t) { T.replay = s.id; T.shownAt = Date.now(); show(s, t, true); } else { msg.textContent = tp.text; T.shown = { id: 'tip:' + tp.label, done: function () { return false; } }; bub.hidden = false; var hb = typeof o.helpButton === 'string' ? doc.querySelector(o.helpButton) : o.helpButton; place(hb || { left: 20, right: 20, top: 80, bottom: 80, width: 0 }); live.textContent = tp.text; } }); });
      box.appendChild(ul);
      var row = el('div', 'hot-row'), rep = el('button', 'btn ghost', 'Replay tour'), sk = el('button', 'btn ghost', 'Skip tour'), cl = el('button', 'btn', 'Close'); rep.type = sk.type = cl.type = 'button'; rep.id = 'hot-replay'; sk.id = 'hot-skipall';
      row.appendChild(rep); row.appendChild(sk); row.appendChild(cl); box.appendChild(row);
      function close() { doc.removeEventListener('keydown', key, true); bg.remove(); if (opener && doc.body.contains(opener)) try { opener.focus(); } catch (e) { /* fine */ } }
      function key(e) { if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') { var f = box.querySelectorAll('button'), a = f[0], z = f[f.length - 1]; if (e.shiftKey && doc.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && doc.activeElement === z) { e.preventDefault(); a.focus(); } } }
      rep.addEventListener('click', function () { store = { intro: false, done: [], off: false }; save(); close(); hide(); T.intro(true); });
      sk.addEventListener('click', function () { store.off = true; store.intro = true; save(); close(); hide(); });
      cl.addEventListener('click', close); bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
      doc.addEventListener('keydown', key, true); doc.body.appendChild(bg); h.focus();
    };
    T.state = function () { return JSON.parse(JSON.stringify(store)); };
    return T;
  }
  root.HOTour = { create: create, icons: ICONS };
})(window);
