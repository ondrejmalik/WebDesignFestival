# Průběžná zpráva k projektu: Cvičení 5 – Review-ready verze (`progress-04.md`)

**Projekt:** Festival of Darkness 2 (`WebDesignFestival`)  
**Ročník / Termín konání:** 2. ročník | 10.–12. července 2026 | Sedlec, Kutná Hora, Česká republika  
**Tým:** David Kostera, Ondřej Malík, František Josef Jankovský, Martin Karásek  
**Fáze:** Cvičení 5 – příprava review-ready verze (`web/`) pro cross-review  
**Datum odevzdání:** Listopad 2026

---

## 1. Aktuální stav projektu a přehled změn od posledního odevzdání (`progress-03.md`)

Od odevzdání Cvičení 4 (*první funkční implementace* ve wireframe podobě) prošel projekt zásadní vizuální i architektonickou proměnou. Z prototypu vznikla plnohodnotná, graficky vypilovaná a samostatně spustitelná klientská webová aplikace ve složce `web/` (bez nutnosti build kroku, Node.js či backendu – funguje lokálně přes `file:///` i na GitHub Pages).

### 1.1 Paralelní průzkum 11 designových směrů a výběr hlavního designu (Design 4)

Abychom se posunuli od wireframe prototypu k finální vizuální identitě, vytvořili jsme v repozitáři (`designs/01-checklist` až `designs/11-zzz`) **11 samostatných vizuálních návrhů** a sjednotili je nad společnou funkční vrstvou (`shared/js/festival-data.js`, `shared/js/festival-core.js`, `shared/css/festival-features.css`), takže všechny návrhy sdílely 100 % funkční paritu:

| # | Návrh | Charakteristika | Stav testů (`guard.js`) |
| :-: | :--- | :--- | :--- |
| 01 | `01-checklist` | Čistý strukturovaný styl s výraznými okraji a kontrastní typografií | `PASS` |
| 02 | `02-clutterbench` | Kompaktní technický dashboard s vysokou hustotou informací (opravena česká pluralizace) | `PASS` |
| 03 | `03-deepl` | Minimalistický ediční styl s důrazem na čitelnost a bilingvní přepínání | `PASS` |
| **04** | **`04-eventbrite` (vybraný)** | **Eventový a ticketingový vizuál s výraznými oranžovými CTA, přehlednou typografií a jasnou hierarchií data, místa i programu** | **`PASS` → povýšen na hlavní web** |
| 05 | `05-linear` | Tmavé minimalistické rozhraní s jemnými 1px linkami a fialovými akcenty | `PASS` |
| 06 | `06-neurosama` | Neonově kybernetický tmavý motiv s azurovými a purpurovými štítky | `PASS` |
| 07 | `07-ohnyfans` | Světlý čistý layout s pilulkovými filtry a jemnými stíny | `PASS` |
| 08 | `08-sg-nabytek` | Teplý skandinávský katalogový styl v neutrálních zemitých tónech | `PASS` |
| 09 | `09-wand` | Futuristický tmavý HUD layout s telemetrickými kartami (opravena česká pluralizace) | `PASS` |
| 10 | `10-wooting` | Hardwarově inspirovaný tmavý styl se žluto-zlatými akcenty a monospace štítky | `PASS` |
| 11 | `11-zzz` | Výrazný akční tmavý styl s vysokým kontrastem a výraznými odznaky | `PASS` |

Po vyhodnocení čitelnosti, kontrastu ve světlém i tmavém režimu, použitelnosti na mobilu i desktopu a vhodnosti pro hudební festival jsme **vybrali Design 4 (`04-eventbrite`)** jako hlavní produkční web, povýšili jej do kořene repozitáře (pro přímé nasazení na GitHub Pages) a zabalili do soběstačné review-ready složky `web/` pro cross-review.

### 1.2 Chronologický souhrn změn podle commitů od `progress-03.md`

