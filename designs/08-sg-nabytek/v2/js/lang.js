(function () {
  var STORAGE_KEY = 'fd2_lang';

  var FESTIVAL_I18N = {
    en: {
      'header.meta': 'Kutná Hora, Czech Republic | 10-12 July 2026',
      'brand.sub': 'Open-Air & Audiovisual Music',
      'nav.home': 'Overview',
      'nav.program': 'Schedule',
      'nav.stages': 'Stages',
      'nav.highlights': 'Highlights',
      'hero.eyebrow': 'Edition 2026 | Kutná Hora',
      'hero.title': 'Festival of Darkness 2',
      'hero.desc': 'Three days of electronic, alternative, and audiovisual music across two distinct stages in historic Kutná Hora.',
      'hero.ctaPrimary': 'Explore Full Schedule',
      'hero.ctaSecondary': 'View Stage Specs',
      'facts.heading': 'Edition Specifications',
      'facts.datesLabel': 'Dates',
      'facts.datesValue': '10-12 July 2026 (Fri-Sun)',
      'facts.locationLabel': 'Venue',
      'facts.locationValue': 'Kutná Hora, Czech Republic',
      'facts.stagesLabel': 'Stages',
      'facts.stagesValue': '2 (6,300 combined capacity)',
      'facts.lineupLabel': 'Lineup',
      'facts.lineupValue': '60 live acts and DJ sets',
      'stages.title': 'Two Distinct Performance Environments',
      'stages.subtitle': 'Engineered for contrasting acoustic experiences from afternoon indie sets to late-night audiovisual sessions.',
      'stages.capacityLabel': 'Capacity:',
      'stages.hoursLabel': 'Hours:',
      'stages.solar.type': 'Open-air main stage',
      'stages.solar.desc': 'Central open-air amphitheater for major band performances, indie rock, and dance headliners.',
      'stages.lunar.type': 'Covered audiovisual dome',
      'stages.lunar.desc': 'Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.',
      'highlights.title': 'Evening Headliners by Day',
      'highlights.subtitle': 'Selected prime-time performances from the 2026 timetable.',
      'highlights.viewAll': 'View Complete Daily Timetable',
      'days.day1Short': 'Friday, 10 Jul',
      'days.day2Short': 'Saturday, 11 Jul',
      'days.day3Short': 'Sunday, 12 Jul',
      'days.day1Tab': 'Friday 10. 7.',
      'days.day2Tab': 'Saturday 11. 7.',
      'days.day3Tab': 'Sunday 12. 7.',
      'days.day1Full': 'Day 1: Friday, 10 July 2026',
      'days.day2Full': 'Day 2: Saturday, 11 July 2026',
      'days.day3Full': 'Day 3: Sunday, 12 July 2026',
      'days.day1Note': 'Opening night featuring alternative rock, nu-disco, and live modular techno.',
      'days.day2Note': 'Full-day program from shoegaze and post-punk to peak-time acid techno.',
      'days.day3Note': 'Closing day culminating in orchestral electronics and melodic techno.',
      'schedule.eyebrow': '10-12 July 2026 | Kutná Hora',
      'schedule.title': 'Festival Schedule',
      'schedule.lead': 'Curated evening and headline timetable across Solar Horizon Stage and Lunar Forest Dome.',
      'schedule.featuredCount': '6 featured sets',
      'table.time': 'Time',
      'table.artist': 'Artist',
      'table.genre': 'Genre',
      'table.stage': 'Stage',
      'footer.location': 'Kutná Hora, Czech Republic | 10-12 July 2026',
      'dock_artists': 'Artists',
      'dock_stages': 'Stages',
      'dock_info': 'Info',
      'dock_home': 'Home',
      'dock_program': 'Program',
      'dock_plan': 'My Plan',
      'dock_search': 'Search'
    },
    cs: {
      'header.meta': 'Kutná Hora, Česká republika | 10.-12. července 2026',
      'brand.sub': 'Open-air a audiovizuální hudba',
      'nav.home': 'Přehled',
      'nav.program': 'Program',
      'nav.stages': 'Scény',
      'nav.highlights': 'Headlinery',
      'hero.eyebrow': 'Ročník 2026 | Kutná Hora',
      'hero.title': 'Festival of Darkness 2',
      'hero.desc': 'Tři dny elektronické, alternativní a audiovizuální hudby na dvou odlišných scénách v historické Kutné Hoře.',
      'hero.ctaPrimary': 'Zobrazit program',
      'hero.ctaSecondary': 'Parametry scén',
      'facts.heading': 'Základní parametry ročníku',
      'facts.datesLabel': 'Termín',
      'facts.datesValue': '10.-12. července 2026 (pá-ne)',
      'facts.locationLabel': 'Místo konání',
      'facts.locationValue': 'Kutná Hora, Česká republika',
      'facts.stagesLabel': 'Počet scén',
      'facts.stagesValue': '2 (celková kapacita 6 300)',
      'facts.lineupLabel': 'Line-up',
      'facts.lineupValue': '60 živých vystoupení a DJ setů',
      'stages.title': 'Dvě odlišná koncertní prostředí',
      'stages.subtitle': 'Navrženo pro kontrastní akustický zážitek od odpoledních indie koncertů po noční audiovizuální sety.',
      'stages.capacityLabel': 'Kapacita:',
      'stages.hoursLabel': 'Provoz:',
      'stages.solar.type': 'Venkovní hlavní scéna',
      'stages.solar.desc': 'Centrální otevřený amfiteátr pro velká kapelová vystoupení, indie rock a taneční headlinery.',
      'stages.lunar.type': 'Krytý audiovizuální dóm',
      'stages.lunar.desc': 'Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360stupňové světelné projekce.',
      'highlights.title': 'Večerní headlinery podle dnů',
      'highlights.subtitle': 'Vybraná hlavní vystoupení z harmonogramu ročníku 2026.',
      'highlights.viewAll': 'Zobrazit kompletní denní program',
      'days.day1Short': 'Pátek 10. 7.',
      'days.day2Short': 'Sobota 11. 7.',
      'days.day3Short': 'Neděle 12. 7.',
      'days.day1Tab': 'Pátek 10. 7.',
      'days.day2Tab': 'Sobota 11. 7.',
      'days.day3Tab': 'Neděle 12. 7.',
      'days.day1Full': 'Den 1: Pátek 10. července 2026',
      'days.day2Full': 'Den 2: Sobota 11. července 2026',
      'days.day3Full': 'Den 3: Neděle 12. července 2026',
      'days.day1Note': 'Zahajovací noc s alternativním rockem, nu-discem a živým modulárním technem.',
      'days.day2Note': 'Celodenní program od shoegaze a post-punku po vrcholné acid techno.',
      'days.day3Note': 'Závěrečný den vrcholící orchestrální elektronikou a melodickým technem.',
      'schedule.eyebrow': '10.-12. července 2026 | Kutná Hora',
      'schedule.title': 'Program festivalu',
      'schedule.lead': 'Výběr večerních a hlavních vystoupení na scénách Solar Horizon Stage a Lunar Forest Dome.',
      'schedule.featuredCount': '6 vybraných setů',
      'table.time': 'Čas',
      'table.artist': 'Interpret',
      'table.genre': 'Žánr',
      'table.stage': 'Scéna',
      'footer.location': 'Kutná Hora, Česká republika | 10.-12. července 2026',
      'dock_artists': 'Umělci',
      'dock_stages': 'Scény',
      'dock_info': 'Info',
      'dock_home': 'Domů',
      'dock_program': 'Program',
      'dock_plan': 'Můj plán',
      'dock_search': 'Hledat'
    }
  };

  function getFestivalLang() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'cs' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      // Ignore storage restrictions
    }
    return 'en';
  }

  function formatCzPlural(count, one, few, many) {
    var abs = Math.abs(Number(count)) || 0;
    if (abs === 1) {
      return one;
    }
    if (abs >= 2 && abs <= 4) {
      return few;
    }
    return many;
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

    var toggleBtn = document.getElementById('lang-toggle');
    if (toggleBtn) {
      toggleBtn.textContent = lang === 'en' ? 'CZ' : 'EN';
      toggleBtn.setAttribute(
        'aria-label',
        lang === 'en' ? 'Přepnout jazyk na češtinu' : 'Switch language to English'
      );
    }
  }

  function setFestivalLang(lang) {
    var normalized = lang === 'cs' ? 'cs' : 'en';
    try {
      localStorage.setItem(STORAGE_KEY, normalized);
    } catch (e) {
      // Ignore storage restrictions
    }
    applyTranslations(normalized);
    return normalized;
  }

  function toggleFestivalLang() {
    var current = getFestivalLang();
    return setFestivalLang(current === 'en' ? 'cs' : 'en');
  }

  window.FESTIVAL_I18N = FESTIVAL_I18N;
  window.getFestivalLang = getFestivalLang;
  window.setFestivalLang = setFestivalLang;
  window.toggleFestivalLang = toggleFestivalLang;
  window.formatCzPlural = formatCzPlural;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyTranslations(getFestivalLang());
    });
  } else {
    applyTranslations(getFestivalLang());
  }
})();
