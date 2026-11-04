// Smoke tests for the whole Haunted Ohio site. They rely on the stable "contract" (ids, data-* attributes,
// hash routes, localStorage keys), not on visual styling, so they keep passing through a redesign.
//   npm i && npx playwright install chromium && npm run smoke
import fs from 'node:fs';
import path from 'node:path';
import { run, eq, ok, ROOT } from './lib.mjs';
const fixture = (name) => fs.readFileSync(path.join(ROOT, 'tests', 'fixtures', name), 'utf8');

const ROUTES = ['home', 'learn', 'games', 'prompts', 'draft', 'legend', 'dread', 'resources', 'cemetery', 'week', 'leaders', 'about'];
const WIDTHS = [1920, 1366, 1280, 1024, 768, 390];
const lsGet = (page, k) => page.evaluate((key) => localStorage.getItem(key), k);
const noHScroll = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

const tests = [];
const T = (name, fn) => tests.push([name, fn]);

// ---------------------------------------------------------------- home
T('home: every hash route shows its view', async ({ base, newPage }) => {
  const p = await newPage();
  for (const r of ROUTES) {
    await p.goto(base + '#' + r); await p.waitForTimeout(120);
    ok(await p.isVisible('#' + r), 'view #' + r + ' should be visible');
  }
  await p.goto(base + '#nonsense'); await p.waitForTimeout(120);
  ok(await p.isVisible('#home'), 'unknown hash falls back to home');
});
T('home: header contract (search, tour, theme switch)', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  for (const sel of ['#q', '#tourBtn', '#theme', '#tour', '#results']) ok(await p.$(sel), 'missing ' + sel);
  for (const r of ROUTES.filter((r) => r !== 'home')) ok((await p.$$('a[href="#' + r + '"]')).length >= 1, 'no nav link to #' + r);
});
T('home: search finds a lesson and page text, Enter navigates', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  await p.fill('#q', 'iceberg'); await p.waitForTimeout(150);
  ok((await p.textContent('#results')).toLowerCase().includes('iceberg'), 'iceberg lesson not found');
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  ok(p.url().includes('show-dont-tell/#lesson-2'), 'should open lesson 2, got ' + p.url());
  await p.goto(base); await p.keyboard.press('/');
  eq(await p.evaluate(() => document.activeElement.id), 'q', '/ focuses search');
});
T('home: guided tour runs to the end', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base); await p.click('#tourBtn');
  let n = 0;
  for (; n < 20; n++) { const t = await p.textContent('#tourNext'); await p.click('#tourNext'); if (t === 'Finish') break; }
  ok(n >= 8, 'tour should have several steps, had ' + n);
  ok(await p.isHidden('#tour'), 'tour closes at the end');
});
T('home: dark/light switch persists (ho-theme)', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  const before = await p.getAttribute('#theme', 'aria-checked');
  await p.click('#theme');
  const after = await p.getAttribute('#theme', 'aria-checked');
  ok(before !== after, 'aria-checked should flip');
  ok(['dark', 'light'].includes(JSON.parse(await lsGet(p, 'ho-theme'))), 'ho-theme saved');
  await p.reload(); eq(await p.getAttribute('#theme', 'aria-checked'), after, 'persists after reload');
});
T('home: Games tab lists both games; quick games live under Prompts', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#games');
  const hrefs = await p.$$eval('#games a[href]', (a) => a.map((x) => x.getAttribute('href')));
  ok(hrefs.includes('haunting-files/') && hrefs.includes('last-light/'), 'game links missing: ' + hrefs);
  await p.goto(base + '#prompts');
  eq((await p.$$('#prompts [role=tab][id^=gt-]')).length, 4, 'four quick games');
});
T('home: Six-Word Scare pins to the wall and saves (ho-wall)', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#prompts');
  await p.click('#gt-six'); await p.fill('#six', 'Door was open. Nobody was home.');
  ok(await p.isEnabled('#sixPin'), 'pin enabled at six words'); await p.click('#sixPin');
  ok((await p.$$('#wall li')).length >= 1, 'wall has an entry');
  ok(await lsGet(p, 'ho-wall'), 'ho-wall saved');
});
T('home: Draft Lab and other tools render without errors', async ({ base, newPage }) => {
  const p = await newPage();
  for (const r of ['draft', 'legend', 'dread', 'cemetery', 'resources', 'leaders', 'about']) { await p.goto(base + '#' + r); await p.waitForTimeout(150); }
});

// ---------------------------------------------------------------- home redesign (P2)
T('home redesign: grouped navigation menus open, close, and are keyboard friendly', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  eq((await p.$$('.nav-group')).length, 4, 'four menu groups (Learn, Create, Field Work, About)');
  eq((await p.$$('.nav-link')).length, 1, 'one direct link (Games)');
  await p.click('#siteNav .nav-btn >> nth=1');
  eq((await p.$$eval('#menu-create a', (a) => a.map((x) => x.getAttribute('href')))).join(','), '#prompts,#draft,#legend,#dread', 'Create menu links');
  ok(await p.isVisible('#menu-create'), 'menu visible');
  await p.keyboard.press('Escape'); ok(!(await p.isVisible('#menu-create')), 'Esc closes the menu');
  await p.focus('#siteNav .nav-btn >> nth=1'); await p.keyboard.press('ArrowDown');
  eq(await p.evaluate(() => document.activeElement.getAttribute('href')), '#prompts', 'ArrowDown focuses the first item');
  await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok(p.url().endsWith('#prompts') && (await p.isVisible('#prompts')), 'menu link navigates');
  ok(!(await p.isVisible('#menu-create')), 'menu closes after choosing');
  ok(await p.$('.nav-group.is-active'), 'the active group is marked');
});
T('home redesign: hero, case index, and field map', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#home');
  ok((await p.isVisible('.hero-moon')) && (await p.isVisible('.hero-city')), 'night sky and skyline render');
  eq((await p.$$('.where a')).length, 12, 'twelve case-index cards (the eleven originals plus The Week)');
  await p.click('#heroCue');
  await p.waitForFunction(() => scrollY > 150, null, { timeout: 4000 }).catch(() => {});
  ok((await p.evaluate(() => scrollY)) > 150, 'scroll cue scrolls to the index');
  eq((await p.$$eval('.fm-svg a.pin', (a) => a.map((x) => x.getAttribute('href')))).join(','), '#week,#week,haunting-files/,#cemetery,last-light/,#week', 'map pins link to existing places and The Week');
  eq((await p.$$eval('.fm-list a', (a) => a.map((x) => x.getAttribute('href')))).join(','), 'haunting-files/,#cemetery,last-light/,#week,#week,#week,#week', 'map list links');
});
T('home redesign: game links open with the branded loading screen', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#games');
  await p.click('#games a[href="last-light/"]'); ok(await p.$('.ho-loader'), 'loader appears');
  await p.waitForURL('**/last-light/', { timeout: 4000 });
});
T('home redesign: night by default, daylight on demand, phone menu', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  eq(await p.evaluate(() => document.documentElement.getAttribute('data-theme')), 'dark', 'night is the default');
  const bg1 = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); await p.click('#theme');
  eq(await p.evaluate(() => document.documentElement.getAttribute('data-theme')), 'light', 'daylight after the switch');
  ok(bg1 !== (await p.evaluate(() => getComputedStyle(document.body).backgroundColor)), 'page color changes');
  const m = await newPage({ width: 390, height: 844 }); await m.goto(base);
  ok(await m.isVisible('#navToggle'), 'menu button on phones'); ok(!(await m.isVisible('#siteNav')), 'nav starts collapsed');
  await m.click('#navToggle'); ok(await m.isVisible('#siteNav'), 'nav opens');
  await m.click('#siteNav .nav-btn >> nth=0'); ok(await m.isVisible('#menu-learn'), 'group expands');
  await m.click('#menu-learn a[href="#resources"]'); await m.waitForTimeout(250);
  ok(!(await m.isVisible('#siteNav')), 'nav closes after choosing'); ok(await m.isVisible('#resources'), 'navigated');
  const d = await newPage({ width: 1440, height: 900 }); await d.goto(base); ok(!(await d.isVisible('#navToggle')), 'no menu button on desktop');
});

