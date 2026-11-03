/* Haunting Files, Case 5: The Ohio State Reformatory, Mansfield (editable data object).
   REAL HISTORY (src:'real') is limited to what several sources agreed on when checked by web search (Nov 2026): Cleveland architect
   Levi T. Scofield designed the building; its first inmates arrived in 1896; it closed in 1990 after a federal court order; a preservation
   society formed in 1995 and the building is now a historic site and museum. Dates for the long construction vary by source, so none are given.
   The popular ghost stories about this place could not be traced to documents, and none of them are used. No real person or death is
   mentioned. Every person, quote and record below is GAME MATERIAL.
   Intended strongest explanation: NATURAL (steel that cools and contracts, plus a long echo). */
(window.HF_CASES = window.HF_CASES || {})[5] = {
  code: 5, file: '0052', name: 'The Ohio State Reformatory', short: 'Reformatory', scene: 'the cell block floor at 7:20 PM', trustQ: 'whether anyone was on the upper tier', strongest: 'nat',
  loc: 'The Ohio State Reformatory, Mansfield, Ohio.',
  brief: ['Case file #0052 has been reopened: The Ohio State Reformatory, cell block, upper tier.', 'Two witnesses. One clang. Footsteps that may or may not have been there.', 'Your job is to decide what you can actually prove.'],
  intro: 'This case uses the real Ohio State Reformatory in Mansfield, but the witness statements and most documents were written for this game. Each exhibit is labeled so you always know which is which.',
  rep: 'During an evening tour, a visitor reports a loud metallic clang and then footsteps on the upper tier. The guide says the tier was closed and nobody was up there.',
  repAssign: 'Write the opening of your field report (80 words or more). Put the reader on the cell block floor at 7:20 PM and describe what the witnesses would have experienced. Then state what you believe happened and cite at least two exhibits by number, like E5 or E6.',
  hintSense: 'Add what the cell block sounded, felt, or smelled like, not only how it looked.',
  hintTime: 'Investigators log times. Mention 7:20 or another time from the file.',
  ev: [
    { id: 'E1', title: 'Architect and first inmates', kind: 'Public record', src: 'real', type: 'fact',
      body: '<p>The Ohio State Reformatory in Mansfield was designed by Cleveland architect Levi T. Scofield. Its first inmates arrived in 1896.</p><p class="muted">Several sources agree on this. You could check them.</p>',
      why: 'It is a basic, checkable fact that several sources agree on. It tells you the building is real, old, and well documented. It says nothing yet about ghosts.' },
    { id: 'E2', title: 'Closing and preservation', kind: 'Public record', src: 'real', type: 'fact',
      body: '<p>The prison closed in 1990 after a federal court order. A preservation society formed in 1995, and the building now operates as a historic site and museum.</p><p class="muted">Several sources agree on this.</p>',
      why: 'It is another checkable fact. It tells you why the building is open to visitors today. A building that welcomes crowds at night is a good reason to think about sound, light, and suggestion.' },
    { id: 'E3', title: 'Statement: Sam N., visitor', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Sam N.</b> (evening tour visitor):</p><p>"It was about 7:20. We were standing on the cell block floor when there was a huge metallic clang above us. Right after it, I heard slow footsteps walking along the upper tier, keeping pace with our group. It was pitch dark up there. Nobody is allowed on that tier, so who was walking?"</p>',
      why: 'This is what one person says he heard. It matters, but it is a personal account, and the rest of the file will test it.' },
    { id: 'E4', title: 'Statement: Jo A., tour guide', kind: 'Witness statement', src: 'game', type: 'eye',
      body: '<p><b>Jo A.</b> (volunteer guide, four seasons):</p><p>"I heard the clang at about 7:25, one single bang from the upper tier. Then a few quiet ticks and nothing. That tier is closed to visitors, and a staff member checked it at 7:00 and found it empty. The tier lights were on, but dimmed, for the tour. I did not hear a pattern of footsteps."</p>',
      why: 'Another personal account of what someone heard. It conflicts with Sam in several places, which is exactly why it is worth examining.' },
    { id: 'E5', title: 'Facilities note', kind: 'Building record', src: 'game', type: 'claim',
      body: '<p>Cell block heating shuts off at 6:30 PM on tour nights. Steel tiers and stair treads cool and contract; staff report popping and clanging in the first hour afterward.</p><p>Note: the tier gate latch rattles in drafts. Work order pending.</p>',
      why: 'It is a written record, so it is documented, but only as reliable as whoever wrote it. It fits Jo’s account of one bang followed by quiet ticks and offers an ordinary reason steel could clang with no one touching it.' },
    { id: 'E6', title: 'Sound path diagram', kind: 'Acoustic sketch', src: 'game', type: 'fact',
      body: '<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="Diagram. A clang on the upper tier reaches the visitor directly. The same sound bounces off a far hard wall and arrives a moment later, so it can sound like a second noise."><rect x="30" y="30" width="240" height="8" fill="#2a2113"/><text x="34" y="26" font-size="10" fill="#2a2113">upper tier (steel)</text><rect x="266" y="30" width="8" height="130" fill="#2a2113"/><text x="176" y="150" font-size="10" fill="#2a2113">far hard wall</text><circle cx="90" cy="150" r="9" fill="#2a2113"/><text x="64" y="176" font-size="10" fill="#2a2113">visitor</text><line x1="110" y1="34" x2="92" y2="140" stroke="#c0303a" stroke-width="2"/><line x1="130" y1="34" x2="262" y2="90" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/><line x1="262" y1="90" x2="98" y2="144" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/></svg><p class="muted">One clang reaches the visitor twice: once straight down, and once a fraction of a second later after bouncing off the far wall.</p>',
      why: 'A sketch of how sound travels is a record you can check against how echoes work. It is a fact in this case, and it raises a question about whether one clang plus its echo could be heard as “footsteps.”' },
    { id: 'E7', title: 'Tour brochure', kind: 'Handout', src: 'game', type: 'lore',
      body: '<p>"The cell block is never silent. Footsteps on empty tiers have been heard for decades."</p><p class="muted">No author. No sources. No dates.</p>',
      why: 'It is a story passed along with no named source and no evidence. A tour brochure is also selling tickets, which makes it more folklore than fact.' },
    { id: 'E8', title: 'Sam’s social post', kind: 'Online post', src: 'game', type: 'spec',
      body: '<p>Posted the next morning:</p><p>"I heard someone walking the tier right above me. I will never doubt this place again. A paranormal channel asked me for an interview."</p>',
      why: 'It is a belief stated as fact, and it was written after the event. It shows he now gains attention from the story. That is a reason to read it carefully.' },
    { id: 'E9', title: 'Audio clip, 7:21 PM', kind: 'Recording', src: 'game', type: 'mis',
      body: '<div class="photo" role="img" aria-label="A sound wave with a loud spike followed by several small spikes"><span class="orb"></span></div><p>A visitor’s phone recording: one loud clang, then a run of small metallic ticks. The visitor says the ticks are "something tapping back."</p>',
      why: 'It sounds spooky, but cooling steel pops and ticks as it contracts, and an echo can repeat a clang. It has an ordinary explanation, so it cannot be treated as evidence that something is tapping back.' }
  ],
  contra: [
    { id: 'a', t: 'Whether anyone could have been on the upper tier. Sam heard someone walking up there. Jo says it was closed and was checked empty at 7:00.', ok: true },
    { id: 'b', t: 'What the sound was after the clang. Sam heard slow footsteps keeping pace with the group. Jo heard a few quiet ticks and no pattern of steps.', ok: true },
    { id: 'c', t: 'Whether the tier was lit. Sam says it was pitch dark up there. Jo says the tier lights were on, dimmed.', ok: true },
    { id: 'd', t: 'Whether both of them were on the evening tour.', ok: false },
    { id: 'e', t: 'The time of the clang. Sam says about 7:20. Jo says about 7:25.', ok: false }
  ],
  contraNote: 'Sam and Jo give slightly different times for the same clang, which is ordinary rounding, not a conflict. Both of them being on the tour does not conflict either.',
  checkRe: 'heat|cool|contract|steel|expan|latch|draft|facilities|echo|tread|pop',
  checkYes: 'You noticed the facilities note. Steel that cools after the heat goes off can pop and clang, with no one touching it, which fits one bang followed by quiet ticks.',
  checkNo: 'Look again at E5. The facilities note says the heat shuts off at 6:30 PM and the steel tiers contract and clang in the first hour afterward.',
  theories: {
    nat: { n: 'Natural', d: 'Cooling steel clanged, a long echo repeated it, and a rattling gate latch added ticks. Nobody was on the tier.', sup: ['E4', 'E5', 'E6', 'E9'], ch: 'A natural theory still has to explain why Sam was so sure he heard footsteps keeping pace with the group (E3, E8).' },
    psy: { n: 'Psychological', d: 'The visitors had been told footsteps are common here, and in the dark an echo and a few ticks were enough for Sam’s mind to supply a walker.', sup: ['E3', 'E7', 'E8'], ch: 'A psychological theory has to account for the clang itself, which both witnesses heard (E4, E5).' },
    his: { n: 'Historical', d: 'The building’s long history as a prison makes people expect footsteps, and the “never silent” story keeps getting repeated.', sup: ['E1', 'E2', 'E7'], ch: 'A historical theory explains why people expect footsteps, but not what made the sound on this particular night.' },
    sup: { n: 'Supernatural', d: 'Something unexplained was really walking the tier, and the ordinary explanations are not enough.', sup: ['E3', 'E7'], ch: 'A supernatural theory has to rule out the cooling steel (E5) and the echo (E6, E9) first.' }
  }
};