1. **Opravy datové konzistence a filtrace (v1 → příprava na v2):**
   - Sloučení žánru *Techno* pod filtr *Electronic* tak, aby součet žánrových filtrů přesně odpovídal všem 60 vystoupením (`97516c2`, `ec079da`, `a44e3ce`, `e502d49`).
   - Oprava počítadla výsledků a odstranění duplicit uložených vystoupení v *Mém plánu* (`c19a2e7`), výchozí zobrazení všech položek ve vyhledávání (`19a676c`, `a7c2571`) a přesný překlad lokalit scén (`4c9acad`, `dce6339`, `3f3589e`).
2. **Rozšíření na 11 osmi-stránkových návrhů a sdílenou funkční vrstvu:**
   - Vytvoření rozcestníku a 11 plnohodnotných v2 návrhů (`54f2730`, `f96d6eb`, `bcb40ce`), přidání responzivního spodního doku (`837ed50`) a ukládání koncertů do *Mého plánu* napříč všemi 11 weby (`2682875`).
   - Sjednocení na sdílenou vrstvu `shared/` (`6802627`), oprava české pluralizace v `02-clutterbench` a `09-wand` (`48aece2`, `6b6237a`), hromadná oprava kontrastu, přetékání a přístupnosti ze souhrnného QA auditu (`201abd9`, `cbde960`).
3. **Rozšíření informační architektury a interaktivních funkcí:**
   - Přidání 9. stránky `tickets.html` s interaktivním výběrem vstupenek, kategoriemi a klientským košíkem (`52402c6`), sloučení a zpřehlednění navigace, doplnění živého odznaku počtu uložených setů v hlavičce (`d84e754`), zpřehlednění hlaviček filtrů (*Dny / Pódia / Žánry*) a drobečkové navigace *Program > Můj plán* (`37ea337`), vyvážení barevného zvýraznění aktivní položky v mobilním doku (`374f301`).
4. **Povýšení a detailní dopracování Designu 4 (`web/` a root):**
   - Povýšení Designu 4 na hlavní web s oranžovým akcentním UI, šedými světlými povrchy, vylepšeným vyhledáváním včetně zkratek interpretů a dynamickým dokem (`6b59faa`).
   - Vylepšení **Scénáře 1** (přímý filtr na krytou scénu *Lunar Forest Dome* dnes večer s kontextovým panelem) a **Scénáře 3** (interaktivní ověření příjezdu vlaku z nádraží *Kutná Hora hl.n.*, jízdní řád shuttle busu, pěší trasa a interaktivní SVG mapa s filtrem trasy bus/pěšky) (`88afa31`, `1b4f9ee`).
   - Doplnění sémantických elementů `<time datetime="...">` do harmonogramu i jízdního řádu dopravy a odstranění duplicitní hero hlavičky (`7b24e86`).
   - Příprava review-ready balíčku `web/`, SEO/AEO/GEO souborů (`robots.txt`, `llms.txt`, strukturovaná data JSON-LD na každé stránce) (`e78a1aa`).
   - Odstranění problikávání tmavého režimu (FOUC) při přechodu mezi stránkami pomocí synchronního inicializačního skriptu v `<head>` (`48d8ab0`).
   - Oprava blikání karet programu na mobilu, jemného kontrastu ve světlém motivu, responzivní hlavičky, minimapy a vyhledávání zkratek interpretů (`5ab5c5f`).
   - Doplnění plynulých, neblikajících *scroll-reveal* animací (respektujících `prefers-reduced-motion`) a odstupňované animace úvodního nadpisu (`e16f039`, `a4b2ef7`, `70d1997`, `a20fca7`, `e3a90db`).
   - Živá detekce a zobrazování časových kolizí přímo na stránce `program.html` (badge kolizí, souhrnný panel s proklikem na kolidující karty, varovný štítek na kartě a notifikační toast s odkazem na *Můj plán*) (`e1b1075`).
   - Optimalizace Core Web Vitals (**CLS**): doplnění `min-height: 100vh` pro `.fod-mount` zabraňující posunu patičky při klientském vykreslení obsahu (pokles CLS z `0.49–0.58` na `<= 0.051` na všech 9 stránkách).

### 1.3 Přehled implementovaných 9 stránek v `web/`

