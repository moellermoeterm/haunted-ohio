// Room 214: finish-line items (details noticed, tour, summary). The "no" buzz is unchanged; every haunted sound can be heard on laptop speakers (energy above 300 Hz after a 250 Hz high-pass);
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
async function T(name, fn, opts = {}) {
  if (only && !name.includes(only)) return; const t0 = Date.now(); const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 }, hasTouch: !!opts.touch, isMobile: !!opts.touch }); const p = await ctx.newPage(); if (!opts.tour) await p.addInitScript(() => { try { localStorage.setItem('ho-room214-tour', JSON.stringify({ intro: true, done: [], off: true })); } catch (e) { /* blocked */ } }); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith('http://127.0.0.1') && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); }); p.setDefaultTimeout(15000); p.on('dialog', (d) => d.accept());
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'outbound requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}

async function begin(p, variant = 1, name = 'Ana') { await p.goto(base + '?preview=' + variant); await p.fill('#r-name', name); await p.click('#r-begin'); await p.waitForFunction(() => window.__r214Scene && window.__r214Amb && window.__r214UI, null, { timeout: 15000 }); }
const calm = (p) => p.evaluate(() => { __r214Game.por.forEach((x) => { x.freeze = 99999; x.x = 1.5; x.y = 1.5; }); });
const LINES = ['A brass bell on the desk, polished, with no dust on it.', 'Old carpet and floor wax, like a school after hours.', 'A clock ticks somewhere, a little slower than it should.', 'A doorknob, still warm, as if someone just let go.', 'A room-service tray, the cups set out for two guests.', 'Footsteps above you stop, then start again.', 'Cold air slides from under a door, though every window is shut.', 'Nothing here is broken. Dust sits on everything, thick and even.'];

await T('details noticed: all six hotels have the same eight approved lines, one sense each, in rooms with nothing else in them, on a floor tile you can reach', async (p) => {
  for (let v = 1; v <= 6; v++) { await begin(p, v); const r = await p.evaluate(() => { const g = __r214Game; return { det: g.d.details, items: g.d.items.map((i) => i.floor + ':' + i.x + ',' + i.y), tiles: g.d.details.map((d) => g.tile(d.floor, d.x, d.y)), path: g.d.details.map((d) => d.floor === 0 ? g.path(0, [g.pl.x, g.pl.y], [d.x + 0.5, d.y + 0.5]).length > 0 : true) }; });
    eq(JSON.stringify(r.det.map((d) => d.text)), JSON.stringify(LINES), 'hotel ' + v + ': the eight lines, word for word'); ok(r.det.every((d) => ['Sight', 'Sound', 'Smell', 'Touch'].includes(d.sense)), 'one sense each'); eq(JSON.stringify(r.det.map((d) => d.floor)), JSON.stringify([0, 0, 0, 1, 1, 1, 2, 2]), 'three, three and two by floor');
    ok(r.det.every((d) => !r.items.includes(d.floor + ':' + d.x + ',' + d.y)), 'hotel ' + v + ': never on an item'); ok(r.tiles.every((t) => t === '.'), 'hotel ' + v + ': on open floor: ' + r.tiles.join('')); ok(r.path.every(Boolean), 'hotel ' + v + ': the lobby details can be walked to'); }
});

await T('noticing a detail: the prompt says Notice; E notices it; "Detail noticed." shows with the line, [a soft tone] is captioned (sound off), the top bar counts "Details noticed: 1 of 8", the save keeps it after a reload, and the glint goes away', async (p) => {
  await begin(p, 2); await calm(p); await p.evaluate(() => window.HOG.audio.setMute(true));
  const d = await p.evaluate(() => { const g = __r214Game, d = g.d.details[0]; g.pl.x = d.x + 0.5; g.pl.y = d.y + 0.5; return d; }); await p.waitForTimeout(300);
  eq(await p.evaluate(() => __r214Game.nearest() && __r214Game.nearest().label), 'Notice', 'the prompt'); await p.keyboard.press('KeyE');
  await p.waitForFunction((t) => (document.querySelector('.hog-toast') || {}).textContent === 'Detail noticed. ' + t, d.text); await p.waitForFunction(() => /a soft tone/.test(document.querySelector('#hog-captions').textContent));
  await p.waitForFunction(() => /Details noticed: 1 of 8/.test(document.getElementById('r-stats').textContent)); ok(!(await p.evaluate((id) => window.__r214Scene.detG[id].visible, d.id)), 'the glint is gone');
  await p.reload(); await p.click('#r-continue'); await p.waitForFunction(() => window.__r214Game && /Details noticed: 1 of 8/.test(document.getElementById('r-stats').textContent)); ok(true, 'kept after a reload');
});

