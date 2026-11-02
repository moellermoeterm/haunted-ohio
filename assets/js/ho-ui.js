/* Haunted Ohio shared UI helpers. Classic script (no build, no modules): window.HO
   - HO.theme   night (default) / daylight, stored in the same "ho-theme" key the site already uses
   - HO.loader  branded loading screen
   - HO.dialog  accessible dialog (focus trap, Esc, backdrop click, returns focus)
   - HO.toast   short message
   - HO.icon    inline SVG from the shared icon sprite
   Safe to load in <head>: theme is applied immediately so there is no flash of the wrong theme. */
(function () {
  'use strict';
  var HO = (window.HO = window.HO || {});
  var scriptSrc = (document.currentScript && document.currentScript.src) || '';
  var ROOT = scriptSrc ? scriptSrc.replace(/assets\/js\/ho-ui\.js.*$/, '') : '';
  HO.root = ROOT;

  // ---- safe storage (private mode, blocked storage) ----
  var mem = {};
  HO.store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); if (v !== null) return JSON.parse(v); } catch (e) { /* ignore */ } return k in mem ? mem[k] : d; },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  // ---- theme ----
  var root = document.documentElement;
  HO.theme = {
    get: function () { return HO.store.get('ho-theme', null) === 'light' ? 'light' : 'dark'; },
    apply: function () { if (HO.theme.get() === 'light') root.setAttribute('data-theme', 'light'); else root.setAttribute('data-theme', 'dark'); },
    set: function (t) { HO.store.set('ho-theme', t); HO.theme.apply(); window.dispatchEvent(new CustomEvent('ho-theme', { detail: t })); },
    toggle: function () { HO.theme.set(HO.theme.get() === 'dark' ? 'light' : 'dark'); },
  };
  HO.theme.apply();

  // ---- icons ----
  HO.icon = function (name, cls) {
    return '<svg class="ho-icon ' + (cls || '') + '" aria-hidden="true" focusable="false"><use href="' + ROOT + 'assets/img/ho-icons.svg#i-' + name + '"/></svg>';
  };

  // ---- loader ----
  var loaderEl = null;
  HO.loader = {
    show: function (label) {
      if (loaderEl) return;
      loaderEl = document.createElement('div'); loaderEl.className = 'ho-loader'; loaderEl.setAttribute('role', 'status');
      loaderEl.innerHTML = '<img src="' + ROOT + 'assets/img/ho-logo.png" alt=""><p>' + (label || 'Opening the archive') + '</p><div class="ho-progress"><i></i></div>';
      document.body.appendChild(loaderEl);
    },
    hide: function () {
      if (!loaderEl) return; var el = loaderEl; loaderEl = null; el.classList.add('is-off'); setTimeout(function () { el.remove(); }, 650);
    },
  };

  // ---- toast ----
  var toastEl = null, toastT = 0;
  HO.toast = function (text, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'ho-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); document.body.appendChild(toastEl); }
    toastEl.textContent = text; void toastEl.offsetWidth; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, ms || 2800);
  };

  // ---- dialog ----
  // HO.dialog({title, html, closable:true, onClose}) -> {el, body, close(v)}
  HO.dialog = function (opt) {
    var opener = document.activeElement;
    var back = document.createElement('div'); back.className = 'ho-backdrop';
    var card = document.createElement('div'); card.className = 'ho-dialog'; card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    var id = 'hod' + Math.random().toString(36).slice(2, 7);
    card.setAttribute('aria-labelledby', id);
    card.innerHTML = '<h2 id="' + id + '" tabindex="-1"></h2><div class="ho-dialog__body"></div>';
    card.querySelector('h2').textContent = opt.title || '';
    var body = card.querySelector('.ho-dialog__body'); body.innerHTML = opt.html || '';
    back.appendChild(card); document.body.appendChild(back);
    var closable = opt.closable !== false, done = false;
    function close(v) {
      if (done) return; done = true; document.removeEventListener('keydown', key, true); back.remove();
      if (opener && document.body.contains(opener)) { try { opener.focus(); } catch (e) { /* ignore */ } }
      if (opt.onClose) opt.onClose(v);
    }
    function key(e) {
      if (e.key === 'Escape' && closable) { e.preventDefault(); e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = card.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return; var a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
    document.addEventListener('keydown', key, true);
    if (closable) back.addEventListener('mousedown', function (e) { if (e.target === back) close(); });
    card.querySelector('h2').focus();
    return { el: back, card: card, body: body, close: close };
  };
})();
