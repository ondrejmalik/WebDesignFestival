/* v2/js/lang.js */
(function () {
  var STORAGE_KEY = 'fod2_lang';

  var FESTIVAL_I18N = {
    en: {
      'nav.overview': 'Overview',
      'nav.schedule': 'Schedule',
      'nav.langToggle': 'CZ',
      'hero.dates': '10-12 July 2026',
      'hero.location': 'Kutná Hora, Czechia',
      'hero.title': 'Precision sound across two distinct stages.',
      'hero.description': 'Three days of electronic, alternative, and audiovisual music in Kutná Hora. Built for clarity, spatial depth, and continuous late-night flow.',
      'hero.ctaSchedule': 'Explore full schedule',
      'hero.ctaArtists': 'Explore 60 Artists',
      'hero.edition': 'EDITION 02 // OPEN AIR',
      'hero.brandTitle': 'Festival of Darkness 2',
      'spec.online': 'ONLINE',
      'hero.ctaStages': 'Stage specifications',
      'spec.header': 'Festival architecture',
      'spec.durationLabel': 'Duration',
      'spec.durationVal': '3 Days',
      'spec.capacityLabel': 'Total Capacity',
      'spec.performersLabel': 'Performers',
      'spec.stagesLabel': 'Stages',
      'spec.status': 'Lineup confirmed for Kutná Hora',
      'stages.title': 'Two acoustic environments',
      'stages.subtitle': 'Engineered for open-air dynamics and 360-degree dome immersion.',
      'stages.solarType': 'Open-air main stage',
      'stages.lunarType': 'Covered audiovisual dome',
      'stages.capUnit': 'cap',
      'stages.solarDesc': 'Central open-air amphitheater for major band performances, indie rock, and dance headliners.',
      'stages.lunarDesc': 'Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.',
      'stages.hoursLabel': 'Operating window',
      'stages.focusLabel': 'Acoustic focus',
      'stages.solarFocus': 'Indie Rock, Synthpop, Electronic Live',
      'stages.lunarFocus': 'Techno, Modular Ambient, IDM',
      'highlights.title': 'Selected headliners',
      'highlights.subtitle': 'Peak-time sets scheduled across Friday, Saturday, and Sunday.',
      'highlights.viewAll': 'View all 15 featured sets',
      'program.title': 'Program & Timetable',
      'program.subtitle': 'Featured sets across Solar Horizon Stage and Lunar Forest Dome, 10-12 July 2026.',
      'days.friShort': 'Fri 10 Jul',
      'days.satShort': 'Sat 11 Jul',
      'days.sunShort': 'Sun 12 Jul',
      'days.friFull': 'Friday, 10 July',
      'days.satFull': 'Saturday, 11 July',
      'days.sunFull': 'Sunday, 12 July',
      'footer.location': 'Kutná Hora, Czech Republic - 10-12 July 2026',
      'dock_artists': 'Artists',
      'dock_stages': 'Stages',
      'dock_info': 'Info',
      'dock_home': 'Home',
      'dock_program': 'Program',
      'dock_plan': 'My Plan',
      'dock_search': 'Search',
      'prog_plan_label': 'My Schedule:',
      'prog_open_plan': 'Open My Schedule',
      'col_plan': 'Plan',
      'prog_add': '+ Add',
      'prog_added': '✓ In Plan',
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
      'nav.overview': 'Přehled',
      'nav.schedule': 'Program',
      'nav.langToggle': 'EN',
      'hero.dates': '10.–12. července 2026',
      'hero.location': 'Kutná Hora, Česko',
      'hero.title': 'Precizní zvuk na dvou odlišných scénách.',
      'hero.description': 'Tři dny elektronické, alternativní a audiovizuální hudby v Kutné Hoře. Navrženo pro čistotu zvuku, prostorovou hloubku a noční plynulost.',
      'hero.ctaSchedule': 'Prozkoumat program',
      'hero.ctaArtists': 'Prozkoumat 60 umělců',
      'hero.edition': 'EDICE 02 // OPEN AIR',
      'hero.brandTitle': 'Festival of Darkness 2',
      'spec.online': 'AKTIVNÍ',
      'hero.ctaStages': 'Specifikace scén',
      'spec.header': 'Architektura festivalu',
      'spec.durationLabel': 'Délka trvání',
      'spec.durationVal': '3 dny',
      'spec.capacityLabel': 'Celková kapacita',
      'spec.performersLabel': 'Vystupující',
      'spec.stagesLabel': 'Scény',
      'spec.status': 'Line-up pro Kutnou Horu potvrzen',
      'stages.title': 'Dvě akustická prostředí',
      'stages.subtitle': 'Navrženo pro dynamiku pod širým nebem i 360stupňovou projekci v kopuli.',
      'stages.solarType': 'Venkovní hlavní scéna',
      'stages.lunarType': 'Krytá audiovizuální kopule',
      'stages.capUnit': 'kapacita',
      'stages.solarDesc': 'Centrální venkovní amfiteátr pro hlavní kapely, indie rock a taneční headlinery.',
      'stages.lunarDesc': 'Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360stupňové světelné projekce.',
      'stages.hoursLabel': 'Provozní doba',
      'stages.focusLabel': 'Akustické zaměření',
      'stages.solarFocus': 'Indie rock, synthpop, živá elektronika',
      'stages.lunarFocus': 'Techno, modulární ambient, IDM',
      'highlights.title': 'Vybraní headlineři',
      'highlights.subtitle': 'Hlavní vystoupení naplánovaná na pátek, sobotu a neděli.',
      'highlights.viewAll': 'Zobrazit všech 15 vybraných setů',
      'program.title': 'Program a časový harmonogram',
      'program.subtitle': 'Vybrané sety na Solar Horizon Stage a Lunar Forest Dome, 10.–12. července 2026.',
      'days.friShort': 'Pá 10. 7.',
      'days.satShort': 'So 11. 7.',
      'days.sunShort': 'Ne 12. 7.',
      'days.friFull': 'Pátek, 10. července',
      'days.satFull': 'Sobota, 11. července',
      'days.sunFull': 'Neděle, 12. července',
      'footer.location': 'Kutná Hora, Česká republika - 10.–12. července 2026',
      'dock_artists': 'Umělci',
      'dock_stages': 'Scény',
      'dock_info': 'Info',
      'dock_home': 'Domů',
      'dock_program': 'Program',
      'dock_plan': 'Můj plán',
      'dock_search': 'Hledat',
      'prog_plan_label': 'Můj plán:',
      'prog_open_plan': 'Otevřít Můj plán',
      'col_plan': 'Plán',
      'prog_add': '+ Přidat',
      'prog_added': '✓ V plánu',
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
    var n = Math.abs(Number(count)) || 0;
    if (n === 1) {
      return n + ' ' + one;
    }
    if (n >= 2 && n <= 4) {
      return n + ' ' + few;
    }
    return n + ' ' + many;
  }

  function formatEnPlural(count, one, many) {
    var n = Math.abs(Number(count)) || 0;
    return n + ' ' + (n === 1 ? one : many);
  }

  function getFestivalLang() {
    try {
      var saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'cs' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      // Ignore storage access restrictions
    }
    return 'en';
  }

  function applyTranslations(lang) {
    var dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
    document.documentElement.lang = lang;

    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (Object.prototype.hasOwnProperty.call(dict, key)) {
        el.textContent = dict[key];
      }
    }

    var perfEl = document.getElementById('stat-performers');
    if (perfEl) {
      var perfCount = Number(perfEl.getAttribute('data-count')) || 60;
      perfEl.textContent = lang === 'cs'
        ? formatCzPlural(perfCount, 'interpret', 'interpreti', 'interpretů')
        : formatEnPlural(perfCount, 'act', 'acts');
    }

    var stagesEl = document.getElementById('stat-stages');
    if (stagesEl) {
      var stageCount = Number(stagesEl.getAttribute('data-count')) || 2;
      stagesEl.textContent = lang === 'cs'
        ? formatCzPlural(stageCount, 'scéna', 'scény', 'scén')
        : formatEnPlural(stageCount, 'stage', 'stages');
    }

    var setCountEls = document.querySelectorAll('[data-sets-count]');
    for (var j = 0; j < setCountEls.length; j++) {
      var badge = setCountEls[j];
      var count = Number(badge.getAttribute('data-sets-count')) || 0;
      badge.textContent = lang === 'cs'
        ? formatCzPlural(count, 'set', 'sety', 'setů')
        : formatEnPlural(count, 'set', 'sets');
    }
  }

  function setFestivalLang(lang) {
    var normalized = lang === 'cs' ? 'cs' : 'en';
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {
      // Ignore storage access restrictions
    }
    applyTranslations(normalized);
    return normalized;
  }

  function toggleFestivalLang() {
    var next = getFestivalLang() === 'en' ? 'cs' : 'en';
    return setFestivalLang(next);
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  document.addEventListener('DOMContentLoaded', function () {
    applyTranslations(getFestivalLang());
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', toggleFestivalLang);
    }
  });
})();
