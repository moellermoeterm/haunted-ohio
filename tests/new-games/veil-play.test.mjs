// The Veil: browser bots. A walking bot plays chapter 1 start to finish in all six variants (real movement, real collisions, real modals),
// plus keyboard, touch, save/continue, no-sound and responsive checks.  Run: node tests/new-games/veil-play.test.mjs   (about 3 to 5 minutes)
// Optional: ONLY="keyboard" node tests/new-games/veil-play.test.mjs   VARIANTS=1,2 node ...
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = await import(path.join(ROOT, 'tests/node_modules/playwright/index.mjs'))); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/the-veil/`;
const browser = await chromium.launch(); let fail = 0, pass = 0;
const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
const only = process.env.ONLY, variants = (process.env.VARIANTS || '1,2,3,4,5,6').split(',').map(Number);
async function T(name, fn, opts = {}) {
  if (only && !name.includes(only)) return;
  const t0 = Date.now(); const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); });
  p.setDefaultTimeout(15000);
  p.on('dialog', (d) => d.accept());
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + ' [step ' + lastStep + ']\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}
let lastStep = '';
const words = (n, w = 'lantern') => Array.from({ length: n }, (_, i) => w + i).join(' ');
const modal = (p) => p.waitForSelector('.hog-modal', { state: 'visible' });
const noModal = (p) => p.waitForSelector('.hog-modal', { state: 'detached' });
const noH = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

/* the bots open each case through the leader preview (?preview=N): students cannot choose a case */
async function begin(p, variant, name = 'Ana') { await p.goto(base + '?preview=' + variant); await p.fill('#veil-name', name); await p.click('#veil-begin'); await p.waitForFunction(() => window.__veilScene && window.__veilScene.player, null, { timeout: 15000 }); await p.waitForTimeout(150); }
/* the bot walks like a player: it holds a direction until it reaches the centre of each tile on a breadth-first route */
async function walkTo(p, tx, ty) {
  const n = await p.evaluate(({ tx, ty }) => new Promise((res, rej) => {
    const g = window.__veilGame, sc = window.__veilScene, inp = window.__veilInput, TW = 32, w = g.s.world;
    const s = [Math.floor(sc.px / TW), Math.floor(sc.py / TW)], key = (x, y) => x + ',' + y, prev = { [key(...s)]: null }, q = [s]; let found = false;
    while (q.length) { const c = q.shift(); if (c[0] === tx && c[1] === ty) { found = true; break; } for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = c[0] + d[0], y = c[1] + d[1], k = key(x, y); if (!(k in prev) && !g.tileSolid(x, y, w)) { prev[k] = c; q.push([x, y]); } } }
    if (!found) return rej(new Error('no route to ' + tx + ',' + ty + ' in world ' + w));
    const path = []; for (let c = [tx, ty]; c; c = prev[key(...c)]) path.unshift(c); path.shift();
    let i = 0, last = performance.now(); const rel = () => ['up', 'down', 'left', 'right', 'run'].forEach((a) => inp.hold(a, false));
    (function step() {
      if (performance.now() - last > 20000) { rel(); return rej(new Error('stuck walking to ' + tx + ',' + ty + ' at ' + sc.px + ',' + sc.py)); }
      if (i >= path.length) { rel(); return res(path.length); }
      const cx = path[i][0] * TW + 16, cy = path[i][1] * TW + 16, dx = cx - sc.px, dy = cy - sc.py;
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) { i++; last = performance.now(); return requestAnimationFrame(step); }
      rel(); inp.hold('run', true); inp.hold(Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), true); requestAnimationFrame(step);
    })();
  }), { tx, ty });
  await p.waitForTimeout(40); return n;
}
const interact = async (p) => { await p.evaluate(() => window.__veilInput.tap('interact')); };
const closeTop = async (p) => { await p.click('.hog-modal .hog-btn:last-child'); await noModal(p); };
const world = (p) => p.evaluate(() => window.__veilGame.s.world);
async function shift(p, expect) { await p.evaluate(() => window.__veilInput.tap('shift')); await p.waitForFunction((e) => window.__veilGame.s.world === e, expect); await p.waitForTimeout(120); }

async function playChapter(p, variant) {
  await begin(p, variant); const d = await p.evaluate(() => ({ bell: __veilGame.d.bell, pews: __veilGame.d.pews, truth: __veilGame.d.truth, symbols: HOG_VEIL.data.SYMBOLS }));
  ok((await p.textContent('#hog-preview')).includes('case ' + variant + ' of 6'), 'the preview banner shows the case'); eq(await p.$('#hog-case'), null, 'no case badge in the top bar');
  lastStep = '1'; /* 1. the bell */
  await walkTo(p, 10, 19); await interact(p); await modal(p); ok(/Keeper.s Bell/.test(await p.textContent('.hog-modal h2')), 'bell clue'); await p.click('.hog-modal .hog-btn:last-child'); await p.waitForFunction(() => /Field note 1/.test((document.querySelector('.hog-modal h2') || {}).textContent || ''));
  await modal(p); ok(/Field note 1/.test(await p.textContent('.hog-modal h2')), 'note 1 asked'); ok(await p.isDisabled('.hog-modal .hog-btn.primary'), 'save is disabled until the note is long enough');
  await p.fill('#veil-w', words(12)); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  lastStep = '2'; /* 2. notice and gate in the Living World */
  await walkTo(p, 14, 18); await interact(p); await modal(p); ok(/notice/i.test(await p.textContent('.hog-modal h2')), 'notice'); await closeTop(p);
  await walkTo(p, 16, 17); eq(await p.evaluate(() => __veilGame.tileSolid(16, 16, 'L')), true, 'gate is chained in the Living World');
  lastStep = '3'; /* 3. shift: gate opens, the bell tolls with captions */
  await shift(p, 'E'); eq(await p.evaluate(() => __veilGame.tileSolid(16, 16)), false, 'gate is open in the Echo');
  await p.waitForFunction(() => /bell/.test(document.querySelector('#hog-captions').textContent), null, { timeout: 8000 });
  lastStep = '4'; /* 4. bell plates: strike the seeded pattern */
  await walkTo(p, 15, 14); await interact(p); await modal(p); eq(await p.textContent('.hog-modal h2'), 'The bell plates', 'plates');
  const wrong = d.bell.map((n, i) => (i === 0 ? (n === 'LOW' ? 'HIGH' : 'LOW') : n)); for (const n of wrong) await p.click(`.hog-modal [aria-label="Strike the ${n} plate"]`);
  await p.waitForFunction(() => /doors stay shut/.test(((document.querySelector('.hog-toast') || {}).textContent || ''))); eq(await p.evaluate(() => __veilGame.s.doors), false, 'wrong pattern keeps the doors shut');
  for (const n of d.bell) await p.click(`.hog-modal [aria-label="Strike the ${n} plate"]`); await noModal(p); eq(await p.evaluate(() => __veilGame.s.doors), true, 'doors open');
  lastStep = '5'; /* 5. the nave in the Echo: read the pew marks, watch the figure */
  for (const [y, id] of [[10, 'pewBack'], [8, 'pewMiddle'], [6, 'pewFront']]) { await walkTo(p, 15, y); await interact(p); await modal(p); const t = await p.textContent('.hog-modal'); ok(t.includes(id === 'pewFront' ? 'FRONT' : id === 'pewMiddle' ? 'MIDDLE' : 'BACK'), id); await closeTop(p); }
  await walkTo(p, 17, 6); await interact(p); await modal(p); ok(/watching, not someone you are talking to|not someone you are talking to/.test(await p.textContent('.hog-modal')), 'figure is observed, never contacted'); await closeTop(p);
  lastStep = '6'; /* 6. back to the Living World: the cabinet lock needs the order seen in the Echo */
  await shift(p, 'L'); await walkTo(p, 10, 4); await interact(p); await modal(p); eq(await p.textContent('.hog-modal h2'), 'The cabinet lock', 'cabinet');
  for (let i = 0; i < 3; i++) { const want = d.symbols.indexOf(d.pews[i]); for (let k = 0; k < want; k++) await p.click(`.hog-modal [aria-label^="Dial ${i + 1}:"]`); }
  await p.click('.hog-modal .hog-btn.primary'); await noModal(p); eq(await p.evaluate(() => __veilGame.s.cabinet), true, 'cabinet opens with the seeded order');
  /* the sacristy door is locked in the Living World, open in the Echo */
  eq(await p.evaluate(() => __veilGame.tileSolid(25, 7, 'L')), true, 'sacristy door locked (Living)'); await walkTo(p, 22, 11); await interact(p); await modal(p); await closeTop(p);
  lastStep = '7'; /* 7. the sacristy: the Echo scene (observe only) and field note 2 */
  await shift(p, 'E'); await walkTo(p, 28, 6); await interact(p); await modal(p); eq(await p.textContent('.hog-modal h2'), 'The Echo of the night', 'scene');
  for (let i = 0; i < 6; i++) { const label = await p.textContent('.hog-modal .hog-btn.primary'); await p.click('.hog-modal .hog-btn.primary'); if (!(await p.$('.hog-modal h2:text("The Echo of the night")'))) break; if (label === 'Done watching') { /* next click closes */ } }
  await modal(p); ok(/Field note 2/.test(await p.textContent('.hog-modal h2')), 'note 2 asked'); await p.fill('#veil-w', words(45)); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  lastStep = '8'; /* 8. case file: wrong answers are explained, the seeded truth with two supporting clues closes it */
  await p.click('#h-case'); await modal(p); const wrongOpt = await p.evaluate(() => __veilGame.d.options.find((o) => o.id !== __veilGame.d.truth).id);
  await p.check(`.hog-modal input[name="veil-pick"][value="${wrongOpt}"]`); await p.check('.hog-modal input[type=checkbox][value="ledger"]'); await p.check('.hog-modal input[type=checkbox][value="letter"]'); await p.fill('#veil-why', words(30, 'because')); await p.click('.hog-modal .hog-btn.primary');
  await p.waitForFunction(() => /Not quite/.test(((document.querySelector('.hog-toast') || {}).textContent || ''))); eq(await p.evaluate(() => __veilGame.s.caseDone), false, 'wrong answer is not accepted');
  await p.check(`.hog-modal input[name="veil-pick"][value="${d.truth}"]`); await p.uncheck('.hog-modal input[type=checkbox][value="letter"]'); await p.check('.hog-modal input[type=checkbox][value="notice"]'); await p.click('.hog-modal .hog-btn.primary');
  await p.waitForFunction(() => /does not show what the bell was for/.test(((document.querySelector('.hog-toast') || {}).textContent || ''))); eq(await p.evaluate(() => __veilGame.s.caseDone), false, 'a non-supporting clue is not accepted');
  await p.uncheck('.hog-modal input[type=checkbox][value="notice"]'); await p.check('.hog-modal input[type=checkbox][value="letter"]'); await p.click('.hog-modal .hog-btn.primary'); await p.waitForFunction(() => window.__veilGame.s.caseDone);
  await modal(p); ok(/Chapter 1 solved/.test(await p.textContent('.hog-modal h2')), 'chapter solved'); await p.click('.hog-modal .hog-btn.primary'); await modal(p);
  lastStep = '9'; /* 9. story workshop: nine beats, then the finished story */
  eq(await p.textContent('.hog-modal h2'), 'Story Workshop', 'workshop'); await p.fill('#veil-story-title', 'The Bell on the Hill');
  for (let i = 0; i < 9; i++) { await p.click('.hog-modal .hog-slot >> nth=' + i + ' >> text=/Write|Edit/'); await modal(p); await p.fill('#veil-w', words(20, 'story' + i + '_')); await p.click('.hog-modal .hog-btn.primary'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Story Workshop', 'back to the workshop'); }
  await p.click('.hog-modal .hog-btn.primary'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Your story', 'story'); const story = await p.inputValue('.hog-modal textarea'); ok(story.includes('The Bell on the Hill') && !/case \d/i.test(story), 'the story has its title and never the case number');
  const dl = p.waitForEvent('download'); await p.click('.hog-modal >> text=Download .txt'); await dl; await closeTop(p);
  const st = await p.evaluate(() => ({ done: __veilGame.s.done, caseDone: __veilGame.s.caseDone, beats: __veilGame.s.beats.length, found: __veilGame.s.found.length }));
  ok(st.done && st.caseDone && st.beats === 9 && st.found >= 12, 'chapter complete: ' + JSON.stringify(st));
  /* the save survives a reload and the journal shows the variant */
  await p.reload(); await p.waitForSelector('#veil-continue'); await p.click('#veil-continue'); await p.waitForFunction(() => window.__veilGame); eq(await p.evaluate(() => __veilGame.s.done), true, 'save restored after reload');
  ok(!/Case \d|case \d/.test(await p.evaluate(() => __veilGame.reportText() + __veilGame.storyText())), 'the report and story never show the case number');
}
for (const v of variants) await T('bot: variant ' + v + ' is playable from the first step to the finished story', (p) => playChapter(p, v));

await T('keyboard: arrow keys move, E uses, V shifts, J opens evidence, Esc opens the menu, focus is visible', async (p) => {
  await begin(p, 1); const x0 = await p.evaluate(() => __veilScene.px); await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(500); await p.keyboard.up('ArrowLeft'); ok((await p.evaluate(() => __veilScene.px)) < x0 - 40, 'moved left with the arrow key');
  await p.keyboard.down('KeyD'); await p.waitForTimeout(300); await p.keyboard.up('KeyD'); await p.keyboard.press('KeyV'); await p.waitForTimeout(100); eq(await world(p), 'L', 'V does nothing before the bell');
  await p.keyboard.press('KeyJ'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Evidence Archive', 'J'); await p.keyboard.press('Escape'); await noModal(p);
  await p.keyboard.press('Escape'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Menu', 'Esc'); await p.keyboard.press('Escape'); await noModal(p);
  await p.keyboard.press('Tab'); ok(await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return document.activeElement !== document.body && (s.outlineStyle !== 'none' || s.boxShadow !== 'none'); }), 'focus is visible');
});
await T('touch: at 390px the stick, buttons and menus work on a touch device, no horizontal scroll, targets >= 44px', async (p) => {
  await begin(p, 2); ok(await p.isVisible('.hog-touch'), 'touch controls shown'); ok(await noH(p), 'no horizontal scroll');
  for (const b of await p.$$('.hog-touch button')) { if (!(await b.isVisible())) continue; const r = await b.boundingBox(); ok(r.width >= 44 && r.height >= 44, 'target size'); }
  const x0 = await p.evaluate(() => __veilScene.px);
  await p.evaluate(() => { const s = document.querySelector('.hog-stick'), r = s.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const ev = (t, dx) => s.dispatchEvent(new PointerEvent(t, { pointerId: 9, clientX: x + dx, clientY: y, bubbles: true, cancelable: true })); ev('pointerdown', 40); window.__stickUp = () => ev('pointerup', 40); });
  await p.waitForTimeout(500); await p.evaluate(() => window.__stickUp()); ok((await p.evaluate(() => __veilScene.px)) > x0 + 30, 'the on-screen stick moves the player');
  await p.tap('.hog-a-journal'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Evidence Archive', 'journal button'); await p.keyboard.press('Escape'); await noModal(p);
  await p.tap('#h-menu'); await modal(p); ok(await noH(p), 'menu fits'); const mb = await p.$eval('.hog-modal', (e) => e.getBoundingClientRect().width); ok(mb <= 390, 'modal fits the screen'); await p.keyboard.press('Escape');
}, { touch: true, viewport: { width: 390, height: 780 } });
await T('touch: a touch player can pick up the bell, shift worlds and write a note using only on-screen controls', async (p) => {
  await begin(p, 3); await walkTo(p, 10, 19); await p.tap('.hog-a-interact'); await modal(p); await p.click('.hog-modal .hog-btn:last-child'); await p.waitForFunction(() => /Field note 1/.test((document.querySelector('.hog-modal h2') || {}).textContent || '')); await p.fill('#veil-w', words(12)); await p.tap('.hog-modal .hog-btn.primary'); await noModal(p);
  await p.tap('.hog-a-shift'); await p.waitForFunction(() => __veilGame.s.world === 'E'); ok(await noH(p), 'no horizontal scroll in the Echo'); await p.tap('.hog-a-shift'); await p.waitForFunction(() => __veilGame.s.world === 'L');
}, { touch: true, viewport: { width: 768, height: 1024 } });
await T('no sound needed: with sound off every cue still appears as a caption with a direction, and the puzzle pattern is written down', async (p) => {
  await begin(p, 4); await p.click('#hog-mute'); eq(await p.evaluate(() => HOG.audio.isMuted()), true, 'muted'); await walkTo(p, 10, 19); await interact(p); await modal(p); await p.click('.hog-modal .hog-btn:last-child'); await p.waitForFunction(() => /Field note 1/.test((document.querySelector('.hog-modal h2') || {}).textContent || '')); await p.fill('#veil-w', words(12)); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  await shift(p, 'E'); await p.waitForFunction(() => /bell/.test(document.querySelector('#hog-captions').textContent), null, { timeout: 8000 }); eq(await p.getAttribute('.hog-pulse', 'data-dir'), 'up', 'direction indicator');
  const seq = await p.evaluate(() => __veilGame.d.bell.join(', ')); ok((await p.evaluate(() => __veilGame.clue('bellSeq').body)).includes(seq), 'the pattern is also in the archive text');
});
await T('low-intensity mode: no fade overlay, calm pulses; settings survive a reload', async (p) => {
  await begin(p, 5); await p.click('#hog-setbtn'); await p.check('#hog-low'); await p.keyboard.press('Escape'); await p.reload(); await p.fill('#veil-name', 'Ana'); await p.click('#veil-begin'); await p.waitForFunction(() => window.__veilScene);
  ok(await p.evaluate(() => document.body.classList.contains('hog-low')), 'low-intensity kept');
});
const assignThenBegin = async (p, variant, name = 'Ana') => { await p.goto(base); await p.evaluate((v) => localStorage.setItem('ho-veil-assign', String(v)), variant); await p.goto(base); await p.fill('#veil-name', name); await p.click('#veil-begin'); await p.waitForFunction(() => window.__veilScene && window.__veilScene.player, null, { timeout: 15000 }); await p.waitForTimeout(150); };
await T('saves: continue after reload, a leader preview is its own throwaway save, export/import round trip keeps the case, tampered import refused', async (p) => {
  await assignThenBegin(p, 1, 'Ana'); await walkTo(p, 10, 19); await interact(p); await modal(p); await p.click('.hog-modal .hog-btn:last-child'); await p.waitForFunction(() => /Field note 1/.test((document.querySelector('.hog-modal h2') || {}).textContent || '')); await p.keyboard.press('Escape'); await noModal(p);
  await p.goto(base); await p.waitForSelector('#veil-continue'); ok(/Ana/.test(await p.textContent('#veil-resume')), 'continue offered'); ok(!/case \d/i.test(await p.textContent('#veil-title')), 'no case number on the title screen'); await p.goto(base + '?preview=1'); eq(await p.$('#veil-continue'), null, 'the preview of the same case does not see the student save');
  await p.goto(base); await p.click('#veil-continue'); await p.waitForFunction(() => window.__veilGame); eq(await p.evaluate(() => __veilGame.s.bell), true, 'bell kept');
  await p.click('#hog-savesbtn'); const dl = p.waitForEvent('download'); await p.click('.hog-slot >> text=Export'); const d = await dl; const text = fs.readFileSync(await d.path(), 'utf8'); ok(JSON.parse(text).data.variant === 1, 'the save file carries its case'); eq(d.suggestedFilename(), 'the-veil-save-ana.json', 'file name has no case number'); await p.keyboard.press('Escape');
  const bad = JSON.parse(text); bad.data.state.found = Array(99).fill('x'); await p.click('#hog-savesbtn'); await p.setInputFiles('#hog-import', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bad)) }); await p.waitForFunction(() => /refused/.test(((document.querySelector('.hog-toast') || {}).textContent || '')));
  eq(await p.evaluate(() => __veilGame.saves.load(1).state.found.length < 99), true, 'the bad file changed nothing');
  /* a clean browser that imports the file gets the same case */
  await p.evaluate(() => { localStorage.clear(); }); await p.goto(base); eq(await p.evaluate(() => HOG.variant.assigned('veil')), 0, 'clean'); await p.click('#hog-savesbtn'); await p.setInputFiles('#hog-import', { name: 's.json', mimeType: 'application/json', buffer: Buffer.from(text) }); await p.waitForFunction(() => window.HOG && HOG.variant.assigned('veil') === 1 && !!document.querySelector('#veil-continue'), null, { timeout: 8000 }); ok(true, 'import restores the save and its case');
});
await T('damaged save: a broken stored save is ignored (no crash), and storage that throws falls back to memory', async (p) => {
  await p.goto(base); await p.evaluate(() => { localStorage.setItem('ho-veil-assign', '1'); localStorage.setItem('ho-veil', '{"broken":'); }); await p.reload(); ok(await p.isVisible('#veil-form'), 'title still shows'); eq(await p.$('#veil-continue'), null, 'no continue for a damaged save');
  await p.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); }); await begin(p, 1); ok(await p.isVisible('#veil-play'), 'plays with storage blocked');
});
await T('name matters: the same case with two names has different puzzle answers, the same name always the same', async (p) => {
  await p.goto(base + '?preview=2'); const a = await p.evaluate(() => { const D = HOG_VEIL.data; return ['Ana', 'Ana', 'Ben', 'Mia', 'Zed'].map((n) => JSON.stringify([D.build(2, n).bell, D.build(2, n).pews])); });
  eq(a[0], a[1], 'same name, same game'); ok(new Set(a).size >= 3, 'different names differ: ' + new Set(a).size);
});
await T('responsive: title and game fit at 390, 768, 1280 and 1920 with no horizontal scroll or overflow', async (p) => {
  for (const w of [390, 768, 1280, 1920]) { await p.setViewportSize({ width: w, height: 900 }); await p.goto(base); ok(await noH(p), 'title at ' + w); await p.fill('#veil-name', 'Ana'); await p.click('#veil-begin'); await p.waitForFunction(() => window.__veilScene); await p.waitForTimeout(150); ok(await noH(p), 'game at ' + w);
    const cv = await p.$eval('canvas', (c) => c.getBoundingClientRect().width); ok(cv <= w + 1 && cv > 300, 'canvas fits at ' + w + ': ' + cv); }
});
await T('performance: runs near 60 fps and uses a small number of game objects (4x CPU throttle still above 30 fps)', async (p) => {
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await begin(p, 1);
  const r = await p.evaluate(() => new Promise((res) => { let n = 0, t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 2500) res({ fps: n / ((performance.now() - t0) / 1000), objs: window.__veilScene.children.list.length }); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('      fps (4x throttle):', r.fps.toFixed(1), 'objects:', r.objs); ok(r.fps >= 30, 'fps ' + r.fps); ok(r.objs <= 400, 'objects ' + r.objs);
});
await T('privacy: no storage of names outside the save; a leader preview writes only its own throwaway save and the settings (never the student save or the assigned case)', async (p) => {
  await begin(p, 6, 'Zoe'); await walkTo(p, 10, 19); await interact(p); await modal(p); await p.click('.hog-modal .hog-btn:last-child'); await p.waitForFunction(() => /Field note 1/.test((document.querySelector('.hog-modal h2') || {}).textContent || '')); await p.keyboard.press('Escape');
  const keys = await p.evaluate(() => Object.keys(localStorage).sort()); ok(keys.every((k) => /^(ho-veil-pv(_c\d)?|ho-veil_set)$/.test(k)), 'keys: ' + keys);
  ok(!(await p.evaluate(() => document.cookie)), 'no cookies');
});
await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
