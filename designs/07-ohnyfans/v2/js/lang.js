/* v2/js/lang.js */
const FESTIVAL_I18N = {
  en: {
    "nav.home": "Overview",
    "nav.program": "Program",
    "hero.dates": "10-12 Jul 2026",
    "hero.location": "Kutná Hora, Czech Republic",
    "hero.edition": "Edition 2026",
    "hero.title": "Festival of Darkness 2",
    "hero.subtitle": "Three days of electronic, alternative, and audiovisual music across two distinct stages in Kutná Hora.",
    "hero.ctaProgram": "View Full Schedule",
    "hero.ctaStages": "Explore Stages",
    "stats.days": "Festival Days",
    "stats.stages": "Distinct Stages",
    "stats.artists": "Live Sets",
    "stats.capacity": "Total Capacity",
    "stages.heading": "Two Acoustic Worlds",
    "stages.intro": "Open-air amplitude meets 360-degree enclosed projection architecture.",
    "stages.solar.type": "Open-Air Main Stage",
    "stages.solar.capacity": "Cap. 4,500",
    "stages.solar.desc": "Central open-air amphitheater for major band performances, indie rock, post-rock, and late-night dance headliners.",
    "stages.solar.hours": "Daily 13:00 - 02:00",
    "stages.lunar.type": "Covered Audiovisual Dome",
    "stages.lunar.capacity": "Cap. 1,800",
    "stages.lunar.desc": "Atmospheric covered indoor dome focusing on techno, modular ambient, experimental electronics, and 360-degree light projections.",
    "stages.lunar.hours": "Daily 14:00 - 04:00",
    "stages.viewLineup": "Stage timetable",
    "highlights.heading": "Program Highlights",
    "highlights.intro": "Selected evening headliners across all three festival nights.",
    "highlights.allSets": "Browse Complete 3-Day Program",
    "days.friShort": "Fri 10 Jul",
    "days.satShort": "Sat 11 Jul",
    "days.sunShort": "Sun 12 Jul",
    "days.day1Nav": "Day 1 - Fri 10 Jul",
    "days.day2Nav": "Day 2 - Sat 11 Jul",
    "days.day3Nav": "Day 3 - Sun 12 Jul",
    "days.day1Title": "Day 1 - Friday, 10 July 2026",
    "days.day1Sub": "Opening afternoon post-rock, synthpop, and late-night live hardware techno.",
    "days.day2Title": "Day 2 - Saturday, 11 July 2026",
    "days.day2Sub": "Shoegaze, post-punk revival, and peak-time dark wave techno.",
    "days.day3Title": "Day 3 - Sunday, 12 July 2026",
    "days.day3Sub": "Chamber pop, melodic techno, and the closing orchestral electronic finale.",
    "program.badge": "2 Stages / 3 Days",
    "program.title": "Program",
    "program.subtitle": "Curated daily timetable across Solar Horizon Stage and Lunar Forest Dome.",
    "footer.location": "Kutná Hora, Czech Republic - 10-12 July 2026"
  },
  cs: {
    "nav.home": "Přehled",
    "nav.program": "Program",
    "hero.dates": "10.-12. čvc 2026",
    "hero.location": "Kutná Hora, Česká republika",
    "hero.edition": "Ročník 2026",
    "hero.title": "Festival of Darkness 2",
    "hero.subtitle": "Tři dny elektronické, alternativní a audiovizuální hudby na dvou odlišných scénách v Kutné Hoře.",
    "hero.ctaProgram": "Zobrazit celý program",
    "hero.ctaStages": "Prozkoumat scény",
    "stats.days": "Festivalové dny",
    "stats.stages": "Hudební scény",
    "stats.artists": "Živých setů",
    "stats.capacity": "Celková kapacita",
    "stages.heading": "Dva akustické světy",
    "stages.intro": "Otevřený amfiteátr a uzavřená kopule s 360stupňovou projekcí.",
    "stages.solar.type": "Venkovní hlavní scéna",
    "stages.solar.capacity": "Kap. 4 500",
    "stages.solar.desc": "Centrální venkovní amfiteátr pro velké kapely, indie rock, post-rock a noční taneční headlinery.",
    "stages.solar.hours": "Denně 13:00 - 02:00",
    "stages.lunar.type": "Krytá audiovizuální kopule",
    "stages.lunar.capacity": "Kap. 1 800",
    "stages.lunar.desc": "Atmosférická krytá scéna zaměřená na techno, modulární ambient, experimentální elektroniku a 360stupňové světelné projekce.",
    "stages.lunar.hours": "Denně 14:00 - 04:00",
    "stages.viewLineup": "Časový harmonogram",
    "highlights.heading": "Výběr z programu",
    "highlights.intro": "Vybraní večerní headlinerové napříč všemi třemi festivalovými nocemi.",
    "highlights.allSets": "Procházet kompletní třídenní program",
    "days.friShort": "Pá 10. 7.",
    "days.satShort": "So 11. 7.",
    "days.sunShort": "Ne 12. 7.",
    "days.day1Nav": "Den 1 - Pá 10. čvc",
    "days.day2Nav": "Den 2 - So 11. čvc",
    "days.day3Nav": "Den 3 - Ne 12. čvc",
    "days.day1Title": "Den 1 - Pátek 10. července 2026",
    "days.day1Sub": "Odpolední post-rock, synthpop a noční živé hardwarové techno.",
    "days.day2Title": "Den 2 - Sobota 11. července 2026",
    "days.day2Sub": "Shoegaze, post-punk revival a vrcholné dark wave techno.",
    "days.day3Title": "Den 3 - Neděle 12. července 2026",
    "days.day3Sub": "Chamber pop, melodické techno a závěrečné orchestrální elektronické finále.",
    "program.badge": "2 scény / 3 dny",
    "program.title": "Program",
    "program.subtitle": "Výběr denního harmonogramu pro Solar Horizon Stage a Lunar Forest Dome.",
    "footer.location": "Kutná Hora, Česká republika - 10.-12. července 2026"
  }
};

const STORAGE_KEY = "fod2_lang";

function formatCzPlural(count, one, few, many) {
  const abs = Math.abs(Number(count)) || 0;
  if (abs === 1) return `${count} ${one}`;
  if (abs >= 2 && abs <= 4) return `${count} ${few}`;
  return `${count} ${many}`;
}

function getFestivalLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "cs") return saved;
  } catch (e) {
    // Ignore storage access errors in restricted contexts
  }
  return "en";
}

function applyTranslations(lang) {
  const dict = FESTIVAL_I18N[lang] || FESTIVAL_I18N.en;
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll("[data-set-count]").forEach((el) => {
    const count = Number(el.getAttribute("data-set-count")) || 0;
    el.textContent =
      lang === "cs"
        ? formatCzPlural(count, "set", "sety", "setů")
        : `${count} ${count === 1 ? "set" : "sets"}`;
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
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch (e) {
    // Ignore storage access errors
  }
  applyTranslations(normalized);
  return normalized;
}

function toggleFestivalLang() {
  const current = getFestivalLang();
  return setFestivalLang(current === "en" ? "cs" : "en");
}

window.FESTIVAL_I18N = FESTIVAL_I18N;
window.getFestivalLang = getFestivalLang;
window.setFestivalLang = setFestivalLang;
window.toggleFestivalLang = toggleFestivalLang;
window.formatCzPlural = formatCzPlural;

document.addEventListener("DOMContentLoaded", () => {
  applyTranslations(getFestivalLang());
});
