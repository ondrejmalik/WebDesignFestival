# Design: Light-Adaptive Bento Dock Footer (`04-eventbrite`)

**Date:** 2026-11-25  
**Scope:** Small change (single shared component across the 9 root HTML pages, mirrored `web/` bundle, `css/overrides.css`, `js/lang.js`, and light JS hook wiring)

## Intent & Why

The current site-wide `.eb-footer` inherits the generic cross-design dark slab from `shared/css/festival-features.css`. That creates two problems:
1. **Looks too similar to another team's project** (`Ladrys/webdesign`, whose `.rocks-footer` uses the same `#090a0c` dark background, orange hover accent, 4-column Rock-for-People grid, 5 outlined social icon buttons, and `© …` + `BACK TO TOP ↑` bottom strip).
2. **Existing UX/content bugs:** hardcoded Czech `FESTIVAL TEMNOTY 2` wordmark and English copyright line, duplicated `Tickets` links across both nav columns, an orphan `Artist Spotlight` template link, and 5 fake placeholder social buttons that only pop a "coming soon" toast.

The new footer should feel unmistakably built for **Festival of Darkness 2 (`04-eventbrite`)**, matching its Eventbrite-inspired card-and-pill aesthetic, Solar/Lunar stage accents, and light/dark surfaces.

## Goals, Non-Goals, Anti-Goals

- **Goals:**
  - Visually distinct from `Ladrys/webdesign` in both light and dark modes.
  - Native to `04-eventbrite` (rounded cards, `FD` vermilion badge, Solar amber + Lunar cobalt accents, pill CTAs, bilingual brand identity).
  - Deduplicated navigation, working live `My Schedule` count pill, direct stage & arrival shortcuts, and bottom-of-page `EN/CZ`, theme, and scroll-to-top utilities.
  - Full WCAG 2.2 AA contrast, semantic HTML (`<footer>`, `<nav>`, `<address>`), keyboard focus rings, and 44px touch targets on mobile.
- **Non-Goals:**
  - Redesigning the header, mobile bottom dock, or any of the other 10 variants in `designs/`.
  - Adding a newsletter form, backend integration, or fake social channels.
- **Anti-Goals:**
  - Falling back to a full-bleed dark 4-column slab with stacked uppercase link lists and 5 placeholder social icon buttons.
  - Introducing inline `style=""`, layout shift (CLS), horizontal overflow at `375px`, or broken i18n keys.

## Constraints

- Pure static HTML/CSS/JS; no build step; UTF-8 without BOM with Czech diacritics intact.
- Scope CSS strictly under `html[data-design="04-eventbrite"] .eb-footer` in `css/overrides.css` (and `web/css/overrides.css`) so other designs remain untouched.
- Update all 9 root pages (`index`, `program`, `artists`, `artist-detail`, `stages`, `practical-info`, `my-schedule`, `search`, `tickets` `.html`) and mirror every change identically into `web/`.
- Maintain `92px` bottom clearance below `900px` for the mobile bottom dock.
- Keep all `data-i18n` keys synchronized between `en` and `cs` in `js/lang.js` (and `web/js/lang.js`); keep existing `fod_footer_*` keys intact if referenced elsewhere.

## Approaches Considered

| Approach | Summary | Trade-offs |
|---|---|---|
| **A. Light-Adaptive Bento Dock *(Selected)*** | Two-tier card-and-pill footer topped by a vermilion→Solar→Lunar gradient hairline: asymmetric bento row (brand/CTA card + Solar/Lunar stages & arrival card), compact grouped horizontal directory bar, and slim utility colophon (`EN/CZ`, theme, top). | Most cohesive with `04-eventbrite` and maximally distinct from `Ladrys/webdesign` in both themes; slightly taller when cards stack on mobile. |
| **B. Floating Event Ticket Stub** | Centered single card with a dashed vertical perforation separating links from date/venue/ticket CTA. | Ultra-compact and event-native, but too tight for stage shortcuts and secondary links without crowding. |
| **C. Warm Vermilion Poster Band + Footer Search** | Full-width burnt-vermilion/deep-espresso band with oversized display title and an embedded search form. | Strong poster drama and bottom-of-page search utility, but visually loud on quieter subpages. |

**Why Approach A:** It directly mirrors `04-eventbrite`'s card-and-pill design language, showcases the festival's unique two-stage + personal schedule features, and breaks cleanly from the dark-slab clone pattern.

## Decided Design

