// v2/js/lang.js
(function () {
  "use strict";

  var STORAGE_KEY = "festival_lang";

  var FESTIVAL_I18N = {
    en: {
      "meta.homeTitle": "Festival of Darkness 2 | Kutná Hora, 10-12 Jul 2026",
      "meta.programTitle": "Program | Festival of Darkness 2 (10-12 Jul 2026)",
      "nav.skip": "Skip to main content",
      "nav.home": "Overview",
      "nav.program": "Program",
      "nav.cta": "Full schedule",
      "hero.meta": "Kutná Hora, Czech Republic (10-12 July 2026)",
      "hero.title": "Three days of electronic, alternative, and audiovisual music across two stages.",
      "hero.lead": "Open-air afternoon bands and late-night 360-degree dome sets in Kutná Hora. Explore 60 scheduled performances without noise or clutter.",
      "hero.primaryCta": "Explore full program",
      "hero.secondaryCta": "Compare stages",
      "brief.tabOverview": "Festival Brief",
      "brief.tabVenue": "Kutná Hora",
      "brief.edition": "Edition 2026",
      "brief.datesLabel": "Dates",
      "brief.datesVal": "10 - 12 July 2026",
      "brief.datesNote": "Friday 14:00 through Sunday 03:00",
      "brief.scaleLabel": "Scale",
      "brief.scaleVal": "2 stages, 60 sets",
      "brief.scaleNote": "6,300 combined visitor capacity",
      "brief.status": "All stage times verified in CEST",
      "brief.openGrid": "Open timetable",
      "stats.days": "Festival days",
      "stats.stages": "Distinct stages",
      "stats.artists": "Live & DJ sets",
      "stats.capacity": "Total venue capacity",
      "stages.title": "Two acoustic environments, zero overlap confusion",
      "stages.sub": "Every set is anchored to either the open-air amphitheater or the covered audiovisual dome.",
      "stages.solarType": "Open-air main stage",
      "stages.solarCap": "Capacity: 4,500",
      "stages.solarDesc": "Central open-air amphitheater for major band performances, indie rock, synthpop, and dance headliners.",
      "stages.solarHours": "Daily 13:00 - 02:00",
      "stages.lunarType": "Covered audiovisual dome",
      "stages.lunarCap": "Capacity: 1,800",
      "stages.lunarDesc": "Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.",
      "stages.lunarHours": "Daily 14:00 - 04:00",
      "stages.viewLineup": "View stage schedule",
      "highlights.title": "Selected evening highlights by day",
      "highlights.sub": "Key performances pulled directly from the 2026 schedule.",
      "highlights.day1Label": "Friday, 10 July",
      "highlights.day2Label": "Saturday, 11 July",
      "highlights.day3Label": "Sunday, 12 July",
      "highlights.cta": "Inspect full 3-day program",
      "program.backOverview": "Overview",
      "program.meta": "Kutná Hora, 10-12 July 2026",
      "program.title": "Festival Program",
      "program.lead": "Curated evening and night sets across Solar Horizon Stage and Lunar Forest Dome. Filter by day or stage.",
      "filter.allDays": "All days",
      "filter.day1": "Fri 10 Jul",
      "filter.day2": "Sat 11 Jul",
      "filter.day3": "Sun 12 Jul",
      "filter.allStages": "Both stages",
      "days.day1": "Friday, 10 July 2026",
      "days.day1Sub": "Opening night (6 featured sets)",
      "days.day2": "Saturday, 11 July 2026",
      "days.day2Sub": "Main weekend program (6 featured sets)",
      "days.day3": "Sunday, 12 July 2026",
      "days.day3Sub": "Closing night (6 featured sets)",
      "table.time": "Time",
      "table.artist": "Performer",
      "table.genre": "Genre",
      "table.stage": "Stage",
      "table.origin": "Origin",
      "footer.location": "Kutná Hora, Czech Republic (10-12 July 2026)"
    },
    cs: {
      "meta.homeTitle": "Festival of Darkness 2 | Kutná Hora, 10.-12. 7. 2026",
      "meta.programTitle": "Program | Festival of Darkness 2 (10.-12. 7. 2026)",
      "nav.skip": "Přejít na hlavní obsah",
      "nav.home": "Přehled",
      "nav.program": "Program",
      "nav.cta": "Celý harmonogram",
      "hero.meta": "Kutná Hora, Česká republika (10.-12. července 2026)",
      "hero.title": "Tři dny elektronické, alternativní a audiovizuální hudby na dvou scénách.",
      "hero.lead": "Odpolední kapely pod širým nebem a noční sety v 360stupňové kopuli v Kutné Hoře. Přehledně a bez zbytečného šumu.",
      "hero.primaryCta": "Zobrazit program",
      "hero.secondaryCta": "Porovnat scény",
      "brief.tabOverview": "Základní přehled",
      "brief.tabVenue": "Kutná Hora",
      "brief.edition": "Ročník 2026",
      "brief.datesLabel": "Termín",
      "brief.datesVal": "10. - 12. července 2026",
      "brief.datesNote": "Od pátku 14:00 do neděle 03:00",
      "brief.scaleLabel": "Rozsah",
      "brief.scaleVal": "2 scény, 60 vystoupení",
      "brief.scaleNote": "Celková kapacita areálu 6 300 návštěvníků",
      "brief.status": "Všechny časy jsou uvedeny v SELČ",
      "brief.openGrid": "Otevřít rozpis",
      "stats.days": "Festivalové dny",
      "stats.stages": "Hudební scény",
      "stats.artists": "Živých a DJ setů",
      "stats.capacity": "Celková kapacita areálu",
      "stages.title": "Dva akustické světy, přehledný časový plán",
      "stages.sub": "Každé vystoupení patří buď do venkovního amfiteátru, nebo do kryté audiovizuální kopule.",
      "stages.solarType": "Venkovní hlavní scéna",
      "stages.solarCap": "Kapacita: 4 500",
      "stages.solarDesc": "Centrální venkovní amfiteátr pro hlavní kapely, indie rock, synthpop a taneční headlinery.",
      "stages.solarHours": "Denně 13:00 - 02:00",
      "stages.lunarType": "Krytá audiovizuální kopule",
      "stages.lunarCap": "Kapacita: 1 800",
      "stages.lunarDesc": "Krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360stupňové světelné projekce.",
      "stages.lunarHours": "Denně 14:00 - 04:00",
      "stages.viewLineup": "Zobrazit program scény",
      "highlights.title": "Vybrané večerní vrcholy podle dnů",
      "highlights.sub": "Klíčová vystoupení přímo z harmonogramu ročníku 2026.",
      "highlights.day1Label": "Pátek 10. července",
      "highlights.day2Label": "Sobota 11. července",
      "highlights.day3Label": "Neděle 12. července",
      "highlights.cta": "Prohlédnout celý třídenní program",
      "program.backOverview": "Přehled",
      "program.meta": "Kutná Hora, 10.-12. července 2026",
      "program.title": "Program festivalu",
      "program.lead": "Výběr večerních a nočních setů na scénách Solar Horizon Stage a Lunar Forest Dome. Filtrujte podle dne nebo scény.",
      "filter.allDays": "Všechny dny",
      "filter.day1": "Pá 10. 7.",
      "filter.day2": "So 11. 7.",
      "filter.day3": "Ne 12. 7.",
      "filter.allStages": "Obě scény",
      "days.day1": "Pátek 10. července 2026",
      "days.day1Sub": "Zahajovací noc (6 vybraných setů)",
      "days.day2": "Sobota 11. července 2026",
      "days.day2Sub": "Hlavní víkendový program (6 vybraných setů)",
      "days.day3": "Neděle 12. července 2026",
      "days.day3Sub": "Závěrečná noc (6 vybraných setů)",
      "table.time": "Čas",
      "table.artist": "Interpret",
      "table.genre": "Žánr",
      "table.stage": "Scéna",
      "table.origin": "Země",
      "footer.location": "Kutná Hora, Česká republika (10.-12. července 2026)"
    }
  };

  function formatCzPlural(count, one, few, many) {
    var n = Math.abs(Number(count)) || 0;
    if (n === 1) return n + " " + one;
    if (n >= 2 && n <= 4) return n + " " + few;
    return n + " " + many;
  }

  function getFestivalLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "cs" || saved === "en") return saved;
    } catch (e) {}
    return "en";
  }

  function applyTranslations(lang) {
    var dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute("data-i18n");
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        nodes[i].textContent = dict[key];
      }
    }

    var pills = document.querySelectorAll("[data-lang-opt]");
    for (var j = 0; j < pills.length; j++) {
      var opt = pills[j].getAttribute("data-lang-opt");
      pills[j].classList.toggle("is-current", opt === lang);
    }

    updateFilterCount();
  }

  function setFestivalLang(lang) {
    var normalized = lang === "cs" ? "cs" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {}
    applyTranslations(normalized);
    return normalized;
  }

  function toggleFestivalLang() {
    var next = getFestivalLang() === "en" ? "cs" : "en";
    return setFestivalLang(next);
  }

  var activeDay = "all";
  var activeStage = "all";

  function updateFilterCount() {
    var countEl = document.getElementById("visible-count");
    if (!countEl) return;
    var visibleRows = document.querySelectorAll(".schedule-row:not(.is-hidden)").length;
    var lang = getFestivalLang();
    if (lang === "cs") {
      countEl.textContent = formatCzPlural(visibleRows, "vystoupení", "vystoupení", "vystoupení");
    } else {
      countEl.textContent = visibleRows === 1 ? "1 set" : visibleRows + " sets";
    }
  }

  function applyScheduleFilters() {
    var rows = document.querySelectorAll(".schedule-row");
    for (var i = 0; i < rows.length; i++) {
      var rowDay = rows[i].getAttribute("data-day");
      var rowStage = rows[i].getAttribute("data-stage");
      var matchDay = activeDay === "all" || rowDay === activeDay;
      var matchStage = activeStage === "all" || rowStage === activeStage;
      rows[i].classList.toggle("is-hidden", !(matchDay && matchStage));
    }

    var sections = document.querySelectorAll(".day-section");
    for (var j = 0; j < sections.length; j++) {
      var secDay = sections[j].getAttribute("data-day");
      var visibleInSec = sections[j].querySelectorAll(".schedule-row:not(.is-hidden)").length;
      var showSec = (activeDay === "all" || secDay === activeDay) && visibleInSec > 0;
      sections[j].classList.toggle("is-hidden", !showSec);
    }

    updateFilterCount();
  }

  function bindEvents() {
    var langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      langBtn.addEventListener("click", function () {
        toggleFestivalLang();
      });
    }

    var dayBtns = document.querySelectorAll("[data-filter-day]");
    for (var i = 0; i < dayBtns.length; i++) {
      dayBtns[i].addEventListener("click", function () {
        activeDay = this.getAttribute("data-filter-day");
        for (var k = 0; k < dayBtns.length; k++) {
          dayBtns[k].classList.toggle("is-active", dayBtns[k] === this);
        }
        applyScheduleFilters();
      });
    }

    var stageBtns = document.querySelectorAll("[data-filter-stage]");
    for (var j = 0; j < stageBtns.length; j++) {
      stageBtns[j].addEventListener("click", function () {
        activeStage = this.getAttribute("data-filter-stage");
        for (var k = 0; k < stageBtns.length; k++) {
          stageBtns[k].classList.toggle("is-active", stageBtns[k] === this);
        }
        applyScheduleFilters();
      });
    }
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
    applyTranslations(getFestivalLang());
  });
})();
