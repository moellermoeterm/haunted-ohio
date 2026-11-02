// Bell-sequence puzzle. In the Veil you can LISTEN to the bells that rang here long ago.
// In the Living World the doors are silent: you have to remember the pattern and play it back on the keys.
import * as ui from '../systems/ui.js';
import * as audio from '../systems/audio.js';
import { setFlag, addClue, flag } from '../systems/state.js';

const KEYS = [['low', '1', 'a'], ['mid', '2', 's'], ['high', '3', 'd']];

export function bellPuzzle({ sequence, world }) {
  return new Promise((resolve) => {
    let entered = [], busy = false, solved = false, m;
    const dots = () => sequence.map((_, i) => `<i class="${i < entered.length ? 'f' : ''}"></i>`).join('');
    m = ui.openModal({
      cls: 'panel narrow', title: 'The Chapel Doors',
      html: `<div class="puz"><p>${world === 'veil' ? 'Press <b>L</b> to listen to the bells in the Veil.' : 'The doors are silent in the living world. If you heard the bells somewhere else, play them back.'}</p>
        <div class="seq" id="bSeq" aria-label="Notes entered">${dots()}</div>
        <div class="pkeys">${KEYS.map(([n, k1, k2]) => `<button type="button" class="pkey" data-n="${n}"><b>${k1}</b>${n}<br><small>(${k2.toUpperCase()})</small></button>`).join('')}</div>
        <p class="fb" id="bFb" role="status"></p>
        <p class="row" style="justify-content:center"><button type="button" class="btn ghost" id="bListen">Listen (L)</button><button type="button" class="btn ghost" id="bClear">Clear (C)</button><button type="button" class="btn ghost" id="bClose">Close (Esc)</button></p></div>`,
      onKey: (k, e, typing) => {
        if (typing) return false;
        const hit = KEYS.find(([, a, b]) => k === a || k === b);
        if (hit) { press(hit[0]); return true; }
        if (k === 'l') { listen(); return true; }
        if (k === 'c' || k === 'backspace') { clear(); return true; }
        return false;
      },
      onOpen: (mm) => {
        mm.body.querySelectorAll('.pkey').forEach((b) => b.addEventListener('click', () => press(b.dataset.n)));
        mm.body.querySelector('#bListen').addEventListener('click', listen);
        mm.body.querySelector('#bClear').addEventListener('click', clear);
        mm.body.querySelector('#bClose').addEventListener('click', () => mm.close());
      },
    });
    const fb = (t, cls = '') => { const e = m.body.querySelector('#bFb'); e.textContent = t; e.className = 'fb ' + cls; };
    const light = (n) => { const b = m.body.querySelector(`.pkey[data-n="${n}"]`); if (!b) return; b.classList.add('lit'); setTimeout(() => b.classList.remove('lit'), 380); };
    const redraw = (bad) => { const s = m.body.querySelector('#bSeq'); s.innerHTML = dots(); if (bad) s.querySelectorAll('i').forEach((i) => i.classList.add('bad')); };
    function clear() { if (busy) return; entered = []; redraw(); fb(''); }
    function press(n) {
      if (busy) return;
      audio.bellTone(n); light(n); entered.push(n); redraw();
      if (entered.length === sequence.length) {
        busy = true;
        if (entered.every((x, i) => x === sequence[i])) {
          solved = true; fb('The bells answer. Something unlocks.', 'ok'); setTimeout(() => { audio.success(); m.close(true); }, 700);
        } else {
          fb('The bells sound wrong. Nothing moves.', 'bad'); redraw(true);
          setTimeout(() => { entered = []; redraw(); busy = false; fb(world === 'veil' ? 'Press L to hear them again.' : 'Try again, or listen for the pattern in the Veil.'); }, 1100);
        }
      }
    }
    function listen() {
      if (busy) return;
      if (world !== 'veil') { fb('You hear only wind. In the Veil, bells that rang long ago can still be heard.', 'bad'); audio.deny(); return; }
      busy = true; fb('Listen…');
      const ms = audio.playSequence(sequence, (n) => light(n));
      setTimeout(() => {
        busy = false; fb('You will have to remember: ' + sequence.join(', ') + '.');
        if (addClue('doorBell')) ui.toast('Evidence added: Bell sequence at the chapel doors'); setFlag('heardDoorBell');
      }, ms + 200);
    }
    m.closed.then(() => resolve(solved));
  });
}
