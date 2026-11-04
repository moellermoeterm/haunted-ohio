/* Haunted Ohio Games: shared core (seeded variants, strict schema validation, storage, saves). See docs/agents/CONTRACTS.md.
   Privacy: nothing here touches the network. Saves stay in this browser (localStorage, with an in-memory fallback). */
(function (root) {
  'use strict';
  var HOG = root.HOG = root.HOG || {};
  var HOV = root.HOV;

  /* ---------- variants and seeds ---------- */
  function hash(s) { if (HOV) return HOV.hash(s); var h = 2166136261 >>> 0; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
  function mulberry(seedStr) { var a = hash(seedStr); return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var seed = {
    of: function (variant, name) { return hash(variant + '|' + String(name == null ? '' : name).trim().toLowerCase()); },
    rng: function (sd, tag) { return mulberry(sd + '|' + tag); },
    int: function (sd, tag, min, max) { return min + Math.floor(mulberry(sd + '|' + tag)() * (max - min + 1)); },
    pick: function (arr, sd, tag) { return arr[Math.floor(mulberry(sd + '|' + tag)() * arr.length)]; },
    shuffle: function (arr, sd, tag) { var r = mulberry(sd + '|' + tag), a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  };
  var variant = {
    valid: function (n) { n = +n; return n >= 1 && n <= 6 && n === Math.floor(n) ? n : 0; },
    /* ?case=N wins, then the last variant played on this device, then 1 */
    resolve: function (game) {
      var u = 0; try { var m = /[?&]case=(\d+)/.exec(root.location.search); u = m ? variant.valid(m[1]) : 0; } catch (e) { /* ignore */ }
      var r = 0; try { r = variant.valid(root.localStorage.getItem('hog_case_' + game)); } catch (e) { /* ignore */ }
      return u || r || 1;
    },
    remember: function (game, n) { try { root.localStorage.setItem('hog_case_' + game, String(n)); } catch (e) { /* blocked: fine */ } },
    random: function () { return 1 + Math.floor(Math.random() * 6); }
  };

  /* ---------- strict schema validation (used for imports and for loading saves) ----------
     schema: {t:'int',min,max} {t:'num',min,max} {t:'bool'} {t:'str',max,re?} {t:'enum',values}
             {t:'arr',max,of} {t:'obj',keys:{k:schema|{...,opt:true}}} {t:'map',keyRe,max,of}
     Unknown keys are rejected. clean() returns a fresh copy built only from allowed parts, or throws Error('path: reason'). */
  var BAD_KEYS = { '__proto__': 1, 'constructor': 1, 'prototype': 1 };
  var CTRL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
  function fail(path, why) { throw new Error((path || 'file') + ': ' + why); }
  function isPlain(v) { return v !== null && typeof v === 'object' && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null); }
  function setOwn(o, k, v) { Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true }); }
  function clean(s, v, path) {
    switch (s.t) {
      case 'int': if (typeof v !== 'number' || !isFinite(v) || Math.floor(v) !== v) fail(path, 'must be a whole number'); if (v < s.min || v > s.max) fail(path, 'out of range'); return v;
      case 'num': if (typeof v !== 'number' || !isFinite(v)) fail(path, 'must be a number'); if (v < s.min || v > s.max) fail(path, 'out of range'); return v;
      case 'bool': if (typeof v !== 'boolean') fail(path, 'must be true or false'); return v;
      case 'str': {
        if (typeof v !== 'string') fail(path, 'must be text');
        var t = v.replace(CTRL, ''); if (t.length > s.max) fail(path, 'text too long');
        if (s.re && !s.re.test(t)) fail(path, 'unexpected format'); return t;
      }
      case 'enum': if (s.values.indexOf(v) < 0) fail(path, 'unexpected value'); return v;
      case 'arr': {
        if (!Array.isArray(v)) fail(path, 'must be a list'); if (v.length > s.max) fail(path, 'list too long');
        var a = []; for (var i = 0; i < v.length; i++) a.push(clean(s.of, v[i], path + '[' + i + ']')); return a;
      }
      case 'obj': {
        if (!isPlain(v)) fail(path, 'must be an object');
        var ks = Object.keys(v), o = {}, k;
        for (var j = 0; j < ks.length; j++) { k = ks[j]; if (BAD_KEYS[k]) fail(path, 'forbidden key'); if (!Object.prototype.hasOwnProperty.call(s.keys, k)) fail(path, 'unknown key "' + k.slice(0, 20) + '"'); }
        var names = Object.keys(s.keys);
        for (var n = 0; n < names.length; n++) {
          k = names[n]; var sub = s.keys[k];
          if (!Object.prototype.hasOwnProperty.call(v, k)) { if (sub.opt) continue; fail(path, 'missing "' + k + '"'); }
          setOwn(o, k, clean(sub, v[k], path ? path + '.' + k : k));
        }
        return o;
      }
      case 'map': {
        if (!isPlain(v)) fail(path, 'must be an object');
        var mk = Object.keys(v); if (mk.length > s.max) fail(path, 'too many entries');
        var m = {};
        for (var q = 0; q < mk.length; q++) { var key = mk[q]; if (BAD_KEYS[key] || !s.keyRe.test(key)) fail(path, 'bad key'); setOwn(m, key, clean(s.of, v[key], path + '.' + key)); }
        return m;
      }
    }
    fail(path, 'bad schema');
  }
  var schema = {
    clean: clean,
    int: function (min, max, opt) { return { t: 'int', min: min, max: max, opt: !!opt }; },
    num: function (min, max, opt) { return { t: 'num', min: min, max: max, opt: !!opt }; },
    bool: function (opt) { return { t: 'bool', opt: !!opt }; },
    str: function (max, opt, re) { return { t: 'str', max: max, opt: !!opt, re: re }; },
    en: function (values, opt) { return { t: 'enum', values: values, opt: !!opt }; },
    arr: function (of, max, opt) { return { t: 'arr', of: of, max: max, opt: !!opt }; },
    obj: function (keys, opt) { return { t: 'obj', keys: keys, opt: !!opt }; },
    map: function (keyRe, of, max, opt) { return { t: 'map', keyRe: keyRe, of: of, max: max, opt: !!opt }; }
  };

  /* ---------- storage with in-memory fallback ---------- */
  var mem = {};
  var storage = {
    get: function (k) { try { var v = root.localStorage.getItem(k); if (v !== null) return v; } catch (e) { /* fall through */ } return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
    set: function (k, v) { mem[k] = v; try { root.localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { delete mem[k]; try { root.localStorage.removeItem(k); } catch (e) { /* ignore */ } },
    persistent: function () { try { var k = '__hog_t'; root.localStorage.setItem(k, '1'); root.localStorage.removeItem(k); return true; } catch (e) { return false; } }
  };

  /* ---------- saves ---------- */
  var MAX_IMPORT = 300000;
  function slotKey(base, n) { return n === 1 ? base : base + '_c' + n; }
  function envelopeSchema(game, stateSchema) {
    return schema.obj({
      v: schema.int(1, 1), game: schema.en([game]), variant: schema.int(1, 6), seed: schema.str(10, false, /^\d{1,10}$/),
      name: schema.str(24), created: schema.int(0, 8.64e15), updated: schema.int(0, 8.64e15),
      state: stateSchema, writing: schema.map(/^[a-z0-9_]{1,24}$/, schema.str(8000), 24)
    });
  }
  function createSaves(o) {
    var game = o.game, base = o.baseKey, env = envelopeSchema(game, o.stateSchema);
    var api = {
      game: game,
      key: function (n) { return slotKey(base, n); },
      /* returns validated data, or null when there is no save or the stored save is damaged (never throws) */
      load: function (n) {
        var raw = storage.get(slotKey(base, n)); if (!raw) return null;
        try { return clean(env, JSON.parse(raw), ''); } catch (e) { return null; }
      },
      save: function (n, data) { data.variant = n; data.updated = Date.now(); return storage.set(slotKey(base, n), JSON.stringify(data)); },
      clear: function (n) { storage.del(slotKey(base, n)); },
      list: function () {
        var out = []; for (var n = 1; n <= 6; n++) { var d = api.load(n); out.push(d ? { variant: n, name: d.name, updated: d.updated, summary: o.summary ? o.summary(d) : '' } : { variant: n, empty: true }); } return out;
      },
      usingMemory: function () { return !storage.persistent(); },
      exportText: function (n) {
        var d = api.load(n); if (!d) return null;
        return JSON.stringify({ format: 'haunted-ohio-save', formatVersion: 1, game: game, variant: n, exported: Date.now(), data: d }, null, 1);
      },
      /* validates the whole file first; writes only if everything is valid. Returns {ok:true, variant} or {ok:false, error} */
      importText: function (text, opts) {
        opts = opts || {};
        try {
          if (typeof text !== 'string') return { ok: false, error: 'That is not a save file.' };
          if (text.length > MAX_IMPORT) return { ok: false, error: 'That file is too big to be a save.' };
          var j; try { j = JSON.parse(text); } catch (e) { return { ok: false, error: 'That file is not a readable save.' }; }
          var wrap = clean(schema.obj({ format: schema.en(['haunted-ohio-save']), formatVersion: schema.int(1, 1), game: schema.en([game]), variant: schema.int(1, 6), exported: schema.int(0, 8.64e15), data: env }), j, '');
          if (wrap.data.variant !== wrap.variant) return { ok: false, error: 'The save file does not match itself.' };
          if (api.load(wrap.variant) && !opts.overwrite) return { ok: false, needsOverwrite: true, variant: wrap.variant, error: 'There is already a save in that slot.' };
          storage.set(slotKey(base, wrap.variant), JSON.stringify(wrap.data));
          return { ok: true, variant: wrap.variant };
        } catch (e) {
          return { ok: false, error: 'This save file was refused: ' + String(e && e.message || e).replace(/[<>&"']/g, '').slice(0, 80) };
        }
      }
    };
    return api;
  }

  HOG.seed = seed; HOG.variant = variant; HOG.schema = schema; HOG.storage = storage;
  HOG.save = { create: createSaves, MAX_IMPORT: MAX_IMPORT };
  HOG.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  HOG.version = 1;
})(typeof window !== 'undefined' ? window : globalThis);
