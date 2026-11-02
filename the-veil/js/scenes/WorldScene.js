// The explorable world: tile maps in two versions (Living / Veil), entities, zones, lighting, and the script API.
import { TILE as T, VIEW_W, VIEW_H, SOLID } from '../config.js';
import { state, flag, setFlag, save, hasItem, addItem, hasClue, addClue, addLog, meet, addDecision } from '../systems/state.js';
import * as ui from '../systems/ui.js';
import * as audio from '../systems/audio.js';
import { axis, running, setSceneHandler } from '../systems/input.js';
import { tkey, buildPlayerTextures } from '../systems/textures.js';
import { MAPS, ENTITIES, ZONES, chapterOf } from '../data/chapters.js';
import { ITEMS, CLUES, CHARACTERS } from '../data/content.js';
import { bellPuzzle } from '../puzzles/bell.js';
import { symbolPuzzle } from '../puzzles/symbols.js';

const ZOOM = 1.5;
const FEET_W = 16, FEET_H = 10;

export class WorldScene extends Phaser.Scene {
  constructor() { super('World'); }
  init(data) { this.initData = data || {}; }

  create() {
    const d = this.initData;
    this.M = MAPS[d.mapId || state.mapId] || MAPS[chapterOf(state.chapter).CHAPTER.start.mapId];
    state.mapId = this.M.id;
    if (d.x != null) { state.x = d.x * T; state.y = d.y * T; state.dir = d.dir || 'down'; }
    this.px = state.x; this.py = state.y; this.dir = state.dir || 'down';
    if (state.world === 'veil' && !flag('veilUnlocked')) state.world = 'living';
    this.world = state.world;
    this.walkT = 0; this.stepDist = 0; this.light = !!state.flags.light; this.shiftCool = 0; this.saveT = 0;
    this.ch = chapterOf(state.chapter);

    buildPlayerTextures(this, state.look);
    this.grid = { living: this.M.living.map((r) => r.slice()), veil: this.M.veil.map((r) => r.slice()) };
    (state.flags.patches || []).forEach((p) => this.applyPatchString(p, false));
    this.buildLayers();
    this.buildEntities();

    this.pl = this.add.image(this.px, this.py, 'p_' + this.dir + '_0').setOrigin(0.5, 1);
    const pw = this.M.w * T, ph = this.M.h * T;
    const cam = this.cameras.main;
    cam.setZoom(ZOOM); cam.setBounds(0, 0, pw, ph, true); cam.startFollow(this.pl, true, 0.12, 0.12);
    cam.centerOn(this.px, this.py - 12);

    this.buildOverlay();
    this.ctx = this.makeCtx();
    this.refreshEntities();
    this.applyWorldVisuals(false);

    ui.hooks.objective = () => this.ch.objective(state);
    ui.hooks.onChange = () => {};
    ui.hooks.quitToMenu = () => this.quit();
    ui.hooks.restartChapter = () => this.restartChapter();
    ui.hooks.afterImport = () => this.scene.start('World', { mapId: state.mapId });
    ui.showHud(true); ui.setChapter(this.ch.CHAPTER.title + ' · ' + this.M.name); ui.setObjective(this.ch.objective(state)); ui.setWorld(this.world);
    audio.setWorld(this.world);
    setSceneHandler((k, e) => this.onKey(k, e));
    this.events.once('shutdown', () => setSceneHandler(null));

    cam.fadeIn(350, 0, 0, 0);
    window.__veil = this; // handy for automated tests and teacher debugging
    save(true);
    if (!flag('arrived') && this.ch.arrive) { setFlag('arrived'); this.time.delayedCall(450, () => this.ch.arrive(this.ctx)); }
  }

  // ---------------------------------------------------------------- build
  buildLayers() {
    const pw = this.M.w * T, ph = this.M.h * T;
    this.rt = {};
    for (const w of ['living', 'veil']) this.rt[w] = this.add.renderTexture(0, 0, pw, ph).setOrigin(0, 0).setDepth(0);
    this.drawLayers();
  }
  drawLayers() {
    for (const w of ['living', 'veil']) {
      const rt = this.rt[w]; rt.clear(); rt.beginDraw();
      this.grid[w].forEach((row, y) => row.forEach((ch, x) => rt.batchDraw(tkey(ch, w), x * T, y * T)));
      rt.endDraw();
    }
  }
  applyPatchString(p, redraw = true) {
    const [map, x, y, ch, w] = p.split('|');
    if (map !== this.M.id) return;
    if (w === 'L' || w === 'B') this.grid.living[+y][+x] = ch;
    if (w === 'V' || w === 'B') this.grid.veil[+y][+x] = ch;
    if (redraw) this.drawLayers();
  }
  patch(map, x, y, ch, w = 'B') {
    const p = [map, x, y, ch, w].join('|');
    state.flags.patches = state.flags.patches || [];
    if (!state.flags.patches.includes(p)) state.flags.patches.push(p);
    this.applyPatchString(p, true); save();
  }

