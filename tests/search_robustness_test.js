// tests/search_robustness_test.js - Comprehensive automated test suite for search engine robustness
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('========================================================================');
console.log('TEST SUITE: Search Robustness & Practical Info Search Engine');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;
function assert(condition, message) {
    if (condition) {
        console.log(`  [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  [FAIL] ${message}`);
        failed++;
    }
}

const ROOT_DIR = path.resolve(__dirname, '..');
const searchHtmlPath = path.join(ROOT_DIR, 'search.html');
const searchJsPath = path.join(ROOT_DIR, 'js/search.js');
const langJsPath = path.join(ROOT_DIR, 'js/lang.js');
const artistsHtmlPath = path.join(ROOT_DIR, 'artists.html');
const artistsJsPath = path.join(ROOT_DIR, 'js/artists.js');

assert(fs.existsSync(searchHtmlPath), 'search.html exists');
assert(fs.existsSync(searchJsPath), 'js/search.js exists');

const searchHtml = fs.readFileSync(searchHtmlPath, 'utf8');
const searchJs = fs.readFileSync(searchJsPath, 'utf8');
const langJs = fs.readFileSync(langJsPath, 'utf8');

console.log('\n--- 1. Search Markup & Selectors Verification ---');
assert(searchHtml.includes('id="global-search-input"'), 'search.html contains #global-search-input');
assert(searchHtml.includes('id="search-clear-btn"'), 'search.html contains #search-clear-btn');
assert(searchHtml.includes('id="search-pills"'), 'search.html contains #search-pills');
assert(searchHtml.includes('data-query="info"'), 'search.html contains quick query pill for info');
assert(searchHtml.includes('id="performers-results-container"'), 'search.html contains #performers-results-container');
assert(searchHtml.includes('id="timetable-results-container"'), 'search.html contains #timetable-results-container');
assert(searchHtml.includes('id="info-results-container"'), 'search.html contains #info-results-container');
assert(searchHtml.includes('id="search-empty-msg"'), 'search.html contains #search-empty-msg');

console.log('\n--- 2. Practical Info Data Catalog Coverage ---');
assert(searchJs.includes('info-general'), 'Catalog contains general festival overview info');
assert(searchJs.includes('info-shuttle'), 'Catalog contains shuttle bus info');
assert(searchJs.includes('info-walking'), 'Catalog contains walking route info');
assert(searchJs.includes('info-camping'), 'Catalog contains camping info');
assert(searchJs.includes('info-cashless'), 'Catalog contains cashless info');
assert(searchJs.includes('info-faq'), 'Catalog contains FAQ info');
assert(searchJs.includes('info-first-aid'), 'Catalog contains medical/first aid info');
assert(searchJs.includes('info-contact'), 'Catalog contains infopoint & contact info');
assert(searchJs.includes('info-solar-stage'), 'Catalog contains Solar Horizon Stage info');
assert(searchJs.includes('info-lunar-stage'), 'Catalog contains Lunar Forest Dome info');

console.log('\n--- 3. Functional Search Execution via Node VM ---');
function createMockElement(id, tag = 'div', attrs = {}) {
    return {
        id,
        tagName: tag.toUpperCase(),
        attributes: attrs,
        getAttribute(name) { return this.attributes[name] || null; },
        setAttribute(name, val) { this.attributes[name] = String(val); },
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
        },
        children: [],
        innerHTML: '',
        textContent: '',
        value: attrs.value || '',
        listeners: {},
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener(event, fn) {
            this.listeners[event] = this.listeners[event] || [];
            this.listeners[event].push(fn);
        },
        click() {
            if (this.listeners['click']) {
                this.listeners['click'].forEach(fn => fn({ target: this }));
            }
        },
        focus() {}
    };
}

const mockInput = createMockElement('global-search-input', 'input', { value: 'techno' });
const mockForm = createMockElement('search-form', 'form');
const mockClearBtn = createMockElement('search-clear-btn', 'button');
const mockPillTechno = createMockElement('', 'button', { 'data-query': 'techno' });
const mockPillInfo = createMockElement('', 'button', { 'data-query': 'info' });
const mockQueryText = createMockElement('active-query-text', 'span');
const mockCountSpan = createMockElement('results-count', 'span');
const mockPerfContainer = createMockElement('performers-results-container', 'div');
const mockTimetableContainer = createMockElement('timetable-results-container', 'div');
const mockInfoContainer = createMockElement('info-results-container', 'div');
const mockEmptyMsg = createMockElement('search-empty-msg', 'div');

const mockSecPerf = createMockElement('results-performers', 'section');
const mockSecTime = createMockElement('results-timetable', 'section');
const mockSecInfo = createMockElement('results-info', 'section');

const elementsMap = {
    'global-search-input': mockInput,
    'search-form': mockForm,
    'search-clear-btn': mockClearBtn,
    'active-query-text': mockQueryText,
    'results-count': mockCountSpan,
    'performers-results-container': mockPerfContainer,
    'timetable-results-container': mockTimetableContainer,
    'info-results-container': mockInfoContainer,
    'search-empty-msg': mockEmptyMsg,
    'results-performers': mockSecPerf,
    'results-timetable': mockSecTime,
    'results-info': mockSecInfo
};

