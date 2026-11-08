# Průběžná zpráva k projektu: Cvičení 4 (`progress-03.md`)
**Projekt:** Festival of Darkness 2 (`WebDesignFestival`)  
**Ročník / Termín konání:** 2. ročník | 10.–12. července 2026 | Kutná Hora, Česká republika  
**Tým:** David Kostera, Ondřej Malík, František Josef Jankovský, Martin Karásek  
**Datum odevzdání:** Listopad 2026  

---

## 1. Co je implementováno (Implemented Scope & User Scenarios)

Pro 4. cvičení (*první funkční implementace*) je kompletně implementován čistě klientský (zero-server) web ve složce `web/`, který je plně funkční při otevření přes `file:///` i na GitHub Pages bez nutnosti backendu či instalace.

- **8 propojených sémantických stránek:**
  - `index.html` – Úvodní stránka s Hero sekcí (hlavní CTA tlačítko), živou telemetrií (*Mission Control*), dešťovým alertem a dlaždicovým rozcestníkem.
  - `program.html` – Interaktivní 2D rozvrhová matice (`13:00`–`04:00`, 3 dny, 2 scény, 60 vystoupení) s filtrací podle dne, scény, žánru a oblíbených položek (`★`).
  - `artists.html` & `artist-detail.html` – Katalog 60 interpretů s živým vyhledáváním, žánrovými filtry, detailem interpreta, simulátorem audio ukázky (waveform) a návratem na přesnou pozici (`.spot-highlight`).
  - `stages.html` – Porovnání venkovní *Solar Horizon Stage* a kryté *Lunar Forest Dome* + vektorová SVG mapa areálu.
  - `practical-info.html` – Klíčové parametry ročníku, jízdní řády kyvadlové dopravy (*Shuttle Bus*) z nádraží Kutná Hora, pěší trasa, kemp, cashless a FAQ.
  - `my-schedule.html` – Osobní plánovač (`localStorage`) s automatickou detekcí časových kolizí (včetně nočních přechodů přes půlnoc).
  - `search.html` – Celowebové vyhledávání napříč interprety, časovými sloty a praktickými informacemi.
- **Průchod klíčovými uživatelskými scénáři:**
  - **Scénář 1 (Náhlý déšť v areálu):** Přechod z úvodní stránky na filtrovaný program kryté scény *Lunar Forest Dome* na 1 kliknutí přes meteorologický banner.
  - **Scénář 2 (Osobní itinerář a kolize):** Ukládání koncertů pomocí `★` s okamžitým výpočtem a zvýrazněním časových překryvů v `my-schedule.html`.
  - **Scénář 3 (Doprava z nádraží):** Přehled intervalů shuttle busů a kroková mapa v `practical-info.html`.

---

## 2. Aktuální best practices a trendy v oblasti UX a designu a jejich implementace

