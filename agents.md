# Instructions for AI Agents & Developers (`agents.md`)

Binding context and technical invariants for **Festival of Darkness 2** (`WebDesignFestival`).

---

## 1. Execution & Environment Rules

Pure client-side solution—no Node.js backend, Docker, or build bundlers (Vite/Webpack) in the final deliverable.

* **Local HTTP Server (Recommended):** Run with caching disabled (`npx http-server -p 8080 -c-1` or `python -m http.server 8000`) and test with hard refreshes (`Ctrl + F5`). Default `http-server` caches for 1 hour (`max-age=3600`), serving stale DOM/links.
* **Direct `file:///` Execution:** Browsers block `fetch()` on `file:///` due to CORS. Navigation and footer components must use synchronous `<script src="...">` injection or static fallback HTML inside each page. **Never** overwrite functional DOM with an error message if `fetch()` fails.
* **Encoding:** Strictly read/write **UTF-8 without BOM**. Never corrupt Czech diacritics into replacement characters (`\uFFFD`).

---

## 2. Architecture & Domain Model

Grounded in `project-specification.md` and `data.xml` (Kutná Hora, July 10–12, 2026):
* **2 Stages:** `Solar Horizon Stage` (`stage-solar`, open-air, 30 sets) and `Lunar Forest Dome` (`stage-lunar`, covered weatherproof dome, 30 sets).
* **60 Performers & Slots (1:1 Bijection, 13:00–04:00 daily):**
  * **Day 1 (Fri, July 10):** `perf-01`..`perf-20` / `sch-01`..`sch-20`
  * **Day 2 (Sat, July 11):** `perf-21`..`perf-40` / `sch-21`..`sch-40`
  * **Day 3 (Sun, July 12):** `perf-41`..`perf-60` / `sch-41`..`sch-60`

### Multi-Page Structure (No SPA Hash Routing)
All navigation links must point to `.html` files, never internal `#` anchors:
* `index.html` – Homepage, live weather/stage telemetry, 1-click rain shelter banner (`≤ 2 taps` to `Lunar Forest Dome`).
* `program.html` – 2D schedule matrix (rows: `13:00`–`04:00`, cols: stages, stacked by day). Filterable by Day, Stage, Genre, and Bookmarks (`★`).
* `artists.html` – 60-artist catalog (3×20 grid) with live search, genre pills, and bookmarking.
* `artist-detail.html` – Dynamic profile, simulated audio waveform preview, and exact-spot scroll return with pulse highlight (`.spot-highlight`).
* `stages.html` – Stage comparison, SVG venue map, and stage links.
* `practical-info.html` – Transport, shuttles, camping, cashless, FAQ.
* `my-schedule.html` – Personal planner (`localStorage` key `festival_favorites`) with collision detection.
* `search.html` – Static/lightweight search results showcase (accessed via drawer input per `zadani.txt`), complementing live in-page filtering.

---

## 3. UI & Low-Fi Wireframe Rules (Exercise 3)

1. **Strict Wireframe Styling:** Sharp `0px` corners. No shadows, border-radius, or gradients.
   * **Main blocks (`.wf-box`):** `border: 1px solid #222; background: #fff;`
   * **Sub-cards (`.wf-box-sub`):** `border: 1px solid #777; background: #fafafa;`
   * **Dividers:** `<hr>` with `border-top: 1px solid #333;`
   * **Functional Colors Only:** Bookmarked (`#d4edda` / `#28a745`), Collision (`#ffebee` / `#b71c1c`), Covered Stage Badge (`#fff3cd`).
   * **Dark Mode (`html.dark-mode`):** Persisted in `localStorage`. Backgrounds `#121212` / `#1e1e1e`, borders `#444`, primary text `#e0e0e0`, muted text `#a6a6a6`.
2. **Navigation, Drawer & Bottom Dock:**
   * **No Borders:** Neither `<nav>` nor `<footer>` may have borders or be wrapped in `.wf-box`.
   * **Brand Link (`.festival-brand`):** Links `[ Festival of Darkness 2 ]` to `index.html` with `text-decoration: none;`.
   * **Sticky Header & Hybrid Shell:** Sticky `#nav-placeholder` (`top: 0; z-index: 1000`), Alza flyout drawer (`#menu-drawer-open-btn`), and fixed 5-button bottom thumb-zone dock (`padding-bottom: 78px` on `<body>`).
3. **Zero Horizontal Overflow (`overflow-x`):**
   * Never use `white-space: nowrap` with `overflow-x: auto` on nav links, filter pills, or tables.
   * Links and pills must wrap naturally (`display: flex; flex-wrap: wrap; gap: 10px 18px;`). Timetables must fit 100% mobile width (375px) without horizontal scrolling.
