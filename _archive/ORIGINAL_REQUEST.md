# Original User Request

## 2026-10-19T23:55:50Z

Implement 10 completely separated, standalone mobile-first wireframe layout prototypes for the Festival of Darkness 2 website based on the existing canonical desktop implementation in the root `.html`, `.css`, and `.js` files, strictly adhering to `zadani.txt`, `agents.md`, and `project-specification.md`. Include a central Windows PC Google Chrome showcase hub with an interactive viewport simulator (`prototypes/index.html`).

Working directory: `c:\Users\Administrator\Desktop\webapp\WebDesignFestival`
Integrity mode: development

## Requirements

### R1. Grounding in Existing Desktop Codebase & Project Guidelines
Use the existing content, data, schedule structure, and logic from the root files (`index.html`, `program.html`, `artists.html`, `stages.html`, `practical-info.html`, `my-schedule.html`, `css/wireframe.css`, `js/schedule.js`, `js/artists.js`, and `data.xml`) as the canonical foundation.
Strictly adhere to:
- `zadani.txt`: Course Exercise 3 requirements (mobile-first, semantic HTML5, pure client-side with no build tools or package managers).
- `agents.md`: Minimalist wireframe rules (`border: 1px solid #222`, cards `#777`, `<hr>` dividers, no shadows/radiuses, no horizontal overflow), navigation wrapping, dedicated subpages.
- `project-specification.md`: Festival of Darkness 2, Kutna Hora, July 10–12, 2026, 2 stages (Solar Horizon & Lunar Forest Dome), 60 performers.

### R2. Central Showcase Hub & Chrome Device Simulator (`prototypes/index.html`)
Build a central testbed optimized for Google Chrome on Windows PC with:
- An interactive device frame viewport switcher (375px iPhone SE, 412px Pixel 7, 768px iPad, and 100% full desktop).
- Quick launch buttons and side-by-side links for all 10 layouts.
- An embedded 5-point evaluation rubric (Ergonomics, Scenario 1 Speed, Scenario 2 Speed, Information Density, Desktop Scaling) for testing and picking the winner.

### R3. 10 Completely Standalone Mobile-First Layouts
Create 10 completely separated directories (`prototypes/layout-01-app-shell/` through `prototypes/layout-10-mission-control/`). Each directory must be 100% self-contained with its own complete multi-page set (`index.html`, `program.html`, `artists.html`, `stages.html`, `practical-info.html`, `my-schedule.html`), standalone CSS (`layout.css`), and standalone JS (`layout.js`):
- **L01: App-Shell Bottom Nav** (Native mobile app bar ergonomics with bottom thumb bar)
- **L02: Chronological Feed** (Live timeline stream with sticky filter ribbon)
- **L03: Modular Bento-Grid** (Card-based visual hierarchy & status widgets)
- **L04: Split Stage Switcher** (Top segmented toggle between Solar & Lunar stages)
- **L05: Dense Data Terminal** (Monospace high-utility fast scanning table)
- **L06: Accordion Drawer Hub** (Zero-scroll collapsible day/time drawers)
- **L07: Floating Action Dock** (Single-handed bottom-right thumb FAB)
- **L08: Horizontal Snap Deck** (CSS scroll-snap swipeable stage cards)
- **L09: Swiss Typographic Index** (Minimalist bracketed editorial grid)
- **L10: Mission Control Dashboard** (Operational hub with live weather/shelter alerts)

### R4. Scenario Walkthroughs & Shared Bookmark State
- **Scenario 1 Walkthrough:** Finding what is playing at the indoor covered dome (*Lunar Forest Dome*) during rain in <= 3 taps.
- **Scenario 2 Walkthrough:** Toggling show bookmarks into `localStorage` under `festival_favorites`. State is shared across all layouts so saved shows persist seamlessly.
- **My Schedule:** Complete conflict detection when two saved shows overlap in the same time slot.

## Acceptance Criteria

### Standalone Integrity & Portability
- [ ] Each of the 10 layout folders runs independently without 404s, broken relative links, or external CDN/build tool dependencies.
- [ ] All 60 artists and 60 schedule slots from `data.xml` are accurately represented.

### Responsive Quality & Ergonomics
- [ ] On every page, `document.documentElement.scrollWidth <= document.documentElement.clientWidth` evaluates to `true` across 375px, 412px, 768px, and 1200px viewports (no horizontal overflow).
- [ ] Interactive touch targets on mobile viewports are at least 44x44px.

### Scenario Validation
- [ ] Starting from the homepage of any layout, reaching the covered dome timetable takes <= 3 taps.
- [ ] Bookmarking shows in any layout persists into `festival_favorites` in `localStorage` and reflects across other layouts.
- [ ] Overlapping bookmarked performances trigger a visual clash warning in `my-schedule.html`.