- `web/index.html` – Úvodní stránka s hero sekcí, hlavním CTA, přehledem data a místa, dvěma scénami, výběrem headlinerů a přehledem vstupenek.
- `web/program.html` – Interaktivní 3denní harmonogram (60 vystoupení, 2 scény) s filtry dne, scény, žánru, fulltextem, rychlým filtrem kryté scény *Lunar Dome* a živou detekcí časových kolizí.
- `web/artists.html` – Katalog 60 interpretů s vyhledáváním (včetně zkratek a bez diakritiky), filtrací podle dne, scény, žánru a oblíbených.
- `web/artist-detail.html` – Detail interpreta s rychlým přepínačem všech 60 účinkujících, časem vystoupení, biografií, simulací audio ukázky a návratem na přesnou pozici.
- `web/stages.html` – Porovnání venkovní *Solar Horizon Stage* a kryté *Lunar Forest Dome* včetně ukázek programu a kapacity.
- `web/practical-info.html` – Doprava z nádraží *Kutná Hora hl.n.*, jízdní řád shuttle busu s interaktivním ověřením příjezdu vlaku, kroková pěší trasa, interaktivní SVG mapa trasy, kemp, cashless, parametry ročníku a FAQ.
- `web/my-schedule.html` – Osobní plánovač (`localStorage` pod klíčem `festival_favorites`) s detekcí kolizí včetně nočních slotů po půlnoci (`hodina < 8` je `+24 h`), českým 3pádovým skloňováním, sdílením plánu přes URL (`?plan=...`) a exportem do kalendáře `.ics`.
- `web/search.html` – Celowebové vyhledávání napříč interprety, sloty, pódii a praktickými informacemi (včetně klávesové zkratky `/` a vyhledávání bez diakritiky).
- `web/tickets.html` – Katalog vstupenek, kempových pasů a doplňků s filtrací podle kategorií a klientským košíkem.

---

## 2. Vypořádání zpětné vazby vyučujícího z Cvičení 4

Všech pět připomínek z hodnocení předchozího odevzdání bylo systematicky vyřešeno a ověřeno automatickými testy:

| Připomínka vyučujícího (Cvičení 4) | Stav | Provedená oprava a ověření v `web/` |
| :--- | :---: | :--- |
| **1. „Still a prototype!“** (web byl stále wireframe prototyp) | **Opraveno** | Proveden průzkum 11 plných vizuálních návrhů, vybrán a dopracován **Design 4 (`04-eventbrite`)** do plnohodnotného vizuálu s fotografiemi, barevným systémem (světlý + tmavý režim bez FOUC), typografií, kartami, mikroanimacemi a 9 propojenými stránkami v `web/`. |
| **2. Tabulka best practices zmiňuje WCAG 2.2 AA a Core Web Vitals bez konkrétních odkazů a bez reálných měření** | **Opraveno** | Do sekce 3 doplněny přesné odkazy na metodiku WebOptim.cz, standard W3C WCAG 2.2 AA i dokumentaci Google Core Web Vitals (LCP, CLS, INP, FCP) a **zdokumentována reálná měření všech metrik** napříč všemi 9 stránkami v Playwright Chromium (včetně opravy CLS). |
| **3. Harmonogram nepoužívá sémantický element `<time>`; vyhledávací pole v programu a katalogu interpretů nemají `<label>` ani přístupné jméno** | **Opraveno** | Všechny časové údaje vystoupení i jízdního řádu dopravy používají sémantický `<time datetime="ISO-8601">` (`200×` v `program.html`, `120×` v `artists.html`, `120×` v `search.html`, `40×` ve `stages.html`, `12×` v `index.html`, `12×` v `practical-info.html`, `4×` v `artist-detail.html`). Všechna vyhledávací pole (`#artist-search-input` v programu i katalogu, `#info-search-input`, `#global-search-input`) i prvky formulářů mají explicitně navázaný `<label for="...">` (audit potvrdil `0` neoznačených vstupů na všech 9 stránkách). |
| **4. „Is a hamburger menu really a good idea on desktop?“** | **Opraveno** | Na desktopu (`> 768px`) se žádný hamburger nevyskytuje – zobrazuje se přehledná horizontální navigace (`<nav class="eb-nav">`) přímo v horní liště. Na mobilu (`<= 768px`) je horní navigace skryta a nahrazena 5položkovým spodním palcovým dokem (`<nav class="bottom-nav-dock">`) s vycentrovanou položkou *Domů*. |
| **5. Kliknutí kamkoliv do buňky vystoupení přepínalo uložení do oblíbených místo kliknutí pouze na tlačítko hvězdičky/uložení** | **Opraveno** | V novém `web/js/festival-pages.js` reaguje ukládání do *Mého plánu* **výhradně** na explicitní tlačítko `.fav-toggle-btn[data-perf-id]` (resp. `.artist-fav-btn` a `.remove-btn`). Kliknutí na kartu, čas nebo okolí uložení nemění; kliknutí na název interpreta nebo *Detail* otevírá profil. Ověřeno Playwright testem (`afterCardClick: 0`, `afterBtnClick: 1`). |

