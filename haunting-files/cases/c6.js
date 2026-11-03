/* Haunting Files, Case 6: Moonville Tunnel, Vinton County (editable data object).
   REAL HISTORY (src:'real') is limited to what several sources agreed on when checked by web search (Nov 2026): Moonville Tunnel is a masonry
   railroad tunnel in Vinton County, now part of the Moonville Rail-Trail; the Marietta and Cincinnati Railroad was built through the area in the
   1850s; sources DISAGREE about when the rail line closed (1987 or 1988) and about when the tunnel was first built (E2 says so).
   The brakeman ghost story is folklore. It is used only as lore and as the "three versions" game record (E5), never as history.
   Every person, quote and record below is GAME MATERIAL. Leaders: the scenery details (a bend in the trail, another group with headlamps)
   are invented for the game and not verified against the real site; see LEADERS_TODO.md.
   Intended strongest explanation: HISTORICAL (a legend with several versions and no record behind any of them). */
(window.HF_CASES = window.HF_CASES || {})[6] = {
  code: 6, file: '0053', name: 'Moonville Tunnel', short: 'Moonville', scene: 'the east portal at 9:30 PM', trustQ: 'the light at the far end', strongest: 'his',
  loc: 'Moonville Tunnel, Vinton County, Ohio.',
  brief: ['Case file #0053 has been reopened: Moonville Tunnel, east portal.', 'Two witnesses. One light. A story with three different endings.', 'Your job is to decide what you can actually prove.'],
  intro: 'This case uses the real Moonville Tunnel in Vinton County, but the witness statements and most documents were written for this game. Each exhibit is labeled so you always know which is which.',
  rep: 'On a night hike, a hiker reports a yellow light swinging at the far end of the tunnel and a faint train whistle. The trail steward standing beside the hiker saw no lantern and heard only wind.',
  repAssign: 'Write the opening of your field report (80 words or more). Put the reader at the east portal at 9:30 PM and describe what the witnesses would have experienced. Then state what you believe happened and cite at least two exhibits by number, like E5 or E6.',
  hintSense: 'Add what the tunnel sounded, felt, or smelled like, not only how it looked.',
  hintTime: 'Investigators log times. Mention 9:30 or another time from the file.',
  ev: [
    { id: 'E1', title: 'The tunnel today', kind: 'Public record', src: 'real', type: 'fact',
      body: '<p>Moonville Tunnel is a masonry railroad tunnel in Vinton County, Ohio. Today it is part of the Moonville Rail-Trail.</p><p class="muted">Several sources agree on this. You could check them.</p>',
      why: 'It is a basic, checkable fact that several sources agree on. It tells you the tunnel is real and open to hikers. It says nothing yet about ghosts.' },
    { id: 'E2', title: 'Railroad dates', kind: 'Historical accounts', src: 'real', type: 'claim',
      body: '<p>The Marietta and Cincinnati Railroad was built through the area in the 1850s. Sources disagree about when the rail line closed (one says 1987, another 1988) and about when the tunnel itself was first built.</p>',
      why: 'The railroad is documented, but the closing year and the tunnel date are disputed. When sources disagree, the honest answer is “not settled,” not the most exciting number.' },
    { id: 'E3', title: 'Statement: Riley N., night hiker', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Riley N.</b> (night hiker):</p><p>"At about 9:30 we reached the east portal. At the far end I saw a yellow light swinging back and forth, like a lantern, and I heard a faint train whistle. We were the only people on that part of the trail. We all turned our lights off so the dark would feel real."</p>',
      why: 'This is what one person says she saw and heard. It matters, but it is a personal account, and the rest of the file will test it.' },
    { id: 'E4', title: 'Statement: Taylor O., trail steward', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Taylor O.</b> (volunteer trail steward):</p><p>"I was standing right beside Riley at about 9:40. I saw no lantern at the far end. I heard wind moaning through the tunnel. Another group came around the bend from the west with headlamps on, and one of them was swinging a light back and forth to wave to us."</p>',
      why: 'Another personal account of what someone saw and heard. It conflicts with Riley in several places, which is exactly why it is worth examining.' },
    { id: 'E5', title: 'Library research folder', kind: 'Written record', src: 'game', type: 'claim',
      body: '<p><b>Version A (told by a retired hiker, undated):</b> a brakeman was killed in 1859.</p><p><b>Version B (a club newsletter):</b> a conductor was killed in the 1880s.</p><p><b>Version C (a trail blog):</b> a lantern keeper lost his way in a storm.</p><p>Folder note: "No record found for any of the three versions. Names and dates differ in every telling."</p>',
      why: 'It is a written record, so it is documented, but only as reliable as whoever kept it. It shows that the story has several versions and that nobody could find a record behind any of them.' },
    { id: 'E6', title: 'Trail sketch', kind: 'Site sketch', src: 'game', type: 'fact',
      body: '<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="Sketch. A straight tunnel between an east portal and a west portal. West of the tunnel, a bend in the trail where another group could appear with headlamps, in line with the tunnel."><rect x="70" y="80" width="160" height="30" fill="none" stroke="#2a2113" stroke-width="3"/><text x="150" y="100" text-anchor="middle" font-size="11" fill="#2a2113">TUNNEL</text><text x="30" y="68" font-size="10" fill="#2a2113">east portal</text><text x="232" y="68" font-size="10" fill="#2a2113">far portal</text><path d="M230 95 Q 270 95 280 140" fill="none" stroke="#7a2c31" stroke-width="2" stroke-dasharray="5 4"/><text x="206" y="150" font-size="10" fill="#7a2c31">bend where another group appears</text><line x1="40" y1="95" x2="228" y2="95" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/></svg><p class="muted">From the east portal you can see straight down the tunnel to the far end. A group arriving at the bend would show its lights framed in the far opening.</p>',
      why: 'A sketch of the site is a record you can check. It is a fact in this case, and it raises a question about what a light at the far end could be.' },
    { id: 'E7', title: 'Trail blog post', kind: 'Online post', src: 'game', type: 'lore',
      body: '<p>"The Moonville brakeman still swings his lantern in the tunnel at night. Everybody who walks the trail knows it."</p><p class="muted">No author. No sources. No dates.</p>',
      why: 'It is a story passed along with no named source and no evidence. “Everybody knows” is a sign of folklore, not records.' },
    { id: 'E8', title: 'Riley’s social post', kind: 'Online post', src: 'game', type: 'spec',
      body: '<p>Posted the next day:</p><p>"I always said the brakeman was real. I SAW his lantern. A hiking page asked me to write about it."</p>',
      why: 'It is a belief stated as fact, and it says she believed it beforehand. It was written after the event, and it shows she now gains attention from the story. That is a reason to read it carefully.' },
    { id: 'E9', title: 'Long-exposure photo, 9:31 PM', kind: 'Photograph', src: 'game', type: 'mis',
      body: '<div class="photo" role="img" aria-label="Dark photo of a tunnel with one curved yellow streak at the far end"><span class="orb"></span></div><p>A ten-second exposure from the east portal. A curved yellow streak hangs at the far end. The photographer says it is "the lantern."</p>',
      why: 'It looks like proof, but a long exposure turns any moving light into a streak. It has an ordinary explanation, so it cannot be treated as evidence of a lantern.' }
  ],
  contra: [
    { id: 'a', t: 'Whether there was a light at the far end. Riley saw one swinging. Taylor saw no lantern.', ok: true },
    { id: 'b', t: 'What the sound was. Riley heard a faint train whistle. Taylor heard wind moaning through the tunnel.', ok: true },
    { id: 'c', t: 'Whether anyone else was nearby. Riley says they were the only people on that part of the trail. Taylor says another group came around the bend with headlamps.', ok: true },
    { id: 'd', t: 'Whether both of them were on the trail that night.', ok: false },
    { id: 'e', t: 'The time. Riley says about 9:30. Taylor says about 9:40.', ok: false }
  ],
  contraNote: 'Riley and Taylor give slightly different times for the same moment, which is ordinary rounding, not a conflict. Both of them being on the trail does not conflict either.',
  checkRe: 'version|folder|library|three|record|1859|1880|differ|no record|told',
  checkYes: 'You noticed the research folder. The story comes in three versions with different people, dates, and endings, and nobody found a record behind any of them. That is how a legend behaves.',
  checkNo: 'Look again at E5. The research folder lists three different versions of the story and says no record was found for any of them.',
  theories: {
    nat: { n: 'Natural', d: 'Another group’s headlamps framed in the far opening, and wind moaning through the tunnel, explain what Riley saw and heard.', sup: ['E4', 'E6', 'E9'], ch: 'A natural theory has to explain why Riley described a lantern and a train whistle, and why the story was so ready to hand (E3, E7).' },
    psy: { n: 'Psychological', d: 'Riley expected the brakeman. In the dark, a swinging light and a moaning sound were enough for her mind to supply a lantern and a whistle.', sup: ['E3', 'E7', 'E8'], ch: 'A psychological theory has to account for the real group with headlamps that Taylor saw (E4, E6).' },
    his: { n: 'Historical', d: 'The brakeman story is a legend with several versions and no record behind any of them. The tunnel is real, the railroad is real, and the legend filled in the rest.', sup: ['E1', 'E2', 'E5', 'E7'], ch: 'A historical theory explains where the story came from, but not what Riley saw on this particular night.' },
    sup: { n: 'Supernatural', d: 'Something unexplained was really in the tunnel, and the ordinary explanations are not enough.', sup: ['E3', 'E7'], ch: 'A supernatural theory has to rule out the headlamps (E4, E6) and the missing record (E5) first.' }
  }
};
