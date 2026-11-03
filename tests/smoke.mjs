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
T('the week: four days built from one data object, TODOs visible, notes saved (ho-week)', async ({ base, newPage }) => {
  const p = await newPage(); await p.goto(base + '#week'); await p.waitForTimeout(250);
  eq((await p.$$('.wk-day')).length, 4, 'four days');
  eq((await p.$$eval('.wk-dow', (e) => e.map((x) => x.textContent))).join(','), 'Monday,Tuesday,Wednesday,Thursday', 'Monday to Thursday');
  eq((await p.$$('.wk-date .todo-in')).length, 4, 'each undated day shows a visible "Leaders: fill in the date" note');
  ok((await p.$$('.todo')).length >= 8, 'visible "Leaders: fill in" items for every unverified detail');
  ok((await p.$$('.wk-hist')).length >= 3 && (await p.$$('.wk-lore')).length >= 2, 'real-history boxes and separately labeled lore boxes');
  const lore = await p.$$eval('.wk-lore h4', (e) => e.map((x) => x.textContent)); ok(lore.every((t) => /lore|legend/i.test(t)), 'lore is labeled as lore/legend: ' + lore);
  const txt = await p.textContent('#weekRoot'); ok(!/s[eé]ance|ouija/i.test(txt), 'no spirit-contacting activities'); ok(/No ghost-hunting/.test(txt), 'explicit no-ghost-hunting line');
  await p.fill('#notes-wed', 'The bell tower smelled like cold stone.'); await p.reload(); await p.waitForTimeout(250);
  eq(await p.inputValue('#notes-wed'), 'The bell tower smelled like cold stone.', 'field notes persist');
  eq(JSON.parse(await lsGet(p, 'ho-week')).wed, 'The bell tower smelled like cold stone.', 'saved under ho-week');
  for (const a of await p.$$eval('.wk-links a', (e) => e.map((x) => x.getAttribute('href')))) ok(/^(#[a-z]+|[a-z-]+\/(#lesson-\d+)?)$/.test(a), 'link is relative: ' + a);
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
  const p = await newPage(); const ext = []; p.on('request', (r) => { if (!r.url().startsWith(base) && !r.url().startsWith('data:')) ext.push(r.url()); });
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
  ok(/Leaders: fill in/.test(await p.textContent('#turnin')), 'turn-in shows FORM_URL / FORM_EMBED placeholders');
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
  p.on('request', (r) => { const u = r.url(); if (!u.startsWith(base) && !u.startsWith('data:')) ext.push(u); });
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

run(tests);
