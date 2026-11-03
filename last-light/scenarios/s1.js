/* The Last Light, Scenario 1: Haven Ridge (editable data object). This is the original story, moved here unchanged.
   Saves made before scenarios existed belong to Scenario 1 (they keep the original save key, tll_save_v1).
   Everything in The Last Light is fiction. The year is 2047; The Silence began at 11:47 p.m. on October 31, 2026.
   Cause of The Silence in this scenario (revealed only as clues): an experiment at an underground facility, Site Nine, run by Meridian Systems. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[1] = {
  code: 1, name: 'Haven Ridge',
  map: { poly: '40,60 150,50 200,70 260,55 350,40 358,150 350,230 320,300 280,370 210,400 110,385 40,370', labels: [[52, 46, 'Toledo'], [270, 34, 'Cleveland'], [150, 196, 'Columbus']] },
  locs: {
    home: { n: 'Haven Ridge', i: 'H', x: 17, y: 52, d: 'Your settlement. The radio room is in the old grain elevator. Tonight the receiver is picking up something.' },
    cin: { n: 'Abandoned Cincinnati', i: 'C', x: 15, y: 86, d: 'A drowned skyline over the river. Pharmacies, stores, and offices still hold supplies, if the floors hold you.' },
    hol: { n: 'Hollow Creek', i: 'W', x: 63, y: 62, d: 'A rural crossroads with a burned-out gas station and a church on the hill. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'Site Nine', i: 'U', x: 31, y: 70, d: 'An underground facility.' },
    moo: { n: 'Moonville Tunnel', i: 'M', x: 57, y: 82, d: 'An abandoned railroad tunnel in the hills, wrapped in old stories.' },
    twr: { n: 'Radio Tower', i: 'T', x: 42, y: 46, d: 'A tall tower east of Haven Ridge.' }
  },
  wake: 'wakes in Haven Ridge. The radio is speaking.',
  leads: 'The signal leads somewhere underground.',
  signal: {
    freq: 964, hint: 'Radio operator: strong stations in this region cluster in the mid-90s.',
    room: 'It is past two in the morning. The grain elevator hums with the wind. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... if you can hear this ... do not go looking for the light ...',
    msg: 'IF YOU CAN HEAR THIS, DO NOT GO LOOKING FOR THE LIGHT',
    tx: ['[CLEAR] If you can hear this, do not go looking for the light.', '[CLEAR] Repeat. If you can hear this, do not go looking for the light.', '[BACKGROUND] A low horn, like a train.'],
    obs: [
      { id: 'a', t: 'The message repeats on a perfectly regular timer, 11 minutes 47 seconds apart.', ok: true, w: 'A perfectly regular repeat suggests a recording or an automated transmitter, not a person calling live.' },
      { id: 'b', t: 'The speaker says "the light" but never explains what it is.', ok: true, w: 'An unexplained "light" means the speaker assumes you already know. Who would assume that?' },
      { id: 'c', t: 'A train horn sounds in the background, though no trains have run since 2026.', ok: true, w: 'No trains run, so either the recording is very old or someone is faking the setting.' },
      { id: 'd', t: 'The speaker sounds out of breath and keeps looking over their shoulder, judging by the pauses.', ok: true, w: 'A rushed speaker suggests real fear, which fits a warning from someone in danger.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The message is spoken in English.', ok: false, w: 'Language tells you nothing about trust. It is not a clue.' }
    ],
    decode: null
  },
  supply: {
    intro: 'A pharmacy and grocery on the first floor of a leaning office tower. The river has taken the street. Water ripples across the lobby tile, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the back stairs are flooded and the ceiling in the east aisle sags. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler behind the counter.',
    upstairs: 'As you head for the door, something shifts on the floor above. Dust sifts down through your flashlight beam.',
    notebook: 'A survivor\'s notebook upstairs: "They told us not to follow the light. We went anyway."',
    hazEx: 'like the flooded stairs or the sagging ceiling',
    items: {
      food: 'Canned food (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Fuel can', crank: 'Hand-crank radio',
      box: { n: 'Archive box: photos and maps', clue: 'The archive box has a 2026 map. One building is circled: "Meridian Systems, sub-level 3."' },
      lan: { n: 'Employee lanyard', clue: 'The lanyard reads "Meridian Systems. Authorized: Level 3 and below."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Wren', g: 'f',
    open: 'At the crossroads, a woman steps out from the burned-out gas station with her hands open and visible. Her jacket is torn. She looks like she has not slept.',
    quote: '"I\'m Wren. I walked here from Toledo. Six days. My brother broke his leg falling off a roof. He\'s at the church. Please, I need medicine."',
    warned: 'She glances at your pack. "Someone left a note on a door in Cincinnati. It kept my cousin off a bad floor. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask what is wrong with her brother.', inspect: 'Look at her more closely.', route: 'Ask where she slept on the way.' },
    brother: { say: '"He has... a fever now. It\'s in his chest. He coughs. It\'s the infection from his leg, I think. He\'s getting worse."', note: 'Earlier she said a broken leg. Now she describes a fever and a cough.' },
    inspect: { say: '"Why are you staring? I\'m just tired."', trust: 'You notice the badge clipped inside her jacket. Your trusting nature makes you skim over the rest. ', full: 'You notice her boots, caked in red clay, and a hospital badge inside her jacket. ', med: 'Medical assistant: the way she touches the badge is practiced, like someone who wore it every shift. ', mil: 'Military family: she stands where she can see both exits.' },
    route: { say: '"I slept in barns. I\'ve never been south of Columbus in my life. I don\'t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I\'m lying? Fine. My brother... it\'s his leg, his chest, I don\'t know. I\'m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven\'t been spoken to kindly in a long time." She glances back down the road.' },
    block: { say: '"Move! They could be right behind me." She catches herself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'Her boots are caked in red river-hill clay. She says she walked from flat, northern Toledo.',
      badge: 'A hospital badge is clipped inside her jacket: "Riverside Mercy, Cincinnati. Night Shift."',
      story: 'Her story about her brother changed: first a broken leg, then a fever and a cough.',
      road: 'She keeps checking the road behind her, as if watching for someone.',
      never: 'She said, "I\'ve never been south of Columbus in my life." That conflicts with the Cincinnati badge.',
      nurse: 'When you asked gently, she admitted she is a nurse. She still has not said where from.'
    },
    admit: '"...Okay. I\'m a nurse. I wasn\'t always honest with you, because honesty has cost me before."',
    ask: 'Wren will not answer direct questions.',
    helpLog: 'Helped Wren. She gave you a battery and a name: Site Nine.', helpClue: 'Wren whispers a name: "Site Nine." She will not say more.',
    tradeClue: 'Wren warns: "Do not follow the signal to the tower. It is bait."',
    placeRe: 'crossroads|hollow|creek|church|gas station|station|north|south|east|west|road', foundRe: 'woman|wren|stranger|nurse|survivor|person|signal|girl|someone',
    placeTip: 'the crossroads, the church, the road', foundTip: 'a woman, a stranger, a signal'
  }
};
