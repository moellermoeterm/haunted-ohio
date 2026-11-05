/* Haunted Ohio Games: UI shell. Top bar (with the Case N badge), settings, saves menu with export/import, captions + direction pulse,
   a polite live region, modals with a focus trap, and toasts. Everything is built with textContent or escaped HTML. See docs/agents/CONTRACTS.md. */
(function (root) {
  'use strict';
  var HOG = root.HOG = root.HOG || {}, doc = root.document, esc = function (s) { return HOG.esc(s); };
  var S = HOG.schema;
  var SETTINGS = S.obj({ mute: S.bool(), volume: S.num(0, 1), low: S.bool(), text: S.num(1, 1.3), touch: S.en(['auto', 'on', 'off']), pad: S.en(['stick', 'dpad']) });
  var DEFAULTS = { mute: false, volume: 0.6, low: false, text: 1, touch: 'auto', pad: 'stick' };

  function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(label, cls, fn) { var b = el('button', 'hog-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }

  function mount(o) {
    var game = o.game, setKey = (o.baseKey || ('ho-' + game)) + '_set', saves = o.saves, variantNow = o.variant, shell = { modalOpen: false };
    doc.documentElement.classList.add('hog'); doc.body.classList.add('hog');

    /* settings: validated on load; a damaged value falls back to defaults */
    var settings = (function () { try { var raw = HOG.storage.get(setKey); return raw ? S.clean(SETTINGS, JSON.parse(raw), '') : Object.assign({}, DEFAULTS); } catch (e) { return Object.assign({}, DEFAULTS); } })();
    function applySettings() {
      doc.documentElement.style.setProperty('--hog-text', String(settings.text)); doc.body.classList.toggle('hog-low', !!settings.low);
      if (HOG.audio) { HOG.audio.setMute(settings.mute); HOG.audio.setVolume(settings.volume); }
      if (shell.input) { shell.input.setStyle(settings.pad); shell.input.show(settings.touch === 'on' || (settings.touch === 'auto' && coarse())); }
      if (o.onSettings) o.onSettings(settings);
    }
    function persist() { HOG.storage.set(setKey, JSON.stringify(settings)); applySettings(); if (muteBtn) { muteBtn.setAttribute('aria-pressed', String(!settings.mute)); muteBtn.textContent = settings.mute ? 'Sound: off' : 'Sound: on'; } }
    function coarse() { try { return !!root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } }

    /* top bar */
    var bar = el('header', 'hog-bar'); bar.setAttribute('role', 'banner');
    var brand = el('a', 'hog-brand', '‹ Haunted Ohio'); brand.href = o.home || '../'; bar.appendChild(brand);
    var title = el('h1', 'hog-title', o.title); bar.appendChild(title);
    var badge = el('span', 'hog-case', 'Case ' + variantNow); badge.id = 'hog-case'; badge.setAttribute('aria-label', 'Variant: case ' + variantNow + ' of 6'); bar.appendChild(badge);
    var tools = el('div', 'hog-tools'); bar.appendChild(tools);
    var caseBtn = btn('Case', '', function () { openCase(); }), savesBtn = btn('Saves', '', function () { openSaves(); }), setBtn = btn('Settings', '', function () { openSettings(); });
    var muteBtn = btn('', '', function () { settings.mute = !settings.mute; persist(); });
    muteBtn.id = 'hog-mute'; caseBtn.id = 'hog-casebtn'; savesBtn.id = 'hog-savesbtn'; setBtn.id = 'hog-setbtn';
    [caseBtn, savesBtn, muteBtn, setBtn].forEach(function (b) { tools.appendChild(b); });
    doc.body.insertBefore(bar, doc.body.firstChild);

    /* live region, captions, pulse */
    var live = el('div', 'sr'); live.id = 'hog-live'; live.setAttribute('aria-live', 'polite'); live.setAttribute('role', 'status'); doc.body.appendChild(live);
    var caps = el('div', 'hog-captions'); caps.id = 'hog-captions'; caps.setAttribute('role', 'log'); caps.setAttribute('aria-label', 'Sound captions'); doc.body.appendChild(caps);
    var pulse = el('div', 'hog-pulse'); pulse.setAttribute('aria-hidden', 'true'); doc.body.appendChild(pulse);
    var toastEl = null, toastT = 0, lastLive = '', lastLiveAt = 0;
    shell.say = function (msg) { var n = Date.now(); if (msg === lastLive && n - lastLiveAt < 1500) return; lastLive = msg; lastLiveAt = n; live.textContent = ''; setTimeout(function () { live.textContent = msg; }, 30); };
    shell.caption = function (c) {
      var line = el('div', 'hog-cap'); var b = el('b', null, '[' + (c.dir ? c.dir + ': ' : '') + c.caption + ']'); line.appendChild(b); caps.appendChild(line);
      while (caps.children.length > 3) caps.removeChild(caps.firstChild);
      setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 6200);
      if (c.dir) { pulse.setAttribute('data-dir', c.dir); pulse.classList.remove('show'); void pulse.offsetWidth; pulse.classList.add('show'); }
    };
    if (HOG.audio) HOG.audio.onCue(function (c) { shell.caption(c); });
    shell.toast = function (msg) {
      if (!toastEl) { toastEl = el('div', 'hog-toast'); toastEl.setAttribute('role', 'status'); doc.body.appendChild(toastEl); }
      toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 3500); shell.say(msg);
    };

    /* modal with focus trap; body is a DOM node built by the caller */
    shell.modal = function (m) {
      var prev = doc.activeElement, bg = el('div', 'hog-modal-bg'), box = el('div', 'hog-modal'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      var h = el('h2', null, m.title); h.id = 'hog-mt' + Date.now(); box.setAttribute('aria-labelledby', h.id); box.appendChild(h);
      if (m.body) box.appendChild(m.body);
      var row = el('div', 'row'); (m.buttons || [{ label: 'Close' }]).forEach(function (bt) {
        var b = btn(bt.label, bt.primary ? 'primary' : '', function () { if (bt.onClick) bt.onClick(api); if (bt.keepOpen !== true) api.close(); }); row.appendChild(b);
      }); box.appendChild(row); bg.appendChild(box); doc.body.appendChild(bg);
      shell.modalOpen = true; if (shell.input) shell.input.enable(false); if (o.onModal) o.onModal(true);
      function keys(e) {
        if (e.key === 'Escape') { e.stopPropagation(); api.close(); return; }
        if (e.key !== 'Tab') return;
        var f = box.querySelectorAll('button,input,textarea,select,a[href]'); var list = []; for (var i = 0; i < f.length; i++) if (!f[i].disabled && f[i].offsetParent !== null) list.push(f[i]);
        if (!list.length) return; var first = list[0], last = list[list.length - 1];
        if (e.shiftKey && doc.activeElement === first) { last.focus(); e.preventDefault(); } else if (!e.shiftKey && doc.activeElement === last) { first.focus(); e.preventDefault(); }
      }
      doc.addEventListener('keydown', keys, true);
      var closed = false, api = { el: box, close: function () { if (closed || !bg.parentNode) return; closed = true; doc.removeEventListener('keydown', keys, true); bg.remove(); shell.modalOpen = false; if (shell.input) shell.input.enable(true); if (o.onModal) o.onModal(false); if (m.onClose) m.onClose(); if (prev && prev.focus) prev.focus(); } };
      setTimeout(function () { var f = box.querySelector('[data-autofocus]') || box.querySelector('input,textarea,select,button'); if (f) f.focus(); }, 30);
      return api;
    };

    /* case chooser (also used on each game's title screen) */
    shell.caseField = function (host, onPick) {
      var wrap = el('div', 'row'), lab = el('label', 'hog-label', 'Case code (1 to 6)'); lab.htmlFor = 'hog-caseCode'; var inp = el('input'); inp.type = 'number'; inp.id = 'hog-caseCode'; inp.min = '1'; inp.max = '6'; inp.value = String(variantNow); inp.inputMode = 'numeric'; inp.setAttribute('autocomplete', 'off');
      var go = function (n) { n = HOG.variant.valid(n); if (n) onPick(n); else shell.toast('Case codes go from 1 to 6.'); };
      inp.addEventListener('change', function () { go(inp.value); });
      var rnd = btn('Random case', '', function () { go(HOG.variant.random()); });
      var d = el('div'); d.appendChild(lab); d.appendChild(inp); wrap.appendChild(d); wrap.appendChild(rnd); host.appendChild(wrap); return inp;
    };
    function openCase() {
      var body = el('div'); body.appendChild(el('p', null, 'Each case code (1 to 6) is its own version of the game with its own details and its own save.'));
      var field = shell.caseField(body, function (n) { m.close(); goVariant(n); }); field.setAttribute('data-autofocus', '1');
      var m = shell.modal({ title: 'Choose a case', body: body });
    }
    var navigating = false;
    function goVariant(n) { if (n === variantNow || navigating) return; navigating = true; HOG.variant.remember(game, n); try { var u = new URL(root.location.href); u.searchParams.set('case', String(n)); root.location.href = u.toString(); } catch (e) { root.location.search = '?case=' + n; } }
    shell.goVariant = goVariant;

    /* saves: list of six slots, open / export / delete, and import */
    function download(name, text) { var b = new Blob([text], { type: 'application/json' }), u = URL.createObjectURL(b), a = el('a'); a.href = u; a.download = name; doc.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 2000); }
    function openSaves() {
      var body = el('div'); var warn = el('p', 'hog-muted'); warn.textContent = saves.usingMemory() ? 'Saving is blocked in this browser, so progress is only kept until you close this page. Use Export to keep it.' : 'Saves stay in this browser on this device. Nothing is sent anywhere.'; body.appendChild(warn);
      var list = el('div', 'hog-slots'); body.appendChild(list);
      saves.list().forEach(function (s) {
        var r = el('div', 'hog-slot'), g = el('div', 'grow'); g.appendChild(el('b', null, 'Case ' + s.variant + (s.variant === variantNow ? ' (this one)' : '')));
        g.appendChild(el('div', null, s.empty ? 'Empty' : (s.name || 'Unnamed') + (s.summary ? ' · ' + s.summary : ''))); r.appendChild(g);
        if (!s.empty) {
          r.appendChild(btn('Open', '', function () { m.close(); goVariant(s.variant); if (s.variant === variantNow) root.location.reload(); }));
          r.appendChild(btn('Export', '', function () { var t = saves.exportText(s.variant); if (t) download('haunted-ohio-' + game + '-case' + s.variant + '.json', t); }));
          r.appendChild(btn('Delete', '', function () { if (root.confirm('Delete the save for case ' + s.variant + '? This cannot be undone.')) { saves.clear(s.variant); m.close(); openSaves(); if (s.variant === variantNow && o.onCleared) o.onCleared(); } }));
        } list.appendChild(r);
      });
      var imp = el('div', 'row'), lab = el('label', 'hog-label', 'Import a save file'); var inp = el('input'); inp.type = 'file'; inp.accept = '.json,application/json'; inp.id = 'hog-import'; lab.htmlFor = 'hog-import'; var d = el('div'); d.appendChild(lab); d.appendChild(inp); imp.appendChild(d); body.appendChild(imp);
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0]; if (!f) return; if (f.size > HOG.save.MAX_IMPORT) { shell.toast('That file is too big to be a save.'); inp.value = ''; return; }
        var rd = new FileReader(); rd.onload = function () {
          var r = saves.importText(String(rd.result), { overwrite: false });
          if (r.needsOverwrite) { if (root.confirm('There is already a save for case ' + r.variant + '. Replace it with the file?')) r = saves.importText(String(rd.result), { overwrite: true }); }
          if (r.ok) { shell.toast('Imported the save for case ' + r.variant + '.'); m.close(); goVariant(r.variant); if (r.variant === variantNow) root.location.reload(); } else shell.toast(r.error);
        }; rd.onerror = function () { shell.toast('That file could not be read.'); }; rd.readAsText(f);
      });
      var m = shell.modal({ title: 'Saves', body: body });
    }
    shell.openSaves = openSaves;

    function openSettings() {
      var body = el('div');
      function row(label, ctl) { var r = el('div', 'row'), l = el('label', 'hog-label', label); if (ctl.id) l.htmlFor = ctl.id; r.appendChild(l); r.appendChild(ctl); body.appendChild(r); return ctl; }
      var vol = el('input'); vol.type = 'range'; vol.min = '0'; vol.max = '1'; vol.step = '0.05'; vol.value = String(settings.volume); vol.id = 'hog-vol'; vol.addEventListener('input', function () { settings.volume = +vol.value; persist(); }); row('Volume', vol);
      var low = el('input'); low.type = 'checkbox'; low.id = 'hog-low'; low.checked = settings.low; low.addEventListener('change', function () { settings.low = low.checked; persist(); }); row('Low-intensity mode (no screen shake, fewer effects, calmer pulses)', low);
      var tx = el('select'); tx.id = 'hog-text'; [['1', 'Normal'], ['1.15', 'Large'], ['1.3', 'Extra large']].forEach(function (p) { var op = el('option', null, p[1]); op.value = p[0]; tx.appendChild(op); }); tx.value = String(settings.text); tx.addEventListener('change', function () { settings.text = +tx.value; persist(); }); row('Text size', tx);
      var tc = el('select'); tc.id = 'hog-touch'; [['auto', 'Automatic'], ['on', 'Always show'], ['off', 'Hide']].forEach(function (p) { var op = el('option', null, p[1]); op.value = p[0]; tc.appendChild(op); }); tc.value = settings.touch; tc.addEventListener('change', function () { settings.touch = tc.value; persist(); }); row('On-screen touch controls', tc);
      var pd = el('select'); pd.id = 'hog-pad'; [['stick', 'Drag stick'], ['dpad', 'Four arrow buttons']].forEach(function (p) { var op = el('option', null, p[1]); op.value = p[0]; pd.appendChild(op); }); pd.value = settings.pad; pd.addEventListener('change', function () { settings.pad = pd.value; persist(); }); row('Movement control', pd);
      body.appendChild(el('p', null, 'Keys: arrows or WASD move, E or Enter act, V shift worlds (The Veil), H hide (Room 214), Shift run, J journal, Esc menu.'));
      shell.modal({ title: 'Settings', body: body });
    }
    shell.openSettings = openSettings;

    shell.settings = settings;
    shell.attachInput = function (input) { shell.input = input; applySettings(); };
    persist();
    return shell;
  }
  HOG.shell = { mount: mount, DEFAULTS: DEFAULTS };
})(typeof window !== 'undefined' ? window : globalThis);
