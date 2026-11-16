// Tiny static server + helpers so the tests need no dependencies except Playwright.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain' };

export function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, base: `http://127.0.0.1:${srv.address().port}/` }));
  });
}

// Console errors we do not care about when offline (Google Fonts etc.) are filtered out.
export const IGNORED = /fonts\.g|ERR_|Failed to load resource|net::|favicon/i;

// Games assign one of six cases at random on the first Begin. So that tests written for a known case stay repeatable, a normal test
// page starts with case 1 already assigned in all four games. Tests about the assignment itself ask for a raw page: newPage(vp, { raw: true }).
export const ASSIGN_KEYS = ['ho-haunting-files-assign', 'ho-last-light-assign', 'ho-veil-assign', 'ho-room214-assign'];
export async function newPage(browser, errs, viewport = { width: 1366, height: 800 }, opts = {}) {
  const ctx = await browser.newContext({ viewport: viewport || { width: 1366, height: 800 }, acceptDownloads: true });
  const page = await ctx.newPage();
  if (!opts.raw) await page.addInitScript((keys) => { try { keys.forEach((k) => { if (!localStorage.getItem(k)) localStorage.setItem(k, '1'); }); } catch (e) { /* storage blocked */ } }, ASSIGN_KEYS);
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !IGNORED.test(m.text())) errs.push('console: ' + m.text()); });
  return page;
}

export async function run(tests) {
  const { chromium } = await import('playwright');
  const { srv, base } = await serve();
  const browser = await chromium.launch();
  let fail = 0;
  for (const [name, fn] of tests) {
    if (process.env.ONLY && !name.includes(process.env.ONLY)) continue;   // e.g. ONLY="BEFORE" npm run smoke
    const errs = [];
    const t0 = Date.now();
    try {
      await fn({ browser, base, errs, newPage: (vp, opts) => newPage(browser, errs, vp, opts) });
      if (errs.length) throw new Error('unexpected errors: ' + errs.slice(0, 3).join(' | '));
      console.log(`PASS  ${name}  (${Date.now() - t0} ms)`);
    } catch (e) { fail++; console.log(`FAIL  ${name}\n      ${String(e.message || e).split('\n').slice(0, 4).join('\n      ')}`); }
  }
  await browser.close(); srv.close();
  console.log(fail ? `\n${fail} test(s) failed` : '\nAll tests passed');
  process.exit(fail ? 1 : 0);
}
export const eq = (a, b, msg) => { if (a !== b) throw new Error(`${msg || 'expected equal'}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`); };
export const ok = (v, msg) => { if (!v) throw new Error(msg || 'expected truthy'); };
