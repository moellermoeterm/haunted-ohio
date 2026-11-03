/* The Last Light, Scenario 5: Saltlick Depot (editable data object). Everything here is fiction set in 2047.
   Transmission puzzle: a voice spells a word with a phonetic alphabet; the first letters spell the key word. Cause of The Silence in this
   scenario (revealed only as clues): the failure of a satellite relay network, the "Aurora relay chain", when "Node 12" dropped out at
   11:47 p.m. on October 31, 2026. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[5] = {
  code: 5, name: 'Saltlick Depot',
  map: { poly: '60,70 150,56 230,60 300,50 350,90 356,180 340,260 310,330 260,372 190,392 120,372 62,320 46,220', labels: [[200, 130, 'Zanesville'], [90, 270, 'Athens'], [300, 300, 'Marietta']] },
  locs: {
    home: { n: 'Saltlick Depot', i: 'S', x: 62, y: 46, d: 'Your settlement. The radio room is the old rail depot’s signal tower. Tonight the receiver is picking up something.' },
    cin: { n: 'Abandoned Athens', i: 'A', x: 28, y: 76, d: 'A hollow hill town. A campus clinic and a bookstore still hold supplies, if the stairs hold you.' },
    hol: { n: 'Coal Run Bridge', i: 'R', x: 74, y: 72, d: 'A washed-out bridge with a shuttered diner and a stalled bus on the near bank. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'Node Twelve', i: 'U', x: 48, y: 84, d: 'A sealed satellite ground station.' },
    moo: { n: 'Mine Seven', i: 'M', x: 84, y: 40, d: 'A collapsed coal mine in the hills, wrapped in old stories.' },
    twr: { n: 'Hilltop Dish', i: 'T', x: 40, y: 30, d: 'A huge radio dish on the hill west of Saltlick Depot.' }
  },
  wake: 'wakes in Saltlick Depot. The radio is speaking.',
  leads: 'The signal leads to a sealed satellite ground station.',
  signal: {
    freq: 947, hint: 'Radio operator: strong stations in this region cluster in the mid-90s, a little below the old city stations.',
    room: 'It is past two in the morning. The depot signal tower creaks in the wind. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... a voice spelling out words, one letter at a time ...',
    msg: 'WATER AT THE DEPOT WELL. BRING EMPTY CANS. COME BEFORE DAWN.',
    dialMsg: 'WHISKEY, ALPHA, TANGO, ECHO, ROMEO',
    tx: ['[CLEAR] Water at the depot well.', '[CLEAR] Bring empty cans. Come before dawn.', '[BACKGROUND] A dog barks once, then stops.'],
    obs: [
      { id: 'a', t: 'The message offers water and sets a deadline: "before dawn."', ok: true, w: 'An offer with a deadline can be pressure to act before you think it through.' },
      { id: 'b', t: 'A dog barks once, then stops suddenly.', ok: true, w: 'A sudden stop could mean the sound is a recording, or that something frightened the dog.' },
      { id: 'c', t: 'The speaker says "the depot well" and gives no town.', ok: true, w: 'No town named means the speaker expects you to know which depot. Who would assume that?' },
      { id: 'd', t: 'The speaker spells the key word with a phonetic alphabet, like trained radio users.', ok: true, w: 'A phonetic alphabet suggests training, which suggests an organized sender.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The message is short.', ok: false, w: 'Length tells you nothing about whether the message is honest.' }
    ],
    decode: { kind: 'type', answer: 'WATER', intro: 'A voice spells a word with a phonetic alphabet: one word for each letter. Take the first letter of each word and type the key word they spell.', hint: 'Example: "Alpha" stands for A, "Bravo" for B.' }
  },
  supply: {
    intro: 'A campus clinic and bookstore on the ground floor of a brick hall. Water stains run down the walls, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the back stairs have rotted treads and the ceiling in the east hall sags. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler behind the clinic desk.',
    upstairs: 'As you head for the door, something shifts on the floor above. Plaster dust sifts down through your flashlight beam.',
    notebook: 'A survivor’s notebook upstairs: "Every screen went to static at the same instant. The old dish on the hill kept turning."',
    haz: 'tread|plaster|brick|stair|hall|beam',
    hazEx: 'like the rotted stair treads or the sagging ceiling',
    items: {
      food: 'Canned peaches and beans (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Fuel can', crank: 'Hand-crank radio',
      box: { n: 'Department files', clue: 'The files hold a 2026 network chart. One node is circled: "Aurora relay chain. Node 12 offline 11:47 PM. All ground links fail if it drops."' },
      lan: { n: 'Contractor badge', clue: 'The badge reads "Aurora Relay. Ground crew. Node 12."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Rook', g: 'm',
    open: 'At the bridge, a man steps out from the shuttered diner with his hands open and visible. His coat is torn. He looks like he has not slept.',
    quote: '"I’m Rook. I worked the coal cars out of Cadiz. Five days on foot. My brother is hurt in the bus. Please, I need medicine."',
    warned: 'He glances at your pack. "Someone left a note on a door in Athens. It kept my cousin off a bad stair. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask what is wrong with his brother.', inspect: 'Look at him more closely.', route: 'Ask where he slept on the way.' },
    brother: { say: '"He... it’s a burn now. From the stove in the bus. And his hands shake. He’s getting worse."', note: 'Earlier he said his brother was hurt. Now he describes a burn, and shaking hands.' },
    inspect: { say: '"Why are you staring? I’m just tired."', trust: 'You notice a small keycard clipped inside his jacket. Your trusting nature makes you skim over the rest. ', full: 'You notice his hands, clean and free of coal dust, and a small keycard clipped inside his jacket. ', med: 'Medical assistant: his sunburn stops in a hard line at the collar, like someone who spent long days outdoors in a uniform. ', mil: 'Military family: he stands where he can see both exits.' },
    route: { say: '"I slept in barns. I’ve never been near a dish or a tower in my life. I don’t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I’m lying? Fine. My brother... it’s the burn, the shaking, I don’t know. I’m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven’t been spoken to kindly in a long time." He glances back down the road.' },
    block: { say: '"Move! They could be right behind me." He catches himself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'His hands are clean, with no coal dust in the cracks of his skin. He says he worked the coal cars.',
      badge: 'A small keycard is clipped inside his jacket: "Aurora Relay. Ground crew."',
      story: 'His story about his brother changed: first hurt, then a burn, then shaking hands.',
      road: 'He keeps checking the road behind him, as if watching for someone.',
      never: 'He said, "I’ve never been near a dish or a tower in my life." That conflicts with a ground-crew keycard.',
      nurse: 'When you asked gently, he admitted he was ground crew. He still has not said at which station.'
    },
    admit: '"...Okay. I was ground crew for the Aurora relays. I wasn’t always honest with you, because honesty has cost me before."',
    helpLog: 'Helped Rook. He gave you a battery and a name: Node Twelve.', helpClue: 'Rook whispers a name: "Node Twelve." He will not say more.',
    tradeClue: 'Rook warns: "Do not follow the signal to the dish. It is bait."',
    placeRe: 'bridge|diner|bus|river|run|north|south|east|west|road|bank', foundRe: 'man|rook|stranger|crew|survivor|person|signal|someone',
    placeTip: 'the bridge, the diner, the road', foundTip: 'a man, a stranger, a signal'
  }
};
