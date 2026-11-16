/* v2/js/lang.js */
(function () {
  var STORAGE_KEY = "fod2_lang";

  var FESTIVAL_I18N = {
    en: {
      brand: "Festival of Darkness 2",
      navHome: "Overview",
      navProgram: "Program & Sets",
      heroTitle: "Festival of Darkness 2",
      heroSubtitle:
        "Three-day festival of electronic, alternative, and audiovisual music in Kutná Hora, Czech Republic. July 10–12, 2026 across two distinct stages.",
      ctaSchedule: "Explore full schedule",
      ctaStages: "Compare stages",
      statSets: "Total sets",
      statCapacity: "Combined capacity",
      statDates: "Kutná Hora, 2026",
      chartTitle: "Program density by stage",
      chartSub: "30 sets per stage · 3 days",
      solarName: "Solar Horizon Stage",
      solarShort: "Open-air amphitheater for indie rock, synthpop, and dance headliners.",
      lunarName: "Lunar Forest Dome",
      lunarShort: "Covered audiovisual marquee for techno, ambient, and 360-degree light projections.",
      legendSolar: "Open-Air Main",
      legendLunar: "Audiovisual Dome",
      legendPeak: "Late-Night Peak",
      stagesHeading: "Stage specifications",
      stagesLead:
        "Two acoustic environments operating in parallel from afternoon openings through 04:00 closings.",
      colStage: "Stage",
      colType: "Format",
      colCap: "Capacity",
      colHours: "Operating hours",
      colFocus: "Primary genres",
      solarType: "Open-air main stage",
      solarGenres: "Indie Rock, Synthpop, Nu-Disco, Electropop",
      lunarType: "Covered audiovisual dome",
      lunarGenres: "Modular Ambient, Dub, Acid & Industrial Techno",
      highlightsHeading: "Selected headliners & late sets",
      viewAllLink: "Full 3-day timetable →",
      day1Short: "Fri 10 Jul",
      day2Short: "Sat 11 Jul",
      day3Short: "Sun 12 Jul",
      footerLocation: "Kutná Hora, Czech Republic · July 10–12, 2026",
      programTitle: "Festival Program",
      programSubtitle:
        "Curated prime-time and late-night performances across Solar Horizon Stage and Lunar Forest Dome, July 10–12, 2026.",
      jumpDay1: "Day 1 · Fri 10 Jul",
      jumpDay2: "Day 2 · Sat 11 Jul",
      jumpDay3: "Day 3 · Sun 12 Jul",
      day1Heading: "Day 1 — Friday, July 10, 2026",
      day2Heading: "Day 2 — Saturday, July 11, 2026",
      day3Heading: "Day 3 — Sunday, July 12, 2026",
      colTime: "Time",
      colArtist: "Performer",
      colGenre: "Genre",
      colOrigin: "Origin",
      dock_artists: "Artists",
      dock_stages: "Stages",
      dock_info: "Info",
      dock_home: "Home",
      dock_program: "Program",
      dock_plan: "My Plan",
      dock_search: "Search",
      prog_plan_label: "My Schedule:",
      prog_open_plan: "Open My Schedule",
      col_plan: "Plan",
      prog_add: "+ Add",
      prog_added: "✓ In Plan"
    },
    cs: {
      brand: "Festival of Darkness 2",
      navHome: "Přehled",
      navProgram: "Program a sety",
      heroTitle: "Festival of Darkness 2",
      heroSubtitle:
        "Třídenní festival elektronické, alternativní a audiovizuální hudby v Kutné Hoře. 10.–12. července 2026 na dvou odlišných pódiích.",
      ctaSchedule: "Zobrazit celý program",
      ctaStages: "Porovnat pódia",
      statSets: "Celkem setů",
      statCapacity: "Celková kapacita",
      statDates: "Kutná Hora, 2026",
      chartTitle: "Rozložení programu podle pódií",
      chartSub: "30 setů na pódium · 3 dny",
      solarName: "Solar Horizon Stage",
      solarShort: "Venkovní amfiteátr pro indie rock, synthpop a taneční headlinery.",
      lunarName: "Lunar Forest Dome",
      lunarShort: "Krytý audiovizuální dóm pro techno, ambient a 360stupňové světelné projekce.",
      legendSolar: "Venkovní hlavní scéna",
      legendLunar: "Audiovizuální dóm",
      legendPeak: "Noční špička",
      stagesHeading: "Parametry pódií",
      stagesLead:
        "Dvě akusticky oddělená prostředí v paralelním provozu od odpoledního otevření až do 04:00 ráno.",
      colStage: "Pódium",
      colType: "Typ scény",
      colCap: "Kapacita",
      colHours: "Provozní doba",
      colFocus: "Hlavní žánry",
      solarType: "Venkovní hlavní pódium",
      solarGenres: "Indie rock, synthpop, nu-disco, electropop",
      lunarType: "Krytý audiovizuální dóm",
      lunarGenres: "Modulární ambient, dub, acid a industriální techno",
      highlightsHeading: "Vybraní headlineři a noční sety",
      viewAllLink: "Kompletní třídenní rozpis →",
      day1Short: "Pá 10. 7.",
      day2Short: "So 11. 7.",
      day3Short: "Ne 12. 7.",
      footerLocation: "Kutná Hora, Česká republika · 10.–12. července 2026",
      programTitle: "Program festivalu",
      programSubtitle:
        "Výběr hlavních večerních a nočních vystoupení na pódiích Solar Horizon Stage a Lunar Forest Dome, 10.–12. července 2026.",
      jumpDay1: "Den 1 · Pá 10. 7.",
      jumpDay2: "Den 2 · So 11. 7.",
      jumpDay3: "Den 3 · Ne 12. 7.",
      day1Heading: "Den 1 — Pátek 10. července 2026",
      day2Heading: "Den 2 — Sobota 11. července 2026",
      day3Heading: "Den 3 — Neděle 12. července 2026",
      colTime: "Čas",
      colArtist: "Interpret",
      colGenre: "Žánr",
      colOrigin: "Země",
      dock_artists: "Umělci",
      dock_stages: "Scény",
      dock_info: "Info",
      dock_home: "Domů",
      dock_program: "Program",
      dock_plan: "Můj plán",
      dock_search: "Hledat",
      prog_plan_label: "Můj plán:",
      prog_open_plan: "Otevřít Můj plán",
      col_plan: "Plán",
      prog_add: "+ Přidat",
      prog_added: "✓ V plánu"
    }
  };

  function formatCzPlural(n, one, few, many) {
  const abs = Math.abs(Number(n)) || 0;
  if (Array.isArray(one)) {
    const word = abs === 1 ? one[0] : (abs >= 2 && abs <= 4 ? one[1] : one[2]);
    return abs + " " + word;
  }
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

  function formatSetCount(count, lang) {
    if (lang === "cs") {
      return formatCzPlural(count, ["set", "sety", "setů"]);
    }
    var n = Math.abs(Number(count)) || 0;
    return n + " " + (n === 1 ? "set" : "sets");
  }

  function getFestivalLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "cs") {
        return saved;
      }
    } catch (e) {
      // Ignore storage access restrictions
    }
    var docEl = document.documentElement;
    var docLang =
      docEl && typeof docEl.getAttribute === "function"
        ? docEl.getAttribute("lang")
        : docEl
          ? docEl.lang
          : null;
    return docLang === "cs" ? "cs" : "en";
  }

  function applyTranslations(lang) {
    var dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
    var docEl = document.documentElement;
    if (docEl) {
      if (typeof docEl.setAttribute === "function") {
        docEl.setAttribute("lang", lang);
      } else {
        docEl.lang = lang;
      }
    }

    var nodes = typeof document.querySelectorAll === "function" ? document.querySelectorAll("[data-i18n]") : [];
    for (var i = 0; i < nodes.length; i++) {
      var key = typeof nodes[i].getAttribute === "function" ? nodes[i].getAttribute("data-i18n") : null;
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        nodes[i].textContent = dict[key];
      }
    }

    var dayCounters = typeof document.querySelectorAll === "function" ? document.querySelectorAll("[data-day-count]") : [];
    for (var j = 0; j < dayCounters.length; j++) {
      var count = Number(typeof dayCounters[j].getAttribute === "function" ? dayCounters[j].getAttribute("data-day-count") : 0) || 0;
      dayCounters[j].textContent = formatSetCount(count, lang);
    }

    var footerSummary = typeof document.getElementById === "function" ? document.getElementById("plural-summary") : null;
    if (footerSummary) {
      var isProgramPage = dayCounters.length > 0;
      footerSummary.textContent = formatSetCount(isProgramPage ? 18 : 60, lang);
    }

    var toggleBtn = typeof document.getElementById === "function" ? document.getElementById("lang-toggle") : null;
    if (toggleBtn) {
      toggleBtn.textContent = lang === "en" ? "CZ" : "EN";
      if (typeof toggleBtn.setAttribute === "function") {
        toggleBtn.setAttribute(
          "aria-label",
          lang === "en" ? "Přepnout do češtiny" : "Switch to English"
        );
      }
    }
  }

  function setFestivalLang(lang) {
    var normalized = lang === "cs" ? "cs" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {
      // Ignore storage access restrictions
    }
    applyTranslations(normalized);
    return normalized;
  }

  function toggleFestivalLang() {
    var current = getFestivalLang();
    return setFestivalLang(current === "en" ? "cs" : "en");
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  function init() {
    applyTranslations(getFestivalLang());
    var toggleBtn = typeof document.getElementById === "function" ? document.getElementById("lang-toggle") : null;
    if (toggleBtn && typeof toggleBtn.addEventListener === "function") {
      toggleBtn.addEventListener("click", function () {
        toggleFestivalLang();
      });
    }
  }

  if (document.readyState === "loading" && typeof document.addEventListener === "function") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
