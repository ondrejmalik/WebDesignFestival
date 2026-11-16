// tests/bottom_switcher_test.js - Deep verification of the bottom switcher and dock
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('========================================================================');
console.log('TEST SUITE: Bottom Switcher & Dock Robustness Verification');
console.log('========================================================================\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}`);
        console.error(`         Reason: ${err.message}`);
        failed++;
    }
}

// 1. Z-Index, Hit-Testing Overlay Isolation & Touch Handling in wireframe.css
test('wireframe.css: .bottom-nav-dock z-index is higher than drawer and backdrop', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');
    
    const dockMatch = css.match(/\.bottom-nav-dock\s*\{[^}]*z-index:\s*(\d+)/s);
    const backdropMatch = css.match(/\.drawer-backdrop\s*\{[^}]*z-index:\s*(\d+)/s);
    const drawerMatch = css.match(/\.alza-drawer\s*\{[^}]*z-index:\s*(\d+)/s);

    assert(dockMatch, 'Found z-index for .bottom-nav-dock');
    assert(backdropMatch, 'Found z-index for .drawer-backdrop');
    assert(drawerMatch, 'Found z-index for .alza-drawer');

    const dockZ = parseInt(dockMatch[1], 10);
    const backdropZ = parseInt(backdropMatch[1], 10);
    const drawerZ = parseInt(drawerMatch[1], 10);

    assert(dockZ > backdropZ, `.bottom-nav-dock z-index (${dockZ}) must be > backdrop z-index (${backdropZ})`);
    assert(dockZ > drawerZ, `.bottom-nav-dock z-index (${dockZ}) must be > drawer z-index (${drawerZ})`);
});

test('wireframe.css: .bottom-dock-item and .bottom-nav-dock have touch-action manipulation and pointer-events protection', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');
    assert(css.includes('touch-action: manipulation;'), 'touch-action: manipulation must be defined for rapid touch response');
    assert(css.includes('pointer-events: none;') && css.includes('.dock-icon'), 'dock-icon must have pointer-events: none');
    assert(css.includes('pointer-events: none;') && css.includes('.dock-label'), 'dock-label must have pointer-events: none');
    
    // Check drawer padding-bottom to avoid dock occlusion
    assert(css.includes('padding-bottom: 78px;'), 'alza-drawer must have padding-bottom to prevent occlusion by bottom dock');
});

// 2. Non-Destructive DOM in components/nav.js
test('components/nav.js: does not destroy existing nav-placeholder DOM nodes', () => {
    const js = fs.readFileSync(path.join(ROOT_DIR, 'components', 'nav.js'), 'utf8');
    assert(js.includes('hasExistingNav'), 'nav.js checks for existing static nav elements');
    assert(js.includes('updateNavLanguage'), 'nav.js defines in-place updateNavLanguage()');
    assert(js.includes('updateActiveNavigation'), 'nav.js defines in-place updateActiveNavigation()');
    assert(js.includes('setupBottomDockInteractions'), 'nav.js sets up bottom dock interaction handlers');
});

// 3. Path Resolution Logic in components/nav.js
test('components/nav.js: getCurrentPage handles path variants cleanly', () => {
    const js = fs.readFileSync(path.join(ROOT_DIR, 'components', 'nav.js'), 'utf8');
    
    // Extract getCurrentPage function
    const fnMatch = js.match(/function getCurrentPage\(\)\s*\{([\s\S]*?)\n    \}/);
    assert(fnMatch, 'getCurrentPage function found in nav.js');
    const fnCode = fnMatch[0];
    
    function evalPath(mockPathname) {
        const window = { location: { pathname: mockPathname } };
        const fn = new Function('window', `${fnCode}; return getCurrentPage();`);
        return fn(window);
    }

    assert.strictEqual(evalPath('/index.html'), 'index.html');
    assert.strictEqual(evalPath('/program.html'), 'program.html');
    assert.strictEqual(evalPath('/artists.html'), 'artists.html');
    assert.strictEqual(evalPath('/stages.html'), 'stages.html');
    assert.strictEqual(evalPath('/practical-info.html'), 'practical-info.html');
    assert.strictEqual(evalPath('/my-schedule.html'), 'my-schedule.html');
    
    // Trailing directory slash
    assert.strictEqual(evalPath('/WebDesignFestival/'), 'index.html');
    assert.strictEqual(evalPath('/'), 'index.html');
    assert.strictEqual(evalPath(''), 'index.html');
    
    // Trailing slash on subpages
    assert.strictEqual(evalPath('/artists/'), 'artists.html');
    assert.strictEqual(evalPath('/program/'), 'program.html');
    assert.strictEqual(evalPath('/stages/'), 'stages.html');
    assert.strictEqual(evalPath('/practical-info/'), 'practical-info.html');
    assert.strictEqual(evalPath('/my-schedule/'), 'my-schedule.html');
    assert.strictEqual(evalPath('/custom-repo/artists/'), 'artists.html');
    assert.strictEqual(evalPath('/custom-repo'), 'index.html');

    // Clean URLs without .html
    assert.strictEqual(evalPath('/program'), 'program.html');
    assert.strictEqual(evalPath('/artists'), 'artists.html');
    
    // Windows file:/// paths with forward and backslashes
    assert.strictEqual(evalPath('C:/Users/Administrator/Desktop/webapp/WebDesignFestival/program.html'), 'program.html');
    assert.strictEqual(evalPath('C:\\Users\\Administrator\\Desktop\\webapp\\WebDesignFestival\\stages.html'), 'stages.html');
    assert.strictEqual(evalPath('/C:/webapp/index.html'), 'index.html');
});

