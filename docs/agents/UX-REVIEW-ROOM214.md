# UX and accessibility review: Room 214

| Item | Status | Evidence |
|---|---|---|
| Keyboard parity | Pass | arrows/WASD, C, Shift, E, H, F, T, J, Esc; keyboard test |
| Touch parity | Pass | stick or D-pad plus Use, Hide, Light, Throw, Sneak, Run, Journal, Menu (all >= 44 px, tested at 390 and 768) |
| Noise works without sound | Pass | every noise is a ring on screen plus a captioned cue with a direction; porter footsteps and breathing are captioned; tested with sound off |
| No flashing over 3 Hz | Pass | cues limited to under 3 per second; the caught fade is one slow fade; low-intensity removes it |
| Low-intensity / mute / volume / text size | Pass | shared Settings |
| Colour-blind-safe | Pass | the porter is a dark shape with a facing line and a lantern ring (state shown by line style/brightness and the HUD/captions); items are distinct shapes; hiding spots are wardrobes with a handle detail; labels say UP, DOWN, EXIT, SAFE and room numbers |
| aria-live | Pass | objective, prompts, floor changes, hiding, light, new items; captions as a log |
| Responsive 390 to 1920 | Pass | tests |
| Readable in the dark | Note | the map is deliberately dark; a dim base layer (16% brightness) always shows the layout, the flashlight cone and a 2.4-tile glow reveal detail. A "brighter map" setting would be a good follow-up for low-vision players. |

Follow-ups for a human: real tablet testing; a screen-reader route (a text list of nearby things with Go-to buttons) is not built.
