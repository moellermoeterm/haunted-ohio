/* Haunting Files, Case 2: The Golden Lamb (editable data object).
   REAL HISTORY (src:'real') is limited to what several independent sources agreed on when checked by web search (Nov 2026):
     goldenlamb.com history pages, Warren County Historical Society (wchsmuseum.org), Wikipedia "Golden Lamb Inn".
   Everything else, every person, every quote and every record below is GAME MATERIAL written for this case.
   Intended strongest explanation: PSYCHOLOGICAL (expectation + a coat in a dim window + ordinary hum). */
(window.HF_CASES = window.HF_CASES || {})[2] = {
  code: 2, file: '0049', name: 'The Golden Lamb', short: 'Golden Lamb', scene: 'the back staircase at 10:50 PM', trustQ: 'the landing light', strongest: 'psy',
  loc: 'The Golden Lamb inn, Lebanon, Ohio.',
  brief: ['Case file #0049 has been reopened: The Golden Lamb, back staircase.', 'Two staff members. One staircase. Very different stories about the same few minutes.', 'Your job is to decide what you can actually prove.'],
  intro: 'This case uses the real Golden Lamb inn in Lebanon, but the witness statements and most documents were written for this game. Each exhibit is labeled so you always know which is which.',
  rep: 'After Friday closing, a server reports a small figure at the top of the back staircase and a hummed tune. A busser working the same hallway says no one was there.',
  repAssign: 'Write the opening of your field report (80 words or more). Put the reader on the back staircase at 10:50 PM and describe what the witnesses would have experienced. Then state what you believe happened and cite at least two exhibits by number, like E5 or E6.',
  hintSense: 'Add what the staircase sounded, felt, or smelled like, not only how it looked.',
  hintTime: 'Investigators log times. Mention 10:50 or another time from the file.',
  ev: [
    { id: 'E1', title: 'Inn licensing record', kind: 'Public record', src: 'real', type: 'fact',
      body: '<p>In December 1803, Jonas Seaman was licensed to run a public house in Lebanon, Ohio. The Golden Lamb grew from that tavern.</p><p class="muted">Several local-history sources agree on this. You could check them.</p>',
      why: 'It is a basic, checkable fact that several independent sources agree on. It tells you the inn is real, old, and well documented. It says nothing yet about ghosts.' },
    { id: 'E2', title: 'The inn’s own claims', kind: 'Historical accounts', src: 'real', type: 'claim',
      body: '<p>The inn describes itself as Ohio’s longest continually operated business, and it reports that twelve U.S. presidents have stayed or dined there.</p><p class="muted">These are statements by the inn and by local historians. An inn also has a reason to tell a good story.</p>',
      why: 'It is documented, but it comes from the people who benefit from the story. Treat it as a claim you would want to verify, not a settled fact.' },
    { id: 'E3', title: 'Statement: Jordan P., server', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Jordan P.</b> (server, two seasons):</p><p>"Closing was around 10:45. I was carrying a tray down the back staircase when I looked up. At the top landing there was a small figure, child height, standing very still against the window. I heard someone humming, slow, like a lullaby. I said hello and nobody answered. When I went back up three steps the landing was empty, and the light over it was off. It was about 10:50."</p>',
      why: 'This is what one person says she saw and heard. It matters, but it is a personal account, and the rest of the file will test it.' },
    { id: 'E4', title: 'Statement: Luis M., busser', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Luis M.</b> (busser, five seasons):</p><p>"I was on the third-floor hall resetting the linen carts until 11:05. I walked past that landing twice, at 10:45 and at 10:55, and never saw a child or anybody. The landing light was on both times. The only noise was the radiator knocking in the hall. I did not hear humming."</p>',
      why: 'Another personal account of what someone saw and heard. It conflicts with Jordan in several places, which is exactly why it is worth examining.' },
    { id: 'E5', title: 'Facilities note', kind: 'Building record', src: 'game', type: 'claim',
      body: '<p>Back-stair landing light: runs on a motion sensor with a three-minute timeout. Slow to notice a person who stands still. Bulb replaced twice this quarter.</p><p>Third-floor hall radiators knock when the boiler cycles on. Work order pending.</p>',
      why: 'It is a written record, so it is documented, but only as reliable as whoever wrote it. It fits Luis’s account of the light and offers an ordinary reason the landing could be dark for someone standing still.' },
    { id: 'E6', title: 'Floor plan: back landing', kind: 'Architectural record', src: 'game', type: 'fact',
      body: '<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="Plan of the back landing. Coat hooks hang on the wall between the stair and the window, in line with the view from the foot of the stairs."><rect x="30" y="16" width="240" height="46" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="44" text-anchor="middle" font-size="12" fill="#2a2113">LANDING</text><rect x="226" y="20" width="36" height="10" fill="#7a2c31"/><text x="150" y="30" text-anchor="middle" font-size="10" fill="#7a2c31">window</text><circle cx="150" cy="70" r="7" fill="#2a2113"/><text x="164" y="74" font-size="10" fill="#2a2113">coat hooks</text><rect x="120" y="140" width="60" height="34" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="161" text-anchor="middle" font-size="10" fill="#2a2113">stair foot</text><line x1="150" y1="140" x2="150" y2="78" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/></svg><p class="muted">The dashed line is the view from the foot of the stairs. Staff coat hooks, holding a short jacket and an apron, sit right in it, in front of the window.</p>',
      why: 'A floor plan is a record you can check. It is a fact in this case, and it raises a question about what Jordan could really see from the foot of the stairs.' },
    { id: 'E7', title: 'Ghost tour script', kind: 'Tour handout', src: 'game', type: 'lore',
      body: '<p>"Meet <b>The Girl on the Back Stairs</b>, who has watched over this house for generations. Staff say she hums when the dining rooms go quiet."</p><p class="muted">No author. No sources. No dates.</p>',
      why: 'It is a story passed along with no named source and no evidence. A tour script is also selling something, which makes it more folklore than fact.' },
    { id: 'E8', title: 'Jordan’s social post', kind: 'Online post', src: 'game', type: 'spec',
      body: '<p>Posted a week after the incident:</p><p>"I always said this inn had a little girl. I SAW her. Two podcasts have asked me to come on."</p>',
      why: 'It is a belief stated as fact, and it says she believed it beforehand. It was written after the event, and it shows she now gains attention from the story. That is a reason to read it carefully.' },
    { id: 'E9', title: 'Stairwell audio clip, 10:52 PM', kind: 'Recording', src: 'game', type: 'mis',
      body: '<div class="photo" role="img" aria-label="A wavy sound line that rises and falls with no words in it"><span class="orb"></span></div><p>Recorded on a visitor’s phone from the stairwell. A low rising hum, about nine seconds long. The visitor says it is "a ghost humming a lullaby."</p>',
      why: 'It sounds spooky, but boilers, fans, and old pipes make low humming sounds. There are no words and no melody, so it has an ordinary explanation and cannot be treated as evidence of a voice.' }
  ],
  contra: [
    { id: 'a', t: 'Whether anyone was on the landing. Jordan saw a small figure. Luis says he walked past twice and saw no one.', ok: true },
    { id: 'b', t: 'Whether the landing light was on. Jordan says it was off. Luis says it was on both times.', ok: true },
    { id: 'c', t: 'Whether there was humming. Jordan heard a slow lullaby. Luis heard only the radiator knocking.', ok: true },
    { id: 'd', t: 'Whether both of them work at The Golden Lamb.', ok: false },
    { id: 'e', t: 'The time. Jordan places the figure at about 10:50. Luis says he was in the hall until 11:05.', ok: false }
  ],
  contraNote: 'The two times (about 10:50 and 11:05) describe different moments, so they are not a conflict. Both people working at The Golden Lamb does not conflict either.',
  checkRe: 'sensor|timer|motion|timeout|work order|radiator|boiler|pipe|knock',
  checkYes: 'You noticed the facilities note about the landing light. A light on a motion sensor can go dark on someone who stands still, then come on when someone walks up.',
  checkNo: 'Look again at E5. The facilities note says the landing light runs on a motion sensor that is slow to notice a person standing still.',
  theories: {
    nat: { n: 'Natural', d: 'A coat in a dim window, a sensor-timed light, and ordinary pipe and fan noise explain what was seen and heard. Nobody else was there.', sup: ['E4', 'E5', 'E6', 'E9'], ch: 'A natural theory still has to explain why Jordan was so sure she saw a child (E3, E8).' },
    psy: { n: 'Psychological', d: 'Jordan expected the girl from the tour story. A coat silhouette in a dark landing and a low hum were enough for her mind to fill in a child.', sup: ['E3', 'E5', 'E6', 'E7', 'E9'], ch: 'A psychological theory has to explain why the landing was dark and what made the hum (E5, E9).' },
    his: { n: 'Historical', d: 'The back-stair girl is an old story that changes each time it is retold, and Jordan was repeating it.', sup: ['E1', 'E2', 'E7'], ch: 'A historical theory explains where the story came from, but not what happened on this particular night.' },
    sup: { n: 'Supernatural', d: 'Something unexplained was really on the landing, and the ordinary explanations are not enough.', sup: ['E2', 'E3', 'E7'], ch: 'A supernatural theory has to rule out the sensor light (E5), the coat hooks (E6), and the ordinary sources of the hum (E9) first.' }
  }
};
