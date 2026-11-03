/* The Last Light, Scenario 3: Ashgrove Silo (editable data object). Everything here is fiction set in 2047.
   Transmission puzzle: a letter-shift code (shift of 3). Cause of The Silence in this scenario (revealed only as clues): a failed national
   alert test, "Project Beacon", run from a relay station called Relay Seven at 11:47 p.m. on October 31, 2026. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[3] = {
  code: 3, name: 'Ashgrove Silo',
  map: { poly: '50,50 140,44 210,60 280,48 350,52 355,140 345,225 325,305 285,365 215,395 120,390 48,360', labels: [[60, 44, 'Marion'], [138, 240, 'Dayton'], [250, 214, 'Columbus']] },
  locs: {
    home: { n: 'Ashgrove Silo', i: 'A', x: 55, y: 44, d: 'Your settlement. The radio room is at the top of a farm co-op grain silo. Tonight the receiver is picking up something.' },
    cin: { n: 'Abandoned Columbus', i: 'C', x: 62, y: 70, d: 'A hollow downtown. A drugstore in a collapsed parking garage and offices above still hold supplies, if the concrete holds you.' },
    hol: { n: 'Brightwater Crossing', i: 'W', x: 28, y: 68, d: 'A shallow ford under a rusted rail trestle, with a burned-out feed store on the bank. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'Relay Seven', i: 'U', x: 82, y: 40, d: 'A sealed relay station.' },
    moo: { n: 'Mill Dam', i: 'M', x: 38, y: 86, d: 'A broken dam on a quiet river, wrapped in old stories.' },
    twr: { n: 'Old Water Tower', i: 'T', x: 70, y: 24, d: 'A tall water tower on the hill north of Ashgrove Silo.' }
  },
  wake: 'wakes in Ashgrove Silo. The radio is speaking.',
  leads: 'The signal leads to a sealed relay station.',
  signal: {
    freq: 1007, hint: 'Radio operator: strong stations in this region sit near the top of the dial, around 100.',
    room: 'It is past two in the morning. The silo ticks as it cools. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... a flat voice reading letters that make no sense ...',
    msg: 'STAY OFF THE OLD HIGHWAY AFTER DARK',
    dialMsg: 'VWDB RII WKH ROG KLJKZDB DIWHU GDUN',
    tx: ['[CLEAR] Stay off the old highway after dark.', '[CLEAR] Repeat. Stay off the old highway after dark.', '[BACKGROUND] A steady three-note chime, like an alert tone.'],
    obs: [
      { id: 'a', t: 'The warning was sent in a simple letter-shift code, which takes effort for a plain warning.', ok: true, w: 'Someone chose to hide the words. Either the sender fears other listeners, or they want only careful people to understand.' },
      { id: 'b', t: 'A steady three-note chime sounds under the voice, like an old alert tone.', ok: true, w: 'An alert chime suggests the speaker has access to official alert equipment, or a recording of it.' },
      { id: 'c', t: 'The speaker names "the old highway" but not which one.', ok: true, w: 'An unnamed road means the speaker expects you to know. Who would assume that?' },
      { id: 'd', t: 'The voice reads each word with the same flat rhythm, like text read from a page.', ok: true, w: 'A flat, even reading suggests a prepared message, not someone live in danger.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The speaker’s voice sounds deep.', ok: false, w: 'Voice pitch tells you nothing about whether the message is honest.' }
    ],
    decode: { kind: 'shift', shift: 3, intro: 'The voice is clear, but the words make no sense. Every letter was moved forward by the same number of places. Slide the shift until the message reads as plain English.' }
  },
  supply: {
    intro: 'A drugstore on the ground level of a collapsed parking garage. Slabs of concrete lean against each other, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the ramp is cracked and the slab over the east aisle sags. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler behind the pharmacy counter.',
    upstairs: 'As you head for the ramp, something shifts on the level above. Dust sifts down through your flashlight beam.',
    notebook: 'A survivor’s notebook upstairs: "The chime came first. Then every radio went quiet."',
    haz: 'ramp|slab|concrete|garage|pillar|rebar',
    hazEx: 'like the cracked ramp or the sagging slab',
    items: {
      food: 'Canned soup and crackers (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Fuel can', crank: 'Hand-crank radio',
      box: { n: 'Utility records box', clue: 'The records box holds a 2026 test schedule. One line is circled: "Beacon alert test, all relays, 11:47 PM. Relay Seven is the master."' },
      lan: { n: 'Technician badge', clue: 'The badge reads "Project Beacon. Relay Seven. Technician."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Hollis', g: 'm',
    open: 'At the ford, a man steps out from behind the burned-out feed store with his hands open and visible. His coat is torn. He looks like he has not slept.',
    quote: '"I’m Hollis. I drove a truck out of Dayton until the fuel ran out. Four days on foot. My partner has a bad cut at the trestle. Please, I need medicine."',
    warned: 'He glances at your pack. "Someone left a note on a door in Columbus. It kept my cousin off a bad ramp. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask how his partner got hurt.', inspect: 'Look at him more closely.', route: 'Ask where he slept on the way.' },
    brother: { say: '"It’s... a burn now. From a cook fire. It’s turning bad. He says it hurts to breathe. It’s getting worse."', note: 'Earlier he said his partner had a cut. Now he describes a burn, and trouble breathing.' },
    inspect: { say: '"Why are you staring? I’m just tired."', trust: 'You notice a sealed metal case strapped under his coat. Your trusting nature makes you skim over the rest. ', full: 'You notice his boots, clean of any road grease, and a sealed metal case strapped under his coat. ', med: 'Medical assistant: his hands shake in a fine, steady way, like someone who has gone a long time without sleep or food. ', mil: 'Military family: he stands where he can see both exits.' },
    route: { say: '"I slept in the truck cab. I’ve never left Dayton in my life. I don’t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I’m lying? Fine. My partner... it’s the cut, the burn, I don’t know. I’m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven’t been spoken to kindly in a long time." He glances back down the road.' },
    block: { say: '"Move! They could be right behind me." He catches himself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'His boots are clean of the grease and grime of a truck cab, and show no wear. He says he drove a truck for years.',
      badge: 'A sealed metal case is strapped under his coat, stamped: "Project Beacon. Courier."',
      story: 'His story about his partner changed: first a cut, then a burn and trouble breathing.',
      road: 'He keeps checking the road behind him, as if watching for someone.',
      never: 'He said, "I’ve never left Dayton in my life." That conflicts with a case stamped for a courier route.',
      nurse: 'When you asked gently, he admitted he was a courier. He still has not said what he is carrying.'
    },
    admit: '"...Okay. I was a courier for Project Beacon. I wasn’t always honest with you, because honesty has cost me before."',
    helpLog: 'Helped Hollis. He gave you a battery and a name: Relay Seven.', helpClue: 'Hollis whispers a name: "Relay Seven." He will not say more.',
    tradeClue: 'Hollis warns: "Do not follow the signal to the tower. It is bait."',
    placeRe: 'ford|crossing|trestle|feed|store|river|north|south|east|west|road|bank', foundRe: 'man|hollis|stranger|courier|survivor|person|signal|someone',
    placeTip: 'the ford, the trestle, the road', foundTip: 'a man, a stranger, a signal'
  }
};
