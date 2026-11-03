/* The Last Light, Scenario 6: Quarry Hollow (editable data object). Everything here is fiction set in 2047.
   Transmission puzzle: a letter-shift code (shift of 7) with a deep hum under the voice. Cause of The Silence in this scenario (revealed only
   as clues): a deep-well pressure test, "Deep Well Twelve", run at 11:47 p.m. on October 31, 2026, that made the ground ring. */
(window.LL_SCENARIOS = window.LL_SCENARIOS || {})[6] = {
  code: 6, name: 'Quarry Hollow',
  map: { poly: '45,60 130,48 200,56 280,44 352,60 358,150 346,236 316,310 268,362 196,394 118,382 54,340 40,200', labels: [[260, 36, 'Cleveland'], [170, 140, 'Mansfield'], [250, 300, 'Columbus']] },
  locs: {
    home: { n: 'Quarry Hollow', i: 'Q', x: 36, y: 62, d: 'Your settlement. The radio room is the foreman’s shack on the lip of an old limestone quarry. Tonight the receiver is picking up something.' },
    cin: { n: 'Abandoned Mansfield', i: 'M', x: 50, y: 34, d: 'A hollow county seat. A hospital annex and a hardware store still hold supplies, if the floors hold you.' },
    hol: { n: 'Pumpjack Corner', i: 'P', x: 72, y: 58, d: 'A crossroads of rusted pumpjacks and a grange hall with a sagging porch. Smoke rose from your settlement; someone followed it.' },
    und: { n: 'Site Twelve', i: 'U', x: 30, y: 84, d: 'A sealed deep-well site.' },
    moo: { n: 'Sinkhole Road', i: 'S', x: 64, y: 84, d: 'A road that drops into a wide sinkhole, wrapped in old stories.' },
    twr: { n: 'Derrick Tower', i: 'T', x: 84, y: 38, d: 'A tall drilling derrick on the ridge east of Quarry Hollow.' }
  },
  wake: 'wakes in Quarry Hollow. The radio is speaking.',
  leads: 'The signal leads to a sealed deep-well site.',
  signal: {
    freq: 1038, hint: 'Radio operator: strong stations in this region cluster near the top of the dial, past 100.',
    room: 'It is past two in the morning. The quarry wall ticks as it cools. On the old receiver, a needle twitches that has not moved in years.',
    first: '[STATIC] ... a flat voice, and under it a deep hum ...',
    msg: 'THE GROUND IS NOT SAFE AT NIGHT',
    dialMsg: 'AOL NYVBUK PZ UVA ZHML HA UPNOA',
    tx: ['[CLEAR] The ground is not safe at night.', '[CLEAR] Repeat. The ground is not safe at night. Stay on the pavement.', '[BACKGROUND] A deep, slow hum, like something very large turning over.'],
    obs: [
      { id: 'a', t: 'A deep hum under the voice never changes pitch.', ok: true, w: 'A steady low hum suggests a machine, or a natural source, close to the sender.' },
      { id: 'b', t: 'The warning says the ground is not safe but never says why.', ok: true, w: 'An unexplained danger means the speaker assumes you already know. Who would assume that?' },
      { id: 'c', t: 'The speaker says "at night," as if the danger changes with the hour.', ok: true, w: 'A danger that depends on the hour suggests something that runs on a schedule, like a machine or a test.' },
      { id: 'd', t: 'The warning was sent in a simple letter-shift code, which takes effort for a plain warning.', ok: true, w: 'Someone chose to hide the words. Either the sender fears other listeners, or they want only careful people to understand.' },
      { id: 'e', t: 'The signal is on the FM band.', ok: false, w: 'The band tells you about the equipment, not about whether the message is honest.' },
      { id: 'f', t: 'The message is under ten words.', ok: false, w: 'Length tells you nothing about whether the message is honest.' }
    ],
    decode: { kind: 'shift', shift: 7, intro: 'The voice is clear, but the words make no sense. Every letter was moved forward by the same number of places. Slide the shift until the message reads as plain English.' }
  },
  supply: {
    intro: 'A hospital annex and hardware store on the ground floor of a brick block. Cracks run up the walls, and something above you ticks and settles.',
    outdoors: 'Outdoorsman: the loading dock steps have crumbled and the ceiling in the east aisle sags. Both are dangerous.',
    cooler: 'Sharp eyes: you spot a sealed medical cooler behind the nurses’ desk.',
    upstairs: 'As you head for the door, something shifts on the floor above. Plaster dust sifts down through your flashlight beam.',
    notebook: 'A survivor’s notebook upstairs: "The cups on the shelf rang by themselves. Then every radio went dead."',
    haz: 'dock|step|crumble|plaster|brick|beam',
    hazEx: 'like the crumbled dock steps or the sagging ceiling',
    items: {
      food: 'Canned corn and chili (4)', tabs: 'Water purification tablets', kit: 'First-aid kit', batt: 'Sealed battery pack', fuel: 'Fuel can', crank: 'Hand-crank radio',
      box: { n: 'County survey box', clue: 'The survey box holds a 2026 map. One site is circled: "Deep Well Twelve. Pressure test, 11:47 PM."' },
      lan: { n: 'Crew lanyard', clue: 'The lanyard reads "Deep Well Project. Site Twelve. Crew."' },
      cool: 'Sealed medical cooler'
    }
  },
  stranger: {
    name: 'Tamsin', g: 'f',
    open: 'At the crossroads, a woman steps out from the grange hall porch with her hands open and visible. Her jacket is torn. She looks like she has not slept.',
    quote: '"I’m Tamsin. I walked here from Lima. Three days. My father is hurt in the grange hall. Please, I need medicine."',
    warned: 'She glances at your pack. "Someone left a note on a door in Mansfield. It kept my cousin off a bad stair. Was that you?" Trust +1.',
    start: '"Please. Every hour matters. What do you want to know?"',
    ch: { brother: 'Ask what is wrong with her father.', inspect: 'Look at her more closely.', route: 'Ask where she slept on the way.' },
    brother: { say: '"He... it’s his chest now. A cough, and a rattle. It’s from the dust, I think. He’s getting worse."', note: 'Earlier she said her father was hurt. Now she describes a cough and a rattle in his chest.' },
    inspect: { say: '"Why are you staring? I’m just tired."', trust: 'You notice a rubber-soled work glove tucked in her belt. Your trusting nature makes you skim over the rest. ', full: 'You notice her boots, caked in grey drilling mud, and a rubber-soled work glove tucked in her belt. ', med: 'Medical assistant: she presses two fingers to her ear and winces, like someone who has been near loud machines for a long time. ', mil: 'Military family: she stands where she can see both exits.' },
    route: { say: '"I slept in barns. I’ve never been near a drill rig in my life. I don’t know this country."', note: 'Keep that line in mind.' },
    press: { say: '"You think I’m lying? Fine. My father... it’s his chest, his hands, I don’t know. I’m not a doctor!"' },
    comfort: { say: '"Thank you. I... haven’t been spoken to kindly in a long time." She glances back down the road.' },
    block: { say: '"Move! They could be right behind me." She catches herself.' },
    watch: { say: '"You see it too. Nothing. Yet."' },
    tells: {
      clay: 'Her boots are caked in grey drilling mud, not the red clay of her home county. She says she walked from Lima, where the soil is dark.',
      badge: 'A work glove with a stitched label is tucked in her belt: "Deep Well Project. Crew."',
      story: 'Her story about her father changed: first hurt, then a cough and a rattle in his chest.',
      road: 'She keeps checking the road behind her, as if watching for someone.',
      never: 'She said, "I’ve never been near a drill rig in my life." That conflicts with a crew glove.',
      nurse: 'When you asked gently, she admitted she was on a drilling crew. She still has not said at which site.'
    },
    admit: '"...Okay. I was on the Deep Well crew. I wasn’t always honest with you, because honesty has cost me before."',
    helpLog: 'Helped Tamsin. She gave you a battery and a name: Site Twelve.', helpClue: 'Tamsin whispers a name: "Site Twelve." She will not say more.',
    tradeClue: 'Tamsin warns: "Do not follow the signal to the derrick. It is bait."',
    placeRe: 'crossroads|corner|grange|hall|pumpjack|north|south|east|west|road|porch', foundRe: 'woman|tamsin|stranger|crew|survivor|person|signal|girl|someone',
    placeTip: 'the crossroads, the grange hall, the road', foundTip: 'a woman, a stranger, a signal'
  }
};