---

## 3. Best practices, trendy 2026 a reálně naměřené Core Web Vitals & WCAG 2.2 AA

### 3.1 Použité zdroje a standardy

- **UX a trendy webdesignu 2026:** [Moderní web design – principy, trendy a UX webu (WebOptim.cz, P. Gáborík)](https://www.weboptim.cz/blog/web-design-trendy)
- **Přístupnost (WCAG 2.2 Level AA):** [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) – zejména kritéria [1.4.3 Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum), [2.4.7 Focus Visible](https://www.w3.org/TR/WCAG22/#focus-visible), [2.5.8 Target Size (Minimum)](https://www.w3.org/TR/WCAG22/#target-size-minimum) a [4.1.2 Name, Role, Value](https://www.w3.org/TR/WCAG22/#name-role-value)
- **Výkon a uživatelská odezva (Google Core Web Vitals):** [Google web.dev – Web Vitals](https://web.dev/articles/vitals), včetně prahových hodnot pro [LCP (Largest Contentful Paint ≤ 2,5 s)](https://web.dev/articles/lcp), [CLS (Cumulative Layout Shift ≤ 0,1)](https://web.dev/articles/cls), [INP (Interaction to Next Paint ≤ 200 ms)](https://web.dev/articles/inp) a [FCP (First Contentful Paint ≤ 1,8 s)](https://web.dev/articles/fcp)

### 3.2 Implementace trendů a standardů v `web/`

| Princip / Standard | Zdroj | Konkrétní implementace v projektu |
| :--- | :--- | :--- |
| **Jednoznačná navigace bez hamburgeru na desktopu & Thumb Zone na mobilu** | [WebOptim.cz](https://www.weboptim.cz/blog/web-design-trendy), [WCAG 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum) | Na desktopu přímá horizontální lišta `<nav class="eb-nav">`, na mobilu (`<= 768px`) 5položkový spodní palcový dok s `min-height: 48px` a položkou *Home* uprostřed. |
| **Hero sekce s jasnou hodnotou a primárním CTA** | [WebOptim.cz](https://www.weboptim.cz/blog/web-design-trendy) | `index.html` ihned sděluje termín, lokalitu a rozsah akce (*3 dny · 60 interpretů · 2 pódia*) s kontrastním primárním CTA tlačítkem *Prozkoumat program* a sekundárním *Účinkující a pódia*. |
| **Tmavý a světlý režim bez problikávání (FOUC) a s plným kontrastem** | [WebOptim.cz](https://www.weboptim.cz/blog/web-design-trendy), [WCAG 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | Synchronní mini-skript v `<head>` aplikuje `data-theme` ještě před prvním vykreslením. Všechny barvy řídí CSS proměnné bez inline `style=""` (`0` inline stylů). |
| **Funkční mikrointerakce respektující uživatelské předvolby** | [WebOptim.cz](https://www.weboptim.cz/blog/web-design-trendy), [Google INP](https://web.dev/articles/inp) | Lehké CSS přechody, scroll-reveal animace a okamžitá odezva tlačítek *Přidat do plánu* + živý toast při kolizi; plně vypnuté při `@media (prefers-reduced-motion: reduce)`. |
| **Sémantické HTML5, formulářové popisky a SEO / AEO / GEO** | [WCAG 4.1.2](https://www.w3.org/TR/WCAG22/#name-role-value), [WebOptim.cz](https://www.weboptim.cz/blog/web-design-trendy) | Použity značky `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<address>`, `<time datetime="...">`, `<label for="...">`, JSON-LD (`MusicFestival`, `EventSeries`, `CollectionPage`, `FAQPage`, `SearchResultsPage`), `robots.txt`, `llms.txt` a klikací `mailto:` odkazy. |
| **Stabilita rozložení (prevence Layout Shiftu)** | [Google CLS](https://web.dev/articles/cls) | Rezervace minimální výšky kontejneru `.fod-mount { min-height: 100vh; }` zabránila posunu patičky při klientském vykreslení dynamických podstránek (pokles CLS z `0.49–0.58` na `0.0018–0.0508`). |

### 3.3 Reálně naměřené Core Web Vitals a WCAG 2.2 AA (Playwright Chromium + `@axe-core/playwright`)

Měření bylo provedeno v bezhlavém prohlížeči Chromium (`1280×800`, lokální statický HTTP server nad složkou `web/`) pomocí standardního `PerformanceObserver` API (`largest-contentful-paint`, `paint`, `layout-shift`, `event` pro INP při kliknutí na přepínač jazyka) a automatizovaného auditu `@axe-core/playwright` se sadou pravidel `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` ve světlém i tmavém režimu:

| Stránka (`web/`) | TTFB (ms) | FCP (ms) | LCP (ms) | CLS | INP (ms) | DOM uzly | `<time>` elementy | Neoznačené `<input>` | Axe WCAG 2.2 AA (Light / Dark) |
| :--- | --: | --: | --: | --: | --: | --: | --: | --: | :---: |
| `index.html` | 4,3 | 132 | 132 | **0,0000** | 40 | 323 | 12 | 0 | 0 / 0 |
| `program.html` | 1,1 | 44 | 112 | **0,0018** | 56 | 1 566 | 200 | 0 | 0 / 0 |
| `artists.html` | 0,7 | 44 | 104 | **0,0018** | 48 | 1 177 | 120 | 0 | 0 / 0 |
| `artist-detail.html?id=perf-01` | 1,0 | 44 | 80 | **0,0508** | 16 | 292 | 4 | 0 | 0 / 0 |
| `stages.html` | 0,8 | 44 | 112 | **0,0018** | 24 | 434 | 40 | 0 | 0 / 0 |
| `practical-info.html` | 0,7 | 44 | 92 | **0,0018** | 24 | 368 | 12 | 0 | 0 / 0 |
| `my-schedule.html` | 0,7 | 44 | 56 | **0,0018** | 16 | 199 | 0* | 0 | 0 / 0 |
| `search.html` | 1,0 | 44 | 104 | **0,0018** | 32 | 1 022 | 120 | 0 | 0 / 0 |
| `tickets.html` | 1,1 | 64 | 64 | **0,0018** | 24 | 676 | 0 | 0 | 0 / 0 |
| **Cíl Google „Good“ / WCAG** | **≤ 800** | **≤ 1 800** | **≤ 2 500** | **≤ 0,100** | **≤ 200** | **≤ 2 500** | **Ano** | **0** | **0 / 0** |

*\*Na `my-schedule.html` se `<time datetime="...">` vykresluje dynamicky pro každé uložené vystoupení; výše uvedený řádek měří výchozí prázdný stav bez uložených koncertů.*

*Poznámka k metodice měření:* Lokální HTTP server má zanedbatelnou síťovou latenci (TTFB 0,7–4,3 ms), takže naměřené časy LCP (56–132 ms) odrážejí čistý čas vykreslení a klientské hydratace prohlížečem bez latence CDN. Na mobilním viewportu (`375×812`) bylo na všech 9 stránkách ověřeno **0 px horizontálního přetékání**, skrytí desktopové navigace a správné zobrazení spodního doku.

---

## 4. Aktuální stav testování a využití GitHub Actions

Protože jsme paralelně vyvíjeli **11 různých vizuálních návrhů** a následně dopracovávali finální **Design 4**, navrhli jsme třívrstvou, **design-agnostickou** testovací architekturu spouštěnou jednotným skriptem `tests/guard.js`. Stejná sada testů tak ověřovala všechny designy bez vazby na konkrétní CSS třídy jednoho motivu.

### 4.1 Tři vrstvy automatizovaných testů

1. **Smoke test (`tests/ci_smoke_test.js`):**
   - Ověřuje existenci `index.html`, integritu kódování UTF-8 (`0` poškozených znaků `\uFFFD`), přítomnost `<!DOCTYPE html>`, `<title>` a `<meta name="viewport">` na každé stránce.
   - Kontroluje všechny lokální odkazy a assety (`<link>`, `<script>`, `<img>`, `<a>`), syntaktickou validitu všech JS souborů přes `node --check` a spustí vestavěný lokální HTTP server pro ověření odpovědi `200 OK` a neprázdného těla u všech HTML stránek.
   - *Aktuální výsledek pro `web/`:* **7/7 kontrol `PASS`, 0 chyb, 0 varování** (9 HTML, 5 JS, 19 textových souborů).
2. **Jazykový test (`tests/lang_test.js`):**
   - Kontroluje, že každá stránka načítá `js/lang.js`, spustí jej v izolovaném Node.js VM sandboxu a ověří existenci a 1:1 shodu klíčů v `window.FESTIVAL_I18N.en` a `window.FESTIVAL_I18N.cs` (120 klíčů, přítomnost české diakritiky).
   - Projde veškeré HTML a JS soubory a ověří, že každý použitý atribut `data-i18n*` existuje v obou jazycích (93 klíčů, 0 neznámých).
   - Otestuje veřejné API (`getFestivalLang`, `setFestivalLang`, `toggleFestivalLang`), persistenci v `localStorage` a českou třípádovou pluralizaci `formatCzPlural(1 / 3 / 5)`.
   - *Aktuální výsledek pro `web/` i všechny návrhy v `designs/`:* **22/22 kontrol `PASS`** (100 % průchodnost po opravě `formatCzPlural` v návrzích 02 a 09).
3. **Playwright E2E testovací sada (`tests/e2e/run-e2e.js` – 6 specializovaných speců):**
   - `runtime-and-links.js` – kontrola nulových runtime chyb (`pageerror`, lokální `console.error`), selhání síťových požadavků (`HTTP >= 400`), funkčnosti lokálních odkazů a správného načtení obrázků (`naturalWidth > 0`) i dat (`FESTIVAL_DATA`, `FESTIVAL_CORE`).
   - `i18n-and-theme.js` – klikací přepínání jazyka `EN ↔ CZ` na `index.html` a `program.html`, kontrola absence artefaktů (`undefined`, `NaN`, `[object Object]`, `\uFFFD`), persistence jazyka i světlého/tmavého motivu přes `page.reload()` a přechod na další stránku.
   - `favorites-and-collisions.js` – přidání koncertu v programu, synchronizace `localStorage` (`festival_favorites`) a navigačního odznaku, přetrvání v `my-schedule.html` po reloadu, matematický i UI test kolizí včetně nočních koncertů přes půlnoc (`23:30–00:30` vs. `00:15–01:15`), kontrola českého skloňování pro 1 / 3 / 5 koncertů a vymazání plánu.
   - `filters-search-flows.js` – ověření 60 interpretů v programu, kombinace filtrů (*Den 1* = 20 setů, *Den 1 + Lunar* = 10 setů), URL parametrů (`?stage=lunar&day=day1`), vyhledávání v programu i na `search.html` včetně vyhledávání bez diakritiky (`kutna`), přepínače 60 interpretů v `artist-detail.html`, zobrazení obou scén i klávesové zkratky `/`.
   - `responsiveness-layout.js` – kontrola nulového horizontálního přetékání na mobilu (`375×812` v EN i CZ pro všechny stránky) a sekundární kontrola breakpointů `320px`, `768px`, `1024px` a `1440px`, kontrola čitelnosti písma, překrývání prvků a velikosti dotykových ploch (WCAG 2.5.8).
   - `a11y-and-perf-audit.js` – automatizovaný audit `@axe-core/playwright` (`wcag2a/aa/21aa/22aa`) ve výchozím i přepnutém motivu, kontrola sémantických orientačních bodů (`<main>`, `<h1>`, hierarchie nadpisů, `<html lang>`), absence inline stylů, klávesové navigace (`Tab` + viditelný focus) a výkonnostních metrik (FCP, LCP, TTFB, počet DOM uzlů).
   - *Aktuální výsledek `node tests/e2e/run-e2e.js . --verbose` nad `web/`:* **75/75 kontrol `PASS`, 0 chyb** (`runtime-and-links`: 8/8, `i18n-and-theme`: 20/20, `favorites-and-collisions`: 10/10, `filters-search-flows`: 15/15, `responsiveness-layout`: 18/18, `a11y-and-perf-audit`: 4/4).

### 4.2 Automatizace přes GitHub Actions (a lokální hooks / Jenkins)

V repozitáři běží **3 navazující GitHub Actions workflows** ve složce `.github/workflows/`:

1. **`.github/workflows/ci.yml` (*Design Guard*):**
   - Spouští se automaticky při každém **Pull Requestu**, při **pushi do `main`** i ručně (`workflow_dispatch`).
   - Používá `concurrency` s `cancel-in-progress: true`, instaluje závislosti (`npm ci`) a prohlížeč `Playwright Chromium`.
   - **Chytré spouštění testů podle rozsahu změny:**
     - Při změně ve sdílené vrstvě `shared/` nebo ručním spuštění otestuje kořenový web (`run-e2e.js --root --fast`) i **všechny návrhy najednou** (`node tests/guard.js --all` = Smoke + Language + Playwright E2E).
     - Při běžném PR/commitu detekuje změněné soubory přes `git diff` a spouští `guard.js --changed` cíleně na dotčené designy (a při změně kořene, testů nebo workflow i kořenový E2E běh).
2. **`.github/workflows/data-validation.yml` (*Validate Data*):**
   - Spouští se při každé změně ve složce `data/**`.
   - Ověřuje validitu `data/artists.json` (přes `JSON.parse` v Node.js) a syntaktickou správnost `data/festival.xml` (přes Python `xml.etree.ElementTree.parse`).
3. **`.github/workflows/deploy.yml` (*Deploy to GitHub Pages*):**
   - Využívá událost `workflow_run` navázanou na úspěšné dokončení workflow **Design Guard** na větvi `main` (`conclusion == 'success'`). Díky tomu se na GitHub Pages **nikdy nenasadí neotestovaná nebo rozbitá verze** (deployment gate).
   - Připraví čistý staging adresář `_site/` (pouze veřejné soubory: `*.html`, `robots.txt`, `llms.txt`, `css/`, `js/`, `img/`, `designs/`, `data/`, `shared/`) a nasadí jej přes `actions/upload-pages-artifact@v3` a `actions/deploy-pages@v4`.

Doplňkově je v repozitáři nastaven sdílený lokální git `pre-push` hook (`.githooks`) a zrcadlová pipeline v `Jenkinsfile`, která spouští `node tests/guard.js --all` na lokálním build serveru.

---

## 5. Známé nedostatky a omezení (pro cross-review)

Web ve složce `web/` nemá žádné známé blokující chyby a umožňuje plynule projít všechny tři klíčové uživatelské scénáře na mobilu i desktopu. Pro transparentnost při cross-review uvádíme známá vědomá omezení a drobné prostory pro další zlepšení:

1. **Simulovaný košík vstupenek (`tickets.html`) a audio ukázky (`artist-detail.html`):** Protože jde o čistě klientský školní projekt bez backendu, nákupní košík vstupenek simuluje výběr a souhrn objednávky lokálně bez platební brány; audio přehrávač u detailu interpreta používá klientskou ukázku bez licencovaných MP3 souborů.
2. **Placeholdery sociálních sítí a obrázků interpretů:** Tlačítka sociálních sítí v patičce jsou označena jako `(placeholder)` a při kliknutí zobrazují přívětivý informační toast místo nefunkčních externích odkazů. Karty interpretů využívají lehké tématické SVG placeholdery rozlišené podle scény (Solar/Lunar), aby zůstala velikost balíčku malá.
3. **Velikost textových odkazů uvnitř seznamů na mobilu (`375px`):** Zatímco hlavní navigační prvky, spodní dok (`48px`), filtrační čipy a primární tlačítka splňují mobilní doporučení `44×44px`, Playwright audit hlásí varování u drobnějších inline textových odkazů (např. názvy interpretů v hustých výsledcích vyhledávání na `search.html`, drobečková navigace a odkazy v patičce). Plánujeme jejich vertikální padding dále zpřehlednit na základě zpětné vazby z cross-review.
4. **Rychlé přepnutí motivu během CSS přechodu:** V `a11y-and-perf-audit.js` bez prodlevy po kliknutí na přepínač tmavého režimu zachytil axe-core přechodový stav barvy odkazu během animace `transition`, ačkoliv v ustáleném stavu po 200 ms má všech 9 stránek `0` porušení WCAG 2.2 AA ve světlém i tmavém režimu.

---

## 6. Použití AI a ověření AI výstupů

1. **K čemu byla AI použita:**
   - Paralelní vygenerování a iterativní ladění **11 vizuálních variant** v `designs/` na základě předem definovaných briefů a screenshotů inspirací.
   - Extrakce a sjednocení společné aplikační logiky (data 60 interpretů, kolize přes půlnoc, vyhledávání bez diakritiky, export `.ics`, sdílení plánu, nákupní košík) do sdílené vrstvy `shared/` a následné zabalení Designu 4 do `web/`.
   - Návrh a implementace 6 design-agnostických Playwright E2E speců (`tests/e2e/specs/`) a GitHub Actions workflows (`.github/workflows/`).
2. **Jak byly výstupy ověřeny:**
   - Každý návrh i finální balíček `web/` prošel automatickou třívrstvou sadou `ci_smoke_test.js` + `lang_test.js` + 6 Playwright E2E specy v reálném prohlížeči Chromium (včetně `@axe-core/playwright` pro WCAG 2.2 AA).
   - Změřili jsme reálné Core Web Vitals (`LCP`, `FCP`, `CLS`, `INP`, `TTFB`) na všech 9 stránkách v `web/`.
   - Ručně jsme prošli všechny 3 uživatelské scénáře na desktopu i v mobilním zobrazení (`375px`) v obou jazycích (CZ/EN) a v obou barevných režimech (světlý/tmavý).
3. **Co bylo upraveno nebo odmítnuto (zjištěné chyby a limity AI):**
   - **Vysoký Cumulative Layout Shift (`CLS 0,49–0,58`) na podstránkách:** AI zpočátku generovala prázdné kontejnery `.fod-mount` bez rezervované výšky, takže při klientské hydrataci `defer` skriptů patička výrazně poskakovala. Měřením Core Web Vitals jsme chybu odhalili a opravili přidáním `min-height: 100vh` (pokles CLS na `0,0018–0,0508`).
   - **Problikávání tmavého režimu (FOUC) a scroll animací:** Původní AI řešení nastavovalo tmavý režim až po načtení deferred JS, což způsobovalo bílé bliknutí při navigaci, a scroll animace na mobilu problikávaly. Přidali jsme synchronní skript do `<head>` každé stránky a přepsali spouštění animací tak, aby prvky ve výchozím viewportu neblikaly.
   - **Přehlcená stránka praktických informací a chyby v pluralizaci:** Odmítli jsme původní přehlcenou AI variantu `practical-info.html` ve prospěch přehledného edičního rozvržení zaměřeného na Scénář 3 (nádraží, shuttle bus, pěší trasa, mapa). Test `lang_test.js` rovněž zachytil chybnou signaturu `formatCzPlural` vygenerovanou AI v návrzích `02-clutterbench` a `09-wand`, kterou jsme ručně opravili.
   - **Chybějící `<time>` v tabulce dopravy:** I po doplnění `<time>` do programu chyběly sémantické značky času v tabulce jízdního řádu shuttle busu v `practical-info.html`; po kontrole jsme je doplnili společně s explicitním `<label>` pro vstup času příjezdu.
