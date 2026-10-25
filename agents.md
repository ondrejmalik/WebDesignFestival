# Instructions for AI Agents and Developers (agents.md)

This document serves as a binding context and guide for any AI model or developer continuing work on the **Festival of Darkness 2** (WebDesignFestival) project.

---

## 1. Running the Website & CORS / Caching Issues

The website is designed as a **pure client-side solution** without installation or backend requirements (as mandated by the semester project assignment).

### A. Local HTTP Server (Recommended)
When developing, use a local HTTP server with **caching disabled (no-cache)**:
```bash
# Run via http-server with cache disabled (-c-1 is critical!)
npx http-server -p 80 -c-1
# or
python -m http.server 8000
```
> **CRITICAL CACHING WARNING:**
> The default setting of `http-server` caches files for 1 hour (`max-age=3600`). When changing navigation links, browsers previously served outdated page versions containing stale hash anchors (`#`). Always run the server with `-c-1` and use hard refresh (**Ctrl + F5**) during testing.

### B. Direct Execution via File System (`file:///`)
If a user or evaluator opens files directly by double-clicking in file explorer:
- Browsers (Chrome, Edge) **block `fetch()` calls** due to CORS security policy on local `file:///` protocol.
- **Code Rule:** Components (`nav` and `footer`) must **never rely solely on asynchronous `fetch()`**. They must either be loaded via `<script src="...">` (e.g., [`components/nav.js`](file:///components/nav.js)), or have static fallback HTML directly inside each page. The script must never overwrite functional DOM with an error message upon fetch failure.

---

## 2. Project Spirit & Design Rules (Wireframes for Exercise 3)

When generating new code or making modifications, strictly adhere to this minimalist visual style:

### 1. Minimalist Wireframe Box Layout
- In this stage, the website serves as a **low-fidelity wireframe**.
- Only basic outlines are used:
  - Main blocks: `border: 1px solid #222; background: #fff;`
  - Nested sub-blocks / cards: `border: 1px solid #777; background: #fafafa;`
- Sections are cleanly separated with a simple `<hr>` element (`border-top: 1px solid #333`).
- **No unnecessary decorations:** Do not add shadows, border radiuses, color gradients, or complex graphical styles unless explicitly requested.

### 2. Navigation and Footer Rules
- **NO BOX / BORDER:** Neither navigation nor footer may be wrapped inside `.wf-box` or have any border!
- **Format:** Simple text row with links side-by-side separated by spacing (`gap` / `margin`).
- **Wrapping (No horizontal scrollbar):**
  - Using `white-space: nowrap` with `overflow-x: auto` is forbidden. The interface must never produce a horizontal scrollbar.
  - Links must wrap naturally and smoothly onto 2 or more lines when the window is narrowed or on mobile devices (`display: flex; flex-wrap: wrap; gap: 10px 18px;`).
- **Festival Brand Name:**
  - The festival name in navigation `[ Festival of Darkness 2 ]` is a link pointing to the homepage (`index.html`).
  - **Must NOT be underlined:** Strict `text-decoration: none;` applies to `.festival-brand`.

### 3. Dedicated Subpages (NO One-Page Web)
- Each section is a **separate HTML file**:
  - `index.html` – Homepage, festival identity, and section directory.
  - `program.html` – Complete performance timetable (school-schedule grid format) with interactive event bookmarking and highlighting.
  - `artists.html` – Complete catalog of all 60 performers (3 per line / 20 lines) with interactive dynamic artist profile details, search, genre filtering, and bookmarking.
  - `stages.html` – Presentation of the 2 stages (*Solar Horizon Stage* & *Lunar Forest Dome*) and venue map.
  - `practical-info.html` – Transportation, camping, cashless, FAQ.
  - `my-schedule.html` – Personal schedule / planner (LocalStorage) with automatic collision detection.
- Navigation links must **always point to actual `.html` files**, never just jump with hash anchors (`#`) within the same page!

### 4. Timetable & Schedule Format (Inspired by University Schedule)
- **Timetable Layout (No Left-to-Right Scrolling):**
  - Modeled after responsive schedule matrices: Hourly time slots down the rows (`13:00–14:00` through `03:00–04:00`) and Stage columns (`Solar Horizon Stage` & `Lunar Forest Dome`).
  - Stacks day-by-day (`Friday, July 10`, `Saturday, July 11`, `Sunday, July 12`) and fits 100% width naturally without any horizontal scrolling (`overflow-x` scrolling is avoided).
- **Interactive Highlighting & Favourites:**
  - Events can be bookmarked by clicking the cell or the `★` button.
  - Bookmarked cells are instantly highlighted (`.is-favourite` with distinct green wireframe styling `background: #d4edda; border: 2px solid #28a745;`).
  - Saved to `localStorage` under `festival_favorites` and synchronized in real time with `my-schedule.html`.
  - Filterable by Day (`Fri`, `Sat`, `Sun`, `All`), Stage (`Solar`, `Lunar`, `Both`), Genre (Quick Genre Pills), and `Only Bookmarked (★)`.


---

## 3. Technical Project Constraints (According to Assignment)

1. **Pure Client-Side:** No Node.js backend, Docker, database, or build process (Vite/Webpack) in the submitted deliverable. Everything must function purely in the browser.
2. **HTML5 Semantics:** Use semantic elements where appropriate: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<time>`, `<address>`.
3. **Data Consistency:** The website is grounded in `project-specification.md` and `data.xml` (Festival of Darkness 2, Kutna Hora, July 10–12, 2026, 3 days, 2 stages, 60 performers).
