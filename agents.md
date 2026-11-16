# AGENTS.md - Festival of Darkness 2: parallel redesign

Pure static client-side site (no build step, no backend). UTF-8 without BOM. Czech diacritics must stay intact.

## Layout
- `designs/NN-name/` - ONE design = ONE agent. Touch only your own folder.
  - `DESIGN_BRIEF.md` - read first.
  - `inspiration/` - screenshots, `design-notes.md`, `ai-remake.html` (AI mock-up, NOT the real site; inspiration only).
  - `web/` - self-contained deployable site (html, css/, js/, components/, img/). `web/css/style.css` starts as the old wireframe CSS - restyle or replace it freely.
- `data/festival.xml`, `data/artists.json` - shared source data, READ-ONLY.
- `project-specification.md`, `zadani.txt`, `DESIGN_RULES.md` - requirements (read only if needed; DESIGN_RULES.md is the quality baseline).
- `_archive/` - old wireframe site, tests, prototypes, raw inspirations. DO NOT READ. Do not waste context there.

## Rules
- Content: Kutna Hora, 10-12 Jul 2026, 2 stages (Solar Horizon / Lunar Forest Dome), 60 artists, 3 days. Cart/tickets come later.
- Pages (keep file names): index, program, artists, artist-detail, stages, practical-info, my-schedule, search `.html`. Real `.html` links, no hash routing.
- Keep working: bilingual EN/CZ (`js/lang.js`), favourites in `localStorage` key `festival_favorites`, collision detection (hours < 8 are +24h), Czech 3-case plurals, dark mode.
- Free to restyle/restructure markup and rewrite JS. No inline `style=""`. No horizontal overflow at 375px. Relative paths only.
- GUARD (mandatory): `node tests/guard.js designs/NN-name` runs the smoke test + language test (quiet: prints only failures + `smoke: ok / lang: ok`; add `--verbose` for all checks). Do NOT push/submit until it passes (a git pre-push hook and CI block failing designs). Tests are design-agnostic: removing/rewording elements is fine. Language contract only: every page loads `js/lang.js`; `FESTIVAL_I18N` has `en`+`cs` with identical keys; every `data-i18n*` key used in markup exists in both; `get/set/toggleFestivalLang` and `formatCzPlural` stay on `window`. Do not edit `tests/`.
- One-time per clone: `git config core.hooksPath .githooks`

## Working method
Read the `frontend` skill first. Before finishing, check your design against `web-design-guidelines`, `accessibility` and `responsive-design`.
Do not read big files whole (`js/*.js` are 25-60 KB). Use the `ask_ai_team` (flash-team) tool for analysis, review and drafting; read only the slices you need; look at screenshots in `inspiration/` rather than the HTML.