  buildEntities() {
    this.ents = ENTITIES.filter((e) => e.map === this.M.id).map((def) => {
      const o = { def, x: def.x * T, y: def.y * T, sprite: null, busy: false };
      if (def.tex) {
        o.sprite = this.add.image(o.x, o.y, def.tex);
        o.sprite.setDepth(def.ghost ? o.y + 500 : o.y + o.sprite.height / 2);
      }
      return o;
    });
    this.zones = ZONES.filter((z) => z.map === this.M.id);
    this.motes = [];
    for (let i = 0; i < 36; i++) { const m = this.add.image(0, 0, 'ent_mote').setDepth(4000).setAlpha(0).setVisible(false); m.vx = (Math.random() - 0.5) * 8; m.vy = -4 - Math.random() * 8; m.ph = Math.random() * 6; this.motes.push(m); }
  }
  entVisible(o, world = this.world) { const e = o.def; return e.worlds.includes(world) && (!e.when || e.when(this.ctx)); }
  refreshEntities() { for (const o of this.ents) if (o.sprite) o.sprite.setVisible(this.entVisible(o)); ui.setObjective(this.ch.objective(state)); }

  buildOverlay() {
    this.cv = this.textures.createCanvas('lightcv' + Date.now(), VIEW_W, VIEW_H);
    this.overlay = this.add.image(0, 0, this.cv.key).setOrigin(0, 0).setDepth(5000);
    this.t = 0;
  }