Při implementaci jsme vycházeli z principů a trendů pro rok 2026 dle metodiky **[Moderní web design – principy, trendy a UX webu (WebOptim.cz, P. Gáborík, 2026)](https://www.weboptim.cz/blog/web-design-trendy)**, standardu **WCAG 2.2 AA** a metrik **Google Core Web Vitals**:

| Princip / Trend 2026 (dle WebOptim.cz) | Konkrétní implementace v projektu |
| :--- | :--- |
| **1. Mobile-First navigace a ergonomie palcové zóny (Thumb Zone / Fittsův zákon)** | Web zobrazuje vždy pouze **jedno aktivní menu podle typu zařízení** (přes CSS `@media` queries se shodnými 7 sekcemi). Z důvodu ergonomie **Thumb Zone** je na **mobilu (`<= 768px`)** položka **`🏠 Úvod` (`Home`) umístěna přesně uprostřed** spodního doku (4. ze 7 položek – nejsnáze dostupné místo pro palec), zatímco na **desktopu (`>= 769px`)** je v horním menu přirozeně **na začátku** seznamu. |
| **2. Hero sekce s jedním primárním CTA (Princip č. 1 a 2)** | První obrazovka na `index.html` jasně sděluje *co nabízíme*, *pro koho* a *co udělat dál* pomocí vizuálně dominantního primárního tlačítka `.btn-primary-cta` (`[ Otevřít program → ]`). |
| **3. Čitelnost a šířka řádku $\le 75$ znaků (Princip č. 3)** | Základní písmo má čitelných `16px` (`1rem`) a delší textové odstavce (biografie interpretů, popisy scén, FAQ) mají omezenou šířku řádku na `max-width: 72ch`. |
| **4. Bento Grid bez dlouhého sloupce na mobilu (Trend 2026)** | Dlaždicový rozcestník (`.control-grid`) na `index.html` se na mobilu skládá do kompaktní mřížky `minmax(160px, 1fr)`, aby nevznikal příliš dlouhý vertikální sloupec. |
| **5. Tmavý režim (Dark Mode) s kontrolou kontrastu (Trend 2026)** | Veškeré barvy jsou řízeny přes CSS Custom Properties (`--wf-*`) bez jediného inline stylu, což zaručuje plný kontrast ($\ge 4.5:1$) ve světlém i tmavém režimu (`html.dark-mode`). |
| **6. Funkční mikrointerakce šetřící Core Web Vitals** | Místo těžkých animací zpomalujících načítání používáme lehké CSS mikro-animace: pružné vyskočení hvězdičky při uložení koncertu (`@keyframes wf-star-pop`), pulzování radaru (`@keyframes wf-radar-pulse`) a hmatovou odezvu tlačítek (`:hover` / `:active`) s plnou podporou `@media (prefers-reduced-motion: reduce)`. |
| **7. Klikací kontakty na 1 dotyk & samostatné podstránky (Checklist WebOptim.cz)** | E-mail i telefon v patičce (`<address>`) jsou klikací (`mailto:` a `tel:`) jedním klepnutím na mobilu. Více-stránková architektura doplněná o strukturovaná data **Schema.org JSON-LD** zajišťuje čisté indexování pro vyhledávače i AI agenty (SEO / AEO / GEO). |

---

## 3. Co se proti prototypu (Cvičení 3) změnilo a proč

1. **Odstranění dvojího menu a sjednocení položek navigace (reakce na hodnocení Cvičení 3):**
   - *Připomínka vyučujícího z Cvičení 3:* **„Nemělo by být dvojí menu – navíc každé trochu jiné. Dejte jen jedno.“**
   - *Provedená změna:* Odstranili jsme souběžné zobrazování horního a spodního menu a sjednotili jejich obsah na identických 7 položek (`Úvod`, `Program`, `Účinkující`, `Scény`, `Info`, `Můj plán`, `Hledat`). Pomocí CSS `@media` queries je na **mobilu (`<= 768px`)** aktivní výhradně spodní palcový dok (s `🏠 Úvod` vycentrovaným uprostřed pro palec) a na **desktopu (`>= 769px`)** výhradně horní menu (kde je `🏠 Úvod` na prvním místě a spodní dok je skrytý).
2. **Doplnění celowebového vyhledávání (`search.html`) a propojení s katalogem:**
   - Doplněna samostatná stránka vyhledávání s rychlými štítky (*Quick Search Pills*) a našeptáváním témat při prázdném výsledku, propojená přímo s vyhledávacím polem v katalogu interpretů.
3. **Refaktoring na nulové inline styly a sémantické HTML5 (WCAG 2.0/2.2 AA):**
   - Odstraněno přes 200 původních `style="..."` atributů z prototypu a nahrazeno čistými CSS třídami v `css/wireframe.css`. Doplněny sémantické značky `<article>`, `<time>`, `<address>`, tabulkové hlavičky `scope` a klávesový `.skip-link`.
4. **Přesun bloku *Klíčové parametry ročníku* do *Praktických informací* a doplnění primárního CTA do Hero sekce:**
   - Úvodní stránka byla odlehčena pro rychlejší orientaci na mobilu a doplněna o jasnou primární výzvu k akci dle metodiky WebOptim.cz.

---

## 4. Jaké testy a kontroly jsme provedli

Implementace byla ověřena sadou automatizovaných testů (`tests/` a `scripts/`) i kontrolou v prohlížeči:

1. **Automatizované testovací sady v Node.js (9 testovacích sad – vše `PASS`):**
   - `tests/e2e_test_runner.js` – Kontrola 60 interpretů, 60 časových slotů a 1:1 vazeb.
   - `tests/challenger_1_m0_r2_suite.js` & `tests/challenger_1_m1_suite.js` – Testy detekce časových kolizí včetně nočních koncertů přes půlnoc (`23:30–00:45` vs. `00:05–01:25`).
   - `tests/bottom_switcher_test.js` & `tests/sticky_nav_test.js` – Ověření responzivní navigace, přichycené hlavičky (`position: sticky; top: 0`) a dotykových ploch.
   - `tests/dark_mode_test.js` & `tests/lang_switcher_test.js` – Kontrola tmavého režimu, bilingvního překladu CZ/EN (včetně českého skloňování počítadel 1 / 2–4 / 5+) a absence lomítkových textů.
   - `tests/artist_detail_and_breadcrumbs_test.js` & `tests/search_robustness_test.js` – Kontrola drobečkové navigace, návratu na pozici a vyhledávání.
2. **Kontroly čistoty kódu a přenositelnosti (`scripts/package_submission.js`, `scripts/verify_integrity.js`):**
   - `0` inline stylů (`style="..."`) ve všech HTML souborech.
   - `0` poškozených znaků UTF-8 (`\uFFFD`) a nulové horizontální přetékání na mobilním viewportu (`375px`).
   - Ověřeno bezchybné spuštění přímo ze souborového systému (`file:///`) bez lokálního serveru.

---

## 5. Použití AI a ověření AI výstupů

1. **K čemu byla AI použita:**
   - Refaktoring inline stylů z prototypu do sémantických tříd a CSS proměnných v `css/wireframe.css`.
   - Implementace bilingvního slovníku (`js/lang.js`), fulltextového vyhledávání (`js/search.js`) a sady regresních testů v Node.js.
2. **Jak byly výstupy ověřeny a co bylo upraveno / odmítnuto:**
   - **Oprava dvojí navigace:** Původní AI návrh ponechával současně zobrazenou horní i spodní navigaci s rozdílným počtem položek. Na základě zpětné vazby vyučujícího jsme navigaci sjednotili na 7 shodných položek a pomocí `@media` queries oddělili mobilní spodní dok (s `Home` uprostřed v Thumb Zone) od desktopového horního menu (s `Home` na začátku).
   - **Oprava skloňování a filtrace dnů v *Můj plán*:** AI původně generovala gramaticky chybný tvar `1 uložených vystoupení` a nekonzistentně porovnávala názvy dnů mezi katalogem a programem. Doplnili jsme třípádovou českou pluralizaci a kanonické mapování podle ID interpretů (`perf-01..20` = Pátek, `21..40` = Sobota, `41..60` = Neděle).
   - **Odstranění přebytečných dekorací:** Navržené CSS stíny a zaoblené rohy jsme odmítli, aby zůstal zachován čistý, vysokokontrastní wireframe styl projektu.
