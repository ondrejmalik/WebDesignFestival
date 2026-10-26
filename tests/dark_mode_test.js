// tests/dark_mode_test.js - Comprehensive Verification for Dark Mode Switch
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const PAGES = [
    'index.html',
    'program.html',
    'artists.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'artist-detail.html'
];

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
        failed++;
    }
}

console.log('========================================================================');
console.log('TEST SUITE: Dark Mode Switch in Top Navigation Bar');
console.log('========================================================================\n');

// 1. Static HTML & Components Verification
console.log('--- 1. Static Navigation & Page Integration ---');
test('components/nav.html contains #theme-switch-btn in top app bar', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'components', 'nav.html'), 'utf8');
    assert(html.includes('id="theme-switch-btn"'), 'Missing #theme-switch-btn in nav.html');
    assert(html.includes('class="btn-box theme-switch-btn"'), 'Missing theme-switch-btn class in nav.html');
    assert(html.includes('id="theme-switch-btn-drawer"'), 'Missing #theme-switch-btn-drawer in drawer footer');
});

test('components/nav.js defines theme switch in getNavHTML and handles click', () => {
    const js = fs.readFileSync(path.join(ROOT_DIR, 'components', 'nav.js'), 'utf8');
    assert(js.includes('id="theme-switch-btn"'), 'nav.js must generate #theme-switch-btn in top bar');
    assert(js.includes('id="theme-switch-btn-drawer"'), 'nav.js must generate #theme-switch-btn-drawer in drawer');
    assert(js.includes('toggleFestivalTheme'), 'nav.js must bind to toggleFestivalTheme');
    assert(js.includes('themeChanged'), 'nav.js must listen to themeChanged event');
});

PAGES.forEach(page => {
    test(`${page} includes js/theme.js and top bar #theme-switch-btn`, () => {
        const content = fs.readFileSync(path.join(ROOT_DIR, page), 'utf8');
        assert(content.includes('<script src="js/theme.js">') || content.includes('<script src="js/theme.js"'),
            `${page} must include js/theme.js in head`);
        assert(content.includes('id="theme-switch-btn"'),
            `${page} static fallback must contain #theme-switch-btn in top app bar`);
        assert(content.includes('id="theme-switch-btn-drawer"'),
            `${page} drawer fallback must contain #theme-switch-btn-drawer in drawer footer`);
    });
});

// 2. CSS Dark Mode Stylesheet Verification
console.log('\n--- 2. CSS Wireframe Dark Mode Styling ---');
test('wireframe.css defines .theme-switch-btn styles', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');
    assert(css.includes('.theme-switch-btn'), 'wireframe.css must define .theme-switch-btn');
    assert(css.includes('.theme-icon'), 'wireframe.css must define .theme-icon');
});

test('wireframe.css defines comprehensive html.dark-mode wireframe styles including breadcrumbs and widgets', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');
    assert(css.includes('html.dark-mode'), 'wireframe.css must define html.dark-mode styles');
    assert(css.includes('html.dark-mode .wf-box'), 'wireframe.css must define dark mode for .wf-box');
    assert(css.includes('html.dark-mode .wf-breadcrumbs'), 'wireframe.css must define dark mode for .wf-breadcrumbs');
    assert(css.includes('html.dark-mode .col.wf-box-sub'), 'wireframe.css must define dark mode for .col.wf-box-sub (perf-01)');
    assert(css.includes('html.dark-mode .artist-fav-btn'), 'wireframe.css must define dark mode for .artist-fav-btn');
    assert(css.includes('html.dark-mode .walking-step-item'), 'wireframe.css must define dark mode for walking route step divs');
    assert(css.includes('html.dark-mode svg rect[fill="#fff3cd"]'), 'wireframe.css must define dark mode for walking route rect');
    assert(css.includes('html.dark-mode .quick-section-nav'), 'wireframe.css must define dark mode for Quick section navigation');
    assert(css.includes('html.dark-mode .remove-btn'), 'wireframe.css must define muted dark mode for .remove-btn');
    assert(!/html\.dark-mode\s+\.filter-btn\.active\s*\{[^}]*background:\s*#eee/i.test(css),
        'filter-btn.active must be muted and NOT bright white #eee in dark mode');
    assert(css.includes('html.dark-mode .sch-cell.is-favourite'), 'wireframe.css must define dark mode for .is-favourite');
    assert(css.includes('html.dark-mode .alza-drawer'), 'wireframe.css must define dark mode for .alza-drawer');
    assert(css.includes('html.dark-mode .bottom-nav-dock'), 'wireframe.css must define dark mode for .bottom-nav-dock');
});

// 3. Functional Execution & State Engine Verification (VM Simulation)
console.log('\n--- 3. Functional js/theme.js Engine & Persistence ---');
const themeJsContent = fs.readFileSync(path.join(ROOT_DIR, 'js', 'theme.js'), 'utf8');

// Mock DOM Environment
const mockStorage = {};
const mockDocClasses = new Set();
const mockBodyClasses = new Set();
let mockDocDataTheme = 'light';
let mockBodyDataTheme = 'light';

const mockTopBtn = {
    title: '',
    ariaLabel: '',
    currentTheme: '',
    setAttribute(k, v) {
        if (k === 'title') this.title = v;
        if (k === 'aria-label') this.ariaLabel = v;
        if (k === 'data-current-theme') this.currentTheme = v;
    },
    querySelector(sel) {
        if (sel.includes('theme-icon')) return this.iconEl;
        if (sel.includes('theme-label')) return this.labelEl;
        return null;
    },
    iconEl: { textContent: '' },
    labelEl: { textContent: '' },
    onclick: null
};

