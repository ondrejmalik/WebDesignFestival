/* v2/js/lang.js */
(function () {
  "use strict";

  var STORAGE_KEY = "fod2_lang";

  var FESTIVAL_I18N = {
    en: {
      lang_code: "CZ",
      nav_home: "Home",
      nav_program: "Program",
      hero_dates: "10-12 Jul 2026",
      hero_location: "Kutná Hora, Czech Republic",
      topbar_timetable: "Timetable",
      hero_kicker: "EDITION 2026 / OPEN-AIR & DOME",
      hero_title: "Festival of Darkness 2",
      hero_desc: "Three-day festival of electronic, alternative, and audiovisual music on two distinct stages in Kutná Hora.",
      hero_cta_program: "Explore Full Program",
      hero_cta_stages: "Inspect Stages",
      stat_days_label: "DURATION",
      stat_days_sub: "Days (10-12 Jul)",
      stat_acts_label: "LINEUP ROSTER",
      stat_acts_sub: "Live acts & DJs",
      stat_stages_label: "STAGES",
      stat_stages_sub: "6,300 total capacity",
      stat_city_label: "COORDINATES",
      stat_city_sub: "Kutná Hora",
      stages_heading: "Stage Architecture",
      stages_sub: "Two acoustic environments running parallel programs from afternoon through dawn.",
      stage_solar_type: "Open-air main stage",
      stage_solar_name: "Solar Horizon Stage",
      stage_solar_desc: "Central open-air amphitheater for major band performances, indie rock, and dance headliners.",
      stage_solar_hours: "13:00 - 02:00",
      stage_lunar_type: "Covered audiovisual dome",
      stage_lunar_name: "Lunar Forest Dome",
      stage_lunar_desc: "Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.",
      stage_lunar_hours: "14:00 - 04:00",
      cap_label: "CAP",
      view_schedule: "View schedule",
      featured_heading: "Headliner Matrix",
      featured_sub: "Selected peak-time sets across all three festival nights.",
      featured_all_btn: "Full 3-Day Schedule",
      col_day: "Day",
      col_time: "Time",
      col_artist: "Artist",
      col_genre: "Genre",
      col_stage: "Stage",
      col_origin: "Origin",
      day1_short: "Fri 10 Jul",
      day2_short: "Sat 11 Jul",
      day3_short: "Sun 12 Jul",
      prog_kicker: "TIMETABLE & STAGE DISPATCH",
      prog_title: "Festival Program 2026",
      prog_desc: "Highlighted sets across Solar Horizon Stage and Lunar Forest Dome for 10-12 July 2026.",
      day1_tab: "Day 1 / 10 Jul",
      day2_tab: "Day 2 / 11 Jul",
      day3_tab: "Day 3 / 12 Jul",
      day1_heading: "Day 1: Friday, 10 July 2026",
      day1_sub: "Opening afternoon post-rock into late-night hardware and acid techno.",
      day2_heading: "Day 2: Saturday, 11 July 2026",
      day2_sub: "Shoegaze, indie dance, and high-velocity dome electronics.",
      day3_heading: "Day 3: Sunday, 12 July 2026",
      day3_sub: "Closing night headliners, melodic techno, and orchestral finale.",
      sets_six: "6 featured sets",
      footer_info: "10-12 Jul 2026 / Kutná Hora, Czech Republic"
    },
    cs: {
      lang_code: "EN",
      nav_home: "Domů",
      nav_program: "Program",
      hero_dates: "10.–12. 7. 2026",
      hero_location: "Kutná Hora, Česká republika",
      topbar_timetable: "Harmonogram",
      hero_kicker: "ROČNÍK 2026 / OPEN-AIR & DOME",
      hero_title: "Festival of Darkness 2",
      hero_desc: "Třídenní festival elektronické, alternativní a audiovizuální hudby na dvou odlišných scénách v Kutné Hoře.",
      hero_cta_program: "Zobrazit celý program",
      hero_cta_stages: "Prozkoumat scény",
      stat_days_label: "TRVÁNÍ",
      stat_days_sub: "Dny (10.–12. července)",
      stat_acts_label: "SOUPISKA",
      stat_acts_sub: "Živé kapely a DJs",
      stat_stages_label: "SCÉNY",
      stat_stages_sub: "Celková kapacita 6 300",
      stat_city_label: "LOKALITA",
      stat_city_sub: "Kutná Hora",
      stages_heading: "Architektura scén",
      stages_sub: "Dvě akustická prostředí s paralelním programem od odpoledne až do svítání.",
      stage_solar_type: "Venkovní hlavní scéna",
      stage_solar_name: "Solar Horizon Stage",
      stage_solar_desc: "Centrální venkovní amfiteátr pro hlavní kapely, indie rock a taneční headlinery.",
      stage_solar_hours: "13:00 - 02:00",
      stage_lunar_type: "Krytý audiovizuální dóm",
      stage_lunar_name: "Lunar Forest Dome",
      stage_lunar_desc: "Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360° světelné projekce.",
      stage_lunar_hours: "14:00 - 04:00",
      cap_label: "KAP",
      view_schedule: "Zobrazit rozpis",
      featured_heading: "Přehled headlinerů",
      featured_sub: "Vybrané hlavní sety napříč všemi třemi festivalovými nocemi.",
      featured_all_btn: "Kompletní třídenní program",
      col_day: "Den",
      col_time: "Čas",
      col_artist: "Interpret",
      col_genre: "Žánr",
      col_stage: "Scéna",
      col_origin: "Země",
      day1_short: "Pá 10. 7.",
      day2_short: "So 11. 7.",
      day3_short: "Ne 12. 7.",
      prog_kicker: "HARMONOGRAM A ROZPIS SCÉN",
      prog_title: "Program festivalu 2026",
      prog_desc: "Vybrané sety na scénách Solar Horizon Stage a Lunar Forest Dome pro 10.–12. července 2026.",
      day1_tab: "Den 1 / 10. 7.",
      day2_tab: "Den 2 / 11. 7.",
      day3_tab: "Den 3 / 12. 7.",
      day1_heading: "Den 1: Pátek 10. července 2026",
      day1_sub: "Odpolední post-rock až po noční hardwarové a acid techno.",
      day2_heading: "Den 2: Sobota 11. července 2026",
      day2_sub: "Shoegaze, indie dance a vysokorychlostní elektronika v dómu.",
      day3_heading: "Den 3: Neděle 12. července 2026",
      day3_sub: "Závěreční headlineři, melodické techno a orchestrální finále.",
      sets_six: "6 vybraných setů",
      footer_info: "10.–12. 7. 2026 / Kutná Hora, Česká republika"
    }
  };

  function getFestivalLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "cs" || saved === "en") {
        return saved;
      }
    } catch (e) {
      // Ignore storage restrictions
    }
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
  }

  function setFestivalLang(lang) {
    var normalized = lang === "cs" ? "cs" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {
      // Ignore storage restrictions
    }
    applyTranslations(normalized);
    return normalized;
  }

  function toggleFestivalLang() {
    var next = getFestivalLang() === "en" ? "cs" : "en";
    return setFestivalLang(next);
  }

  function formatCzPlural(count, one, few, many) {
    var n = Math.abs(Number(count)) || 0;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return few;
    }
    return many;
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyTranslations(getFestivalLang());
    });
  } else {
    applyTranslations(getFestivalLang());
  }
})();
