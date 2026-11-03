/* The Last Light, Scenario 4: Millbrook Locks (editable data object). Everything here is fiction set in 2047.
   Transmission puzzle: a calm voice reads numbers (A=1, B=2, ...) that spell a code word. Cause of The Silence in this scenario (revealed only
   as clues): "the Quiet Tone", a test signal broadcast from the (made-up) Hartwell Observatory at 11:47 p.m. on October 31, 2026. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[4] = {
  code: 4, name: 'Millbrook Locks',
  map: { poly: '70,40 150,34 230,46 320,38 356,70 354,150 340,230 300,300 250,350 190,386 110,380 56,330 44,200', labels: [[250, 44, 'Cleveland'], [196, 114, 'Akron'], [300, 126, 'Youngstown']] },
  locs: {
    home: { n: 'Millbrook Locks', i: 'M', x: 44, y: 38, d: 'Your settlement. The radio room is the old lock keeper’s house beside the canal. Tonight the receiver is picking up something.' },
    cin: { n: 'Abandoned Akron', i: 'K', x: 56, y: 62, d: 'A hollow factory city. A clinic and canteen inside an old tire plant still hold supplies, if the catwalks hold you.' },
    hol: { n: 'Tannery Bend', i: 'B', x: 22, y: 72, d: 'A sharp bend in the canal, with a burned tannery and a school bus rusting in a field. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'The Dome', i: 'U', x: 80, y: 60, d: 'An observatory dome on a hill.' },
    moo: { n: 'Lock Nineteen', i: 'L', x: 38, y: 88, d: 'A flooded lock at the far end of the canal, wrapped in old stories.' },
    twr: { n: 'Siren Tower', i: 'T', x: 66, y: 26, d: 'A tall siren tower on the ridge east of Millbrook Locks.' }
  },
  wake: 'wakes in Millbrook Locks. The radio is speaking.',
  leads: 'The signal leads to an observatory on a hill.',
  signal: {
    freq: 893, hint: 'Radio operator: the old stations in this region sit low on the dial, near 89.',
    room: 'It is past two in the morning. Water drips from the lock gates outside. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... a calm voice reading numbers ...',
    msg: 'THE CODE WORD IS LANTERN. IF YOU KNOW WHAT IT OPENS, COME ALONE.',
    dialMsg: '12 1 14 20 5 18 14',
    tx: ['[CLEAR] The code word is LANTERN.', '[CLEAR] If you know what it opens, come alone.', '[BACKGROUND] A faint creak, like a heavy iron door.'],
    obs: [
      { id: 'a', t: 'The voice reads numbers first, then a plain sentence about the same word.', ok: true, w: 'Numbers followed by a plain sentence suggests a code the sender and the listeners agreed on beforehand.' },
      { id: 'b', t: 'The message says "come alone," a request that keeps witnesses away.', ok: true, w: 'Wanting you alone can mean the sender fears being overheard, or wants no witnesses.' },
      { id: 'c', t: 'The speaker says "if you know what it opens" and never says what it opens.', ok: true, w: 'An unnamed "it" means the speaker assumes you already know. Who would assume that?' },
      { id: 'd', t: 'A heavy iron door creaks in the background, far from any town.', ok: true, w: 'A heavy door suggests a hidden structure, which could be shelter, or a trap.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The voice belongs to a woman.', ok: false, w: 'The speaker’s voice tells you nothing about whether the message is honest.' }
    ],
    decode: { kind: 'type', answer: 'LANTERN', intro: 'A calm voice reads numbers. Many old signal groups used A=1, B=2, C=3, and so on. Type the word the numbers spell.', hint: 'A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9, J=10, K=11, L=12, M=13, N=14, O=15, P=16, Q=17, R=18, S=19, T=20, U=21, V=22, W=23, X=24, Y=25, Z=26' }
  },
  supply: {
    intro: 'A clinic and canteen on the ground floor of an old tire plant. Rubber dust coats the floor, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the catwalk stairs are rusted through in places and the roof over the east aisle sags. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler behind the clinic desk.',
    upstairs: 'As you head for the door, something shifts on the catwalk above. Rust flakes sift down through your flashlight beam.',
    notebook: 'A survivor’s notebook upstairs: "We heard a low tone, then the lights died. The old observatory was the last thing we saw lit."',
    haz: 'catwalk|rust|roof|rubber|dust|beam',
    hazEx: 'like the rusted catwalk stairs or the sagging roof',
    items: {
      food: 'Canned stew and rice (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Fuel can', crank: 'Hand-crank radio',
      box: { n: 'Plant office files', clue: 'The files hold a 2026 memo. One line is circled: "Hartwell Observatory. Quiet Tone test, 11:47 PM. Do not run on a live network."' },
      lan: { n: 'Visitor lanyard', clue: 'The lanyard reads "Hartwell Observatory. Test crew. Dome access."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Ines', g: 'f',
    open: 'At the bend, a woman steps out from behind the burned tannery with her hands open and visible. Her jacket is torn. She looks like she has not slept.',
    quote: '"I’m Ines. I taught school in Youngstown. Three days on foot. My daughter is feverish at the bus. Please, I need medicine."',
    warned: 'She glances at your pack. "Someone left a note on a door in Akron. It kept my cousin off a bad stair. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask what is wrong with her daughter.', inspect: 'Look at her more closely.', route: 'Ask where she slept on the way.' },
    brother: { say: '"She... fell off the bus step. It’s her ankle. And she’s feverish. She says her ears ring. It’s getting worse."', note: 'Earlier she said her daughter was feverish. Now she adds a fall, an ankle, and ringing in the ears.' },
    inspect: { say: '"Why are you staring? I’m just tired."', trust: 'You notice a faded patch sewn inside her jacket. Your trusting nature makes you skim over the rest. ', full: 'You notice the cuffs of her jacket, worn smooth in a way no classroom would wear them, and a faded patch sewn inside it. ', med: 'Medical assistant: her ears twitch toward every small sound, like someone who has heard too much for too long. ', mil: 'Military family: she stands where she can see both exits.' },
    route: { say: '"I slept in barns. I’ve never seen a telescope in my life. I don’t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I’m lying? Fine. My daughter... it’s the ankle, the fever, I don’t know. I’m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven’t been spoken to kindly in a long time." She glances back down the road.' },
    block: { say: '"Move! They could be right behind me." She catches herself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'The cuffs of her jacket are worn smooth and shiny, like someone who spent years leaning on a metal console. She says she taught school.',
      badge: 'A faded patch is sewn inside her jacket: "Hartwell Observatory. Staff."',
      story: 'Her story about her daughter changed: first a fever, then a fall, then ringing in the ears.',
      road: 'She keeps checking the road behind her, as if watching for someone.',
      never: 'She said, "I’ve never seen a telescope in my life." That conflicts with an observatory patch.',
      nurse: 'When you asked gently, she admitted she worked at the observatory. She still has not said doing what.'
    },
    admit: '"...Okay. I worked at the observatory. I wasn’t always honest with you, because honesty has cost me before."',
    helpLog: 'Helped Ines. She gave you a battery and a name: the Dome.', helpClue: 'Ines whispers a name: "the Dome." She will not say more.',
    tradeClue: 'Ines warns: "Do not follow the signal to the siren tower. It is bait."',
    placeRe: 'bend|canal|tannery|bus|field|north|south|east|west|road|lock', foundRe: 'woman|ines|stranger|teacher|survivor|person|signal|girl|someone',
    placeTip: 'the bend, the canal, the road', foundTip: 'a woman, a stranger, a signal'
  }
};
