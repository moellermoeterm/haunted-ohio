# Haunted Ohio shared assets

| Path | What |
|---|---|
| `css/ho-fonts.css` | Self-hosted fonts (no Google Fonts request). Licenses in `fonts/LICENSES.md`. |
| `css/ho-core.css` | Design tokens and components (`ho-` prefix). Night is the default; `<html data-theme="light">` is Daylight. |
| `js/ho-ui.js` | `window.HO`: theme, loader, dialog, toast, icon helper. |
| `img/ho-logo.png`, `img/ho-icon.png` | The badge, extracted once instead of embedded as base64 in every page. |
| `img/ho-icons.svg` | Icon sprite: `<svg class="ho-icon"><use href="assets/img/ho-icons.svg#i-search"/></svg>` |

Preview everything at `/design-system/`. Each game re-maps the same tokens with `data-game="files | last-light | veil | room214"`.
Pages adopt this incrementally, so nothing existing is affected until a page links the stylesheet.