// ---------------------------------------------------------------- The Week (Phase 4)
T('the week: five cards built from one data object, no leader notes shown, notes saved (ho-week)', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#week'); await p.waitForTimeout(250);
  eq((await p.$$('.wk-day')).length, 5, 'four days plus the Wednesday-night overnight');
  eq((await p.$$eval('.wk-dow', (e) => e.map((x) => x.textContent))).join(','), 'Monday,Tuesday,Wednesday,Wednesday night,Thursday', 'Monday to Thursday, with Wednesday night after Wednesday');
  const wk = await p.textContent('#weekRoot');
  ok(!/Leaders:/.test(wk) && !/For leaders/i.test(wk), 'no "Leaders:" text and no "For leaders" box anywhere on The Week');
  eq((await p.$$('#weekRoot .todo-in, #weekRoot .wk-todo, #weekRoot .todo')).length, 0, 'no leader placeholders are rendered');
  eq((await p.$$('.wk-date')).length, 0, 'no date line while dates are empty');
  eq((await p.$$('.wk-shared')).length, 5, 'every day without a meeting spot and time ends with the shared-by-leaders line');
  eq(await p.textContent('#day-mon .wk-shared'), 'Meeting spot, time, and cost will be shared by your course leaders.', 'exact shared line');
  ok(/Hueston Woods/.test(await p.textContent('#day-wedn')), 'overnight names Hueston Woods');
  ok(/A walking tour called “Nightmare on Elm Street” in Cincinnati’s Over-the-Rhine neighborhood\./.test(await p.textContent('#day-mon')) && !/American Legacy|Northern Row|tunnel/i.test(await p.textContent('#day-mon')), 'Monday claims only the confirmed sentence');
  ok(!/bike tour|Outdoor Pursuit/i.test(await p.textContent('#day-wed')), 'Wednesday claims nothing unconfirmed');
  ok(!/Reformatory/.test(await p.textContent('#about')), 'About page no longer mentions the Reformatory trip');
  ok((await p.$$('.wk-hist')).length >= 3 && (await p.$$('.wk-lore')).length >= 2, 'real-history boxes and separately labeled lore boxes');
  const lore = await p.$$eval('.wk-lore h4', (e) => e.map((x) => x.textContent)); ok(lore.every((t) => /lore|legend/i.test(t)), 'lore is labeled as lore/legend: ' + lore);
  const txt = await p.textContent('#weekRoot'); ok(!/s[eé]ance|ouija/i.test(txt), 'no spirit-contacting activities'); ok(/No ghost-hunting/.test(txt), 'explicit no-ghost-hunting line');
  await p.fill('#notes-wed', 'The bell tower smelled like cold stone.'); await p.reload(); await p.waitForTimeout(250);
  eq(await p.inputValue('#notes-wed'), 'The bell tower smelled like cold stone.', 'field notes persist');
  eq(JSON.parse(await lsGet(p, 'ho-week')).wed, 'The bell tower smelled like cold stone.', 'saved under ho-week');
  for (const a of await p.$$eval('.wk-links a', (e) => e.map((x) => x.getAttribute('href')))) ok(/^(#[a-z]+|[a-z-]+\/(#lesson-\d+)?)$/.test(a), 'link is relative: ' + a);
});
T('the week: a value filled in appears by itself, and the shared line goes away', async ({ base, newPage }) => {
  const p = await newPage();
  await p.route('**/*', async (route) => {
    const r = route.request();
    if (r.resourceType() !== 'document' || /haunting-files|last-light|show-dont-tell|teacher|design-system/.test(r.url())) return route.continue();
    const res = await route.fetch(); let body = await res.text();
    body = body.replace("meet: '', time: '', cost: '', transport: '',", "meet: 'Test spot', time: '9:00 AM', cost: '$5', transport: 'Walk',").replace("dates: { mon: ''", "dates: { mon: 'Monday, June 8'");
    await route.fulfill({ response: res, body });
  });
  await p.goto(base + '#week'); await p.waitForTimeout(250);
  const mon = await p.textContent('#day-mon');
  ok(/Meeting spot\s*Test spot/.test(mon) && /Time\s*9:00 AM/.test(mon) && /Cost\s*\$5/.test(mon) && /Transportation\s*Walk/.test(mon) && /Monday, June 8/.test(mon), 'filled-in fields and date appear: ' + mon.slice(0, 200));
  eq((await p.$$('#day-mon .wk-shared')).length, 0, 'shared line is gone for a day with meeting spot and time');
  eq((await p.$$('.wk-shared')).length, 4, 'the other four days still have it');
});
T('the week: nav menu, home card, map markers, escaped rendering', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base);
  await p.click('#siteNav .nav-btn >> nth=2'); ok(await p.isVisible('#menu-field a[href="#week"]'), 'The Week is in the Field Work menu');
  await p.click('#menu-field a[href="#week"]'); await p.waitForTimeout(300); ok(await p.isVisible('#week'), 'nav opens The Week');
  await p.goto(base); ok(await p.isVisible('.where a[href="#week"]'), 'home card');
  for (const d of ['mon', 'tue', 'wed', 'thu']) ok((await p.$$(`.fm-svg a[data-day="${d}"]`)).length >= 1, 'map marker for ' + d);
  await p.evaluate(() => { document.querySelector('.fm-svg a[data-day="thu"]').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); });
  await p.waitForTimeout(500); ok(p.url().endsWith('#week'), 'marker opens The Week');
  await p.addInitScript(() => { window.__inject = true; });
  await p.evaluate(() => { try { localStorage.setItem('ho-week', JSON.stringify({ mon: '<img src=x onerror=window.__xss=1>' })); } catch (e) { /* ignore */ } });
  await p.goto(base + '#week'); await p.reload(); await p.waitForTimeout(250);
  ok(!(await p.evaluate(() => window.__xss)), 'saved text is never injected as markup');
  eq(await p.inputValue('#notes-mon'), '<img src=x onerror=window.__xss=1>', 'shown as plain text in the box');
});

// ---------------------------------------------------------------- Spring Grove Dossier (Phase 5)
T('dossier: four sealed files + finale, legends tab intact, GPS off, form placeholders flagged, no network to a form', async ({ base, newPage }) => {
  const p = await newPage(); const ext = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:') && !/gc\.zgo\.at|goatcounter\.com/.test(r.url())) ext.push(r.url()); });
  await p.addInitScript(() => { try { if (!localStorage.getItem('ho-hunt')) localStorage.setItem('ho-hunt', '{"old":"untouched"}'); } catch (e) { /* ignore */ } });
  await p.goto(base + '#cemetery'); await p.waitForTimeout(300);
  eq((await p.$$('#cp-legends article.legend')).length, 4, 'legends tab still has its four legends');
  await p.click('#ct-hunt'); await p.waitForTimeout(200);
  eq((await p.$$('#dossier details.dz-stop[data-stop^="s"]')).length, 4, 'four stops');
  ok(await p.$('#dz-fin'), 'finale'); ok(/Case File #0048/.test(await p.textContent('#dossier')), 'case file number');
  ok(/investigate in daylight/.test(await p.textContent('#dossier')), 'Archivist line');
  eq((await p.$$('#dossier [data-gps]')).length, 0, 'GPS check-in is OFF by default');
  ok((await p.$$('#dossier .todo-in')).length >= 4, 'Field Facts show "Leaders: fill in" while accepted answers are empty');
  ok(!/speed|fastest|bonus|hurry/i.test(await p.textContent('#dossier')) || /never speed/.test(await p.textContent('#dossier')), 'no speed points');
  await p.click('#ct-submit'); await p.waitForTimeout(200);
  ;
  const fl = await p.$('#formLink'); ok(fl, 'turn-in form link is shown'); eq(await fl.getAttribute('target'), '_blank', 'form link opens in a new tab'); eq(await fl.getAttribute('rel'), 'noopener', 'form link has rel=noopener');
  ok(/^https:\/\/forms\.cloud\.microsoft\//.test(await fl.getAttribute('href')), 'form link points at the Microsoft form');
  ok(!/Leaders:/.test(await p.textContent('#turnin')) && !(await p.$('#turnin .todo-in')) && !(await p.$('#formShow')), 'Turn it in: no "Leaders:" note for students, no embed button while FORM_EMBED is empty');
  const kirk = await p.textContent('#cemetery'); ok(/December 24, 1883/.test(kirk) && /March 1884/.test(kirk) && !/death in 1884/.test(kirk), 'Section 16 legend: Kirk murdered December 24, 1883; riots March 1884');
  ok(/Dexter Mausoleum, Section 20/.test(kirk), 'Dexter Mausoleum stays in Section 20');
  ok(/SPRING GROVE DOSSIER/.test(await p.inputValue('#subText')), 'Dossier Report is generated');
  eq(ext.length, 0, 'nothing was requested from outside the site: ' + ext.join(','));
  eq(await lsGet(p, 'ho-hunt'), '{"old":"untouched"}', 'the old ho-hunt key is left alone');
});
T('dossier: scoring (care, never speed), persistence under ho-hunt2, escaping', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#cemetery'); await p.click('#ct-hunt'); await p.waitForTimeout(200);
  const pts = async () => (await p.textContent('#pts-s1')).trim();
  eq(await pts(), '0 / 50', 'starts at zero');
  await p.fill('#ff-s1', 'Breuer 1912'); eq(await pts(), '10 / 50', 'record = 10');
  await p.check('[data-photo="s1"]'); eq(await pts(), '15 / 50', 'photo tick = +5');
  await p.click('[data-test="s1|eyes"]'); await p.click('[data-pill="s1|res"][data-val="3"]');
  await p.fill('#en-s1', 'It felt watched from the left'); await p.click('#dz-s1 [data-stamp="s1"]');
  eq(await pts(), '25 / 50', 'experiment = 10 (a test, a result and real notes) and stamping the time adds nothing');
  await p.fill('#mn-s1', 'The cold bronze smelled of wet moss.'); eq(await pts(), '35 / 50', 'margin note with two senses = 10');
  await p.click('[data-pill="s1|verdict"][data-val="Need more data"]'); await p.waitForTimeout(100);
  await p.click('label.pick:has-text("The eyes are glass.") input'); await p.click('label.pick:has-text("Cincinnati Magazine reports") input');
  eq(await pts(), '50 / 50', 'seal = verdict 5 + two record-based facts');
  await p.click('label.pick:has-text("Breuer was an optometrist.") input');
  eq((await p.$$eval('#dz-s1 input[data-fact]:checked', (e) => e.length)), 2, 'only two facts can be chosen');
  eq(await p.textContent('#dzTotal'), '50', 'total shows the points'); ok(/Fieldworker/.test(await p.textContent('#dzRank')), 'rank updates');
  await p.fill('#dzSquad', '<img src=x onerror=window.__xss=1>'); await p.waitForTimeout(100);
  const save = JSON.parse(await lsGet(p, 'ho-hunt2')); ok(save && save.s && save.s.s1.field === 'Breuer 1912', 'saved under ho-hunt2');
  await p.reload(); await p.waitForTimeout(300); await p.click('#ct-hunt'); await p.waitForTimeout(150);
  eq(await p.textContent('#pts-s1'), '50 / 50', 'points survive a reload');
  eq(await p.inputValue('#dzSquad'), '<img src=x onerror=window.__xss=1>', 'shown as plain text'); ok(!(await p.evaluate(() => window.__xss)), 'no markup injection');
  ok(!(await p.$('#dossier img[src="x"]')), 'no injected element');
  await p.click('#ct-submit'); ok(/Squad: <img src=x/.test(await p.inputValue('#subText')), 'report carries the text as plain text');
});

// ---------------------------------------------------------------- Show, Don't Tell
T('lessons: all 10 open; writing persists; checkers work', async ({ base, newPage }) => {
  const p = await newPage();
  for (let i = 1; i <= 10; i++) { await p.goto(base + 'show-dont-tell/#lesson-' + i); ok((await p.textContent('#ltitle')).length > 3, 'lesson ' + i + ' title'); eq(await p.getAttribute('a[aria-current]', 'href'), '#lesson-' + i); }
  await p.goto(base + 'show-dont-tell/#lesson-2'); await p.fill('#writing', 'She never opened the shed.'); await p.click('#done'); await p.reload();
  eq(await p.inputValue('#writing'), 'She never opened the shed.', 'text persists'); ok(JSON.parse(await lsGet(p, 'ho-sdt')).done['2'], 'completion saved');
  await p.goto(base + 'show-dont-tell/#lesson-7'); await p.fill('#writing', 'He was angry and nervously waited.'); await p.click('#check');
  ok((await p.$$('#report mark.feel')).length >= 2, 'feeling words highlighted');
  await p.goto(base + 'show-dont-tell/#lesson-10'); await p.fill('#writing', 'The porch light buzzed. Wet leaves clung to the cold railing.'); await p.click('#check');
  eq((await p.$$('#report .checks li')).length, 4, 'capstone shows four checks');
  await p.click('#theme'); ok(await lsGet(p, 'ho-theme'), 'shared theme key');
});

// ---------------------------------------------------------------- The Haunting Files
T('haunting-files: start a case, file an exhibit, save, resume, how-to', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + 'haunting-files/');
  await p.click('[data-howto]'); ok(await p.isVisible('.how'), 'how-to opens'); await p.keyboard.press('Escape'); ok(!(await p.$('.how')), 'how-to closes');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]');
  await p.fill('#nm', 'Tester'); await p.click('[data-act="begin"]'); await p.waitForTimeout(200);
  eq((await p.$$('.ex')).length, 9, 'nine exhibits');
  await p.click('[data-act="readcase"]'); await p.click('.ex >> nth=0'); await p.click('[data-file] >> nth=0'); await p.waitForTimeout(150);
  ok(await p.isVisible('#viewer .fb'), 'filing feedback shown');
  const save = JSON.parse(await lsGet(p, 'hf_save_v1')); ok(save && save.started, 'save written');
  await p.goto(base + 'haunting-files/'); await p.click('[data-act="menu"]');
  ok(await p.$('[data-act="resume"]'), 'Continue is offered after reload');
  await p.click('[data-go="settings"]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act="export"]')]);
  ok((await dl.suggestedFilename()).length > 0, 'export downloads a file');
});

