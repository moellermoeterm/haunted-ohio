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

// Text that is allowed to change, with the reason. Keep this list short and honest.
const ALLOWED_REMOVALS = new Set([
  'Search pages, games, lessons ( / )', // search-box placeholder written during the redesign (not original course content); now "Search the archive"
]);
// Phase 5: the old 14-mission Spring Grove hunt and its "Turn it in" tab were replaced by "The Spring Grove Dossier, Case File #0048"
// (Phase 5 spec). These prefixes are the old hunt's instructions and turn-in text only. The legends tab text is unchanged and must still
// match. The old localStorage key `ho-hunt` is left untouched in browsers; the Dossier saves under `ho-hunt2`.
const RETIRED_HUNT = [
  'Add your team name on the hunt page', 'Ask one staff member or volunteer, or read an on-site plaque', 'At each of the four legends, write one sentence',
  'At three isolated spots, each team member privately rates', 'Click again to erase the whole hunt', 'Email my leaders', 'Everything is filled in. Nice work',
  'For each legend, choose your verdict, then plant a story seed', 'Keep your photos and audio on your phone', 'List your team members on the hunt page',
  'My full report was copied to my clipboard', 'One detail you could use in a story', 'When your team is done, check the report below',
  'Who you asked (name and role)', 'You haven’t stamped a finish time yet', 'Your leaders will tell you where to send this',
  'email addresses, comma separated', 'missions are marked complete. Finish the rest',
];
const isRetired = (t) => RETIRED_HUNT.some((p) => t.startsWith(p));
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
    const lost = base[f].filter((t) => !now.has(t) && !joined.includes(t) && !ALLOWED_REMOVALS.has(t) && !(f === 'index.html' && isRetired(t)));
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
