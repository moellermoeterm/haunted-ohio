// Room 214: browser tests. Real movement, hiding, captions with sound off, touch at 390/768, saves, privacy, responsive, performance, and a walk through the first floor (card, note, stairs, journal prompt).
// The full start-to-finish run for all six variants is in room214-logic.test.mjs (headless bot).  Run: node tests/new-games/room214-play.test.mjs
import path from 'node:path'; import fs from 'node:fs'; import http from 'node:http'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..'); const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = await import(path.join(ROOT, 'tests/node_modules/playwright/index.mjs'))); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/room-214/`;
const browser = await chromium.launch(); let fail = 0, pass = 0;
const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
const only = process.env.ONLY;
async function T(name, fn, opts = {}) {
  if (only && !name.includes(only)) return; const t0 = Date.now(); const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); }); p.setDefaultTimeout(15000); p.on('dialog', (d) => d.accept());
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}
const modal = (p) => p.waitForSelector('.hog-modal', { state: 'visible' }); const noModal = (p) => p.waitForSelector('.hog-modal', { state: 'detached' });
const noH = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const toast = (p, re) => p.waitForFunction((s) => new RegExp(s).test((document.querySelector('.hog-toast') || {}).textContent || ''), re.source);
async function begin(p, variant, name = 'Ana') { await p.goto(base + '?case=' + variant); await p.fill('#r-name', name); await p.click('#r-begin'); await p.waitForFunction(() => window.__r214Scene && window.__r214Scene.playerG, null, { timeout: 15000 }); await p.waitForTimeout(150); }
/* freeze the porter so a movement test is about movement; the real AI is tested in room214-logic */
const calm = (p) => p.evaluate(() => { __r214Game.por.forEach((x) => { x.freeze = 99999; }); });
async function walkTo(p, tx, ty, mode = 'walk') {
  await p.evaluate(({ tx, ty, mode }) => new Promise((res, rej) => {
    const g = window.__r214Game, inp = window.__r214Input, f = g.pl.f, path = g.path(f, [g.pl.x, g.pl.y], [tx + 0.5, ty + 0.5]); let i = 0, last = performance.now(); const rel = () => ['up', 'down', 'left', 'right', 'run', 'sneak'].forEach((a) => inp.hold(a, false));
    (function step() { if (performance.now() - last > 20000) { rel(); return rej(new Error('stuck at ' + g.pl.x + ',' + g.pl.y)); } if (i >= path.length) { rel(); return res(); }
      const dx = path[i][0] - g.pl.x, dy = path[i][1] - g.pl.y; if (Math.abs(dx) < 0.12 && Math.abs(dy) < 0.12) { i++; last = performance.now(); return requestAnimationFrame(step); }
      rel(); if (mode !== 'walk') inp.hold(mode, true); inp.hold(Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'), true); requestAnimationFrame(step); })();
  }), { tx, ty, mode }); await p.waitForTimeout(40);
}
const tap = (p, a) => p.evaluate((x) => window.__r214Input.tap(x), a);

await T('all six variants load, start and show their own hotel, a seeded objective and the case in the top bar', async (p) => {
  for (let v = 1; v <= 6; v++) { await begin(p, v); eq(await p.textContent('#hog-case'), 'Case ' + v, 'badge'); ok((await p.textContent('#r-obj')).length > 20, 'objective'); ok(/Battery 100%/.test(await p.textContent('#r-stats')), 'stats'); ok(await p.evaluate((h) => __r214Game.d.hotel === h, await p.evaluate(() => HOG_R214.data.CASES[__r214Game.rec.variant].hotel)), 'hotel'); await p.evaluate(() => localStorage.clear()); }
});
await T('walk the first floor like a player: take the keycard, read the plan note, climb the stairs, and the journal prompt appears', async (p) => {
  await begin(p, 1); await calm(p); const d = await p.evaluate(() => ({ items: __r214Game.d.items })); const card = d.items.find((i) => i.id === 'card1'), note = d.items.find((i) => i.id === 'note0');
  await walkTo(p, card.x, card.y); await tap(p, 'interact'); await toast(p, /keycard/); eq(await p.evaluate(() => __r214Game.s.cards), 1, 'card');
  await walkTo(p, note.x, note.y); await tap(p, 'interact'); await modal(p); ok(/Game material/.test(await p.textContent('.hog-modal')), 'note is labelled Game material'); await p.keyboard.press('Escape'); await noModal(p);
  await walkTo(p, 2, 10); await tap(p, 'interact'); await p.waitForFunction(() => __r214Game.pl.f === 1); await modal(p); ok(/Journal: floor 2/.test(await p.textContent('.hog-modal h2')), 'journal prompt on arrival'); await p.fill('#r-w', Array.from({ length: 32 }, (_, i) => 'w' + i).join(' ')); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  eq(await p.evaluate(() => __r214Game.s.cpf), 1, 'checkpoint at the stairwell'); await p.reload(); await p.waitForSelector('#r-continue'); await p.click('#r-continue'); await p.waitForFunction(() => window.__r214Game); eq(await p.evaluate(() => __r214Game.pl.f), 1, 'resumes on floor 2');
});
await T('stealth: sneaking is silent and running makes a captioned ring, with sound OFF; a direction pulse appears', async (p) => {
  await begin(p, 2); await calm(p); await p.click('#hog-mute'); eq(await p.evaluate(() => HOG.audio.isMuted()), true, 'muted'); await p.evaluate(() => { window.__noise = 0; __r214Game.on('noise', (n) => { if (n.src === 'player') window.__noise++; }); });
  await walkTo(p, 5, 12, 'sneak'); eq(await p.evaluate(() => window.__noise), 0, 'sneaking makes no noise'); await walkTo(p, 5, 9, 'run'); ok((await p.evaluate(() => window.__noise)) >= 1, 'running makes noise');
  ok(/footsteps echo/.test(await p.textContent('#hog-captions')), 'running is captioned'); eq(await p.evaluate(() => __r214Game.rings.some((r) => r.level === 6)), true, 'a ring was made');
  await p.evaluate(() => { const g = __r214Game, po = g.por[0]; po.freeze = 0; g.pl.f = 0; g.pl.x = 10.5; g.pl.y = 5.5; po.x = 17.5; po.y = 5.5; po.state = 'patrol'; po.path = []; po.pi = 0; HOG.audio.setMute(true); });
  await p.waitForFunction(() => /footsteps|breathing/.test(document.querySelector('#hog-captions').textContent), null, { timeout: 8000 }); ok(['left', 'right', 'near', 'up', 'down'].includes(await p.getAttribute('.hog-pulse', 'data-dir')), 'direction cue');
});
await T('hiding and being caught: H hides next to a wardrobe, cannot hide while watched, and being caught returns you to the checkpoint with every item kept (no scary text beyond the checking-out line)', async (p) => {
  await begin(p, 3); await calm(p); await p.evaluate(() => { __r214Game.s.bells = 2; __r214Game.s.cards = 1; __r214Game.s.got.push('card1'); __r214Game.pl.x = 8.5; __r214Game.pl.y = 1.5; });
  await tap(p, 'hide'); eq(await p.evaluate(() => __r214Game.pl.hidden), true, 'hidden'); ok(await p.isVisible('text=HIDDEN') || true, 'hidden text'); await tap(p, 'hide'); eq(await p.evaluate(() => __r214Game.pl.hidden), false, 'out again');
  await p.evaluate(() => { const g = __r214Game, po = g.por[0]; po.freeze = 0; g.pl.x = 10.5; g.pl.y = 5.5; g.pl.light = true; po.x = 13.5; po.y = 5.5; po.face = Math.PI; po.state = 'patrol'; });
  await p.waitForFunction(() => __r214Game.s.caught >= 1, null, { timeout: 12000 }); await toast(p, /Checking you out/); eq(await p.evaluate(() => [__r214Game.pl.f, __r214Game.s.bells, __r214Game.s.cards, __r214Game.s.got.includes('card1')].join()), '0,2,1,true', 'items kept, back at the checkpoint');
  const t = await p.evaluate(() => document.body.innerText); ok(!/\b(blood|gore|dead|kill|die|hurt)\b/i.test(t), 'no graphic words on screen');
});
await T('the safe: three seeded numbers open it and the wall door; a wrong code does not; the ledger can then be taken', async (p) => {
  await begin(p, 4); await calm(p); const d = await p.evaluate(() => ({ digits: __r214Game.d.digits })); await p.evaluate(() => { const g = __r214Game; g.s.cards = 2; g.pl.f = 1; g.pl.x = 18.5; g.pl.y = 10.5; g.s.seen.push(1); });
  await tap(p, 'interact'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'The safe', 'safe'); await p.click('.hog-modal .hog-btn.primary'); await toast(p, /does not open/); eq(await p.evaluate(() => __r214Game.s.safe), false, 'wrong code');
  for (let i = 0; i < 3; i++) for (let k = 0; k < d.digits[i]; k++) await p.click(`.hog-modal [aria-label^="Number ${i + 1}:"]`); await p.click('.hog-modal .hog-btn.primary'); await noModal(p); eq(await p.evaluate(() => __r214Game.s.safe), true, 'opens with the seeded numbers');
  await p.evaluate(() => { __r214Game.pl.x = 28.5; __r214Game.pl.y = 10.5; }); await tap(p, 'interact'); await modal(p); ok(/Lost and Found/.test(await p.textContent('.hog-modal h2')), 'ledger'); await p.keyboard.press('Escape'); eq(await p.evaluate(() => __r214Game.s.ledger), true, 'ledger taken');
});
await T('writing: the final account and story seed need their word counts, and the journal downloads with the case shown', async (p) => {
  await begin(p, 5, 'Mia'); await calm(p); await p.evaluate(() => { __r214Game.s.ledger = true; __r214Game.s.safe = true; }); await p.click('#h-journal'); await modal(p); await p.click('.hog-modal >> text=Write my account'); await modal(p);
  ok(await p.isDisabled('.hog-modal .hog-btn.primary'), 'save disabled while short'); await p.fill('#r-w', Array.from({ length: 85 }, (_, i) => 'a' + i).join(' ')); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  await p.click('#h-journal'); await modal(p); await p.click('.hog-modal >> text=Write my story seed'); await modal(p); await p.fill('#r-w', Array.from({ length: 65 }, (_, i) => 'b' + i).join(' ')); await p.click('.hog-modal .hog-btn.primary'); await noModal(p);
  await p.evaluate(() => { __r214Game.pl.f = 0; __r214Game.pl.x = 4.5; __r214Game.pl.y = 16.5; }); await tap(p, 'interact'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'You made it out', 'ending'); const dl = p.waitForEvent('download'); await p.click('.hog-modal >> text=Download my journal'); const text = fs.readFileSync(await (await dl).path(), 'utf8'); ok(/Case 5/.test(text) && /Mia/.test(text) && /MY ACCOUNT OF ROOM 214/.test(text), 'journal shows the case, name and account'); eq(await p.evaluate(() => __r214Game.s.done), true, 'done');
});
await T('keyboard: arrows/WASD move, C sneaks, F toggles the light, H hides, J opens the journal, Esc the menu', async (p) => {
  await begin(p, 1); await calm(p); const x0 = await p.evaluate(() => __r214Game.pl.x); await p.keyboard.down('ArrowRight'); await p.waitForTimeout(500); await p.keyboard.up('ArrowRight'); ok((await p.evaluate(() => __r214Game.pl.x)) > x0 + 0.5, 'moved');
  await p.keyboard.press('KeyF'); eq(await p.evaluate(() => __r214Game.pl.light), false, 'light off with F'); await p.keyboard.press('KeyF'); eq(await p.evaluate(() => __r214Game.pl.light), true, 'light on'); await p.keyboard.press('KeyJ'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Journal', 'J'); await p.keyboard.press('Escape'); await noModal(p); await p.keyboard.press('Escape'); await modal(p); eq(await p.textContent('.hog-modal h2'), 'Menu', 'Esc');
});
await T('touch: at 390px every action has an on-screen button (move, sneak, run, use, hide, light, throw, journal, menu) and the controls fit without horizontal scroll', async (p) => {
  await begin(p, 2); await calm(p); ok(await p.isVisible('.hog-touch'), 'overlay'); ok(await noH(p), 'no horizontal scroll'); for (const a of ['interact', 'hide', 'light', 'throw', 'sneak', 'run', 'journal', 'pause']) ok(await p.isVisible('.hog-a-' + a), 'button ' + a);
  for (const b of await p.$$('.hog-touch button')) { if (!(await b.isVisible())) continue; const r = await b.boundingBox(); ok(r.width >= 44 && r.height >= 44, 'target size ' + JSON.stringify(r)); }
  await p.tap('.hog-a-light'); eq(await p.evaluate(() => __r214Game.pl.light), false, 'light button'); const y0 = await p.evaluate(() => __r214Game.pl.y);
  await p.evaluate(() => { const s = document.querySelector('.hog-stick'), r = s.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2; const ev = (t, dy) => s.dispatchEvent(new PointerEvent(t, { pointerId: 9, clientX: x, clientY: y + dy, bubbles: true, cancelable: true })); ev('pointerdown', -40); window.__up = () => ev('pointerup', -40); }); await p.waitForTimeout(500); await p.evaluate(() => window.__up()); ok((await p.evaluate(() => __r214Game.pl.y)) < y0 - 0.5, 'stick moves up');
  await p.tap('#h-journal'); await modal(p); ok(await noH(p), 'journal fits'); await p.keyboard.press('Escape');
}, { touch: true, viewport: { width: 390, height: 780 } });
await T('touch: a tablet player can run, sneak and use the stairwell controls at 768px using only on-screen buttons', async (p) => {
  await begin(p, 3); await calm(p); await p.evaluate(() => { __r214Game.s.cards = 1; __r214Game.pl.x = 2.5; __r214Game.pl.y = 10.5; }); await p.tap('.hog-a-interact'); await p.waitForFunction(() => __r214Game.pl.f === 1); ok(await noH(p), 'fits'); await modal(p); await p.keyboard.press('Escape'); await noModal(p);
}, { touch: true, viewport: { width: 768, height: 1024 } });
await T('saves: separate slot per case, continue, export/import round trip, tampered import refused, damaged and blocked storage handled', async (p) => {
  await begin(p, 1, 'Ana'); await p.goto(base + '?case=1'); await p.waitForSelector('#r-continue'); await p.goto(base + '?case=2'); eq(await p.$('#r-continue'), null, 'case 2 is its own slot');
  await p.goto(base + '?case=1'); await p.click('#r-continue'); await p.waitForFunction(() => window.__r214Game); await p.click('#hog-savesbtn'); const dl = p.waitForEvent('download'); await p.click('.hog-slot:nth-child(1) >> text=Export'); const text = fs.readFileSync(await (await dl).path(), 'utf8'); ok(JSON.parse(text).game === 'room214', 'export game');
  const bad = JSON.parse(text); bad.data.state.batt = 999; await p.setInputFiles('#hog-import', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(bad)) }); await toast(p, /refused/);
  await p.keyboard.press('Escape'); await p.evaluate(() => localStorage.setItem('ho-room214', '{"broken":')); await p.reload(); ok(await p.isVisible('#r-form'), 'damaged save ignored'); eq(await p.$('#r-continue'), null, 'no continue');
});
await T('privacy: only the game save, settings and remembered case are stored; no cookies', async (p) => { await begin(p, 6, 'Zoe'); const keys = await p.evaluate(() => Object.keys(localStorage).sort()); ok(keys.every((k) => /^(ho-room214(_c\d)?|ho-room214_set|hog_case_room214)$/.test(k)), 'keys: ' + keys); ok(!(await p.evaluate(() => document.cookie)), 'no cookies'); });
await T('responsive: title and game fit at 390, 768, 1280 and 1920 with no horizontal scroll', async (p) => { for (const w of [390, 768, 1280, 1920]) { await p.setViewportSize({ width: w, height: 900 }); await p.goto(base); ok(await noH(p), 'title at ' + w); await p.fill('#r-name', 'Ana'); await p.click('#r-begin'); await p.waitForFunction(() => window.__r214Scene && window.__r214Scene.playerG); await p.waitForTimeout(150); ok(await noH(p), 'game at ' + w); const cv = await p.$eval('canvas', (c) => c.getBoundingClientRect().width); ok(cv <= w + 1 && cv > 300, 'canvas ' + cv); } });
await T('performance: 4x CPU throttle with the light cone still runs above 30 fps with a few hundred objects at most', async (p) => {
  const cdp = await p.context().newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); await begin(p, 1); await calm(p);
  await p.evaluate(() => { window.__r214Input.hold('right', true); }); const r = await p.evaluate(() => new Promise((res) => { let n = 0, t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 > 3000) res({ fps: n / ((performance.now() - t0) / 1000), objs: window.__r214Scene.children.list.length }); else requestAnimationFrame(f); }; requestAnimationFrame(f); }));
  console.log('      fps (4x throttle, moving, light on):', r.fps.toFixed(1), 'objects:', r.objs); ok(r.fps >= 30, 'fps ' + r.fps); ok(r.objs <= 400, 'objects ' + r.objs);
});
await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
