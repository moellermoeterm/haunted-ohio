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
// The teacher page is tested from a plain copy kept in tests/fixtures/ (not the live file), so these tests keep passing
// after the locked page replaces teacher/index.html. The copy is served at teacher/ by the test browser only.
const TEACHER_FIXTURE_PATH = path.join(ROOT, 'tests', 'fixtures', '_teacher-page.html');
const gotoTeacher = async (page, base) => {
  const body = fs.readFileSync(TEACHER_FIXTURE_PATH, 'utf8');
  await page.route((u) => u.href === base + 'teacher/' || u.href === base + 'teacher/index.html', (route) => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }));
  await page.goto(base + 'teacher/');
};

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
  eq((await p.$$('.where a')).length, 14, 'fourteen case-index cards (the twelve originals plus The Veil and Room 214)');
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
  eq((await p.$$('#dossier .todo-in')).length, 0, 'no leader placeholder is rendered in the Dossier while accepted answers are empty');
  ok(!/Leaders:/.test(await p.textContent('#dossier')), 'no "Leaders:" text in the Dossier for students');
  eq(await p.textContent('.fm-list a[data-day="mon"] small'), 'Cincinnati.', 'home map list: Monday reads only "Cincinnati."');
  ok(!/Leaders:/.test(await p.evaluate(() => [...document.querySelectorAll('.fm-list, .fm-svg')].map((e) => e.textContent).join(' '))), 'no "Leaders:" text in the home map or its list');
  ok(!/speed|fastest|bonus|hurry/i.test(await p.textContent('#dossier')) || /never speed/.test(await p.textContent('#dossier')), 'no speed points');
  await p.click('#ct-submit'); await p.waitForTimeout(200);
  ;
  const fl = await p.$('#formLink'); ok(fl, 'turn-in form link is shown'); eq(await fl.getAttribute('target'), '_blank', 'form link opens in a new tab'); eq(await fl.getAttribute('rel'), 'noopener', 'form link has rel=noopener');
  ok(/^https:\/\/forms\.cloud\.microsoft\//.test(await fl.getAttribute('href')), 'form link points at the Microsoft form');
  ok(!/Leaders:/.test(await p.textContent('#turnin')) && !(await p.$('#turnin .todo-in')) && !(await p.$('#formShow')), 'Turn it in: no "Leaders:" note for students, no embed button while FORM_EMBED is empty');
  const kirk = await p.textContent('#cp-legends'); ok(/Christmas Eve 1883/.test(kirk) && /Courthouse Riots of March 1884/.test(kirk) && !/death in 1884/.test(kirk), 'Section 16 legend: Kirk murdered Christmas Eve 1883; riots March 1884');
  ok(/Section 20, Dexter Mausoleum/.test(kirk) && /lists the mausoleum in Section 20/.test(kirk), 'Dexter Mausoleum stays in Section 20');
  eq((await p.$$eval('#cp-legends article.legend', (a) => a.map((x) => [...x.querySelectorAll('dt')].map((d) => d.textContent).join('|')))).filter((v) => v === 'What the legend says (from the sources)|What the record says|Your mission|A writer’s hook').length, 4, 'each legend has the four labeled parts');
  ok(/Stay on the paths\. Respect every memorial\..*Carry your phone, and stay with your squad\./.test(await p.textContent('#cemetery > .note')), 'new field rules box');
  ok(/One more fact worth knowing: the cemetery’s own staff say/.test(kirk), 'closing note about staff and the daylight hunt is kept');
  ok(/SPRING GROVE DOSSIER/.test(await p.inputValue('#subText')), 'Dossier Report is generated');
  eq(ext.length, 0, 'nothing was requested from outside the site: ' + ext.join(','));
  eq(await lsGet(p, 'ho-hunt'), '{"old":"untouched"}', 'the old ho-hunt key is left alone');
});
T('legends tab: two-column grid from 1100px up, one column below, wide reading measure, no overflow', async ({ base, newPage }) => {
  const p = await newPage({ width: 1280, height: 900 });
  await p.goto(base + '#cemetery'); await p.waitForTimeout(250);
  const cols = () => p.$eval('.legends', (e) => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  eq(await cols(), 2, 'two columns at 1280px');
  const tops = await p.$$eval('.legends .legend', (a) => a.map((x) => Math.round(x.getBoundingClientRect().top)));
  ok(tops[0] === tops[1] && tops[2] === tops[3] && tops[2] > tops[0], 'cards sit two per row: ' + tops);
  ok(await noHScroll(p), 'no horizontal scroll at 1280px');
  const intro = await p.$eval('#cemetery .intro', (e) => e.getBoundingClientRect().width); ok(intro > 700, 'intro paragraph uses the wider measure: ' + intro);
  await p.setViewportSize({ width: 1920, height: 900 }); await p.waitForTimeout(100); eq(await cols(), 2, 'two columns at 1920px'); ok(await noHScroll(p), 'no horizontal scroll at 1920px');
  await p.setViewportSize({ width: 1099, height: 900 }); await p.waitForTimeout(100); eq(await cols(), 1, 'one column at 1099px');
  await p.setViewportSize({ width: 390, height: 800 }); await p.waitForTimeout(100); eq(await cols(), 1, 'one column at 390px'); ok(await noHScroll(p), 'no horizontal scroll at 390px');
  ok(await p.$eval('.legends', (e) => e.scrollWidth <= e.clientWidth + 1), 'legend grid does not overflow at 390px');
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

/* ---- Show, Don't Tell: More resources (Character Lab, Character Arcs, Tips, Links) and three bonus challenges ---- */
const SDT = 'show-dont-tell/';
const SDT_TITLES = ['What is Show, Don’t Tell?', 'The Iceberg Theory', 'Atmosphere and Setting', 'Dialogue That Shows', 'Body Language', 'Show Through Action', 'Feeling Words and Adverbs', 'Purple Prose', 'When to Tell Instead', 'Put It All Together'];
const stubClipboard = (p) => p.addInitScript(() => { window.__copied = null; Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: (t) => { window.__copied = t; return Promise.resolve(); } } }); });
const words = (n, w = 'lantern') => Array.from({ length: n }, (_, i) => w + i).join(' ');
const TABS6 = [['steps', 'Step by Step'], ['lab', 'Character Lab'], ['arcs', 'Character Arcs'], ['tips', 'Tips for Ghost Stories'], ['quiz', 'Show or Tell? Quiz'], ['extras', 'Extra Resources']];
const panelOf = (id) => (id === 'steps' ? '#view-lessons' : '#rp-' + id);
T('show-dont-tell: ONE row of six tabs in order (Step by Step is the default); every new hash opens its tab; every old hash redirects; keyboard navigation works', async ({ base, newPage }) => {
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + SDT); await p.waitForTimeout(150);
  eq((await p.$$eval('[role="tablist"]', (e) => e.length)), 1, 'exactly one tablist (no second row)'); eq((await p.$$('#subtabs')).length, 0, 'no sub-tab row');
  eq((await p.$$eval('#toptabs [role="tab"]', (e) => e.map((x) => x.textContent))).join('|'), TABS6.map((x) => x[1]).join('|'), 'six tabs in order'); eq(await p.getAttribute('#toptabs', 'role'), 'tablist', 'tablist role');
  eq(await p.getAttribute('#tab-steps', 'aria-selected'), 'true', 'Step by Step is the default'); ok(await p.isVisible('#pane') && await p.isVisible('#list') && await p.isVisible('#bar'), 'lesson list, pane and progress bar showing'); ok((await p.title()).startsWith('Lesson 1'), 'title is the lesson');
  eq((await p.$$eval('#toptabs [role="tab"][tabindex="0"]', (e) => e.length)), 1, 'one tab stop in the tablist');
  for (const [id, title] of TABS6.slice(1)) {
    await p.goto(base + SDT + '#' + id); await p.waitForTimeout(120); eq(await p.getAttribute('#tab-' + id, 'aria-selected'), 'true', '#' + id + ' selects its tab'); ok(await p.isVisible(panelOf(id)), '#' + id + ' shows its panel'); ok(!(await p.isVisible('#pane')), 'lessons hidden');
    eq((await p.$$eval('#view-resources .respane', (e) => e.filter((x) => !x.hidden).length)), 1, 'only one panel is showing'); ok((await p.title()).includes(title), 'page title names the tab'); eq(await p.getAttribute('#tab-' + id, 'aria-controls'), panelOf(id).slice(1), 'aria-controls');
  }
  for (const [id, title] of [['extras', 'Extra Resources']]) ok((await p.textContent('#rh-' + id)).trim() === title, 'the Links panel is now called Extra Resources');
  await p.goto(base + SDT + '#steps'); await p.waitForTimeout(120); eq(await p.getAttribute('#tab-steps', 'aria-selected'), 'true', '#steps selects Step by Step'); ok(await p.isVisible('#pane'), '#steps shows a lesson');
  for (const n of [1, 5, 10]) { await p.goto(base + SDT + '#lesson-' + n); await p.waitForTimeout(100); eq(await p.getAttribute('#tab-steps', 'aria-selected'), 'true', '#lesson-' + n + ' is in Step by Step'); eq((await p.textContent('.kicker')).trim(), `Lesson ${n} of 10`, 'lesson ' + n); }
  /* every old address lands on the matching tab (and the address bar is updated) */
  for (const [old, now] of [['#resources', 'lab'], ['#resources-lab', 'lab'], ['#resources-arcs', 'arcs'], ['#resources-tips', 'tips'], ['#resources-quiz', 'quiz'], ['#resources-links', 'extras'], ['#lessons', 'steps']]) {
    await p.goto(base + SDT + old); await p.waitForTimeout(150); eq(await p.getAttribute('#tab-' + now, 'aria-selected'), 'true', old + ' goes to ' + now); ok(await p.isVisible(panelOf(now)), old + ' shows the ' + now + ' panel'); ok(!/resources|lessons/.test(await p.evaluate(() => location.hash)), old + ' is replaced in the address bar: ' + await p.evaluate(() => location.hash));
  }
  /* an old address followed from another tab (no reload) also redirects */
  await p.goto(base + SDT + '#tips'); await p.evaluate(() => { location.hash = '#resources-links'; }); await p.waitForTimeout(150); eq(await p.getAttribute('#tab-extras', 'aria-selected'), 'true', 'old hash after load');
  /* keyboard: arrows, Home, End and wrap; Enter and Space open; visible focus */
  await p.goto(base + SDT); await p.focus('#tab-steps'); await p.keyboard.press('ArrowRight'); eq(await p.evaluate(() => document.activeElement.id), 'tab-lab', 'ArrowRight'); await p.keyboard.press('Enter'); await p.waitForTimeout(120); eq(await p.evaluate(() => location.hash), '#lab', 'Enter opens it'); ok(await p.isVisible('#rp-lab'), 'panel shows');
  await p.focus('#tab-lab'); await p.keyboard.press('End'); eq(await p.evaluate(() => document.activeElement.id), 'tab-extras', 'End'); await p.keyboard.press('ArrowRight'); eq(await p.evaluate(() => document.activeElement.id), 'tab-steps', 'wraps to the first'); await p.keyboard.press('ArrowLeft'); eq(await p.evaluate(() => document.activeElement.id), 'tab-extras', 'wraps to the last'); await p.keyboard.press('Home'); eq(await p.evaluate(() => document.activeElement.id), 'tab-steps', 'Home');
  await p.focus('#tab-quiz'); await p.keyboard.press(' '); await p.waitForTimeout(120); eq(await p.evaluate(() => location.hash), '#quiz', 'Space opens it');   await p.focus('#tab-extras'); await p.keyboard.press('ArrowLeft'); ok(await p.evaluate(() => { const c = getComputedStyle(document.activeElement); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2; }), 'a visible focus ring on the focused tab');
  /* back to Step by Step returns to the lesson you were on */
  await p.goto(base + SDT + '#lesson-4'); await p.click('#tab-tips'); await p.waitForTimeout(100); eq(await p.evaluate(() => location.hash), '#tips', 'tab click sets the hash'); await p.click('#tab-steps'); await p.waitForTimeout(100); eq(await p.evaluate(() => location.hash), '#lesson-4', 'back to lesson 4'); eq(errs.length, 0, 'page errors: ' + errs);
});
T('show-dont-tell: the tab row scrolls inside its own box on a narrow screen and the page never scrolls sideways', async ({ base, newPage }) => {
  const p = await newPage({ width: 390, height: 800 }); await p.goto(base + SDT + '#extras'); await p.waitForTimeout(150);
  ok(await noHScroll(p), 'no page-level sideways scroll at 390 px'); const r = await p.$eval('#toptabs', (e) => ({ sw: e.scrollWidth, cw: e.clientWidth, ox: getComputedStyle(e).overflowX, wrap: getComputedStyle(e).flexWrap })); ok(r.sw > r.cw, 'the tab row is wider than the screen: ' + JSON.stringify(r)); ok(r.ox === 'auto' || r.ox === 'scroll', 'and scrolls inside itself'); eq(r.wrap, 'nowrap', 'one row');
  ok(await p.evaluate(() => { const b = document.getElementById('tab-extras').getBoundingClientRect(); return b.right <= window.innerWidth + 1 && b.left >= -1; }), 'the selected last tab is scrolled into view'); await p.click('#tab-steps'); await p.waitForTimeout(100); ok(await noHScroll(p), 'still no page-level scroll');
});
T('show-dont-tell: what you type in a Character Lab card, the Arc check, the tips picker (max 3) and the three bonus boxes persists after a reload; Copy works', async ({ base, newPage }) => {
  const p = await newPage(); await stubClipboard(p); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  /* Character Lab */
  await p.goto(base + SDT + '#lab'); await p.waitForTimeout(150); eq((await p.$$('#rp-lab details.cardx')).length, 8, 'eight Character Lab cards');
  eq((await p.$$eval('#rp-lab details.cardx > summary', (e) => e.map((x) => x.textContent))).join('|'), 'Truth or dare|Tough choice|The breaking point|Life timeline|The gossip scene|Tell me about yourself|Show the body|The prompt test', 'card titles');
  await p.click('#lab-truth > summary'); await p.fill('#labt-truth', 'Mara answers five questions about her snack and her fear.'); eq((await p.textContent('#labc-truth')).trim(), '10 words. About 5 minutes of writing.', 'word counter');
  await p.click('#lab-prompt > summary'); await p.fill('#labt-prompt', 'She walks into the cold bell tower.'); ok(await p.isVisible('#lab-prompt a[href="../#prompts"]'), 'the prompt card links to the main site Prompts tab');
  await p.click('[data-labcopy="truth"]'); eq(await p.evaluate(() => window.__copied), 'Mara answers five questions about her snack and her fear.', 'Copy my writing copies the card text');
  /* Arc check */
  await p.goto(base + SDT + '#arcs'); await p.waitForTimeout(120); await p.fill('#arc-goal', 'To keep the lighthouse'); await p.fill('#arc-lie', 'Nobody will help me'); await p.fill('#arc-truth', 'Asking is not weakness'); await p.check('input[name="arc-type"][value="Flat"]');
  eq((await p.textContent('#arc-count')).trim(), '0 of 40 words.', 'scene counter starts at zero'); await p.fill('#arc-scene', words(45)); ok(/Goal met/.test(await p.textContent('#arc-count')), 'scene goal met at 40 words'); ok(/complete/.test(await p.textContent('#arc-status')), 'arc check shows complete');
  /* Tips: pick three, the fourth is refused */
  await p.goto(base + SDT + '#tips'); await p.waitForTimeout(120); eq((await p.$$('#rp-tips [data-tip]')).length, 12, 'twelve tips'); for (const i of [0, 3, 5]) await p.check('#tip-' + i); ok(await p.isDisabled('#tip-1'), 'the fourth pick is disabled'); await p.evaluate(() => { const b = document.getElementById('tip-1'); b.disabled = false; b.click(); }); eq((await p.$$('#rp-tips [data-tip]:checked')).length, 3, 'never more than 3 even if forced');
  ok(/3 of 3 picked/.test(await p.textContent('#tip-sum')), 'summary'); await p.click('#tip-copy'); const tc = await p.evaluate(() => window.__copied); ok(/^My top 3 ghost-story tips:/.test(tc) && tc.includes('Plan a little.') && tc.includes('Control the pace.') && tc.includes('Show most, tell some.') && !tc.includes('Keep your outline close.'), 'Copy my 3: ' + tc);
  /* bonus challenges in lessons 5, 6, 7 */
  const bonus = { 5: 'Say it with your body', 6: 'Open the door five ways', 7: 'Inside the head' };
  for (const n of [5, 6, 7]) { await p.goto(base + SDT + '#lesson-' + n); await p.waitForTimeout(120); eq((await p.textContent('#bonus-h')).trim(), bonus[n], 'bonus title ' + n); await p.fill('#writing', 'lesson ' + n + ' text'); await p.fill('#bonus', words(10 + n, 'b' + n + '_')); }
  eq((await p.textContent('#bonusCount')).trim(), '17 of 50 words.', 'bonus counter (lesson 7 needs 50)'); await p.click('#bonusCopy'); ok((await p.evaluate(() => window.__copied)).startsWith('b7_0 b7_1'), 'bonus Copy my writing');
  /* reload and check everything persisted, and nothing leaked between boxes */
  await p.goto(base + SDT + '#lab'); await p.reload(); await p.waitForTimeout(150); eq(await p.inputValue('#labt-truth'), 'Mara answers five questions about her snack and her fear.', 'lab text persists'); eq(await p.inputValue('#labt-prompt'), 'She walks into the cold bell tower.', 'second lab card persists'); eq(await p.inputValue('#labt-choice'), '', 'untouched cards stay empty');
  await p.goto(base + SDT + '#arcs'); await p.reload(); await p.waitForTimeout(150); eq(await p.inputValue('#arc-goal'), 'To keep the lighthouse', 'goal'); eq(await p.inputValue('#arc-lie'), 'Nobody will help me', 'lie'); eq(await p.inputValue('#arc-truth'), 'Asking is not weakness', 'truth'); ok(await p.isChecked('input[name="arc-type"][value="Flat"]'), 'arc type'); eq((await p.inputValue('#arc-scene')).split(' ').length, 45, 'scene');
  await p.goto(base + SDT + '#tips'); await p.reload(); await p.waitForTimeout(150); eq((await p.$$eval('#rp-tips [data-tip]:checked', (e) => e.map((x) => x.id))).join(), 'tip-0,tip-3,tip-5', 'tips persist');
  for (const n of [5, 6, 7]) { await p.goto(base + SDT + '#lesson-' + n); await p.reload(); await p.waitForTimeout(120); eq((await p.inputValue('#bonus')).split(' ')[0], 'b' + n + '_0', 'bonus ' + n + ' persists'); eq(await p.inputValue('#writing'), 'lesson ' + n + ' text', 'the lesson writing is separate'); }
  const st = JSON.parse(await lsGet(p, 'ho-sdt')); ok(st.res && st.res.lab.truth && st.res.arc.goal === 'To keep the lighthouse' && st.res.tips.length === 3 && st.bonus['5'] && st.bonus['6'] && st.bonus['7'] && st.text['5'] === 'lesson 5 text', 'everything is saved under ho-sdt: ' + Object.keys(st));
  eq(errs.length, 0, 'page errors: ' + errs);
});
T('show-dont-tell: the ten lessons are unchanged (bonus boxes only on 5, 6 and 7) and saves made before this change still load', async ({ base, newPage }) => {
  const OLD = { done: { 1: true, 2: true }, text: { 1: 'OLD ONE', 3: 'OLD THREE', 7: 'He was angry.' }, checks: { 10: [true, false, true, false] } };
  const p = await newPage(); await p.addInitScript((d) => { try { if (!localStorage.getItem('ho-sdt')) localStorage.setItem('ho-sdt', JSON.stringify(d)); } catch (e) { /* ignore */ } }, OLD);
  for (let i = 1; i <= 10; i++) {
    await p.goto(base + SDT + '#lesson-' + i); await p.waitForTimeout(100); eq((await p.textContent('#ltitle')).trim(), SDT_TITLES[i - 1], 'lesson ' + i + ' title'); ok(await p.isVisible('.compare .tell') && await p.isVisible('.compare .show') && await p.isVisible('#writing') && await p.isVisible('#done') && await p.isVisible('#copy'), 'lesson ' + i + ' still has its parts');
    eq((await p.$$('.bonus')).length, [5, 6, 7].includes(i) ? 1 : 0, 'bonus panel only on lessons 5 to 7 (lesson ' + i + ')');
  }
  await p.goto(base + SDT + '#lesson-1'); eq(await p.inputValue('#writing'), 'OLD ONE', 'old text loads'); eq((await p.textContent('#ptext')).trim(), '2 of 10 lessons complete', 'old progress loads'); await p.goto(base + SDT + '#lesson-3'); eq(await p.inputValue('#writing'), 'OLD THREE', 'old text loads (lesson 3)');
  await p.goto(base + SDT + '#lesson-10'); eq((await p.$$eval('[data-self]:checked', (e) => e.map((x) => x.getAttribute('data-self')))).join(), '0,2', 'old self-check loads');
  /* using the new areas does not disturb the old keys */
  await p.goto(base + SDT + '#lesson-5'); await p.fill('#bonus', 'a new bonus'); await p.goto(base + SDT + '#lab'); await p.click('#lab-body > summary'); await p.fill('#labt-body', 'new lab text');
  const st = JSON.parse(await lsGet(p, 'ho-sdt')); eq(JSON.stringify(st.done), JSON.stringify(OLD.done), 'done unchanged'); eq(JSON.stringify(st.text), JSON.stringify(OLD.text), 'text unchanged'); eq(JSON.stringify(st.checks), JSON.stringify(OLD.checks), 'checks unchanged'); ok(st.bonus['5'] === 'a new bonus' && st.res.lab.body === 'new lab text', 'new keys added beside the old ones');
  /* storage blocked: the page still works from memory */
  const q = await newPage(); await q.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } }); }); const e2 = []; q.on('pageerror', (e) => e2.push(e.message)); await q.goto(base + SDT + '#lab'); await q.click('#lab-truth > summary'); await q.fill('#labt-truth', 'kept in memory'); await q.goto(base + SDT + '#lab'); ok(await q.isVisible('#rp-lab'), 'works with storage blocked'); eq(e2.length, 0, 'no errors: ' + e2);
});
T('show-dont-tell: the new areas have no cost or price wording, the Extra Resources links open safely in new tabs, student text is escaped, and only resources-opened and arc-check-saved are new events (each sent once)', async ({ base, newPage }) => {
  const p = await newPage(); const reqs = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !/gc\.zgo\.at|goatcounter\.com/.test(r.url())) reqs.push(r.url()); });
  await p.goto(base + SDT + '#lesson-5'); await p.evaluate(() => { const o = window.HO_track; window.__ev = []; window.HO_track = (n) => { window.__ev.push(n); o(n); }; });
  const txt = await p.evaluate(() => [document.getElementById('view-resources').textContent, ...[...document.querySelectorAll('.bonus')].map((e) => e.textContent), document.querySelector('.credit > p').textContent.replace(/^[\s\S]*?(These resources follow)/, '$1')].join('\n'));
  const COST = /\$|\bcost(s|ly)?\b|\bpric(e|es|ed|ing)\b|\bdollars?\b|\bfees?\b|\bpay(s|ing|ment|ments)?\b|\bbuy(ing)?\b|\bpurchas\w*|\bsubscri\w*|\bcheap\b|\bexpensive\b|\bdiscount\w*|\bfree\b/i;
  ok(!COST.test(txt), 'cost or price wording found: ' + (txt.match(COST) || [])[0]); ok(!/money/i.test(txt), 'no money wording anywhere in the new areas'); ok(txt.includes('Scrooge in A Christmas Carol lets go of the belief that owning things is what matters most.'), 'the reworded Scrooge sentence');
  ok(/Reedsy's articles and its Show, Don't Tell course\. All wording, examples, and exercises here are our own\. Read the originals at Reedsy\./.test(txt), 'credit box says the new sentence');
  await p.goto(base + SDT + '#extras'); const L = await p.$$eval('#rp-extras a', (a) => a.map((x) => [x.getAttribute('href'), x.textContent, x.getAttribute('target'), x.getAttribute('rel')]));
  eq(JSON.stringify(L.map((x) => [x[0], x[1]])), JSON.stringify([['https://reedsy.com/blog/character-development-exercises/', 'Character development exercises'], ['https://reedsy.com/blog/character-arc/', 'What is a character arc?'], ['https://blog.reedsy.com/writing-tips/', '20 writing tips'], ['https://reedsy.com/blog/character-traits/', 'Character traits'], ['https://reedsy.com/studio/templates/character-profile/', 'Character profile template'], ['https://reedsy.com/blog/guide/how-to-write-dialogue/dialogue-examples/', 'Dialogue examples (Reedsy guide)'], ['https://reedsy.com/blog/', 'The Reedsy blog']]), 'the seven links, in order'); ok(L.every((x) => x[2] === '_blank' && /noopener/.test(x[3])), 'every link opens in a new tab with rel="noopener"'); ok(/You never need to sign up for anything to use this page\. Ask a course leader before creating any account\./.test(await p.textContent('#rp-extras')), 'the no-sign-up line');
  /* student text is escaped, never run */
  await p.goto(base + SDT + '#lab'); await p.click('#lab-truth > summary'); await p.fill('#labt-truth', '<img src=x onerror=window.__xss=1> & <b>bold</b>'); await p.goto(base + SDT + '#arcs'); await p.fill('#arc-goal', '<img src=x onerror=window.__xss=3>'); await p.goto(base + SDT + '#tips'); await p.goto(base + SDT + '#lab'); await p.waitForTimeout(150);
  ok(!(await p.evaluate(() => window.__xss)) && !(await p.$('#rp-lab img, #rp-arcs img')), 'nothing typed ran or became markup'); eq(await p.inputValue('#labt-truth'), '<img src=x onerror=window.__xss=1> & <b>bold</b>', 'shown back literally');
  /* events: wrap again after the navigation reloads the module state */
  const q = await newPage(); await q.goto(base + SDT + '#lesson-2'); await q.evaluate(() => { const o = window.HO_track; window.__ev = []; window.HO_track = (n) => { window.__ev.push(n); o(n); }; });
  await q.click('#tab-lab'); await q.waitForTimeout(100); await q.click('#tab-arcs'); await q.waitForTimeout(100); await q.click('#tab-tips'); await q.click('#tab-steps'); await q.click('#tab-lab'); await q.waitForTimeout(100);
  await q.goto(base + SDT + '#arcs');   await q.fill('#arc-goal', 'g'); await q.fill('#arc-lie', 'l'); await q.fill('#arc-truth', 't'); await q.check('input[name="arc-type"][value="Positive"]'); await q.fill('#arc-scene', words(41)); await q.fill('#arc-scene', words(42));
  const ev = await q.evaluate(() => window.__ev); ok(ev.every((n) => ['lesson-complete', 'resources-opened', 'arc-check-saved'].includes(n)), 'only expected events: ' + ev); eq(ev.filter((n) => n === 'arc-check-saved').length, 1, 'arc-check-saved is sent once'); ok(ev.filter((n) => n === 'resources-opened').length <= 1, 'resources-opened is sent once per visit');
  eq(reqs.length, 0, 'no network requests: ' + reqs);
});
T('show-dont-tell: tips 10 to 12 have their Haunted Ohio move lines, and the credit box is one paragraph with the three Reedsy links', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + SDT + '#tips'); await p.waitForTimeout(120);
  const mv = await p.$$eval('#rp-tips .move', (e) => e.map((x) => x.textContent)); eq(mv.length, 12, 'twelve move lines');
  eq(mv[9], 'Haunted Ohio move: Cut a line that explains too much, and save it in a file for later.', 'tip 10'); eq(mv[10], 'Haunted Ohio move: Ask your reader: where did you first feel uneasy?', 'tip 11'); eq(mv[11], 'Haunted Ohio move: Write one spooky sentence every day.', 'tip 12');
  const ps = await p.$$eval('.credit > p', (e) => e.map((x) => x.textContent)); eq(ps.length, 2, 'credit paragraph plus "Keep learning" line'); ok(/^Credit\./.test(ps[0]) && ps[0].includes('Reedsy\'s articles and its Show, Don\'t Tell course. All wording, examples, and exercises here are our own. Read the originals at Reedsy.') && ps[0].includes('Nothing was copied from Reedsy or from any novel.'), 'one merged credit paragraph');
  eq((await p.$$eval('.credit ul a', (e) => e.map((x) => x.getAttribute('href')))).join(), 'https://reedsy.com/blog/character-quirks/,https://reedsy.com/studio/resources/setting-of-a-story/,https://reedsy.com/blog/guide/theme/', 'three Reedsy links kept');
});
T('analytics: resources-opened and arc-check-saved are counted, and send no names or typed text', async ({ base, newPage }) => {
  const p = await newPage(); await withGC(p, 'stub'); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); const calls = async () => p.evaluate(() => window.__gc || []);
  await p.goto(base + SDT + '#lesson-1'); await p.waitForTimeout(150); await p.click('#tab-lab'); await p.waitForTimeout(150); await p.click('#tab-arcs'); await p.waitForTimeout(100);
  await p.fill('#arc-goal', 'SECRETGOAL'); await p.fill('#arc-lie', 'SECRETLIE'); await p.fill('#arc-truth', 'SECRETTRUTH'); await p.check('input[name="arc-type"][value="Negative"]'); await p.fill('#arc-scene', words(45, 'SECRETSCENE')); await p.click('#tab-lab'); await p.click('#lab-truth > summary'); await p.fill('#labt-truth', 'SECRETLAB'); await p.waitForTimeout(200);
  const all = await calls(); const names = all.map((c) => c.path);
  eq(names.filter((n) => n === 'event/resources-opened').length, 1, 'resources-opened counted once: ' + names); eq(names.filter((n) => n === 'event/arc-check-saved').length, 1, 'arc-check-saved counted once: ' + names);
  ok(all.filter((c) => c.event).every((c) => Object.keys(c).every((k) => ['path', 'title', 'event'].includes(k))), 'only path, title and event are sent'); ok(!/SECRET/i.test(JSON.stringify(all)), 'no typed text in anything sent: ' + JSON.stringify(names)); eq(errs.length, 0, 'no page errors: ' + errs);
});
T('show-dont-tell: no console errors and no horizontal scroll at 1920, 1280 and 390 px on a lesson with a bonus panel and on every tab', async ({ base, newPage }) => {
  for (const w of [1920, 1280, 390]) {
    const p = await newPage({ width: w, height: 900 }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load|gc\.zgo/.test(m.text())) errs.push(m.text()); });
    for (const h of ['#lesson-5', '#lesson-6', '#lesson-7', '#lab', '#arcs', '#tips', '#extras']) { await p.goto(base + SDT + h); await p.waitForTimeout(120); if (h === '#lab') await p.click('#lab-truth > summary'); ok(await noHScroll(p), `horizontal scroll at ${w}px on ${h}`); }
    eq(errs.length, 0, `errors at ${w}px: ${errs.slice(0, 2)}`);
  }
});

