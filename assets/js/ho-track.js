/* Haunted Ohio: privacy-first, anonymous counting (GoatCounter). Loaded on every page next to the GoatCounter snippet.
   What is ever sent: a page path from a fixed pattern (for example /haunting-files or /week) and the names of a few fixed events below.
   Never sent: names, anything typed, saves, case codes, scores or anything else a student wrote.
   Safe if blocked: if GoatCounter is blocked, offline, or not set up yet (the placeholder YOUR_CODE), every call here quietly does nothing. */
(function () {
  'use strict';
  var EVENTS = { 'game-opened-haunting-files': 1, 'game-opened-last-light': 1, 'game-opened-the-veil': 1, 'game-opened-room-214': 1, 'chapter-complete': 1, 'lesson-complete': 1, 'mission-complete': 1, 'stop-complete': 1, 'case-closed': 1, 'form-opened': 1, 'resources-opened': 1, 'arc-check-saved': 1 };
  var queue = [], tries = 0, timer = null;
  function endpoint() { var s = document.querySelector('script[data-goatcounter]'); return s ? (s.getAttribute('data-goatcounter') || '') : ''; }
  function configured() { var e = endpoint(); return !!e && !/YOUR_CODE/.test(e); }
  function ready() { return !!(window.goatcounter && typeof window.goatcounter.count === 'function'); }
  function flush() {
    try {
      if (ready()) { while (queue.length) window.goatcounter.count(queue.shift()); clearInterval(timer); timer = null; return; }
      if (++tries > 20) { queue.length = 0; clearInterval(timer); timer = null; }
    } catch (e) { queue.length = 0; }
  }
  function send(o) {
    try {
      if (!configured()) return;
      queue.push(o); flush();
      if (queue.length && !timer) timer = setInterval(flush, 500);
    } catch (e) { /* never break the page */ }
  }
  /* each home tab and each page counts as its own page */
  window.HO_page = function (path) { if (typeof path === 'string' && /^\/[a-z0-9-]{0,40}$/.test(path)) send({ path: path, title: path }); };
  window.HO_track = function (name) { if (EVENTS[name] === 1) send({ path: 'event/' + name, title: name, event: true }); };
  /* pages other than the home page (which counts its own tabs) count once on load */
  try {
    if (!document.querySelector('.view[data-view]')) {
      var seg = location.pathname.split('/').filter(Boolean).filter(function (x) { return !/\.html?$/.test(x); }).pop() || '';
      window.addEventListener('DOMContentLoaded', function () { window.HO_page('/' + seg.toLowerCase().replace(/[^a-z0-9-]/g, '')); });
    }
  } catch (e) { /* ignore */ }
})();
