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
  // Leaders' decision: Mrs. Hahn joins the leaders, so "three teachers" becomes "four" and she is added to the Instructors line.
  'Meet the three teachers leading Haunted Ohio.',
  'Meet the three teachers running Haunted Ohio.',
  'Mrs. Allen, Mr. Bennett, Mr. Girard',
  'Search pages, games, lessons ( / )', // search-box placeholder written during the redesign (not original course content); now "Search the archive"
  // Leaders' decision: the About page's overnight sentence changed from the Reformatory trip to Wednesday night at Hueston Woods.
  'Students registering for this course must be available for an overnight stay to visit a local haunted site and/or the Ohio State Reformatory in Mansfield, Ohio, the location for the hit movie',
  // Leaders' correction: Kirk was murdered Dec 24, 1883; the Courthouse Riots followed in March 1884 (Spring Grove legends tab).
  'Section 16 is also the resting place of William Kirk, whose death in 1884 sparked the Cincinnati Courthouse Riots. That gives the area real history for a writer to work with.',
  // Leaders' rewrite of the Spring Grove legends tab (four cards) and the field rules box; the new text is supplied word for word.
  'A bronze bust on Breuer’s monument has eyes that seem to follow you. Some retellings say they’re his real eyes, preserved in glass at his request.',
  'A groundskeeper working alone says something grabbed his pant leg.',
  'Sit on the steps and two white dogs (some tellers say wolves) run past. Sometimes they stop and stare, glowing.',
  'Stay on the paths. Respect all memorials. Follow teacher and staff instructions. Carry your phone and clipboard. Do not touch memorials unless you’re explicitly allowed to. Never shine a light at people.',
  'The eyes are glass. Cincinnati Magazine reports that Breuer was a salesman and real estate investor, not the optometrist many retellings claim, so part of the legend has been wrong for a long time.',
  'The mausoleum is a Gothic Revival building from the late 1860s, built for the family of Edmund Dexter, a Cincinnati liquor distributor. Construction stopped in 1869 and it was never finished. Tellers can’t agree on the animals, their number, or the color of their eyes.',
  'This one rests on a single report passed along in local ghost lore. No one has documented it. Your job is to find out what could actually catch an ankle in that spot.',
  'Visitors report hearing voices and seeing figures in this part of the cemetery.',
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
// Phase 6: these three Haunting Files lines are now assembled from case data (Case 1 renders them identically; a smoke test asserts the exact text).
const NOW_ASSEMBLED = ['Case File #0047: Cincinnati Music Hall', 'Use what you learned about evidence, doubt, and atmosphere.', 'Whose account would you trust more about the open door, and why?'];
// Phase 6: these Last Light sentences are now built from the stranger's name and pronouns and the scenario's places. For Scenario 1 they render
// exactly as before; the smoke test "Scenario 1 still shows the original text" asserts every one of them on the live page.
const LL_ASSEMBLED = [
  '1 meds, -1 food. She may give you something in return.', '1 meds. She tells you what she knows.', 'Accusing her made her defensive.', 'Choose the tells that make you doubt her story.',
  'Follow it to Abandoned Cincinnati and Hollow Creek.', 'Keep your distance and watch the road with her.', 'Name at least two specific hazards (like the flooded stairs',
  'Persuasive: you talk her into it for free.', 'Radioed Haven Ridge. They sent a runner with water.', 'Say what you found (a woman, a stranger, a signal).',
  'Say where you are (the crossroads, the church, the road).', 'She is more afraid of something behind her than of you.', 'She snapped, then stopped herself.',
  'Standing together, you notice she keeps checking the road behind her.', 'Step into the road and tell her she is not going anywhere', 'Talk to her at least twice, then you can make your decision.',
  'Tell her you understand how frightening this is.', 'Wren waits. Your choice will cost something either way.', 'Wren will not answer direct questions.',
  'Write about Wren. What did you notice', 'You keep your supplies. You may never learn what she knows.', 'You traded medicine to Wren for information.',
];
const isLLAssembled = (t) => LL_ASSEMBLED.some((p) => t.startsWith(p));
const isAssembled = (t) => NOW_ASSEMBLED.some((p) => t.startsWith(p));
const isRetired = (t) => RETIRED_HUNT.some((p) => t.startsWith(p));
const EXTRA = {
  'haunting-files/index.html': [1, 2, 3, 4, 5, 6].map((n) => `haunting-files/cases/c${n}.js`),
  'last-light/index.html': [1, 2, 3, 4, 5, 6].map((n) => `last-light/scenarios/s${n}.js`).filter((f) => fs.existsSync(path.join(ROOT, f))),
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rarr;/g, '→');
// A "text run" is 6+ words of plain prose with no markup or code punctuation in it.
const RUN = /[A-Za-z0-9][A-Za-z0-9 ,.!?;:—–\-()’“”‘\/&%#$@*…→]{30,}/g;

export function extract(file) {
  let s = fs.readFileSync(path.join(ROOT, file), 'utf8');
  // Data that moved out of a page into its own file (Phase 6: cases and scenarios) still counts as that page's text.
  for (const x of EXTRA[file] || []) s += '\n' + fs.readFileSync(path.join(ROOT, x), 'utf8');
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
    const lost = base[f].filter((t) => !now.has(t) && !joined.includes(t) && !ALLOWED_REMOVALS.has(t) && !(f === 'index.html' && isRetired(t)) && !(f === 'haunting-files/index.html' && isAssembled(t)) && !(f === 'last-light/index.html' && isLLAssembled(t)));
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
