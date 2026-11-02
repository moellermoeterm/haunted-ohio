// Shared constants for The Veil.
export const TILE = 32;
export const VIEW_W = 960;
export const VIEW_H = 540;

// Tiles the player cannot walk through. Which world a tile exists in is decided by the map's
// two grids (living / veil), so one set works for both.
export const SOLID = new Set('#WDpAcTfgshbtkxGq'.split(''));

export const LOOKS = {
  skin: [
    { name: 'Light', v: 0xf1c9a5 }, { name: 'Tan', v: 0xd9a273 },
    { name: 'Brown', v: 0xa8734a }, { name: 'Deep', v: 0x6b4228 },
  ],
  hair: [
    { name: 'Black', v: 0x1b1410 }, { name: 'Brown', v: 0x4a2f1b }, { name: 'Blond', v: 0xb08a4a },
    { name: 'Auburn', v: 0x8a3a2a }, { name: 'Silver', v: 0xcfd3d6 },
  ],
  outfit: [
    { name: 'Navy', v: 0x2e4a6b }, { name: 'Wine', v: 0x6b2e3a }, { name: 'Forest', v: 0x3c5a3a },
    { name: 'Slate', v: 0x4a4a52 }, { name: 'Amber', v: 0x8a6a2e },
  ],
  hairStyle: ['short', 'long', 'cap'],
};

export const TRAITS = [
  { id: 'observant', name: 'Observant', desc: 'You notice small details other people miss.' },
  { id: 'skeptical', name: 'Skeptical', desc: 'You want proof before you believe anything.' },
  { id: 'compassionate', name: 'Compassionate', desc: 'You pay attention to the people behind every story.' },
  { id: 'daring', name: 'Daring', desc: 'You walk toward the thing everyone else avoids.' },
];

export const MOTIVES = [
  { id: 'curiosity', name: 'Curiosity', desc: 'You cannot leave a locked door alone.' },
  { id: 'answers', name: 'Searching for answers', desc: 'Somewhere in this is a question you have carried for years.' },
  { id: 'helping', name: 'Helping someone', desc: 'Someone out there is waiting for this to be understood.' },
  { id: 'investigating', name: 'Investigating an event', desc: 'Three witnesses, one pattern. You mean to find it.' },
];

export const SAVE_KEY = 'ho-veil-save-v1';
export const SETTINGS_KEY = 'ho-veil-settings-v1';
