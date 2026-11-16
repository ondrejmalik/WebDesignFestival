# Automated Test Suite & Verification Guide (TEST_READY.md)

**Project**: Festival of Darkness 2 (Kutna Hora, July 10–12, 2026)  
**Deliverable**: Mobile-First Wireframe Prototypes & Central Showcase Hub  
**Milestone**: Milestone 0 Test Harness (Remediated)  

---

## 1. Overview

This document details the automated End-to-End (E2E) and static integrity test harness designed for Course Exercise 3 (`zadani.txt`), project guidelines (`agents.md`), and the festival definition (`project-specification.md`).

The test runner is implemented in pure Node.js (`tests/e2e_test_runner.js`) with **zero external package or npm dependencies**, ensuring seamless execution offline and across all evaluation environments.

Following the Milestone 0 Forensic Audit and Review findings, all test logic has been remediated to enforce 100% genuine verification:
- Zero hardcoded test variables or tautological assertions (e.g. `TC-T5-01` parses `LAYOUT_META` via genuine File I/O).
- Zero false passes: Tier 4 and Tier 5 tests dynamically discover and inspect layout prototypes under `prototypes/layout-XX-*/`. Unbuilt prototypes are honestly reported as `PENDING` (Target: M1–M3) rather than checking pre-existing desktop files.
- Resilient time interval parsing in `prototypes/common/festival-data.js` supporting both Unicode en-dash and ASCII hyphen formats.
- Complete wireframe styling compliance in `prototypes/index.html` (zero `box-shadow`) and precise content-box viewport width alignment (exact 375px, 412px, 768px inner iframe width).

---

## 2. Test Execution Commands

Run the test suite from the project root using PowerShell or command line:

### A. Milestone 0 / Default Verification (Tiers 1–5 Harness)
Executes all checks across canonical data, the Showcase Hub, responsive rules, and scenario contracts. It evaluates available prototype layouts and tracks pending prototypes for upcoming milestones:
```bash
node tests/e2e_test_runner.js
```
*Expected exit code*: `0` (Success: 25/25 active test cases passing, 20 test cases tracked as pending for M1–M3: 10 prototype layout directories in Tier 3, 9 responsive/semantic rules in Tier 4, and 1 prototype highlight styling check in Tier 5).

### B. Specific Tier Execution
Run individual verification tiers in isolation:
```bash
# Tier 1: Canonical Data & Shared Module
node tests/e2e_test_runner.js --tier=1

# Tier 2: Central Showcase Hub & Chrome Device Simulator
node tests/e2e_test_runner.js --tier=2

# Tier 3: Prototype Directory & Static File Inventory
node tests/e2e_test_runner.js --tier=3

# Tier 4: Responsive, Semantic HTML5 & Ergonomic Rules
node tests/e2e_test_runner.js --tier=4

# Tier 5: Scenario Walkthroughs & Clash Engine
node tests/e2e_test_runner.js --tier=5
```

### C. Strict Mode (Full 10-Layout Completion Assertion)
Enforces that all 10 prototype directories and all 80 files (`index.html`, `program.html`, `artists.html`, `stages.html`, `practical-info.html`, `my-schedule.html`, `layout.css`, `layout.js`) must exist and pass:
```bash
node tests/e2e_test_runner.js --strict
```
*(Used in Milestone 4 for final full-suite acceptance and grading verification).*

---

## 3. Five-Tier Verification Matrix

The test matrix is defined in structured JSON at `tests/test_cases.json`:

| Tier | Name | Target Scope | Test Count | Current M0 Status |
|---|---|---|---|---|
| **Tier 1** | Canonical Data & Module Integrity | `prototypes/common/festival-data.js`, `data.xml`, `js/artists.js` | 10 | **10/10 PASS (100%)** |
| **Tier 2** | Central Showcase Hub & Device Simulator | `prototypes/index.html` | 10 | **10/10 PASS (100%)** |
| **Tier 3** | Prototype File Static Inventory | `prototypes/layout-01` through `layout-10` (80 files) | 10 | **10 Tracked (Pending M1–M3)** |
| **Tier 4** | Responsive, Semantic & Ergonomics | Prototype subpages & `layout.css` across all 10 layouts | 9 | **9 Tracked (Pending M1–M3)** |
| **Tier 5** | Scenarios, Shared State & Clash Engine | Scenario 1 (&le;3 taps), Scenario 2 (`festival_favorites`, clash math, `.is-favourite`) | 6 | **5/6 PASS (1 Pending M1–M3)** |
| **Total** | Full Evaluation Suite | Entire static deliverables | **45** | **25 Passed, 0 Failed, 20 Pending** |

