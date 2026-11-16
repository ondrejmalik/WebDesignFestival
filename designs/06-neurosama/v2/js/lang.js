/* v2/js/lang.js */
const FESTIVAL_I18N = {
  en: {
    nav_home: "Overview",
    nav_program: "Program",
    hero_dates: "10-12 Jul 2026",
    hero_location: "Kutná Hora, Czechia",
    hero_title: "Festival of Darkness 2",
    hero_subtitle: "Three days of electronic, alternative, and audiovisual music across two distinct stages in Kutná Hora.",
    cta_program: "Explore Program",
    cta_stages: "View Stages",
    facts_heading: "Start Times & Doors",
    day1_short: "Fri, 10 Jul",
    day2_short: "Sat, 11 Jul",
    day3_short: "Sun, 12 Jul",
    lineup_count_label: "Lineup Scale",
    stages_heading: "Two Distinct Stages",
    stages_lead: "Open-air live performances by day and immersive 360-degree audiovisual electronics through the night.",
    solar_type: "Open-air main stage",
    solar_cap: "Capacity: 4,500",
    solar_desc: "Central open-air amphitheater for major band performances, indie rock, and dance headliners.",
    lunar_type: "Covered audiovisual dome",
    lunar_cap: "Capacity: 1,800",
    lunar_desc: "Atmospheric covered indoor stage focusing on techno, ambient, experimental electronics, and 360-degree light projections.",
    highlights_heading: "Featured Sets",
    highlights_lead: "Selected headline and late-night performances from the 2026 Kutná Hora timetable.",
    cta_full_schedule: "Open Full 3-Day Schedule",
    program_title: "Festival Timetable",
    program_lead: "Key evening and late-night sets across Solar Horizon Stage and Lunar Forest Dome.",
    day1_tab: "Day 1: Fri 10 Jul",
    day2_tab: "Day 2: Sat 11 Jul",
    day3_tab: "Day 3: Sun 12 Jul",
    day1_heading: "Friday, 10 July 2026",
    day2_heading: "Saturday, 11 July 2026",
    day3_heading: "Sunday, 12 July 2026",
    footer_meta: "Kutná Hora, Czech Republic | 10-12 Jul 2026",
    dock_artists: "Artists",
    dock_stages: "Stages",
    dock_info: "Info",
    dock_home: "Home",
    dock_program: "Program",
    dock_plan: "My Plan",
    dock_search: "Search"
  },
  cs: {
    nav_home: "Přehled",
    nav_program: "Program",
    hero_dates: "10.-12. 7. 2026",
    hero_location: "Kutná Hora, Česko",
    hero_title: "Festival of Darkness 2",
    hero_subtitle: "Tři dny elektronické, alternativní a audiovizuální hudby na dvou odlišných scénách v Kutné Hoře.",
    cta_program: "Prozkoumat program",
    cta_stages: "Zobrazit scény",
    facts_heading: "Začátky a otevření areálu",
    day1_short: "Pá, 10. 7.",
    day2_short: "So, 11. 7.",
    day3_short: "Ne, 12. 7.",
    lineup_count_label: "Rozsah line-upu",
    stages_heading: "Dvě odlišné scény",
    stages_lead: "Živá vystoupení pod širým nebem přes den a pohlcující 360stupňová audiovizuální elektronika po celou noc.",
    solar_type: "Venkovní hlavní scéna",
    solar_cap: "Kapacita: 4 500",
    solar_desc: "Centrální venkovní amfiteátr pro velká kapelová vystoupení, indie rock a taneční headlinery.",
    lunar_type: "Krytá audiovizuální kopule",
    lunar_cap: "Kapacita: 1 800",
    lunar_desc: "Atmosférická krytá scéna zaměřená na techno, ambient, experimentální elektroniku a 360stupňové světelné projekce.",
    highlights_heading: "Vybrané sety",
    highlights_lead: "Výběr hlavních večerních a nočních vystoupení z harmonogramu pro Kutnou Horu 2026.",
    cta_full_schedule: "Otevřít kompletní 3denní program",
    program_title: "Harmonogram festivalu",
    program_lead: "Hlavní večerní a noční sety na scénách Solar Horizon Stage a Lunar Forest Dome.",
    day1_tab: "Den 1: Pá 10. 7.",
    day2_tab: "Den 2: So 11. 7.",
    day3_tab: "Den 3: Ne 12. 7.",
    day1_heading: "Pátek 10. července 2026",
    day2_heading: "Sobota 11. července 2026",
    day3_heading: "Neděle 12. července 2026",
    footer_meta: "Kutná Hora, Česká republika | 10.-12. 7. 2026",
    dock_artists: "Umělci",
    dock_stages: "Scény",
    dock_info: "Info",
    dock_home: "Domů",
    dock_program: "Program",
    dock_plan: "Můj plán",
    dock_search: "Hledat"
  }
};

function formatCzPlural(n, one, few, many) {
  const forms = Array.isArray(one) ? one : [one, few, many];
  const abs = Math.abs(Number(n)) || 0;
  let form = forms[2];
  if (abs === 1) {
    form = forms[0];
  } else if (abs >= 2 && abs <= 4) {
    form = forms[1];
  }
  return Array.isArray(one) ? `${n} ${form}` : form;
}

function getFestivalLang() {
  try {
    const saved = localStorage.getItem("fod2_lang");
    if (saved === "cs" || saved === "en") {
      return saved;
    }
  } catch (e) {
    // Ignore storage access restrictions
  }
  return "en";
}

function applyFestivalTranslations(lang) {
  const dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
      el.textContent = dict[key];
    }
  });

  const artistCountEl = document.getElementById("artist-count-display");
  if (artistCountEl) {
    artistCountEl.textContent =
      lang === "cs"
        ? `60 ${formatCzPlural(60, "interpret", "interpreti", "interpretů")}`
        : "60 artists";
  }

  ["day1-count", "day2-count", "day3-count"].forEach((id) => {
    const countEl = document.getElementById(id);
    if (countEl) {
      countEl.textContent =
        lang === "cs"
          ? `6 ${formatCzPlural(6, "vybraný set", "vybrané sety", "vybraných setů")}`
          : "6 featured sets";
    }
  });

  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = lang === "en" ? "CZ" : "EN";
    toggleBtn.setAttribute(
      "aria-label",
      lang === "en" ? "Přepnout do češtiny" : "Switch to English"
    );
  }
}

function setFestivalLang(lang) {
  const normalized = lang === "cs" ? "cs" : "en";
  try {
    localStorage.setItem("fod2_lang", normalized);
  } catch (e) {
    // Ignore storage access restrictions
  }
  applyFestivalTranslations(normalized);
  return normalized;
}

function toggleFestivalLang() {
  const next = getFestivalLang() === "en" ? "cs" : "en";
  return setFestivalLang(next);
}

window.FESTIVAL_I18N = FESTIVAL_I18N;
window.getFestivalLang = getFestivalLang;
window.setFestivalLang = setFestivalLang;
window.toggleFestivalLang = toggleFestivalLang;
window.formatCzPlural = formatCzPlural;

document.addEventListener("DOMContentLoaded", () => {
  applyFestivalTranslations(getFestivalLang());
  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleFestivalLang);
  }
});