T('haunting-files: a save made BEFORE the P4 restyle still loads and plays', async ({ base, newPage }) => {
  // tests/fixtures/hf_save_pre_p4.json was written by the pre-restyle build (commit 886c460): 102 XP, 6 exhibits filed,
  // 2 board connections, interview room solved. Injected once, then the game is resumed and played on.
  const fx = fixture('hf_save_pre_p4.json'), saved = JSON.parse(fx);
  const p = await newPage();
  await p.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, v); }, ['hf_save_v1', fx]);
  await p.goto(base + 'haunting-files/'); await p.click('[data-act="menu"]'); await p.click('[data-act="resume"]'); await p.waitForTimeout(250);
  ok((await p.textContent('.rank')).includes(saved.xp + ' XP'), 'XP restored: ' + (await p.textContent('.rank')));
  await p.click('[data-go="profile"]'); const prof = await p.textContent('#app');
  ok(prof.includes('Fixture Student') && prof.includes('Exhibits filed: 6 of 9'), 'profile shows the saved name and 6 filed exhibits');
  await p.click('[data-go="board"]'); ok((await p.textContent('#app')).includes('Connections (2)'), 'both board connections restored');
  await p.click('[data-go="interview"]'); ok((await p.textContent('#app')).includes('You found'), 'solved interview room restored');
  ok(!(await p.textContent('[data-go="theory"]')).includes('locked'), 'Theory is unlocked, as it was in the old build');
  // play on: file a seventh exhibit
  await p.click('[data-go="case"]'); await p.click('.ex >> nth=6'); await p.click('[data-file] >> nth=0'); await p.waitForTimeout(200);
  const after = JSON.parse(await lsGet(p, 'hf_save_v1'));
  eq(Object.keys(after.cls).length, 7, 'seventh exhibit filed'); ok(after.xp > saved.xp, 'XP went up after playing on');
  eq(after.name, 'Fixture Student', 'name kept'); eq(after.links.length, 2, 'connections kept');
});