const mockWindow = {
    location: { search: '?q=techno', pathname: '/search.html' },
    history: { replaceState: () => {} },
    localStorage: {
        getItem: () => 'en',
        setItem: () => {}
    },
    document: {
        readyState: 'complete',
        getElementById: (id) => elementsMap[id] || null,
        querySelectorAll: (sel) => {
            if (sel === '.search-pill-btn') return [mockPillTechno, mockPillInfo];
            return [];
        },
        addEventListener: () => {}
    },
    addEventListener: () => {},
    dispatchEvent: () => {}
};

const context = vm.createContext({
    window: mockWindow,
    document: mockWindow.document,
    localStorage: mockWindow.localStorage,
    location: mockWindow.location,
    URLSearchParams: URLSearchParams,
    console: console
});

vm.runInContext(searchJs, context);

assert(typeof mockWindow.executeFestivalSearch === 'function', 'executeFestivalSearch is exposed');

// TEST A: Query "info"
mockWindow.executeFestivalSearch('info');
const infoCount = parseInt(mockCountSpan.textContent, 10);
assert(infoCount >= 10, `Query "info" returned ${infoCount} results (expected >= 10)`);
assert(!mockSecInfo.classList.contains('is-hidden'), 'info section is visible for query "info"');
assert(mockSecPerf.classList.contains('is-hidden'), 'performers section is hidden for pure info query');
assert(mockEmptyMsg.classList.contains('is-hidden'), 'emptyMsg is hidden when info matches');
assert(mockInfoContainer.innerHTML.includes('Shuttle Bus') || mockInfoContainer.innerHTML.includes('Kyvadlová doprava'), 'renders shuttle bus card');
assert(mockInfoContainer.innerHTML.includes('Tent Camp') || mockInfoContainer.innerHTML.includes('Stanové'), 'renders camping card');
assert(mockInfoContainer.innerHTML.includes('Cashless'), 'renders cashless card');
assert(mockInfoContainer.innerHTML.includes('FAQ'), 'renders FAQ card');
assert(mockInfoContainer.innerHTML.includes('Medical') || mockInfoContainer.innerHTML.includes('Zdravotní'), 'renders first aid card');

// TEST B: Multi-token query "shuttle bus"
mockWindow.executeFestivalSearch('shuttle bus');
assert(parseInt(mockCountSpan.textContent, 10) >= 1, 'Multi-word "shuttle bus" returns results');
assert(mockInfoContainer.innerHTML.includes('Shuttle Bus'), 'matches shuttle bus card');

// TEST C: Multi-token cross-category "lunar techno"
mockWindow.executeFestivalSearch('lunar techno');
assert(parseInt(mockCountSpan.textContent, 10) >= 1, 'Multi-word "lunar techno" returns matches');

// TEST D: Clear button
mockClearBtn.click();
assert(mockInput.value === '', 'Clicking clear button sets input.value to empty string');
assert(parseInt(mockCountSpan.textContent, 10) >= 60, 'Clearing search restores full catalog');

// TEST E: Unknown query triggers empty state
mockWindow.executeFestivalSearch('totally_unknown_query_xyz_999');
assert(parseInt(mockCountSpan.textContent, 10) === 0, 'Unknown query returns 0 results');
assert(!mockEmptyMsg.classList.contains('is-hidden'), 'emptyMsg is shown on 0 matches');
assert(mockEmptyMsg.innerHTML.includes('search-suggestion-chip'), 'emptyMsg includes suggestion chips');

console.log('\n--- 4. Artist Page Search Bridge Verification ---');
const artistsHtml = fs.readFileSync(artistsHtmlPath, 'utf8');
const artistsJs = fs.readFileSync(artistsJsPath, 'utf8');
assert(artistsHtml.includes('id="artists-empty-msg"'), 'artists.html contains #artists-empty-msg bridge');
assert(artistsHtml.includes('id="bridge-search-link"'), 'artists.html contains #bridge-search-link');
assert(artistsJs.includes('artists-empty-msg'), 'js/artists.js manages #artists-empty-msg');

console.log('\n--- 5. UTF-8 & Zero Inline Styles Validation ---');
const filesToCheck = [searchHtmlPath, searchJsPath, langJsPath, artistsHtmlPath, artistsJsPath];
filesToCheck.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    assert(!content.includes('\uFFFD'), `No UTF-8 corruption in ${path.basename(f)}`);
});
assert(!searchHtml.match(/style\s*=\s*"[^"]*"/), 'search.html has zero inline styles');
assert(!artistsHtml.match(/style\s*=\s*"[^"]*"/), 'artists.html has zero inline styles');

console.log('\n========================================================================');
if (failed === 0) {
    console.log(`TEST SUMMARY: Passed: ${passed} | Failed: 0 (Verdict: APPROVE)`);
} else {
    console.error(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed} (Verdict: REJECT)`);
    process.exit(1);
}
console.log('========================================================================');
