// tests/lang_switcher_test.js - Comprehensive validation of language switcher & bilingual separation
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES = [
    'index.html',
    'program.html',
    'artists.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html'
];

let failed = 0;
let passed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

console.log('========================================================================');
console.log('TEST SUITE: Language Switcher (EN <-> CS) & Bilingual Slash Elimination');
console.log('========================================================================\n');

// 1. Static Scan: Check for lingering bilingual slash combos in root HTML files
console.log('--- 1. Static Scan for Lingering Bilingual Slash Patterns ---');
const BILINGUAL_SLASH_PATTERNS = [
    /Úvod\s*\/\s*Home/i,
    /Home\s*\/\s*Úvod/i,
    /Účinkující\s*\/\s*Artists/i,
    /Artists\s*\/\s*Účinkující/i,
    /Scény\s*\/\s*Stages/i,
    /Stages\s*\/\s*Scény/i,
    /Praktické info\s*\/\s*Practical Info/i,
    /Practical Info\s*\/\s*Praktické info/i,
    /Můj program\s*\/\s*My Schedule/i,
    /My Schedule\s*\/\s*Můj program/i,
    /Hlavní brána\s*\/\s*Vstup/i,
    /Vstup A\s*\/\s*Hlavní/i,
    /Kyvadlová doprava\s*\/\s*Shuttle/i,
    /Zavřít\s*\/\s*Close/i,
    /Legenda\s*\/\s*Legend/i,
    /Highlighted\s*\/\s*Bookmarked/i,
    /Empty Slot\s*\/\s*Stage Break/i
];

PAGES.forEach(page => {
    const filePath = path.join(ROOT_DIR, page);
    const content = fs.readFileSync(filePath, 'utf8');

    // Verify lang.js script inclusion
    assert(content.includes('js/lang.js'), `${page} includes <script src="js/lang.js">`);

    // Verify presence of language switch button markup or component hook
    assert(
        content.includes('lang-switch-btn') || content.includes('components/nav.js'),
        `${page} includes lang-switch-btn or components/nav.js`
    );

    // Verify NO bilingual slash combinations exist
    BILINGUAL_SLASH_PATTERNS.forEach(pat => {
        const match = content.match(pat);
        assert(!match, `${page} has no bilingual match for ${pat} (found: ${match ? match[0] : 'none'})`);
    });
});

// Also scan components
console.log('\n--- 2. Static Scan of Components (nav and footer) ---');
['components/nav.html', 'components/nav.js', 'components/footer.html', 'components/footer.js'].forEach(comp => {
    const compPath = path.join(ROOT_DIR, comp);
    const content = fs.readFileSync(compPath, 'utf8');
    BILINGUAL_SLASH_PATTERNS.forEach(pat => {
        const match = content.match(pat);
        assert(!match, `${comp} has no bilingual match for ${pat} (found: ${match ? match[0] : 'none'})`);
    });
});

// 3. Dynamic Node-based Test of js/lang.js Dictionary & Consistency
console.log('\n--- 3. js/lang.js Translation Dictionary Integrity ---');
const langJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'lang.js'), 'utf8');

// Test that ARTIST_BIOS_CS contains 60 biographies
const csBiosMatch = langJsContent.match(/perf-\d\d/g);
assert(csBiosMatch && csBiosMatch.length >= 60, `js/lang.js defines 60 Czech artist biographies (found: ${csBiosMatch ? new Set(csBiosMatch).size : 0})`);

// Check dictionary key symmetry between 'en' and 'cs'
// Mock browser environment to load lang.js
const mockWindow = {
    location: { search: '', pathname: '/index.html' },
    localStorage: {
        store: {},
        getItem(k) { return this.store[k] || null; },
        setItem(k, v) { this.store[k] = String(v); }
    },
    document: {
        readyState: 'complete',
        documentElement: { lang: 'en' },
        title: '',
        addEventListener: () => {},
        querySelectorAll: () => []
    },
    dispatchEvent: () => true
};

const vm = require('vm');
const context = vm.createContext({
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    location: mockWindow.location,
    URLSearchParams: URLSearchParams,
    console: console,
    CustomEvent: class CustomEvent { constructor(type, detail) { this.type = type; this.detail = detail; } }
});