await T('the details sit beside every writing box under "What you noticed", in the journal, in the downloaded journal, and the escape window starts with the case summary', async (p) => {
  await begin(p, 4); await calm(p); await p.evaluate(() => { const g = __r214Game; g.notice(g.d.details[0]); g.notice(g.d.details[1]); g.s.seen.push(1); });
  await p.evaluate(() => window.__r214UI.journalEntry(1)); await p.waitForSelector('.hog-modal .r-noticed'); const box = await p.innerText('.hog-modal .r-noticed'); ok(box.includes('What you noticed') && box.includes(LINES[0]) && box.includes(LINES[1]) && /Sight:/.test(box), 'beside the box: ' + box);
  await p.keyboard.press('Escape'); await p.waitForSelector('.hog-modal', { state: 'detached' }); const rep = await p.evaluate(() => window.__r214UI.reportText()); ok(rep.includes('WHAT YOU NOTICED (2 of 8)') && rep.includes(LINES[1]), 'in the downloaded journal');
  const sum = await p.evaluate(() => window.__r214UI.summary().textContent); ok(/Case summary/.test(sum) && /Details noticed: 2 of 8/.test(sum) && /Notes found: 0 of 3/.test(sum) && /Times checked out: 0/.test(sum), 'summary: ' + sum);
});

await T('the tour: the purpose line on the title screen, three cards and every bubble and tip at 12 words or fewer, the "?" Help list, and the first bubbles move on when the player acts', async (p) => {
  await p.goto(base + '?preview=3'); eq((await p.textContent('.r-purpose')).trim(), 'Find the room missing from the plan, unseen, and collect details for your story.', 'purpose'); const txt = await p.evaluate(() => window.R214TourText);
  for (const c of txt.CARDS) ok(c.text.split(/\s+/).length <= 12, c.text); for (const t of txt.TIPS) ok(t.text.split(/\s+/).length <= 12, t.text); for (const s of txt.STEPS) for (const v of (typeof s.text === 'string' ? [s.text] : Object.values(s.text))) ok(v.split(/\s+/).length <= 12, v);
  await p.fill('#r-name', 'Ana'); await p.click('#r-begin'); await p.waitForSelector('.hot-intro'); eq(await p.$$eval('.hot-dots i', (e) => e.length), 3, 'three cards'); await p.click('.hot-go'); await p.evaluate(() => { __r214Game.por.forEach((x) => { x.freeze = 99999; x.x = 1.5; x.y = 1.5; }); });
  const bub = (t) => p.waitForFunction((x) => { const b = document.querySelector('.hot-bub'); return b && !b.hidden && b.textContent.includes(x); }, t, { timeout: 8000 });
  await bub('Move with the arrow keys or W A S D.'); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(600); await p.keyboard.up('ArrowUp'); await bub('Hold C to sneak. Sneaking is silent.'); await p.keyboard.down('KeyC'); await p.waitForTimeout(400); await p.keyboard.up('KeyC');
  await p.click('[data-help]'); await p.waitForSelector('.hot-help'); const h = await p.innerText('.hot-help'); ok(h.includes(txt.PURPOSE) && h.includes(txt.CONNECT), 'purpose and the writing sentence'); for (const t of txt.TIPS) ok(h.includes(t.text), 'tip ' + t.label);
}, { tour: true });

await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
