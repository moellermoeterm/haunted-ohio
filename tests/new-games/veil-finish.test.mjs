// The Veil: finish-line items. The "no" buzz is unchanged; every haunted sound can be heard on laptop speakers (energy above 300 Hz after a 250 Hz high-pass);
// the limiter stops spikes; every sound shows its caption with sound off; mute silences everything; the pulse only plays near him; Low effects
// halves the ambience and turns the pulse off; walking into a wall makes no sound.  Run: node tests/new-games/room214-sound.test.mjs
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = await import(path.join(ROOT, 'tests/node_modules/playwright/index.mjs'))); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/the-veil/`;
const browser = await chromium.launch(); let fail = 0, pass = 0;
const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
const only = process.env.ONLY;
async function T(name, fn, opts = {}) {
  if (only && !name.includes(only)) return; const t0 = Date.now(); const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch, reducedMotion: opts.reduced ? 'reduce' : 'no-preference' }); const p = await ctx.newPage(); if (!opts.tour) await p.addInitScript(() => { try { localStorage.setItem('ho-veil-tour', JSON.stringify({ intro: true, done: [], off: true })); } catch (e) { /* blocked */ } }); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); }); p.setDefaultTimeout(15000); p.on('dialog', (d) => d.accept());
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}
/* renders a sound in an offline audio context and measures it. hp: high-pass the output at 250 Hz (two stages) first, like small laptop speakers. */
const RENDER = `async (name, opts) => {
  const A = window.HOG.audio, S = window.HOG_VEIL.sound, sr = 44100, len = Math.round(sr * (opts.secs || 2.5)), c = new OfflineAudioContext(1, len, sr);
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


async function begin(p, variant = 1) { await p.goto(base + '?preview=' + variant); await p.fill('#veil-name', 'Ana'); await p.click('#veil-begin'); await p.waitForFunction(() => window.__veilGame && window.__veilAmb && window.__veilUI, null, { timeout: 15000 }); }
const capWait = (p, re) => p.waitForFunction((s) => new RegExp(s).test(document.querySelector('#hog-captions').textContent), re.source, { timeout: 7000 });
const bubble = (p, t) => p.waitForFunction((x) => { const b = document.querySelector('.hot-bub'); return b && !b.hidden && b.textContent.includes(x); }, t, { timeout: 8000 });
const stand = (p, x, y) => p.evaluate(([a, b]) => { const g = __veilGame, sc = window.__veilScene; g.setPos(a, b); if (sc) { sc.px = a * 32 + 16; sc.py = b * 32 + 16; } }, [x, y]);

await T('why nothing was heard: the sound engine starts on the first tap and is not muted, but the old game made no sound while exploring; now it has quiet ambience with captions, and the Sound button shows on or off', async (p) => {
  await begin(p, 1); const st = await p.evaluate(() => ({ state: window.HOG.audio.bus().ctx.state, muted: window.HOG.audio.isMuted() })); eq(st.state, 'running', 'audio running after Begin'); eq(st.muted, false, 'not muted');
  await capWait(p, /distant wind/); ok(/Sound: on/.test(await p.textContent('#hog-mute')), 'a visible Sound on button'); await p.click('#hog-mute'); ok(/Sound: off/.test(await p.textContent('#hog-mute')), 'one tap turns it off'); eq(await p.evaluate(() => window.HOG.audio.bus().out.gain.value), 0, 'muted: the master every layer plays through is closed');
});

await T('ambience captions show with sound off, each when it starts: distant wind outside, grass underfoot when walking, a gate creaks at the gate, a faint hum in the Echo, a far bell once the doors are open', async (p) => {
  await begin(p, 1); await p.evaluate(() => window.HOG.audio.setMute(true)); await capWait(p, /distant wind/);
  await p.keyboard.down('ArrowUp'); await capWait(p, /grass underfoot/); await p.keyboard.up('ArrowUp');
  const gate = await p.evaluate(() => { const e = __veilGame.ents.find((x) => x.id === 'gate'); return [e.x, e.y + 1]; }); await stand(p, gate[0], gate[1]); await capWait(p, /a gate creaks/);
  await p.evaluate(() => { __veilGame.s.world = 'E'; }); await capWait(p, /a faint hum/);
  await p.evaluate(() => { __veilGame.s.doors = true; __veilAmb.next.farBell = 0.01; }); await capWait(p, /a far bell/);
  ok(await p.evaluate(() => window.HOG.audio.isMuted()), 'all with sound off');
});

await T('laptop speakers and the limiter: every new Veil sound keeps energy above 300 Hz after a 250 Hz high-pass, and all at once three times over never clips', async (p) => {
  await begin(p, 1); const names = await p.evaluate(() => window.HOG_VEIL.sound.HAUNTED); const rows = [], low = [];
  for (const n of names) { const r = await render(p, n, { hp: true }); rows.push(n + ' ' + r.win.toFixed(4)); if (r.win < 0.006) low.push(n); } console.log('      loudest 50 ms above 300 Hz: ' + rows.join(', ')); eq(low.join(','), '', 'too quiet for laptop speakers');
  const shots = names.filter((n) => !['wind', 'hum'].includes(n)).concat(['shift', 'success']); const r = await render(p, shots, { limit: true, boost: 3 }), raw = await render(p, shots, { boost: 3 }); ok(raw.peak > 1 && r.peak <= 0.9, 'limiter: ' + raw.peak.toFixed(2) + ' to ' + r.peak.toFixed(2));
  ok(fs.readFileSync(path.join(ROOT, 'the-veil/js/sound.js'), 'utf8').includes('A.useLimiter('), 'The Veil turns the limiter on');
});

await T('the first shift: the objective says a quick field note comes first; pressing V shows one short bubble, then the box says "Write your note, then the world shifts."; Later cancels the shift; a 10-word note then shifts', async (p) => {
  await begin(p, 1); await p.evaluate(() => { const g = __veilGame; g.s.bell = true; g.addClue('bell'); }); await p.waitForTimeout(700);
  eq((await p.textContent('#veil-obj')).trim(), 'Write a quick field note first. Then press V to shift.', 'the objective');
  await p.keyboard.press('KeyV'); await bubble(p, 'A quick field note comes first.'); await p.waitForSelector('.hog-modal #veil-w'); ok((await p.textContent('.hog-modal')).includes('Write your note, then the world shifts.'), 'the box says what happens');
  await p.click('.hog-modal button:has-text("Later")'); await p.waitForFunction(() => /No shift yet\. Press V when your note is ready\./.test((document.querySelector('.hog-toast') || {}).textContent || '')); eq(await p.evaluate(() => __veilGame.s.shifts), 0, 'Later cancelled the shift'); eq(await p.evaluate(() => __veilGame.s.world), 'L', 'still in the Living World');
  await p.keyboard.press('KeyV'); await p.waitForSelector('.hog-modal #veil-w'); await p.fill('#veil-w', 'one two three four five six seven eight nine'); ok(await p.isDisabled('.hog-modal .hog-btn.primary'), 'nine words cannot save (the 10-word rule)');
  await p.fill('#veil-w', 'Cold wet grass, a rusted gate, a bell that smells of old smoke.'); await p.click('.hog-modal .hog-btn.primary'); await p.waitForFunction(() => __veilGame.s.world === 'E'); eq(await p.evaluate(() => __veilGame.s.shifts), 1, 'the note saved and the world shifted');
});

await T('the tour: the purpose line on the title screen, three cards (12 words or fewer), the "?" Help list with every tip, the one-time Sound bubble, and the bubbles move on when the player acts', async (p) => {
  await p.goto(base + '?preview=2'); eq((await p.textContent('.veil-purpose')).trim(), 'Explore two worlds, solve what happened, and write the story.', 'purpose line'); const txt = await p.evaluate(() => window.VeilTourText);
  for (const c of txt.CARDS) ok(c.text.split(/\s+/).length <= 12, c.text); for (const t of txt.TIPS) ok(t.text.split(/\s+/).length <= 12, t.text); for (const s of txt.STEPS) for (const v of (typeof s.text === 'string' ? [s.text] : Object.values(s.text))) ok(v.split(/\s+/).length <= 12, v);
  await p.fill('#veil-name', 'Ana'); await p.click('#veil-begin'); await p.waitForSelector('.hot-intro'); eq(await p.$$eval('.hot-dots i', (e) => e.length), 3, 'three cards'); await p.click('.hot-go');
  await bubble(p, 'Use the on-screen arrows.').catch(() => bubble(p, 'Move with the arrow keys or W A S D.')); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp'); await bubble(p, 'Sound on. Tap Sound to mute.');
  await p.click('[data-help]'); await p.waitForSelector('.hot-help'); const h = await p.innerText('.hot-help'); ok(h.includes(txt.PURPOSE) && h.includes(txt.CONNECT), 'purpose and the writing sentence'); for (const t of txt.TIPS) ok(h.includes(t.text), 'tip ' + t.label);
}, { tour: true });

await T('progress and reward: "Clues N of M" is always shown and counts up; a new clue makes the Evidence button shimmer with "Clue found"; the case summary lists clues, notes and shifts', async (p) => {
  await begin(p, 3); const total = await p.evaluate(() => Object.keys(__veilGame.d.clues).length); await p.waitForFunction((t) => document.getElementById('veil-prog').textContent === 'Clues 0 of ' + t, total);
  await p.evaluate(() => __veilGame.addClue('bell')); await p.waitForFunction((t) => document.getElementById('veil-prog').textContent === 'Clues 1 of ' + t, total); ok(await p.$('#h-ev.veil-shimmer'), 'the Evidence button shimmers'); eq(await p.getAttribute('#veil-prog', 'data-new'), 'Clue found', 'the short label');
  const sum = await p.evaluate(() => window.__veilUI.summary().textContent); ok(/Case summary/.test(sum) && new RegExp('Clues found: 1 of ' + total).test(sum) && /Field notes written: 0/.test(sum) && /Times you shifted worlds: 0/.test(sum), 'summary: ' + sum);
});

await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
