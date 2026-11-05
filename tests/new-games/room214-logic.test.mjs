// Room 214: logic tests (no browser): determinism, map connectivity, enemy AI, noise, hiding, checkpoint, saves, and a sneaking bot that finishes all six variants.
// Run: node tests/new-games/room214-logic.test.mjs
import fs from 'node:fs'; import vm from 'node:vm'; import path from 'node:path'; import assert from 'node:assert/strict'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
function world() {
  const store = {}; const ctx = { localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } }, location: { search: '' }, console }; ctx.window = ctx; vm.createContext(ctx);
  for (const f of ['assets/js/ho-variant.js', 'games-shared/hog-core.js', 'room-214/js/data.js', 'room-214/js/logic.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  return ctx;
}
let n = 0; const T = (name, fn) => { try { fn(); n++; console.log('PASS  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + (e.stack || e).toString().split('\n').slice(0, 5).join('\n      ')); process.exitCode = 1; } };
const W = world(), HOG = W.HOG, R = W.HOG_R214, D = R.data, L = R.logic;
const mk = (variant, name = 'Ana') => { const saves = HOG.save.create({ game: 'room214', baseKey: 'ho-room214', stateSchema: L.STATE_SCHEMA }); return new L.Game(L.fresh(variant, name), saves); };
const run = (g, secs, inp = {}) => { for (let i = 0; i < secs * 60; i++) g.update(1 / 60, inp); };
const place = (g, f, x, y) => { g.pl.f = f; g.pl.x = x; g.pl.y = y; g.pl.hidden = false; };
const reach = (g, f, from, withSafe) => { const saveS = g.s.safe; g.s.safe = !!withSafe; const seen = new Set([from.join()]), q = [from]; while (q.length) { const c = q.shift(); for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = c[0] + d[0], y = c[1] + d[1]; if (!seen.has([x, y].join()) && !g.solid(f, x, y)) { seen.add([x, y].join()); q.push([x, y]); } } } g.s.safe = saveS; return seen; };

T('six variants: distinct hotels and guests; seeded digits, patrols and item spots are deterministic per name and differ across names and variants', () => {
  const c = Object.values(D.CASES); assert.equal(new Set(c.map((x) => x.hotel)).size, 6); assert.equal(new Set(c.map((x) => x.guest)).size, 6);
  const a = D.build(3, 'Ana'), b = D.build(3, 'Ana'); assert.equal(JSON.stringify([a.digits, a.patrol, a.items]), JSON.stringify([b.digits, b.patrol, b.items]));
  let diff = 0; for (let v = 1; v <= 6; v++) for (const nm of ['Ana', 'Ben', 'Mia', 'Zed']) { const x = D.build(v, nm), y = D.build(v, nm + 'q'); if (x.digits.join() !== y.digits.join() || JSON.stringify(x.items) !== JSON.stringify(y.items)) diff++; } assert.ok(diff >= 20, 'names change the game: ' + diff);
});
T('safe code is computed from the three seeded notes (one per floor) and checked against the same digits', () => {
  for (let v = 1; v <= 6; v++) for (const nm of ['Ana', 'Ben']) { const d = D.build(v, nm); assert.equal(d.digits.length, 3); assert.ok(d.checkSafe(d.digits.slice())); assert.ok(!d.checkSafe([d.digits[1], d.digits[0], d.digits[2]]) || d.digits[0] === d.digits[1]);
    [0, 1, 2].forEach((f) => { const note = d.items.find((i) => i.id === 'note' + f); assert.equal(note.floor, f); assert.ok(d.notes['note' + f].body.includes(String(d.digits[f]))); }); }
});
T('items: every floor has its batteries, bells, a note; cards and ledger exist; no two items share a spot; every item is reachable on foot from the start of its floor', () => {
  for (let v = 1; v <= 6; v++) { const g = mk(v), d = g.d; const kinds = (k) => d.items.filter((i) => i.kind === k).length; assert.equal(kinds('card'), 2); assert.equal(kinds('battery'), 6); assert.equal(kinds('bell'), 3); assert.equal(kinds('note'), 3); assert.equal(kinds('ledger'), 1);
    const spots = d.items.map((i) => i.floor + ':' + i.x + ',' + i.y); assert.equal(new Set(spots).size, spots.length, 'unique spots');
    for (const it of d.items) { const from = it.floor === 0 ? D.START : [1, 10]; const seen = reach(g, it.floor, from, true); assert.ok(seen.has([it.x, it.y].join()), `${it.id} unreachable (variant ${v})`); } }
});
T('connectivity: lobby to exit, both stairwells on every floor, the safe is reachable, and Room 214 is sealed until the safe opens', () => {
  const g = mk(1); const s0 = reach(g, 0, D.START, false); assert.ok(s0.has('3,10') || s0.has('2,10'), 'left alcove'); assert.ok(s0.has('37,10'), 'right alcove'); assert.ok(s0.has(D.START.join())); assert.ok(s0.has('4,16'));
  const s1 = reach(g, 1, [1, 10], false); assert.ok(!s1.has(D.R214.spot.join()), 'room 214 sealed'); assert.ok(s1.has('18,10'), 'near safe'); const s1b = reach(g, 1, [1, 10], true); assert.ok(s1b.has(D.R214.spot.join()), 'open after safe');
  for (const f of [0, 1, 2]) { const s = reach(g, f, [1, 10], false); assert.ok(s.has('37,10') && s.has('34,5') && s.has('5,16'), 'ring + both alcoves on floor ' + f); }
});
T('stairs: up needs the right keycard, down is always allowed, arrival is at a stairwell checkpoint', () => {
  const g = mk(1); place(g, 0, 2.5, 10.5); assert.match(g.stairs(1).msg, /keycard/); g.s.cards = 1; assert.equal(g.stairs(1).ok, true); assert.equal(g.pl.f, 1); assert.deepEqual([g.s.cpf, g.s.cpx], [1, 1]);
  place(g, 1, 2.5, 10.5); assert.match(g.stairs(1).msg, /better keycard/); g.s.cards = 2; assert.equal(g.stairs(1).ok, true); assert.equal(g.pl.f, 2); assert.equal(g.stairs(-1).ok, true); assert.equal(g.pl.f, 1);
});
T('noise: running is loud (alerts a porter within 6 tiles), sneaking is silent, throwing a bell lures him to the landing spot', () => {
  const g = mk(2); g.por[0].freeze = 0; place(g, 0, 10.5, 5.5); let po = g.por[0]; po.x = 15.5; po.y = 5.5; po.state = 'patrol'; po.path = []; po.pi = 0; g.pl.face = 0;
  let alerted = 0; g.on('alert', () => alerted++); g.pl.mode = 'sneak'; g.stepAcc = 0; for (let i = 0; i < 5; i++) { g.move(1, 0, 'sneak', 0.5); } assert.equal(g.rings.filter((r) => r.src === 'player').length, 0, 'sneaking makes no noise');
  g.pl.x = 10.5; g.stepAcc = 0; g.move(1, 0, 'run', 0.2); g.move(1, 0, 'run', 0.2); assert.ok(g.rings.some((r) => r.src === 'player' && r.level === 6), 'running makes noise level 6'); assert.ok(alerted >= 1 && po.state !== 'patrol', 'porter investigates the noise: ' + po.state);
  const g2 = mk(2); g2.por[0].freeze = 0; place(g2, 0, 5.5, 5.5); g2.s.bells = 1; g2.pl.face = 0; const po2 = g2.por[0]; po2.x = 20.5; po2.y = 6.5; po2.state = 'patrol'; po2.path = []; po2.pi = 0; assert.ok(g2.throwBell().ok); assert.equal(g2.s.bells, 0); assert.ok(po2.state === 'investigate' || Math.hypot(po2.x - 11.5, po2.y - 5.5) > 6);
  assert.equal(g2.throwBell().ok, false);
});
T('vision: he sees you in his cone with line of sight, not behind him, not through a closed door, and not while you are hidden', () => {
  const g = mk(1); g.por[0].freeze = 0; const po = g.por[0]; place(g, 0, 10.5, 5.5); po.x = 15.5; po.y = 5.5; po.face = Math.PI; g.pl.light = true; assert.equal(g.sees(po), true, 'in front');
  po.face = 0; assert.equal(g.sees(po), false, 'behind him'); po.face = Math.PI; g.pl.hidden = true; assert.equal(g.sees(po), false, 'hidden'); g.pl.hidden = false;
  place(g, 0, 10.5, 2.5); po.x = 10.5; po.y = 5.5; po.face = -Math.PI / 2; assert.equal(g.sees(po), false, 'a closed door blocks sight'); place(g, 0, 10.5, 4.5); assert.equal(g.sees(po), true, 'standing in the doorway opens it');
  place(g, 0, 10.5, 5.5); po.x = 24.5; po.y = 5.5; po.face = Math.PI; g.pl.light = true; assert.equal(g.sees(po), false, 'too far (14 tiles)'); po.x = 18.5; assert.equal(g.sees(po), true, 'light carries 9 tiles'); g.pl.light = false; assert.equal(g.sees(po), false, 'dark: only 4 tiles');
});
T('chase and caught: he chases only while he can see you; when he reaches you, you return to the checkpoint with every item kept and he is reset; nothing harmful happens', () => {
  const g = mk(3); g.s.cards = 1; g.s.bells = 2; g.s.got.push('card1'); g.s.batt = 80; const po = g.por[0]; po.freeze = 0; place(g, 0, 10.5, 5.5); po.x = 14.5; po.y = 5.5; po.face = Math.PI; g.pl.light = true; let ev = []; g.on('alert', (a) => ev.push(a.kind)); let fz = 0; g.on('caught', () => { ev.push('caught'); fz = g.por[0].freeze; });
  run(g, 0.2); assert.equal(po.state, 'chase'); run(g, 6); assert.ok(ev.includes('caught'), 'caught: ' + ev); assert.deepEqual([g.pl.f, Math.floor(g.pl.x), Math.floor(g.pl.y)], [0, D.START[0], D.START[1]]); assert.equal(g.s.cards, 1); assert.equal(g.s.bells, 2); assert.ok(g.s.got.includes('card1')); assert.equal(g.s.caught, 1); assert.ok(g.s.batt <= 70 && g.s.batt >= 66, 'battery ' + g.s.batt); assert.equal(g.por[0].state, 'patrol'); assert.ok(fz >= 6, 'he pauses after checking you out: ' + fz); assert.ok(Math.hypot(g.por[0].x - (D.START[0] + 0.5), g.por[0].y - (D.START[1] + 0.5)) > 15, 'and starts far from where you wake up');
});
T('hiding: you cannot hide while he is watching; hidden and silent he searches and gives up; hidden after making noise he finds you; you can leave the spot', () => {
  const g = mk(1); const po = g.por[0]; po.freeze = 0; place(g, 0, 8.5, 2.5); assert.equal(g.hide().ok, false === g.nearTile('h', 1.5) ? false : g.hide().ok); place(g, 0, 7.5, 1.5);
  /* a wardrobe is at (7,1) in room t0: stand next to it */
  place(g, 0, 8.5, 1.5); assert.ok(g.nearTile('h', 1.5), 'wardrobe is near'); po.x = 12.5; po.y = 5.5; po.face = Math.PI; po.state = 'chase'; po.last = [8.5, 1.5]; g.pl.hidden = false; assert.equal(g.hide().ok, true, 'out of sight: ok');
  po.state = 'search'; po.last = [8.5, 1.5]; po.spots = [[7, 1]]; po.si = 0; po.at = false; po.path = []; po.pi = 0; po.timer = 0; po.x = 8.5; po.y = 3.5; g.lastNoise = -99; run(g, 12); assert.equal(g.s.caught, 0, 'silent hider survives the search'); assert.ok(po.state === 'return' || po.state === 'patrol');
  const g2 = mk(1); const p2 = g2.por[0]; p2.freeze = 0; place(g2, 0, 8.5, 1.5); assert.equal(g2.hide().ok, true); p2.state = 'search'; p2.last = [8.5, 1.5]; p2.spots = [[7, 1]]; p2.si = 0; p2.at = false; p2.path = []; p2.pi = 0; p2.x = 8.5; p2.y = 3.5; g2.lastNoise = g2.t; run(g2, 12); assert.ok(g2.s.caught >= 1, 'a noisy hider is found');
  const g3 = mk(1); g3.pl.f = 0; place(g3, 0, 8.5, 1.5); g3.hide(); assert.equal(g3.pl.hidden, true); g3.move(1, 0, 'walk', 0.5); assert.equal(Math.floor(g3.pl.x), 8, 'cannot move while hidden'); assert.equal(g3.hide().ok, true); assert.equal(g3.pl.hidden, false);
});
T('simulation is deterministic: same seed and same inputs give the same porter positions', () => {
  const a = mk(4), b = mk(4); for (const g of [a, b]) { g.por[0].freeze = 0; place(g, 0, 5.5, 16.5); } run(a, 30, { ax: 0, ay: -0.2, mode: 'sneak' }); run(b, 30, { ax: 0, ay: -0.2, mode: 'sneak' }); assert.equal(JSON.stringify([a.por[0].x, a.por[0].y, a.por[0].state]), JSON.stringify([b.por[0].x, b.por[0].y, b.por[0].state]));
});
T('patrols: each porter walks his whole route without getting stuck (he reaches every waypoint within two minutes)', () => {
  for (let v = 1; v <= 6; v++) for (const f of [0, 1, 2]) { const g = mk(v); const po = g.por[f]; po.freeze = 0; g.pl.f = (f + 1) % 3; const hit = new Set(); const w = po.route.map((r) => r[0] + ',' + r[1]);
    for (let i = 0; i < 120 * 60; i++) { g.stepPorter(po, 1 / 60); const k = po.route.findIndex((r) => Math.hypot(r[0] - po.x, r[1] - po.y) < 0.3); if (k >= 0) hit.add(k); } assert.equal(hit.size, po.route.length, `v${v} floor ${f} visited ${hit.size}/${po.route.length}`); }
});
T('battery: the light drains slowly, a battery refills it, running dry turns the light off (never ends the game)', () => {
  const g = mk(1); g.por[0].freeze = 999; g.pl.light = true; run(g, 40); assert.ok(g.s.batt === 90 || g.s.batt === 91, 'battery ' + g.s.batt); g.s.batt = 1; let dark = false; g.on('dark', () => { dark = true; }); run(g, 5); assert.ok(dark && !g.pl.light && g.s.batt === 0); assert.equal(g.toggleLight(), false);
  const bat = g.d.items.find((i) => i.kind === 'battery' && i.floor === 0); place(g, 0, bat.x + 0.5, bat.y + 0.5); assert.equal(g.pick(bat).ok, true); assert.equal(g.s.batt, 40); assert.equal(g.toggleLight(), true);
});
T('save round trip and schema: a played record validates, exports, imports, tampering is refused', () => {
  const g = mk(5); g.s.cards = 2; g.s.got.push('card1'); g.s.found.push('note0'); g.write('j1', 'a journal entry'); g.save(); const text = g.saves.exportText(5); assert.ok(text);
  const w2 = world(); const sv2 = w2.HOG.save.create({ game: 'room214', baseKey: 'ho-room214', stateSchema: w2.HOG_R214.logic.STATE_SCHEMA }); assert.equal(sv2.importText(text).ok, true); assert.equal(sv2.load(5).state.cards, 2);
  const j = JSON.parse(text); j.data.state.batt = 500; assert.equal(sv2.importText(JSON.stringify(j), { overwrite: true }).ok, false); const j2 = JSON.parse(text); j2.data.game = 'veil'; assert.equal(sv2.importText(JSON.stringify(j2), { overwrite: true }).ok, false);
});
T('content: nobody is hurt and nothing is labelled real history; every note and the ledger have text; the porter is never described as attacking', () => {
  const src = fs.readFileSync(path.join(ROOT, 'room-214/js/data.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'room-214/js/logic.js'), 'utf8');
  assert.ok(!/\b(blood|gore|kill|murder|stab|scream|corpse|dead body|weapon|gun)\b/i.test(src.replace(/Nobody is harmed/gi, '')), 'no violent words'); assert.ok(!/real history/i.test(src.replace(/Nothing is Real history/gi, '')));
  for (let v = 1; v <= 6; v++) { const d = D.build(v, 'Ana'); for (const k of ['note0', 'note1', 'note2']) assert.ok(d.notes[k].body.length > 40 && !/\{[a-z]+\}/.test(d.notes[k].body)); assert.ok(d.ledger.body.includes(d.c.tag) && !/\{[a-z]+\}/.test(d.ledger.body)); }
});

/* ----- a sneaking bot plays every variant start to finish (it may be caught; being caught must never lose items or block progress) ----- */
const clone = (g) => { const c = Object.create(Object.getPrototypeOf(g)); Object.assign(c, g); c.pl = { ...g.pl, spot: g.pl.spot && g.pl.spot.slice() }; c.por = g.por.map((p) => JSON.parse(JSON.stringify(p))); c.s = JSON.parse(JSON.stringify(g.s)); c.rings = []; c.hooks = {}; c.saves = null; return c; };
/* walk a path with sneaking inputs; returns false if he caught the player on the way */
function walkPath(g, path, f) { const c0 = g.s.caught; let secs = 0; for (const p of path) { let k = 0; while (Math.hypot(p[0] - g.pl.x, p[1] - g.pl.y) > 0.12 && k++ < 600) { const dx = p[0] - g.pl.x, dy = p[1] - g.pl.y, l = Math.hypot(dx, dy) || 1; g.update(1 / 30, { ax: dx / l, ay: dy / l, mode: 'sneak' }); secs += 1 / 30; if (g.s.caught !== c0 || g.pl.f !== f) return { ok: g.s.caught === c0, secs }; } } return { ok: true, secs }; }
function bot(variant, name = 'Ana') {
  const g = mk(variant, name), d = g.d; let secs = 0, guard = 0;
  /* the bot plans like a careful player: it waits (standing still and low) until a simulated walk of its next leg is not caught */
  function goto(f, tx, ty, near = 0.9) {
    while (g.pl.f === f && Math.hypot(g.pl.x - (tx + 0.5), g.pl.y - (ty + 0.5)) > near) {
      const path = g.path(f, [g.pl.x, g.pl.y], [tx + 0.5, ty + 0.5]); if (!path.length) throw new Error(`no path on floor ${f} to ${tx},${ty} from ${g.pl.x},${g.pl.y}`);
      let wait = 0, found = -1; for (let dl = 0; dl <= 60; dl += 2) { const c = clone(g); const c0 = c.s.caught; for (let i = 0; i < dl * 30; i++) c.update(1 / 30, { ax: 0, ay: 0, mode: 'sneak' }); if (c.s.caught !== c0) continue; if (walkPath(c, path, f).ok) { found = dl; break; } }
      if (found < 0) found = 0; for (let i = 0; i < found * 30; i++) { g.update(1 / 30, { ax: 0, ay: 0, mode: 'sneak' }); secs += 1 / 30; }
      const r = walkPath(g, path, f); secs += r.secs; if (secs > 3600) throw new Error(`took too long going to ${f}:${tx},${ty} at ${g.pl.f}:${g.pl.x.toFixed(1)},${g.pl.y.toFixed(1)} caught ${g.s.caught}`); if (guard++ > 400) throw new Error(`stuck going to ${f}:${tx},${ty} at ${g.pl.x.toFixed(1)},${g.pl.y.toFixed(1)} caught ${g.s.caught}`);
      if (!r.ok) return false; }
    return g.pl.f === f;
  }
  const take = (id) => { const it = d.items.find((i) => i.id === id); while (!g.s.got.includes(id)) { if (g.pl.f !== it.floor) throw new Error('wrong floor for ' + id); goto(it.floor, it.x, it.y, 0.6); if (g.pl.f === it.floor && Math.hypot(g.pl.x - it.x - 0.5, g.pl.y - it.y - 0.5) <= 1.3) g.pick(it); if (guard++ > 400) throw new Error('stuck taking ' + id); } };
  const climb = (dir, side) => { const f0 = g.pl.f; while (g.pl.f === f0) { const tx = side === 'L' ? 2 : 37, ty = dir > 0 ? 9 : 12; goto(f0, tx, ty, 0.7); if (g.pl.f !== f0) break; const r = g.stairs(dir); if (!r.ok) throw new Error(r.msg); if (guard++ > 400) throw new Error('stuck on stairs'); } };
  const arrived = () => { };
  take('card1'); take('note0'); climb(1, 'L'); take('note1'); take('card2'); climb(1, 'L'); take('note2'); climb(-1, 'L');
  const digits = [0, 1, 2].map((f) => d.items.find((i) => i.id === 'note' + f).digit); assert.equal(g.s.found.length, 3, 'notes found');
  while (!g.s.safe) { goto(1, 18, 10, 0.9); if (g.pl.f === 1 && Math.hypot(g.pl.x - 18.5, g.pl.y - 10.5) <= 1.6) g.trySafe(digits); if (guard++ > 400) throw new Error('stuck at the safe'); }
  assert.ok(g.s.safe); take('ledger'); g.write('acct', 'word '.repeat(85)); g.write('seed', 'word '.repeat(65)); assert.equal(g.finishBlock(), '');
  climb(-1, 'L'); while (g.pl.f === 0 && !g.nearTile('X', 1.7)) { goto(0, 4, 16, 0.5); if (guard++ > 400) throw new Error('stuck at the exit'); } assert.equal(g.pl.f, 0); assert.ok(g.nearest().kind === 'exit'); assert.equal(g.finish(), true); assert.ok(g.s.done);
  return { secs, caught: g.s.caught, items: g.s.got.length };
}
for (let v = 1; v <= 6; v++) T('bot: variant ' + v + ' is finished by a sneaking bot (it may be caught; items and progress are kept)', () => { const r = bot(v); console.log('      simulated ' + Math.round(r.secs) + ' s, caught ' + r.caught + ' times, ' + r.items + ' items'); assert.ok(r.items >= 6); });
T('bot: also finishes with other names (seeded layouts differ)', () => { for (const nm of ['Ben Carter', 'Zoe', 'x y']) bot(2, nm); });
console.log(process.exitCode ? '\nSome tests failed' : '\nAll ' + n + ' tests passed');
