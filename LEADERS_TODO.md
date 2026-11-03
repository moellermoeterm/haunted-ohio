# Leaders: what still needs a human

This file is for course leaders. It is **not linked from the site**. Search the code for `TODO(Leaders)` or the words "Leaders: fill in" to find every spot below; students see a visible "Leaders: fill in" note wherever one is still open.

## 1. Switch on analytics (GoatCounter)
- [ ] Create a free GoatCounter site and note its code (the part before `.goatcounter.com`).
- [ ] Replace `YOUR_CODE` with that code in the snippet in the `<head>` of **all six pages**: `index.html`, `show-dont-tell/index.html`, `haunting-files/index.html`, `last-light/index.html`, `teacher/index.html`, `design-system/index.html`.
  The line looks like `<script data-goatcounter="https://YOUR_CODE.goatcounter.com/count" ...>`. Until you do, nothing is counted (by design).
- What is counted: page views (each home tab is its own page) and seven fixed events (game opened, lesson complete, mission complete, stop complete, case closed, form opened). Never names, typed text, saves or scores.

## 2. The Spring Grove turn-in form (`index.html`, top of the Dossier script)
- [ ] `FORM_URL`: the link to your form (must start with `https://`). Empty hides the button and shows a note.
- [ ] `FORM_EMBED`: the form's embed address (starts with `https://`). Shown in a frame only when a student presses "Show the form here"; a plain link is the fallback. Check that your form allows being embedded.

## 3. Spring Grove field work (`index.html`, `FIELD_FACTS`)
- [ ] After your walk-through, fill in the accepted answers (lowercase; a student's answer counts if it contains one of them) for the four Field Facts: Breuer monument (Lot 100), Dexter Mausoleum, Section 53, Section 16. While empty, any non-empty answer earns the points.
- [ ] Optional GPS check-in: leave `GPS_CHECKIN=false` unless you want it; if you turn it on, fill in `STOP_PLACES` with a latitude, longitude and radius for each stop. It runs on the student's device only and shows pass/fail text only.
- [ ] Read the four legends and the "What the record says" text on the Legends tab. The Dossier reuses that text, and its supporting-fact choices (for example, the Cincinnati Magazine line about Breuer) come from it. Confirm these are the sources you want students to cite.

## 4. The Week page (`index.html`, `WEEK_DATA`)
- [ ] Real dates for Monday to Thursday (`dates`). Written the way you want them shown.
- [ ] **Monday (Cincinnati walking tour):** confirm this is the tour you booked ("Nightmare on Elm Street", American Legacy Tours; its public listing says it starts and ends at Northern Row Brewery). Meeting spot and time, cost and payment, transportation and pick-up. One verified fact with its source for the real-history box.
- [ ] **Tuesday (Spring Grove):** meeting spot, time, who leads each squad, parking and drop-off.
- [ ] **Wednesday (Miami University / Oxford):** confirm this year's tour is still the "Ghosts and Gears" bike tour you booked. Meeting spot, time, cost and payment, bikes and helmets (rented or brought), any waiver, and the tour's own stops (do not copy from older years unless confirmed).
- [ ] **Thursday (Lebanon / The Golden Lamb):** reservation name, time and party size, budget and who pays, menu or allergy information for families.

## 5. Things I could not verify (please check before students rely on them)
I could only search the web; the venues' own sites (`events.miamioh.edu`, `goldenlamb.com`, `springgrove.org`, `americanlegacytours.com`) were not reachable from my environment, so nothing here was checked against a primary source. Everything marked "Real history" was confirmed by several independent search results and has its source named in a code comment. If you would like primary-source checks, those four hosts need to be allowed in the environment's network settings.
- **Left out because sources conflict:** Spring Grove's acreage (733, 750 and 782 all appear), The Golden Lamb's building date (1815 vs 1816) and the date of Dickens's visit, Sedamsville Rectory's construction date (1891 vs early 1800s), Moonville Tunnel's build date and when its rail line closed (1987 vs 1988), the Ohio State Reformatory's construction years.
- **The Golden Lamb:** "Ohio's longest continually operated business" and "twelve U.S. presidents" are shown as the inn's own claims, not facts.
- **Ghosts and Gears:** the only thing verified is that Miami's Outdoor Pursuit Center has offered a Halloween-season bike tour with that name. Haunting Files Case 3 therefore uses verified Miami history (chartered 1809, first classes 1824, Western Female Seminary and Helen Peabody) and a **made-up** building, Alder Hall.
- **Game material that is invented scenery:** every witness, quote, log, post and photo in the Haunting Files cases is fiction and is labeled "Game material". In Case 6 the bend in the trail and a second group with headlamps are invented and not checked against the real site. In Case 4 the key log and property manager are invented, and no real person is accused of anything.
- **Ghost stories I did not use as history:** the popular stories about the Sedamsville Rectory and the Ohio State Reformatory could not be traced to documents, so they do not appear as facts; the Moonville brakeman story appears only as lore.
- **Sarah Stubbs (The Golden Lamb)** is treated as legend on The Week page, not as history.

## 6. About page (`index.html`, About)
- [ ] The About page says students must be available "for an overnight stay to visit a local haunted site and/or the Ohio State Reformatory in Mansfield." The Week page (Monday to Thursday) has no overnight and no Mansfield stop. Please confirm which is right. I did not change the About text.

## 7. Things to know
- The Haunting Files cases and Last Light scenarios are plain data files you can edit: `haunting-files/cases/c1.js` to `c6.js` and `last-light/scenarios/s1.js` to `s6.js`. Case 1 and Scenario 1 are the original content, and saves made before variants existed load as Case 1 / Scenario 1.
- Each Haunting Files case lists its intended strongest explanation in its data (`strongest`): natural, psychological, historical, human activity, natural, historical. Five kinds across six cases means one repeat; the mechanisms differ.
- `teacher/index.html` has the six links per game and the seating helper. It is linked from the Leaders page, not from the main navigation, and is marked `noindex`.
- Old Spring Grove hunt progress (`ho-hunt` in students' browsers) is not carried over to the new Dossier (`ho-hunt2`). Nothing was deleted.
- **Not built:** The Veil (work in progress on branch `claude/the-veil-ch1`, not playable) and Room 214 (not started).
