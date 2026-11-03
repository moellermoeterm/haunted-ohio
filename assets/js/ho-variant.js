/* Haunted Ohio: case codes, seeded randomness and per-variant save slots (shared by The Haunting Files and The Last Light).
   Privacy: nothing here talks to a network. A student's name is only used, inside their own browser, to seed a shuffle. */
(function () {
  'use strict';
  function hash(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  /* mulberry32: small, fast, repeatable. Same seed gives the same sequence every time. */
  function rng(seed) { var a = hash(seed); return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, seed) { var r = rng(seed), a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function valid(n) { n = +n; return n >= 1 && n <= 6 && n === Math.floor(n) ? n : 0; }
  function fromUrl() { try { var m = /[?&]case=(\d+)/.exec(location.search); return m ? valid(m[1]) : 0; } catch (e) { return 0; } }
  function remembered(k) { try { return valid(localStorage.getItem(k)); } catch (e) { return 0; } }
  function remember(k, n) { try { localStorage.setItem(k, String(n)); } catch (e) { /* storage blocked: fine */ } }
  window.HOV = {
    hash: hash, rng: rng, shuffle: shuffle, valid: valid, fromUrl: fromUrl, remembered: remembered, remember: remember,
    random: function () { return 1 + Math.floor(Math.random() * 6); },
    /* which case to open: ?case=N wins, then the last one played on this device, then case 1 */
    pick: function (rememberKey) { return fromUrl() || remembered(rememberKey) || 1; },
    /* case 1 keeps the original save key, so saves made before variants existed are case 1 */
    slot: function (baseKey, n) { return n === 1 ? baseKey : baseKey + '_c' + n; }
  };
})();