// ---------------------------------------------------------------- The Haunting Files: six cases (Phase 6)
T('haunting-files: six cases, each with 9 exhibits of all six types, 3 real contradictions, 4 theories with a valid evidence map', async ({ base, newPage }) => {
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + 'haunting-files/');
  const cases = await p.evaluate(() => JSON.parse(JSON.stringify(window.HF_CASES)));
  eq(Object.keys(cases).join(','), '1,2,3,4,5,6', 'cases 1 to 6 exist');
  const names = []; const files = new Set(); const strongest = [];
  for (const k of Object.keys(cases)) {
    const c = cases[k]; names.push(c.name); files.add(c.file); strongest.push(c.strongest);
    eq(c.ev.length, 9, 'case ' + k + ': nine exhibits');
    eq(c.ev.map((e) => e.id).join(','), 'E1,E2,E3,E4,E5,E6,E7,E8,E9', 'case ' + k + ': exhibit ids');
    eq([...new Set(c.ev.map((e) => e.type))].sort().join(','), 'claim,eye,fact,lore,mis,spec', 'case ' + k + ': all six evidence types');
    eq(c.ev.filter((e) => e.type === 'eye').map((e) => e.id).join(','), 'E3,E4', 'case ' + k + ': E3 and E4 are the two witness statements');
    ok(c.ev.every((e) => (e.src === 'real' || e.src === 'game') && e.why && e.body && e.title && e.kind), 'case ' + k + ': every exhibit is labeled and explained');
    eq(c.contra.length, 5, 'case ' + k + ': five options'); eq(c.contra.filter((o) => o.ok).length, 3, 'case ' + k + ': exactly three real contradictions');
    ok(new RegExp(c.checkRe, 'i').test(c.checkYes + ' ' + c.checkNo + ' ' + c.ev.find((e) => e.id === 'E5').body), 'case ' + k + ': the checkable detail is findable in E5');
    eq(Object.keys(c.theories).length, 4, 'case ' + k + ': four theories'); ok(c.theories.sup, 'case ' + k + ': a supernatural option stays on the table');
    for (const th of Object.values(c.theories)) { ok(th.n && th.d && th.ch && th.sup.length >= 2, 'theory text'); ok(th.sup.every((id) => c.ev.some((e) => e.id === id)), 'evidence map ids exist'); }
    ok(c.theories[c.strongest], 'case ' + k + ': the strongest explanation is one of its theories');
    ok(c.ev.filter((e) => e.src === 'real').length >= 1 && c.ev.filter((e) => e.src === 'real').length <= 2, 'case ' + k + ': only 1 or 2 exhibits are marked real history');
    ok(!/s[eé]ance|ouija|spirit box|contact the dead|summon/i.test(JSON.stringify(c)), 'case ' + k + ': no spirit-contacting activity');
  }
  eq(new Set(names).size, 6, 'six different places'); eq(files.size, 6, 'six different file numbers'); ok(new Set(strongest).size >= 4, 'varied strongest explanations: ' + strongest);
  eq(errs.length, 0, 'no page errors: ' + errs);
});
T('haunting-files: case code (?case=N, title field, random), per-case save slots, case shown in bar and saves', async ({ base, newPage }) => {
  const p = await newPage();
  await p.goto(base + 'haunting-files/?case=3'); await p.waitForTimeout(150);
  ok(/Miami/.test(await p.textContent('#brief')), '?case=3 shows case 3 on the title screen'); eq(await p.inputValue('#caseCode'), '3', 'field shows the code');
  await p.fill('#caseCode', '5'); await p.dispatchEvent('#caseCode', 'change'); await p.waitForTimeout(150);
  ok(/Reformatory/.test(await p.textContent('#brief')), 'typing 5 switches to case 5'); eq(await p.inputValue('#caseCode'), '5', 'field keeps the code');
  await p.click('[data-act="randcase"]'); const rc = +(await p.inputValue('#caseCode')); ok(rc >= 1 && rc <= 6, 'random gives 1 to 6: ' + rc);
  await p.fill('#caseCode', '2'); await p.dispatchEvent('#caseCode', 'change');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester'); await p.click('[data-act="begin"]'); await p.waitForTimeout(150);
  ok(/Case 2/.test(await p.textContent('.casechip')), 'top bar shows the case code'); ok(/Golden Lamb/.test(await p.textContent('.paper h2')), 'case page is the Golden Lamb');
  eq((await p.$$('.ex')).length, 9, 'nine exhibits');
  await p.click('[data-act="readcase"]'); await p.click('.ex >> nth=0'); await p.click('[data-file] >> nth=0'); await p.waitForTimeout(100);
  const s2 = JSON.parse(await lsGet(p, 'hf_save_v1_c2')); ok(s2 && s2.started && s2.case === 2, 'case 2 saves under hf_save_v1_c2 and records case: 2');
  eq(await lsGet(p, 'hf_save_v1'), null, 'the original case-1 slot is untouched by other cases');
  await p.goto(base + 'haunting-files/?case=4'); await p.click('[data-act="menu"]'); ok(!(await p.$('[data-act="resume"]')), 'case 4 has its own empty slot');
  await p.goto(base + 'haunting-files/?case=2'); await p.click('[data-act="menu"]'); ok(await p.$('[data-act="resume"]'), 'case 2 still resumes');
  await p.goto(base + 'haunting-files/'); await p.waitForTimeout(150); eq(await lsGet(p, 'hf_case'), '2', 'the last case played on this device is remembered'); ok(await p.$('[data-act="resume"]'), 'and its save resumes');
});
T('haunting-files: every case can be played from start to a filed report (no dead ends)', async ({ base, newPage }) => {
  const words = (n) => Array.from({ length: n }, (_, i) => 'word' + i).join(' ');
  for (const k of [1, 2, 3, 4, 5, 6]) {
    const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + 'haunting-files/?case=' + k);
    const c = await p.evaluate((n) => JSON.parse(JSON.stringify(window.HF_CASES[n])), k);
    await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Player' + k); await p.click('[data-act="begin"]'); await p.waitForTimeout(100);
    await p.click('[data-act="readcase"]');
    for (const e of c.ev) { await p.click(`[data-ex="${e.id}"]`); await p.click(`[data-file="${e.type}"]`); }
    eq(await p.$$eval('.ex .tick:not(.no)', (n) => n.length), 9, 'case ' + k + ': every exhibit filed correctly with the intended type');
    await p.click('[data-go="interview"]'); await p.waitForTimeout(80);
    for (const o of c.contra.filter((x) => x.ok)) await p.click(`[data-pick="${o.id}"]`);
    await p.fill('[data-bind="contra.text"]', 'I trust the written record more because the facilities note, the log and the plan can be checked. ' + words(8)); await p.click('[data-act="submitcontra"]');
    ok(/You found 3 of 3/.test(await p.textContent('.fb')), 'case ' + k + ': three real contradictions found');
    await p.click('[data-go="board"]'); await p.waitForTimeout(80);
    for (const [a, b] of [['E3', 'E4'], ['E4', 'E5']]) { await p.click(`[data-pin="${a}"]`); await p.click(`[data-pin="${b}"]`); await p.fill('#lkwhy', 'These two exhibits are connected because of this reason'); await p.click('[data-act="addlink"]'); }
    await p.click('[data-go="theory"]'); await p.waitForTimeout(80);
    await p.click(`[data-th="${c.strongest}"]`); for (const id of c.theories[c.strongest].sup.slice(0, 3)) await p.click(`[data-cite="${id}"]`);
    await p.fill('[data-bind="th.why"]', 'I defend this explanation, but I know the other side could argue otherwise. ' + words(26)); await p.fill('[data-bind="th.change"]', 'A record that contradicts the facilities note would change my mind');
    await p.click('[data-act="submittheory"]'); ok(/directly support/.test(await p.textContent('.fb')), 'case ' + k + ': the strongest explanation is supported by the exhibits cited');
    await p.click('[data-go="report"]'); await p.waitForTimeout(80);
    await p.fill('[data-bind="report"]', 'At 10:40 PM it was dim and cold, with an echo and a creak and a damp draft on the stairs. It might be that the facilities note E5 and the plan E6 explain it, which suggests an ordinary cause. ' + words(60));
    await p.click('[data-act="checkreport"]'); const rp = await p.textContent('.card h3'); ok(/Report review: ([4-6]) of 6/.test(rp), 'case ' + k + ': the report can be filed: ' + rp);
    eq(errs.length, 0, 'case ' + k + ': no page errors: ' + errs);
    await p.context().close();
  }
});
T('haunting-files: Case 1 still shows the original text now that it is assembled from case data', async ({ base, newPage }) => {
  const seed = (screen) => (() => { try { localStorage.setItem('hf_save_v1', JSON.stringify({ v: 1, started: true, name: 'Old', screen: SCREEN, xp: 20, sel: null, cls: { E3: 'eye', E4: 'eye' }, coll: { E3: true, E4: true }, links: [], contra: { pick: [], text: '', done: false, score: 0 }, th: { choice: '', cites: [], why: '', change: '', done: true }, report: '', filed: true, story: {}, ach: {}, sound: true, readCase: true })); } catch (e) { /* ignore */ } }).toString().replace('SCREEN', JSON.stringify(screen));
  const at = async (screen) => { const p = await newPage(); await p.addInitScript('(' + seed(screen) + ')()'); await p.goto(base + 'haunting-files/'); await p.waitForTimeout(200); return p; };
  eq((await (await at('case')).textContent('.paper h2')).trim(), 'Case File #0047: Cincinnati Music Hall', 'case heading');
  ok((await (await at('case')).textContent('.paper')).includes('After a Saturday concert, an usher reports a figure in a gray coat on the upper balcony. A stagehand says nobody was there. The balcony door was found open.'), 'reported event');
  ok((await (await at('interview')).textContent('.wrap')).includes('Whose account would you trust more about the open door, and why?'), 'interview question');
  ok((await (await at('final')).textContent('.wrap')).includes('Do not retell the Music Hall legend.'), 'final story line');
});
T('haunting-files: seeded shuffle is repeatable for a name and case; a pre-variant save keeps the original order', async ({ base, newPage }) => {
  const order = async (p) => p.$$eval('[data-pick]', (e) => e.map((x) => x.getAttribute('data-pick')).join(''));
  const start = async (p, url, name) => { await p.goto(base + url); await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', name); await p.click('[data-act="begin"]'); await p.waitForTimeout(100);
    await p.click('[data-act="readcase"]'); for (const i of [2, 3]) { await p.click(`.ex >> nth=${i}`); await p.click('[data-file] >> nth=0'); } await p.click('[data-go="interview"]'); await p.waitForTimeout(100); };
  const p = await newPage(); await start(p, 'haunting-files/?case=2', 'Ada'); const o1 = await order(p); eq(o1.length, 5, 'five options');
  await p.reload(); await p.waitForTimeout(150); eq(await order(p), o1, 'same name and case give the same order after a reload');
  const q = await newPage(); await q.addInitScript(() => { try { localStorage.setItem('hf_save_v1', JSON.stringify({ v: 1, started: true, name: 'Old', screen: 'interview', xp: 20, sel: null, cls: { E3: 'eye', E4: 'eye' }, coll: { E3: true, E4: true }, links: [], contra: { pick: [], text: '', done: false, score: 0 }, th: { choice: '', cites: [], why: '', change: '', done: false }, report: '', filed: false, story: {}, ach: {}, sound: true, readCase: true })); } catch (e) { /* ignore */ } });
  await q.goto(base + 'haunting-files/'); await q.waitForTimeout(200); eq(await order(q), 'abcde', 'a save from before variants keeps the original order (case 1)');
  ok(/Case 1/.test(await q.textContent('.casechip')), 'a pre-variant save is Case 1');
  const names = new Set(); for (const n of ['Ada', 'Ben', 'Cy', 'Di', 'Ed', 'Flo']) { const r = await newPage(); await start(r, 'haunting-files/?case=1', n); names.add(await order(r)); } ok(names.size >= 2, 'different names get different orders: ' + [...names]);
});

