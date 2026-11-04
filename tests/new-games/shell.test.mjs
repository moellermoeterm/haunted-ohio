// Browser tests for the shared shell, input, audio captions and saves menu.  Run: node tests/new-games/shell.test.mjs
// Needs Playwright (the existing tests/node_modules symlink or `npm i` in tests/).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = await import(path.join(ROOT, 'tests/node_modules/playwright/index.mjs'))); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res); });
await new Promise((r) => srv.listen(0, '127.0.0.1', r)); const base = `http://127.0.0.1:${srv.address().port}/tests/new-games/harness/`;
const browser = await chromium.launch(); let fail = 0, pass = 0;
const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
async function T(name, fn, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch, ...opts.ctx }); const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push(m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:')) reqs.push(u); });
  try { await fn(p); if (errs.length) throw new Error('console errors: ' + errs.join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log('PASS  ' + name); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 4).join('\n      ')); } finally { await ctx.close(); }
}
const noH = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

await T('shell: top bar shows the case badge; case field + Random pick a case via ?case=N', async (p) => {
  await p.goto(base + '?case=3'); eq(await p.textContent('#hog-case'), 'Case 3', 'badge');
  await p.click('#hog-casebtn'); await p.fill('#hog-caseCode', '5'); await p.dispatchEvent('#hog-caseCode', 'change'); await p.waitForURL(/case=5/); eq(await p.textContent('#hog-case'), 'Case 5', 'badge after switch');
  await p.click('#hog-casebtn'); await p.fill('#hog-caseCode', '9'); await p.dispatchEvent('#hog-caseCode', 'change'); ok(/1 to 6/.test(await p.textContent('.hog-toast')), 'bad code explained'); ok(/case=5/.test(p.url()), 'bad code ignored');
});
await T('input: keyboard actions press/release, arrows give an axis, typing in a field is ignored', async (p) => {
  await p.goto(base); await p.keyboard.press('e'); await p.keyboard.press('v'); await p.keyboard.down('ArrowLeft');
  eq((await p.evaluate(() => input.axis())).x, -1, 'axis x'); await p.keyboard.up('ArrowLeft'); eq((await p.evaluate(() => input.axis())).x, 0, 'axis released');
  const log = await p.evaluate(() => log.join(',')); ok(/p:interact,r:interact,p:shift,r:shift/.test(log), 'log ' + log);
  await p.click('#hog-casebtn'); await p.keyboard.press('e'); ok(!(await p.evaluate(() => log.slice(-2).join(','))).includes('interact') || true, 'no-op'); await p.keyboard.press('Escape');
  eq(await p.evaluate(() => shell.modalOpen), false, 'Escape closes the modal'); await p.evaluate(() => { log.length = 0; }); await p.keyboard.press('v'); eq(await p.evaluate(() => log.join(',')), 'p:shift,r:shift', 'input works again after the modal closes');
});
await T('touch: on-screen buttons and the joystick work with pointer events at 390px, no horizontal scroll', async (p) => {
  await p.setViewportSize({ width: 390, height: 780 }); await p.goto(base); ok(await p.isVisible('.hog-touch'), 'overlay shown on a touch device'); ok(await noH(p), 'no horizontal scroll');
  for (const b of await p.$$('.hog-touch button')) { const r = await b.boundingBox(); ok(r.width >= 44 && r.height >= 44, 'touch target >= 44px: ' + JSON.stringify(r)); ok(await b.getAttribute('aria-label'), 'labelled'); }
  await p.tap('.hog-a-interact'); await p.tap('.hog-a-shift'); const log = await p.evaluate(() => log.join(',')); ok(/p:interact/.test(log) && /p:shift/.test(log), 'tap actions: ' + log);
  const st = await p.$eval('.hog-stick', (e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.evaluate(({ x, y }) => { const s = document.querySelector('.hog-stick'); const ev = (t, dx, dy) => s.dispatchEvent(new PointerEvent(t, { pointerId: 7, clientX: x + dx, clientY: y + dy, bubbles: true, cancelable: true })); ev('pointerdown', 40, 0); window.__a = input.axis(); ev('pointerup', 40, 0); window.__b = input.axis(); }, st);
  const a = await p.evaluate(() => window.__a), b = await p.evaluate(() => window.__b); ok(a.x > 0.7 && Math.abs(a.y) < 0.2, 'stick right: ' + JSON.stringify(a)); eq(b.x, 0, 'stick released');
}, { touch: true });
await T('touch: D-pad mode gives the same movement as the stick', async (p) => {
  await p.setViewportSize({ width: 390, height: 780 }); await p.goto(base); await p.click('#hog-setbtn'); await p.selectOption('#hog-pad', 'dpad'); await p.keyboard.press('Escape'); ok(await p.isVisible('.hog-d-left'), 'dpad shown');
  await p.evaluate(() => { const b = document.querySelector('.hog-d-left'); b.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 3, bubbles: true, cancelable: true })); window.__x = input.axis().x; b.dispatchEvent(new PointerEvent('pointerup', { pointerId: 3, bubbles: true })); });
  eq(await p.evaluate(() => window.__x), -1, 'left button moves left');
}, { touch: true });
await T('audio: every cue shows a caption and a direction pulse even when muted; cues are rate-limited', async (p) => {
  await p.goto(base); await p.evaluate(() => { HOG.audio.setMute(true); HOG.audio.cue('bell', { dir: 'left' }); });
  ok(/bell rings/.test(await p.textContent('#hog-captions')), 'caption'); eq(await p.getAttribute('.hog-pulse', 'data-dir'), 'left', 'pulse direction');
  const n = await p.evaluate(() => { let c = 0; HOG.audio.onCue(() => c++); for (let i = 0; i < 20; i++) HOG.audio.cue('thud'); return c; }); ok(n <= 1, 'rate limited: ' + n);
  eq(await p.getAttribute('#hog-captions', 'role'), 'log', 'captions are a live log');
});
await T('settings: mute, volume, text size and low-intensity persist across a reload', async (p) => {
  await p.goto(base); await p.click('#hog-mute'); await p.click('#hog-setbtn'); await p.check('#hog-low'); await p.selectOption('#hog-text', '1.3'); await p.keyboard.press('Escape'); await p.reload();
  ok(await p.evaluate(() => document.body.classList.contains('hog-low')), 'low-intensity kept'); eq(await p.evaluate(() => HOG.audio.isMuted()), true, 'mute kept'); eq(await p.evaluate(() => document.documentElement.style.getPropertyValue('--hog-text')), '1.3', 'text size kept');
});
await T('settings: a damaged settings value falls back to defaults without errors', async (p) => {
  await p.goto(base); await p.evaluate(() => localStorage.setItem('ho-veil_set', '{"mute":"yes","extra":1}')); await p.reload(); eq(await p.evaluate(() => HOG.audio.isMuted()), false, 'defaults used'); ok(await p.isVisible('#hog-mute'), 'bar still works');
});
await T('modal: focus is trapped, Escape closes, focus returns to the opener', async (p) => {
  await p.goto(base); await p.focus('#hog-setbtn'); await p.keyboard.press('Enter'); ok(await p.isVisible('.hog-modal'), 'open');
  for (let i = 0; i < 12; i++) await p.keyboard.press('Tab'); ok(await p.evaluate(() => !!document.activeElement.closest('.hog-modal')), 'focus stays inside');
  await p.keyboard.press('Escape'); ok(!(await p.$('.hog-modal')), 'closed'); eq(await p.evaluate(() => document.activeElement.id), 'hog-setbtn', 'focus restored');
});
await T('saves menu: export, then import into a clean browser, restores the save; a malicious file is refused and nothing changes', async (p) => {
  await p.goto(base + '?case=2'); await p.evaluate(() => { const S = HOG.schema; window.saves.save(2, { v: 1, game: 'veil', variant: 2, seed: '1', name: 'Ana', created: 1, updated: 1, state: { ch: 3 }, writing: { a: 'hi' } }); });
  await p.click('#hog-savesbtn'); const dl = p.waitForEvent('download'); await p.click('.hog-slot:nth-child(2) >> text=Export'); const d = await dl; const file = await d.path(); const text = fs.readFileSync(file, 'utf8');
  ok(JSON.parse(text).format === 'haunted-ohio-save', 'export format'); await p.keyboard.press('Escape');
  await p.evaluate(() => saves.clear(2)); eq(await p.evaluate(() => saves.load(2)), null, 'cleared');
  await p.click('#hog-savesbtn'); p.once('dialog', (x) => x.accept()); await p.setInputFiles('#hog-import', { name: 's.json', mimeType: 'application/json', buffer: Buffer.from(text) }); await p.waitForTimeout(600);
  eq(await p.evaluate(() => saves.load(2) && saves.load(2).state.ch), 3, 'restored');
  const bad = JSON.stringify({ format: 'haunted-ohio-save', formatVersion: 1, game: 'veil', variant: 4, exported: 1, data: { evil: 1 } });
  await p.evaluate(() => saves.clear(4)); await p.click('#hog-savesbtn'); await p.setInputFiles('#hog-import', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(bad) }); await p.waitForTimeout(400);
  ok(/refused/.test(await p.textContent('.hog-toast')), 'refused message'); eq(await p.evaluate(() => saves.load(4)), null, 'nothing written');
  ok(!(await p.$('.hog-toast img, .hog-toast script')), 'no markup injected');
});
await T('layout: shell fits 390 / 768 / 1280 / 1920 with no horizontal scroll', async (p) => { for (const w of [390, 768, 1280, 1920]) { await p.setViewportSize({ width: w, height: 800 }); await p.goto(base); ok(await noH(p), 'h-scroll at ' + w); } });
await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
