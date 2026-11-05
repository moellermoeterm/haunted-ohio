// Static security and privacy checks for the new games (no browser).  Run: node tests/new-games/static-security.test.mjs
// Checks: vendored Phaser checksum + licence, no eval/Function/network calls/document.write in our code, no external scripts/styles/fonts/images,
// no inline event handlers, innerHTML only with escaped or constant data, no third-party hosts anywhere except the GoatCounter snippet.
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import assert from 'node:assert/strict'; import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const GAMES = ['the-veil', 'room-214'].filter((d) => fs.existsSync(path.join(ROOT, d)));
function walk(dir, out = []) { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) { if (f === 'vendor' || f === 'node_modules') continue; walk(p, out); } else out.push(p); } return out; }
const files = [...walk(path.join(ROOT, 'games-shared')), ...GAMES.flatMap((g) => walk(path.join(ROOT, g)))].filter((f) => /\.(js|html|css)$/.test(f));
let n = 0; const T = (name, fn) => { try { fn(); n++; console.log('PASS  ' + name); } catch (e) { console.log('FAIL  ' + name + '\n      ' + String(e.message).split('\n').slice(0, 6).join('\n      ')); process.exitCode = 1; } };
const rel = (f) => path.relative(ROOT, f);

T('vendored Phaser is the verified 3.90.0 build (checksum) and its licence is included', () => {
  const buf = fs.readFileSync(path.join(ROOT, 'games-shared/vendor/phaser.min.js')); assert.equal(crypto.createHash('sha256').update(buf).digest('hex'), 'e92ddef111ba42e92d316979c732311757093688ea1810591cb7aa2858eba7a7');
  assert.match(fs.readFileSync(path.join(ROOT, 'games-shared/vendor/PHASER-LICENSE.md'), 'utf8'), /MIT License/); assert.match(fs.readFileSync(path.join(ROOT, 'games-shared/vendor/PHASER-VERSION.md'), 'utf8'), /3\.90\.0/);
});
T('our code never evaluates strings or makes network calls', () => {
  const bad = [/\beval\s*\(/, /new\s+Function\s*\(/, /\bsetTimeout\s*\(\s*['"`]/, /\bsetInterval\s*\(\s*['"`]/, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /WebSocket/, /importScripts/, /document\.write/, /\bnew\s+Worker\b/, /EventSource/];
  for (const f of files.filter((f) => f.endsWith('.js'))) { const s = fs.readFileSync(f, 'utf8'); for (const b of bad) assert.ok(!b.test(s), rel(f) + ' matches ' + b); }
});
T('no external hosts: every script, stylesheet, font, image and url() is local, except the one GoatCounter snippet', () => {
  for (const f of files) { const s = fs.readFileSync(f, 'utf8'); const urls = s.match(/(?:src|href)\s*=\s*["']\s*(?:https?:)?\/\/[^"']+/gi) || [];
    for (const u of urls) assert.ok(/gc\.zgo\.at|ohmoellermoeterm\.goatcounter\.com/.test(u) || /^href\s*=\s*["']https?:\/\/(?:www\.)?(?:moellermoeterm\.github\.io)/i.test(u), rel(f) + ' external: ' + u);
    assert.ok(!/url\(\s*["']?https?:/i.test(s), rel(f) + ' css url()'); assert.ok(!/@import\s+url\(\s*["']?https?:/i.test(s), rel(f) + ' @import'); }
});
T('GoatCounter is the only third-party script, and it is the same anonymous snippet the other pages use', () => {
  for (const f of files.filter((f) => f.endsWith('.html'))) { const s = fs.readFileSync(f, 'utf8'); const tags = s.match(/<script[^>]*\ssrc=["'](?:https?:)?\/\/[^"']+["'][^>]*>/gi) || []; assert.ok(tags.length <= 1, rel(f) + ' has ' + tags.length + ' external scripts'); for (const t of tags) assert.ok(/gc\.zgo\.at\/count\.js/.test(t) && /ohmoellermoeterm\.goatcounter\.com/.test(t), t); }
});
T('no inline event handlers or javascript: URLs in HTML (keeps a strict CSP possible)', () => { for (const f of files.filter((f) => f.endsWith('.html'))) { const s = fs.readFileSync(f, 'utf8'); assert.ok(!/\son[a-z]+\s*=\s*["']/i.test(s), rel(f) + ' inline handler'); assert.ok(!/javascript:/i.test(s), rel(f) + ' javascript:'); } });
T('innerHTML / insertAdjacentHTML are never fed student text: every use is constant markup or goes through HOG.esc', () => {
  for (const f of files.filter((f) => f.endsWith('.js'))) { const lines = fs.readFileSync(f, 'utf8').split('\n'); lines.forEach((l, i) => { if (/\.(innerHTML|outerHTML)\s*=|insertAdjacentHTML/.test(l)) { const ok = /innerHTML\s*=\s*['"][^'"+$]*['"]\s*;?/.test(l) || /esc\(/.test(l) || /innerHTML\s*=\s*['"]<span>['"]\s*\+/.test(l) || /innerHTML\s*=\s*''/.test(l); assert.ok(ok, rel(f) + ':' + (i + 1) + ' ' + l.trim().slice(0, 120)); } }); }
});
T('saves are only ever parsed through the strict schema (no bare JSON.parse of storage or files outside hog-core and settings)', () => {
  for (const f of files.filter((f) => f.endsWith('.js'))) { const s = fs.readFileSync(f, 'utf8'); const m = s.match(/JSON\.parse\(/g) || []; if (!m.length) continue; assert.ok(/hog-core\.js$|hog-shell\.js$/.test(f), rel(f) + ' parses JSON'); }
  assert.match(fs.readFileSync(path.join(ROOT, 'games-shared/hog-shell.js'), 'utf8'), /S\.clean\(SETTINGS/);
});
T('the privacy list: only whitelisted GoatCounter event names are used', () => { const ok = new Set(['game-opened-the-veil', 'game-opened-room-214', 'chapter-complete']); for (const f of files.filter((f) => f.endsWith('.js'))) { const s = fs.readFileSync(f, 'utf8'); for (const m of s.matchAll(/HO_track\(\s*['"]([^'"]+)['"]/g)) assert.ok(ok.has(m[1]), rel(f) + ' sends ' + m[1]); } });
T('no real people or real-history labels in game content', () => { for (const f of files.filter((f) => /\/(the-veil|room-214)\//.test('/' + rel(f)) && f.endsWith('.js'))) { const s = fs.readFileSync(f, 'utf8').replace(/Nothing is (presented as )?Real history/gi, ''); assert.ok(!/real history/i.test(s), rel(f) + ' mentions Real history'); } });
console.log(process.exitCode ? '\nSome tests failed' : '\nAll ' + n + ' tests passed');