try {
    vm.runInContext(langJsContent, context);
    const I18N = context.window.FESTIVAL_I18N;
    assert(I18N && I18N.en && I18N.cs, 'FESTIVAL_I18N is properly exposed with en and cs');

    const enKeys = Object.keys(I18N.en);
    const csKeys = Object.keys(I18N.cs);
    assert(enKeys.length > 50, `EN dictionary contains ${enKeys.length} translation keys`);
    assert(csKeys.length > 50, `CS dictionary contains ${csKeys.length} translation keys`);

    // Flag button labels
    assert(I18N.en.lang_label === 'Language', 'EN lang_label is "Language"');
    assert(I18N.cs.lang_label === 'Jazyk', 'CS lang_label is "Jazyk"');
    assert(I18N.en.lang_flag === 'img/1f1ec-1f1e7.svg', 'EN lang_flag is img/1f1ec-1f1e7.svg');
    assert(I18N.cs.lang_flag === 'img/1f1e8-1f1ff.svg', 'CS lang_flag is img/1f1e8-1f1ff.svg');

    // Language toggle function test
    assert(typeof context.window.getFestivalLang === 'function', 'getFestivalLang is exposed');
    assert(typeof context.window.setFestivalLang === 'function', 'setFestivalLang is exposed');
    assert(typeof context.window.toggleFestivalLang === 'function', 'toggleFestivalLang is exposed');

    assert(context.window.getFestivalLang() === 'en', 'Default initial language is "en"');
    const toggled = context.window.toggleFestivalLang();
    assert(toggled === 'cs', 'toggleFestivalLang switches from en to cs');
    assert(context.window.getFestivalLang() === 'cs', 'getFestivalLang returns "cs" after toggle');
    assert(context.window.localStorage.getItem('festival_language') === 'cs', 'Language saved to localStorage as cs');

    const toggledBack = context.window.toggleFestivalLang();
    assert(toggledBack === 'en', 'toggleFestivalLang switches from cs to en');
    assert(context.window.getFestivalLang() === 'en', 'getFestivalLang returns "en" after second toggle');
    // Key symmetry check
    const missingInCs = enKeys.filter(k => !(k in I18N.cs));
    const missingInEn = csKeys.filter(k => !(k in I18N.en));
    assert(missingInCs.length === 0, `All EN keys exist in CS (missing: ${missingInCs.join(', ') || 'none'})`);
    assert(missingInEn.length === 0, `All CS keys exist in EN (missing: ${missingInEn.join(', ') || 'none'})`);

    // Top app bar and nav component verification
    console.log('\n--- 4. Nav Component Top Bar and Drawer Switcher Verification ---');
    const navJsContent = fs.readFileSync(path.join(ROOT_DIR, 'components', 'nav.js'), 'utf8');
    assert(navJsContent.includes('wf-top-bar-left'), 'nav.js defines wf-top-bar-left container in top app bar');
    assert(navJsContent.includes('lang-switch-btn') && navJsContent.includes('lang-flag') && navJsContent.includes('lang-label'), 'nav.js defines flag button with Language/Jazyk label in top bar');
    assert(navJsContent.includes('lang-switch-btn-drawer'), 'nav.js defines drawer flag button');

    // Program timetable headers and empty slots verification
    console.log('\n--- 5. Timetable & Schedule Dynamic Localization Verification ---');
    const scheduleJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'schedule.js'), 'utf8');
    assert(scheduleJsContent.includes('sch-day-title') && scheduleJsContent.includes('sch-day-heading'), 'schedule.js targets both sch-day-title and sch-day-heading');
    assert(scheduleJsContent.includes('sch-header.col-solar') && scheduleJsContent.includes('sch-header.col-lunar'), 'schedule.js targets table headers col-solar and col-lunar');
    assert(scheduleJsContent.includes('updateTimetableLanguage()'), 'schedule.js defines updateTimetableLanguage()');
    assert(scheduleJsContent.includes("languageChanged"), 'schedule.js listens to languageChanged event');

    // Artists dynamic localization verification
    console.log('\n--- 6. Artists Catalog Dynamic Localization Verification ---');
    const artistsJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'artists.js'), 'utf8');
    assert(artistsJsContent.includes('window.ARTIST_BIOS_CS'), 'artists.js connects to window.ARTIST_BIOS_CS');
    assert(artistsJsContent.includes("languageChanged"), 'artists.js listens to languageChanged event');
    assert(artistsJsContent.includes('Zobrazeno') && artistsJsContent.includes('Showing'), 'artists.js dynamically localizes search counter');
} catch (e) {
    assert(false, `VM evaluation of js/lang.js threw error: ${e.message}`);
}

console.log('\n========================================================================');
console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================================================');

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
