// Unit tests for games-shared/hog-core.js (seeds, strict schema, saves, import hardening).  Run: node tests/new-games/core.test.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function world({ blocked = false } = {}) {
  const store = {};
  const ls = blocked ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } }
    : { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const ctx = { localStorage: ls, location: { search: '' }, console }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['assets/js/ho-variant.js', 'games-shared/hog-core.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  return { ctx, store, HOG: ctx.HOG };
}
let n = 0; const T = (name, fn) => { try { fn(); n++; console.log('PASS  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + (e.message || e)); process.exitCode = 1; } };

const mkSchema = (S) => S.obj({ ch: S.int(1, 9), found: S.arr(S.str(20), 50), flags: S.map(/^[a-z]{1,10}$/, S.bool(), 20), note: S.str(100, true) });
const good = (HOG, variant = 1) => ({ v: 1, game: 'veil', variant, seed: String(HOG.seed.of(variant, 'Ana')), name: 'Ana', created: 1, updated: 2, state: { ch: 1, found: ['a'], flags: { x: true } }, writing: { a: 'hello' } });

T('seed: same name + variant gives the same seed; case and spaces do not matter; variants differ', () => {
  const { HOG } = world();
  assert.equal(HOG.seed.of(2, 'Ana'), HOG.seed.of(2, '  ana '));
  assert.notEqual(HOG.seed.of(2, 'Ana'), HOG.seed.of(3, 'Ana'));
  assert.notEqual(HOG.seed.of(2, 'Ana'), HOG.seed.of(2, 'Ben'));
});
T('seed: rng/int/pick/shuffle are repeatable and tags are independent', () => {
  const { HOG } = world(); const s = HOG.seed.of(4, 'Mia');
  const a = [1, 2, 3, 4, 5, 6]; assert.deepEqual(HOG.seed.shuffle(a, s, 'x'), HOG.seed.shuffle(a, s, 'x'));
  assert.deepEqual(a, [1, 2, 3, 4, 5, 6], 'input not mutated');
  assert.equal(HOG.seed.int(s, 'bell', 1, 9), HOG.seed.int(s, 'bell', 1, 9));
  const r1 = HOG.seed.rng(s, 'one'), r2 = HOG.seed.rng(s, 'one'); assert.equal(r1(), r2());
  for (let i = 0; i < 200; i++) { const v = HOG.seed.int(i, 't', 3, 5); assert.ok(v >= 3 && v <= 5); }
});
T('variant: valid() accepts only whole numbers 1 to 6', () => {
  const { HOG } = world();
  for (const ok of [1, 2, 6, '3']) assert.ok(HOG.variant.valid(ok)); for (const bad of [0, 7, 1.5, -1, 'x', null, NaN]) assert.equal(HOG.variant.valid(bad), 0);
});
T('variant: nothing is assigned until asked; ?case=N is ignored; ?preview=N is read (1 to 6 only); assign, read back and unassign', () => {
  const { ctx, HOG, store } = world(); assert.equal(HOG.variant.assigned('veil'), 0); assert.equal(HOG.variant.preview(), 0);
  ctx.location.search = '?case=6'; assert.equal(HOG.variant.preview(), 0); assert.equal(HOG.variant.assigned('veil'), 0);
  for (const [q, want] of [['?preview=4', 4], ['?x=1&preview=2', 2], ['?preview=0', 0], ['?preview=7', 0], ['?preview=x', 0], ['?preview=12', 0], ['?xpreview=3', 0]]) { ctx.location.search = q; assert.equal(HOG.variant.preview(), want, q); }
  HOG.variant.assign('veil', 5); assert.equal(store['ho-veil-assign'], '5'); assert.equal(HOG.variant.assigned('veil'), 5); assert.equal(HOG.variant.assigned('room214'), 0);
  store['ho-veil-assign'] = '9'; assert.equal(HOG.variant.assigned('veil'), 0, 'a bad stored value is ignored'); HOG.variant.assign('veil', 2); HOG.variant.unassign('veil'); assert.equal(HOG.variant.assigned('veil'), 0);
});
T('variant: roll() is uniform over 1 to 6 with a stubbed random source, always 1 to 6, and falls back when crypto is missing', () => {
  const { ctx, HOG } = world();
  /* every byte value once: 252 usable values give exactly 42 of each case; the four rejected bytes are skipped */
  let i = 0; const seq = Array.from({ length: 256 }, (_, k) => k); ctx.crypto = { getRandomValues: (b) => { b[0] = seq[i++ % seq.length]; return b; } };
  const counts = [0, 0, 0, 0, 0, 0, 0]; for (let k = 0; k < 252; k++) { const n = HOG.variant.roll(); assert.ok(n >= 1 && n <= 6 && Number.isInteger(n)); counts[n]++; }
  assert.deepEqual(JSON.parse(JSON.stringify(counts.slice(1))), [42, 42, 42, 42, 42, 42]);
  ctx.crypto = { getRandomValues: (b) => { b[0] = 255; return b; } }; ctx.Math = Math; const n2 = HOG.variant.roll(); assert.ok(n2 >= 1 && n2 <= 6, 'falls back when every byte is rejected');
  delete ctx.crypto; for (let k = 0; k < 50; k++) { const n = HOG.variant.roll(); assert.ok(n >= 1 && n <= 6); }
});
T('variant: a save made before cases were assigned keeps its case (the last one played, else the first slot with a save)', () => {
  const { HOG, store } = world(); const saves = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(HOG.schema) });
  assert.equal(HOG.variant.legacy('veil', saves), 0, 'no saves: nothing to keep'); saves.save(4, good(HOG, 4)); assert.equal(HOG.variant.legacy('veil', saves), 4);
  saves.save(2, good(HOG, 2)); assert.equal(HOG.variant.legacy('veil', saves), 2, 'the first slot with a save'); store['hog_case_veil'] = '4'; assert.equal(HOG.variant.legacy('veil', saves), 4, 'the last case played wins');
  store['hog_case_veil'] = '6'; assert.equal(HOG.variant.legacy('veil', saves), 2, 'a remembered case with no save is not used');
});
T('save: round trip, slots are separate (variant 1 keeps the base key), list shows all six', () => {
  const { HOG, store } = world(); const S = mkSchema(HOG.schema);
  const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: S, summary: (d) => 'ch ' + d.state.ch });
  assert.ok(sv.save(1, good(HOG, 1))); assert.ok(sv.save(3, good(HOG, 3)));
  assert.ok('ho-veil' in store && 'ho-veil_c3' in store && !('ho-veil_c2' in store));
  assert.equal(sv.load(3).variant, 3); assert.equal(sv.load(2), null);
  const l = sv.list(); assert.equal(l.length, 6); assert.equal(l[0].summary, 'ch 1'); assert.ok(l[1].empty);
  sv.clear(3); assert.equal(sv.load(3), null);
});
T('save: a damaged or tampered stored save loads as null and never throws', () => {
  const { HOG, store } = world(); const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(HOG.schema) });
  store['ho-veil'] = '{not json'; assert.equal(sv.load(1), null);
  store['ho-veil'] = JSON.stringify({ ...good(HOG), extra: 1 }); assert.equal(sv.load(1), null);
});
T('save: storage blocked -> in-memory fallback still works and is reported', () => {
  const { HOG } = world({ blocked: true }); const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(HOG.schema) });
  assert.equal(sv.save(1, good(HOG)), false); assert.equal(sv.load(1).name, 'Ana'); assert.equal(sv.usingMemory(), true);
});
T('export then import round-trips, and refuses to overwrite unless told', () => {
  const { HOG } = world(); const S = mkSchema(HOG.schema);
  const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: S });
  sv.save(2, good(HOG, 2)); const text = sv.exportText(2); assert.ok(JSON.parse(text).format === 'haunted-ohio-save');
  const w2 = world(); const sv2 = w2.HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(w2.HOG.schema) });
  let r = sv2.importText(text); assert.equal(r.ok, true); assert.equal(r.variant, 2); assert.equal(sv2.load(2).name, 'Ana');
  r = sv2.importText(text); assert.equal(r.ok, false); assert.ok(r.needsOverwrite);
  assert.equal(sv2.importText(text, { overwrite: true }).ok, true);
});

