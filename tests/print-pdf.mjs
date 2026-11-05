// Print or save as PDF: checks for the Spring Grove "Print my answers" feature. Emulates print media, builds real PDFs with page.pdf()
// (a filled-in sample and a blank copy), and checks: no JS errors, no network requests, no clipped text or overflow, each stop's answers stay together,
// about 4 to 7 pages, student text (including <script> and & < >) prints as plain text, no "Leaders:" text, nothing new stored.
// Run: node tests/print-pdf.mjs   (writes docs/samples/print/sample-filled.pdf and sample-blank.pdf)
import { chromium } from './node_modules/playwright/index.mjs';
import { serve, ROOT } from './lib.mjs';
import fs from 'node:fs'; import path from 'node:path';
const OUT = path.join(ROOT, 'docs', 'samples', 'print'); fs.mkdirSync(OUT, { recursive: true });
const { srv, base } = await serve(); const browser = await chromium.launch();
let fail = 0, pass = 0; const ok = (v, m) => { if (!v) throw new Error(m || 'expected truthy'); }; const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
const only = process.env.ONLY;
async function T(name, fn, viewport = { width: 1280, height: 900 }) {
  if (only && !name.includes(only)) return; const t0 = Date.now(); const ctx = await browser.newContext({ viewport, acceptDownloads: true }); const p = await ctx.newPage(); const errs = [], reqs = [];
  p.on('pageerror', (e) => errs.push('pageerror: ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith(base) && !u.startsWith('data:') && !u.startsWith('blob:') && !/gc\.zgo\.at|goatcounter/.test(u)) reqs.push(u); });
  try { await fn(p); if (errs.length) throw new Error('errors: ' + errs.slice(0, 3).join(' | ')); eq(reqs.length, 0, 'network requests: ' + reqs.join(',')); pass++; console.log(`PASS  ${name}  (${Date.now() - t0} ms)`); }
  catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 5).join('\n      ')); } finally { await ctx.close(); }
}
/* a filled-in sample save: some answers contain markup and symbols that must print as plain text */
const SAMPLE = {
  v: 2, squad: 'The Night Owls <b>&</b> Co', mem: ['Ana Lopez', 'Ben Carter', 'Cy Dunn', 'Di Evans', 'Ed Fox'], open: {},
  s: {
    s1: { field: 'Charles C. Breuer, 1844 & <script>window.__xss=1</script>', photo: true, test: 'eyes', res: ['3'], stamp: 'IMG_0412.jpg, 9:42 AM', expNotes: 'From the left the eyes seemed to follow us, but from the right they did not. It suggests an angle effect, not a stare.', margin: 'The cold bronze smelled of wet moss, and a bird went quiet behind us.', verdict: 'Natural explanation', facts: [0, 1] },
    s2: { field: '7', photo: true, test: 'glow', res: ['White', 'Blue'], stamp: '9:58 AM', expNotes: 'Glints of white and blue showed at one angle only; they vanished when we moved.', margin: 'The unfinished steps felt rough and dry under my palm, and the wind hummed in the iron gate.', verdict: 'Need more data', facts: [0, 2] },
    s3: { field: 'SECTION 53 <img src=x onerror=window.__xss=2>', photo: false, test: 'veg', res: ['Vines or roots', 'Uneven ground'], stamp: '', expNotes: 'A root crosses the path at ankle height. The ribbon moved when we walked quickly.', margin: 'The ground was damp and gritty, and the air smelled of pine.', verdict: 'Natural explanation', facts: [0, 1] },
    s4: { field: 'Mary Hale, 1872', photo: true, test: 'voice', res: ['No'], stamp: '10:20 AM', expNotes: 'Only traffic and a distant siren; one low murmur from a group two sections away.', margin: 'Silence pressed cold on my ears, and I heard a crow far off.', verdict: 'Still unexplained', facts: [0, 2] }
  },
  f: { hl: 'By the Breuer bust', ht: '68', hw: 'Calm', hs: 'Quiet', cl: 'The visitor center lawn', ct: '70', cw: 'Breeze', cs: 'Moderate', why: 'Two degrees is a small difference, so it might not explain a chill; one reading at each spot cannot prove anything, and we would need more data.', fifth: 'The bronze eyes caught the last of the afternoon light, and every crow in Section 16 went quiet at once.' },
  day: [{}, {}, {}]
};
async function open(p, save) {
  if (save) await p.addInitScript((d) => { try { localStorage.setItem('ho-hunt2', JSON.stringify(d)); } catch (e) { /* ignore */ } }, save);
  await p.addInitScript(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });   /* headless: record the call; the sheet stays so page.pdf() can print it */
  await p.goto(base + '#cemetery'); await p.waitForTimeout(250); await p.click('#ct-submit'); await p.waitForTimeout(150);
}
const pdfPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
const LETTER = { format: 'Letter', margin: { top: '0.6in', bottom: '0.6in', left: '0.6in', right: '0.6in' }, printBackground: true, preferCSSPageSize: true };

