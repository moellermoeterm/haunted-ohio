# Leaders: what still needs a human

This file is for course leaders. It is **not linked from the site**. Search the code for `TODO(Leaders)` or the words "Leaders: fill in" to find every spot below; students no longer see "Leaders:" notes on The Week, the home map list, the Spring Grove Dossier or "Turn it in" (the one note still shown to students is on the Leaders page itself). Every open item below stays open here, and the page fills in by itself once you set a value.

## 1. Switch on analytics (GoatCounter)
- [x] Create a free GoatCounter site. **Done: code `ohmoellermoeterm`.**
- [x] Put the code in the snippet in the `<head>` of **all six pages**: `index.html`, `show-dont-tell/index.html`, `haunting-files/index.html`, `last-light/index.html`, `teacher/index.html`, `design-system/index.html`. **Done**, one snippet per page (tested).
- Still to do on your side: in GoatCounter, make sure the site's allowed domain includes the GitHub Pages address, and check the dashboard shows views after the deploy.
- What is counted: page views (each home tab is its own page) and seven fixed events (game opened, lesson complete, mission complete, stop complete, case closed, form opened). Never names, typed text, saves or scores.

## 2. The Spring Grove turn-in form (`index.html`, top of the Dossier script)
- [x] `FORM_URL`: **Done.** The Microsoft form link is set; the button opens it in a new tab (`target="_blank"`, `rel="noopener"`).
- [ ] `FORM_EMBED`: **Still open on purpose; students see no note about it.** (If you set it and the frame fails to load, a plain "open it in its own tab" note appears by itself.) The form needs a school sign-in, and I could not load it from here to confirm it works inside a frame, so I did not enable the "Show the form here" button. Students get the plain "Open the turn-in form" button. To try the embed, set `FORM_EMBED` to the form link plus `&embed=true`, open the page while signed in with a school account, and check that it loads; if it only shows a sign-in prompt or refuses, leave it empty.

## 3. Spring Grove field work (`index.html`, `FIELD_FACTS`)
- [ ] After your walk-through, fill in the accepted answers (lowercase; a student's answer counts if it contains one of them) for the four Field Facts: Breuer monument (Lot 100), Dexter Mausoleum, Section 53, Section 16. While empty, any non-empty answer earns the points.
- [ ] Optional GPS check-in: leave `GPS_CHECKIN=false` unless you want it; if you turn it on, fill in `STOP_PLACES` with a latitude, longitude and radius for each stop. It runs on the student's device only and shows pass/fail text only.
- [ ] Verify the Kirk plot location, the Breuer details and Section 53's exact spot on your walk-through.
- [ ] Read the four legends and the "What the record says" text on the Legends tab. The Dossier reuses that text, and its supporting-fact choices (for example, the Cincinnati Magazine line about Breuer) come from it. Confirm these are the sources you want students to cite.

## 4. The Week page (`index.html`, `WEEK_DATA`)
The page shows only day names and place names. There are no fields for anything else.

- Schedule, times, addresses and bookings are kept in the leaders' private PowerPoint and school communications. Never add them to this repo or site.

## 5. Things I could not verify (please check before students rely on them)
I could only search the web; the venues' own sites (`events.miamioh.edu`, `goldenlamb.com`, `springgrove.org`) were not reachable from my environment, so nothing here was checked against a primary source. Everything marked "Real history" was confirmed by several independent search results and has its source named in a code comment. If you would like primary-source checks, those four hosts need to be allowed in the environment's network settings.
- **Left out because sources conflict:** Spring Grove's acreage (733, 750 and 782 all appear), The Golden Lamb's building date (1815 vs 1816) and the date of Dickens's visit, Sedamsville Rectory's construction date (1891 vs early 1800s), Moonville Tunnel's build date and when its rail line closed (1987 vs 1988), the Ohio State Reformatory's construction years.
- **The Golden Lamb:** "Ohio's longest continually operated business" and "twelve U.S. presidents" are shown as the inn's own claims, not facts.
- **Ghosts and Gears:** the only thing verified is that Miami's Outdoor Pursuit Center has offered a Halloween-season bike tour with that name. Haunting Files Case 3 therefore uses verified Miami history (chartered 1809, first classes 1824, Western Female Seminary and Helen Peabody) and a **made-up** building, Alder Hall.
- **Game material that is invented scenery:** every witness, quote, log, post and photo in the Haunting Files cases is fiction and is labeled "Game material". In Case 6 the bend in the trail and a second group with headlamps are invented and not checked against the real site. In Case 4 the key log and property manager are invented, and no real person is accused of anything.
- **Ghost stories I did not use as history:** the popular stories about the Sedamsville Rectory and the Ohio State Reformatory could not be traced to documents, so they do not appear as facts; the Moonville brakeman story appears only as lore.
- **Sarah Stubbs (The Golden Lamb)** is treated as legend on The Week page, not as history.

## 6. About page (`index.html`, About)
- [x] The overnight sentence now reads: "Students registering for this course must be available for an overnight stay on Wednesday night at Hueston Woods, following the Ghosts and Gears tour at Miami University." **Done** (the Reformatory/Shawshank sentence was removed).
- Other places that mention the Ohio State Reformatory are the Haunting Files Case 5 game case (`haunting-files/cases/c5.js`), plus a Mansfield map label in two Last Light scenarios (`last-light/scenarios/s2.js`, `s6.js`). None of them say students will visit or stay there, so they were left alone.

## 7. Things to know
- The Haunting Files cases and Last Light scenarios are plain data files you can edit: `haunting-files/cases/c1.js` to `c6.js` and `last-light/scenarios/s1.js` to `s6.js`. Case 1 and Scenario 1 are the original content, and saves made before variants existed load as Case 1 / Scenario 1.
- Each Haunting Files case lists its intended strongest explanation in its data (`strongest`): natural, psychological, historical, human activity, natural, historical. Five kinds across six cases means one repeat; the mechanisms differ.
- `teacher/index.html` (the leader tools) explains that cases are assigned at random and has six leader-preview links per game. **After the random-assignment change is merged, the locked page must be re-locked by hand** from the updated plain copy (see `docs/leaders/HOW-TO-LOCK.md`); until then the live locked page still shows the old case links, which no longer select a case. It is linked only from the Leaders page ("Leader tools (password required)"), and the page behind that link is a locked page that shows a password screen (see `docs/leaders/HOW-TO-LOCK.md` to re-lock it) and is marked `noindex`. To put it behind a password, follow `docs/leaders/HOW-TO-LOCK.md`.
- Old Spring Grove hunt progress (`ho-hunt` in students' browsers) is not carried over to the new Dossier (`ho-hunt2`). Nothing was deleted.
- **Not built:** The Veil (work in progress on branch `claude/the-veil-ch1`, not playable) and Room 214 (not started).
