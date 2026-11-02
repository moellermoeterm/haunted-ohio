// Shared content tables: items, clues (evidence archive), and characters (journal).
// Clue bodies are written for the player to read closely. Nothing here is real history unless marked.

const svg = (inner) => `<svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true">${inner}</svg>`;

export const ITEMS = {
  bell: {
    name: 'The Keeper’s Bell',
    desc: 'A small brass hand bell, green at the edges. A date is stamped around the rim: MARCH 1913. Hold it, and the world seems to lean a little closer.',
    icon: svg('<path d="M20 5v4M12 28c0-9 3-15 8-15s8 6 8 15zM9 28h22M17 31a3 3 0 0 0 6 0" fill="#c9a96a" stroke="#6b5524" stroke-width="1.5"/>'),
  },
  letter: {
    name: 'Rourke’s Letter',
    desc: 'A letter in a careful hand, water-stained. Some lines have washed away in the living world.',
    icon: svg('<rect x="6" y="10" width="28" height="20" fill="#d9cfaf" stroke="#6e6446"/><path d="M6 11l14 11 14-11" fill="none" stroke="#6e6446" stroke-width="1.5"/>'),
  },
  ledger: {
    name: 'The Keeper’s Ledger',
    desc: 'A narrow ledger of bell-ringing times, kept for thirty-one years. The last page is torn out.',
    icon: svg('<rect x="9" y="6" width="22" height="28" fill="#5c1f27" stroke="#2c0e12"/><path d="M13 12h14M13 17h14M13 22h9" stroke="#c9a96a" stroke-width="1.5"/>'),
  },
};

export const CLUES = {
  notice: {
    title: 'Township notice', cat: 'Document', world: 'Living',
    body: 'POSTED BY ORDER OF THE TOWNSHIP TRUSTEES: Saint Aurelian Chapel is closed to the public. The structure is unsafe. Demolition is pending a final vote.\n\nSomeone has written across the bottom in pencil, pressing hard: “THE BELL RINGS AT 11:14. NOBODY IS RINGING IT.”',
  },
  chain: {
    title: 'The chained gate', cat: 'Observation', world: 'Living',
    body: 'The churchyard gate is wrapped in a heavy chain and the padlock is fused with rust. It has not been opened in years. But the gate you saw while holding the bell was standing open.',
  },
  bellDate: {
    title: 'The bell’s inscription', cat: 'Observation', world: 'Both',
    body: 'Stamped around the rim of the bell: MARCH 1913. Below it, smaller, a column of names, most too worn to read. The first line is legible: SAINT AURELIAN.',
  },
  doorBell: {
    title: 'Bell sequence at the chapel doors', cat: 'Audio', world: 'Veil',
    body: 'In the Veil, a bell tolls at the chapel doors in a pattern: MIDDLE, LOW, HIGH, MIDDLE. Three bell-shaped plates are set into the living doors. They look made to be struck.',
  },
  register: {
    title: 'Burial register, last page', cat: 'Document', world: 'Living',
    body: 'A burial register left open on a table. The final entries are dated the week of March 25, 1913. Several lines read only “lost to the flood.” Beneath them is a name entered and then crossed out so hard the paper tore: THOMAS ROURKE, KEEPER.',
  },
  photo: {
    title: 'Photograph: the Keeper and his bell', cat: 'Photograph', world: 'Living',
    body: 'A faded photograph propped on the altar rail. A broad-shouldered man in shirtsleeves stands at the chapel door holding a small hand bell at his side. Someone has written on the back: “T. Rourke, 1911. Rang the evening bell every day for thirty-one years.”',
  },
  pewStar: {
    title: 'Glowing mark: front pew', cat: 'Symbol', world: 'Veil',
    body: 'In the Veil, a star glows on the end of the front pew, the one closest to the altar.',
  },
  pewFlame: {
    title: 'Glowing mark: middle pew', cat: 'Symbol', world: 'Veil',
    body: 'In the Veil, a flame glows on the end of a pew in the middle of the nave.',
  },
  pewTower: {
    title: 'Glowing mark: back pew', cat: 'Symbol', world: 'Veil',
    body: 'In the Veil, a tower glows on the end of the pew nearest the door.',
  },
  watcher1: {
    title: 'A figure by the altar', cat: 'Observation', world: 'Veil',
    body: 'In the Veil, a tall, still figure stood at the altar. It did not speak. It raised one hand and pointed toward the wall where the sacristy door is. In the living world, that door is locked.',
  },
  sacDoor: {
    title: 'The sacristy door', cat: 'Observation', world: 'Both',
    body: 'In the living world the sacristy door is locked from the inside. In the Veil it stands open. Doors do not always agree between the two worlds.',
  },
  lockPlate: {
    title: 'Engraving on the cabinet lock', cat: 'Observation', world: 'Living',
    body: 'Three dials with five symbols each. Engraved beneath them: FRONT. MIDDLE. BACK. “As they were lit, so they were kept.”',
  },
  letter1: {
    title: 'Rourke’s letter (living world)', cat: 'Document', world: 'Living',
    body: 'Most of the letter has washed away. What is left:\n\n“To whoever keeps the bell after me —\n\nIt was never meant to call anything. It was made to ______ the lost toward ______ . The water on the lower road ______ ______ before dusk. I rang until ______ .\n\nIf you can hear this, you are holding my place. Do not let it ______ .”',
  },
  letter2: {
    title: 'Rourke’s letter (as seen in the Veil)', cat: 'Document', world: 'Veil',
    body: 'In the Veil the washed-out lines are readable:\n\n“It was never meant to call anything. It was made to GUIDE the lost toward HIGH GROUND. The water on the lower road ROSE FAST before dusk. I rang until THE LAST LANTERN CAME UP THE HILL.\n\nIf you can hear this, you are holding my place. Do not let it GO SILENT.”',
  },
  ledger1: {
    title: 'The Keeper’s Ledger', cat: 'Document', world: 'Living',
    body: 'Thirty-one years of evening bell times, one neat line per day. The final page has been torn out. In the margin of the last entry: “Eleven-fourteen. Still ringing. They are still coming.”',
  },
  hiddenStair: {
    title: 'A stair behind the cabinet', cat: 'Observation', world: 'Living',
    body: 'When the last dial turned, the cabinet swung inward on a hinge. Behind it, a narrow stair climbs toward the bell tower.',
  },
  keeper1: {
    title: 'The Bell Keeper', cat: 'Observation', world: 'Veil',
    body: 'In the bell tower, in the Veil, you met Thomas Rourke. He said the bell does not create the Veil. It lets its holder hear where someone is still waiting to be found. He did not know what was tearing the edges between the worlds.',
  },
};

export const CHARACTERS = {
  watcher: { name: 'The Watcher', desc: 'A tall, silent figure seen only in the Veil. It points; it never explains. Its purpose is unknown.' },
  keeper: { name: 'Thomas Rourke, the Bell Keeper', desc: 'A lay keeper of Saint Aurelian Chapel who rang the evening bell for thirty-one years. He guided stranded townspeople to high ground in the March 1913 flood and was never found.' },
  archivist: { name: 'The Archivist (“A.”)', desc: 'The unsigned writer of the letter that brought you here. Knows more than they have said.' },
  presence: { name: 'The Presence', desc: 'Something is tearing at the edges between the Living World and the Veil. Its nature is not yet known.' },
};

export const CATEGORY_ORDER = ['Document', 'Photograph', 'Symbol', 'Audio', 'Observation'];
