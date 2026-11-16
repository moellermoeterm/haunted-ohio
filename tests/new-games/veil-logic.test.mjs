// The Veil: logic and data tests (no browser). Determinism, six variants, puzzle checks from the same seeded data, no unreachable required things, save round trip.
// Run: node tests/new-games/veil-logic.test.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import assert from 'node:assert/strict'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
function world() {
  const store = {}; const ctx = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, location: { search: '' }, console }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['assets/js/ho-variant.js', 'games-shared/hog-core.js', 'the-veil/js/data.js', 'the-veil/js/logic.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  return ctx;
}
let n = 0; const T = (name, fn) => { try { fn(); n++; console.log('PASS  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + (e.stack || e).toString().split('\n').slice(0, 4).join('\n      ')); process.exitCode = 1; } };
const W = world(), HOG = W.HOG, V = W.HOG_VEIL, D = V.data, L = V.logic;
const mk = (variant, name) => { const saves = HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: L.STATE_SCHEMA }); return new L.Game(L.fresh(variant, name), saves); };
const names = ['Ana', 'Ben Carter', 'Zoë', 'x'];

T('six variants exist, each with a distinct chapel, keeper and place, and all three truths are used', () => {
  const c = Object.values(D.CASES); assert.equal(c.length, 6);
  for (const k of ['chapel', 'keeper', 'place', 'night']) assert.equal(new Set(c.map((x) => x[k])).size, 6, k);
  assert.deepEqual([...new Set(c.map((x) => x.truth))].sort(), ['gather', 'guide', 'warn']);
});
T('build is deterministic per (variant, name) and differs between variants and names', () => {
  const a = D.build(3, 'Ana'), b = D.build(3, 'Ana'); assert.equal(JSON.stringify([a.bell, a.pews, a.rings, a.page, a.options]), JSON.stringify([b.bell, b.pews, b.rings, b.page, b.options]));
  let diff = 0; for (let v = 1; v <= 6; v++) for (const nm of names) { const x = D.build(v, nm); const y = D.build(v, nm + 'q'); if (x.bell.join() !== y.bell.join() || x.pews.join() !== y.pews.join()) diff++; } assert.ok(diff >= 12, 'names change the puzzles: ' + diff);
});
T('puzzle checks accept exactly the seeded answers (bell + symbols), for every variant and several names', () => {
  for (let v = 1; v <= 6; v++) for (const nm of names) {
    const d = D.build(v, nm); assert.equal(d.bell.length, 4); assert.ok(!(d.bell.every((x) => x === d.bell[0])), 'not all the same note');
    assert.ok(d.checkBell(d.bell.slice())); { const bad = d.bell.slice(); bad[0] = bad[0] === 'LOW' ? 'HIGH' : 'LOW'; assert.ok(!d.checkBell(bad), 'one wrong note is refused'); }
    assert.ok(d.checkSymbols(d.pews.slice())); assert.equal([...d.pews].sort().join(), 'flame,star,tower');
    assert.ok(!d.checkSymbols([d.pews[1], d.pews[0], d.pews[2]])); assert.ok(!d.checkBell(d.bell.slice(0, 3)));
    for (const k of ['pewFront', 'pewMiddle', 'pewBack']) assert.ok(d.clues[k].body.includes(D.build(v, nm).symName[d.pews[['pewFront', 'pewMiddle', 'pewBack'].indexOf(k)]]), 'clue text uses the same data');
    assert.ok(d.clues.bellSeq.body.includes(d.bell.join(', ')));
  }
});
T('case file: only the seeded truth with two supporting clues closes the case; options are a shuffle of the three', () => {
  for (let v = 1; v <= 6; v++) { const d = D.build(v, 'Ana'); assert.equal(JSON.stringify(d.options.map((o) => o.id).sort()), JSON.stringify(['gather', 'guide', 'warn']));
    for (const o of d.options) { const r = d.checkCase(o.id, ['ledger', 'letter']); assert.equal(r.right, o.id === d.truth); assert.equal(r.cited, o.id === d.truth); }
    assert.equal(d.checkCase(d.truth, ['ledger', 'notice']).cited, false); assert.equal(d.checkCase(d.truth, ['echo', 'letter']).cited, true); assert.equal(d.checkCase(d.truth, ['ledger']).cited, false); }
});
T('every clue has a title, a category, a world and a body with no leftover {tokens}; ledger/letter/echo match the variant truth words', () => {
  for (let v = 1; v <= 6; v++) { const d = D.build(v, 'Ana'); for (const [id, c] of Object.entries(d.clues)) { assert.ok(c.title && c.cat && ['Living', 'Echo', 'Both'].includes(c.world), id); assert.ok(c.body.length > 20 && !/\{[a-z]+\}/.test(c.body), id + ' tokens'); }
    assert.ok(d.clues.echo.body.includes(d.keeper.split(' ')[0]) || d.clues.echo.body.includes(d.keeper)); }
});
T('no real-history claims: nothing is labelled "Real history" and no years appear in clue text', () => {
  const src = fs.readFileSync(path.join(ROOT, 'the-veil/js/data.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'the-veil/js/logic.js'), 'utf8');
  assert.ok(!/Real history/i.test(src.replace(/Nothing is presented as Real history/gi, '')), 'no Real history label');
  for (let v = 1; v <= 6; v++) for (const c of Object.values(D.build(v, 'Ana').clues)) assert.ok(!/\b(1[5-9]\d\d|20\d\d)\b/.test(c.body), 'year in clue: ' + c.title);
});
T('softlock check: the start can reach every thing the chapter needs, in the world and state it needs it', () => {
  for (let v = 1; v <= 6; v++) { const g = mk(v, 'Ana'); const E = (id) => g.ents.find((e) => e.id === id);
    for (const id of ['bell', 'notice', 'gate', 'plates']) assert.ok(g.usable(E(id), 'L', false), id + ' (living, before doors)');
    for (const id of ['plates', 'gate']) assert.ok(g.usable(E(id), 'E', false), id + ' (echo, before doors)');
    for (const id of ['pewFront', 'pewMiddle', 'pewBack', 'figure', 'echoScene', 'sacDoor']) assert.ok(g.usable(E(id), 'E', true), id + ' (echo, after doors)');
    for (const id of ['cabinet', 'photo', 'register', 'sacDoor']) assert.ok(g.usable(E(id), 'L', true), id + ' (living, after doors)');
    for (const id of ['pewFront', 'cabinet', 'echoScene']) assert.ok(!g.usable(E(id), id === 'cabinet' ? 'L' : 'E', false), id + ' is NOT reachable before the doors open (the doors really gate it)');
    assert.ok(!g.usable(E('echoScene'), 'L', true), 'the sacristy is Echo-only');
  }
});
T('graves never block the path: gate, doors and aisle tiles stay free in every variant and name', () => {
  for (let v = 1; v <= 6; v++) for (const nm of names) { const g = mk(v, nm); for (const [x, y] of [[16, 17], [17, 17], [16, 15], [17, 14], [16, 12], [17, 5]]) assert.ok(!g.tileSolid(x, y, 'E') || (x === 17 && y === 5), `tile ${x},${y}`); assert.equal(g.map[19][16], ','); }
});
T('full playthrough by logic only (all variants): bell -> shift -> doors -> pews -> cabinet -> echo -> case file -> story', () => {
  for (let v = 1; v <= 6; v++) { const g = mk(v, 'Ana'), d = g.d, E = (id) => g.ents.find((e) => e.id === id); let ev = [];
    g.on('doors', () => ev.push('doors')); g.on('case', () => ev.push('case')); g.on('story', () => ev.push('story'));
    assert.match(g.shift().msg, /brass bell/); assert.equal(g.objective().includes('Keeper'), true);
    assert.equal(g.interact(E('bell')).open, 'clue'); assert.ok(g.s.bell); assert.equal(g.shift().world, 'E'); assert.ok(g.hasClue('bellSeq'));
    assert.equal(g.tryBell(['LOW', 'LOW', 'LOW', 'HIGH'].slice(0, 4)).ok, d.bell.join() === 'LOW,LOW,LOW,HIGH'); assert.equal(g.tryBell(d.bell.slice()).ok, true); assert.ok(g.s.doors);
    for (const id of ['pewFront', 'pewMiddle', 'pewBack', 'figure']) g.interact(E(id)); assert.equal(g.shift().world, 'L');
    assert.equal(g.trySymbols(d.pews.slice().reverse()).ok, d.pews.slice().reverse().join() === d.pews.join()); assert.equal(g.trySymbols(d.pews.slice()).ok, true); assert.ok(g.hasClue('ledger') && g.hasClue('letter'));
    g.shift(); assert.equal(g.interact(E('echoScene')).open, 'scene'); assert.ok(g.s.scene); assert.match(g.caseBlock(), /field note/); g.write('note2', 'word '.repeat(45)); assert.equal(g.caseBlock(), '');
    const wrong = d.options.find((o) => o.id !== d.truth).id; assert.equal(g.submitCase(wrong, ['ledger', 'letter'], 'word '.repeat(30)).ok, false);
    assert.equal(g.submitCase(d.truth, ['ledger', 'notice'], 'word '.repeat(30)).ok, false); assert.equal(g.submitCase(d.truth, ['ledger', 'letter'], 'short').ok, false);
    assert.equal(g.submitCase(d.truth, ['ledger', 'echo'], 'word '.repeat(30)).ok, true); assert.ok(g.s.caseDone);
    for (const b of L.BEATS) assert.equal(g.saveBeat(b.k, 'word '.repeat(20)).ok, true); assert.ok(g.storyReady()); g.finishStory(); assert.ok(g.s.done); assert.deepEqual(ev, ['doors', 'case', 'story']);
    assert.doesNotMatch(g.reportText() + g.storyText(), /[Cc]ase \d/); assert.match(g.storyText(), /The Veil · /); assert.match(g.objective(), /complete/);
  }
});
T('shifting out of the sacristy in the Living World never traps the player', () => {
  const g = mk(1, 'Ana'); g.s.bell = true; g.s.doors = true; g.s.world = 'E'; g.setPos(28, 6); const r = g.shift(); assert.equal(r.world, 'L'); assert.equal(r.moved, true); assert.ok(!g.tileSolid(g.s.px, g.s.py, 'L'));
});
T('save round trip: a played record validates against the schema, exports and imports, and a tampered one is refused', () => {
  const g = mk(4, 'Ana'); g.s.bell = true; g.addClue('bell'); g.write('note1', 'a note'); g.save(); const sv = g.saves; const text = sv.exportText(4); assert.ok(text);
  const w2 = world(); const sv2 = w2.HOG.save.create({ game: 'veil', baseKey: 'ho-veil', stateSchema: w2.HOG_VEIL.logic.STATE_SCHEMA }); assert.equal(sv2.importText(text).ok, true); assert.equal(sv2.load(4).state.found[0], 'bell');
  const j = JSON.parse(text); j.data.state.px = 99; assert.equal(sv2.importText(JSON.stringify(j), { overwrite: true }).ok, false);
  const j2 = JSON.parse(text); j2.data.state.extra = 1; assert.equal(sv2.importText(JSON.stringify(j2), { overwrite: true }).ok, false);
});
console.log(process.exitCode ? '\nSome tests failed' : '\nAll ' + n + ' tests passed');