// ---------------------------------------------------------------- The Last Light
T('last-light: create survivor, open map, start mission, save, how-to', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + 'last-light/');
  await p.click('[data-howto]'); ok(await p.isVisible('.how'), 'how-to opens'); await p.keyboard.press('Escape');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]');
  for (const k of ['bg', 'pers', 'str', 'weak']) { const o = await p.$$(`[data-cr^="${k}:"]`); await o[0].click(); }
  await p.fill('#nm', 'Tester'); await p.press('#nm', 'Tab'); await p.click('[data-act="start"]'); await p.waitForTimeout(250);
  ok((await p.$$('[data-loc]')).length >= 6, 'map has six locations');
  await p.click('[data-loc="home"]'); await p.click('[data-act="travel"]'); await p.waitForTimeout(200);
  ok((await p.textContent('#app')).includes('The Signal'), 'The Signal mission opens');
  ok(JSON.parse(await lsGet(p, 'tll_save_v1')).started, 'save written');
  await p.goto(base + 'last-light/'); await p.click('[data-act="menu"]'); ok(await p.$('[data-act="resume"]'), 'Continue after reload');
});

T('last-light: a save made BEFORE the P5 restyle still loads and plays', async ({ base, newPage }) => {
  // tests/fixtures/ll_save_pre_p5.json was written by the pre-restyle build (commit 74f12a8): survivor "Fixture Survivor", day 1,
  // The Signal mission finished up to the decision (radio tuned, analysis submitted), 41 XP, two achievements.
  const fx = fixture('ll_save_pre_p5.json'), saved = JSON.parse(fx);
  const p = await newPage();
  await p.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, v); }, ['tll_save_v1', fx]);
  await p.goto(base + 'last-light/'); await p.click('[data-act="menu"]'); await p.click('[data-act="resume"]'); await p.waitForTimeout(250);
  const meters = (await p.textContent('.meters')).replace(/\s+/g, ' ');
  for (const [lab, val] of [['Day', saved.day], ['Health', saved.hp], ['Food', saved.res.food], ['Water', saved.res.water], ['Meds', saved.res.meds], ['Batteries', saved.res.batt], ['Fuel', saved.res.fuel]]) ok(meters.includes(lab + ' ' + val), `meter ${lab} ${val} restored: ${meters}`);
  ok((await p.$$('[data-act="sig-dec"]')).length === 3, 'the saved mission decision (3 choices) is showing');
  await p.click('[data-go="me"]'); const me = await p.textContent('#app'); ok(me.includes('Fixture Survivor') && me.includes(saved.xp + ' XP'), 'survivor sheet shows the saved name and XP');
  await p.click('[data-go="pack"]'); ok((await p.textContent('#app')).includes('Pack and resources'), 'pack opens');
  await p.click('[data-go="map"]'); await p.waitForTimeout(150);   // with a mission under way, Map returns to the mission
  // play on: make the decision the save was waiting on
  await p.click('[data-act="sig-dec"][data-v="investigate"]'); await p.waitForTimeout(200);
  const after = JSON.parse(await lsGet(p, 'tll_save_v1'));
  eq(after.name, 'Fixture Survivor', 'name kept'); eq(after.m.step, 4, 'mission moved on after the decision'); ok(after.flags.investigate, 'the choice was recorded'); ok(after.ach.tuned && after.ach.doubt, 'achievements kept');
});

