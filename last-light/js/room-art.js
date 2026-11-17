/* The Last Light: radio room art. Everything is drawn in code at load on canvas textures. There are no image files.
   Coordinates are in a 1344 by 864 space (14 by 9 tiles of 96); the scene scales them down to its smaller internal canvas. */
(function () {
  'use strict';
  var T = 96, W = 14, H = 9, PW = W * T, PH = H * T;
  function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  var R = rng(20470);
  function rr(a, b) { return a + R() * (b - a); }
  function shade(hex, k) { var n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; r = Math.max(0, Math.min(255, Math.round(r * k))); g = Math.max(0, Math.min(255, Math.round(g * k))); b = Math.max(0, Math.min(255, Math.round(b * k))); return 'rgb(' + r + ',' + g + ',' + b + ')'; }
  function grain(c, x, y, w, h, n, col, alpha, horiz) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = col; c.globalAlpha = alpha; for (var i = 0; i < n; i++) { c.lineWidth = rr(.5, 1.6); c.beginPath(); if (horiz) { var yy = y + R() * h, wob = rr(-3, 3); c.moveTo(x, yy); c.bezierCurveTo(x + w * .3, yy + wob, x + w * .6, yy - wob, x + w, yy + rr(-2, 2)); } else { var xx = x + R() * w, wb = rr(-3, 3); c.moveTo(xx, y); c.bezierCurveTo(xx + wb, y + h * .3, xx - wb, y + h * .6, xx + rr(-2, 2), y + h); } c.stroke(); } c.restore(); }
  function speckle(c, x, y, w, h, n, col, a) { c.save(); c.fillStyle = col; for (var i = 0; i < n; i++) { c.globalAlpha = a * R(); c.fillRect(x + R() * w, y + R() * h, rr(1, 2.4), rr(1, 2.4)); } c.restore(); }
  function shadow(c, x, y, w, h, blur, a) { c.save(); c.shadowColor = 'rgba(0,0,0,' + a + ')'; c.shadowBlur = blur; c.shadowOffsetX = 6; c.shadowOffsetY = 10; c.fillStyle = 'rgba(0,0,0,' + a + ')'; c.fillRect(x, y, w, h); c.restore(); }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  /* ---------- the room, drawn once onto one canvas ---------- */
  function drawRoom(c, o) {
    o = o || {}; R = rng(20470);
    var x, y, i, w = 0;
    /* floor: long planks, staggered joints, wear */
    var PL = 40;
    for (y = T; y < PH - T * .5; y += PL) {
      var off = ((y / PL) % 2) * 170 + rr(0, 60);
      for (x = T * .5 - off; x < PW; x += w) {
        w = rr(230, 380); var base = ['#5b4630', '#544029', '#614a33', '#4d3a26', '#584431'][Math.floor(R() * 5)], k = rr(.82, 1.08);
        c.fillStyle = shade(base, k); c.fillRect(x, y, w, PL - 2);
        grain(c, x, y, w, PL - 2, 9, shade(base, .62), .55, true); grain(c, x, y, w, PL - 2, 4, shade(base, 1.35), .22, true);
        if (R() < .35) { c.fillStyle = 'rgba(20,12,6,.5)'; c.beginPath(); c.ellipse(x + rr(20, w - 20), y + PL / 2, rr(4, 9), rr(3, 6), 0, 0, 7); c.fill(); }   // knots
        c.fillStyle = 'rgba(15,10,6,.85)'; c.fillRect(x + w - 2, y, 2, PL - 2);                                                                     // end joint
        c.fillStyle = 'rgba(190,190,180,.5)'; c.fillRect(x + 8, y + 8, 2.5, 2.5); c.fillRect(x + 8, y + PL - 13, 2.5, 2.5); c.fillRect(x + w - 14, y + 8, 2.5, 2.5); c.fillRect(x + w - 14, y + PL - 13, 2.5, 2.5); // nails
      }
      c.fillStyle = 'rgba(8,6,4,.95)'; c.fillRect(0, y + PL - 2, PW, 2);
    }
    /* wear: a pale scuffed path from the door to the bench, grain dust in the corners, old stains */
    var g = c.createRadialGradient(PW * .5, PH * .62, 30, PW * .5, PH * .62, 360); g.addColorStop(0, 'rgba(210,190,150,.16)'); g.addColorStop(1, 'rgba(210,190,150,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH);
    for (i = 0; i < 9; i++) { var sx = rr(T, PW - T), sy = rr(T * 1.6, PH - T); g = c.createRadialGradient(sx, sy, 2, sx, sy, rr(30, 90)); g.addColorStop(0, 'rgba(18,12,8,.34)'); g.addColorStop(1, 'rgba(18,12,8,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); }
    speckle(c, T * .5, T, PW - T, PH - T * 1.5, 2600, '#e8d9a8', .18); speckle(c, T * .5, T, PW - T, PH - T * 1.5, 1600, '#000', .35);
    [[T * .6, T * 1.2], [PW - T * 1.6, PH - T * 1.4], [T * .7, PH - T * 1.5]].forEach(function (p) { g = c.createRadialGradient(p[0], p[1], 4, p[0], p[1], 130); g.addColorStop(0, 'rgba(214,190,120,.34)'); g.addColorStop(1, 'rgba(214,190,120,0)'); c.fillStyle = g; c.fillRect(0, 0, PW, PH); speckle(c, p[0] - 90, p[1] - 70, 190, 150, 500, '#e6cf8a', .5); });

    /* back wall: tall weathered boards with a steel brace, seen from above at a slant */
    var WH = T * 1.25;
    c.fillStyle = '#1b1712'; c.fillRect(0, 0, PW, WH);
    for (x = 0; x < PW; x += rr(34, 52)) { var bw = rr(34, 52), bc = ['#3a3026', '#33291f', '#40352a', '#2e251c'][Math.floor(R() * 4)]; c.fillStyle = shade(bc, rr(.8, 1.1)); c.fillRect(x, 0, bw - 2, WH - 6); grain(c, x, 0, bw - 2, WH - 6, 7, shade(bc, .55), .6, false); if (R() < .3) { c.fillStyle = 'rgba(120,70,40,.25)'; c.fillRect(x + rr(2, bw - 8), rr(0, WH * .4), rr(2, 5), rr(20, 70)); } }
    g = c.createLinearGradient(0, 0, 0, WH); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(.7, 'rgba(0,0,0,.05)'); g.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = g; c.fillRect(0, 0, PW, WH);
    c.fillStyle = '#4b4f52'; c.fillRect(0, WH * .42, PW, 12); c.fillStyle = 'rgba(255,255,255,.14)'; c.fillRect(0, WH * .42, PW, 2); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(0, WH * .42 + 10, PW, 3);
    for (x = 30; x < PW; x += 118) { c.fillStyle = '#2a2d30'; c.beginPath(); c.arc(x, WH * .42 + 6, 4.5, 0, 7); c.fill(); c.fillStyle = 'rgba(150,80,40,.5)'; c.fillRect(x - 1, WH * .42 + 10, 2.5, rr(8, 26)); }
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(0, WH - 6, PW, 6); g = c.createLinearGradient(0, WH, 0, WH + 46); g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, WH, PW, 46);
    /* side walls and front wall (seen edge-on) */
    [[0, 0, T * .5, PH], [PW - T * .5, 0, T * .5, PH], [0, PH - T * .5, PW, T * .5]].forEach(function (r) { c.fillStyle = '#17130f'; c.fillRect(r[0], r[1], r[2], r[3]); grain(c, r[0], r[1], r[2], r[3], 30, '#000', .5, r[2] > r[3]); grain(c, r[0], r[1], r[2], r[3], 12, '#4a3d2e', .35, r[2] > r[3]); });
    g = c.createLinearGradient(T * .5, 0, T * .5 + 40, 0); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(T * .5, WH, 40, PH);
    g = c.createLinearGradient(PW - T * .5, 0, PW - T * .5 - 40, 0); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(PW - T * .5 - 40, WH, 40, PH);

    /* slatted window in the back wall (left), and the door in the front wall */
    var wx = T * 2.1, wy = 22, ww = T * 1.7, wh = 62; c.fillStyle = '#0a1018'; c.fillRect(wx, wy, ww, wh); for (i = 0; i < 7; i++) { c.fillStyle = '#2b241b'; c.fillRect(wx, wy + i * 9, ww, 5); c.fillStyle = 'rgba(150,180,220,.5)'; c.fillRect(wx, wy + i * 9 + 5, ww, 1.5); } c.strokeStyle = '#191510'; c.lineWidth = 6; c.strokeRect(wx, wy, ww, wh);
    var dx = T * 6.3, dw = T * 1.4; c.fillStyle = '#2a2219'; c.fillRect(dx, PH - T * .5, dw, T * .5); grain(c, dx, PH - T * .5, dw, T * .5, 14, '#0c0906', .7, false); c.fillStyle = '#6a6f72'; c.fillRect(dx + dw - 22, PH - T * .5 + 16, 12, 5); c.fillStyle = 'rgba(120,150,190,.5)'; c.fillRect(dx + 3, PH - 4, dw - 6, 2.5);
    g = c.createLinearGradient(0, PH - T * .5, 0, PH - T * .5 - 70); g.addColorStop(0, 'rgba(120,150,190,.20)'); g.addColorStop(1, 'rgba(120,150,190,0)'); c.fillStyle = g; c.fillRect(dx, PH - T * .5 - 70, dw, 70);

    /* grain chute: a wide steel pipe crossing the far right corner, with a ladder beside it */
    c.save(); c.translate(PW - T * 1.9, WH - 8); c.rotate(.5); shadow(c, -8, 6, 300, 66, 20, .55); g = c.createLinearGradient(0, 0, 0, 66); g.addColorStop(0, '#2f3336'); g.addColorStop(.3, '#7c8286'); g.addColorStop(.5, '#a2a8ab'); g.addColorStop(.75, '#4e5356'); g.addColorStop(1, '#1e2123'); c.fillStyle = g; c.fillRect(0, 0, 300, 66); for (i = 0; i < 4; i++) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(20 + i * 80, 0, 5, 66); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(25 + i * 80, 0, 2, 66); } speckle(c, 0, 0, 300, 66, 260, '#7a3d1c', .6); c.restore();

    /* supply shelf on the right wall: steel uprights, plank shelves, tins and jugs */
    var sx0 = PW - T * 1.55, sy0 = T * 3.1, sw = T * 1.0, sh = T * 2.9; shadow(c, sx0, sy0, sw, sh, 22, .6); c.fillStyle = '#3d3226'; c.fillRect(sx0, sy0, sw, sh); grain(c, sx0, sy0, sw, sh, 40, '#1a130c', .6, false);
    for (i = 0; i < 4; i++) { c.fillStyle = '#585d60'; c.fillRect(sx0 - 3, sy0 + i * (sh / 3) - (i === 3 ? 6 : 0), sw + 6, 6); }
    var cans = [['#8a2f25', 16], ['#b8ad8a', 15], ['#3f5a4a', 17], ['#8a6a2a', 14], ['#51606e', 16], ['#b8ad8a', 15], ['#8a2f25', 14]]; cans.forEach(function (cn, k) { var cx = sx0 + 22 + (k % 3) * 27, cy = sy0 + 34 + Math.floor(k / 3) * 46; c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.arc(cx + 3, cy + 5, cn[1], 0, 7); c.fill(); c.fillStyle = cn[0]; c.beginPath(); c.arc(cx, cy, cn[1], 0, 7); c.fill(); c.strokeStyle = 'rgba(230,230,220,.55)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, cn[1] - 3, 0, 7); c.stroke(); c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(cx - 4, cy - 4, cn[1] * .35, 0, 7); c.fill(); });
    [[sx0 + 30, sy0 + sh - 62], [sx0 + 68, sy0 + sh - 58]].forEach(function (j) { c.fillStyle = 'rgba(0,0,0,.5)'; rrect(c, j[0] - 17, j[1] - 21, 40, 48, 8); c.fill(); c.fillStyle = '#6f8fa8'; rrect(c, j[0] - 20, j[1] - 25, 40, 48, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.25)'; rrect(c, j[0] - 15, j[1] - 20, 12, 30, 5); c.fill(); c.fillStyle = '#23303a'; c.beginPath(); c.arc(j[0], j[1] - 6, 6, 0, 7); c.fill(); });

    /* battery crate, left */
    var bx = T * .95, by = T * 3.4, bs = T * 1.05; shadow(c, bx, by, bs, bs * .82, 20, .6); c.fillStyle = '#5a4a33'; c.fillRect(bx, by, bs, bs * .82); grain(c, bx, by, bs, bs * .82, 22, '#231a0f', .65, true); c.fillStyle = '#17120c'; c.fillRect(bx + 9, by + 9, bs - 18, bs * .82 - 18);
    for (i = 0; i < Math.min(6, o.batt == null ? 5 : o.batt); i++) { var qx = bx + 24 + (i % 3) * 27, qy = by + 26 + Math.floor(i / 3) * 30; g = c.createRadialGradient(qx - 3, qy - 3, 1, qx, qy, 12); g.addColorStop(0, '#d8b04a'); g.addColorStop(.7, '#8a6a22'); g.addColorStop(1, '#3a2c0e'); c.fillStyle = g; c.beginPath(); c.arc(qx, qy, 11, 0, 7); c.fill(); c.fillStyle = '#c9ccce'; c.beginPath(); c.arc(qx, qy, 3.5, 0, 7); c.fill(); }
    c.strokeStyle = '#2d2418'; c.lineWidth = 5; c.strokeRect(bx, by, bs, bs * .82);

    /* cot, bottom left: frame, mattress, folded blanket, pillow, and the notebook */
    var cx0 = T * .8, cy0 = PH - T * 2.55, cw = T * 2.7, ch = T * 1.25; shadow(c, cx0, cy0, cw, ch, 26, .6); c.fillStyle = '#3b3d3a'; rrect(c, cx0 - 5, cy0 - 5, cw + 10, ch + 10, 8); c.fill(); c.fillStyle = '#7c7663'; rrect(c, cx0, cy0, cw, ch, 10); c.fill(); for (i = 0; i < 12; i++) { c.fillStyle = 'rgba(40,36,28,.25)'; c.fillRect(cx0 + 8 + i * (cw / 12), cy0, 3, ch); } speckle(c, cx0, cy0, cw, ch, 300, '#000', .25);
    c.fillStyle = '#5d2f2a'; rrect(c, cx0 + cw * .4, cy0 - 2, cw * .6, ch + 4, 10); c.fill(); for (i = 0; i < 6; i++) { c.strokeStyle = 'rgba(0,0,0,.28)'; c.lineWidth = rr(2, 5); c.beginPath(); c.moveTo(cx0 + cw * .42 + rr(0, 30), cy0); c.bezierCurveTo(cx0 + cw * .6, cy0 + rr(20, 60), cx0 + cw * .8, cy0 + rr(30, 90), cx0 + cw, cy0 + rr(10, ch)); c.stroke(); } c.fillStyle = '#743b34'; c.fillRect(cx0 + cw * .4, cy0 - 2, 12, ch + 4);
    c.fillStyle = '#b9b2a0'; rrect(c, cx0 + 14, cy0 + 22, 62, ch - 44, 14); c.fill(); c.fillStyle = 'rgba(0,0,0,.14)'; rrect(c, cx0 + 24, cy0 + 34, 40, ch - 70, 10); c.fill();
    c.save(); c.translate(cx0 + cw * .58, cy0 + ch * .46); c.rotate(-.22); c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-21, -27, 50, 64); c.fillStyle = '#23364a'; c.fillRect(-25, -32, 50, 64); c.fillStyle = '#d8cfb6'; c.fillRect(-21, -28, 42, 56); for (i = 0; i < 6; i++) { c.fillStyle = 'rgba(40,50,70,.5)'; c.fillRect(-16, -20 + i * 8, rr(18, 32), 1.4); } c.fillStyle = '#a02c22'; c.fillRect(-25, -6, 5, 12); c.restore();

    /* radio bench against the back wall: heavy plank top, legs' shadow, receiver, headphones, crank, mug, cable */
    var tx = T * 5.2, ty = WH - 14, tw = T * 5.2, th = T * 1.25; shadow(c, tx, ty + 14, tw, th, 30, .7); c.fillStyle = '#6a5032'; c.fillRect(tx, ty, tw, th); for (i = 0; i < 4; i++) { c.fillStyle = shade('#6a5032', rr(.86, 1.08)); c.fillRect(tx, ty + i * (th / 4), tw, th / 4 - 2); grain(c, tx, ty + i * (th / 4), tw, th / 4 - 2, 10, '#2a1c0d', .55, true); } c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(tx, ty + th - 5, tw, 5); for (i = 0; i < 5; i++) { g = c.createRadialGradient(tx + rr(20, tw - 20), ty + rr(20, th - 20), 2, tx + tw / 2, ty + th / 2, rr(20, 50)); g.addColorStop(0, 'rgba(20,12,6,.3)'); g.addColorStop(1, 'rgba(20,12,6,0)'); c.fillStyle = g; c.fillRect(tx, ty, tw, th); }
    /* receiver */
    var rx = tx + T * 1.15, ry = ty + 12, rw = T * 2.05, rh = T * .92; shadow(c, rx, ry, rw, rh, 16, .75); g = c.createLinearGradient(0, ry, 0, ry + rh); g.addColorStop(0, '#565d58'); g.addColorStop(.5, '#3d443f'); g.addColorStop(1, '#262b28'); c.fillStyle = g; rrect(c, rx, ry, rw, rh, 7); c.fill(); speckle(c, rx, ry, rw, rh, 500, '#000', .3); speckle(c, rx, ry, rw, rh, 160, '#9a5a2a', .5); c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 1.5; rrect(c, rx + 1, ry + 1, rw - 2, rh - 2, 6); c.stroke();
    for (i = 0; i < 9; i++) { c.fillStyle = '#121513'; c.fillRect(rx + 12, ry + 14 + i * 7, 46, 3.5); }                                           // speaker grille
    var dlx = rx + 70, dly = ry + 12, dlw = 96, dlh = 30; c.fillStyle = '#0b0d0c'; rrect(c, dlx - 3, dly - 3, dlw + 6, dlh + 6, 4); c.fill(); g = c.createLinearGradient(0, dly, 0, dly + dlh); g.addColorStop(0, o.powered ? '#ffcf73' : '#4a4334'); g.addColorStop(1, o.powered ? '#d98a2b' : '#2f2a20'); c.fillStyle = g; c.fillRect(dlx, dly, dlw, dlh); for (i = 0; i <= 20; i++) { c.fillStyle = 'rgba(40,20,5,.85)'; c.fillRect(dlx + 4 + i * 4.4, dly + 3, 1.2, i % 5 === 0 ? 12 : 7); }   // dial (the needle is drawn live)
    [[rx + 84, ry + 64, 13], [rx + 124, ry + 64, 10], [rx + 154, ry + 64, 10]].forEach(function (kn) { c.fillStyle = 'rgba(0,0,0,.6)'; c.beginPath(); c.arc(kn[0] + 2, kn[1] + 3, kn[2] + 1, 0, 7); c.fill(); g = c.createRadialGradient(kn[0] - 3, kn[1] - 3, 1, kn[0], kn[1], kn[2]); g.addColorStop(0, '#8a8f8b'); g.addColorStop(1, '#1c1f1d'); c.fillStyle = g; c.beginPath(); c.arc(kn[0], kn[1], kn[2], 0, 7); c.fill(); c.strokeStyle = '#e8e0c8'; c.lineWidth = 2; c.beginPath(); c.moveTo(kn[0], kn[1]); c.lineTo(kn[0] + kn[2] * .7, kn[1] - kn[2] * .5); c.stroke(); });
    c.fillStyle = o.powered ? '#57e08a' : '#1d2a22'; c.beginPath(); c.arc(rx + rw - 16, ry + 16, 3.6, 0, 7); c.fill();
    c.strokeStyle = '#9da3a6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(rx + rw - 12, ry + 6); c.lineTo(rx + rw + 46, ry - 34); c.stroke();          // aerial
    /* headphones, crank, mug, cable to the wall */
    var hx = tx + 58, hy = ty + 62; c.strokeStyle = '#1b1d1c'; c.lineWidth = 7; c.beginPath(); c.arc(hx, hy, 26, Math.PI * .95, Math.PI * 2.05); c.stroke(); [[hx - 26, hy + 2], [hx + 26, hy + 2]].forEach(function (e) { c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(e[0] + 3, e[1] + 4, 13, 16, 0, 0, 7); c.fill(); c.fillStyle = '#2b2e2d'; c.beginPath(); c.ellipse(e[0], e[1], 13, 16, 0, 0, 7); c.fill(); c.fillStyle = '#6e5a44'; c.beginPath(); c.ellipse(e[0], e[1], 8, 11, 0, 0, 7); c.fill(); });
    c.strokeStyle = '#0d0e0d'; c.lineWidth = 3; c.beginPath(); c.moveTo(hx + 26, hy + 14); c.bezierCurveTo(hx + 60, hy + 50, rx - 30, ry + rh + 10, rx + 6, ry + rh - 12); c.stroke();
    if (o.crank) {var kx = tx + tw - 70, ky = ty + 60; c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.arc(kx + 3, ky + 5, 24, 0, 7); c.fill(); g = c.createRadialGradient(kx - 6, ky - 6, 2, kx, ky, 24); g.addColorStop(0, '#9aa0a3'); g.addColorStop(1, '#2b2f31'); c.fillStyle = g; c.beginPath(); c.arc(kx, ky, 23, 0, 7); c.fill(); c.strokeStyle = '#15171a'; c.lineWidth = 2; for (i = 0; i < 12; i++) { c.beginPath(); c.moveTo(kx + Math.cos(i * .524) * 17, ky + Math.sin(i * .524) * 17); c.lineTo(kx + Math.cos(i * .524) * 23, ky + Math.sin(i * .524) * 23); c.stroke(); } c.strokeStyle = '#b9bdbf'; c.lineWidth = 6; c.beginPath(); c.moveTo(kx, ky); c.lineTo(kx + 30, ky - 22); c.stroke(); c.fillStyle = '#5a3a22'; c.beginPath(); c.arc(kx + 32, ky - 24, 8, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.arc(tx + 100, ty + 26, 15, 0, 7); c.fill(); c.fillStyle = '#c9c2b0'; c.beginPath(); c.arc(tx + 97, ty + 22, 14, 0, 7); c.fill(); c.fillStyle = '#2a1a10'; c.beginPath(); c.arc(tx + 97, ty + 22, 10, 0, 7); c.fill();
    c.strokeStyle = '#0d0e0d'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(rx + rw - 6, ry + 30); c.bezierCurveTo(rx + rw + 50, ry + 30, tx + tw - 10, ty + 20, tx + tw + 30, WH - 30); c.stroke();
    /* a strip of tape beside the receiver, with pencil marks; a procedures card pinned to the wall */
    var px0 = rx + rw + 14, py0 = ry + 14; c.save(); c.translate(px0, py0); c.rotate(-.04); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(2, 3, 62, 20); c.fillStyle = '#d9cfae'; c.fillRect(0, 0, 62, 20); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, 0, 62, 3); for (i = 0; i < 6; i++) { c.fillStyle = 'rgba(50,50,60,.8)'; c.fillRect(7 + i * 9 + i * .9, 5, 1.6, 10); } c.restore();
    var kx2 = T * 10.75, ky2 = 44; c.save(); c.translate(kx2, ky2); c.rotate(.05); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(3, 4, 44, 58); c.fillStyle = '#cfc6a6'; c.fillRect(0, 0, 44, 58); for (i = 0; i < 6; i++) { c.fillStyle = i === 3 ? 'rgba(120,30,20,.8)' : 'rgba(40,40,50,.55)'; c.fillRect(6, 10 + i * 7.5, i === 3 ? 32 : rr(20, 32), i === 3 ? 2.2 : 1.4); } c.fillStyle = '#8a8f92'; c.beginPath(); c.arc(22, 4, 3, 0, 7); c.fill(); c.restore();
    /* stool */
    var ox = tx + T * .25, oy = ty + th + 20; c.fillStyle = 'rgba(0,0,0,.6)'; c.beginPath(); c.arc(ox + 5, oy + 9, 30, 0, 7); c.fill(); g = c.createRadialGradient(ox - 8, oy - 8, 3, ox, oy, 30); g.addColorStop(0, '#77593a'); g.addColorStop(1, '#3a2915'); c.fillStyle = g; c.beginPath(); c.arc(ox, oy, 29, 0, 7); c.fill(); c.strokeStyle = 'rgba(20,12,5,.6)'; c.lineWidth = 1.5; for (i = 1; i < 4; i++) { c.beginPath(); c.arc(ox, oy, i * 7, 0, 7); c.stroke(); }
    /* burlap grain sacks and a coil of rope, lower right */
    [[PW - T * 2.6, PH - T * 1.55, .2], [PW - T * 1.9, PH - T * 1.25, -.35]].forEach(function (s) { c.save(); c.translate(s[0], s[1]); c.rotate(s[2]); c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(6, 10, 62, 40, 0, 0, 7); c.fill(); c.fillStyle = '#8c7650'; c.beginPath(); c.ellipse(0, 0, 60, 38, 0, 0, 7); c.fill(); c.save(); c.beginPath(); c.ellipse(0, 0, 60, 38, 0, 0, 7); c.clip(); c.strokeStyle = 'rgba(40,30,15,.35)'; c.lineWidth = 1; for (var q = -70; q < 70; q += 5) { c.beginPath(); c.moveTo(q, -40); c.lineTo(q + 14, 40); c.stroke(); c.beginPath(); c.moveTo(-70, q * .6); c.lineTo(70, q * .6 + 8); c.stroke(); } var gg = c.createRadialGradient(-18, -14, 4, 0, 0, 62); gg.addColorStop(0, 'rgba(255,240,200,.25)'); gg.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = gg; c.fillRect(-70, -45, 140, 90); c.restore(); c.fillStyle = '#5c4a2e'; c.fillRect(48, -8, 22, 14); c.restore(); });
  }

  /* ---------- the survivor, top-down ---------- */
  function drawPlayer(c) { c.clearRect(0, 0, 96, 96); c.save(); c.translate(48, 48); c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(4, 8, 27, 19, 0, 0, 7); c.fill(); var g = c.createLinearGradient(-26, 0, 26, 0); g.addColorStop(0, '#2f3a33'); g.addColorStop(.5, '#4c5c50'); g.addColorStop(1, '#2a332d'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 26, 17, 0, 0, 7); c.fill(); c.fillStyle = '#3a2f22'; c.fillRect(-9, -15, 18, 30); c.fillStyle = '#39473d'; c.beginPath(); c.ellipse(-22, -3, 8, 12, .2, 0, 7); c.fill(); c.beginPath(); c.ellipse(22, -12, 8, 15, -.5, 0, 7); c.fill(); c.fillStyle = '#c59a76'; c.beginPath(); c.arc(25, -25, 6, 0, 7); c.fill(); c.fillStyle = '#1c1e20'; c.fillRect(20, -44, 9, 20); c.fillStyle = '#ffe7b0'; c.fillRect(20, -47, 9, 4); g = c.createRadialGradient(-3, -4, 1, 0, 0, 13); g.addColorStop(0, '#4a3524'); g.addColorStop(1, '#231710'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 12.5, 0, 7); c.fill(); c.restore(); }

  window.LLRoomArt = { T: T, PW: PW, PH: PH, WH: T * 1.25, drawRoom: drawRoom, drawPlayer: drawPlayer, rng: rng };
})();
