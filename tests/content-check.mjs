// Content-preservation check.  The redesign must never delete or rewrite existing text.
//   node content-check.mjs --write   records every prose-like text run in the baseline (do this BEFORE a redesign)
//   node content-check.mjs           compares the current files to the baseline and FAILS if any text was removed
// It reads text from HTML, inline JS strings (story data, dialogue, clues, missions), and ignores CSS and base64.
// Text that is ADDED (for example new button labels) is listed for review but does not fail the check.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib.mjs';

const FILES = ['index.html', 'haunting-files/index.html', 'last-light/index.html', 'show-dont-tell/index.html'];
const BASE = path.join(path.dirname(new URL(import.meta.url).pathname), 'baseline', 'content.json');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rarr;/g, '→');
// A "text run" is 6+ words of plain prose with no markup or code punctuation in it.
const RUN = /[A-Za-z0-9][A-Za-z0-9 ,.!?;:—–\-()’“”‘\/&%#$@*…→]{30,}/g;

export function extract(file) {
  let s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  s = s.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/base64,[A-Za-z0-9+/=]{40,}/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ');
  s = decode(s);
  const out = new Set();
  for (const m of s.matchAll(RUN)) {
    const t = m[0].replace(/\s+/g, ' ').trim();
    if (t.split(' ').length >= 6 && /[a-z]{3}/.test(t)) out.add(t);
  }
  return [...out].sort();
}

const write = process.argv.includes('--write');
if (write) {
  const data = {};
  for (const f of FILES) data[f] = extract(f);
  fs.mkdirSync(path.dirname(BASE), { recursive: true });
  fs.writeFileSync(BASE, JSON.stringify(data, null, 1));
  console.log('Baseline written:', Object.entries(data).map(([f, a]) => `${f}: ${a.length} runs`).join(' | '));
} else {
  const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));
  let removed = 0;
  for (const f of FILES) {
    const now = new Set(extract(f));
    // Text may be re-wrapped across elements, so a baseline run also counts as present if it is a substring of a current run.
    const joined = [...now].join('\n');
    const lost = base[f].filter((t) => !now.has(t) && !joined.includes(t));
    const old = new Set(base[f]);
    const added = [...now].filter((t) => !old.has(t));
    console.log(`${lost.length ? 'FAIL' : 'ok  '}  ${f}: ${base[f].length} baseline runs, ${lost.length} missing, ${added.length} new`);
    lost.slice(0, 40).forEach((t) => console.log('   MISSING: ' + t.slice(0, 140)));
    if (process.argv.includes('--show-added')) added.slice(0, 60).forEach((t) => console.log('   added:   ' + t.slice(0, 140)));
    removed += lost.length;
  }
  console.log(removed ? `\n${removed} text run(s) missing. Review each one before merging.` : '\nNo existing text was removed.');
  process.exit(removed ? 1 : 0);
}
