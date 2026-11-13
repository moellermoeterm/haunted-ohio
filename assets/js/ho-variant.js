/* Haunted Ohio: randomly assigned cases, seeded randomness and per-case save slots (shared by The Haunting Files and The Last Light).
   Privacy: nothing here talks to a network. A student's name is only used, inside their own browser, to seed a shuffle. */
(function () {
  'use strict';
  function hash(s) { var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  /* mulberry32: small, fast, repeatable. Same seed gives the same sequence every time. */
  function rng(seed) { var a = hash(seed); return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function shuffle(arr, seed) { var r = rng(seed), a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function valid(n) { n = +n; return n >= 1 && n <= 6 && n === Math.floor(n) ? n : 0; }
  function remembered(k) { try { return valid(localStorage.getItem(k)); } catch (e) { return 0; } }
  /* ---- which case a student plays ----
     Students do not choose and are not told. The first time they press Begin on a device, one of the six is picked at random and
     kept under a small key of its own ("ho-<game>-assign"), which starting over does not clear (only "Erase my progress" does).
     The old ?case=N address is ignored. Leaders can look at a case with ?preview=N, which uses a throwaway save. */
  function preview() { try { var m = /[?&]preview=(\d+)(?:&|$)/.exec(location.search); return m ? valid(m[1]) : 0; } catch (e) { return 0; } }
  function akey(game) { return 'ho-' + game + '-assign'; }
  function assigned(game) { try { return valid(localStorage.getItem(akey(game))); } catch (e) { return 0; } }
  function assign(game, n) { try { localStorage.setItem(akey(game), String(n)); } catch (e) { /* storage blocked: the page keeps it in memory */ } }
  function unassign(game) { try { localStorage.removeItem(akey(game)); } catch (e) { /* ignore */ } }
  /* one of 1 to 6, each equally likely (bytes of 252 or more are thrown away so no number is favoured) */
  function roll() {
    try { var c = window.crypto || window.msCrypto, b = new Uint8Array(1); for (var i = 0; i < 64; i++) { c.getRandomValues(b); if (b[0] < 252) return 1 + (b[0] % 6); } } catch (e) { /* fall through */ }
    return 1 + Math.floor(Math.random() * 6);
  }
  function slot(baseKey, n) { return n === 1 ? baseKey : baseKey + '_c' + n; }
  function startedIn(baseKey, n) { try { var v = localStorage.getItem(slot(baseKey, n)); if (!v) return false; var o = JSON.parse(v); return !!(o && o.started); } catch (e) { return false; } }
  /* a save made before cases were assigned keeps its case: the last case played if it has a started save, else the first slot that has one */
  function legacy(rememberKey, baseKey) { var r = remembered(rememberKey); if (r && startedIn(baseKey, r)) return r; for (var n = 1; n <= 6; n++) if (startedIn(baseKey, n)) return n; return 0; }
  window.HOV = {
    hash: hash, rng: rng, shuffle: shuffle, valid: valid,
    preview: preview, assigned: assigned, assign: assign, unassign: unassign, roll: roll, legacy: legacy,
    /* case 1 keeps the original save key, so saves made before variants existed are case 1 */
    slot: slot
  };
})();
