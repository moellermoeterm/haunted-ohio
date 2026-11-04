/* Haunted Ohio Games: input. One action layer fed by the keyboard AND an on-screen touch overlay (DOM, not canvas, so it is focusable and labelled).
   Actions: up down left right interact shift hide run journal pause. See docs/agents/CONTRACTS.md. */
(function (root) {
  'use strict';
  var HOG = root.HOG = root.HOG || {};
  var doc = root.document;
  var KEYS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Enter: 'interact', Space: 'interact', KeyV: 'shift', KeyH: 'hide', ShiftLeft: 'run', ShiftRight: 'run', KeyJ: 'journal', Escape: 'pause'
  };
  var MOVE = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  var LABEL = { interact: 'Act', shift: 'Veil', hide: 'Hide', run: 'Run', journal: 'Journal', pause: 'Menu' };
  var KEYHINT = { interact: 'E', shift: 'V', hide: 'H', run: 'Shift', journal: 'J', pause: 'Esc' };

  function typing(t) { return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable); }

  function create(rootEl, opts) {
    opts = opts || {};
    var actions = (opts.actions || ['interact']).slice();
    var held = {}, down = {}, press = {}, rel = {}, stick = { x: 0, y: 0 }, enabled = true, overlay = null, btns = {}, cleanup = [];
    function fire(map, a) { var l = map[a]; if (l) for (var i = 0; i < l.length; i++) { try { l[i](a); } catch (e) { /* a game handler must never break input */ } } }
    function setHeld(a, v, src) {
      var was = !!held[a]; var s = down[a] || (down[a] = {}); if (v) s[src] = 1; else delete s[src];
      var now = Object.keys(s).length > 0; held[a] = now;
      if (now && !was) fire(press, a); else if (!now && was) fire(rel, a);
      if (btns[a]) btns[a].classList.toggle('on', now);
    }
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); cleanup.push(function () { t.removeEventListener(ev, fn, o); }); }

    /* keyboard */
    on(root, 'keydown', function (e) {
      if (!enabled || e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      var a = KEYS[e.code]; if (!a) return;
      if ((a === 'interact') && e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') && (e.code === 'Enter' || e.code === 'Space')) return; /* let a focused button act on its own */
      if (actions.indexOf(a) < 0 && !MOVE[a]) return;
      if (e.repeat) { e.preventDefault(); return; }
      e.preventDefault(); setHeld(a, true, 'key' + e.code);
    });
    on(root, 'keyup', function (e) { var a = KEYS[e.code]; if (a) setHeld(a, false, 'key' + e.code); });
    on(root, 'blur', function () { Object.keys(down).forEach(function (a) { down[a] = {}; if (held[a]) { held[a] = false; fire(rel, a); } }); stick.x = stick.y = 0; });

    /* touch overlay */
    function build() {
      if (overlay) overlay.remove();
      overlay = doc.createElement('div'); overlay.className = 'hog-touch'; overlay.setAttribute('aria-label', 'On-screen controls'); overlay.setAttribute('role', 'group');
      var js = doc.createElement('div'); js.className = 'hog-stick'; js.setAttribute('role', 'group'); js.setAttribute('aria-label', 'Move: drag, or use the four arrow buttons');
      var knob = doc.createElement('div'); knob.className = 'hog-knob'; js.appendChild(knob);
      var id = null, R = 44;
      function at(e) {
        var r = js.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, d / R);
        var x = dx / d * k, y = dy / d * k; if (k < 0.2) { x = 0; y = 0; }
        stick.x = x; stick.y = y; knob.style.transform = 'translate(' + (dx / d * Math.min(d, R)) + 'px,' + (dy / d * Math.min(d, R)) + 'px)';
      }
      js.addEventListener('pointerdown', function (e) { if (id !== null) return; id = e.pointerId; try { js.setPointerCapture(id); } catch (x) { /* ignore */ } at(e); e.preventDefault(); });
      js.addEventListener('pointermove', function (e) { if (e.pointerId === id) at(e); });
      var end = function (e) { if (e.pointerId !== id) return; id = null; stick.x = stick.y = 0; knob.style.transform = ''; };
      js.addEventListener('pointerup', end); js.addEventListener('pointercancel', end); js.addEventListener('lostpointercapture', end);
      overlay.appendChild(js);
      var pad = doc.createElement('div'); pad.className = 'hog-dpad';
      [['up', '▲', 'Move up'], ['left', '◀', 'Move left'], ['right', '▶', 'Move right'], ['down', '▼', 'Move down']].forEach(function (d) {
        var b = doc.createElement('button'); b.type = 'button'; b.className = 'hog-tbtn hog-d-' + d[0]; b.textContent = d[1]; b.setAttribute('aria-label', d[2]); btns[d[0]] = b; wire(b, d[0]); pad.appendChild(b);
      }); overlay.appendChild(pad);
      var col = doc.createElement('div'); col.className = 'hog-btns';
      actions.forEach(function (a) {
        if (MOVE[a]) return; var b = doc.createElement('button'); b.type = 'button'; b.className = 'hog-tbtn hog-act hog-a-' + a; b.setAttribute('aria-label', (LABEL[a] || a) + (KEYHINT[a] ? ' (key ' + KEYHINT[a] + ')' : ''));
        b.innerHTML = '<span>' + (LABEL[a] || a) + '</span>'; btns[a] = b; wire(b, a); col.appendChild(b);
      }); overlay.appendChild(col);
      rootEl.appendChild(overlay); overlay.hidden = !showing;
    }
    function wire(b, a) {
      var id = null, kb = false;
      b.addEventListener('pointerdown', function (e) { id = e.pointerId; try { b.setPointerCapture(id); } catch (x) { /* ignore */ } setHeld(a, true, 'tp'); e.preventDefault(); });
      var up = function (e) { if (e.pointerId !== id) return; id = null; setHeld(a, false, 'tp'); }; b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
      b.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { kb = true; setHeld(a, true, 'tk'); e.preventDefault(); } });
      b.addEventListener('keyup', function (e) { if ((e.key === 'Enter' || e.key === ' ') && kb) { kb = false; setHeld(a, false, 'tk'); e.preventDefault(); } });
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }
    var coarse = false; try { coarse = !!(root.matchMedia && root.matchMedia('(pointer: coarse)').matches); } catch (e) { /* ignore */ }
    var showing = opts.touch === true || (opts.touch !== false && coarse);
    build();

    var api = {
      /* movement vector, -1..1 on each axis: keyboard (digital) plus the on-screen stick (analog) */
      axis: function () {
        var x = stick.x, y = stick.y;
        if (held.left) x -= 1; if (held.right) x += 1; if (held.up) y -= 1; if (held.down) y += 1;
        var d = Math.sqrt(x * x + y * y); if (d > 1) { x /= d; y /= d; } return { x: x, y: y };
      },
      held: function (a) { return !!held[a]; },
      onPress: function (a, fn) { (press[a] = press[a] || []).push(fn); },
      onRelease: function (a, fn) { (rel[a] = rel[a] || []).push(fn); },
      /* programmatic press (tests, bots, tutorial hints): behaves exactly like a key or button */
      tap: function (a) { setHeld(a, true, 'api'); setHeld(a, false, 'api'); },
      hold: function (a, v) { setHeld(a, !!v, 'api'); },
      setActions: function (list) { actions = list.slice(); build(); },
      /* 'stick' (drag) or 'dpad' (four arrow buttons, for anyone who cannot drag) */
      setStyle: function (st) { if (overlay) overlay.classList.toggle('dpad', st === 'dpad'); },
      show: function (v) { showing = !!v; if (overlay) overlay.hidden = !showing; },
      isShown: function () { return showing; },
      enable: function (v) { enabled = !!v; if (!enabled) { stick.x = stick.y = 0; } },
      destroy: function () { cleanup.forEach(function (f) { f(); }); if (overlay) overlay.remove(); }
    };
    return api;
  }
  HOG.input = { create: create, KEYS: KEYS, LABEL: LABEL };
})(typeof window !== 'undefined' ? window : globalThis);
