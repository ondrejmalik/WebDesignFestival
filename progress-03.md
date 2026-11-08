# Průběžná zpráva k projektu: Cvičení 4 (`progress-03.md`)
**Projekt:** Festival of Darkness 2 (`WebDesignFestival`)  
**Ročník / Termín konání:** 2. ročník | 10.–12. července 2026 | Kutná Hora, Česká republika  
**Tým:** David Kostera, Ondřej Malík, František Josef Jankovský, Martin Karásek  
**Datum odevzdání:** Listopad 2026  

---

## 1. Co je implementováno (Implemented Scope & User Scenarios)

V rámci 4. cvičení (*první funkční implementace*) jsme dopracovali čistě klientskou (zero-server) implementaci celého webu ve složce `web/` (zrcadlené z kořene projektu), která je okamžitě spustitelná jak přes protokol `file:///`, tak na GitHub Pages bez nutnosti backendu či build nástrojů.

### A. Implementované stránky (8 propojených HTML5 dokumentů)
1. **Úvodní stránka (`index.html`):** Identita festivalu, živý telemetrický pás (*Mission Control* s lokálním časem a stavem oblačnosti), pohotovostní meteorologický alert pro okamžitý přesun pod střechu a rozcestník klíčových sekcí.
2. **Program (`program.html`):** Dvourozměrná rozvrhová matice (časy `13:00`–`04:00` × 2 scény *Solar Horizon Stage* a *Lunar Forest Dome* pro všechny 3 dny) s okamžitou filtrací podle dne, scény, žánru a záložek (`★`).
3. **Katalog účinkujících (`artists.html`):** Kompletní přehled všech 60 interpretů (`perf-01` až `perf-60`) v responzivní mřížce s živým fulltextovým vyhledáváním, žánrovými filtry a záložkováním.
4. **Detail účinkujícího (`artist-detail.html`):** Dynamický profil interpreta, bilingvní biografie, interaktivní simulátor audio ukázky (waveform přehrávač), přímé uložení do vlastního plánu a návrat na přesnou pozici v katalogu nebo rozvrhu se zvýrazněním (`.spot-highlight`).
5. **Místa / Scény (`stages.html`):** Technické a kapacitní srovnání obou scén, interaktivní vektorová SVG mapa areálu v Kutné Hoře – Sedlci a přímé prokliky na filtrovaný program každé scény.
6. **Praktické informace (`practical-info.html`):** Klíčové parametry ročníku 2026, jízdní řády kyvadlové dopravy (*Shuttle Bus*) ze stanice Kutná Hora hl. n., kroková mapa pěší trasy, pravidla stanování, cashless platby a strukturované FAQ.
7. **Můj plán (`my-schedule.html`):** Osobní plánovač využívající `localStorage` (`festival_favorites`) s automatickým kolizním enginem, který detekuje časové překryvy mezi scénami (včetně nočních setů přes půlnoc) a umožňuje konflikt vyřešit jedním kliknutím.
8. **Vyhledávání (`search.html`):** Dedikovaná vyhledávací stránka napříč interprety, scénami a praktickými informacemi s rychlými štítky (*Quick Search Pills*).

### B. Implementované klíčové uživatelské scénáře
- **Scénář 1 (Náhlý déšť v areálu):** Návštěvník na mobilu potřebuje rychle zjistit, kdo hraje pod střechou v *Lunar Forest Dome*. Z úvodní stránky se přes výrazný meteorologický banner dostane na vyfiltrovaný program kryté scény na **1 kliknutí** (případně na 2 kliknutí přes hlavní navigaci).
- **Scénář 2 (Sestavení osobního programu bez kolizí):** Návštěvník si v programu nebo katalogu ukládá koncerty pomocí `★`. V sekci *Můj plán* algoritmus okamžitě vyhodnocuje intervaly (normalizované na spojitou osu $13:00 \rightarrow 04:00$ s přičtením $+1440$ minut pro časy po půlnoci) a červeně zvýrazní případné překryvy.
- **Scénář 3 (Příjezd vlakem do Kutné Hory):** Návštěvník v sekci *Info* najde přesnou tabulku odjezdů shuttle busu navázanou na příjezdy vlaků R9/Ex i popis pěší trasy.

---

## 2. Aktuální best practices a trendy v oblasti UX a designu a jejich implementace