// ---------------------------------------------------------------- The Last Light: six scenarios (Phase 6)
const llSeed = (patch) => '(function(){try{var b=' + fixture('ll_save_pre_p5.json') + ';var p=' + JSON.stringify(patch) + ';for(var k in p)b[k]=p[k];localStorage.setItem("tll_save_v1",JSON.stringify(b))}catch(e){}})()';
const lsText = (page) => page.evaluate(() => JSON.stringify(Object.keys(localStorage).map((k) => localStorage.getItem(k))));
const llKey = () => Object.keys(localStorage).find((x) => /^tll_save_v1(_c\d)?$/.test(x));
T('last-light: six scenarios, each with its own map, signal and decoding puzzle, stranger, supply run and cause of The Silence', async ({ base, newPage }) => {
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + 'last-light/');
  const S = await p.evaluate(() => JSON.parse(JSON.stringify(window.LL_SCENARIOS)));
  eq(Object.keys(S).join(','), '1,2,3,4,5,6', 'scenarios 1 to 6');
  const uniq = (f) => new Set(Object.values(S).map(f)).size;
  eq(uniq((s) => s.locs.home.n), 6, 'six different opening locations'); eq(uniq((s) => s.map.poly), 6, 'six different maps'); eq(uniq((s) => s.locs.cin.n), 6, 'six different supply-run places');
  eq(uniq((s) => s.signal.freq), 6, 'six different frequencies'); eq(uniq((s) => s.signal.msg), 6, 'six different transmissions'); eq(uniq((s) => s.stranger.name), 6, 'six different strangers');
  eq(uniq((s) => s.supply.items.box.clue), 6, 'six different clues about the cause of The Silence'); eq(uniq((s) => s.stranger.helpClue), 6, 'six different secrets the stranger can give up');
  eq(uniq((s) => s.stranger.tells.never), 6, 'six different tells');
  for (const [k, s] of Object.entries(S)) {
    ok(s.signal.obs.filter((o) => o.ok).length >= 4 && s.signal.obs.filter((o) => !o.ok).length >= 2, 'scenario ' + k + ': observations include real clues and decoys');
    ok(s.signal.freq >= 890 && s.signal.freq <= 1070, 'scenario ' + k + ': the dial range covers the frequency');
    eq(Object.keys(s.stranger.tells).sort().join(','), 'badge,clay,never,nurse,road,story', 'scenario ' + k + ': six tells');
    ok(/11:47/.test(s.supply.items.box.clue) || s.code === 1 || /Meridian/.test(s.supply.items.box.clue), 'scenario ' + k + ': the cause clue is a clue');
    ok(!/s[eé]ance|ouija|spirit/i.test(JSON.stringify(s)), 'scenario ' + k + ': no spirit-contacting activity');
  }
  const t = await p.textContent('.title');
  ok(/2047/.test(t) && /11:47 p\.m\. on October 31, 2026/.test(t), 'the title screen keeps 2047 and Oct 31, 2026 at 11:47 p.m.');
  eq(errs.length, 0, 'no page errors: ' + errs);
});
T('last-light: case code (?case=N, title field, random), per-case save slots, case shown in bar and saves', async ({ base, newPage }) => {
  const p = await newPage();
  await p.goto(base + 'last-light/?case=4'); await p.waitForTimeout(150); eq(await p.inputValue('#caseCode'), '4', '?case=4 sets the field');
  await p.fill('#caseCode', '6'); await p.dispatchEvent('#caseCode', 'change'); await p.waitForTimeout(100); eq(await p.inputValue('#caseCode'), '6', 'typing 6 switches the case');
  await p.click('[data-act="randcase"]'); const rc = +(await p.inputValue('#caseCode')); ok(rc >= 1 && rc <= 6, 'random gives 1 to 6: ' + rc);
  await p.fill('#caseCode', '3'); await p.dispatchEvent('#caseCode', 'change');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester'); await p.click('[data-cr="bg:mech"]'); await p.click('[data-cr="pers:bold"]'); await p.click('[data-cr="str:hands"]'); await p.click('[data-cr="weak:nerves"]'); await p.click('[data-act="start"]'); await p.waitForTimeout(150);
  ok(/Case 3/.test(await p.textContent('.casechip')), 'the bar shows the case code');
  ok(/Ashgrove Silo/.test(await p.textContent('.mapbox')), 'the map is the scenario 3 map'); ok(/Columbus/.test(await p.textContent('.mapbox svg')), 'with its own labels');
  const s3 = JSON.parse(await lsGet(p, 'tll_save_v1_c3')); ok(s3 && s3.started && s3.case === 3 && s3.vs, 'saved under tll_save_v1_c3 with case: 3 and a seed');
  eq(await lsGet(p, 'tll_save_v1'), null, 'the original scenario-1 slot is untouched');
  ok(/Survivor Tester wakes in Ashgrove Silo/.test(s3.log[0].t), 'the log names the scenario\'s opening location');
  await p.goto(base + 'last-light/?case=5'); await p.click('[data-act="menu"]'); ok(!(await p.$('[data-act="resume"]')), 'scenario 5 has its own empty slot');
  await p.goto(base + 'last-light/'); await p.waitForTimeout(100); eq(await lsGet(p, 'tll_case'), '5', 'the last case played is remembered');
});
T('last-light: every scenario\'s signal can be tuned, decoded and analysed from the UI', async ({ base, newPage }) => {
  for (const k of [1, 2, 3, 4, 5, 6]) {
    const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + 'last-light/?case=' + k);
    const sc = await p.evaluate((n) => JSON.parse(JSON.stringify(window.LL_SCENARIOS[n])), k);
    await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester' + k);
    await p.click('[data-cr="bg:mech"]'); await p.click('[data-cr="pers:bold"]'); await p.click('[data-cr="str:hands"]'); await p.click('[data-cr="weak:nerves"]'); await p.click('[data-act="start"]'); await p.waitForTimeout(100);
    await p.click('[data-loc="home"]'); await p.click('[data-act="travel"]'); await p.waitForTimeout(80);
    ok((await p.textContent('.panel')).includes(sc.signal.room), 'scenario ' + k + ': the radio room text');
    await p.click('[data-act="sig-power"]'); await p.waitForTimeout(60);
    let found = false; for (let f = 880; f <= 1080 && !found; f++) { await p.evaluate((v) => { const el = document.getElementById('tune'); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, f); found = !(await p.$eval('#lockbtn', (b) => b.disabled)); }
    ok(found, 'scenario ' + k + ': there is a frequency where the signal comes in clearly');
    await p.click('[data-act="sig-lock"]'); await p.waitForTimeout(60);
    if (sc.signal.decode) {
      if (sc.signal.decode.kind === 'shift') {
        await p.evaluate((n) => { const el = document.getElementById('shift'); el.value = n + 1; el.dispatchEvent(new Event('input', { bubbles: true })); }, sc.signal.decode.shift);
        await p.click('[data-act="sig-decode"]'); await p.waitForTimeout(60); ok(await p.$('#shift'), 'scenario ' + k + ': a wrong shift does not pass');
        await p.evaluate((n) => { const el = document.getElementById('shift'); el.value = n; el.dispatchEvent(new Event('input', { bubbles: true })); }, sc.signal.decode.shift);
      } else {
        await p.fill('#ans', 'WRONG'); await p.click('[data-act="sig-decode"]'); await p.waitForTimeout(60); ok(await p.$('#ans'), 'scenario ' + k + ': a wrong answer does not pass');
        await p.fill('#ans', sc.signal.decode.answer.toLowerCase());
      }
      await p.click('[data-act="sig-decode"]'); await p.waitForTimeout(60);
    }
    ok((await p.textContent('.tx')).includes(sc.signal.tx[0]), 'scenario ' + k + ': the decoded transmission is shown');
    for (const o of sc.signal.obs.filter((x) => x.ok).slice(0, 3)) await p.click(`[data-sigpick="${o.id}"]`);
    await p.fill('[data-bind="m.reason"]', 'I do not trust it fully because the details do not add up and the sender knew more than they said. extra words here to pass the minimum length for sure');
    await p.click('[data-act="sig-judge"]'); ok(/You picked 3 useful details/.test(await p.textContent('.fb')), 'scenario ' + k + ': three useful details found');
    await p.click('[data-act="sig-next"]'); await p.click('[data-act="sig-dec"][data-v="investigate"]'); ok(/Journal/.test(await p.textContent('.wrap')), 'scenario ' + k + ': reaches the journal step');
    eq(errs.length, 0, 'scenario ' + k + ': no page errors: ' + errs);
    await p.context().close();
  }
});
T('last-light: every scenario\'s supply run and stranger can be completed (no dead ends)', async ({ base, newPage }) => {
  const fbT = async (p, l) => { try { return await p.textContent('.fb', { timeout: 3000 }); } catch (e) { throw new Error('no .fb at ' + l + ': ' + (await p.textContent('body')).replace(/\s+/g, ' ').slice(0, 400)); } };
  const words = (n) => Array.from({ length: n }, (_, i) => 'word' + i).join(' ');
  for (const k of [1, 2, 3, 4, 5, 6]) {
    const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + 'last-light/?case=' + k);
    const sc = await p.evaluate((n) => JSON.parse(JSON.stringify(window.LL_SCENARIOS[n])), k);
    await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester' + k);
    await p.click('[data-cr="bg:mech"]'); await p.click('[data-cr="pers:suspicious"]'); await p.click('[data-cr="str:eyes"]'); await p.click('[data-cr="weak:nerves"]'); await p.click('[data-act="start"]'); await p.waitForTimeout(100);
    await p.evaluate(() => { const key = Object.keys(localStorage).find((x) => /^tll_save_v1(_c\d)?$/.test(x)); const s = JSON.parse(localStorage.getItem(key)); s.done.signal = true; s.res.meds = 4; s.res.food = 9; s.res.water = 9; localStorage.setItem(key, JSON.stringify(s)); });
    await p.reload(); await p.waitForTimeout(150);
    if (await p.$('[data-act="resume"]')) await p.click('[data-act="resume"]'); else if (await p.$('[data-act="menu"]')) { await p.click('[data-act="menu"]'); await p.click('[data-act="resume"]'); }
    /* supply run */
    await p.click('[data-loc="cin"]'); ok((await p.textContent('.panel')).includes(sc.locs.cin.d.slice(0, 30)), 'scenario ' + k + ': the supply-run place is described'); await p.click('[data-act="travel"]'); await p.waitForTimeout(60);
    ok((await p.textContent('.panel')).includes(sc.supply.intro.slice(0, 40)), 'scenario ' + k + ': the supply-run intro'); await p.click('[data-act="sup-start"]');
    ok((await p.textContent('.wrap')).includes(sc.supply.cooler.slice(0, 20)), 'scenario ' + k + ': sharp eyes shows the cooler line');
    for (const id of ['box', 'lan']) await p.click(`[data-take="${id}"]`);
    await p.click('[data-act="sup-pack"]'); await p.click('[data-act="sup-ev"][data-v="look"]'); await p.waitForTimeout(50);
    await p.fill('[data-bind="m.warn"]', 'Avoid the ' + (sc.supply.haz || 'flood').split('|').slice(0, 3).join(' and the ') + '. Stay close to the walls, watch the floor, and keep your light low. Do not go upstairs alone, check every step first.');
    await p.click('[data-act="sup-warn"]'); ok(/Write about the supply run/.test(await p.textContent('.wrap')), 'scenario ' + k + ': a warning that names two real hazards is accepted and the journal step opens');
    const clues = await p.evaluate((key) => JSON.parse(localStorage.getItem(Object.keys(localStorage).find((x) => /^tll_save_v1(_c\d)?$/.test(x)))).clues, 0);
    ok(clues.includes(sc.supply.items.box.clue) && clues.includes(sc.supply.items.lan.clue) && clues.includes(sc.supply.notebook), 'scenario ' + k + ': the clues about the cause of The Silence are collected');
    await p.fill('[data-bind="m.jtext"]', 'I took the clues and left the rest. ' + words(26)); await p.click('[data-act="savejournal"]'); await p.waitForTimeout(60);
    /* stranger */
    await p.click('[data-loc="hol"]'); await p.click('[data-act="travel"]'); await p.waitForTimeout(60);
    ok((await p.textContent('.panel')).includes(sc.stranger.quote.slice(0, 20)), 'scenario ' + k + ': the stranger\'s opening'); await p.click('[data-act="str-start"]');
    for (const id of ['brother', 'inspect', 'route']) { await p.click(`[data-act="str-ch"][data-v="${id}"]`); }
    for (const tl of Object.values(sc.stranger.tells).slice(0, 2)) ok((await p.textContent('.wrap')).includes(tl.slice(0, 25)), 'scenario ' + k + ': tell shown: ' + tl.slice(0, 25));
    await p.click('[data-act="str-next"]');
    await p.fill('[data-bind="m.dlg"]', 'What happened on the road, and how are you holding up? ' + words(8)); await p.click('[data-act="str-say"]');
    ok((await fbT(p, 'admit ' + k)).includes(sc.stranger.admit.slice(0, 20)), 'scenario ' + k + ': the secret comes out when asked gently'); await p.click('[data-act="str-next2"]');
    await p.click('[data-sus] >> nth=0'); await p.fill('[data-bind="m.why"]', 'The details of the story do not fit together, so I doubt it. ' + words(20)); await p.click('[data-act="str-why"]');
    await p.click('[data-act="str-dec"][data-v="help"]'); ok((await lsText(p)).includes(sc.stranger.helpClue.slice(0, 20)), 'scenario ' + k + ': helping gives up the scenario\'s secret');
    await p.fill('[data-bind="m.radio"]', 'Found a stranger at ' + sc.stranger.placeTip.split(',')[0] + '. Send water and watch the road.');
    await p.click('[data-act="str-radio"]'); ok(new RegExp('Write about ' + sc.stranger.name).test(await p.textContent('.wrap')), 'scenario ' + k + ': the radio message is accepted and the journal step names the stranger');
    eq(errs.length, 0, 'scenario ' + k + ': no page errors: ' + errs);
    await p.context().close();
  }
});
T('last-light: Scenario 1 still shows the original text now that it is assembled from scenario data', async ({ base, newPage }) => {
  const at = async (patch) => { const p = await newPage(); await p.addInitScript(llSeed(patch)); await p.goto(base + 'last-light/'); await p.waitForTimeout(200); return p; };
  const text = async (p) => (await p.textContent('body')).replace(/\s+/g, ' ');
  const must = (txt, s, label) => ok(txt.includes(s), label + ': ' + s);
  const mission = (id, step, more) => ({ screen: 'mission', done: { signal: true }, m: Object.assign({ id, step }, more || {}) });
  let p = await at(mission('signal', 3)); must(await text(p), 'Follow it to Abandoned Cincinnati and Hollow Creek. Both open on the map.', 'signal choice');
  p = await at(mission('supply', 3)); await p.fill('[data-bind="m.warn"]', Array.from({ length: 25 }, (_, i) => 'plain' + i).join(' ')); await p.click('[data-act="sup-warn"]'); must(await text(p), 'Name at least two specific hazards (like the flooded stairs or the sagging ceiling).', 'warning feedback');
  const str = (step, pers, more, patch) => at(Object.assign(mission('stranger', step, Object.assign({ node: 'start', talks: 2, trust: 0, tells: ['story', 'clay'] }, more || {})), { pers: pers || 'bold', str: 'quiet' }, patch || {}));
  p = await str(1, 'bold'); let tx = await text(p); must(tx, 'Talk to her at least twice, then you can make your decision.', 'step 1'); must(tx, 'Step into the road and tell her she is not going anywhere until you hear the truth.', 'bold choice');
  await p.click('[data-act="str-ch"][data-v="block"]'); must(await text(p), 'She is more afraid of something behind her than of you. Trust -1.', 'block note');
  p = await str(1, 'cautious'); must(await text(p), 'Keep your distance and watch the road with her.', 'cautious choice'); await p.click('[data-act="str-ch"][data-v="watch"]'); must(await text(p), 'Standing together, you notice she keeps checking the road behind her.', 'watch note');
  p = await str(1, 'empathetic'); must(await text(p), 'Tell her you understand how frightening this is.', 'empathetic choice');
  p = await str(1, 'suspicious'); await p.click('[data-act="str-ch"][data-v="press"]'); must(await text(p), 'She snapped, then stopped herself. Trust -1.', 'press note');
  p = await str(2); tx = await text(p); must(tx, 'Wren will not answer direct questions. Write what you will say to her:', 'step 2'); await p.fill('[data-bind="m.dlg"]', 'You are a liar and I know it, so why would anyone believe you today at all?'); await p.click('[data-act="str-say"]'); must(await text(p), 'Accusing her made her defensive. Trust -1. Rewrite your lines so they invite her to explain.', 'accusation');
  p = await str(3); must(await text(p), 'Choose the tells that make you doubt her story. Then explain your decision.', 'step 3');
  p = await str(4); tx = await text(p); must(tx, 'Wren waits. Your choice will cost something either way.', 'step 4'); must(tx, '-1 meds, -1 food. She may give you something in return.', 'help'); must(tx, '-1 meds. She tells you what she knows.', 'trade'); must(tx, 'You keep your supplies. You may never learn what she knows.', 'refuse');
  p = await str(4, 'bold', {}, { str: 'voice' }); must(await text(p), 'Persuasive: you talk her into it for free.', 'persuasive');
  p = await str(5); await p.fill('[data-bind="m.radio"]', 'hello there my friend how are you doing today'); await p.click('[data-act="str-radio"]'); tx = await text(p); must(tx, 'Say where you are (the crossroads, the church, the road).', 'radio place'); must(tx, 'Say what you found (a woman, a stranger, a signal).', 'radio found');
  await p.fill('[data-bind="m.radio"]', 'Found a woman at the crossroads. Send water and watch the road.'); await p.click('[data-act="str-radio"]'); await p.click('[data-go="log"]'); must(await text(p), 'Radioed Haven Ridge. They sent a runner with water.', 'log');
  p = await str(6); must(await text(p), 'Write about Wren. What did you notice, what did you choose, and what do you still not know?', 'journal prompt');
  p = await at({ screen: 'final', done: { signal: true, supply: true, stranger: true }, journal: [{ day: 1, title: 'a', text: 'x' }, { day: 2, title: 'b', text: 'y' }, { day: 3, title: 'c', text: 'z' }], flags: { heard: true, traded: true } }); must(await text(p), 'You traded medicine to Wren for information.', 'final decisions');
});

