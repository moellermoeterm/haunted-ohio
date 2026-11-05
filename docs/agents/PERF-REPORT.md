# Performance report

## Budget (frozen in CONTRACTS.md)
- First-load download excluding the shared Phaser file: <= 450 KB per game.
- Phaser 3.90.0: 1,196,122 bytes (314,863 bytes gzipped), shared, cached once.
- Runtime: 60 fps target, >= 30 fps floor at 4x CPU throttle; <= 400 live game objects; no image or audio files.

## Measured (The Veil, branch `integration/veil`)
- Our code, all files a Veil page loads except Phaser (shared JS and CSS + Veil JS, CSS, HTML + the two existing site helpers): **about 112 KB uncompressed, about 35 KB gzipped**. Budget met with a wide margin. Zero image and audio requests.
- Phaser: 1.2 MB (315 KB gzipped) one time per browser cache.
- Frame rate, Chromium with **4x CPU throttle**: **60 fps**; **20** live game objects (limit 400). The two world backgrounds are pre-rendered once into textures, so per-frame work is moving one player sprite and a text prompt.
- Renderer: Phaser CANVAS (predictable on low-end GPUs), `powerPreference: low-power`, pixel-art, internal size 1280 x 704 scaled to fit.
- No per-frame allocations in the update loop beyond a small axis object; audio is synthesized on demand and rate-limited.
Measured by `tests/new-games/veil-play.test.mjs` ("performance" test). Real low-end tablet measurement is still a to-do.