4. **Zero Inline Styles:**
   * Do not use `style="..."` in HTML or inject inline style strings via JS. Use CSS custom properties (`--wf-*`) and semantic classes (`.conflict-alert-box`, `.conflict-clean-box`, `.is-favourite`, `.is-favourited`, `.audio-preview-box`, `.is-hidden`).

---

## 4. Critical Logic & Prevented Bugs (Do Not Regress)

* **Bilingual Switcher (`js/lang.js`):** Update text via `data-i18n` in-place without re-rendering/closing the open navigation drawer. Never use slash-combined strings (`Program / Harmonogram`). Flag SVG + label (`EN` / `CZ`) must reflect the active language.
* **Czech Pluralization (3-Case Declension):** Always use helper functions for `1` (`uložené vystoupení` / `časová kolize` / `interpret`), `2–4` (`uložená vystoupení` / `časové kolize` / `interpreti`), and `5+` (`uložených vystoupení` / `časových kolizí` / `interpretů`).
* **Day-Filter Canonical Mapping:** `artists.html` and `program.html` format day strings differently. Filtering in `my-schedule.html` (`isFavoriteInDay`) must check canonical performer ID ranges (`perf-01..20` = Day 1, `21..40` = Day 2, `41..60` = Day 3) alongside normalized day strings.
* **Midnight Wraparound in Collision Detection:** Sets run from `13:00` to `04:00`. Normalize hours `< 8` by adding `+24` hours (`+1440` minutes) before checking overlaps:
  ```javascript
  function parseTimeToMinutes(timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      return ((h < 8 ? h + 24 : h) * 60) + m;
  }
5. Submission Structure & Frozen Test Contracts
Root vs. web/ Mirroring
Tests (tests/*.js) run against files in the repository root, while zadani.txt requires web assets inside web/. Keep canonical source files in the root during development and sync them into web/ via scripts/package_submission.js.

Semantic HTML5 & Accessibility (WCAG 2.0 AA)
Logical heading hierarchy (single <h1> per page, no skipped levels to <h2>/<h3>).

Skip link <a href="#main-content" class="skip-link" data-i18n="skip_to_content"> targeting <main id="main-content">.

Schedule tables require <caption class="sr-only">, scope="col", scope="row", and <time datetime="HH:MM">.

Wrap artist cards in <article class="col wf-box-sub" id="perf-XX"> and venue/contact info in <address>. Maintain Schema.org JSON-LD blocks on all pages.

Frozen Selectors & Values (DO NOT RENAME)
Over 215 test assertions depend on these exact identifiers:

Target	Required Identifiers / Selectors
css/wireframe.css	.spot-highlight, @keyframes spot-pulse-highlight, .stage-nav-tabs, .sch-detail-btn, .stage-link, .artist-detail-meta-text, .artist-detail-bio-text, html.dark-mode .artist-detail-bio-text, html.dark-mode .stage-link, #a6a6a6, html.dark-mode svg rect[fill="#fff3cd"], .is-favourite
components/nav.html	#theme-switch-btn, #theme-switch-btn-drawer, #lang-switch-btn, #menu-drawer-open-btn, .festival-brand, .fav-count-badge
program.html	.col-solar, .col-lunar, id="sch-01" .. id="sch-60"
artists.html	#artist-search-input, #filtered-count, #filter-fav-only, id="perf-01" .. id="perf-60"
artist-detail.html	#preview-play-btn, #profile-star-btn
my-schedule.html	#my-schedule-container
6. Pre-Commit Verification Protocol
Run all checks before completing any task or committing:

Bash
# 1. Run automated test suites
node tests/artist_detail_and_breadcrumbs_test.js
node tests/dark_mode_test.js
node tests/bottom_switcher_test.js
node tests/lang_switcher_test.js
node tests/sticky_nav_test.js
node tests/e2e_test_runner.js
node tests/challenger_1_m0_r2_suite.js
node tests/challenger_1_m1_suite.js

# 2. Verify zero UTF-8 replacement characters (\uFFFD) and zero HTML inline styles
node -e "
const fs = require('fs');
const html = ['index.html','program.html','artists.html','artist-detail.html','stages.html','practical-info.html','my-schedule.html','components/nav.html','components/footer.html'];
const all = [...html, 'js/schedule.js','js/artists.js','js/artist-detail.js','js/lang.js','components/nav.js','components/footer.js','css/wireframe.css'];

all.forEach(f => {
  if (fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('\uFFFD')) throw new Error('UTF-8 corruption in ' + f);
});
html.forEach(f => {
  if (fs.existsSync(f) && /style\s*=\s*\"[^\"]*\"/.test(fs.readFileSync(f, 'utf8'))) throw new Error('Inline style found in ' + f);
});
console.log('PASS: UTF-8 clean and zero inline HTML styles.');
"