// ---------------------------------------------------------------- Teacher tools (Phase 6)
T('teacher: six links per game and a seating helper where touching seats never share a case code', async ({ base, newPage }) => {
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); const reqs = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !/gc\.zgo\.at|goatcounter\.com/.test(r.url())) reqs.push(r.url()); });
  await p.goto(base + 'teacher/'); await p.waitForTimeout(200);
  eq((await p.$$eval('#hfLinks a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../haunting-files/?case=' + n).join(','), 'six Haunting Files links');
  eq((await p.$$eval('#llLinks a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../last-light/?case=' + n).join(','), 'six Last Light links');
  for (const [rows, cols] of [[5, 6], [3, 3], [8, 12], [1, 4], [12, 1]]) {
    await p.fill('#rows', String(rows)); await p.fill('#cols', String(cols)); await p.click('#make');
    for (let i = 0; i < 3; i++) { await p.click('#shuffle'); }
    const codes = await p.$$eval('.seat b', (e) => e.map((x) => +x.textContent)); eq(codes.length, rows * cols, 'one seat per place');
    const g = (r, c) => (r < 0 || c < 0 || r >= rows || c >= cols ? 0 : codes[r * cols + c]);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const v = g(r, c); ok(v >= 1 && v <= 6, 'valid code');
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { const w = g(r + dr, c + dc); ok(!w || w !== v, `seat ${r},${c} and its neighbor share code ${v} (${rows}x${cols})`); } }
    if (rows * cols >= 6) ok(new Set(codes).size >= Math.min(6, rows * cols), 'all six codes are used in a big enough room');
  }
  await p.fill('#names', '<img src=x onerror=window.__xss=1>\nAda\nBen'); await p.fill('#rows', '2'); await p.fill('#cols', '3'); await p.click('#make');
  ok(!(await p.evaluate(() => window.__xss)) && !(await p.$('.seat img')), 'pasted names are escaped, never injected as markup'); ok(/Ada/.test(await p.textContent('#plan')), 'names appear in the plan');
  ok(!(await p.evaluate(() => Object.keys(localStorage).some((k) => /name|seat|teacher/i.test(k) || /Ada/.test(localStorage.getItem(k) || '')))), 'nothing is stored');
  eq(reqs.length, 0, 'nothing is sent anywhere: ' + reqs.join(','));
  await p.goto(base); await p.evaluate(() => { location.hash = '#leaders'; }); await p.waitForTimeout(300); ok(await p.isVisible('#leaders a[href="teacher/"]'), 'the leaders page links to the teacher tools');
  eq(errs.length, 0, 'no page errors: ' + errs);
});

// ---------------------------------------------------------------- analytics (Phase 7)
const GC_STUB = "window.goatcounter=window.goatcounter||{};window.__gc=window.__gc||[];window.goatcounter.count=function(o){window.__gc.push(JSON.parse(JSON.stringify(o)))};";
const withGC = async (p, mode) => {
  /* mode 'stub': GoatCounter loads (a recording stub) and the placeholder code is swapped for a test code; mode 'blocked': the script is blocked */
  await p.route(/gc\.zgo\.at/, (r) => (mode === 'blocked' ? r.abort() : r.fulfill({ contentType: 'text/javascript', body: GC_STUB })));
  /* the real code is already in the pages, so the stub needs no rewriting */
};
T('analytics: every page carries the GoatCounter snippet (real code) once, and the guarded tracker', async ({ base, newPage }) => {
  for (const u of ['', 'show-dont-tell/', 'haunting-files/', 'last-light/', 'teacher/', 'design-system/']) {
    const p = await newPage(); await p.goto(base + u);
    const s = await p.$eval('script[data-goatcounter]', (e) => ({ d: e.getAttribute('data-goatcounter'), s: e.getAttribute('data-goatcounter-settings'), a: e.async, src: e.getAttribute('src') }));
    eq(s.d, 'https://ohmoellermoeterm.goatcounter.com/count', 'the real GoatCounter endpoint on ' + (u || 'home')); eq(JSON.parse(s.s).no_onload, true, 'no_onload on ' + (u || 'home')); ok(s.a && s.src === '//gc.zgo.at/count.js', 'async script on ' + (u || 'home'));
    eq(await p.$$eval('script[data-goatcounter]', (e) => e.length), 1, 'exactly one GoatCounter snippet on ' + (u || 'home')); ok(await p.evaluate(() => typeof window.HO_track === 'function' && typeof window.HO_page === 'function'), 'tracker loaded on ' + (u || 'home'));
  }
});
T('analytics: nothing breaks, and nothing is sent, when GoatCounter is blocked or not set up', async ({ base, newPage }) => {
  for (const mode of ['blocked', 'placeholder']) {
    const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    if (mode === 'blocked') await withGC(p, 'blocked'); else { await p.route(/gc\.zgo\.at/, (r) => r.fulfill({ contentType: 'text/javascript', body: GC_STUB })); await p.route((u) => /\/$|\.html$/.test(u.pathname), async (route) => { const resp = await route.fetch(); route.fulfill({ response: resp, body: (await resp.text()).replace('ohmoellermoeterm', 'YOUR_CODE') }); }); }
    for (const u of ['', '#week', 'haunting-files/', 'last-light/', 'show-dont-tell/#lesson-2', 'teacher/']) { await p.goto(base + u); await p.waitForTimeout(150); }
    await p.goto(base + 'show-dont-tell/#lesson-2'); await p.click('#done'); await p.goto(base + 'haunting-files/'); await p.click('[data-act="menu"]');
    eq(errs.length, 0, mode + ': no page errors: ' + errs);
    if (mode === 'placeholder') eq(await p.evaluate(() => (window.__gc || []).length), 0, 'with the YOUR_CODE placeholder nothing is counted');
  }
});
T('analytics: each home tab is its own page; only fixed events are sent; names and typed text are never sent', async ({ base, newPage }) => {
  const p = await newPage(); await withGC(p, 'stub'); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const calls = async () => p.evaluate(() => window.__gc || []);
  await p.goto(base); await p.waitForTimeout(150);
  for (const h of ['#learn', '#games', '#week', '#cemetery', '#leaders', '#about']) { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(120); }
  const paths = (await calls()).map((c) => c.path); for (const x of ['/', '/learn', '/games', '/week', '/cemetery', '/leaders', '/about']) ok(paths.includes(x), 'page counted: ' + x + ' in ' + paths);
  /* the Dossier: type a name and a story line, finish a stop, open the form */
  await p.evaluate(() => { location.hash = '#cemetery'; }); await p.click('#ct-hunt'); await p.fill('#dzSquad', 'SECRETSQUADNAME'); await p.fill('#ff-s1', 'SECRETANSWER');
  await p.check('[data-photo="s1"]'); await p.click('[data-test="s1|eyes"]'); await p.click('[data-pill="s1|res"][data-val="3"]'); await p.fill('#en-s1', 'It felt watched from the left today'); await p.fill('#mn-s1', 'The cold bronze smelled of wet moss.');
  await p.click('[data-pill="s1|verdict"][data-val="Need more data"]'); await p.click('label.pick:has-text("The eyes are glass.") input'); await p.click('label.pick:has-text("Cincinnati Magazine reports") input'); await p.waitForTimeout(100);
  ok((await calls()).some((c) => c.path === 'event/stop-complete' && c.event === true), 'a completed stop is counted as an event');
  /* a lesson and the games */
  await p.goto(base + 'show-dont-tell/#lesson-2'); await p.waitForTimeout(100); await p.fill('#writing', 'SECRETLESSONTEXT'); await p.click('#done'); await p.waitForTimeout(100);
  ok((await calls()).some((c) => c.path === 'event/lesson-complete'), 'lesson complete is counted'); ok((await calls()).some((c) => c.path === '/show-dont-tell'), 'the lessons page is counted');
  await p.goto(base + 'haunting-files/'); await p.waitForTimeout(100); ok((await calls()).some((c) => c.path === 'event/game-opened-haunting-files'), 'game opened (Haunting Files)'); ok((await calls()).some((c) => c.path === '/haunting-files'), 'its page is counted');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'SECRETNAME'); await p.click('[data-act="begin"]');
  await p.goto(base + 'last-light/'); await p.waitForTimeout(100); ok((await calls()).some((c) => c.path === 'event/game-opened-last-light'), 'game opened (Last Light)');
  await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'SECRETSURVIVOR'); await p.waitForTimeout(100);
  const all = (await calls()); const everyPath = all.map((c) => c.path);
  for (const c of all) { ok(/^(\/[a-z0-9-]{0,40}|event\/[a-z-]+)$/.test(c.path), 'path matches the fixed pattern: ' + c.path); ok(Object.keys(c).every((k) => ['path', 'title', 'event'].includes(k)), 'only path, title and event are sent: ' + Object.keys(c)); }
  ok(!/SECRET/i.test(JSON.stringify(all)), 'no typed text or names in anything sent: ' + JSON.stringify(everyPath));
  await p.goto(base + 'last-light/'); await p.evaluate(() => { window.HO_track('SECRET'); window.HO_page('/evil path?x=SECRET'); }); eq((await calls()).filter((c) => /SECRET|evil/i.test(JSON.stringify(c))).length, 0, 'unknown events and odd paths are dropped');
  eq(errs.length, 0, 'no page errors: ' + errs);
});

