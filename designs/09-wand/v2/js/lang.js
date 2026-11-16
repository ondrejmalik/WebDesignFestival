// v2/js/lang.js
(function () {
  "use strict";

  var STORAGE_KEY = "fod2_lang";

  var FESTIVAL_I18N = {
    en: {
      lang_switch: "CZ",
      nav_home: "Overview",
      nav_program: "Program",
      nav_stages: "Stages",
      nav_highlights: "Lineup",
      cta_schedule: "Full Schedule",
      cta_back_home: "Overview",
      hero_meta: "Kutná Hora, Czech Republic · 10–12 Jul 2026",
      hero_title: "Three nights of sound and projection.",
      hero_lead:
        "Electronic, alternative, and audiovisual music across two distinct stages in Kutná Hora. Sixty sets from afternoon light into deep morning hours.",
      hero_cta_primary: "Explore Full Program",
      hero_cta_secondary: "Inspect Stages",
      hud_status: "FESTIVAL SYSTEM // 2026",
      hud_edition: "EDITION 02",
      stat_days: "Days (10–12 Jul)",
      stat_stages: "Distinct Stages",
      stat_sets: "Live & DJ Sets",
      stat_cap: "Total Capacity",
      stages_title: "Two stages, tuned to different frequencies.",
      stages_desc:
        "Move between open-air amphitheater acoustics and a 360-degree covered audiovisual dome.",
      stage_solar_type: "Open-air main stage",
      stage_solar_cap: "Cap. 4,500",
      stage_solar_desc:
        "Central open-air amphitheater for major band performances, indie rock, and dance headliners from early afternoon until 02:00.",
      stage_solar_m1: "30 scheduled performances across 3 days",
      stage_solar_m2: "Indie rock, synthpop, post-punk & dance headliners",
      stage_solar_link: "View Solar Horizon schedule →",
      stage_lunar_type: "Covered audiovisual dome / marquee",
      stage_lunar_cap: "Cap. 1,800",
      stage_lunar_desc:
        "Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections until 04:00.",
      stage_lunar_m1: "30 immersive sets running late into the night",
      stage_lunar_m2: "Modular ambient, dub, industrial & melodic techno",
      stage_lunar_link: "View Lunar Forest schedule →",
      highlights_title: "Selected headliners & late-night sets.",
      highlights_desc:
        "A cross-section of artists from Czechia, Germany, UK, Sweden, France, and beyond.",
      day1_short: "Fri 10 Jul · 22:00",
      day1_late: "Fri 10 Jul · 00:05",
      day2_short: "Sat 11 Jul · 21:40",
      day2_late: "Sat 11 Jul · 00:45",
      day3_short: "Sun 12 Jul · 22:35",
      day3_late: "Sun 12 Jul · 00:10",
      cta_note: "Inspect exact set times across all three days.",
      cta_open_timetable: "Open 3-Day Timetable",
      footer_meta: "Kutná Hora, Czech Republic · 10–12 July 2026",
      prog_badge: "Kutná Hora · 10–12 Jul 2026",
      prog_title: "Festival Program",
      prog_lead:
        "Key evening and late-night performances across Solar Horizon Stage and Lunar Forest Dome.",
      day1_tab: "Fri 10 Jul",
      day2_tab: "Sat 11 Jul",
      day3_tab: "Sun 12 Jul",
      day1_kicker: "DAY 01 · FRIDAY",
      day1_heading: "10 July 2026",
      day2_kicker: "DAY 02 · SATURDAY",
      day2_heading: "11 July 2026",
      day3_kicker: "DAY 03 · SUNDAY",
      day3_heading: "12 July 2026",
      dock_artists: "Artists",
      dock_stages: "Stages",
      dock_info: "Info",
      dock_home: "Home",
      dock_program: "Program",
      dock_plan: "My Plan",
      dock_search: "Search"
    },
    cs: {
      lang_switch: "EN",
      nav_home: "Přehled",
      nav_program: "Program",
      nav_stages: "Scény",
      nav_highlights: "Lineup",
      cta_schedule: "Celý program",
      cta_back_home: "Přehled",
      hero_meta: "Kutná Hora, Česká republika · 10.–12. 7. 2026",
      hero_title: "Tři noci zvuku a světelných projekcí.",
      hero_lead:
        "Elektronická, alternativní a audiovizuální hudba na dvou odlišných scénách v Kutné Hoře. Šedesát vystoupení od odpoledního světla až do brzkého rána.",
      hero_cta_primary: "Prohlédnout program",
      hero_cta_secondary: "Prozkoumat scény",
      hud_status: "FESTIVALOVÝ SYSTÉM // 2026",
      hud_edition: "ROČNÍK 02",
      stat_days: "Dny (10.–12. 7.)",
      stat_stages: "Odlišné scény",
      stat_sets: "Živých a DJ setů",
      stat_cap: "Celková kapacita",
      stages_title: "Dvě scény naladěné na různé frekvence.",
      stages_desc:
        "Přecházejte mezi akustikou otevřeného amfiteátru a krytým audiovizuálním dómem s 360° projekcí.",
      stage_solar_type: "Otevřená hlavní scéna",
      stage_solar_cap: "Kap. 4 500",
      stage_solar_desc:
        "Centrální venkovní amfiteátr pro velké kapely, indie rock a taneční headlinery od brzkého odpoledne do 02:00.",
      stage_solar_m1: "30 naplánovaných vystoupení během 3 dnů",
      stage_solar_m2: "Indie rock, synthpop, post-punk a taneční headlineři",
      stage_solar_link: "Zobrazit program Solar Horizon →",
      stage_lunar_type: "Krytý audiovizuální dóm / šapitó",
      stage_lunar_cap: "Kap. 1 800",
      stage_lunar_desc:
        "Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360° světelné projekce až do 04:00.",
      stage_lunar_m1: "30 pohlcujících setů hluboko do noci",
      stage_lunar_m2: "Modulární ambient, dub, industrial a melodické techno",
      stage_lunar_link: "Zobrazit program Lunar Forest →",
      highlights_title: "Vybraní headlineři a noční sety.",
      highlights_desc:
        "Průřez interprety z Česka, Německa, Velké Británie, Švédska, Francie a dalších zemí.",
      day1_short: "Pá 10. 7. · 22:00",
      day1_late: "Pá 10. 7. · 00:05",
      day2_short: "So 11. 7. · 21:40",
      day2_late: "So 11. 7. · 00:45",
      day3_short: "Ne 12. 7. · 22:35",
      day3_late: "Ne 12. 7. · 00:10",
      cta_note: "Prohlédněte si přesné časy vystoupení ve všech třech dnech.",
      cta_open_timetable: "Otevřít 3denní harmonogram",
      footer_meta: "Kutná Hora, Česká republika · 10.–12. července 2026",
      prog_badge: "Kutná Hora · 10.–12. 7. 2026",
      prog_title: "Program festivalu",
      prog_lead:
        "Klíčová večerní a noční vystoupení na scénách Solar Horizon Stage a Lunar Forest Dome.",
      day1_tab: "Pá 10. 7.",
      day2_tab: "So 11. 7.",
      day3_tab: "Ne 12. 7.",
      day1_kicker: "DEN 01 · PÁTEK",
      day1_heading: "10. července 2026",
      day2_kicker: "DEN 02 · SOBOTA",
      day2_heading: "11. července 2026",
      day3_kicker: "DEN 03 · NEDĚLE",
      day3_heading: "12. července 2026",
      dock_artists: "Umělci",
      dock_stages: "Scény",
      dock_info: "Info",
      dock_home: "Domů",
      dock_program: "Program",
      dock_plan: "Můj plán",
      dock_search: "Hledat"
    }
  };

  function formatCzPlural(count, one, few, many) {
    var n = Math.abs(Number(count)) || 0;
    if (one && typeof one === "object") {
      few = one.few;
      many = one.many;
      one = one.one;
    }
    var word = many || "setů";
    if (n === 1) {
      word = one || "set";
    } else if (n >= 2 && n <= 4) {
      word = few || "sety";
    }
    return few && !many ? n + " " + word : word;
  }

  function getFestivalLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "cs" || saved === "en") {
        return saved;
      }
    } catch (e) {
      // Ignore storage access errors
    }
    var root = document.documentElement;
    var rawLang = "";
    if (root) {
      if (typeof root.getAttribute === "function") {
        rawLang = root.getAttribute("lang") || "";
      } else if (typeof root.lang === "string") {
        rawLang = root.lang;
      }
    }
    var docLang = rawLang.toLowerCase();
    return docLang === "cs" ? "cs" : "en";
  }

  function applyTranslations(lang) {
    var dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
    var root = document.documentElement;
    if (root) {
      if (typeof root.setAttribute === "function") {
        root.setAttribute("lang", lang);
      } else {
        root.lang = lang;
      }
    }

    var nodes = typeof document.querySelectorAll === "function" ? document.querySelectorAll("[data-i18n]") : [];
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = typeof el.getAttribute === "function" ? el.getAttribute("data-i18n") : "";
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    }

    var countNodes = typeof document.querySelectorAll === "function" ? document.querySelectorAll("[data-set-count]") : [];
    for (var j = 0; j < countNodes.length; j++) {
      var countEl = countNodes[j];
      var rawCount = typeof countEl.getAttribute === "function" ? countEl.getAttribute("data-set-count") : "0";
      var num = parseInt(rawCount, 10) || 0;
      if (lang === "cs") {
        countEl.textContent = formatCzPlural(num, {
          one: "vybraný set",
          few: "vybrané sety",
          many: "vybraných setů"
        });
      } else {
        countEl.textContent = num === 1 ? "1 highlighted set" : num + " highlighted sets";
      }
    }
  }

  function setFestivalLang(lang) {
    var normalized = lang === "cs" ? "cs" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {
      // Ignore storage access errors
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyTranslations(getFestivalLang());
    });
  } else {
    applyTranslations(getFestivalLang());
  }
})();