---

## 4. Detailed Tier Descriptions

### Tier 1: Canonical Data & Module Integrity
- **TC-T1-01**: `prototypes/common/festival-data.js` loadable in Node.js (`require`) and browser (`window.FESTIVAL_DATA`).
- **TC-T1-02**: Festival metadata valid (name: "Festival of Darkness 2", edition: "2026", Kutna Hora, 2 stages).
- **TC-T1-03**: Exactly 60 unique performers (`perf-01` through `perf-60`) defined with name, genre, origin, stage, day, and time.
- **TC-T1-04**: Exactly 60 unique schedule items (`sch-01` through `sch-60`).
- **TC-T1-05**: Strict 1:1 mapping between each schedule slot and performer ID.
- **TC-T1-06**: All 60 performer biographies verified non-empty and identical to canonical source.
- **TC-T1-07**: Stage balance verified: exactly 30 acts on Solar Horizon Stage (Open-air) and 30 acts on Lunar Forest Dome (Covered).
- **TC-T1-08**: Post-midnight minute conversion: Hours < 8 add 1440 minutes, guaranteeing `00:05` (1445m) chronologically succeeds `23:30` (1410m).
- **TC-T1-09**: Interval overlap detection: Correctly flags overlapping intervals (e.g. `15:00–15:45` vs `15:00–15:50`), ignores sequential sets (`14:00–14:45` vs `15:00–15:45`), and handles midnight boundary sets. Resilient to both Unicode en-dash `–` and ASCII hyphen `-`.
- **TC-T1-10**: Covered dome helper returns exactly 30 shows total and 10 shows per day.

### Tier 2: Central Showcase Hub & Chrome Device Simulator
- **TC-T2-01**: `prototypes/index.html` verified with HTML5 DOCTYPE, meta description, and page title.
- **TC-T2-02**: Viewport switcher buttons implemented for iPhone SE (375px), Pixel 7 (412px), iPad Mini (768px), and Full Desktop (100%), with orientation rotation toggle.
- **TC-T2-03**: Centered simulated device container with `#simulator-iframe`.
- **TC-T2-04**: Simulated device top status bar (clock, battery `98%`, signal `5G`) and simulated address bar with reload button.
- **TC-T2-05**: Layout selector toolbar containing quick launch buttons for all 10 layouts (`L01` to `L10`).
- **TC-T2-06**: Subpage direct launcher linking to all 6 subpages (`index.html`, `program.html`, `artists.html`, `stages.html`, `practical-info.html`, `my-schedule.html`).
- **TC-T2-07**: Interactive 5-point evaluation rubric matrix (`#rubric-matrix-table`) with 10 layout rows and customizable numeric inputs (1–5).
- **TC-T2-08**: Rubric weighted calculation formula verified: `Ergonomics * 0.25 + S1 * 0.25 + S2 * 0.20 + Density * 0.15 + Scale * 0.15`.
- **TC-T2-09**: Dynamic winner calculation and announcement banner (`#winner-banner`) with green wireframe highlight (`#d4edda`, `border: 2px solid #28a745`).
- **TC-T2-10**: Scenario 1 and Scenario 2 validation testbeds with live bookmark counter, clash seeding, clean seeding, and direct iframe navigation.

### Tier 3: Prototype Directory & Static File Inventory (80 Files)
- Checks existence of all 10 layout directories (`prototypes/layout-01-app-shell` through `layout-10-mission-control`).
- For each directory, validates presence of all 8 mandatory files:
  1. `index.html` (Homepage & fast path)
  2. `program.html` (Schedule timetable)
  3. `artists.html` (Artist lineup & search)
  4. `stages.html` (Venue presentation & rain shelter)
  5. `practical-info.html` (Directions & FAQ)
  6. `my-schedule.html` (Personal planner & clash detection)
  7. `layout.css` (Standalone responsive wireframe CSS)
  8. `layout.js` (Standalone logic, bookmark sync, clash engine)