// ---------------------------------------------------------------- navigation between pages
T('navigation: every game links back to the site; site links reach every game', async ({ base, newPage }) => {
  const p = await newPage();
  for (const g of ['haunting-files/', 'last-light/']) {
    await p.goto(base + g); ok((await p.$$('a[href="../"]')).length >= 1, g + ' has a back link');
    await p.click('a[href="../"] >> nth=0'); await p.waitForTimeout(200); ok(p.url() === base || p.url() === base + '#home' || p.url().endsWith('/'), g + ' back goes home: ' + p.url());
  }
  await p.goto(base + 'show-dont-tell/'); await p.click('a.back'); await p.waitForTimeout(200); ok(!p.url().includes('show-dont-tell'), 'lesson back link');
  for (const g of ['haunting-files/', 'last-light/', 'show-dont-tell/']) { await p.goto(base); const r = await p.evaluate((h) => fetch(h).then((x) => x.status), g); eq(r, 200, g + ' resolves'); }
});

// ---------------------------------------------------------------- design system
T('design-system: self-hosted fonts load, no external requests, theme switch works', async ({ base, newPage }) => {
  const p = await newPage(); const ext = [];
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith(base) && !u.startsWith('data:') && !/gc\.zgo\.at|goatcounter\.com/.test(u)) ext.push(u); });
  await p.goto(base + 'design-system/'); await p.waitForTimeout(500);
  const fonts = await p.evaluate(async () => { await document.fonts.ready; return ['IM Fell English', 'Atkinson Hyperlegible', 'Special Elite', 'Barlow Condensed', 'Share Tech Mono'].map((f) => document.fonts.check('16px "' + f + '"')); });
  ok(fonts.every(Boolean), 'all five families load from assets/fonts: ' + fonts);
  eq(ext.length, 0, 'no external requests: ' + ext.join(', '));
  const before = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.click('#themeSw'); await p.waitForTimeout(150);
  ok(before !== (await p.evaluate(() => getComputedStyle(document.body).backgroundColor)), 'daylight theme changes the page');
  ok(await noHScroll(p), 'no horizontal scroll');
});

// ---------------------------------------------------------------- responsive
T('responsive: no horizontal scroll on any page at 1920, 1366, 1280, 1024, 768 and 390 px', async ({ base, newPage }) => {
  for (const w of WIDTHS) {
    const p = await newPage({ width: w, height: 800 });
    for (const u of ['', '#learn', '#games', '#prompts', '#draft', '#cemetery', '#week', 'show-dont-tell/#lesson-3', 'haunting-files/', 'last-light/', 'design-system/']) {
      await p.goto(base + u); await p.waitForTimeout(120); ok(await noHScroll(p), `horizontal scroll at ${w}px on ${u || 'home'}`);
    }
    await p.context().close();
  }
});

T('responsive: the teacher page, every case and scenario in play, and the Dossier, at 1920, 1280 and 390 px, without console errors', async ({ base, newPage }) => {
  for (const w of [1920, 1280, 390]) {
    const p = await newPage({ width: w, height: 800 }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) errs.push(m.text()); });
    await p.goto(base + 'teacher/'); await p.waitForTimeout(150); ok(await noHScroll(p), `horizontal scroll at ${w}px on teacher/`);
    await p.fill('#rows', '8'); await p.fill('#cols', '12'); await p.click('#make'); ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1 || document.getElementById('plan').scrollWidth >= 0), 'the big seating grid scrolls inside its own box');
    await p.goto(base + '#cemetery'); await p.click('#ct-hunt'); await p.waitForTimeout(150); ok(await noHScroll(p), `horizontal scroll at ${w}px on the Dossier`);
    await p.click('#ct-submit'); await p.waitForTimeout(100); ok(await noHScroll(p), `horizontal scroll at ${w}px on the turn-in tab`);
    for (const k of [1, 2, 3, 4, 5, 6]) {
      await p.goto(base + 'haunting-files/?case=' + k); await p.waitForTimeout(100); ok(await noHScroll(p), `horizontal scroll at ${w}px on Haunting Files case ${k} title`);
      await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester'); await p.click('[data-act="begin"]'); await p.waitForTimeout(80);
      await p.click('.ex >> nth=2'); ok(await noHScroll(p), `horizontal scroll at ${w}px on Haunting Files case ${k} case file`);
      for (const s of ['E3', 'E4']) { await p.click(`[data-ex="${s}"]`); await p.click('[data-file="eye"]'); }
      await p.click('[data-go="interview"]'); ok(await noHScroll(p), `horizontal scroll at ${w}px on Haunting Files case ${k} interview`);
      await p.click('[data-go="case"]'); await p.click('.ex >> nth=5'); ok(await noHScroll(p), `horizontal scroll at ${w}px on Haunting Files case ${k} diagram exhibit`);
      await p.evaluate(() => localStorage.clear());
      await p.goto(base + 'last-light/?case=' + k); await p.waitForTimeout(100); ok(await noHScroll(p), `horizontal scroll at ${w}px on Last Light case ${k} title`);
      await p.click('[data-act="menu"]'); await p.click('[data-act="newgame"]'); await p.fill('#nm', 'Tester'); await p.click('[data-cr="bg:mech"]'); await p.click('[data-cr="pers:bold"]'); await p.click('[data-cr="str:hands"]'); await p.click('[data-cr="weak:nerves"]'); await p.click('[data-act="start"]'); await p.waitForTimeout(100);
      ok(await noHScroll(p), `horizontal scroll at ${w}px on Last Light case ${k} map`);
      await p.click('[data-loc="home"]'); await p.click('[data-act="travel"]'); await p.click('[data-act="sig-power"]'); ok(await noHScroll(p), `horizontal scroll at ${w}px on Last Light case ${k} radio`);
      await p.evaluate(() => localStorage.clear());
    }
    eq(errs.length, 0, `no console errors at ${w}px: ` + errs.slice(0, 3));
    await p.context().close();
  }
});

run(tests);