### 1. Visual System & Surfaces
- **Top Accent Hairline:** 3px linear gradient across the top border of `.eb-footer` (`#c93b1f → #d97706 → #2563eb`).
- **Light Mode (`data-theme="light"`):**
  - Footer backdrop: `--eb-surface-warm` (`#eaedf2`) with subtle top border.
  - Brand Bento Card: rich vermilion surface (`linear-gradient(135deg, #c93b1f 0%, #a82d15 100%)`) with crisp `#ffffff` ink, `FD` inverted badge, and high-contrast white + translucent-white pill CTAs.
  - Stages & Arrival Bento Card: `#ffffff` card with `1px solid var(--eb-border)` (`#d5dce4`), `16px` radius, and `--eb-shadow-card`.
- **Dark Mode (`data-theme="dark"`):**
  - Footer backdrop: `#141821` with `#263042` top border.
  - Brand Bento Card: deep warm-vermilion card (`linear-gradient(135deg, #9f2912 0%, #7c1f0e 100%)`) with `#ffffff` ink and crisp borders so it still pops without glaring.
  - Stages & Arrival Bento Card: `#1b202b` surface with `#334155` border and `#f3f4f6` / `#cbd5e1` text.

### 2. Layout & Information Architecture
1. **Tier 1 — Asymmetric Bento Row** (`grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr)` on desktop, single column below `768px`):
   - **Left Card (Festival Brand & Actions):**
     - `FD` square emblem + bilingual brand title (`data-i18n="brand.short"` → `Festival of Darkness 2` / `Festival Temnoty 2`).
     - Bilingual meta line (`10–12 Jul 2026 · Sedlec, Kutná Hora · 60 Acts`).
     - Two pill actions: primary `Tickets & Passes` (`tickets.html`) and secondary `My Schedule` (`my-schedule.html`) with live `.nav-badge-count` counter.
   - **Right Card (Stages & Arrival):**
     - Heading (`STAGES & ARRIVAL` / `SCÉNY A DOPRAVA`).
     - Two color-coded quick links: amber dot (`--fod-solar`) → `Solar Horizon Stage (Open-Air)` (`stages.html#stage-solar`), cobalt dot (`--fod-lunar`) → `Lunar Forest Dome (Covered)` (`program.html?stage=lunar&window=tonight`).
     - Direct arrival link: `Shuttle & Directions from Kutná Hora hl.n. →` (`practical-info.html#doprava`).
2. **Tier 2 — Compact Horizontal Directory** (no 4-column vertical stacks, no fake social buttons):
   - **Explore row** (`<nav aria-labelledby="...">`): `Overview` (`index.html`), `Program` (`program.html`), `Artists` (`artists.html`), `Stages` (`stages.html`), `Search` (`search.html`) — active page gets `aria-current="page"`.
   - **Practical & Contact row** (`<nav aria-labelledby="...">` + `<address>`): `Practical Info` (`practical-info.html`), `Camping` (`practical-info.html#kemp`), `Cashless` (`practical-info.html#cashless`), `FAQ` (`practical-info.html#faq`), plus `info@festivaltemnoty.cz` (`mailto:`).
3. **Tier 3 — Slim Colophon & Utility Bar:**
   - Left: Bilingual copyright (`© 2026 Festival of Darkness 2 · Darkness Collective CZ` / `© 2026 Festival Temnoty 2 · Darkness Collective CZ`).
   - Right: Inline utility pills — Language switcher (`.lang-switch` wired automatically by `bindLangButtonsClean()`), Theme switcher (synced with `festival_theme`), and subtle `↑ Top` button (`[data-footer-top="true"]`).

### 3. Responsive & Interactive Behavior
- Desktop (`>= 900px`): 2-column asymmetric bento row, horizontal wrapped pill rows in Tier 2, split colophon row.
- Tablet/Mobile (`< 768px`): Bento cards stack vertically, links wrap cleanly with `>= 44px` tap height, colophon wraps cleanly, `92px` bottom padding preserves mobile dock clearance.
- `My Schedule` pill badge auto-updates via existing `.nav-badge-count` listener in `festival-core.js`; `[data-footer-top]` uses existing smooth-scroll handler with `prefers-reduced-motion` support.

## Left to the Builder

- Exact padding, border-radius, and hover transition tuning inside `css/overrides.css` to match adjacent `04-eventbrite` cards.
- Clean wiring of the footer theme button to the existing theme toggle logic in `js/design4-overrides.js` (or `shared/js/festival-core.js`) so header and footer theme toggles stay in sync without duplicating logic.
- Exact Czech/English wording for the new `fod_footer_*` i18n keys in `js/lang.js` and verification via `node tests/guard.js` + visual light/dark/mobile checks.
