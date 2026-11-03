/* Haunting Files, Case 3: Miami University, Oxford (editable data object).
   REAL HISTORY (src:'real') is limited to facts checked by web search (Nov 2026) against Miami University and campus-history sources:
     Miami was chartered in 1809 and held its first classes in 1824; Western Female Seminary was a school for women in Oxford with
     Helen Peabody as its first principal, and it later became part of Miami.
   "Ghosts and Gears": the only thing verified is that it is an evening bike tour run through Miami's Outdoor Pursuit Center. Its route,
   stops and stories were NOT verified, so this case does not use them. Alder Hall below is a MADE-UP building. Every person, quote and
   record is GAME MATERIAL. Leaders: see LEADERS_TODO.md.
   Intended strongest explanation: HISTORICAL (a legend that grew in the retelling). */
(window.HF_CASES = window.HF_CASES || {})[3] = {
  code: 3, file: '0050', name: 'Miami University, Oxford', short: 'Miami campus', scene: 'the path in front of Alder Hall at 9:15 PM', trustQ: 'whether the upper floor was empty', strongest: 'his',
  loc: 'A campus hall at Miami University, Oxford, Ohio (the hall in this case is made up).',
  brief: ['Case file #0050 has been reopened: Miami University, Alder Hall, second floor.', 'Two witnesses. One window. A story that has been told for years.', 'Your job is to decide what you can actually prove.'],
  intro: 'This case is set on the campus of the real Miami University in Oxford, but Alder Hall, the witness statements, and most documents were written for this game. Each exhibit is labeled so you always know which is which.',
  rep: 'During an evening campus ride, a guide reports a pale light moving past a second-floor window of Alder Hall, a made-up building. The custodian says the upper floor was empty.',
  repAssign: 'Write the opening of your field report (80 words or more). Put the reader on the path in front of Alder Hall at 9:15 PM and describe what the riders would have experienced. Then state what you believe happened and cite at least two exhibits by number, like E5 or E6.',
  hintSense: 'Add what the path sounded, felt, or smelled like, not only how it looked.',
  hintTime: 'Investigators log times. Mention 9:15 or another time from the file.',
  ev: [
    { id: 'E1', title: 'University charter and first classes', kind: 'Public record', src: 'real', type: 'fact',
      body: '<p>Miami University was chartered in 1809 and held its first classes in 1824, in Oxford, Ohio.</p><p class="muted">Anyone can check these dates against university records.</p>',
      why: 'It is a basic, checkable fact confirmed by the university’s own records. It tells you the campus is real, old, and well documented. It says nothing yet about ghosts.' },
    { id: 'E2', title: 'Western Female Seminary', kind: 'Campus history', src: 'real', type: 'fact',
      body: '<p>Western Female Seminary was a school for women in Oxford. Helen Peabody was its first principal. The seminary later became part of Miami University.</p><p class="muted">Campus-history sources agree on this.</p>',
      why: 'It is a checkable fact about a real place. It gives the campus a deep history, but a deep history is not the same as a haunting.' },
    { id: 'E3', title: 'Statement: Maya K., ride guide', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Maya K.</b> (evening ride guide, three seasons):</p><p>"At 9:15 we were stopped in front of Alder Hall. We had our bike lights off so everyone could take in the building. I saw a pale yellow light move slowly past a second-floor window, like someone carrying a candle. Three riders saw it too. Nobody can be in that hall after 6, because it is locked."</p>',
      why: 'This is what one person says she saw. It matters, but it is a personal account, and she says other people agreed, which is not the same as each person seeing it separately.' },
    { id: 'E4', title: 'Statement: Devon S., custodian', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Devon S.</b> (custodian, eight years):</p><p>"I was inside Alder Hall until I locked up at 9:30, and I checked every floor. The second floor was empty. The only light on upstairs was the stair strip light on its timer. At about 9:15 I looked out and saw bike lights sweeping the parking lot beside the hall. I did not see a flame, and open flames are not allowed in the building."</p>',
      why: 'Another personal account. It conflicts with Maya’s in several places, which is exactly why it is worth examining.' },
    { id: 'E5', title: 'Tour script revision log', kind: 'Written record', src: 'game', type: 'claim',
      body: '<p><b>Version 1 (August 2019):</b> "Some riders say they see a light in the upper windows."</p><p><b>Version 2 (October 2021):</b> "Some riders say they see a lamp moving in the upper windows."</p><p><b>Version 3 (October 2024):</b> "A woman with a candle walks the upper floor."</p><p>Editor’s note: "Added detail because riders liked it. No new sightings logged."</p>',
      why: 'It is a written record, so it is documented, but only as reliable as whoever kept it. It shows the story growing from “a light” to “a lamp” to “a woman with a candle,” with no new sightings behind the new details.' },
    { id: 'E6', title: 'Site plan: Alder Hall and the lot', kind: 'Campus record', src: 'game', type: 'fact',
      body: '<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="Site plan. The second-floor windows of Alder Hall face a parking lot. A path where riders stop is on the opposite side of the lot, so car and bike lights cross the glass."><rect x="40" y="14" width="220" height="40" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="38" text-anchor="middle" font-size="12" fill="#2a2113">ALDER HALL (2nd floor windows)</text><rect x="40" y="70" width="220" height="40" fill="none" stroke="#7a2c31" stroke-width="2" stroke-dasharray="6 4"/><text x="150" y="94" text-anchor="middle" font-size="11" fill="#7a2c31">parking lot</text><rect x="90" y="140" width="120" height="26" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="157" text-anchor="middle" font-size="10" fill="#2a2113">path where riders stop</text><line x1="150" y1="140" x2="150" y2="56" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/></svg><p class="muted">From the riders’ path, the hall’s upper windows are seen across the lot. Moving lights in the lot cross the glass at an angle.</p>',
      why: 'A site plan is a record you can check. It is a fact in this case, and it raises a question about what the riders could really see from the path.' },
    { id: 'E7', title: 'Campus ghost tour handout', kind: 'Handout', src: 'game', type: 'lore',
      body: '<p>"Meet <b>The Lady with the Candle</b>, who has walked the upper floor of Alder Hall for as long as anyone can remember."</p><p class="muted">No author. No sources. No dates.</p>',
      why: 'It is a story passed along with no named source and no evidence. A handout is also selling a ride, which makes it more folklore than fact.' },
    { id: 'E8', title: 'Maya’s social post', kind: 'Online post', src: 'game', type: 'spec',
      body: '<p>Posted the next day:</p><p>"Everyone laughed but I always knew the Lady with the Candle was real. Now I get asked to tell her story at every ride."</p>',
      why: 'It is a belief stated as fact, and it says she believed it beforehand. It was written after the event, and it shows she now gains attention from the story. That is a reason to read it carefully.' },
    { id: 'E9', title: 'Rider photo, 9:16 PM', kind: 'Photograph', src: 'game', type: 'mis',
      body: '<div class="photo" role="img" aria-label="Dark photo of a building with one warm yellow smear at an upper window"><span class="orb"></span></div><p>A long exposure from the path. A warm yellow smear sits at an upper window. The rider says it is "the candle."</p>',
      why: 'It looks like proof, but a long exposure turns any moving light into a streak, and glass reflects lamps and bike lights. It has an ordinary explanation, so it cannot be treated as evidence of a candle.' }
  ],
  contra: [
    { id: 'a', t: 'Whether the upper floor was empty. Maya says nobody could be inside after 6. Devon says he was inside until 9:30 and checked every floor.', ok: true },
    { id: 'b', t: 'Whether a flame was possible. Maya saw a light like a candle. Devon says open flames are not allowed in the building and he saw none.', ok: true },
    { id: 'c', t: 'Whether bike lights were on. Maya says the group’s lights were off. Devon says he saw bike lights sweeping the lot at about 9:15.', ok: true },
    { id: 'd', t: 'Whether both of them were on Miami’s campus that night.', ok: false },
    { id: 'e', t: 'The time. Maya places the light at 9:15. Devon locked up at 9:30.', ok: false }
  ],
  contraNote: 'The two times (9:15 and 9:30) describe different moments, so they are not a conflict. Both of them being on campus does not conflict either.',
  checkRe: 'revision|script|version|2019|2021|2024|retold|changed|grew|legend|new sighting',
  checkYes: 'You noticed the revision log. The candle is not in the first version of the story. A legend that gains details over time is changing in the retelling, not in the building.',
  checkNo: 'Look again at E5. The tour-script log shows the story growing from “a light” to “a lamp” to “a woman with a candle,” with no new sightings behind the new details.',
  theories: {
    nat: { n: 'Natural', d: 'Bike and car lights crossing old window glass made a moving glow, and the hall itself was empty.', sup: ['E4', 'E6', 'E9'], ch: 'A natural theory has to explain why three riders agreed it looked like a candle (E3, E5, E7).' },
    psy: { n: 'Psychological', d: 'Maya pointed, the riders had heard the story, and they agreed with her. Agreement made it feel certain.', sup: ['E3', 'E7', 'E8'], ch: 'A psychological theory has to account for the real light that was in the lot (E4, E6).' },
    his: { n: 'Historical', d: 'The Lady with the Candle is a legend that changed each time it was retold. The campus has real history, and the story borrowed from it.', sup: ['E1', 'E2', 'E5', 'E7'], ch: 'A historical theory explains where the story came from, but not what the riders saw on this particular night.' },
    sup: { n: 'Supernatural', d: 'Something unexplained was really in the hall, and the ordinary explanations are not enough.', sup: ['E2', 'E3', 'E7'], ch: 'A supernatural theory has to rule out the lights in the lot (E4, E6) and the growing script (E5) first.' }
  }
};
