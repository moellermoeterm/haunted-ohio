/* The Last Light, Scenario 2: Gull Harbor (editable data object). Everything here is fiction set in 2047.
   Cause of The Silence in this scenario (revealed only as clues): a grid shutdown ordered at 11:47 p.m. on October 31, 2026 at "Station Four"
   of the (made-up) Lake Erie Grid Authority, which never came back on. Real places named on the map are only used as place names. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[2] = {
  code: 2, name: 'Gull Harbor',
  map: { poly: '40,72 130,62 220,70 310,58 360,72 358,160 350,240 320,310 270,370 200,400 110,385 40,360', labels: [[52, 56, 'Toledo'], [150, 52, 'Sandusky'], [290, 50, 'Cleveland'], [190, 214, 'Mansfield']] },
  locs: {
    home: { n: 'Gull Harbor', i: 'G', x: 50, y: 17, d: 'Your settlement. The radio room is the old harbor master’s office above the boat slips. Tonight the receiver is picking up something.' },
    cin: { n: 'Drowned Sandusky', i: 'S', x: 34, y: 33, d: 'A marina town half under the lake. Chandleries, pharmacies, and a grocery still hold supplies, if the docks hold you.' },
    hol: { n: 'Marsh Landing', i: 'L', x: 70, y: 45, d: 'A boat landing at the edge of a reed marsh, with a collapsed bait shop and a chapel on stilts. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'Station Four', i: 'U', x: 28, y: 64, d: 'A sealed grid control station.' },
    moo: { n: 'Breakwater Light', i: 'B', x: 56, y: 6, d: 'A lighthouse at the end of a long breakwater, dark for twenty years.' },
    twr: { n: 'Ridge Tower', i: 'T', x: 78, y: 66, d: 'A tall relay tower on the ridge south of Gull Harbor.' }
  },
  wake: 'wakes in Gull Harbor. The radio is speaking.',
  leads: 'The signal leads to a sealed grid control station.',
  signal: {
    freq: 921, hint: 'Radio operator: strong stations on this shore cluster near 92.',
    room: 'It is past two in the morning. Wind rattles the windows of the harbor master’s office. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... do not answer the bell ... keep your lamps dark ...',
    msg: 'DO NOT ANSWER THE BELL. KEEP YOUR LAMPS DARK.',
    tx: ['[CLEAR] To anyone on the shore: do not answer the bell.', '[CLEAR] Repeat. Do not answer the bell. Keep your lamps dark.', '[BACKGROUND] A slow, hollow ring, like a ship’s bell.'],
    obs: [
      { id: 'a', t: 'The message repeats at uneven gaps: 6 minutes, then 9, then 7.', ok: true, w: 'Uneven gaps suggest a person pressing a key, or a machine under strain, not a clean recording. Something is still running out there.' },
      { id: 'b', t: 'The speaker says "the bell" but never says where it is.', ok: true, w: 'An unexplained "bell" means the speaker assumes you already know. Who would assume that?' },
      { id: 'c', t: 'A ship’s bell rings in the background, though no ships have sailed this lake in years.', ok: true, w: 'No ships sail, so the bell is a recording, a fixed bell, or part of a trap.' },
      { id: 'd', t: 'The speaker says "keep your lamps dark," a warning to hide, not a request for help.', ok: true, w: 'Hiding instructions suggest the speaker fears being seen, not that they want to be rescued.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The speaker’s voice is calm and clear.', ok: false, w: 'A calm voice tells you about the speaker’s training, not about whether the message is true.' }
    ],
    decode: null
  },
  supply: {
    intro: 'A chandlery and pharmacy on the ground floor of a marina building. The lake has taken the lot. Water laps across the tile, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the dock stairs are slick with algae and the loft floor sags near the windows. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler under the counter.',
    upstairs: 'As you head for the door, something shifts in the loft above. Dust sifts down through your flashlight beam.',
    notebook: 'A survivor’s notebook upstairs: "The old men said never answer the bell. We rowed out anyway."',
    haz: 'dock|slick|algae|loft|lake|plank',
    hazEx: 'like the slick dock stairs or the sagging loft floor',
    items: {
      food: 'Canned fish and beans (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Marine fuel can', crank: 'Hand-crank radio',
      box: { n: 'Harbor office file box', clue: 'The file box holds a 2026 grid notice. One line is circled: "Station Four. Shutdown order effective 11:47 PM."' },
      lan: { n: 'Grid worker badge', clue: 'The badge reads "Lake Erie Grid Authority. Station Four. Operator."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Dani', g: 'f',
    open: 'At the landing, a woman steps out from behind the collapsed bait shop with both hands open and visible. Her coat is soaked. She looks like she has not slept.',
    quote: '"I’m Dani. I walked here from Findlay. Two days, no more. I’ve farmed there all my life. My sister is sick at the chapel. Please, I need medicine."',
    warned: 'She glances at your pack. "Someone left a note on a door in Sandusky. It kept my cousin off a bad stair. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask what is wrong with her sister.', inspect: 'Look at her more closely.', route: 'Ask where she slept on the way.' },
    brother: { say: '"She... fell. Off the loft ladder. She hit her head. She is not waking up right. She’s getting worse."', note: 'Earlier she said her sister was sick. Now she says her sister fell and hit her head.' },
    inspect: { say: '"Why are you staring? I’m just tired."', trust: 'You notice a radio headset inside her coat. Your trusting nature makes you skim over the rest. ', full: 'You notice her soft, clean hands, and a worn radio headset inside her coat. ', med: 'Medical assistant: she favors her right wrist, an old strain, like years of keying a transmitter. ', mil: 'Military family: she stands where she can see both exits.' },
    route: { say: '"I slept in barns. I’ve never been near the lake in my life. I don’t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I’m lying? Fine. My sister... it’s the fall, the fever, I don’t know. I’m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven’t been spoken to kindly in a long time." She glances back down the road.' },
    block: { say: '"Move! They could be right behind me." She catches herself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'Her hands are soft and clean, with no calluses. She says she has farmed outside Findlay all her life.',
      badge: 'A worn radio headset is tucked inside her coat, with a tag: "Station Four. Dispatch."',
      story: 'Her story about her sister changed: first sick, then a fall and a head injury.',
      road: 'She keeps checking the road behind her, as if watching for someone.',
      never: 'She said, "I’ve never been near the lake in my life." That conflicts with a headset tagged for a lake-shore station.',
      nurse: 'When you asked gently, she admitted she worked dispatch. She still has not said for whom.'
    },
    admit: '"...Okay. I worked dispatch at Station Four. I wasn’t always honest with you, because honesty has cost me before."',
    helpLog: 'Helped Dani. She gave you a battery and a name: Station Four.', helpClue: 'Dani whispers a name: "Station Four." She will not say more.',
    tradeClue: 'Dani warns: "Do not follow the signal to the tower. It is bait."',
    placeRe: 'landing|marsh|chapel|bait|shop|north|south|east|west|road|shore|lake', foundRe: 'woman|dani|stranger|dispatch|survivor|person|signal|girl|someone',
    placeTip: 'the landing, the chapel, the marsh', foundTip: 'a woman, a stranger, a signal'
  }
};