// ---- malicious / broken imports: every one must be refused and nothing may be written ----
const attacks = {
  'not JSON': () => 'hello',
  'not a string': () => 42,
  'too big': () => 'x'.repeat(300001),
  'array at top': () => '[]',
  'wrong format name': (g) => ({ format: 'other', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: good(g) }),
  'wrong game': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'room214', variant: 1, exported: 1, data: { ...good(g), game: 'room214' } }),
  'variant 7': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 7, exported: 1, data: { ...good(g), variant: 7 } }),
  'variant mismatch': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 2, exported: 1, data: good(g, 1) }),
  'unknown top-level key': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: good(g), evil: 1 }),
  'unknown state key': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), state: { ...good(g).state, evil: 1 } } }),
  'chapter out of range': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), state: { ...good(g).state, ch: 99 } } }),
  'NaN / Infinity number': (g) => '{"format":"haunted-ohio-save","formatVersion":1,"game":"veil","variant":1,"exported":1,"data":' + JSON.stringify(good(g)).replace('"ch":1', '"ch":1e999') + '}',
  'string where number expected': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), state: { ...good(g).state, ch: '1' } } }),
  'list too long': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), state: { ...good(g).state, found: Array(51).fill('a') } } }),
  'text too long': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), name: 'x'.repeat(25) } }),
  'writing too long': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), writing: { a: 'x'.repeat(8001) } } }),
  'bad writing key': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), writing: { 'A b': 'x' } } }),
  'too many writing keys': (g) => { const w = {}; for (let i = 0; i < 25; i++) w['k' + i] = 'x'; return { format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), writing: w } }; },
  'prototype pollution (__proto__ in state)': (g) => '{"format":"haunted-ohio-save","formatVersion":1,"game":"veil","variant":1,"exported":1,"data":' + JSON.stringify(good(g)).replace('"flags":{"x":true}', '"flags":{"__proto__":true}') + '}',
  'prototype pollution (constructor key)': (g) => '{"format":"haunted-ohio-save","formatVersion":1,"game":"veil","variant":1,"exported":1,"data":' + JSON.stringify(good(g)).replace('"flags":{"x":true}', '"flags":{"constructor":true}') + '}',
  'prototype pollution (__proto__ at top)': (g) => '{"__proto__":{"polluted":1},"format":"haunted-ohio-save","formatVersion":1,"game":"veil","variant":1,"exported":1,"data":' + JSON.stringify(good(g)) + '}',
  'bad seed format': (g) => ({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: { ...good(g), seed: '<script>' } }),
};
for (const [name, mk] of Object.entries(attacks)) {
  T('import refused: ' + name, () => {
    const { ctx, HOG, store } = world(); const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(HOG.schema) });
    let t = mk(HOG); if (typeof t === 'object' && t !== null) t = JSON.stringify(t);
    const r = sv.importText(t, { overwrite: true });
    assert.equal(r.ok, false, 'should be refused'); assert.equal(Object.keys(store).length, 0, 'nothing written');
    assert.ok(typeof r.error === 'string' && !/[<>]/.test(r.error), 'plain-text error');
    assert.equal(vm.runInContext('({}).polluted', ctx), undefined, 'Object.prototype untouched');
  });
}
T('import: HTML in text is kept as plain text (escaped when shown), control characters are stripped', () => {
  const { HOG } = world(); const sv = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: mkSchema(HOG.schema) });
  const d = good(HOG); d.name = '<b>Ana</b>\u0007'; d.writing = { a: '<img src=x onerror=alert(1)>\u0000ok' };
  const r = sv.importText(JSON.stringify({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 1, exported: 1, data: d }));
  assert.equal(r.ok, true); const got = sv.load(1);
  assert.equal(got.name, '<b>Ana</b>'); assert.equal(got.writing.a, '<img src=x onerror=alert(1)>ok');
  assert.equal(HOG.esc(got.writing.a), '&lt;img src=x onerror=alert(1)&gt;ok');
});
T('import: no code is evaluated (source has no eval / Function / outbound calls)', () => {
  const src = fs.readFileSync(path.join(ROOT, 'games-shared/hog-core.js'), 'utf8');
  for (const bad of [/\beval\s*\(/, /new Function/, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/, /importScripts/, /document\.write/]) assert.ok(!bad.test(src), 'found ' + bad);
});
console.log(process.exitCode ? '\nSome tests failed' : '\nAll ' + n + ' tests passed');
