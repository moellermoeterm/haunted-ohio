// Room 214: sound. The "no" buzz is unchanged; every haunted sound can be heard on laptop speakers (energy above 300 Hz after a 250 Hz high-pass);
// the limiter stops spikes; every sound shows its caption with sound off; mute silences everything; the pulse only plays near him; Low effects
// halves the ambience and turns the pulse off; walking into a wall makes no sound.  Run: node tests/new-games/room214-sound.test.mjs
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = await import(path.join(ROOT, 'tests/node_modules/playwright/index.mjs'))); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/room-214/`;
const browser = await chromium.launch(); let fail = 0, pass = 0;
const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
const only = process.env.ONLY;
async function T(name, fn) {
  if (only && !name.includes(only)) return; const t0 = Date.now(); const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p = await ctx.newPage(); if (!(typeof opts !== 'undefined' && opts && opts.tour)) await p.addInitScript(() => { try { localStorage.setItem('ho-room214-tour', JSON.stringify({ intro: true, done: [], off: true })); } catch (e) { /* blocked */ } }); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); }); p.setDefaultTimeout(15000); p.on('dialog', (d) => d.accept());
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}
async function begin(p, variant = 1) { await p.goto(base + '?preview=' + variant); await p.fill('#r-name', 'Ana'); await p.click('#r-begin'); await p.waitForFunction(() => window.__r214Scene && window.__r214Amb, null, { timeout: 15000 }); }
const calm = (p) => p.evaluate(() => { __r214Game.por.forEach((x) => { x.freeze = 99999; x.x = 1.5; x.y = 1.5; }); });
const caps = (p) => p.evaluate(() => [...document.querySelectorAll('#hog-captions .hog-cap')].map((e) => e.textContent).join(' | '));
const capWait = (p, re) => p.waitForFunction((s) => new RegExp(s).test(document.querySelector('#hog-captions').textContent), re.source, { timeout: 6000 });
const mute = (p, on) => p.evaluate((m) => { window.HOG.audio.setMute(m); }, on);

/* renders a sound in an offline audio context and measures it. hp: high-pass the output at 250 Hz (two stages) first, like small laptop speakers. */
const RENDER = `async (name, opts) => {
  const A = window.HOG.audio, S = window.HOG_R214.sound, sr = 44100, len = Math.round(sr * (opts.secs || 2.5)), c = new OfflineAudioContext(1, len, sr);
  let out = c.destination; if (opts.hp) { const h1 = c.createBiquadFilter(), h2 = c.createBiquadFilter(); h1.type = h2.type = 'highpass'; h1.frequency.value = h2.frequency.value = 250; h1.connect(h2); h2.connect(c.destination); out = h1; }
  if (opts.limit) { const l = A.makeLimiter(c); l.output.connect(out); out = l.input; }
  if (opts.boost) { const b = c.createGain(); b.gain.value = opts.boost; b.connect(out); out = b; }
  if (opts.old) { opts.old(c, out, A); }
  else if (S.BUILD[name]) { const g = c.createGain(); g.gain.value = S.LEVELS[name].gain; g.connect(out); S.BUILD[name](c, g); }   /* a lasting layer at its own level */
  else if (Array.isArray(name)) { name.forEach((n) => A.recipe(n)(c, out, {})); }
  else A.recipe(name)(c, out, {});
  const buf = await c.startRendering(), d = buf.getChannelData(0); let sq = 0, pk = 0, n = 0; for (let i = 0; i < d.length; i++) { sq += d[i] * d[i]; pk = Math.max(pk, Math.abs(d[i])); }
  /* the loudest 50 ms window, so short sounds are not averaged away by silence */
  let best = 0, w = Math.round(sr * 0.05), acc = 0; for (let i = 0; i < d.length; i++) { acc += d[i] * d[i]; if (i >= w) acc -= d[i - w] * d[i - w]; if (i >= w - 1) best = Math.max(best, acc / w); }
  return { rms: Math.sqrt(sq / d.length), peak: pk, win: Math.sqrt(best), sum: Array.from(d.slice(0, 4000)).reduce((a, b) => a + b, 0) };
}`;
const render = (p, name, opts = {}) => p.evaluate(({ fn, name, opts }) => (0, eval)('(' + fn + ')')(name, opts), { fn: RENDER, name, opts });

await T('the "no" buzz is unchanged: the same line in the shared sound file, and the same sound sample for sample as its original recipe', async (p) => {
  const src = fs.readFileSync(path.join(ROOT, 'games-shared/hog-audio.js'), 'utf8');
  const LINE = "  api.define('no', { caption: 'a low buzz: not that', make: function (c, o) { tone(c, o, { f: 140, to: 100, dur: 0.22, type: 'sawtooth', gain: 0.16 }); } });";
  ok(src.split('\n').includes(LINE), 'the "no" buzz line in games-shared/hog-audio.js is exactly as before');
  ok(!fs.readFileSync(path.join(ROOT, 'room-214/js/sound.js'), 'utf8').includes("'no'"), 'Room 214 does not redefine it');
  await begin(p, 1); const now = await p.evaluate(() => window.HOG.audio.names().includes('no')); ok(now, 'it is defined');
  const a = await render(p, 'no', { secs: 0.5 });
  /* functions cannot cross into the page, so the original recipe is rebuilt inside it */
  const orig = await p.evaluate(async () => { const A = window.HOG.audio, c = new OfflineAudioContext(1, 22050, 44100); A.tone(c, c.destination, { f: 140, to: 100, dur: 0.22, type: 'sawtooth', gain: 0.16 }); const d = (await c.startRendering()).getChannelData(0); let sq = 0, pk = 0; for (let i = 0; i < d.length; i++) { sq += d[i] * d[i]; pk = Math.max(pk, Math.abs(d[i])); } return { rms: Math.sqrt(sq / d.length), peak: pk, sum: Array.from(d.slice(0, 4000)).reduce((x, y) => x + y, 0) }; });
  ok(Math.abs(a.peak - orig.peak) < 1e-6 && Math.abs(a.rms - orig.rms) < 1e-6 && Math.abs(a.sum - orig.sum) < 1e-4, 'same sound: ' + JSON.stringify({ a, orig }));
  /* and the same level when it plays through Room 214's limiter (within a tenth of a decibel) */
  const lim = await render(p, 'no', { secs: 0.5, limit: true }); const db = 20 * Math.log10(lim.rms / a.rms); ok(Math.abs(db) < 0.1, 'the limiter leaves the "no" buzz at the same level: ' + db.toFixed(3) + ' dB');
});

await T('laptop speakers: every haunted sound keeps clear energy above 300 Hz after a 250 Hz high-pass (the old Porter footsteps did not)', async (p) => {
  await begin(p, 1); const names = await p.evaluate(() => window.HOG_R214.sound.HAUNTED); const MIN = 0.006; const rows = [];
  const low = []; for (const n of names) { const r = await render(p, n, { hp: true }); rows.push(n + ' ' + r.win.toFixed(4)); if (r.win < MIN) low.push(n + ' ' + r.win.toFixed(4)); }
  console.log('      loudest 50 ms above 300 Hz: ' + rows.join(', ')); eq(low.join(', '), '', 'too little energy above 300 Hz for laptop speakers (needs ' + MIN + ')');
  /* the same measure on the sounds as they were: proof the test can tell */
  const oldStep = await p.evaluate(({ fn }) => (0, eval)('(' + fn + ')')('x', { hp: true, old: true }), { fn: RENDER.replace('if (opts.old) { opts.old(c, out, A); }', "if (opts.old) { A.noise(c, out, { f: 220, dur: 0.1, gain: 0.12, filter: 'lowpass' }); }") });
  const oldCreak = await p.evaluate(({ fn }) => (0, eval)('(' + fn + ')')('x', { hp: true, old: true }), { fn: RENDER.replace('if (opts.old) { opts.old(c, out, A); }', "if (opts.old) { A.tone(c, out, { f: 170, to: 120, dur: 0.5, type: 'sawtooth', gain: 0.07 }); }") });
  console.log('      before this change: footsteps ' + oldStep.win.toFixed(4) + ', door creak ' + oldCreak.win.toFixed(4));
  ok(oldStep.win < MIN, 'the old footsteps would fail this test: ' + oldStep.win);   /* the old creak passed: it was quiet, not too low */
  const now = await render(p, 'porterStep', { hp: true }), cr = await render(p, 'doorCreak', { hp: true }); ok(now.win > oldStep.win * 2.5 && cr.win > oldCreak.win * 2, 'footsteps and the door creak are clearly louder on laptops now: ' + now.win.toFixed(4) + ' and ' + cr.win.toFixed(4));
});

await T('the limiter: every haunted sound playing at once at full volume never clips', async (p) => {
  await begin(p, 1); const shots = await p.evaluate(() => window.HOG_R214.sound.HAUNTED.filter((n) => !window.HOG_R214.sound.BUILD[n]).concat(['alertSeen', 'bellLand', 'checkedOut']));
  /* three times louder than everything at once could ever be: far past full scale without the limiter, held under it with the limiter */
  const r = await render(p, shots, { limit: true, boost: 3 }); const raw = await render(p, shots, { boost: 3 }); console.log('      all at once, three times over: peak ' + raw.peak.toFixed(2) + ' without the limiter, ' + r.peak.toFixed(2) + ' with it');
  ok(raw.peak > 1, 'the test really pushes past full scale: ' + raw.peak); ok(r.peak <= 0.9, 'the limiter holds it under full scale: ' + r.peak);
  ok(fs.readFileSync(path.join(ROOT, 'room-214/js/sound.js'), 'utf8').includes('A.useLimiter('), 'Room 214 turns the limiter on');
});

await T('every new sound shows its caption (with a direction where it has one) with sound OFF: hum, wind, pipes, creak, latch, drip, overhead footsteps, radio hiss, the pulse', async (p) => {
  await begin(p, 1); await calm(p); await mute(p, true); await p.waitForTimeout(500);
  await capWait(p, /the building hums/); await capWait(p, /wind moans in the vents/);
  for (const [k, re] of [['pipes', /pipes knock in the walls/], ['creakFar', /a floorboard creaks somewhere/], ['latch', /a latch clicks down the hall/]]) { await p.evaluate((n) => { __r214Amb.next[n] = 0; }, k); await capWait(p, re); }
  ok(/\[(left|right|up|down|near): (pipes knock|a floorboard|a latch)/.test(await caps(p) + (await p.textContent('#hog-captions'))), 'the now-and-then sounds come with a direction');
  /* the drip is on the second floor only */
  await p.evaluate(() => { __r214Game.pl.f = 1; __r214Amb.next.drip = 0; }); await capWait(p, /water drips/);
  /* footsteps overhead: the floor above has its Porter walking right above you */
  await p.evaluate(() => { const g = __r214Game, up = g.por[2]; g.pl.f = 1; up.freeze = 0; up.x = g.pl.x + 1; up.y = g.pl.y; __r214Amb.overT = 0; }); await capWait(p, /up: footsteps on the floor above/);
  /* radio hiss by the front desk */
  await p.evaluate(() => { const g = __r214Game, d = g.d.items.find((i) => i.id === 'note0'); g.por[2].freeze = 99999; g.pl.f = 0; g.pl.x = d.x + 0.5; g.pl.y = d.y + 1.5; }); await capWait(p, /faint radio hiss/);
  /* the pulse: he is close on this floor */
  await p.evaluate(() => { const g = __r214Game, po = g.por[0]; po.freeze = 0; po.x = g.pl.x + 2; po.y = g.pl.y; po.state = 'patrol'; }); await capWait(p, /a slow pulse: he is close/);
  ok(await p.evaluate(() => window.HOG.audio.isMuted()), 'all of that with sound off');
});

await T('mute silences every layer at once; volume and the Low effects setting apply; the pulse never plays when he is more than 5 tiles away', async (p) => {
  await begin(p, 1); await calm(p); await p.click('body'); await p.waitForTimeout(800);
  const gain = () => p.evaluate(() => { const b = window.HOG.audio.bus(); return b ? b.out.gain.value : null; });
  await mute(p, false); ok((await gain()) > 0, 'sound on: the master is open'); await mute(p, true); eq(await gain(), 0, 'muted: the master (which every layer plays through) is closed'); await mute(p, false);
  /* far away: no pulse over several seconds */
  await p.evaluate(() => { const g = __r214Game, po = g.por[g.pl.f]; po.freeze = 0; po.x = g.pl.x + 9; po.y = g.pl.y; __r214Amb.log.length = 0; }); await p.evaluate(() => { const g = __r214Game, po = g.por[g.pl.f]; po.freeze = 99999; }); await p.waitForTimeout(2500);
  ok(!(await p.evaluate(() => __r214Amb.log.some((x) => /^pulse/.test(x)))), 'no pulse while he is 9 tiles away');
  await p.evaluate(() => { const g = __r214Game, po = g.por[g.pl.f]; po.freeze = 0; po.x = g.pl.x + 5.6; po.y = g.pl.y; }); await p.evaluate(() => { __r214Game.por[__r214Game.pl.f].freeze = 99999; __r214Game.por[__r214Game.pl.f].freeze = 0; }); await p.waitForTimeout(100);
  await p.evaluate(() => { const g = __r214Game, po = g.por[g.pl.f]; po.freeze = 99999; }); await p.waitForTimeout(1500); ok(!(await p.evaluate(() => __r214Amb.log.some((x) => /^pulse/.test(x)))), 'no pulse at 5.6 tiles');
  /* hold him 2 tiles away (he would otherwise walk up and check you out) */
  await p.evaluate(() => { window.__hold = setInterval(() => { const g = __r214Game, po = g.por[g.pl.f]; po.freeze = 0; po.x = g.pl.x + 2; po.y = g.pl.y; po.state = 'patrol'; }, 30); }); await p.waitForFunction(() => __r214Amb.log.filter((x) => x === 'pulse').length >= 2, null, { timeout: 6000 });
  /* Low effects: no pulse, ambience at half */
  const levelFull = await p.evaluate(() => __r214Amb.loops.hum.level); await p.evaluate(() => { window.__r214.shell.settings.low = true; __r214Amb.log.length = 0; }); await p.waitForTimeout(1500); await p.evaluate(() => clearInterval(window.__hold));
  const levelLow = await p.evaluate(() => __r214Amb.loops.hum.level); ok(Math.abs(levelLow - levelFull * 0.5) < 1e-6, 'Low effects: the hum at half (' + levelFull + ' to ' + levelLow + ')'); ok(!(await p.evaluate(() => __r214Amb.log.some((x) => /^pulse/.test(x)))), 'Low effects: no pulse even with him close');
});

await T('walking into a wall makes no sound and no caption', async (p) => {
  await begin(p, 1); await calm(p); await p.evaluate(() => { const A = window.HOG.audio; window.__heard = []; A.onCue((c) => window.__heard.push(c.name)); __r214Amb.next.pipes = __r214Amb.next.creakFar = __r214Amb.next.latch = __r214Amb.next.drip = 1e9; });
  const x0 = await p.evaluate(() => __r214Game.pl.x); await p.evaluate(() => window.__r214Input.hold('left', true)); await p.waitForTimeout(2500); await p.evaluate(() => window.__r214Input.hold('left', false));
  const x1 = await p.evaluate(() => __r214Game.pl.x); ok(x1 < x0, 'walked left'); const heard = await p.evaluate(() => window.__heard.filter((n) => !/porter|overhead/.test(n)));
  eq(heard.join(','), '', 'nothing sounds when you push against the wall');
});

await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
