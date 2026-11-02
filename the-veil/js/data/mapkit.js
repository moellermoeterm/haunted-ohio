// Tiny map builder. Each map has a Living grid and a Veil grid (a copy with its own edits),
// so doors, obstacles, and pathways can differ between worlds.
function apply(g, ops) {
  const h = g.length, w = g[0].length;
  for (const op of ops) {
    const [k, a, b, c, d, e] = op;
    if (k === 'fill') g.forEach((row) => row.fill(a));
    else if (k === 'rect') for (let y = b; y < b + d; y++) for (let x = a; x < a + c; x++) if (x >= 0 && y >= 0 && x < w && y < h) g[y][x] = e;
    else if (k === 'set') { if (b >= 0 && b < h && a >= 0 && a < w) g[b][a] = c; }
  }
}
export function makeMap(def) {
  const { w, h, base = '.', living = [], veil = [] } = def;
  const L = Array.from({ length: h }, () => Array(w).fill(base));
  apply(L, living);
  const V = L.map((r) => r.slice());
  apply(V, veil);
  return { ...def, living: L, veil: V };
}
