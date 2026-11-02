// Symbol-dial lock. The answer is not on the lock. It was glowing on three pews in the Veil.
import * as ui from '../systems/ui.js';
import * as audio from '../systems/audio.js';
import { GLYPH_NAMES, glyphSvg } from '../systems/textures.js';

const LABELS = ['FRONT', 'MIDDLE', 'BACK'];

export function symbolPuzzle({ solution }) {
  return new Promise((resolve) => {
    let vals = [0, 0, 0], sel = 0, solved = false, m;
    const draw = () => {
      m.body.querySelector('#dials').innerHTML = vals.map((v, i) => `<div class="dial${i === sel ? ' on' : ''}" data-i="${i}">
        <span class="lab">${LABELS[i]}</span><button type="button" class="arrow" data-up="${i}" aria-label="Next symbol for ${LABELS[i]}">▲</button>
        ${glyphSvg(GLYPH_NAMES[v], '#e8d08a', 52)}<button type="button" class="arrow" data-dn="${i}" aria-label="Previous symbol for ${LABELS[i]}">▼</button></div>`).join('');
      m.body.querySelectorAll('[data-up]').forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.up; turn(1); }));
      m.body.querySelectorAll('[data-dn]').forEach((b) => b.addEventListener('click', () => { sel = +b.dataset.dn; turn(-1); }));
    };
    const turn = (d) => { vals[sel] = (vals[sel] + d + GLYPH_NAMES.length) % GLYPH_NAMES.length; audio.uiBlip(); draw(); };
    const fb = (t, cls) => { const e = m.body.querySelector('#sFb'); e.textContent = t; e.className = 'fb ' + cls; };
    function tryIt() {
      if (vals.every((v, i) => GLYPH_NAMES[v] === solution[i])) { solved = true; fb('The dials settle with a clack.', 'ok'); audio.success(); setTimeout(() => m.close(true), 800); }
      else { fb('The lock does not give. The symbols are wrong, or in the wrong order.', 'bad'); audio.deny(); }
    }
    m = ui.openModal({
      cls: 'panel narrow', title: 'The Cabinet Lock',
      html: `<div class="puz"><p>Engraved beneath the dials: <i>FRONT. MIDDLE. BACK. “As they were lit, so they were kept.”</i></p>
        <div class="dials" id="dials"></div><p class="muted">← → choose a dial · ↑ ↓ change the symbol · Enter to try the lock</p><p class="fb" id="sFb" role="status"></p>
        <p class="row" style="justify-content:center"><button type="button" class="btn" id="sTry">Try the lock (Enter)</button><button type="button" class="btn ghost" id="sClose">Step back (Esc)</button></p></div>`,
      onKey: (k, e, typing) => {
        if (typing) return false;
        if (k === 'arrowleft' || k === 'a') { sel = (sel + 2) % 3; draw(); return true; }
        if (k === 'arrowright' || k === 'd') { sel = (sel + 1) % 3; draw(); return true; }
        if (k === 'arrowup' || k === 'w') { turn(1); return true; }
        if (k === 'arrowdown' || k === 's') { turn(-1); return true; }
        if (k === 'enter') { tryIt(); return true; }
        return false;
      },
      onOpen: (mm) => { draw(); mm.body.querySelector('#sTry').addEventListener('click', tryIt); mm.body.querySelector('#sClose').addEventListener('click', () => mm.close()); },
    });
    m.closed.then(() => resolve(solved));
  });
}