| Trend / UX Best Practice | Konkrétní implementace v projektu |
| :--- | :--- |
| **1. Kontextově adaptivní jednotná navigace (Desktop Top Bar vs. Mobile Thumb-Zone Dock)** | Na základě zpětné vazby vyučujícího a principu **Fittsova zákona** web využívá jediné sémantické `<nav>` menu se 7 identickými položkami. Na **desktopu (`@media (min-width: 769px)`)** je vykresleno jako vodorovná lišta nahoře v hlavičce. Na **mobilu (`@media (max-width: 768px)`)** se tentýž element přes CSS přemístí ke spodnímu okraji obrazovky do přirozené zóny palce (*Thumb Zone*), přičemž všechny dotykové plochy splňují min. rozměr $44\times 44\text{ px}$. |
| **2. Nulové horizontální přetékání (Zero Horizontal Overflow)** | Rozvrhové tabulky, filtry i navigační lišty se přirozeně zalamují (`flex-wrap: wrap`) a adaptují až do šířky `375px` (iPhone SE) bez vzniku vodorovného posuvníku (`scrollWidth <= clientWidth`). |
| **3. Sémantické HTML5 a přístupnost WCAG 2.0 Level AA** | Důsledné využití tagů `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<time datetime="...">`, `<address>` a tabulkových atributů `<caption>`, `scope="col"`, `scope="row"`. Nechybí klávesová zkratka *Skip to main content* (`.skip-link`) a korektní hierarchie nadpisů `<h1>`–`<h3>`. |
| **4. Design Tokens (CSS Custom Properties) & Dark Mode** | Kompletní eliminace inline stylů (`0` výskytů `style="..."` v HTML). Veškeré barvy jsou řízeny přes proměnné `--wf-*` v `:root` a `html.dark-mode`. Tmavý režim šetří baterii OLED displejů v nočním areálu a zachovává kontrast dle WCAG AA. |
| **5. Mikro-interakce a respektování `prefers-reduced-motion`** | Přidány funkční CSS mikro-animace: pružné vyskočení hvězdičky při uložení koncertu (`@keyframes wf-star-pop`), pulzování dešťového radaru (`@keyframes wf-radar-pulse`) a jemná odezva karet/tlačítek při `:hover` a `:active`. Pro uživatele s vestibularní citlivostí pravidlo `@media (prefers-reduced-motion: reduce)` animace automaticky vypne. |
| **6. AEO / GEO (Optimalizace pro AI vyhledávače a agenty)** | Každá stránka obsahuje strojově čitelná strukturovaná data **Schema.org JSON-LD** (`MusicFestival`, `ItemList`, `MusicGroup`, `Place`, `FAQPage`) přesně odpovídající viditelnému obsahu. |

---

## 3. Co se proti prototypu (Cvičení 3) změnilo a proč

1. **Odstranění dvojího menu a sjednocení navigace (přímá reakce na hodnocení Cvičení 3):**
   - *Podnět (komentář vyučujícího k Cvičení 3):* **„Nemělo by být dvojí menu – navíc každé trochu jiné. Dejte jen jedno.“**
   - *Původní stav:* V prototypu bylo současně viditelné horní tlačítko `[ ☰ Menu ]` (otevírající boční panel se 7 položkami) a zároveň spodní lišta (s 5 položkami v jiném pořadí a s odlišnými názvy).
   - *Provedená změna:* Boční výsuvné menu bylo ze zobrazení vyřazeno. Celý web nyní používá **jediné hlavní menu** se 100% shodnými 7 položkami (`🏠 Úvod`, `📅 Program`, `🎤 Účinkující`, `⛺ Scény`, `🚆 Info`, `★ Můj plán`, `🔍 Hledat`). Pomocí CSS `@media` queries se toto jediné menu zobrazuje **na PC nahoře v hlavičce** (`>= 769px`) a **na mobilu dole u palce** (`<= 768px`).
2. **Zvažované sloučení sekcí *Účinkující* a *Scény* (zamítnuto po týmové validaci):**
   - *Diskuze v týmu:* Padl návrh spojit stránky `artists.html` a `stages.html` do jedné.
   - *Rozhodnutí a zdůvodnění:* Návrh jsme zamítli. Spojení 60 karet interpretů s mapou areálu a parametry pódií by zhoršilo přehlednost a porušilo schválenou Informační architekturu z `project-specification.md` i požadavek zadání na samostatné sekce.
3. **Přesun bloku *Klíčové parametry ročníku* z úvodní stránky do *Praktických informací*:**
   - *Důvod:* Odlehčení úvodní stránky (`index.html`), aby se mobilní návštěvník v areálu okamžitě dostal k živé telemetrii a rychlému rozcestníku bez nutnosti skrolovat přes faktografický souhrn.
