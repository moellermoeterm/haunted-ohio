// Final QA sweep: every page, 1920 / 1280 / 390 px, Night and Daylight, plus every Haunting Files case and Last Light scenario.
// Fails on any console error, page error, failed local request, or horizontal scroll.   node tests/qa.mjs
import { serve } from './lib.mjs';
import { chromium } from './node_modules/playwright/index.mjs';
const { srv, base } = await serve(); const b = await chromium.launch();
const problems = []; let checks = 0;
const ROUTES = ['', '#learn', '#games', '#prompts', '#draft', '#legend', '#dread', '#resources', '#cemetery', '#week', '#leaders', '#about'];
const PAGES = [...ROUTES, ...Array.from({ length: 10 }, (_, i) => 'show-dont-tell/#lesson-' + (i + 1)), 'design-system/', 'teacher/', 'haunting-files/', 'last-light/'];
for (const theme of ['dark', 'light']) for (const w of [1920, 1280, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.addInitScript((t) => { try { localStorage.setItem('ho-theme', JSON.stringify(t)); } catch (e) { /* ignore */ } }, theme);
  const p = await ctx.newPage(); let where = '';
  const bad = (m) => problems.push(`[${theme} ${w}px] ${where}: ${m}`);
  p.on('pageerror', (e) => bad('page error: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load|gc\.zgo\.at/.test(m.text())) bad('console: ' + m.text()); });
  p.on('requestfailed', (r) => { if (r.url().startsWith(base)) bad('failed request ' + r.url()); });
  p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400) bad(r.status() + ' ' + r.url()); });
  const noScroll = async (label) => { checks++; if (!(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1))) bad('horizontal scroll: ' + label);
    const t = await p.evaluate(() => document.documentElement.getAttribute('data-theme')); checks++; if (theme === 'light' && t !== 'light' && !/^(hf|ll) |haunting-files|last-light/.test(label)) bad('theme not applied: ' + label); };
  for (const u of PAGES) { where = u || 'home'; await p.goto(base + u); await p.waitForTimeout(150); await noScroll(where); }
  where = 'dossier'; await p.goto(base + '#cemetery'); for (const tab of ['#ct-legends', '#ct-hunt', '#ct-submit']) { await p.click(tab); await p.waitForTimeout(80); await noScroll('cemetery ' + tab); }
  for (const k of [1, 2, 3, 4, 5, 6]) {
    where = 'hf case ' + k; await p.goto(base + 'haunting-files/?case=' + k); await p.waitForTimeout(120); await noScroll(where + ' title');
    await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'QA'); await p.click('[data-act="begin"]'); await p.waitForTimeout(80);
    for (const id of ['E3', 'E4', 'E6']) { await p.click(`[data-ex="${id}"]`); await noScroll(where + ' ' + id); if (id !== 'E6') await p.click(`[data-file="eye"]`); }
    await p.click('[data-go="interview"]'); await noScroll(where + ' interview'); await p.click('[data-go="board"]'); await noScroll(where + ' board'); await p.evaluate(() => localStorage.removeItem('hf_save_v1') || Object.keys(localStorage).filter((x) => /^hf_save/.test(x)).forEach((x) => localStorage.removeItem(x)));
    where = 'll scenario ' + k; await p.goto(base + 'last-light/?case=' + k); await p.waitForTimeout(120); await noScroll(where + ' title');
    await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'QA'); await p.click('[data-cr="bg:mech"]'); await p.click('[data-cr="pers:bold"]'); await p.click('[data-cr="str:hands"]'); await p.click('[data-cr="weak:nerves"]'); await p.click('[data-act="start"]'); await p.waitForTimeout(80);
    await noScroll(where + ' map'); await p.click('[data-loc="home"]'); await p.click('[data-act="travel"]'); await p.click('[data-act="sig-power"]'); await noScroll(where + ' radio');
    await p.evaluate(() => Object.keys(localStorage).filter((x) => /^tll_save/.test(x)).forEach((x) => localStorage.removeItem(x)));
  }
  await ctx.close();
}
await b.close(); srv.close();
console.log(`${checks} checks across ${PAGES.length + 3 + 6 * 8} screens x 3 widths x 2 themes`);
if (problems.length) { console.log(problems.length + ' problem(s):'); [...new Set(problems)].slice(0, 40).forEach((x) => console.log(' - ' + x)); process.exit(1); }
console.log('QA passed: no console errors, failed requests or horizontal scroll.');
