// Procedural pixel-art textures. Everything is drawn in code, so all art is original.
import { TILE } from '../config.js';
const T = TILE;

function rng(seed) { let s = (seed >>> 0) || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const R = (g, c, x, y, w, h, a = 1) => { g.fillStyle(c, a); g.fillRect(x, y, w, h); };
function speck(g, r, c, n, a = 1, sz = 2) { for (let i = 0; i < n; i++) R(g, c, Math.floor(r() * (T - sz)), Math.floor(r() * (T - sz)), sz, sz, a); }

export const PAL = {
  living: {
    floor: 0x37373e, floor2: 0x2c2c33, floorHi: 0x44444c, wall: 0x1e1e26, wallTop: 0x34343e, wallLine: 0x15151b,
    wood: 0x4d3727, wood2: 0x3a281c, woodHi: 0x624633, grass: 0x213624, grass2: 0x2b4630, grass3: 0x172a1b,
    path: 0x4d473a, path2: 0x3e3a2f, stone: 0x5a5a63, stoneDk: 0x3f3f47, cloth: 0x5c1f27, clothDk: 0x3d1419, gold: 0xb89b4a,
    glass: [0x7a2635, 0x254a7a, 0x7a6a25], leaf: 0x16281a, iron: 0x24242b, flame: 0xffb347, candle: 0xd9cfb0, paper: 0xcfc3a0,
  },
  veil: {
    floor: 0x1d2c47, floor2: 0x182640, floorHi: 0x2b4166, wall: 0x101b31, wallTop: 0x27406a, wallLine: 0x0c1526,
    wood: 0x2a4166, wood2: 0x203555, woodHi: 0x3a5788, grass: 0x16304a, grass2: 0x1c3d5e, grass3: 0x10243a,
    path: 0x2c476c, path2: 0x233b5b, stone: 0x6f8dbd, stoneDk: 0x45608d, cloth: 0x2f5f9a, clothDk: 0x244a7a, gold: 0xe8d08a,
    glass: [0x86b8ff, 0xa6ecff, 0xf1dc96], leaf: 0x0f2038, iron: 0x14213a, flame: 0x9fe3ff, candle: 0xcde6ff, paper: 0xbcd3f2,
  },
};

const floorBase = (g, p, r, kind) => {
  if (kind === 'grass') { R(g, p.grass, 0, 0, T, T); speck(g, r, p.grass2, 9, 1, 2); speck(g, r, p.grass3, 7, 1, 2); }
  else if (kind === 'path') { R(g, p.path, 0, 0, T, T); speck(g, r, p.path2, 10, 1, 2); speck(g, r, p.floorHi, 3, .6, 2); }
  else if (kind === 'wood') {
    R(g, p.wood, 0, 0, T, T);
    for (let y = 0; y < T; y += 8) R(g, p.wood2, 0, y, T, 1);
    for (let i = 0; i < 4; i++) R(g, p.wood2, Math.floor(r() * T), Math.floor(r() * 4) * 8 + 1, 1, 7);
    speck(g, r, p.woodHi, 4, .35, 2);
  } else {
    R(g, p.floor, 0, 0, T, T); R(g, p.floor2, 0, 0, T, 1); R(g, p.floor2, 0, 0, 1, T);
    R(g, p.floor2, 0, 16, T, 1); R(g, p.floor2, 16, 0, 1, 16); R(g, p.floor2, 8, 16, 1, 16);
    speck(g, r, p.floorHi, 4, .5, 2); speck(g, r, p.floor2, 3, .8, 2);
  }
};
const wallBase = (g, p, r) => {
  R(g, p.wall, 0, 0, T, T);
  for (let y = 0; y < T; y += 8) { R(g, p.wallLine, 0, y, T, 1); const o = (y / 8) % 2 ? 8 : 0; for (let x = o; x < T; x += 16) R(g, p.wallLine, x, y, 1, 8); }
  R(g, p.wallTop, 0, 0, T, 3); speck(g, r, p.wallTop, 4, .35, 2);
};

const TILES = {
  '.': (g, p, r) => floorBase(g, p, r, 'stone'),
  ',': (g, p, r) => floorBase(g, p, r, 'grass'),
  ':': (g, p, r) => floorBase(g, p, r, 'path'),
  '_': (g, p, r) => floorBase(g, p, r, 'wood'),
  r: (g, p, r) => { floorBase(g, p, r, 'stone'); R(g, p.cloth, 4, 0, 24, T); R(g, p.clothDk, 4, 0, 2, T); R(g, p.clothDk, 26, 0, 2, T); R(g, p.gold, 7, 0, 1, T, .7); R(g, p.gold, 24, 0, 1, T, .7); },
  '#': (g, p, r) => wallBase(g, p, r),
  W: (g, p, r) => {
    wallBase(g, p, r); R(g, p.wallLine, 7, 4, 18, 26); R(g, p.iron, 8, 5, 16, 24);
    for (let i = 0; i < 3; i++) R(g, p.glass[i], 9 + i * 5, 6, 4, 22);
    R(g, p.glass[1], 9, 6, 14, 5, .6); R(g, p.iron, 8, 16, 16, 1); R(g, p.iron, 15, 5, 1, 24);
  },
  D: (g, p, r) => {
    wallBase(g, p, r); R(g, p.wood2, 2, 2, 28, 30); R(g, p.wood, 3, 3, 12, 29); R(g, p.wood, 17, 3, 12, 29);
    R(g, p.iron, 3, 10, 26, 2); R(g, p.iron, 3, 22, 26, 2); R(g, p.gold, 13, 17, 2, 3); R(g, p.gold, 17, 17, 2, 3); R(g, p.wood2, 15, 2, 2, 30);
  },
  o: (g, p, r) => { floorBase(g, p, r, 'stone'); R(g, p.wallLine, 0, 0, 4, T); R(g, p.wallLine, 28, 0, 4, T); R(g, p.iron, 4, 0, 24, 5, .9); R(g, p.floorHi, 6, 8, 20, 2, .25); },
  p: (g, p, r) => {
    floorBase(g, p, r, 'stone'); R(g, p.wood2, 0, 6, T, 22); R(g, p.wood, 0, 8, T, 7); R(g, p.woodHi, 0, 8, T, 1, .6);
    R(g, p.wood2, 0, 16, T, 2); R(g, p.wood, 0, 19, T, 7); R(g, p.wood2, 0, 26, T, 2); R(g, p.woodHi, 2, 20, T - 4, 1, .35);
  },
  A: (g, p, r) => {
    floorBase(g, p, r, 'stone'); R(g, p.stoneDk, 0, 6, T, 24); R(g, p.stone, 0, 6, T, 6); R(g, p.cloth, 0, 12, T, 12); R(g, p.gold, 0, 12, T, 1); R(g, p.gold, 0, 23, T, 1); R(g, p.stoneDk, 0, 24, T, 6);
  },
  c: (g, p, r) => {
    floorBase(g, p, r, 'stone'); R(g, p.iron, 14, 14, 4, 14); R(g, p.iron, 9, 27, 14, 3); R(g, p.iron, 10, 12, 12, 3);
    R(g, p.candle, 14, 6, 4, 7); R(g, p.flame, 14, 2, 4, 4); R(g, p.flame, 12, 0, 8, 8, .18);
  },
  T: (g, p, r) => {
    floorBase(g, p, r, 'grass'); R(g, 0x2b1d14, 13, 16, 7, 16); R(g, p.leaf, 2, 0, 28, 20); R(g, p.grass3, 5, 2, 22, 14); R(g, p.grass2, 8, 3, 8, 6, .8); R(g, p.leaf, 0, 8, 10, 10); R(g, p.leaf, 22, 6, 10, 12);
  },
  f: (g, p, r) => {
    floorBase(g, p, r, 'grass'); R(g, p.iron, 0, 8, T, 2); R(g, p.iron, 0, 22, T, 2);
    for (let x = 2; x < T; x += 6) { R(g, p.iron, x, 2, 2, 28); R(g, p.stoneDk, x - 1, 0, 4, 3); }
  },
  g: (g, p, r) => {
    floorBase(g, p, r, 'grass'); R(g, p.stoneDk, 6, 8, 20, 21); R(g, p.stoneDk, 8, 5, 16, 5); R(g, p.stone, 8, 7, 16, 20); R(g, p.stone, 10, 5, 12, 4);
    R(g, p.stoneDk, 12, 12, 8, 1); R(g, p.stoneDk, 12, 16, 8, 1); R(g, p.stoneDk, 12, 20, 5, 1); R(g, p.grass3, 4, 27, 24, 4, .8);
  },
  s: (g, p, r) => {
    floorBase(g, p, r, 'grass'); R(g, p.stoneDk, 6, 22, 20, 9); R(g, p.stone, 8, 20, 16, 4);
    R(g, p.stone, 12, 4, 8, 7); R(g, p.stone, 10, 11, 12, 11); R(g, p.stoneDk, 3, 8, 8, 12, .9); R(g, p.stoneDk, 21, 8, 8, 12, .9); R(g, p.stoneDk, 14, 6, 1, 2);
  },
  h: (g, p, r) => { floorBase(g, p, r, 'grass'); R(g, p.leaf, 0, 6, T, 24); R(g, p.grass3, 2, 4, 28, 14); speck(g, r, p.grass2, 10, .9, 3); },
  b: (g, p, r) => {
    wallBase(g, p, r); R(g, p.wood2, 2, 2, 28, 30);
    const cols = [p.cloth, p.gold, p.glass[1], p.stone, p.clothDk];
    for (const y of [4, 15, 25]) { R(g, p.wood, 2, y + 8 > 31 ? 30 : y + 8, 28, 2); for (let x = 3; x < 29; x += 3) R(g, cols[(x + y) % 5], x, y, 2, 8 - ((x * y) % 3)); }
  },
  t: (g, p, r) => { floorBase(g, p, r, 'wood'); R(g, p.wood2, 2, 6, 28, 22); R(g, p.wood, 3, 7, 26, 16); R(g, p.woodHi, 3, 7, 26, 1, .7); R(g, p.wood2, 4, 26, 3, 5); R(g, p.wood2, 25, 26, 3, 5); },
  k: (g, p, r) => {
    wallBase(g, p, r); R(g, p.wood2, 3, 3, 26, 29); R(g, p.wood, 4, 4, 24, 12); R(g, p.wood, 4, 17, 11, 14); R(g, p.wood, 17, 17, 11, 14);
    R(g, p.gold, 14, 9, 4, 3); R(g, p.gold, 12, 23, 2, 3); R(g, p.gold, 18, 23, 2, 3); R(g, p.iron, 4, 16, 24, 1);
  },
  x: (g, p, r) => {
    floorBase(g, p, r, 'stone'); R(g, p.wood2, 0, 10, T, 10); R(g, p.wood, 0, 11, T, 4); R(g, p.wood2, 2, 18, 8, 6); R(g, p.wood, 18, 6, 12, 5);
    speck(g, r, p.floor2, 6, .9, 3); R(g, p.floorHi, 6, 24, 3, 2, .6);
  },
  G: (g, p, r) => {
    floorBase(g, p, r, 'path'); R(g, p.iron, 0, 2, 3, 28); R(g, p.iron, 29, 2, 3, 28);
    for (let x = 4; x < 29; x += 5) R(g, p.iron, x, 4, 2, 26); R(g, p.iron, 0, 8, T, 2); R(g, p.iron, 0, 24, T, 2);
    R(g, p.stoneDk, 4, 14, 24, 3); R(g, p.stone, 6, 15, 20, 1); R(g, p.gold, 13, 12, 6, 7); R(g, p.iron, 15, 14, 2, 3);
  },
  q: (g, p, r) => {
    floorBase(g, p, r, 'stone');
    for (let i = 0; i < 9; i++) R(g, i % 2 ? p.glass[1] : 0xffffff, 3 + i * 3, 0, 2, T, .25 + r() * .35);
    speck(g, r, 0xffffff, 12, .5, 2);
  },
  S: (g, p, r) => { floorBase(g, p, r, 'stone'); for (let i = 0; i < 5; i++) { R(g, i % 2 ? p.stoneDk : p.stone, 3, 2 + i * 6, 26, 5); R(g, p.floor2, 3, 6 + i * 6, 26, 1); } },
};
export const TILE_CHARS = Object.keys(TILES);
export const tkey = (ch, world) => 't' + ch.charCodeAt(0) + '_' + (world === 'veil' ? 'V' : 'L');

// ---------- glyphs (shared with the DOM puzzle so players see the same shape) ----------
const star = () => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 5.5 : 13; pts.push([16 + Math.cos(a) * rr, 16 + Math.sin(a) * rr]); } return pts; };
export const GLYPHS = {
  star: star(),
  diamond: [[16, 3], [28, 16], [16, 29], [4, 16]],
  tower: [[7, 29], [7, 12], [9, 12], [9, 5], [13, 5], [13, 9], [15, 9], [15, 5], [17, 5], [17, 9], [19, 9], [19, 5], [23, 5], [23, 12], [25, 12], [25, 29]],
  flame: [[16, 2], [22, 11], [26, 19], [23, 27], [16, 30], [9, 27], [6, 19], [11, 13], [13, 18], [16, 10]],
  wave: [[3, 14], [8, 9], [13, 14], [18, 9], [23, 14], [29, 9], [29, 15], [23, 20], [18, 15], [13, 20], [8, 15], [3, 20]],
};
export const GLYPH_NAMES = Object.keys(GLYPHS);
export const glyphSvg = (name, color = '#e8d08a', size = 48) =>
  `<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true"><polygon points="${GLYPHS[name].map((p) => p.join(',')).join(' ')}" fill="${color}"/></svg>`;