await T('turn-in tab: three ways to hand in (form, print or PDF, copy report) with clear keyboard-reachable buttons and the print-window note', async (p) => {
  await open(p, SAMPLE); const t = await p.textContent('#turnin'); ok(/three ways/i.test(t), 'three ways'); ok(/Choose Save as PDF or your printer/.test(t), 'the print-window note');
  for (const id of ['#formLink', '#dzPrintA', '#dzPrintBlank', '#subCopy2']) ok(await p.isVisible(id), 'visible ' + id); eq((await p.textContent('#dzPrintA')).trim(), 'Print my answers (PDF)', 'label'); eq((await p.textContent('#dzPrintBlank')).trim(), 'Print a blank paper copy', 'label');
  await p.focus('#dzPrintA'); await p.keyboard.press('Tab'); eq(await p.evaluate(() => document.activeElement.id), 'dzPrintBlank', 'keyboard order'); ok(!/Leaders:/.test(t), 'no "Leaders:" text');
  await p.click('#ct-hunt'); await p.waitForTimeout(150); ok(await p.isVisible('#dzPrint2'), 'the hunt tab has Print my answers'); eq((await p.textContent('#dzPrint2')).trim(), 'Print my answers', 'label');
});
await T('pressing a print button builds the sheet, calls print once, and the sheet is removed after printing (afterprint)', async (p) => {
  await open(p, SAMPLE); await p.click('#dzPrintA'); eq(await p.evaluate(() => window.__printCalls), 1, 'print called once'); ok(await p.$('#print-sheet'), 'sheet exists'); ok(await p.evaluate(() => document.body.classList.contains('printing')), 'printing class');
  eq(await p.evaluate(() => getComputedStyle(document.getElementById('print-sheet')).display), 'none', 'the sheet is hidden on screen');
  await p.evaluate(() => window.dispatchEvent(new Event('afterprint'))); eq(await p.$('#print-sheet'), null, 'cleaned up'); ok(!(await p.evaluate(() => document.body.classList.contains('printing'))), 'class removed');
  await p.click('#ct-hunt'); await p.waitForTimeout(100); await p.click('#dzPrint2'); ok(await p.$('#print-sheet'), 'the hunt tab button prints too');
});
await T('nothing new is stored or sent: building the sheet changes no localStorage key and makes no request', async (p) => {
  await open(p, SAMPLE); const before = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]))); await p.click('#dzPrintA'); await p.click('#dzPrintBlank'); const after = await p.evaluate(() => JSON.stringify(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)]))); eq(after, before, 'localStorage unchanged');
});
await T('filled sample: every answer prints, markup prints as plain text, the sheet has no Leaders: text, and a PDF of 4 to 7 pages is made', async (p) => {
  await open(p, SAMPLE); await p.click('#dzPrintA'); await p.emulateMedia({ media: 'print' });
  const info = await p.evaluate(() => { const sh = document.getElementById('print-sheet'); return { text: sh.textContent, scripts: sh.querySelectorAll('script, img').length, xss: window.__xss || 0, stops: sh.querySelectorAll('[data-ps-stop]').length }; });
  eq(info.scripts, 0, 'no script or img element was created from student text'); eq(info.xss, 0, 'no script ran'); ok(info.text.includes('<script>window.__xss=1</script>') && info.text.includes('1844 &') && info.text.includes('The Night Owls <b>&</b> Co'), 'student text printed literally');
  for (const w of ['Charles C. Breuer', 'IMG_0412.jpg', 'Need more data', 'By the Breuer bust', 'The bronze eyes caught', 'Ana Lopez', 'Spring Grove Dossier, Case File #0048', 'Field Rules', 'We all followed the field rules', 'Leader use only', 'Squad photo taken', 'Attach a printed photo here']) ok(info.text.includes(w), 'missing on the sheet: ' + w);
  ok(!/Leaders:/.test(info.text), 'no "Leaders:" text'); eq(info.stops, 5, 'four stops and the finale');
  const pdf = await p.pdf(LETTER); fs.writeFileSync(path.join(OUT, 'sample-filled.pdf'), pdf); const pages = pdfPages(pdf); console.log('      filled sample pages:', pages); ok(pages >= 4 && pages <= 7, 'page count ' + pages); ok(pdf.slice(0, 5).toString() === '%PDF-', 'a PDF');
});
await T('blank copy: all answers are blank ruled lines, with fill-in lines for squad, members and roles; the PDF has 4 to 7 pages', async (p) => {
  await open(p, SAMPLE); await p.click('#dzPrintBlank'); await p.emulateMedia({ media: 'print' });
  const info = await p.evaluate(() => { const sh = document.getElementById('print-sheet'); return { text: sh.textContent, lines: sh.querySelectorAll('.ps-line').length, answers: sh.querySelectorAll('.ps-ans').length, onBoxes: sh.querySelectorAll('.ps-box.on').length }; });
  ok(!/Charles|Ana Lopez|Night Owls|IMG_0412|By the Breuer/.test(info.text), 'no saved answer leaks into the blank copy'); eq(info.answers, 0, 'no filled answer blocks'); eq(info.onBoxes, 0, 'no checked boxes'); ok(info.lines >= 60, 'many ruled lines: ' + info.lines); ok(/Members and roles/.test(info.text) && /Squad name/.test(info.text), 'squad, members and roles to fill in');
  const pdf = await p.pdf(LETTER); fs.writeFileSync(path.join(OUT, 'sample-blank.pdf'), pdf); const pages = pdfPages(pdf); console.log('      blank copy pages:', pages); ok(pages >= 4 && pages <= 7, 'page count ' + pages);
});
await T('layout in print media: black on white, no clipped text or overflow, each stop section fits one page and is set not to split, the leader box is last', async (p) => {
  await open(p, SAMPLE); await p.click('#dzPrintA'); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 816, height: 1056 });
  const r = await p.evaluate(() => { const sh = document.getElementById('print-sheet'), cs = getComputedStyle(sh), body = getComputedStyle(document.body); const secs = [...sh.querySelectorAll('.ps-sec')]; const over = [...sh.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== 'inline' && !(e.matches('.ps-box'))).map((e) => e.className || e.tagName).slice(0, 5);
    return { color: cs.color, bg: body.backgroundColor, visibleOthers: [...document.body.children].filter((c) => c !== sh && getComputedStyle(c).display !== 'none' && c.tagName !== 'SCRIPT').map((c) => c.tagName + '.' + c.className).slice(0, 5), breaks: secs.map((s) => getComputedStyle(s).breakInside), heights: secs.map((s) => s.getBoundingClientRect().height), last: sh.querySelector('.ps-leader') === sh.querySelector('tbody td').lastElementChild, over, fixed: [...sh.querySelectorAll('*')].filter((e) => getComputedStyle(e).position === 'fixed').length }; });
  ok(r.color === 'rgb(0, 0, 0)' && r.bg === 'rgb(255, 255, 255)', 'black on white: ' + r.color + ' ' + r.bg); eq(r.visibleOthers.length, 0, 'the rest of the page is hidden: ' + r.visibleOthers); ok(r.breaks.every((b) => b === 'avoid'), 'sections do not split: ' + r.breaks); ok(r.heights.every((h) => h < 1056 - 96 - 40), 'every section fits on one page: ' + r.heights.map(Math.round)); ok(r.last, 'the leader box is the last block'); eq(r.over.length, 0, 'overflowing elements: ' + r.over);
});
await T('a long answer (an 1800-character word with no spaces plus a very long note) wraps instead of being clipped', async (p) => {
  const big = JSON.parse(JSON.stringify(SAMPLE)); big.s.s1.expNotes = 'x'.repeat(1800) + ' ' + 'word '.repeat(150); big.f.fifth = 'y'.repeat(900);
  await open(p, big); await p.click('#dzPrintA'); await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 816, height: 1056 });
  const bad = await p.evaluate(() => [...document.querySelectorAll('#print-sheet .ps-ans')].filter((e) => e.scrollWidth > e.clientWidth + 1).length); eq(bad, 0, 'clipped answer blocks'); const pdf = await p.pdf(LETTER); ok(pdfPages(pdf) <= 8, 'pages ' + pdfPages(pdf));
});
await T('on-screen themes still work and the print is always light: toggling Night/Daylight keeps the sheet black on white', async (p) => {
  await open(p, SAMPLE); await p.click('#theme'); await p.waitForTimeout(150); await p.click('#dzPrintA'); await p.emulateMedia({ media: 'print' }); const c = await p.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.getElementById('print-sheet')).color]); eq(c.join('|'), 'rgb(255, 255, 255)|rgb(0, 0, 0)', 'light in either theme');
  await p.emulateMedia({ media: 'screen' }); await p.evaluate(() => window.dispatchEvent(new Event('afterprint'))); ok(await p.isVisible('#turnin'), 'the page is back');
});
for (const w of [1920, 1280, 390]) await T(`no horizontal scroll or console errors on the turn-in and hunt tabs at ${w}px (buttons wrap)`, async (p) => {
  await open(p, SAMPLE); ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'turn-in tab'); await p.click('#ct-hunt'); await p.waitForTimeout(150); ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'hunt tab');
  await p.click('#ct-submit'); await p.click('#dzPrintBlank'); await p.evaluate(() => window.dispatchEvent(new Event('afterprint'))); ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'after printing');
}, { width: w, height: 900 });
await browser.close(); srv.close(); console.log(fail ? `\n${fail} failed, ${pass} passed` : `\nAll ${pass} tests passed`); process.exit(fail ? 1 : 0);
