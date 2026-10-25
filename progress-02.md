# Průběžná zpráva k projektu: Cvičení 3 (progress-02.md)
**Projekt:** Festival of Darkness 2 (WebDesignFestival)  
**Ročník / Termín konání:** 2. ročník | 10.–12. července 2026 | Kutná Hora, Česká republika  
**Tým:** RagnaroR & Kzakyz (Studentský tým)  
**Datum odevzdání:** Říjen 2026  

---

## 1. Seznam navržených funkcí (List of Designed Features)

Na základě Projektové specifikace (`project-specification.md`) a datové základny (`data.xml`) jsme pro Cvičení 3 vytvořili plně interaktivní, funkční wireframe prototyp fúzující nejlepší ergonomické a operativní prvky z předchozích fází (konkrétně syntézu mobilního aplikačního rámce App-Shell a operačního panelu Mission Control).

Web implementuje následující klíčové interaktivní funkce přesahující rámec statické prezentace:

1. **Ergonomická navigace ve stylu moderních mobilních aplikací (Thumb-Zone Dock + Alza Drawer):**
   - **Spodní ovládací dok (Albert App Metaphor):** 5 fixních dotykových prvků řazených podle ergonomie palce jednoručního ovládání: `[ 🎤 Účinkující ]` – `[ ⛺ Scény ]` – `[ 🏠 ÚVOD ]` (centrální domovské tlačítko) – `[ 📅 Program ]` – `[ ★ Můj plán ]` s živým čítačem uložených položek.
   - **Postranní výsuvné menu (Alza Drawer Metaphor):** Otevírané z horní aplikační lišty vpravo (`[ ☰ Menu ]`), obsahující kompletní strom webu včetně podsekce Praktických informací (doprava z nádraží, kyvadlový shuttle bus, kemp) a přepínače jazyka (CZ / EN).
2. **Katalog 60 interpretů s dynamickým vyhledáváním a filtrováním v reálném čase:**
   - Okamžité vyhledávání podle názvu interpreta, žánru i země původu bez nutnosti odesílat formulář nebo znovunačítat stránku.
   - Filtrování podle dnů festivalu (Pátek, Sobota, Neděle, Všechny dny) a hudebních stylů (Post-Rock, Ambient, Techno, Indie Pop, atd.).
   - Interaktivní detail interpreta (rozbalení biografie, časového slotu vystoupení, pódia a přímého záložkování do programu).
3. **Školní rozvrhová matice harmonogramu (Program Timetable):**
   - Přehledné dvourozměrné zobrazení časových slotů (13:00 až 04:00) a 2 scén (*Solar Horizon Stage* a *Lunar Forest Dome*) pro všechny 3 dny.
   - Nulové horizontální přetékání na mobilních zařízeních – rozvrh se responzivně adaptuje na šířku displeje bez vzniku vodorovného posuvníku.
   - Kontextové rozbalování detailů kapel přímo v buňce harmonogramu.
4. **Osobní plánovač s automatickou detekcí časových kolizí (My Schedule & Collision Engine):**
   - Ukládání libovolného vystoupení do `localStorage` (klíč `festival_favorites`) na jedno kliknutí (`☆` / `★`).
   - Okamžité párové vyhodnocení časového překryvu vystoupení mezi venkovní *Solar Horizon Stage* a krytou *Lunar Forest Dome*.
   - Vizuální varování (červené orámování `#b71c1c` a varovný odznak) při kolizi a možnost okamžitého vyřešení odebráním jednoho ze setů. Zelený odznak indikuje bezproblémový průchod festivalem.
5. **Meteorologický triage panel a okamžitý přesun do bezpečí před deštěm (Rain Shelter 1-Click Action):**
   - Telemetrická lišta v záhlaví hlavní stránky zobrazující lokální festivalový čas, radarový stav oblačnosti a stav otevřenosti/krytí scén.
   - Jednoklikový meteorologický banner (`[ Přesunout se pod střechu (Lunar Forest Dome) → ]`), který návštěvníka okamžitě navede na program kryté geodetické kopule chráněné před deštěm.
6. **Bilingvní lokalizace (Jazykový přepínač EN / CS):**
   - Kompletní překlad všech ovládacích prvků, časových údajů, popisků scén a 60 biografií bez lomítkových hybridů v uživatelském rozhraní.

---

## 2. Vazba funkcí na uživatelské potřeby (Mapping Features to User Needs)

Navržené funkce přímo vycházejí z uživatelských person a reálných situací definovaných v projektové specifikaci:

| Uživatelská persona / Scénář | Konkrétní potřeba uživatele | Implementované řešení na webu |
| :--- | :--- | :--- |
| **Persona: Návštěvník v areálu (mobilní uživatel)** | Potřebuje web ovládat jednou rukou při chůzi mezi pódii v davu lidí, bezpečně a bez přehmatávání. | **Ergonomický dok Albert:** Domovské tlačítko `HOME`, `Program` a `Můj plán` jsou umístěny přímo v zóně dosahu palce (Thumb Zone). Velikost dotykových ploch splňuje standard min. 44×44 px. |
| **Scénář 1: Náhlý déšť v areálu** | Začne pršet. Návštěvník potřebuje během několika sekund zjistit, kde je sucho a co tam právě hraje, aniž by bloudil v menu. | **Mission Control Rain Alert:** Výrazný banner na úvodní stránce a telemetrie umožňují na 1 kliknutí přejít na filtrovaný harmonogram kryté scény *Lunar Forest Dome*. |
| **Scénář 2: Plánování víkendu a eliminace překryvů** | Uživatel si chce z 60 interpretů vybrat své oblíbené kapely, ale bojí se, že se mu budou překrývat na různých pódiích. | **Osobní plánovač s kolizním enginem:** Každý uložený koncert se uloží do `localStorage`. Algoritmus v `my-schedule.html` automaticky detekuje překryv intervalů a přesně pojmenuje konflikt. |
| **Scénář 3: Příjezd vlakem do Kutné Hory** | Zahraniční i mimoměstský návštěvník vystoupí na nádraží a potřebuje vědět, jak se dostat do areálu. | **Praktické info & Doprava:** Dedikovaná stránka s přesným jízdním řádem festivalového shuttle busu (včetně intervalů) a schematickou mapou pěší trasy. Snadno dostupná z horního Alza menu. |
| **Zahraniční návštěvník** | Nerozumí česky a potřebuje plnohodnotný obsah v angličtině. | **Bilingvní engine (`js/lang.js`):** Přepnutí do EN zachovává veškeré uložené oblíbené položky i stav filtrů. |