// ---------- player sprite (rect list, drawn to both Phaser and 2D canvas) ----------
export function playerRects(look, dir, frame) {
  const skin = look.skin, hair = look.hair, cloth = look.outfit, dark = 0x17171c, boots = 0x201c1a;
  const r = [];
  const step = frame === 1 ? -2 : frame === 2 ? 2 : 0;
  const bob = frame ? -1 : 0;
  // legs
  r.push([8, 26, 4, 7 - (step > 0 ? step : 0), dark], [13, 26, 4, 7 + (step < 0 ? step : 0) * 0 - (step < 0 ? -step : 0), dark]);
  r.push([8, 31 - (step > 0 ? step : 0), 4, 2, boots], [13, 31 - (step < 0 ? -step : 0), 4, 2, boots]);
  // torso + arms
  r.push([6, 15 + bob, 13, 12, cloth], [6, 15 + bob, 13, 2, 0xffffff, 0.12]);
  const armL = dir === 'right' ? 9 : 3, armR = dir === 'left' ? 11 : 18;
  if (dir === 'left' || dir === 'right') r.push([armL === 9 ? 9 : 9, 17 + bob, 4, 9, cloth]);
  else r.push([3, 16 + bob + (step > 0 ? 1 : 0), 3, 9, cloth], [19, 16 + bob + (step < 0 ? 1 : 0), 3, 9, cloth], [3, 25 + bob, 3, 2, skin], [19, 25 + bob, 3, 2, skin]);
  // head
  r.push([7, 4 + bob, 11, 11, skin]);
  if (look.hairStyle === 'long') r.push([6, 3 + bob, 13, 5, hair], [6, 7 + bob, 3, 11, hair], [16, 7 + bob, 3, 11, hair]);
  else if (look.hairStyle === 'cap') r.push([6, 3 + bob, 13, 5, cloth], [dir === 'up' ? 6 : 6, 7 + bob, 13, 2, cloth]);
  else r.push([6, 3 + bob, 13, 5, hair], [6, 5 + bob, 2, 4, hair], [17, 5 + bob, 2, 4, hair]);
  if (dir === 'up') r.push([7, 4 + bob, 11, 8, hair]);
  else if (dir === 'down') r.push([9, 9 + bob, 2, 2, 0x111111], [14, 9 + bob, 2, 2, 0x111111]);
  else if (dir === 'left') r.push([8, 9 + bob, 2, 2, 0x111111], [7, 11 + bob, 1, 2, skin]);
  else r.push([15, 9 + bob, 2, 2, 0x111111], [18, 11 + bob, 1, 2, skin]);
  return r;
}
export function paintRects(g, rects) { for (const [x, y, w, h, c, a] of rects) { g.fillStyle(c, a == null ? 1 : a); g.fillRect(x, y, w, h); } }
export function paintRectsCanvas(ctx, rects, scale = 1) {
  for (const [x, y, w, h, c, a] of rects) { ctx.globalAlpha = a == null ? 1 : a; ctx.fillStyle = '#' + c.toString(16).padStart(6, '0'); ctx.fillRect(x * scale, y * scale, w * scale, h * scale); }
  ctx.globalAlpha = 1;
}
export function buildPlayerTextures(scene, look) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (const dir of ['down', 'up', 'left', 'right']) {
    for (let f = 0; f < 3; f++) {
      const key = `p_${dir}_${f}`;
      g.clear(); g.fillStyle(0x000000, 0.3); g.fillEllipse(12.5, 32, 18, 6);
      paintRects(g, playerRects(look, dir, f));
      if (scene.textures.exists(key)) scene.textures.remove(key);
      g.generateTexture(key, 25, 36);
    }
  }
  g.destroy();
}