const mockDrawerBtn = {
    title: '',
    ariaLabel: '',
    currentTheme: '',
    setAttribute(k, v) {
        if (k === 'title') this.title = v;
        if (k === 'aria-label') this.ariaLabel = v;
        if (k === 'data-current-theme') this.currentTheme = v;
    },
    querySelector(sel) {
        if (sel.includes('theme-icon')) return this.iconEl;
        if (sel.includes('theme-label')) return this.labelEl;
        return null;
    },
    iconEl: { textContent: '' },
    labelEl: { textContent: '' },
    onclick: null
};

const mockWindow = {
    localStorage: {
        getItem(k) { return mockStorage[k] || null; },
        setItem(k, v) { mockStorage[k] = String(v); },
        removeItem(k) { delete mockStorage[k]; }
    },
    matchMedia: () => ({ matches: false }),
    addEventListener: () => {},
    dispatchEvent: () => {},
    CustomEvent: function(name, opts) { this.name = name; this.detail = opts ? opts.detail : {}; },
    getFestivalLang: () => 'en'
};

const mockDocument = {
    readyState: 'complete',
    documentElement: {
        classList: {
            add(c) { mockDocClasses.add(c); },
            remove(c) { mockDocClasses.delete(c); },
            contains(c) { return mockDocClasses.has(c); }
        },
        setAttribute(k, v) { if (k === 'data-theme') mockDocDataTheme = v; },
        getAttribute(k) { if (k === 'data-theme') return mockDocDataTheme; return null; }
    },
    body: {
        classList: {
            add(c) { mockBodyClasses.add(c); },
            remove(c) { mockBodyClasses.delete(c); },
            contains(c) { return mockBodyClasses.has(c); }
        },
        setAttribute(k, v) { if (k === 'data-theme') mockBodyDataTheme = v; },
        getAttribute(k) { if (k === 'data-theme') return mockBodyDataTheme; return null; }
    },
    querySelectorAll(sel) {
        if (sel === '.theme-switch-btn') return [mockTopBtn, mockDrawerBtn];
        return [];
    },
    addEventListener: () => {}
};

const context = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    localStorage: mockWindow.localStorage,
    CustomEvent: mockWindow.CustomEvent,
    console
});

vm.runInContext(themeJsContent, context);

test('theme.js exposes global API functions', () => {
    assert(typeof context.window.getFestivalTheme === 'function', 'getFestivalTheme must be exposed');
    assert(typeof context.window.setFestivalTheme === 'function', 'setFestivalTheme must be exposed');
    assert(typeof context.window.toggleFestivalTheme === 'function', 'toggleFestivalTheme must be exposed');
    assert(typeof context.window.updateThemeButtons === 'function', 'updateThemeButtons must be exposed');
});

test('Initial state is light theme when storage is empty', () => {
    assert.strictEqual(context.window.getFestivalTheme(), 'light');
    assert.strictEqual(mockDocClasses.has('dark-mode'), false);
    assert.strictEqual(mockTopBtn.iconEl.textContent, '🌙');
    assert.strictEqual(mockTopBtn.labelEl.textContent, 'Dark');
});

test('toggleFestivalTheme switches from light to dark', () => {
    const next = context.window.toggleFestivalTheme();
    assert.strictEqual(next, 'dark');
    assert.strictEqual(context.window.getFestivalTheme(), 'dark');
    assert.strictEqual(mockStorage['festival_theme'], 'dark');
    assert.strictEqual(mockDocClasses.has('dark-mode'), true);
    assert.strictEqual(mockDocDataTheme, 'dark');
    assert.strictEqual(mockTopBtn.iconEl.textContent, '☀️');
    assert.strictEqual(mockTopBtn.labelEl.textContent, 'Light');
    assert.strictEqual(mockDrawerBtn.iconEl.textContent, '☀️');
    assert.strictEqual(mockDrawerBtn.labelEl.textContent, 'Light');
});

test('toggleFestivalTheme switches from dark to light', () => {
    const next = context.window.toggleFestivalTheme();
    assert.strictEqual(next, 'light');
    assert.strictEqual(context.window.getFestivalTheme(), 'light');
    assert.strictEqual(mockStorage['festival_theme'], 'light');
    assert.strictEqual(mockDocClasses.has('dark-mode'), false);
    assert.strictEqual(mockDocDataTheme, 'light');
    assert.strictEqual(mockTopBtn.iconEl.textContent, '🌙');
    assert.strictEqual(mockTopBtn.labelEl.textContent, 'Dark');
});

test('Localization: Czech language produces Tmavý / Světlý labels', () => {
    mockWindow.getFestivalLang = () => 'cs';
    context.window.updateThemeButtons('light');
    assert.strictEqual(mockTopBtn.labelEl.textContent, 'Tmavý');
    assert.strictEqual(mockTopBtn.title, 'Přepnout na tmavý režim');

    context.window.updateThemeButtons('dark');
    assert.strictEqual(mockTopBtn.labelEl.textContent, 'Světlý');
    assert.strictEqual(mockTopBtn.title, 'Přepnout na světlý režim');
});

console.log('\n========================================================================');
console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================================================');

if (failed > 0) {
    process.exit(1);
}