- Milestones mapping:
  - `L01`–`L04`: Delivered by Milestone 1
  - `L05`–`L07`: Delivered by Milestone 2
  - `L08`–`L10`: Delivered by Milestone 3

### Tier 4: Responsive, Semantic HTML5 & Ergonomic Rules
Dynamically targets prototype layout directories under `prototypes/layout-XX-*/`. In Milestone 0, because layouts are pending M1–M3 delivery, tests accurately report `PENDING` in harness mode (or `FAIL` in strict mode), completely preventing false-positive passes:
- **TC-T4-01**: Semantic landmark tags used across prototype templates (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- **TC-T4-02**: Proper heading hierarchy (`h1`–`h4`) in prototype templates.
- **TC-T4-03**: Unbordered, fluidly wrapping inline navigation (`flex-wrap: wrap`) avoiding forbidden horizontal scrollbars (`white-space: nowrap` + `overflow-x: auto`).
- **TC-T4-04**: Festival brand link `[ Festival of Darkness 2 ]` strictly un-underlined (`text-decoration: none`).
- **TC-T4-05**: Wireframe box styling rules applied (`border: 1px solid #222;`, `.wf-box-sub` `#777;`, `<hr>` `#333;`, zero box-shadows/gradients/radiuses).
- **TC-T4-06**: Minimum 44x44px touch targets on mobile interactive controls (no padding shortcuts).
- **TC-T4-07**: Zero horizontal overflow rules enforced (`box-sizing: border-box;`, viewport meta tag, no table overflow-x scrollbar).
- **TC-T4-08**: All 60 performers cataloged in prototype `artists.html`.
- **TC-T4-09**: All 60 timetable slots cataloged in prototype `program.html`.

### Tier 5: Scenario Walkthroughs, Shared State & Clash Engine
- **TC-T5-01**: Scenario 1: Attendee in rain reaches indoor covered *Lunar Forest Dome* timetable in &le; 3 taps from `index.html`. Verified dynamically via File I/O parsing of `LAYOUT_META` in `prototypes/index.html` (asserting all 10 layouts declare &le; 3 taps) and validating prototype DOMs when present.
- **TC-T5-02**: Scenario 2: Shared `localStorage` key `'festival_favorites'` used across all layouts and Showcase Hub.
- **TC-T5-03**: Favorite objects follow schema `{ id, artist, stage, day, time, genre }`.
- **TC-T5-04**: Real-time bookmark highlighting with `.is-favourite` (`background: #d4edda; border: 2px solid #28a745;`) evaluated across prototype `layout.css` stylesheets (Pending in M0; Target: M1–M3).
- **TC-T5-05**: Pairwise collision detection flags overlapping shows on different stages on same day with red border (`border: 2px solid #b71c1c; background: #ffebee;`) and alert `[ ⚠️ Time conflict with: <Artist> ]`. Verified with hyphen and en-dash resilience.
- **TC-T5-06**: Non-overlapping shows display clear status badge `[ ✓ No time conflict ]`.

---

## 5. Machine-Readable Test Output

Every run of `node tests/e2e_test_runner.js` automatically writes a structured JSON report to `tests/test_results.json`, recording:
- Timestamp
- Execution mode (`harness` vs `strict`)
- Summary totals (passed, failed, pending)
- Per-tier case breakdown with verbatim status and error details

---

## 6. Instructions for Prototype Implementers (M1–M3)

When developing your assigned layout batches:
1. Ensure your prototype directory contains all 6 subpages (`index.html`, `program.html`, `artists.html`, `stages.html`, `practical-info.html`, `my-schedule.html`), `layout.css`, and `layout.js`.
2. Include `<script src="../common/festival-data.js"></script>` or embed `FESTIVAL_DATA` directly to guarantee zero-CORS operation on `file:///`.
3. Read and write bookmarks from `localStorage.getItem('festival_favorites')` and `localStorage.setItem('festival_favorites', ...)`.
4. Ensure `layout.css` enforces `.is-favourite { background: #d4edda; border: 2px solid #28a745; }` and &ge;44x44px touch targets.
5. Run the test runner to verify your layout:
   ```bash
   node tests/e2e_test_runner.js
   ```
   Your layout will automatically transition from `[PENDING]` to `[PASS]`.
