/* Haunting Files, Case 1: Cincinnati Music Hall (editable data object). This is the original training case, moved here unchanged.
   Saves made before cases existed belong to Case 1 (they keep the original save key, hf_save_v1).
   Real history (src:'real'): Music Hall opened in 1878 in Over-the-Rhine and is a National Historic Landmark (public records).
   Everything else is GAME MATERIAL. Intended strongest explanation: NATURAL (a sticking latch + a blocked sightline). */
(window.HF_CASES = window.HF_CASES || {})[1] = {
  code: 1, file: '0047', name: 'Cincinnati Music Hall', short: 'Music Hall', scene: 'the balcony at 10:40 PM', trustQ: 'the open door', strongest: 'nat',
  loc: 'Cincinnati Music Hall, Over-the-Rhine.',
  brief: ['Case file #0047 has been reopened: Cincinnati Music Hall, upper balcony.', 'Two witnesses. One open door. Everyone has a different story.', 'Your job is to decide what you can actually prove.'],
  intro: 'Your first assignment is a training case. It uses the real Cincinnati Music Hall, but the witness statements and most documents were written for this game. Each exhibit is labeled so you always know which is which.',
  rep: 'After a Saturday concert, an usher reports a figure in a gray coat on the upper balcony. A stagehand says nobody was there. The balcony door was found open.',
  repAssign: 'Write the opening of your field report (80 words or more). Put the reader on the balcony at 10:40 PM and describe what the witnesses would have experienced. Then state what you believe happened and cite at least two exhibits by number, like E5 or E6.',
  hintSense: 'Add what the balcony sounded, felt, or smelled like, not only how it looked.',
  hintTime: 'Investigators log times. Mention 10:40 or another time from the file.',
  ev: [
 {id:'E1',title:'Landmark record',kind:'Public record',src:'real',type:'fact',
  body:'<p>Cincinnati Music Hall opened in 1878 in the Over-the-Rhine neighborhood. It is a National Historic Landmark.</p><p class="muted">Anyone can check these details against public records.</p>',
  why:'It is a basic, checkable fact about the building, confirmed by public records. It tells you nothing yet about ghosts. It only tells you the building is real, old, and well documented.'},
 {id:'E2',title:'Burial ground accounts',kind:'Historical accounts',src:'real',type:'claim',
  body:'<p>Several local-history accounts describe the block as city burial ground before the hall was built. Historians disagree about how many graves were moved.</p>',
  why:'This is documented, but disputed. People wrote it down, and historians still argue about the details, so treat it as a claim you would want to verify, not a settled fact.'},
 {id:'E3',title:'Statement: Dana R., usher',kind:'Witness statement',src:'game',type:'eye',
  body:'<p><b>Dana R.</b> (usher, three seasons):</p><p>"The show ended around 10:30. I was on the main stair landing. The house lights were already down. I saw a tall man in a gray coat standing at the balcony rail, right in the middle. I called out and he did not turn. When I got up there the balcony door was standing wide open and the balcony was empty. It was about 10:40."</p>',
  why:'This is what one person says she saw and heard. It matters, but it is a personal account, and the rest of the file will test it.'},
 {id:'E4',title:'Statement: Marcus T., stagehand',kind:'Witness statement',src:'game',type:'eye',
  body:'<p><b>Marcus T.</b> (stagehand, eight seasons):</p><p>"I locked the balcony door at 10:15, after the last guests left the upper level. I had the only key on me. At 10:30 I switched on the balcony work lights to sweep. I was up there until about 10:50. Around 10:55 I heard footsteps behind me, but when I turned there was nobody. No one was on that balcony while I was there."</p>',
  why:'Another personal account of what someone saw and heard. It conflicts with Dana in several places, which is exactly why it is worth examining.'},
 {id:'E5',title:'Maintenance log',kind:'Building record',src:'game',type:'claim',
  body:'<p>10:20 PM. HVAC cycle started on upper level.</p><p>Note from facilities: "Balcony door latch sticks. Reported twice this season. Door swings open when air pressure changes. Work order pending."</p>',
  why:'It is a written record, so it is documented, but it is only as reliable as the person who wrote it. It fits Marcus\'s account of a locked door and offers a possible reason the door was open.'},
 {id:'E6',title:'Floor plan: upper level',kind:'Architectural record',src:'game',type:'fact',
  body:'<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="Floor plan. A column stands between the main stair landing and the middle of the balcony rail."><rect x="20" y="14" width="260" height="46" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="42" text-anchor="middle" font-size="12" fill="#2a2113">BALCONY</text><line x1="20" y1="60" x2="280" y2="60" stroke="#2a2113" stroke-width="4"/><text x="40" y="76" font-size="10" fill="#2a2113">rail</text><rect x="272" y="28" width="8" height="18" fill="#c0303a"/><text x="226" y="22" font-size="10" fill="#c0303a">door (latch)</text><circle cx="150" cy="104" r="9" fill="#2a2113"/><text x="166" y="108" font-size="10" fill="#2a2113">column</text><rect x="115" y="140" width="70" height="30" fill="none" stroke="#2a2113" stroke-width="2"/><text x="150" y="159" text-anchor="middle" font-size="10" fill="#2a2113">stair landing</text><line x1="150" y1="140" x2="150" y2="62" stroke="#c0303a" stroke-width="2" stroke-dasharray="5 4"/></svg><p class="muted">The dashed line is the view from the landing to the middle of the rail. The column blocks it.</p>',
  why:'A floor plan is a record you can measure and check. It is a verified fact in this case, and it raises a question about what Dana could really see from the landing.'},
 {id:'E7',title:'Ghost tour brochure',kind:'Lobby brochure',src:'game',type:'lore',
  body:'<p>"Meet <b>The Man in the Gray Coat</b>, who has roamed the balcony for over a century. Staff say he appears after every sold-out concert."</p><p class="muted">No author. No sources. No dates.</p>',
  why:'It is a story passed along with no named source and no evidence. A tour brochure is also selling something, which makes it more folklore than fact.'},
 {id:'E8',title:'Dana\'s blog post',kind:'Online post',src:'game',type:'spec',
  body:'<p>Posted two weeks after the incident:</p><p>"I always knew this place was haunted. I SAW him. Now everyone believes me and the tour guides keep asking for my story."</p>',
  why:'It is a belief stated as fact, and she says she always believed it before the incident. It was written after the event, and it shows she now gains attention from the story. That is a reason to read it carefully.'},
 {id:'E9',title:'Visitor photo, 10:42 PM',kind:'Photograph',src:'game',type:'mis',
  body:'<div class="photo" role="img" aria-label="Dark photo of a balcony with one bright round spot"><span class="orb"></span></div><p>Taken with flash from the main floor. A bright round spot hovers near the balcony rail. The visitor says it is "a spirit orb."</p>',
  why:'It looks like proof, but a flash can light up dust or moisture in the air and create a round bright spot. It has an ordinary explanation, so it cannot be treated as evidence of a spirit.'}
],
  contra: [
 {id:'a',t:'Whether anyone was on the balcony. Dana saw a man at the rail. Marcus says no one was there.',ok:true},
 {id:'b',t:'Whether the balcony door was locked. Dana found it wide open. Marcus says he locked it and had the only key.',ok:true},
 {id:'c',t:'How well lit the area was. Dana says the lights were down. Marcus says he switched the balcony work lights on.',ok:true},
 {id:'d',t:'Whether both of them work at Music Hall.',ok:false},
 {id:'e',t:'The time. Dana saw the figure at about 10:40. Marcus heard footsteps at about 10:55.',ok:false}
],
  contraNote: 'The time difference (10:40 and 10:55) describes two different moments, so it is not a conflict. Both witnesses working at the hall does not conflict either.',
  checkRe: 'latch|maintenance|\\blog\\b|hvac|air pressure|draft',
  checkYes: 'You noticed the maintenance record about the latch. A door can swing open when air pressure changes, with no one opening it.',
  checkNo: 'Look again at E5. The maintenance log says the balcony latch sticks and the door swings open when air pressure changes.',
  theories: {
 nat:{n:'Natural',d:'The door swung open on its own and nobody was there. Dana saw something ordinary from a bad angle.',sup:['E4','E5','E6','E9'],ch:'A natural theory still has to explain why Dana saw a figure at all (E3).'},
 psy:{n:'Psychological',d:'Dana expected a ghost and her mind filled in a figure in dim light from a partly blocked view.',sup:['E3','E6','E7','E8'],ch:'A psychological theory has to account for the open door, which Dana did not imagine (E3, E5).'},
 his:{n:'Historical',d:'The gray-coat legend grew out of real history, and it changes shape each time it is retold.',sup:['E1','E2','E7'],ch:'A historical theory explains where the legend came from, but not what happened on this particular night.'},
 sup:{n:'Supernatural',d:'Something unexplained was really there, and the ordinary explanations are not enough.',sup:['E2','E3','E7'],ch:'A supernatural theory has to rule out the sticking latch (E5) and the blocked sightline (E6) first.'}
}
};