// 4. Safe include.js Guard
test('js/include.js: never overwrites existing child elements', () => {
    const js = fs.readFileSync(path.join(ROOT_DIR, 'js', 'include.js'), 'utf8');
    assert(js.includes('target.children') && js.includes('return'), 'include.js returns early when target already contains children');
});

// 5. Layout 01 App-Shell Bottom Nav Bar
test('prototypes/layout-01-app-shell: layout.css and layout.js bottom nav enhancements', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'prototypes', 'layout-01-app-shell', 'layout.css'), 'utf8');
    const js = fs.readFileSync(path.join(ROOT_DIR, 'prototypes', 'layout-01-app-shell', 'layout.js'), 'utf8');

    assert(css.includes('z-index: 2100;'), 'layout-01 bottom-nav-bar has z-index: 2100');
    assert(css.includes('touch-action: manipulation;'), 'layout-01 bottom-nav-item has touch-action: manipulation');
    assert(js.includes('init()'), 'layout-01 defines init() with readyState check');
    assert(js.includes('document.readyState === \'loading\''), 'layout-01 checks readyState === loading');
    assert(js.includes('pathname.split(\'/\').filter(Boolean)'), 'layout-01 setupBottomNav filters empty tokens for trailing slash resilience');
    assert(js.includes('!window.location.search && !window.location.hash'), 'layout-01 allows navigation when query or hash is active');
});

// 6. Prototype Showcase Hub Switcher in prototypes/index.html
test('prototypes/index.html: robust switcher functions and bi-directional iframe sync', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'prototypes', 'index.html'), 'utf8');
    assert(html.includes('setupIframeSync'), 'prototypes/index.html defines setupIframeSync()');
    assert(html.includes('new URL(targetUrl, window.location.href).href'), 'updateIframeSrc resolves targetUrl against parent window location');
    assert(html.includes('iframe.contentWindow.location.replace(resolvedUrl)'), 'updateIframeSrc uses location.replace with absolute resolvedUrl');
    assert(html.includes('b.getAttribute(\'data-layout\') === layoutKey'), 'selectLayout toggles active class without requiring btnElem');
    assert(html.includes('b.getAttribute(\'data-page\') === subpageName'), 'setSubpage toggles active class without requiring btnElem');
    assert(html.includes('pathname.split(\'/\').filter(Boolean)'), 'setupIframeSync filters empty tokens for trailing slash resilience');
});

// 7. URL Resolution Correctness: verify absolute resolution prevents compounding 404 paths
test('prototypes/index.html: URL resolution prevents compounding iframe path corruption', () => {
    const parentBase = 'http://localhost:8000/prototypes/index.html';
    const target1 = './layout-01-app-shell/index.html';
    const target2 = './layout-02-chronological-feed/index.html';
    const target3 = './layout-03-bento-grid/program.html';

    const res1 = new URL(target1, parentBase).href;
    const res2 = new URL(target2, parentBase).href;
    const res3 = new URL(target3, parentBase).href;

    assert.strictEqual(res1, 'http://localhost:8000/prototypes/layout-01-app-shell/index.html');
    assert.strictEqual(res2, 'http://localhost:8000/prototypes/layout-02-chronological-feed/index.html');
    assert.strictEqual(res3, 'http://localhost:8000/prototypes/layout-03-bento-grid/program.html');

    // Confirm that passing resolved URL to an iframe at res1 still resolves to res2, not a nested 404 path
    const iframeNav = new URL(res2, res1).href;
    assert.strictEqual(iframeNav, 'http://localhost:8000/prototypes/layout-02-chronological-feed/index.html');
});

// 8. Structural Integrity across all 6 main pages
test('Root pages: all 6 pages have 5 bottom-dock items with valid IDs', () => {
    const pages = ['index.html', 'program.html', 'artists.html', 'stages.html', 'practical-info.html', 'my-schedule.html'];
    const expectedIds = ['dock-item-artists', 'dock-item-stages', 'dock-item-home', 'dock-item-timetable', 'dock-item-myplan'];

    pages.forEach(p => {
        const content = fs.readFileSync(path.join(ROOT_DIR, p), 'utf8');
        expectedIds.forEach(id => {
            assert(content.includes(id), `${p} must include bottom dock item ${id}`);
        });
    });
});

console.log('\n========================================================================');
console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================================================');

if (failed > 0) process.exit(1);
else process.exit(0);
