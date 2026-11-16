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
      "prog_added": "✓ In Plan",
      "hero.edition": "EDITION 02 // LIVE TRANSMISSION",
      "hero.brandTitle": "Festival of Darkness 2",
      "hero.ctaLineup": "Explore 60 Artists",
      "hero.metric.stages_label": "STAGES",
      "signal.coordinates_key": "COORDINATES",
      "signal.stage_a_key": "STAGE 01",
      "signal.stage_b_key": "STAGE 02",
      "fod_footer_dates": "10-12 / 07.2026",
      "fod_footer_venue": "SEDLEC · KUTNÁ HORA",
      "fod_footer_col_festival": "FESTIVAL",
      "fod_footer_col_info": "PRACTICAL INFO",
      "fod_footer_col_contact": "CONTACT",
      "fod_footer_follow": "FOLLOW US",
      "fod_footer_nav_home": "Overview",
      "fod_footer_nav_program": "Program",
      "fod_footer_nav_artists": "Artists",
      "fod_footer_nav_artist_detail": "Artist Spotlight",
      "fod_footer_nav_stages": "Stages & Grounds",
      "fod_footer_nav_tickets": "Tickets & Passes",
      "fod_footer_nav_schedule": "My Schedule",
      "fod_footer_nav_search": "Search",
      "fod_footer_info_all": "Practical Info",
      "fod_footer_info_tickets": "Tickets & Entry",
      "fod_footer_info_travel": "Getting There",
      "fod_footer_info_camp": "Camping & Stay",
      "fod_footer_info_cashless": "Cashless & Grounds",
      "fod_footer_info_faq": "FAQ",
      "fod_footer_addr_line1": "Sedlec Festival Grounds",
      "fod_footer_addr_line2": "284 03 Kutná Hora",
      "fod_footer_contact_link": "Site & Contact Info ↗",
      "fod_footer_social_fb": "Facebook (placeholder)",
      "fod_footer_social_ig": "Instagram (placeholder)",
      "fod_footer_social_sp": "Spotify (placeholder)",
      "fod_footer_social_yt": "YouTube (placeholder)",
      "fod_footer_social_x": "X (placeholder)",
      "fod_footer_copy": "© 2026 Festival Temnoty 2 · Kutná Hora",
      "fod_footer_top": "BACK TO TOP ↑"
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
      "prog_added": "✓ V plánu",
      "hero.edition": "EDICE 02 // ŽIVÝ PŘENOS",
      "hero.brandTitle": "Festival of Darkness 2",
      "hero.ctaLineup": "Prozkoumat 60 interpretů",
      "hero.metric.stages_label": "SCÉNY",
      "signal.coordinates_key": "SOUŘADNICE",
      "signal.stage_a_key": "SCÉNA 01",
      "signal.stage_b_key": "SCÉNA 02",
      "fod_footer_dates": "10.-12. / 07.2026",
      "fod_footer_venue": "SEDLEC · KUTNÁ HORA",
      "fod_footer_col_festival": "FESTIVAL",
      "fod_footer_col_info": "PRAKTICKÉ INFO",
      "fod_footer_col_contact": "KONTAKT",
      "fod_footer_follow": "SLEDUJTE NÁS",
      "fod_footer_nav_home": "Přehled",
      "fod_footer_nav_program": "Program",
      "fod_footer_nav_artists": "Účinkující",
      "fod_footer_nav_artist_detail": "Detail interpreta",
      "fod_footer_nav_stages": "Scény a areál",
      "fod_footer_nav_tickets": "Vstupenky a pasy",
      "fod_footer_nav_schedule": "Můj program",
      "fod_footer_nav_search": "Vyhledávání",
      "fod_footer_info_all": "Praktické info",
      "fod_footer_info_tickets": "Vstupenky a vstup",
      "fod_footer_info_travel": "Jak se k nám dostat",
      "fod_footer_info_camp": "Kemp a ubytování",
      "fod_footer_info_cashless": "Cashless a areál",
      "fod_footer_info_faq": "Časté dotazy",
      "fod_footer_addr_line1": "Areál Sedlec",
      "fod_footer_addr_line2": "284 03 Kutná Hora",
      "fod_footer_contact_link": "Informace o areálu ↗",
      "fod_footer_social_fb": "Facebook (ukázkový odkaz)",
      "fod_footer_social_ig": "Instagram (ukázkový odkaz)",
      "fod_footer_social_sp": "Spotify (ukázkový odkaz)",
      "fod_footer_social_yt": "YouTube (ukázkový odkaz)",
      "fod_footer_social_x": "X (ukázkový odkaz)",
      "fod_footer_copy": "© 2026 Festival Temnoty 2 · Kutná Hora",
      "fod_footer_top": "NAHORU ↑"
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