4. **Refaktoring na nulové inline styly a doplnění CSS mikro-animací:**
   - *Důvod:* Čisté oddělení struktury (HTML) a prezentace (CSS) pro bezproblémové fungování Dark Mode a vizuální zpětnou vazbu při ukládání koncertů.

---

## 4. Jaké testy a kontroly jsme provedli

Kvalita implementace byla ověřena víceúrovňovou sadou automatizovaných skriptů (`tests/` a `scripts/`) i manuálním testováním:

1. **Empirický test responzivního přepínání navigace (Headless Chrome CDP):**
   - Na viewportu **Desktop (`1200×800`)** ověřeno, že `<nav class="bottom-nav-dock">` má `position: static`, `flex-direction: row` a je vykresleno nahoře v hlavičce (`top: 74px`), zatímco duplicitní tlačítko menu má `display: none`.
   - Na viewportu **Mobile (`375×667`, iPhone SE)** v češtině i angličtině ověřeno, že tentýž `<nav>` má `position: fixed`, `bottom: 667px`, `flex-direction: column` a celková šířka dokumentu je přesně `scrollWidth === 375px` (nulové horizontální přetékání).
2. **Automatizované regresní sady (8 testovacích sad, 250+ kontrolních bodů – vše `PASS`):**
   - `tests/e2e_test_runner.js` – Integrita 60 interpretů, 60 programových slotů a relací 1:1.
   - `tests/challenger_1_m0_r2_suite.js` & `tests/challenger_1_m1_suite.js` – Stres-testy kolizního algoritmu (přechody přes půlnoc `23:30–00:45` vs. `00:05–01:25`, navazující koncerty bez kolize `14:00–15:00` a `15:00–16:00`).
   - `tests/dark_mode_test.js` – Ověření přepínání a persistence tmavého režimu v `localStorage`.
   - `tests/lang_switcher_test.js` – Kontrola symetrie slovníků CZ/EN a nulového výskytu dvojjazyčných lomítek (200/200 `PASS`).
   - `tests/sticky_nav_test.js` – Empirický test přichycení hlavičky (`top: 0`) při vertikálním skrolování o `600px` a `800px`.
   - `tests/artist_detail_and_breadcrumbs_test.js` – Drobečková navigace a návrat na přesnou pozici s animací `.spot-highlight`.
3. **Statické kontroly čistoty kódu (`scripts/package_submission.js`, `scripts/verify_integrity.js`):**
   - `0` statických inline stylů (`style="..."`) ve všech 18 HTML souborech (kořen + `web/`).
   - `0` poškozených znaků UTF-8 (`\uFFFD`).
   - `0` nefunkčních interních odkazů, skriptů či stylopisů.

---

## 5. Použití AI a ověření AI výstupů

1. **K čemu byla AI použita:**
   - Refaktoring inline stylů do sémantických tříd a CSS proměnných v `css/wireframe.css`.
   - Návrh CSS `@media` pravidel pro transformaci jednoho `<nav>` elementu mezi desktopovou horní lištou a mobilním spodním dokem.
   - Tvorba automatizovaných regresních skriptů nad Chrome DevTools Protocol (CDP) pro měření přesných souřadnic prvků a šířky viewportu.
2. **Jak byly výstupy ověřeny a co bylo upraveno / odmítnuto:**
   - **Odmítnutí dvojí navigace:** Původní návrh kombinující horní zásuvkové menu (Alza Drawer) a spodní dok (Albert Dock) se v praxi ukázal jako matoucí, což oprávněně vytkl i vyučující při hodnocení Cvičení 3. Tento koncept jsme nahradili jedním responzivním menu se shodnými položkami.
   - **Korekce šířky položek na malých mobilech (`375px`):** Při sjednocení všech 7 položek do spodní mobilní lišty měly původní CSS styly nastaveno `min-width: 44px` a `font-size: 0.72rem`, což u českých popisků (*Účinkující*, *Můj plán*) hrozilo těsným kontaktem textu. Ručně jsme upravili media queries pro `@media (max-width: 768px)` a `@media (max-width: 480px)` (`min-width: 0; font-size: 0.62rem; padding: 4px 1px;`) a empiricky ověřili v bezhlavém Chromu, že nedochází k žádnému přetékání (`scrollWidth === 375`).
   - **Omezení přehnaných animací:** Navržené CSS transformace na obalových kontejnerech jsme zamítli, protože by v prohlížečích narušily fungování `position: sticky` a `position: fixed`. Ponechali jsme pouze čisté mikro-animace na koncových prvcích (hvězdička, karty, tlačítka) doplněné o pojistku `prefers-reduced-motion`.