/* ---- Show, Don't Tell: extras on lessons 9 and 10, the Show or Tell? quiz, two more links ---- */
const EX9 = ['Three ways to handle a small moment.', 'Time and place in one line.', 'Laying groundwork.'];
T('show-dont-tell: lesson 9 "More on telling" and lesson 10 "Examples in action" are collapsible, hold the given text, and their exercises persist after a reload', async ({ base, newPage }) => {
  const p = await newPage(); await stubClipboard(p); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(base + SDT + '#lesson-9'); await p.waitForTimeout(150);
  ok(await p.isVisible('#extra > summary') && !(await p.isVisible('#extra h4')), 'collapsed at first'); eq((await p.textContent('#extra > summary')).trim(), 'More on telling', 'lesson 9 summary');
  ok((await p.$eval('#extra', (e) => e.compareDocumentPosition(document.querySelector('.nav2')) & Node.DOCUMENT_POSITION_FOLLOWING)) > 0, 'the panel is at the end of the lesson, before Previous/Next');
  await p.click('#extra > summary'); eq((await p.$$eval('#extra .cbody > h4, #extra .cbody > p', (e) => e.map((x) => x.textContent))).slice(0, 6).join('|'), 'Three ways to handle a small moment.|Not every detail deserves a spotlight. Say a night guard loses his flashlight. Unless it matters to the story, you can: tell it as a tiny scene (He found the flashlight three days later, in the freezer.), put it in dialogue (\'Anyone seen my flashlight?\' Dale called.), or just say it (Dale had lost his flashlight.). The less a moment matters, the fewer words it gets.|Time and place in one line.|A church bell striking twelve is a great sensory clue, but sometimes it slows you down. When readers only need to know where and when, say it plainly and move on: By Tuesday night, Eli was back at the Rivergate Hotel.|Laying groundwork.|A short stretch of telling before a scene, like a paragraph of background or a prologue, can set up a world with a lot of history. Ghost stories do this often. Keep it short and make it interesting, like a page from a local history book.', 'the three parts, word for word');
  eq((await p.textContent('#extra .tryit h4')).trim(), 'Try it', 'Try it'); ok((await p.textContent('#extra .tryit')).includes('Pick a boring moment in your story. Write it three ways: a tiny scene, in dialogue, and as one plain sentence. Which fits best?'), 'prompt'); ok(await p.$('label[for="extraText"]'), 'labeled field');
  eq((await p.textContent('#extraCount')).trim(), '0 of 40 words.', 'counter'); await p.fill('#extraText', words(41, 'w')); ok(/Goal met/.test(await p.textContent('#extraCount')), '40 words meets the goal'); await p.click('#extraCopy'); ok((await p.evaluate(() => window.__copied)).startsWith('w0 w1'), 'Copy');
  await p.goto(base + SDT + '#lesson-10'); await p.waitForTimeout(150); eq((await p.textContent('#extra > summary')).trim(), 'Examples in action', 'lesson 10 summary'); ok((await p.$eval('#extra', (e) => e.compareDocumentPosition(document.querySelector('#writing')) & Node.DOCUMENT_POSITION_FOLLOWING)) > 0, 'before the capstone exercise');
  await p.click('#extra > summary'); const ex = await p.$$eval('#extra blockquote', (e) => e.map((x) => x.textContent)); eq(ex.length, 4, 'four examples');
  eq(ex[0], 'Eli ran the questions through his head again: the answers he would give, how he would stand, what he would say if they asked about the missing key. His mouth went dry. He wiped his palms on his jeans and checked the clock above the door. Four minutes.', 'example 1'); eq(ex[1], 'Downstairs the house woke up in pieces: the clunk of a cupboard, the rattle of a lid, the kettle building toward a hiss.', 'example 2'); eq(ex[2], 'The cemetery path was slick with leaves. Crooked stones leaned toward each other like they were trading secrets, and the light was thin and reluctant.', 'example 3'); eq(ex[3], 'The hallway light buzzed on after he pressed the switch twice. Mrs. Kowal had taped a note beside it years ago: Press twice. Don\'t ask. Nobody ever had.', 'example 4');
  eq((await p.$$eval('#extra .wk', (e) => e.map((x) => x.textContent))).join('|'), 'What\'s working: The repeating thoughts and the dry mouth show nerves without the word nervous.|What\'s working: Sound words, called onomatopoeia, let readers hear the scene without a single description of how it looks.|What\'s working: Words like slick, crooked, thin, and reluctant carry the mood, so the narrator never has to say spooky.|What\'s working: The note is a quick bit of telling that gives backstory and creates a mystery in one line.', 'the four notes');
  ok((await p.textContent('#extra .tryit')).includes('Two people meet on a rocky beach after many years apart. Neither speaks at first. Write the scene from one person\'s point of view, using their senses and body language. Then rewrite it from the other person\'s. What does each notice that the other doesn\'t?'), 'Two points of view prompt'); eq((await p.textContent('#extraCount')).trim(), '0 of 60 words.', '60 words'); await p.fill('#extraText', '<img src=x onerror=window.__xss=1> ' + words(30)); eq((await p.$$('#extra img')).length, 0, 'student text is never markup');
  for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) { await p.goto(base + SDT + '#lesson-' + n); await p.waitForTimeout(60); eq((await p.$$('#extra')).length, 0, 'no extra panel on lesson ' + n); }
  await p.goto(base + SDT + '#lesson-9'); await p.reload(); await p.waitForTimeout(150); eq((await p.inputValue('#extraText')).split(' ')[0], 'w0', 'lesson 9 exercise persists'); await p.goto(base + SDT + '#lesson-10'); await p.reload(); await p.waitForTimeout(150); ok((await p.inputValue('#extraText')).startsWith('<img src=x'), 'lesson 10 exercise persists'); ok(!(await p.evaluate(() => window.__xss)), 'nothing ran');
  const st = JSON.parse(await lsGet(p, 'ho-sdt')); ok(st.extra['9'] && st.extra['10'] && !('writing' in st), 'saved under ho-sdt.extra: ' + Object.keys(st)); eq(errs.length, 0, 'page errors: ' + errs);
});
/* ---- quiz: data is read from the page source so the answer-cue rules are tested on every question of every set ---- */
const quizData = async (base) => { const src = await (await fetch(base + SDT)).text(); const a = src.indexOf('/*QUIZ-DATA-START*/'), b = src.indexOf('/*QUIZ-DATA-END*/'); return new Function(src.slice(a, b).replace('/*QUIZ-DATA-START*/', '') + '\nreturn QUIZSETS;')(); };
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const seeded = (p, seed) => p.addInitScript((sd) => { let a = sd; Math.random = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, seed);
const CUEWORDS = /\b(very|extremely|really|so|angrily|sadly|nervously|sad|scared|terrified|anxious|angry)\b/i;
T('quiz answer cues: in every set the two options are close in length, the correct one is neither mostly the longer nor mostly the shorter, and few wrong answers carry an intensifier or feeling word', async ({ base }) => {
  const sets = await quizData(base); eq(sets.length, 5, 'five sets'); const PROMPTS = ['Which line shows?', 'Which handles a boring stretch better?', 'Which opening starts the scene at a better moment?', 'Which line is fine as plain telling because readers only need the time and place?'];
  sets.forEach((set, si) => {
    eq(set.length, 8, `set ${si + 1} has eight questions`); let longer = 0, shorter = 0, cue = 0;
    set.forEach((x, qi) => {
      ok(x.w && x.r && x.f && x.q, `set ${si + 1} q${qi + 1} has a question, two options and feedback`); ok(x.w !== x.r, 'two different options');
      const hi = Math.max(x.w.length, x.r.length), lo = Math.min(x.w.length, x.r.length); ok((hi - lo) / lo <= 0.25, `set ${si + 1} q${qi + 1}: options differ by more than 25% (${x.w.length} vs ${x.r.length})`);
      if (x.r.length > x.w.length) longer++; else if (x.r.length < x.w.length) shorter++; if (CUEWORDS.test(x.w)) cue++;
      ok(PROMPTS.includes(x.q), 'prompt wording'); eq(x.q, qi < 5 ? PROMPTS[0] : PROMPTS[qi - 4], `set ${si + 1} q${qi + 1} prompt`);
    });
    ok(longer <= 5, `set ${si + 1}: the correct option is the longer in ${longer} of 8`); ok(shorter <= 5, `set ${si + 1}: the correct option is the shorter in ${shorter} of 8`); ok(cue <= 4, `set ${si + 1}: ${cue} of 8 wrong answers carry an intensifier or feeling word`);
  });
  /* the correct answer is not given away by position either: with a fixed seed, over many plays, it lands first about half the time */
  const rnd = mulberry32(12345); let first = 0, n = 4000; for (let i = 0; i < n; i++) if (rnd() < 0.5) first++; ok(first > n * 0.45 && first < n * 0.55, 'the seeded generator is balanced');
});
T('show-dont-tell: the quiz has five sets of eight, ?set=N works, questions and answers shuffle every play, instant feedback, the right message for each score band, Play again, Try another set, and a best score saved per set', async ({ base, newPage }) => {
  const sets = await quizData(base); const p = await newPage(); await seeded(p, 777); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const rightOf = (qText, prompt) => { for (const s of sets) for (const x of s) if (x.q === prompt && (x.w === qText || x.r === qText)) return x.r; return null; };
  const play = async (nRight) => { const asked = []; for (let i = 0; i < 8; i++) { const prog = (await p.textContent('#quiz-prog')).trim(); ok(new RegExp(`^Set \\d, question ${i + 1} of 8$`).test(prog), 'progress: ' + prog); const prompt = (await p.textContent('#quiz-q')).trim(); const opts = await p.$$eval('.quizopt', (e) => e.map((x) => x.textContent)); eq(opts.length, 2, 'two answers'); const right = rightOf(opts[0], prompt); ok(right && opts.includes(right), 'a known question: ' + opts[0]); asked.push(prompt + '|' + right); const want = i < nRight ? right : opts.find((o) => o !== right); await p.click(`.quizopt:text-is(${JSON.stringify(want)})`); const x = sets.flat().find((y) => y.r === right); const fb = (await p.textContent('#quiz-fb')).trim(); eq(fb, (i < nRight ? 'Correct! ' : 'Not quite. ') + x.f, 'feedback'); ok(await p.$$eval('.quizopt', (e) => e.every((y) => y.disabled)), 'answers lock'); eq(await p.evaluate(() => document.activeElement.id), 'quiz-next', 'focus moves to Next'); await p.keyboard.press('Enter'); await p.waitForTimeout(30); } return asked; };
  await p.goto(base + SDT + '#quiz'); await p.waitForTimeout(150); eq((await p.$$('#quiz-sets button')).length, 6, 'five sets plus Surprise me'); eq((await p.$$eval('#quiz-sets button', (e) => e.map((x) => x.textContent))).join('|'), 'Set 1|Set 2|Set 3|Set 4|Set 5|Surprise me', 'the Choose a set row'); ok(await p.$('#quiz-choose-l'), 'row is labelled'); ok((await p.$$('.quizopt')).length === 0, 'nothing starts until a set is chosen'); ok(/Set 1: not played yet/.test(await p.textContent('#quiz-best')), 'no best scores yet'); ok((await p.$$('input[type="radio"]', { strict: false })).filter(() => false).length === 0, 'no radio buttons');
  ok((await p.$$('#rp-quiz input[type="radio"]')).length === 0, 'answers are buttons, not radio buttons');
  /* every set loads with eight questions drawn from that set only */
  for (let n = 1; n <= 5; n++) { await p.click(`#quiz-sets [data-set="${n}"]`); await p.waitForTimeout(40); eq(await p.getAttribute(`#quiz-sets [data-set="${n}"]`, 'aria-pressed'), 'true', 'set ' + n + ' is pressed'); const asked = await play(8); eq(new Set(asked).size, 8, 'eight different questions'); const mine = new Set(sets[n - 1].map((x) => x.q + '|' + x.r)); ok(asked.every((a) => mine.has(a)), 'set ' + n + ' only asks its own questions'); eq((await p.textContent('#quiz-score')).trim(), '8 of 8', 'set ' + n + ' perfect'); eq((await p.textContent('#quiz-msg')).trim(), 'Sharp eyes. You think like a writer.', '8 of 8 message'); ok(new RegExp(`Set ${n}: 8 of 8`).test(await p.textContent('#quiz-best')), 'best saved for set ' + n); }
  eq(JSON.stringify(JSON.parse(await lsGet(p, 'ho-sdt')).quizBest), JSON.stringify({ 1: 8, 2: 8, 3: 8, 4: 8, 5: 8 }), 'quizBest holds one score per set');
  /* score bands, and a lower score never replaces the best */
  await p.click('#quiz-sets [data-set="2"]'); await play(5); eq((await p.textContent('#quiz-msg')).trim(), 'Solid. Play again for a perfect run.', '5 of 8'); await p.click('#quiz-again'); await p.waitForTimeout(40); await play(7); eq((await p.textContent('#quiz-msg')).trim(), 'Solid. Play again for a perfect run.', '7 of 8'); await p.click('#quiz-again'); await p.waitForTimeout(40); await play(4); eq((await p.textContent('#quiz-msg')).trim(), 'Good start. Reread lessons 1 to 3.', '4 of 8'); await p.click('#quiz-again'); await p.waitForTimeout(40); await play(0); eq((await p.textContent('#quiz-score')).trim(), '0 of 8', '0'); eq((await p.textContent('#quiz-msg')).trim(), 'Good start. Reread lessons 1 to 3.', '0 of 8');
  ok(/Set 2: 8 of 8/.test(await p.textContent('#quiz-best')), 'lower scores do not replace the best');
  /* Try another set returns to the chooser; the best persists after a reload */
  await p.click('#quiz-other'); await p.waitForTimeout(40); ok((await p.$$('.quizopt')).length === 0 && await p.evaluate(() => document.activeElement.getAttribute('data-set') === '1'), 'Try another set goes back to the row of sets'); await p.reload(); await p.waitForTimeout(150); ok(/Set 1: 8 of 8\. Set 2: 8 of 8/.test(await p.textContent('#quiz-best')), 'best scores persist after a reload');
  /* ?set=N starts that set; a bad value does not */
  for (let n = 1; n <= 5; n++) { await p.goto(base + SDT + '?set=' + n + '#quiz'); await p.waitForTimeout(120); ok(new RegExp(`^Set ${n}, question 1 of 8$`).test((await p.textContent('#quiz-prog')).trim()), '?set=' + n + ' starts set ' + n); }
  for (const bad of ['?set=0', '?set=6', '?set=x', '?set=']) { await p.goto(base + SDT + bad + '#quiz'); await p.waitForTimeout(100); eq((await p.$$('.quizopt')).length, 0, bad + ' does not start a set'); }
  /* Surprise me picks a real set */
  await p.goto(base + SDT + '#quiz'); await p.click('#quiz-sets [data-set="0"]'); await p.waitForTimeout(60); ok(/^Set [1-5], question 1 of 8$/.test((await p.textContent('#quiz-prog')).trim()), 'Surprise me starts a set');
  eq(errs.length, 0, 'page errors: ' + errs);
});
T('show-dont-tell: questions and answers shuffle on every play (seeded, repeatable), and the old best score is kept', async ({ base, newPage }) => {
  const orders = new Set(), firsts = new Set(), plays = [];
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) { const p = await newPage(); await seeded(p, seed); await p.goto(base + SDT + '?set=1#quiz'); await p.waitForTimeout(100); const qs = []; for (let i = 0; i < 8; i++) { qs.push((await p.textContent('#quiz-q')).trim() + '/' + (await p.$$eval('.quizopt', (e) => e.map((x) => x.textContent.length > 54 ? 'L' : 'S').join('')))); await p.click('.quizopt >> nth=0'); await p.click('#quiz-next'); } plays.push(qs.join(',')); orders.add(qs.map((x) => x.split('/')[0]).join('|')); firsts.add(qs[0]); await p.close(); }
  ok(orders.size >= 4, 'the order of questions varies across plays: ' + orders.size); ok(firsts.size >= 3, 'the first question and option order vary');
  const p2 = await newPage(); await seeded(p2, 42); const a = []; await p2.goto(base + SDT + '?set=3#quiz'); await p2.waitForTimeout(100); a.push((await p2.textContent('#quiz-q')).trim() + (await p2.$$eval('.quizopt', (e) => e.map((x) => x.textContent).join('|')))); const p3 = await newPage(); await seeded(p3, 42); await p3.goto(base + SDT + '?set=3#quiz'); await p3.waitForTimeout(100); a.push((await p3.textContent('#quiz-q')).trim() + (await p3.$$eval('.quizopt', (e) => e.map((x) => x.textContent).join('|')))); eq(a[0], a[1], 'the same seed gives the same quiz (repeatable)');
  /* a best score saved by the earlier one-set quiz is kept, not deleted */
  const q = await newPage(); await q.addInitScript(() => { try { if (!localStorage.getItem('ho-sdt')) localStorage.setItem('ho-sdt', JSON.stringify({ done: {}, text: {}, checks: {}, quiz: { best: 6 } })); } catch (e) { /* ignore */ } }); await q.goto(base + SDT + '#quiz'); await q.waitForTimeout(120); ok(/Earlier quiz best: 6 of 8/.test(await q.textContent('#quiz-best')), 'the old best score is still shown'); await q.goto(base + SDT + '?set=1#quiz'); await q.waitForTimeout(100); for (let i = 0; i < 8; i++) { await q.click('.quizopt >> nth=0'); await q.click('#quiz-next'); } eq(JSON.parse(await lsGet(q, 'ho-sdt')).quiz.best, 6, 'the old quiz.best is untouched'); ok(typeof JSON.parse(await lsGet(q, 'ho-sdt')).quizBest[1] === 'number', 'and the new per-set best is saved beside it');
});
T('show-dont-tell: the Extra Resources tab has the two new links (new tab, noopener) and the adult-readers line; the new events are counted and send nothing typed', async ({ base, newPage }) => {
  const p = await newPage(); await withGC(p, 'stub'); const calls = async () => p.evaluate(() => window.__gc || []);
  await p.goto(base + SDT + '#extras'); await p.waitForTimeout(120);
  const L = await p.$$eval('#rp-extras a', (a) => a.slice(5).map((x) => [x.getAttribute('href'), x.textContent, x.getAttribute('target'), x.getAttribute('rel')])); eq(JSON.stringify(L.map((x) => x.slice(0, 2))), JSON.stringify([['https://reedsy.com/blog/guide/how-to-write-dialogue/dialogue-examples/', 'Dialogue examples (Reedsy guide)'], ['https://reedsy.com/blog/', 'The Reedsy blog']]), 'the two new links'); ok(L.every((x) => x[2] === '_blank' && /noopener/.test(x[3])), 'new tab, rel noopener');
  const note = await p.$eval('#links2-note', (e) => [e.textContent, e.nextElementSibling.querySelectorAll('a').length, e.compareDocumentPosition(document.querySelector('#rp-extras ul:last-of-type a')) & Node.DOCUMENT_POSITION_FOLLOWING]); eq(note[0], 'Some pages on these sites are written for adult readers. Ask a course leader before you browse beyond the page you were sent to.', 'the adult-readers line'); eq(note[1], 2, 'it sits directly above the two links');
  /* events: opening a panel counts once; finishing the quiz counts; nothing typed is sent */
  await p.goto(base + SDT + '#lesson-9'); await p.waitForTimeout(150); await p.click('#extra > summary'); await p.fill('#extraText', 'SECRETEXTRA'); await p.click('#extra > summary'); await p.click('#extra > summary');
  await p.goto(base + SDT + '#quiz'); await p.waitForTimeout(150); await p.click('#quiz-sets [data-set="1"]'); for (let i = 0; i < 8; i++) { await p.click('.quizopt >> nth=0'); await p.click('#quiz-next'); } await p.waitForTimeout(200);
  const names = (await calls()).map((c) => c.path); eq(names.filter((n) => n === 'event/lesson-extra-opened').length, 1, 'lesson-extra-opened counted once for that panel: ' + names); eq(names.filter((n) => n === 'event/quiz-complete').length, 1, 'quiz-complete counted: ' + names); eq(names.filter((n) => n === 'event/quiz-set-chosen').length, 1, 'quiz-set-chosen counted: ' + names); ok(!/SECRET/i.test(JSON.stringify(await calls())), 'nothing typed is sent'); ok((await calls()).every((c) => Object.keys(c).every((k) => ['path', 'title', 'event'].includes(k))), 'only path, title and event');
});
T('leaders page: Mrs. Hahn is listed as a course leader beside the other three, and the counts say four', async ({ base, newPage }) => {
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.goto(base + '#leaders'); await p.waitForTimeout(200);
  eq((await p.$$eval('#leaders .leader h3', (e) => e.map((x) => x.textContent))).join('|'), 'Mr. Girard|Mrs. Allen|Mr. Bennett|Mrs. Hahn', 'four leaders, Mrs. Hahn last'); eq((await p.textContent('#leaders .leader:last-of-type .role')).trim(), 'Course leader', 'her role'); ok(/Meet the four teachers/.test(await p.textContent('#leaders .intro')), 'intro says four'); ok(!(await p.textContent('body')).includes('three teachers'), 'no leftover "three teachers"'); eq(errs.length, 0, 'page errors: ' + errs);
});
T('show-dont-tell: the new areas have no cost wording, old saves load, and nothing overflows at 1920, 1280 and 390 px', async ({ base, newPage }) => {
  const OLD = { done: { 9: true }, text: { 9: 'OLD NINE' }, checks: { 10: [true, true, false, false] }, res: { lab: { truth: 'OLD LAB' }, arc: {}, tips: [1] }, bonus: { 5: 'OLD BONUS' } };
  const q = await newPage(); await q.addInitScript((d) => { try { if (!localStorage.getItem('ho-sdt')) localStorage.setItem('ho-sdt', JSON.stringify(d)); } catch (e) { /* ignore */ } }, OLD);
  await q.goto(base + SDT + '#lesson-9'); eq(await q.inputValue('#writing'), 'OLD NINE', 'old lesson text'); eq(await q.inputValue('#extraText'), '', 'new exercise starts empty'); await q.goto(base + SDT + '#quiz'); ok(/Set 1: not played yet/.test(await q.textContent('#quiz-best')), 'old saves have no per-set score'); await q.goto(base + SDT + '#lesson-5'); eq(await q.inputValue('#bonus'), 'OLD BONUS', 'old bonus box');
  const st = JSON.parse(await lsGet(q, 'ho-sdt')); eq(JSON.stringify(st.text), JSON.stringify(OLD.text), 'old text unchanged'); eq(JSON.stringify(st.res), JSON.stringify(OLD.res), 'old resources unchanged');
  const txt = await q.evaluate(() => document.getElementById('view-resources').textContent + ' ' + [9, 10].map(() => '').join('')); const COST = /\$|\bcost(s|ly)?\b|\bpric(e|es|ed|ing)\b|\bdollars?\b|\bfees?\b|\bpay(s|ing|ment|ments)?\b|\bbuy(ing)?\b|\bpurchas\w*|\bsubscri\w*|\bcheap\b|\bexpensive\b|\bdiscount\w*|\bfree\b|\bmoney\b/i;
  ok(!COST.test(txt), 'cost wording in the resources: ' + (txt.match(COST) || [])[0]); for (const n of [9, 10]) { await q.goto(base + SDT + '#lesson-' + n); const x = await q.$eval('#extra', (e) => e.textContent); ok(!COST.test(x), 'cost wording in lesson ' + n + ' panel: ' + (x.match(COST) || [])[0]); }
  for (const w of [1920, 1280, 390]) {
    const p = await newPage({ width: w, height: 900 }); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load|gc\.zgo/.test(m.text())) errs.push(m.text()); });
    for (const h of ['#lesson-9', '#lesson-10', '#extras', '?set=1#quiz']) { await p.goto(base + SDT + h); await p.waitForTimeout(100); if (h.startsWith('#lesson-')) await p.click('#extra > summary'); ok(await noHScroll(p), `horizontal scroll at ${w}px on ${h}`); }
    await p.click('.quizopt >> nth=0'); ok(await noHScroll(p), `quiz feedback at ${w}px`); eq(errs.length, 0, `errors at ${w}px: ${errs.slice(0, 2)}`);
  }
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
  await gotoTeacher(p, base); await p.waitForTimeout(200);
  eq((await p.$$eval('#hfLinks a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../haunting-files/?case=' + n).join(','), 'six Haunting Files links');
  eq((await p.$$eval('#llLinks a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../last-light/?case=' + n).join(','), 'six Last Light links');
  eq((await p.$$eval('#vlLinks a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../the-veil/?case=' + n).join(','), 'six The Veil links');
  eq((await p.$$eval('#r2Links a.primary', (e) => e.map((x) => x.getAttribute('href')))).join(','), [1, 2, 3, 4, 5, 6].map((n) => '../room-214/?case=' + n).join(','), 'six Room 214 links');
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
  await p.goto(base); await p.evaluate(() => { location.hash = '#leaders'; }); await p.waitForTimeout(300); eq((await p.$$('#leaders a[href*="teacher"]')).length, 0, 'the leaders page no longer links to the teacher tools (it is locked; see docs/leaders/HOW-TO-LOCK.md)');
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
T('new games: The Veil and Room 214 are on the Games tab, open from it, and are counted anonymously (fixed event names only)', async ({ base, newPage }) => {
  const p = await newPage(); await withGC(p, 'stub'); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); const calls = async () => p.evaluate(() => window.__gc || []);
  await p.goto(base + '#games'); await p.waitForTimeout(200); eq((await p.$$('#games .gcard')).length, 4, 'four game cards');
  eq((await p.$$eval('#games .gcard', (a) => a.map((x) => x.getAttribute('href')))).join(','), 'haunting-files/,last-light/,the-veil/,room-214/', 'card links');
  ok(/Game material/.test(await p.textContent('#games .gcard.vl')) && /Game material/.test(await p.textContent('#games .gcard.r2')), 'both are labelled Game material');
  await p.click('#games a[href="the-veil/"]'); await p.waitForURL('**/the-veil/', { timeout: 5000 }); ok(await p.isVisible('#veil-form'), 'The Veil title screen'); await p.waitForTimeout(150);
  ok((await calls()).some((c) => c.path === 'event/game-opened-the-veil'), 'The Veil open is counted'); ok((await calls()).some((c) => c.path === '/the-veil'), 'its page is counted');
  await p.goto(base + 'room-214/'); await p.waitForTimeout(150); ok(await p.isVisible('#r-form'), 'Room 214 title screen'); ok((await calls()).some((c) => c.path === 'event/game-opened-room-214'), 'Room 214 open is counted'); ok((await calls()).some((c) => c.path === '/room-214'), 'its page is counted');
  for (const c of await calls()) { ok(/^(\/[a-z0-9-]{0,40}|event\/[a-z0-9-]+)$/.test(c.path), 'fixed pattern: ' + c.path); ok(Object.keys(c).every((k) => ['path', 'title', 'event'].includes(k)), 'only path, title and event: ' + Object.keys(c)); }
  eq(errs.length, 0, 'page errors: ' + errs);
  /* the Preview badges: one constant (PREVIEW_BADGE in index.html) controls them, so the test follows the constant */
  const badgesOn = /var PREVIEW_BADGE\s*=\s*true/.test(fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'));
  await p.goto(base); await p.waitForTimeout(150);
  ok(await p.isVisible('.where a[href="the-veil/"]') && await p.isVisible('.where a[href="room-214/"]'), 'home cards link to both games');
  if (badgesOn) {
    eq((await p.$$('.pv-badge')).length, 4, 'four badges: two on the home cards, two on the Games tab'); eq(await p.getAttribute('.pv-badge >> nth=0', 'title'), 'Leaders are still testing this game.', 'tooltip');
    ok((await p.$$eval('.where a[data-preview] strong', (e) => e.map((x) => x.textContent)).then((a) => a.every((s) => /Preview$/.test(s)))), 'home cards carry the badge');
    eq((await p.$$('.where a:not([data-preview]) .pv-badge')).length, 0, 'no other card has a badge');
  } else {
    eq((await p.$$('.pv-badge')).length, 0, 'no Preview badges on the home page or the Games tab'); eq((await p.$$('[data-preview][title]')).length, 0, 'no tooltips left on the new game cards');
    ok(!/Preview/.test(await p.textContent('.where')) && !/Preview/.test(await p.textContent('#games')), 'the word Preview is gone from the home cards and the Games tab');
  }
  /* the site search finds both */
  await p.goto(base); await p.fill('#q', 'stealth hotel'); await p.waitForTimeout(250); ok(/Room 214/.test(await p.textContent('#results')), 'search finds Room 214'); await p.fill('#q', 'chapel bell'); await p.waitForTimeout(250); ok(/The Veil/.test(await p.textContent('#results')), 'search finds The Veil');
});
T('no student-visible text anywhere on the site begins with "Leaders:" (all tabs, the Dossier, the turn-in tab, every page)', async ({ base, newPage }) => {
  const p = await newPage(); const hits = [];
  const scan = async (label) => { const r = await p.evaluate(() => { const o = []; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { const par = n.parentElement; if (!par || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(par.tagName)) continue; const t = n.textContent.replace(/\s+/g, ' ').trim(); if (/^Leaders?\s*:/i.test(t) || /\(Leaders?\s*:/i.test(t)) o.push(t.slice(0, 90)); } return o; }); r.forEach((x) => hits.push(label + ' => ' + x)); };
  for (const r of ['', '#learn', '#games', '#prompts', '#draft', '#legend', '#dread', '#resources', '#week', '#leaders', '#about']) { await p.goto(base + r); await p.waitForTimeout(120); await scan(r || 'home'); }
  await p.goto(base + '#cemetery'); await p.waitForTimeout(150); await scan('cemetery/legends'); await p.click('#ct-hunt'); await p.waitForTimeout(150); await p.evaluate(() => document.querySelectorAll('#dossier details').forEach((d) => (d.open = true))); await scan('cemetery/hunt'); await p.click('#ct-submit'); await p.waitForTimeout(120); await scan('cemetery/turn-in');
  for (const u of ['show-dont-tell/', 'haunting-files/', 'last-light/', 'the-veil/', 'room-214/']) { await p.goto(base + u); await p.waitForTimeout(150); await scan(u); }
  eq(hits.length, 0, 'text that starts with "Leaders:" is still visible: ' + hits.slice(0, 3).join(' | '));
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

// ---------------------------------------------------------------- leader page lock (tools/lock.html and the locked page it makes)
// TEST-FIXTURE: every password below is a made-up throwaway that exists only in this test file. None of them is a real password.
const FAKE_LONG = 'fake-test-only-pw-1234';   // TEST-FIXTURE (22 characters)
const FAKE_16 = 'fake-test-pw-016';           // TEST-FIXTURE (16 characters)
const FAKE_15 = 'fake-test-pw-15';            // TEST-FIXTURE (15 characters)
const FAKE_12 = 'fake-test-12';               // TEST-FIXTURE (12 characters)
const FAKE_11 = 'fake-test-1';                // TEST-FIXTURE (11 characters, too short)
const FAKE_WRONG = 'fake-wrong-pw-9999';      // TEST-FIXTURE
const LOCK_MARKER = 'SAMPLE-PLAINTEXT-MARKER-7421';
const LOCK_SAMPLE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sample leader page</title></head><body><h1 id="h">${LOCK_MARKER}</h1><p id="out">not run</p><script>document.getElementById('out').textContent = 'script ran ' + (6 * 7);</script></body></html>`;
const LOCK_WARNING = 'This is easy to guess, so use it only to keep casual visitors out.';
const lockIt = async (newPage, base, html, pass, confirm = pass) => {
  const p = await newPage(); await p.goto(base + 'tools/lock.html'); await p.fill('#page', html); await p.fill('#pw', pass); await p.fill('#pw2', confirm);
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#go')]); const text = fs.readFileSync(await dl.path(), 'utf8'); return { p, text, name: dl.suggestedFilename() };
};
const serveLocked = async (p, base, text) => { await p.route(base + 'teacher/locked-test.html', (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: text })); await p.goto(base + 'teacher/locked-test.html'); await p.waitForTimeout(150); };
const noDownload = async (p) => (await p.waitForEvent('download', { timeout: 1500 }).catch(() => null)) === null;
const storeDump = (p) => p.evaluate(() => JSON.stringify([localStorage, sessionStorage].map((s) => Object.keys(s).map((k) => [k, s.getItem(k)]))) + document.cookie);
T('lock tool: refuses under 12 characters, warns from 12 to 15 but accepts, blocks mismatched confirm fields, shows a strength hint and show/hide, and stores nothing', async ({ base, newPage }) => {
  const p = await newPage(); const reqs = []; p.on('request', (r) => { if (!r.url().startsWith(base)) reqs.push(r.url()); });
  await p.goto(base + 'tools/lock.html'); await p.waitForTimeout(100); eq(await p.getAttribute('meta[name="robots"]', 'content'), 'noindex,nofollow', 'noindex'); eq(await p.getAttribute('#pw', 'type'), 'password', 'password field'); ok(await p.$('label[for="page"]') && await p.$('label[for="pw"]') && await p.$('label[for="pw2"]'), 'labeled fields');
  /* too short: refused, nothing downloaded */
  await p.fill('#page', LOCK_SAMPLE); await p.fill('#pw', FAKE_11); await p.fill('#pw2', FAKE_11); ok(/too short/.test(await p.textContent('#strength')), 'strength hint says too short'); await p.click('#go'); ok(await noDownload(p), 'an 11-character password is refused (no file)'); ok(/at least 12/.test(await p.textContent('#err')) && await p.isVisible('#err'), 'error shown');
  /* mismatch: blocked */
  await p.fill('#pw', FAKE_LONG); await p.fill('#pw2', FAKE_LONG + 'x'); ok(!(await p.isVisible('#warn')), 'no warning for a long password'); await p.click('#go'); ok(await noDownload(p), 'mismatched fields: nothing encrypted'); ok(/do not match/.test(await p.textContent('#err')), 'mismatch error shown');
  /* empty page: blocked */
  await p.fill('#page', ''); await p.fill('#pw2', FAKE_LONG); await p.click('#go'); ok(await noDownload(p), 'no pasted page: nothing encrypted');
  await p.fill('#page', LOCK_SAMPLE);
  /* 12 and 15: warning, but accepted */
  for (const pass of [FAKE_12, FAKE_15]) { await p.fill('#pw', pass); await p.fill('#pw2', pass); ok(await p.isVisible('#warn'), 'warning shown for ' + pass.length + ' characters'); eq((await p.textContent('#warn')).trim(), LOCK_WARNING, 'the exact warning'); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#go')]); eq(dl.suggestedFilename(), 'index.html', 'the file is named index.html'); await p.waitForTimeout(100); eq(await p.inputValue('#pw'), '', 'password field cleared'); eq(await p.inputValue('#pw2'), '', 'confirm field cleared'); }
  /* 16 and over: no warning */
  await p.fill('#pw', FAKE_16); await p.fill('#pw2', FAKE_16); ok(!(await p.isVisible('#warn')), 'no warning at 16 characters'); ok(/good|strong/.test(await p.textContent('#strength')), 'strength hint: ' + await p.textContent('#strength'));
  /* show / hide */
  await p.click('#tog'); eq(await p.getAttribute('#pw', 'type'), 'text', 'shown'); eq(await p.getAttribute('#pw2', 'type'), 'text', 'confirm shown'); eq(await p.getAttribute('#tog', 'aria-pressed'), 'true', 'pressed'); await p.click('#tog'); eq(await p.getAttribute('#pw', 'type'), 'password', 'hidden again');
  /* nothing stored, nothing sent */
  const dump = await storeDump(p); ok(!dump.includes(FAKE_LONG) && !dump.includes(FAKE_12) && !dump.includes(FAKE_16) && !dump.includes(LOCK_MARKER), 'neither a password nor the pasted page is stored in localStorage, sessionStorage or cookies'); eq(reqs.length, 0, 'no requests to other sites: ' + reqs);
});
T('lock tool: the locked file has the right shape (PBKDF2-SHA-256 with 600,000 or more rounds, 16-byte salt, 12-byte IV, fresh salt every time) and contains no plaintext', async ({ base, newPage }) => {
  const a = await lockIt(newPage, base, LOCK_SAMPLE, FAKE_LONG), b = await lockIt(newPage, base, LOCK_SAMPLE, FAKE_LONG);
  eq(a.name, 'index.html', 'downloaded as index.html'); const v = JSON.parse(a.text.match(/<script type="application\/json" id="vault">(.*?)<\/script>/s)[1]); const w = JSON.parse(b.text.match(/<script type="application\/json" id="vault">(.*?)<\/script>/s)[1]);
  eq(v.kdf, 'PBKDF2-SHA-256', 'kdf'); ok(v.iter >= 600000, 'iterations ' + v.iter); eq(v.cipher, 'AES-GCM-256', 'cipher'); eq(Buffer.from(v.salt, 'base64').length, 16, '16-byte salt'); eq(Buffer.from(v.iv, 'base64').length, 12, '12-byte IV'); ok(Buffer.from(v.ct, 'base64').length > LOCK_SAMPLE.length, 'ciphertext (with the GCM tag) is present'); ok(v.salt !== w.salt && v.iv !== w.iv && v.ct !== w.ct, 'a new random salt and IV every time');
  for (const bad of [LOCK_MARKER, FAKE_LONG, 'script ran', 'Sample leader page', 'getElementById(\'out\')']) ok(!a.text.includes(bad), 'plaintext found in the locked file: ' + bad);
  eq((a.text.match(/<title>(.*?)<\/title>/)[1]), 'Leader tools', 'title'); ok(/<meta name="robots" content="noindex,nofollow">/.test(a.text), 'noindex,nofollow'); ok(/<script data-goatcounter="[^"]+"[^>]*src="\/\/gc\.zgo\.at\/count\.js"><\/script>/.test(a.text.split('</head>')[0]), 'the GoatCounter snippet is kept in the head'); ok(/Enter the leader password/.test(a.text) && />Unlock</.test(a.text), 'a visible prompt');
});
T('locked page: a wrong password shows only the error (with a delay that grows), the right password unlocks and the page\'s script runs, Enter works, Lock again returns to the prompt, and nothing is stored', async ({ base, newPage }) => {
  const { p: lp, text } = await lockIt(newPage, base, LOCK_SAMPLE, FAKE_LONG); await lp.close();
  const p = await newPage(); const reqs = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !/gc\.zgo\.at|goatcounter\.com/.test(r.url())) reqs.push(r.url()); }); await serveLocked(p, base, text);
  eq((await p.textContent('label[for="pw"]')).trim(), 'Enter the leader password', 'labeled'); eq(await p.getAttribute('#pw', 'type'), 'password', 'hidden by default'); ok(await p.isVisible('#go') && (await p.textContent('#go')).trim() === 'Unlock', 'Unlock button'); ok(!(await p.isVisible('#err')), 'no error yet');
  await p.click('#tog'); eq(await p.getAttribute('#pw', 'type'), 'text', 'show'); await p.click('#tog'); eq(await p.getAttribute('#pw', 'type'), 'password', 'hide');
  /* wrong password, twice: the same error, nothing revealed, and a longer pause the second time */
  const wait = async () => { const t0 = Date.now(); await p.waitForFunction(() => !document.getElementById('go').disabled, null, { timeout: 15000 }); return Date.now() - t0; };
  await p.fill('#pw', FAKE_WRONG); await p.keyboard.press('Enter'); await p.waitForSelector('#err:not([hidden])'); eq((await p.textContent('#err')).trim(), 'That password didn\'t work.', 'the error text'); ok(await p.isDisabled('#go'), 'the button pauses after a failure'); const body1 = await p.textContent('body'); ok(!body1.includes(LOCK_MARKER) && !body1.includes('script ran'), 'nothing is revealed'); const d1 = await wait();
  await p.fill('#pw', FAKE_WRONG); await p.click('#go'); await p.waitForSelector('#err:not([hidden])'); const d2 = await wait(); ok(d2 > d1 + 500, `the pause grows after repeated failures (${d1} ms, then ${d2} ms)`); ok(d1 >= 500, 'a pause after the first failure: ' + d1);
  ok(!(await p.textContent('body')).includes(LOCK_MARKER), 'still locked'); eq(await p.inputValue('#pw'), '', 'the field is cleared after a failure');
  /* right password with the Enter key */
  await p.fill('#pw', FAKE_LONG); await p.keyboard.press('Enter'); await p.waitForFunction(() => document.getElementById('out') && document.getElementById('out').textContent !== 'not run', null, { timeout: 15000 });
  eq(await p.textContent('#out'), 'script ran 42', 'the unlocked page\'s own script ran'); eq((await p.textContent('#h')).trim(), LOCK_MARKER, 'the page content is shown'); eq(await p.title(), 'Sample leader page', 'the decrypted page replaced the prompt'); ok(await p.isVisible('#ho-lock-again'), 'Lock again button');
  const dump = await storeDump(p); ok(!dump.includes(FAKE_LONG) && !dump.includes(FAKE_WRONG) && !dump.includes(LOCK_MARKER) && !/unlock/i.test(dump), 'no password, unlocked flag or decrypted content stored'); eq(reqs.length, 0, 'no requests to other sites: ' + reqs);
  /* Lock again: reload = the prompt again, content gone */
  await p.click('#ho-lock-again'); await p.waitForSelector('#pw'); await p.waitForTimeout(150); ok(await p.isVisible('#go') && !(await p.textContent('body')).includes(LOCK_MARKER), 'back to the locked prompt'); ok(!(await storeDump(p)).includes(LOCK_MARKER), 'still nothing stored');
});
T('locked page: the real teacher page, locked and unlocked, still works (six links per game and the seating helper)', async ({ base, newPage }) => {
  const real = fs.readFileSync(TEACHER_FIXTURE_PATH, 'utf8'); const { p: lp, text } = await lockIt(newPage, base, real, FAKE_LONG); await lp.close();
  ok(!text.includes('Seating') && !text.includes('hfLinks') && !text.includes('case code'), 'no readable teacher content in the locked file');
  const p = await newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await serveLocked(p, base, text); await p.fill('#pw', FAKE_LONG); await p.click('#go'); await p.waitForSelector('#hfLinks a.primary', { timeout: 15000 });
  eq((await p.$$eval('#hfLinks a.primary', (e) => e.length)), 6, 'six Haunting Files links'); eq((await p.$$eval('#vlLinks a.primary', (e) => e.length)), 6, 'six The Veil links');
  await p.fill('#rows', '4'); await p.fill('#cols', '5'); await p.click('#make'); await p.click('#shuffle'); const codes = await p.$$eval('.seat b', (e) => e.map((x) => +x.textContent)); eq(codes.length, 20, 'the seating helper works after unlock'); ok(codes.every((c) => c >= 1 && c <= 6), 'valid case codes');
  const g = (r, c) => (r < 0 || c < 0 || r >= 4 || c >= 5 ? 0 : codes[r * 5 + c]); for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { const w = g(r + dr, c + dc); ok(!w || w !== g(r, c), 'neighbors share a code'); }
  ok(await p.isVisible('#ho-lock-again'), 'Lock again is offered'); eq(errs.length, 0, 'page errors: ' + errs);
});
T('lock tool and locked page: no console errors, no horizontal scroll, and no cost wording at 1920, 1280 and 390 px', async ({ base, newPage }) => {
  const { p: lp, text } = await lockIt(newPage, base, LOCK_SAMPLE, FAKE_LONG); await lp.close(); const COST = /\$|\bcost(s|ly)?\b|\bpric(e|es|ed|ing)\b|\bdollars?\b|\bfees?\b|\bpay(s|ing|ment|ments)?\b|\bbuy(ing)?\b|\bpurchas\w*|\bsubscri\w*|\bcheap\b|\bexpensive\b|\bdiscount\w*|\bfree\b|\bmoney\b/i;
  for (const w of [1920, 1280, 390]) {
    const p = await newPage({ width: w, height: 900 }); await p.goto(base + 'tools/lock.html'); await p.waitForTimeout(100); ok(await noHScroll(p), 'sideways scroll on the lock tool at ' + w); await p.fill('#pw', FAKE_11); await p.click('#go'); ok(await noHScroll(p), 'with the error showing at ' + w); const t1 = await p.innerText('body'); ok(!COST.test(t1), 'cost wording on the lock tool: ' + (t1.match(COST) || [])[0]);
    await serveLocked(p, base, text); ok(await noHScroll(p), 'sideways scroll on the locked page at ' + w); await p.fill('#pw', FAKE_WRONG); await p.click('#go'); await p.waitForSelector('#err:not([hidden])'); ok(await noHScroll(p), 'with the error showing at ' + w); const t2 = await p.innerText('body'); ok(!COST.test(t2), 'cost wording on the locked page: ' + (t2.match(COST) || [])[0]);
  }
  /* Daylight theme: the prompt is still readable (the shared theme key) */
  const q = await newPage(); await q.addInitScript(() => { try { localStorage.setItem('ho-theme', JSON.stringify('light')); } catch (e) { /* ignore */ } }); await serveLocked(q, base, text); eq(await q.getAttribute('html', 'data-theme'), 'light', 'Daylight theme applies'); ok(await q.evaluate(() => getComputedStyle(document.getElementById('pw')).color !== getComputedStyle(document.getElementById('pw')).backgroundColor), 'readable in Daylight');
  await q.focus('#pw'); ok(await q.evaluate(() => { const c = getComputedStyle(document.activeElement); return c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) >= 2; }), 'visible focus on the field');
});
T('unlinked: no public page, search entry or card links to the teacher page or the lock tool, and the Leaders page says where to get the tools', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base); await p.evaluate(() => { location.hash = '#leaders'; }); await p.waitForTimeout(300);
  eq((await p.$$('#leaders a[href*="teacher"]')).length, 0, 'no teacher link on the Leaders page'); ok((await p.textContent('#leaders .note')).includes('Leader tools are available from your course leaders.'), 'the replacement sentence'); ok(!/Teacher tools/.test(await p.textContent('#leaders')), 'no "Teacher tools" link text');
  /* every page and script in the repo, except the page itself, the lock tool and the docs/tests */
  const bad = []; const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const full = path.join(d, f.name); const rel = path.relative(ROOT, full); if (f.isDirectory()) { if (['node_modules', '.git', '.wt', 'docs', 'tests', 'teacher', 'tools'].includes(f.name)) continue; walk(full); } else if (/\.(html|js|json|xml|txt|md)$/.test(f.name) && !/^(docs|tests)\//.test(rel)) { const s = fs.readFileSync(full, 'utf8'); if (/href=["'][^"']*teacher\/?(index\.html)?["'#?]/.test(s) || /tools\/lock/.test(s) || /Teacher tools/i.test(s)) bad.push(rel); } } };
  walk(ROOT); eq(bad.join(','), '', 'pages that still point at the teacher page or the lock tool: ' + bad);
  await p.evaluate(() => { location.hash = '#home'; }); const hasSearch = await p.$('#siteSearch, [data-search], input[type="search"]'); if (hasSearch) { await p.fill('input[type="search"]', 'teacher tools'); await p.waitForTimeout(200); ok(!/teacher\//.test(await p.evaluate(() => [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')).join(' '))), 'the search results do not offer the teacher page'); }
});
T('teacher fixture: the plain copy used by the teacher tests is a real, complete page, and nothing public links to it or serves it', async ({ base }) => {
  const name = path.basename(TEACHER_FIXTURE_PATH); const html = fs.readFileSync(TEACHER_FIXTURE_PATH, 'utf8');
  ok(/id="hfLinks"/.test(html) && /id="vlLinks"/.test(html) && /id="make"/.test(html) && html.length > 5000, 'the fixture is the full teacher page (links and seating helper)');
  ok(name.startsWith('_'), 'the file name starts with an underscore, which the Jekyll build behind GitHub Pages leaves out of the published site');
  ok(!fs.existsSync(path.join(ROOT, '.nojekyll')), 'no .nojekyll file (it would switch that exclusion off)');
  /* nothing public points at it: not a page, a script, a data file, the sitemap or a card (docs and tests may name it) */
  const bad = []; const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const full = path.join(d, f.name); const rel = path.relative(ROOT, full); if (f.isDirectory()) { if (['node_modules', '.git', '.wt', 'docs', 'tests'].includes(f.name)) continue; walk(full); } else if (/\.(html|js|json|xml|txt|md|css|svg|webmanifest)$/i.test(f.name)) { const s = fs.readFileSync(full, 'utf8'); if (/_teacher-page|tests\/fixtures/.test(s)) bad.push(rel); } } };
  walk(ROOT); eq(bad.join(','), '', 'public files that mention the teacher fixture: ' + bad);
  /* and no public page leaks its text: the leader tools' own markers appear only in the fixture and the teacher page, never on the home page, games or lessons */
  for (const u of ['', 'show-dont-tell/', 'haunting-files/', 'last-light/', 'the-veil/', 'room-214/']) { const body = await (await fetch(base + u)).text(); ok(!/id="hfLinks"|id="vlLinks"|seating helper/i.test(body), 'a public page carries the leader tools: ' + (u || 'home')); }
  /* the lock tool's how-to tells leaders about it, and no secret-looking text is in it */
  ok(!/(password|passphrase)\s*[:=]\s*['"]?\S{6,}/i.test(html), 'no password in the fixture');
});
T('repo: no password-like string, key or "password=" in committed files outside a marked test fixture', async () => {
  let files; try { files = (await import('node:child_process')).execSync('git ls-files', { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean); } catch (e) { files = []; const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (['node_modules', '.git', '.wt'].includes(f.name)) continue; const full = path.join(d, f.name); if (f.isDirectory()) walk(full); else files.push(path.relative(ROOT, full)); } }; walk(ROOT); }
  ok(files.length > 50, 'found the committed files: ' + files.length);
  const PW = ['pass', 'word'].join(''), PP = ['pass', 'phrase'].join('');
  const RULES = [
    [new RegExp('\\b' + PW + '=[^\\s&"\'<>]', 'i'), 'a ' + PW + '= pair'],
    [new RegExp('\\b(' + PW + '|' + PP + '|secret|api[_-]?key|token)\\w*\\s*[:=]\\s*[\'"][^\'"\\s]{6,}[\'"]', 'i'), 'a quoted value assigned to a secret-looking name'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'a private key block'], [/\bAKIA[0-9A-Z]{16}\b/, 'an AWS key id'], [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, 'a GitHub token'], [/\bsk-[A-Za-z0-9_-]{24,}\b/, 'an API key'], [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'a Slack token'],
  ];
  const SKIP = /\.(png|jpg|jpeg|gif|webp|ico|woff2?|ttf|pdf|mp3|ogg|wav|mp4|zip)$/i; const hits = [];
  for (const f of files) { if (SKIP.test(f) || !fs.existsSync(path.join(ROOT, f))) continue; let s; try { s = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { continue; } for (const line of s.split('\n')) { if (line.includes('TEST-FIXTURE')) continue; for (const [re, what] of RULES) if (re.test(line)) hits.push(`${f}: ${what}: ${line.trim().slice(0, 80)}`); } }
  eq(hits.length, 0, 'secret-looking strings found:\n' + hits.slice(0, 5).join('\n'));
  /* the scanner itself catches a planted one (never a real one) */
  ok(RULES[0][0].test('x ' + PW + '=hunter22') && RULES[1][0].test(PW + ' = "abcdefgh"') && RULES[2][0].test('-----BEGIN RSA PRIVATE KEY-----'), 'the scanner catches planted examples'); // TEST-FIXTURE: planted examples, not real keys
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
    await gotoTeacher(p, base); await p.waitForTimeout(150); ok(await noHScroll(p), `horizontal scroll at ${w}px on teacher/`);
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