---

## 3. Co bylo ověřováno a jak (Validation Record & Methodology)

Ověřování probíhalo na několika úrovních s využitím automatizovaných testovacích skriptů i manuálního expertního testování:

### A. Automatizované testy (Node.js testovací sady v `tests/`)
1. **Validace datové integrity (`e2e_test_runner.js`):**
   - Ověřeno všech 60 unikátních interpretů (`perf-01` až `perf-60`) a 60 programových slotů (`sch-01` až `sch-60`).
   - Přesná vazba 1:1 mezi daty v XML/JS a vykreslovanými prvky.
   - Kontrola vyváženosti scén: přesně 30 vystoupení na Solar Horizon Stage a 30 v Lunar Forest Dome.
2. **Algoritmické ověření časových kolizí (`challenger_1_m1_suite.js`):**
   - Testování hraničních hodnot: vystoupení přes půlnoc (např. 23:30–00:45 vs. 00:05–01:25), navazující koncerty bez kolize (např. 14:00–14:45 a 14:45–15:30), koncerty na stejné scéně. Všech 37 testovacích scénářů proběhlo s výsledkem **PASS**.
3. **Bilingvní kontrola (`lang_switcher_test.js`):**
   - Statický scan všech stránek a komponent na eliminaci nevhodných dvojjazyčných lomítek. Všech 200 kontrolních bodů prošlo bez jediné chyby (**200/200 PASS**).

### B. Uživatelská ergonomie a Fittsův zákon (Thumb-Zone Reachability)
- Testováno rozložení prvků na mobilních viewportech (iPhone SE 375px, Pixel 7 412px, desktop 1200px).
- Ověřeno, že všechny interaktivní prvky spodního doku i horní lišty dosahují minimální dotykové plochy 44×44 px dle WCAG 2.0 AA.
- Tělo dokumentu má nastaveno `padding-bottom: 78px`, což zaručuje, že fixní spodní lišta nikdy nezakrývá obsah, tlačítka ani patičku.

### C. Technická omezení zadání (Zero-Server Architecture)
- Ověřeno fungování webu jak přes lokální HTTP server (`http-server -c-1`), tak při přímém otevření ze souborového systému přes protokol `file:///` bez nutnosti Node.js, backendu či databáze.

---

## 4. Použití AI a ověření AI výstupů (AI Usage & Verification)

V souladu s pravidly semestrálního projektu byla generativní AI použita jako konstrukční a syntetický partner, přičemž veškerá odpovědnost a kontrola zůstala na týmu:

1. **K čemu byla AI použita:**
   - **Průzkum a generování variant layoutů:** AI vygenerovala 10 architektonicky odlišných wireframe konceptů (např. App-Shell, Chronological Feed, Bento-Grid, Split-Stage, Dense Terminal, Mission Control).
   - **Tvorba bilingvních dat:** Vygenerování 60 konzistentních anotací a biografií v češtině a angličtině pro fiktivní interprety.
   - **Příprava matematického základu kolizního algoritmu:** Návrh funkce pro normalizaci festivalového času (přepočet nočních hodin po půlnoci na spojitou minutovou osu).
2. **Jak byly výstupy ověřeny a co bylo upraveno / odmítnuto:**
   - **Syntéza a odmítnutí čistých prototypů:** Z 10 původních konceptů jsme po týmové diskuzi většinu zamítli jako nepraktické pro festivalový kontext (např. terminálové rozhraní nebo horizontální snap-deck). Schválili jsme fúzi Layoutu 1 (pohodlný spodní dok pro palec) a Layoutu 10 (telemetrický panel Mission Control a rychlý odskok do zastřešeného stanu při dešti).
   - **Kritické přerovnání navigace:** Původní AI návrh měl v dolním doku položku *Info* a domovskou stránku na kraji. V souladu s analýzou týmu jsme *Info* z doku zcela odstranili (přesunuto do horního výsuvného menu Alza Drawer) a tlačítko `HOME` umístili přesně doprostřed podle vzoru aplikace *Můj Albert*, kde je nejpřirozeněji dostupné oběma palci.
   - **Odstranění AI artefaktů z kódu:** Všechny interní komentáře typu `<!-- Scenario 1: Immediate Rain Shelter -->` byly důsledně vyčištěny, aby výsledný kód představoval čisté a profesionální inženýrské dílo.
3. **Zjištěné limity AI:**
   - AI měla tendenci vkládat těžké CSS dekorace (stíny, gradienty), které odporovaly minimalistickému duchu wireframu (Exercise 3). Tyto styly byly ručně nahrazeny přísnými obrysy (`border: 1px solid #222`, `#777` a dělicími čarami `<hr>`).
