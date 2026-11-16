# Suggested Design Rules (Design-Agnostic)

These rules are intentionally **layout- and style-independent** so upcoming pull requests can radically redesign, simplify, or remove sections of the site without breaking core quality, accessibility, or deployment.

---

## 1. Deployment & Static Delivery
- **Pure client-side static site:** No backend server or required build step unless `.github/workflows/deploy.yml` is updated to run it.
- **Keep `./web` deployable:** `.github/workflows/deploy.yml` deploys `./web` to GitHub Pages. Ensure `./web/index.html` exists and all assets it references live inside `./web/`.
- **UTF-8 without BOM:** Save all `.html`, `.css`, `.js`, `.json`, and `.svg` files as UTF-8 without replacement characters (`\uFFFD`). Czech and English characters must render cleanly.
- **Relative paths:** Prefer relative URLs (`css/style.css`, `artists.html`) over root-absolute `/...` paths so the site works both on GitHub Pages subpaths and local servers.

## 2. Structural Integrity (Enforced by CI)
- **Valid HTML5 shell:** Every full page must include `<!DOCTYPE html>`, `<title>`, and `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- **Zero dead links or missing assets:** When simplifying or removing pages/features, remove or update every `<a href>`, `<link href>`, `<script src>`, and `<img src>` pointing to them.
- **Valid JavaScript:** Every `.js` file must parse cleanly (`node --check`) with zero syntax errors.

## 3. Responsive & Mobile Ergonomics
- **Mobile-first baseline (`375px`+):** All pages must be usable on a `375px` wide viewport without unintended horizontal page scrolling (`overflow-x`).
- **Fluid layouts & wrap-safe navigation:** Allow navigation links, tags, and filter controls to wrap or collapse cleanly instead of overflowing off-screen.
- **Tap-friendly targets:** Keep interactive buttons and links large enough to tap comfortably on touch devices.

## 4. Accessibility & Semantic HTML
- **Language & landmarks:** Set `<html lang="...">` on every page and use semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`).
- **Heading hierarchy:** Use one primary `<h1>` per page and avoid skipping heading levels.
- **Accessible media & controls:** Provide meaningful `alt` text on informative `<img>` elements (or `alt=""` for decorative images), visible `:focus-visible` states for keyboard navigation, and readable text contrast.

## 5. Resilience During Simplification
- **Graceful JS degradation:** Core content and navigation should remain reachable even if optional scripts or `fetch()` calls fail (e.g., when opened via `file:///`).
- **No console errors:** Avoid uncaught runtime exceptions when optional DOM elements from older designs are absent.
