// Central keyboard handling. One keydown listener routes keys to the UI (when an overlay is open)
// or to the active scene. Movement keys are read as held state each frame.
export const held = Object.create(null);
let handler = null;
let uiHandler = null;

const typing = (el) => el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'range', 'button'].includes(el.type)) || el.isContentEditable);

export function setSceneHandler(fn) { handler = fn; }
export function setUiHandler(fn) { uiHandler = fn; }
export function clearHeld() { for (const k of Object.keys(held)) delete held[k]; }

window.addEventListener('keydown', (e) => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
  if (typing(e.target)) {
    // allow overlays to see Escape / Ctrl+Enter while typing
    if (uiHandler && (k === 'escape' || (k === 'enter' && (e.ctrlKey || e.metaKey)))) uiHandler(k, e, true);
    return;
  }
  const tag = e.target && e.target.tagName;
  const native = tag === 'INPUT' || tag === 'SELECT' || tag === 'SUMMARY' || (tag === 'BUTTON' && (k === ' ' || k === 'enter'));
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k) && !native) e.preventDefault();
  if (!e.repeat) held[k] = true;
  if (uiHandler && uiHandler(k, e, false)) return;
  if (!e.repeat && handler) handler(k, e);
});
window.addEventListener('keyup', (e) => { delete held[e.key.toLowerCase()]; });
window.addEventListener('blur', clearHeld);

export function axis() {
  let x = 0, y = 0;
  if (held.a || held.arrowleft) x -= 1;
  if (held.d || held.arrowright) x += 1;
  if (held.w || held.arrowup) y -= 1;
  if (held.s || held.arrowdown) y += 1;
  return { x, y };
}
export const running = () => !!held.shift;
