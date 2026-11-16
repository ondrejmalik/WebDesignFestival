(function () {
  "use strict";

  var STORAGE_KEY = "fod2_lang";

  var FESTIVAL_I18N = {
    en: {
      "nav.home": "Overview",
      "nav.program": "Program",
      "hero.dates": "10-12 Jul 2026",
      "hero.location": "Kutná Hora, Czech Republic",
      "hero.title": "Three days of electronic, alternative, and audiovisual music",
      "hero.subtitle": "Sixty live performances and nocturnal DJ sets across two distinct architectural spaces in Kutná Hora.",
      "hero.ctaPrimary": "Explore full program",
      "hero.ctaSecondary": "View stages",
      "panel.header": "Kutná Hora 2026 // Signal Overview",
      "panel.status": "2 Stages Active",
      "stats.daysLabel": "Duration",
      "stats.daysValue": "3 Days",
      "stats.daysDetail": "Fri 14:00 - Mon 03:00",
      "stats.actsLabel": "Lineup",
      "stats.actsDetail": "Live bands & DJ sets",
      "stats.capacityLabel": "Total Capacity",
      "stats.capacityDetail": "Open-air & 360° dome",
      "stages.heading": "Two distinct environments",
      "stages.subheading": "Engineered for daylight live instrumentation and late-night audiovisual immersion.",
      "stages.capUnit": "cap",
      "stages.viewSchedule": "Stage schedule",
      "stages.solar.type": "Open-air main stage",
      "stages.solar.desc": "Central open-air amphitheater for major band performances, indie rock, and dance headliners.",
      "stages.lunar.type": "Covered audiovisual dome",
      "stages.lunar.desc": "Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.",
      "highlights.heading": "Selected highlights",
      "highlights.subheading": "Key performances across Friday, Saturday, and Sunday.",
      "highlights.allLink": "Full timetable",
      "program.title": "Festival Program",
      "program.subtitle": "Curated daily running order across Solar Horizon Stage and Lunar Forest Dome.",
      "filters.allDays": "All days",
      "filters.allStages": "All stages",
      "days.fri": "Friday 10 Jul",
      "days.sat": "Saturday 11 Jul",
      "days.sun": "Sunday 12 Jul",
      "days.friShort": "Fri 10",
      "days.satShort": "Sat 11",
      "days.sunShort": "Sun 12",
      "days.friFull": "Friday, 10 July 2026",
      "days.satFull": "Saturday, 11 July 2026",
      "days.sunFull": "Sunday, 12 July 2026",
      "table.dayTime": "Day / Time",
      "table.time": "Time",
      "table.artist": "Artist",
      "table.genre": "Genre",
      "table.stage": "Stage",
      "footer.location": "Kutná Hora, Czech Republic · 10-12 Jul 2026",
      "dock_artists": "Artists",
      "dock_stages": "Stages",
      "dock_info": "Info",
      "dock_home": "Home",
      "dock_program": "Program",
      "dock_plan": "My Plan",
      "dock_search": "Search",
      "prog_plan_label": "My Schedule:",
      "prog_open_plan": "Open My Schedule",
      "col_plan": "Plan",
      "prog_add": "+ Add",
      "prog_added": "✓ In Plan"
    },
    cs: {
      "nav.home": "Přehled",
      "nav.program": "Program",
      "hero.dates": "10.–12. července 2026",
      "hero.location": "Kutná Hora, Česká republika",
      "hero.title": "Tři dny elektronické, alternativní a audiovizuální hudby",
      "hero.subtitle": "Šedesát živých vystoupení a nočních DJ setů na dvou odlišných scénách v Kutné Hoře.",
      "hero.ctaPrimary": "Prozkoumat celý program",
      "hero.ctaSecondary": "Zobrazit scény",
      "panel.header": "Kutná Hora 2026 // Přehled signálu",
      "panel.status": "2 aktivní scény",
      "stats.daysLabel": "Trvání",
      "stats.daysValue": "3 dny",
      "stats.daysDetail": "Pá 14:00 – Po 03:00",
      "stats.actsLabel": "Lineup",
      "stats.actsDetail": "Živé kapely a DJ sety",
      "stats.capacityLabel": "Celková kapacita",
      "stats.capacityDetail": "Open-air a 360° kopule",
      "stages.heading": "Dvě odlišná prostředí",
      "stages.subheading": "Navrženo pro denní živé nástroje i noční audiovizuální ponoření.",
      "stages.capUnit": "míst",
      "stages.viewSchedule": "Program scény",
      "stages.solar.type": "Venkovní hlavní scéna",
      "stages.solar.desc": "Centrální open-air amfiteátr pro hlavní kapely, indie rock a taneční headlinery.",
      "stages.lunar.type": "Krytá audiovizuální kopule",
      "stages.lunar.desc": "Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360° světelné projekce.",
      "highlights.heading": "Vybrané vrcholy",
      "highlights.subheading": "Klíčová vystoupení během pátku, soboty a neděle.",
      "highlights.allLink": "Kompletní harmonogram",
      "program.title": "Program festivalu",
      "program.subtitle": "Denní harmonogram vystoupení na scénách Solar Horizon Stage a Lunar Forest Dome.",
      "filters.allDays": "Všechny dny",
      "filters.allStages": "Všechny scény",
      "days.fri": "Pátek 10. 7.",
      "days.sat": "Sobota 11. 7.",
      "days.sun": "Neděle 12. 7.",
      "days.friShort": "Pá 10.",
      "days.satShort": "So 11.",
      "days.sunShort": "Ne 12.",
      "days.friFull": "Pátek, 10. července 2026",
      "days.satFull": "Sobota, 11. července 2026",
      "days.sunFull": "Neděle, 12. července 2026",
      "table.dayTime": "Den / Čas",
      "table.time": "Čas",
      "table.artist": "Interpret",
      "table.genre": "Žánr",
      "table.stage": "Scéna",
      "footer.location": "Kutná Hora, Česká republika · 10.–12. července 2026",
      "dock_artists": "Umělci",
      "dock_stages": "Scény",
      "dock_info": "Info",
      "dock_home": "Domů",
      "dock_program": "Program",
      "dock_plan": "Můj plán",
      "dock_search": "Hledat",
      "prog_plan_label": "Můj plán:",
      "prog_open_plan": "Otevřít Můj plán",
      "col_plan": "Plán",
      "prog_add": "+ Přidat",
      "prog_added": "✓ V plánu"
    }
  };

  function formatCzPlural(count, one, few, many) {
    var abs = Math.abs(Number(count)) || 0;
    if (abs === 1) {
      return count + " " + one;
    }
    if (abs >= 2 && abs <= 4) {
      return count + " " + few;
    }
    return count + " " + many;
  }

  function formatSetCount(count, lang) {
    if (lang === "cs") {
      return formatCzPlural(count, "set", "sety", "setů");
    }
    return count + (count === 1 ? " set" : " sets");
  }

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

    var pills = document.querySelectorAll("[data-lang-option]");
    for (var j = 0; j < pills.length; j++) {
      var opt = pills[j].getAttribute("data-lang-option");
      pills[j].classList.toggle("is-active", opt === lang);
    }

    var dayBadges = document.querySelectorAll("[data-day-count]");
    for (var k = 0; k < dayBadges.length; k++) {
      var n = Number(dayBadges[k].getAttribute("data-day-count")) || 0;
      dayBadges[k].textContent = formatSetCount(n, lang);
    }

    updateScheduleFilter(lang);
  }

  function setFestivalLang(lang) {
    var next = lang === "cs" ? "cs" : "en";
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      // Ignore storage restrictions
    }
    applyTranslations(next);
    return next;
  }

  function toggleFestivalLang() {
    var current = getFestivalLang();
    return setFestivalLang(current === "en" ? "cs" : "en");
  }

  var activeDay = "all";
  var activeStage = "all";

  function updateScheduleFilter(lang) {
    var activeLang = lang || getFestivalLang();
    var dayBlocks = document.querySelectorAll(".day-block[data-day]");
    if (!dayBlocks.length) {
      return;
    }

    var totalVisible = 0;
    for (var i = 0; i < dayBlocks.length; i++) {
      var block = dayBlocks[i];
      var dayId = block.getAttribute("data-day");
      var dayMatch = activeDay === "all" || activeDay === dayId;
      var rows = block.querySelectorAll(".schedule-row[data-stage]");
      var dayVisible = 0;

      for (var j = 0; j < rows.length; j++) {
        var rowStage = rows[j].getAttribute("data-stage");
        var stageMatch = activeStage === "all" || activeStage === rowStage;
        var showRow = dayMatch && stageMatch;
        rows[j].classList.toggle("is-hidden", !showRow);
        if (showRow) {
          dayVisible++;
        }
      }

      block.classList.toggle("is-hidden", dayVisible === 0);
      var badge = block.querySelector("[data-day-count]");
      if (badge) {
        badge.setAttribute("data-day-count", String(dayVisible));
        badge.textContent = formatSetCount(dayVisible, activeLang);
      }
      totalVisible += dayVisible;
    }

    var totalEl = document.getElementById("visible-sets-count");
    if (totalEl) {
      totalEl.textContent = formatSetCount(totalVisible, activeLang);
    }
  }

  function initControls() {
    var toggleBtn = document.getElementById("lang-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        toggleFestivalLang();
      });
    }

    var dayButtons = document.querySelectorAll("[data-filter-day]");
    for (var i = 0; i < dayButtons.length; i++) {
      dayButtons[i].addEventListener("click", function (e) {
        activeDay = e.currentTarget.getAttribute("data-filter-day");
        for (var j = 0; j < dayButtons.length; j++) {
          dayButtons[j].classList.toggle("active", dayButtons[j] === e.currentTarget);
        }
        updateScheduleFilter();
      });
    }

    var stageButtons = document.querySelectorAll("[data-filter-stage]");
    for (var k = 0; k < stageButtons.length; k++) {
      stageButtons[k].addEventListener("click", function (e) {
        activeStage = e.currentTarget.getAttribute("data-filter-stage");
        for (var m = 0; m < stageButtons.length; m++) {
          stageButtons[m].classList.toggle("active", stageButtons[m] === e.currentTarget);
        }
        updateScheduleFilter();
      });
    }

    if (window.location.hash === "#solar") {
      var solarBtn = document.querySelector('[data-filter-stage="stage-solar"]');
      if (solarBtn) solarBtn.click();
    } else if (window.location.hash === "#lunar") {
      var lunarBtn = document.querySelector('[data-filter-stage="stage-lunar"]');
      if (lunarBtn) lunarBtn.click();
    }
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  document.addEventListener("DOMContentLoaded", function () {
    initControls();
    applyTranslations(getFestivalLang());
  });
})();