  // ---------------------------------------------------------------- collision
  solidTile(tx, ty, world) {
    if (tx < 0 || ty < 0 || tx >= this.M.w || ty >= this.M.h) return true;
    return SOLID.has(this.grid[world][ty][tx]);
  }
  blockedAt(x, y, world = this.world) {
    const l = x - FEET_W / 2, r = x + FEET_W / 2 - 0.01, t = y - FEET_H, b = y - 0.01;
    for (const [cx, cy] of [[l, t], [r, t], [l, b], [r, b]]) if (this.solidTile(Math.floor(cx / T), Math.floor(cy / T), world)) return true;
    for (const o of this.ents) {
      if (!o.def.solid || !this.entVisible(o, world)) continue;
      const [bw, bh, dy] = o.def.box || [28, 24, 4];
      const el = o.x - bw / 2, er = o.x + bw / 2, et = o.y + dy - bh / 2, eb = o.y + dy + bh / 2;
      if (r > el && l < er && b > et && t < eb) return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- script API
  makeCtx() {
    const self = this;
    const c = {
      state,
      world: () => self.world,
      flag, setFlag: (k, v) => { setFlag(k, v); self.refreshEntities(); },
      hasItem, hasClue,
      say: (who, text) => ui.say(who, text),
      choose: (p, o) => ui.choose(p, o),
      write: (o) => ui.writePrompt(o),
      toast: (t, ms) => ui.toast(t, ms),
      clue(id) { if (addClue(id)) { ui.toast('Evidence added: ' + CLUES[id].title); audio.pickup(); } },
      giveItem(id) { if (addItem(id)) { ui.toast('Added to your pack: ' + ITEMS[id].name); audio.pickup(); } },
      log: (t) => addLog(t),
      meet(id) { if (meet(id)) ui.toast('New in your journal: ' + CHARACTERS[id].name); },
      decide: (id, t) => addDecision(id, t),
      refresh: () => self.refreshEntities(),
      flash: () => self.cameras.main.flash(300, 255, 240, 200),
      patch: (m, x, y, ch, w) => self.patch(m, x, y, ch, w),
      once: (evt) => new Promise((res) => self.events.once(evt, res)),
      puzzle(name, cfg) {
        if (name === 'bell') return bellPuzzle({ ...cfg, world: self.world });
        if (name === 'symbols') return symbolPuzzle(cfg);
        return Promise.resolve(false);
      },
      teleport(map, x, y, dir) { self.teleport(map, x, y, dir); },
      endChapter() { self.endChapter(); },
    };
    return c;
  }

  teleport(map, x, y, dir) {
    if (this.leaving) return; this.leaving = true;
    state.mapId = map; state.x = x * T; state.y = y * T; state.dir = dir || 'down'; save(true);
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ mapId: map, x, y, dir }));
  }
  endChapter() {
    if (this.leaving) return; this.leaving = true;
    if (!state.chaptersDone.includes(state.chapter)) state.chaptersDone.push(state.chapter);
    save(true);
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => { ui.showHud(false); this.scene.start('ChapterEnd', { chapter: state.chapter }); });
  }
  quit() { save(true); ui.showHud(false); this.scene.start('Title'); }
  restartChapter() {
    const s = this.ch.CHAPTER.start;
    state.flags = {}; state.inventory = []; state.journal = []; state.mapId = s.mapId; state.x = s.x * T; state.y = s.y * T; state.dir = s.dir; state.world = 'living';
    save(true); this.scene.start('World', { mapId: s.mapId });
  }

  // ---------------------------------------------------------------- input
  onKey(k) {
    if (ui.isLocked() || this.leaving) return;
    if (k === 'e') this.interact();
    else if (k === 'v') this.shiftWorld();
    else if (k === 'f') this.toggleLight();
    else if (k === 'r') ui.openPanel('archive');
    else if (k === 'i') ui.openPanel('inventory');
    else if (k === 'j') ui.openPanel('journal');
    else if (k === 'h') ui.say('', 'Hint: ' + this.ch.hint(state));
    else if (k === 'escape') ui.openPanel('pause');
  }
  nearest() {
    let best = null, bd = 1e9;
    for (const o of this.ents) {
      if (!o.def.run || !this.entVisible(o)) continue;
      const d = Math.hypot(o.x - this.px, o.y - (this.py - 6));
      if (d <= (o.def.r || 44) && d < bd) { best = o; bd = d; }
    }
    return best;
  }
  interact() {
    const o = this.nearest();
    if (!o || o.busy) return;
    o.busy = true;
    Promise.resolve(o.def.run(this.ctx)).catch((e) => console.error(e)).finally(() => { o.busy = false; this.refreshEntities(); });
  }
  toggleLight() { this.light = !this.light; state.flags.light = this.light; audio.uiBlip(); ui.toast(this.light ? 'Flashlight on.' : 'Flashlight off.', 1200); }
  shiftWorld() {
    if (!flag('veilUnlocked')) { ui.toast('Nothing happens. Not yet.'); return; }
    if (this.shiftCool > 0) return;
    const to = this.world === 'living' ? 'veil' : 'living';
    if (this.blockedAt(this.px, this.py, to)) { ui.toast('Something solid waits in the other world right here. Step to a clearer spot first.', 3200); audio.deny(); return; }
    this.world = to; state.world = to; this.shiftCool = 0.7;
    this.applyWorldVisuals(true);
    this.events.emit('shift', to);
    save();
  }
  applyWorldVisuals(fx) {
    this.rt.living.setVisible(this.world === 'living'); this.rt.veil.setVisible(this.world === 'veil');
    this.refreshEntities(); ui.setWorld(this.world); audio.setWorld(this.world);
    if (fx) { audio.shiftSound(this.world === 'veil'); this.cameras.main.flash(260, 150, 190, 255); this.cameras.main.shake(180, 0.0025); }
  }

  // ---------------------------------------------------------------- frame
  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    this.t += dt; state.playMs += delta; this.shiftCool = Math.max(0, this.shiftCool - dt);
    const locked = ui.isLocked() || this.leaving;
    let moving = false;
    if (!locked) {
      const a = axis();
      if (a.x || a.y) {
        const len = Math.hypot(a.x, a.y), sp = running() ? 175 : 105;
        const dx = (a.x / len) * sp * dt, dy = (a.y / len) * sp * dt;
        const ox = this.px, oy = this.py;
        if (dx && !this.blockedAt(this.px + dx, this.py)) this.px += dx;
        if (dy && !this.blockedAt(this.px, this.py + dy)) this.py += dy;
        if (Math.abs(a.x) >= Math.abs(a.y) && a.x) this.dir = a.x > 0 ? 'right' : 'left'; else if (a.y) this.dir = a.y > 0 ? 'down' : 'up';
        moving = this.px !== ox || this.py !== oy;
        if (moving) {
          this.stepDist += Math.hypot(this.px - ox, this.py - oy);
          if (this.stepDist > 26) { this.stepDist = 0; const ch = this.grid[this.world][Math.floor((this.py - 2) / T)]?.[Math.floor(this.px / T)]; audio.step(ch === ',' || ch === ':' ? 'grass' : 'stone'); }
        }
      }
      this.checkZones();
    }
    this.walkT = moving ? this.walkT + dt : 0;
    const frame = moving ? 1 + (Math.floor(this.walkT / 0.16) % 2) : 0;
    this.pl.setTexture('p_' + this.dir + '_' + frame).setPosition(this.px, this.py).setDepth(this.py);
    state.x = this.px; state.y = this.py; state.dir = this.dir;
    this.animateEntities();
    this.updateOverlay();
    // interaction prompt
    if (locked) ui.prompt(null);
    else {
      const o = this.nearest();
      if (o) { const l = typeof o.def.label === 'function' ? o.def.label(this.ctx) : o.def.label; ui.prompt('[E] ' + (l || 'Examine')); } else ui.prompt(null);
    }
    this.saveT += dt; if (this.saveT > 4) { this.saveT = 0; save(); }
  }

  checkZones() {
    const tx = Math.floor(this.px / T), ty = Math.floor((this.py - 2) / T);
    for (const z of this.zones) {
      if (tx < z.x || tx >= z.x + z.w || ty < z.y || ty >= z.y + z.h) continue;
      if (z.worlds && !z.worlds.includes(this.world)) continue;
      if (z.when && !z.when(this.ctx)) continue;
      if (z.once && flag('z_' + z.id)) continue;
      if (z.running) continue;
      if (z.once) setFlag('z_' + z.id);
      z.running = true;
      Promise.resolve(z.run(this.ctx)).catch((e) => console.error(e)).finally(() => { z.running = false; this.refreshEntities(); });
      break;
    }
  }

  animateEntities() {
    const t = this.t;
    for (const o of this.ents) {
      const s = o.sprite; if (!s || !s.visible) continue;
      const e = o.def;
      if (e.bob) s.y = o.y + Math.sin(t * 2.4) * 2.5;
      if (e.ghost) { s.alpha = 0.55 + 0.25 * Math.sin(t * 2 + o.x) + (Math.random() < 0.02 ? 0.2 : 0); s.y = o.y + Math.sin(t * 1.3) * 3; }
      if (e.glow) s.alpha = 0.7 + 0.3 * Math.sin(t * 3 + o.x);
    }
    // drifting motes in the Veil
    const cam = this.cameras.main, v = cam.worldView, veil = this.world === 'veil';
    for (const m of this.motes) {
      m.setVisible(veil);
      if (!veil) continue;
      if (m.alpha === 0 || m.x < v.x - 20 || m.x > v.right + 20 || m.y < v.y - 20) { m.x = v.x + Math.random() * v.width; m.y = v.bottom - Math.random() * 40; m.vy = -6 - Math.random() * 10; }
      m.x += m.vx * 0.016 + Math.sin(t + m.ph) * 0.15; m.y += m.vy * 0.016;
      m.alpha = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.8 + m.ph));
    }
  }

  updateOverlay() {
    const cam = this.cameras.main, v = cam.worldView, z = cam.zoom;
    this.overlay.setPosition(v.x, v.y).setScale(1 / z);
    const ctx = this.cv.context, W = VIEW_W, H = VIEW_H;
    const sx = (this.px - v.x) * z, sy = (this.py - 20 - v.y) * z;
    const veil = this.world === 'veil';
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    if (this.M.dark) {
      ctx.fillStyle = veil ? 'rgba(2,5,14,0.82)' : 'rgba(1,2,6,0.965)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'destination-out';
      let R = veil ? 330 : (this.light ? 330 : 78);
      const off = this.light ? 0.28 * R : 0, dx = this.dir === 'left' ? -off : this.dir === 'right' ? off : 0, dy = this.dir === 'up' ? -off : this.dir === 'down' ? off : 0;
      const g = ctx.createRadialGradient(sx + dx, sy + dy, R * 0.12, sx + dx, sy + dy, R);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.55, 'rgba(0,0,0,0.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    } else if (this.M.dusk) {
      ctx.fillStyle = veil ? 'rgba(2,6,20,0.38)' : 'rgba(6,10,30,0.42)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'destination-out';
      const g = ctx.createRadialGradient(sx, sy, 40, sx, sy, 380);
      g.addColorStop(0, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
    }
    if (veil) { ctx.fillStyle = 'rgba(90,150,255,0.11)'; ctx.fillRect(0, 0, W, H); }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, veil ? 'rgba(5,15,40,0.55)' : 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    this.cv.refresh();
  }
}