// ---------- entities ----------
function ghostFigure(g, tone, glow, face) {
  g.fillStyle(glow, 0.18); g.fillEllipse(16, 30, 30, 50);
  g.fillStyle(tone, 1); g.fillTriangle(16, 14, 3, 56, 29, 56); g.fillRect(9, 8, 14, 12); g.fillEllipse(16, 9, 15, 15);
  g.fillStyle(0x05060a, 1); g.fillEllipse(16, 10, 11, 12);
  g.fillStyle(face, 1); g.fillRect(12, 9, 2, 2); g.fillRect(18, 9, 2, 2);
  g.fillStyle(glow, 0.35); g.fillRect(4, 52, 24, 3);
}
export function buildEntityTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const mk = (key, w, h, fn) => { g.clear(); fn(g); if (scene.textures.exists(key)) scene.textures.remove(key); g.generateTexture(key, w, h); };

  mk('ent_bell', 28, 28, (g) => {
    g.fillStyle(0xffd27a, 0.15); g.fillCircle(14, 14, 14);
    g.fillStyle(0x5a4a2a, 1); g.fillRect(4, 22, 20, 2);
    g.fillStyle(0xb89b4a, 1); g.fillRect(9, 6, 10, 3); g.fillRect(7, 9, 14, 7); g.fillRect(5, 16, 18, 6);
    g.fillStyle(0xffe9a0, 1); g.fillRect(9, 9, 3, 10); g.fillStyle(0x6b5524, 1); g.fillRect(17, 10, 3, 11); g.fillRect(12, 22, 4, 3);
  });
  mk('ent_note', 22, 18, (g) => { g.fillStyle(0x000000, 0.25); g.fillRect(2, 14, 18, 3); g.fillStyle(0xcfc3a0, 1); g.fillRect(2, 2, 18, 13); g.fillStyle(0x6e6446, 1); for (let y = 5; y < 13; y += 3) g.fillRect(4, y, 13, 1); });
  mk('ent_board', 32, 40, (g) => {
    g.fillStyle(0x2a1d12, 1); g.fillRect(3, 14, 4, 26); g.fillRect(25, 14, 4, 26);
    g.fillStyle(0x4d3727, 1); g.fillRect(1, 2, 30, 22); g.fillStyle(0x6a4c33, 1); g.fillRect(3, 4, 26, 18);
    g.fillStyle(0xd9cfaf, 1); g.fillRect(6, 6, 10, 9); g.fillRect(18, 8, 8, 11); g.fillStyle(0xa33b2a, 1); g.fillRect(8, 8, 6, 1); g.fillRect(20, 10, 4, 1);
    g.fillStyle(0x333333, 1); g.fillRect(8, 11, 6, 1); g.fillRect(8, 13, 4, 1);
  });
  mk('ent_watcher', 32, 58, (g) => ghostFigure(g, 0x0b0d17, 0x7aa8ff, 0xcfe6ff));
  mk('ent_keeper', 32, 58, (g) => {
    ghostFigure(g, 0x1c2c4a, 0xe8d08a, 0xfff2c4);
    g.fillStyle(0xe8d08a, 1); g.fillRect(24, 30, 3, 9); g.fillStyle(0xffe9a0, 1); g.fillRect(22, 38, 7, 8); g.fillStyle(0xe8d08a, 0.25); g.fillCircle(25, 42, 11);
  });
  mk('ent_bigbell', 64, 72, (g) => {
    g.fillStyle(0x2a1d12, 1); g.fillRect(4, 0, 56, 8); g.fillStyle(0x6a4c33, 1); g.fillRect(8, 8, 48, 4);
    g.fillStyle(0x8f7637, 1); g.fillRect(24, 12, 16, 8); g.fillRect(16, 20, 32, 16); g.fillRect(8, 36, 48, 20); g.fillRect(4, 56, 56, 8);
    g.fillStyle(0xc9ad5a, 1); g.fillRect(18, 22, 8, 32); g.fillStyle(0x5d4a1e, 1); g.fillRect(44, 22, 8, 34); g.fillRect(28, 64, 8, 6);
  });
  mk('ent_chain', 32, 20, (g) => { g.fillStyle(0x6a6a72, 1); for (let x = 2; x < 30; x += 6) g.fillRect(x, 8 + ((x / 6) % 2) * 3, 5, 3); g.fillStyle(0xb89b4a, 1); g.fillRect(12, 4, 8, 11); });
  mk('ent_spark', 14, 14, (g) => { g.fillStyle(0xffe9a0, 0.35); g.fillCircle(7, 7, 7); g.fillStyle(0xffffff, 0.9); g.fillCircle(7, 7, 2.5); });
  mk('ent_mote', 4, 4, (g) => { g.fillStyle(0xbfe3ff, 1); g.fillRect(0, 0, 3, 3); });
  for (const name of Object.keys(GLYPHS)) {
    mk('glyph_' + name, 32, 32, (g) => {
      g.fillStyle(0x9fe3ff, 0.18); g.fillCircle(16, 16, 16);
      g.fillStyle(0xe8f6ff, 1); g.fillPoints(GLYPHS[name].map(([x, y]) => ({ x, y })), true);
    });
  }
  g.destroy();
}

export function buildTileTextures(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (const world of ['living', 'veil']) {
    const p = PAL[world];
    for (const ch of TILE_CHARS) {
      const key = tkey(ch, world);
      g.clear(); TILES[ch](g, p, rng(ch.charCodeAt(0) * 31 + (world === 'veil' ? 7 : 3)));
      if (scene.textures.exists(key)) scene.textures.remove(key);
      g.generateTexture(key, T, T);
    }
  }
  g.destroy();
}
