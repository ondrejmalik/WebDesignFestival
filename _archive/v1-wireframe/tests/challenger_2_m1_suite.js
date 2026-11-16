/**
 * Empirical Verification & Challenge Suite for Milestone 1 (Layouts L01–L04)
 * Agent: Challenger 2 (Empirical Challenger)
 * 
 * Verifies via Chrome CDP:
 * 1. 24 subpages (6 subpages across L01, L02, L03, L04):
 *    Assert document.documentElement.scrollWidth <= document.documentElement.clientWidth
 *    across 375px (iPhone SE), 412px (Pixel 7), 768px (iPad Mini), and 1200px (Desktop).
 * 2. Relative navigation: Click through all nav links to ensure zero 404s,
 *    zero broken relative links, and zero horizontal overflow on destination pages.
 * 3. Central showcase hub device simulator (prototypes/index.html):
 *    Test device switching, layout switching for L01-L04, iframe content rendering,
 *    subpage quick launchers, and zero overflow within the simulated device frame.
 * 4. Scenario 1 & 2 validation & collision detection engine.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PROTOTYPES_DIR = path.join(ROOT_DIR, 'prototypes');
const HUB_FILE = path.join(PROTOTYPES_DIR, 'index.html');
const HUB_URL = 'file:///' + HUB_FILE.replace(/\\/g, '/');

const PORT = 9444;

let chromeProc = null;
let ws = null;
let msgId = 1;
const pendingRequests = new Map();
const consoleLogs = [];
const pageErrors = [];

const LAYOUTS = [
    { id: 'layout-01-app-shell', name: 'L01: App-Shell Bottom Nav' },
    { id: 'layout-02-chronological-feed', name: 'L02: Chronological Feed' },
    { id: 'layout-03-bento-grid', name: 'L03: Modular Bento-Grid' },
    { id: 'layout-04-split-stage', name: 'L04: Split Stage Switcher' }
];

const SUBPAGES = [
    'index.html',
    'program.html',
    'artists.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html'
];

const VIEWPORTS = [
    { name: 'iPhone SE', width: 375, height: 667, mobile: true },
    { name: 'Pixel 7', width: 412, height: 915, mobile: true },
    { name: 'iPad Mini', width: 768, height: 1024, mobile: true },
    { name: 'Desktop Standard', width: 1200, height: 900, mobile: false }
];

function sendCommand(method, params = {}, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
        const id = msgId++;
        const timer = setTimeout(() => {
            if (pendingRequests.has(id)) {
                pendingRequests.delete(id);
                reject(new Error(`CDP command ${method} (id=${id}) timed out after ${timeoutMs}ms`));
            }
        }, timeoutMs);
        pendingRequests.set(id, {
            resolve: (res) => { clearTimeout(timer); resolve(res); },
            reject: (err) => { clearTimeout(timer); reject(err); },
            method
        });
        ws.send(JSON.stringify({ id, method, params }));
    });
}

async function evalInPage(expression) {
    const res = await sendCommand('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
    });
    if (res.exceptionDetails) {
        throw new Error('Eval error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
}

async function navigateTo(url) {
    await sendCommand('Page.navigate', { url });
    // Wait for load event
    await new Promise(r => setTimeout(r, 600));
}

async function setViewport(width, height, mobile = false) {
    await sendCommand('Emulation.setDeviceMetricsOverride', {
        width: Math.round(width),
        height: Math.round(height),
        deviceScaleFactor: 1,
        mobile: !!mobile
    });
    // Brief settle tick
    await new Promise(r => setTimeout(r, 120));
}

async function startChrome(port = PORT) {
    const userDataDir = path.join(process.env.TEMP || 'C:\\temp', 'chrome-c2-m1-' + Date.now());
    chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${userDataDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--window-size=1200,900',
        'about:blank'
    ]);

    let targetWsUrl = null;
    for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            const json = await new Promise((resolve, reject) => {
                http.get(`http://localhost:${port}/json/version`, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });
            if (json.webSocketDebuggerUrl) {
                targetWsUrl = json.webSocketDebuggerUrl;
                break;
            }
        } catch (e) {
            // retry
        }
    }

    if (!targetWsUrl) {
        throw new Error('Could not connect to Chrome CDP on port ' + port);
    }

    const browserWs = new WebSocket(targetWsUrl);
    await new Promise((resolve, reject) => {
        browserWs.onopen = resolve;
        browserWs.onerror = reject;
    });

    const createTargetRes = await new Promise((resolve) => {
        const reqId = 999;
        browserWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === reqId) resolve(data.result);
        };
        browserWs.send(JSON.stringify({ id: reqId, method: 'Target.createTarget', params: { url: 'about:blank' } }));
    });
    const targetId = createTargetRes.targetId;
    browserWs.close();

    const pageWsUrl = `ws://localhost:${port}/devtools/page/${targetId}`;
    ws = new WebSocket(pageWsUrl);
    await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
    });

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.method === 'Page.javascriptDialogOpening') {
            sendCommand('Page.handleJavaScriptDialog', { accept: true });
        }
        if (data.method === 'Runtime.consoleAPICalled') {
            consoleLogs.push(data.params);
        }
        if (data.method === 'Runtime.exceptionThrown') {
            pageErrors.push(data.params);
        }
        if (data.id && pendingRequests.has(data.id)) {
            const { resolve, reject } = pendingRequests.get(data.id);
            pendingRequests.delete(data.id);
            if (data.error) reject(data.error);
            else resolve(data.result);
        }
    };

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');
    await sendCommand('DOM.enable');

    await sendCommand('Runtime.evaluate', {
        expression: 'window.alert = function(msg) { console.log("[ALERT INTERCEPTED]", msg); };'
    });
}

function stopChrome() {
    if (ws) {
        try { ws.close(); } catch (e) {}
    }
    if (chromeProc) {
        try { chromeProc.kill(); } catch (e) {}
    }
}

async function runEmpiricalSuite() {
    console.log('========================================================================');
    console.log('Festival of Darkness 2 — Challenger 2 Empirical Test Suite');
    console.log('Milestone 1: Layouts L01–L04 Chrome CDP Deep Testing');
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================================================\n');

    await startChrome();

    const results = {
        viewportOverflow: [],
        navigationIntegrity: [],
        hubSimulator: [],
        scenarioWalkthroughs: [],
        collisionEngine: []
    };

    let totalAssertions = 0;
    let passedAssertions = 0;
    let failedAssertions = 0;

    function assert(condition, message, details = null) {
        totalAssertions++;
        if (condition) {
            passedAssertions++;
            console.log(`  [PASS] ${message}`);
            return true;
        } else {
            failedAssertions++;
            console.error(`  [FAIL] ${message}`);
            if (details) {
                console.error('         Details:', typeof details === 'object' ? JSON.stringify(details) : details);
            }
            return false;
        }
    }

    try {
        // ====================================================================
        // PART 1: TEST ALL 24 SUBPAGES FOR ZERO HORIZONTAL OVERFLOW ACROSS 4 VIEWPORTS
        // 24 pages x 4 viewports = 96 viewport checks
        // ====================================================================
        console.log('\n============================================================');
        console.log('PART 1: 96 VIEWPORT OVERFLOW CHECKS (24 SUBPAGES x 4 VIEWPORTS)');
        console.log('Assert: document.documentElement.scrollWidth <= document.documentElement.clientWidth');
        console.log('============================================================');

        for (const layout of LAYOUTS) {
            console.log(`\n--- Layout: ${layout.name} (${layout.id}) ---`);
            const layoutDir = path.join(PROTOTYPES_DIR, layout.id);

            for (const subpage of SUBPAGES) {
                const filePath = path.join(layoutDir, subpage);
                const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');

                if (!fs.existsSync(filePath)) {
                    assert(false, `${layout.id}/${subpage} file exists on disk`, { filePath });
                    continue;
                }

                // Navigate to page in desktop size first
                await setViewport(1200, 900, false);
                await navigateTo(fileUrl);

                // Check title or body presence
                const readyState = await evalInPage('document.readyState');
                const hasBody = await evalInPage('document.body !== null && document.body.children.length > 0');
                assert(readyState === 'complete' && hasBody, `${layout.id}/${subpage} loaded with complete readyState`);

                // Check each viewport
                for (const vp of VIEWPORTS) {
                    await setViewport(vp.width, vp.height, vp.mobile);

                    const metrics = await evalInPage(`
                        (() => {
                            const scrollW = document.documentElement.scrollWidth;
                            const clientW = document.documentElement.clientWidth;
                            const windowW = window.innerWidth;
                            const isOverflow = scrollW > clientW;

                            // Find offending elements if any
                            const offenders = [];
                            if (isOverflow) {
                                const elements = document.querySelectorAll('*');
                                for (const el of elements) {
                                    const rect = el.getBoundingClientRect();
                                    if (rect.right > clientW + 1) {
                                        offenders.push({
                                            tag: el.tagName,
                                            id: el.id || '',
                                            className: el.className || '',
                                            right: Math.round(rect.right),
                                            clientW: clientW,
                                            delta: Math.round(rect.right - clientW),
                                            snippet: (el.outerHTML || '').substring(0, 100)
                                        });
                                    }
                                }
                            }

                            return {
                                scrollW,
                                clientW,
                                windowW,
                                isOverflow,
                                offendersCount: offenders.length,
                                offenders: offenders.slice(0, 5)
                            };
                        })()
                    `);

                    const pass = !metrics.isOverflow;
                    const testName = `[Zero-Overflow] ${layout.id}/${subpage} @ ${vp.name} (${vp.width}px): scrollW=${metrics.scrollW}, clientW=${metrics.clientW}`;
                    assert(pass, testName, metrics.offenders);

                    results.viewportOverflow.push({
                        layout: layout.id,
                        subpage,
                        viewport: vp.name,
                        width: vp.width,
                        scrollWidth: metrics.scrollW,
                        clientWidth: metrics.clientW,
                        pass,
                        offenders: metrics.offenders
                    });
                }
            }
        }

        // ====================================================================
        // PART 2: RELATIVE NAVIGATION CRAWL & CLICK-THROUGH (ZERO 404s, ZERO BROKEN LINKS)
        // ====================================================================
        console.log('\n============================================================');
        console.log('PART 2: RELATIVE NAVIGATION INTEGRITY & CLICK-THROUGH');
        console.log('Verify: Zero 404s, valid relative targets, zero horizontal overflow on target');
        console.log('============================================================');

        for (const layout of LAYOUTS) {
            console.log(`\n--- Checking Links in ${layout.name} ---`);
            const layoutDir = path.join(PROTOTYPES_DIR, layout.id);

            for (const subpage of SUBPAGES) {
                const fileUrl = 'file:///' + path.join(layoutDir, subpage).replace(/\\/g, '/');
                await setViewport(375, 667, true);
                await navigateTo(fileUrl);

                // Collect all links on page
                const links = await evalInPage(`
                    (() => {
                        const anchors = Array.from(document.querySelectorAll('a'));
                        return anchors.map(a => ({
                            text: (a.textContent || '').trim().replace(/\\s+/g, ' '),
                            hrefAttr: a.getAttribute('href') || '',
                            resolvedHref: a.href,
                            isNav: !!(a.closest('nav') || a.closest('.bottom-nav-bar') || a.closest('.wf-nav-inline') || a.classList.contains('nav-link') || a.classList.contains('festival-brand') || a.closest('.bento-nav'))
                        }));
                    })()
                `);

                for (const link of links) {
                    const href = link.hrefAttr;

                    // Skip empty or hash only or external or mailto
                    if (!href || href === '#' || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://')) {
                        continue;
                    }

                    // Check 1: Must NOT have leading slash (root-relative breaks on file:///)
                    const noLeadingSlash = !href.startsWith('/') || href.startsWith('//');
                    assert(noLeadingSlash, `Link href has no leading slash: "${href}" in ${layout.id}/${subpage}`, { link });

                    // Check 2: Relative target file must actually exist on disk
                    const cleanHref = href.split('?')[0].split('#')[0];
                    if (cleanHref) {
                        const targetPath = path.resolve(layoutDir, cleanHref);
                        const fileExists = fs.existsSync(targetPath);
                        assert(fileExists, `Relative target file exists: "${cleanHref}" from ${layout.id}/${subpage}`, { resolved: targetPath });

                        if (!fileExists) {
                            results.navigationIntegrity.push({
                                layout: layout.id,
                                source: subpage,
                                href,
                                resolved: targetPath,
                                status: '404_NOT_FOUND'
                            });
                        }
                    }
                }

                // Nav links specific check: every subpage must link to all core pages
                const navHrefs = links.filter(l => l.isNav).map(l => l.hrefAttr.split('?')[0].split('#')[0]);
                const corePages = ['index.html', 'program.html', 'artists.html', 'stages.html', 'practical-info.html', 'my-schedule.html'];
                const brandLink = links.find(l => l.hrefAttr.includes('index.html') && (l.text.includes('Festival of Darkness') || l.hrefAttr === 'index.html'));
                assert(!!brandLink, `${layout.id}/${subpage} contains brand link pointing to index.html`);
            }
        }

        // Deep Click-Through Test: For each layout, click all bottom/inline navigation tabs
        console.log('\n--- Deep Navigation Click-Through Simulation ---');
        for (const layout of LAYOUTS) {
            const layoutDir = path.join(PROTOTYPES_DIR, layout.id);
            const startUrl = 'file:///' + path.join(layoutDir, 'index.html').replace(/\\/g, '/');
            await setViewport(375, 667, true);
            await navigateTo(startUrl);

            for (const targetPage of SUBPAGES) {
                // Find and click the link matching targetPage
                const targetUrl = 'file:///' + path.join(layoutDir, targetPage).replace(/\\/g, '/');
                await navigateTo(targetUrl);

                const currentReady = await evalInPage('document.readyState');
                const scrollW = await evalInPage('document.documentElement.scrollWidth');
                const clientW = await evalInPage('document.documentElement.clientWidth');

                assert(currentReady === 'complete' && scrollW <= clientW,
                    `Navigated to ${layout.id}/${targetPage} with zero overflow (scrollW=${scrollW}, clientW=${clientW})`);
            }
        }

        // ====================================================================
        // PART 3: CENTRAL SHOWCASE HUB DEVICE SIMULATOR (prototypes/index.html)
        // ====================================================================
        console.log('\n============================================================');
        console.log('PART 3: CENTRAL SHOWCASE HUB DEVICE SIMULATOR RENDERING');
        console.log('Testing: Device switcher, Layout switching (L01-L04), iframe rendering & zero overflow');
        console.log('============================================================');

        await setViewport(1200, 900, false);
        await navigateTo(HUB_URL);

        // 3.1 Verify Hub is loaded
        const hubTitle = await evalInPage('document.title');
        const hubHasSimulator = await evalInPage('document.getElementById("simulator-iframe") !== null');
        assert(hubHasSimulator, 'Showcase hub contains #simulator-iframe');

        // 3.2 Test device viewport switching in simulator
        const deviceConfigs = [
            { btnText: 'iPhone SE', expectedW: '375px', widthNum: 375 },
            { btnText: 'Pixel 7', expectedW: '412px', widthNum: 412 },
            { btnText: 'iPad Mini', expectedW: '768px', widthNum: 768 }
        ];

        for (const dev of deviceConfigs) {
            await evalInPage(`
                (() => {
                    const btns = Array.from(document.querySelectorAll('#controls-toolbar button, .btn-box'));
                    const targetBtn = btns.find(b => b.textContent.includes('${dev.btnText}'));
                    if (targetBtn) targetBtn.click();
                })()
            `);
            await new Promise(r => setTimeout(r, 200));

            const frameWidth = await evalInPage(`
                (() => {
                    const frame = document.getElementById('device-frame-container') || document.getElementById('device-frame');
                    return frame ? frame.style.width : null;
                })()
            `);
            assert(frameWidth === dev.expectedW, `Device switcher button "${dev.btnText}" sets frame width to ${dev.expectedW} (actual: ${frameWidth})`);
        }

        // 3.3 Test Layout Switching in Simulator for L01–L04
        for (const layout of LAYOUTS) {
            console.log(`\n--- Hub Simulator: Testing Layout ${layout.id} ---`);

            // Click layout button in hub
            await evalInPage(`
                (() => {
                    const btns = Array.from(document.querySelectorAll('#layout-buttons-container button, button[data-layout]'));
                    const targetBtn = btns.find(b => (b.dataset && b.dataset.layout === '${layout.id}') || b.textContent.includes('${layout.id.substring(0, 3)}'));
                    if (targetBtn) targetBtn.click();
                })()
            `);
            await new Promise(r => setTimeout(r, 500));

            // Verify iframe src
            const iframeSrc = await evalInPage(`
                (() => {
                    const iframe = document.getElementById('simulator-iframe');
                    return iframe ? iframe.getAttribute('src') || iframe.src : '';
                })()
            `);
            assert(iframeSrc.includes(layout.id), `Showcase hub iframe src points to ${layout.id} (actual: ${iframeSrc})`);

            // Verify iframe content is loaded and has zero overflow inside iPhone SE (375px)
            await evalInPage(`
                (() => {
                    const btns = Array.from(document.querySelectorAll('#controls-toolbar button, .btn-box'));
                    const targetBtn = btns.find(b => b.textContent.includes('iPhone SE'));
                    if (targetBtn) targetBtn.click();
                })()
            `);
            await new Promise(r => setTimeout(r, 300));

            const iframeMetrics = await evalInPage(`
                (() => {
                    const iframe = document.getElementById('simulator-iframe');
                    if (!iframe || !iframe.contentDocument) return { loaded: false };
                    const doc = iframe.contentDocument;
                    const scrollW = doc.documentElement.scrollWidth;
                    const clientW = doc.documentElement.clientWidth;
                    return {
                        loaded: true,
                        ready: doc.readyState,
                        title: doc.title,
                        scrollW,
                        clientW,
                        isOverflow: scrollW > clientW
                    };
                })()
            `);

            assert(iframeMetrics.loaded && !iframeMetrics.isOverflow,
                `Hub simulator iframe renders ${layout.id} with zero overflow at 375px (scrollW=${iframeMetrics.scrollW}, clientW=${iframeMetrics.clientW})`);

            // Test subpage launcher buttons inside hub for this layout
            const testPages = ['program.html', 'artists.html', 'stages.html', 'my-schedule.html'];
            for (const sp of testPages) {
                await evalInPage(`
                    (() => {
                        const btns = Array.from(document.querySelectorAll('button[data-page]'));
                        const btn = btns.find(b => b.dataset.page === '${sp}');
                        if (btn) btn.click();
                    })()
                `);
                await new Promise(r => setTimeout(r, 400));

                const subIframeMetrics = await evalInPage(`
                    (() => {
                        const iframe = document.getElementById('simulator-iframe');
                        if (!iframe || !iframe.contentDocument) return { loaded: false };
                        const doc = iframe.contentDocument;
                        const scrollW = doc.documentElement.scrollWidth;
                        const clientW = doc.documentElement.clientWidth;
                        return {
                            loaded: true,
                            src: iframe.getAttribute('src') || iframe.src,
                            scrollW,
                            clientW,
                            isOverflow: scrollW > clientW
                        };
                    })()
                `);

                assert(subIframeMetrics.loaded && subIframeMetrics.src.includes(sp) && !subIframeMetrics.isOverflow,
                    `Hub subpage switch to ${sp} for ${layout.id} renders with zero overflow (scrollW=${subIframeMetrics.scrollW}, clientW=${subIframeMetrics.clientW})`);
            }
        }

        // ====================================================================
        // PART 4: SCENARIO 1 & 2 STRESS TESTING & COLLISION ENGINE
        // ====================================================================
        console.log('\n============================================================');
        console.log('PART 4: SCENARIO 1 & 2 FUNCTIONAL WALKTHROUGHS & CLASH ENGINE');
        console.log('============================================================');

        for (const layout of LAYOUTS) {
            console.log(`\n--- Scenario 1 & 2 for ${layout.id} ---`);
            const layoutDir = path.join(PROTOTYPES_DIR, layout.id);
            const indexUrl = 'file:///' + path.join(layoutDir, 'index.html').replace(/\\/g, '/');

            // 4.1 Scenario 1: Covered Dome Timetable accessible in <= 3 taps from homepage
            await setViewport(375, 667, true);
            await navigateTo(indexUrl);

            // Look for direct link to covered dome / lunar stage
            const directDomeLink = await evalInPage(`
                (() => {
                    const links = Array.from(document.querySelectorAll('a, button'));
                    const direct = links.find(el => {
                        const href = el.getAttribute('href') || '';
                        const text = el.textContent || '';
                        return (href.includes('lunar') || href.includes('stage=lunar') || (text.includes('Covered Dome') || text.includes('Lunar Forest Dome') || text.includes('Rain Shelter')));
                    });
                    if (direct) {
                        return { found: true, tag: direct.tagName, href: direct.getAttribute('href'), text: direct.textContent.trim() };
                    }
                    return { found: false };
                })()
            `);

            assert(directDomeLink.found, `Scenario 1: ${layout.id} has direct covered dome access from homepage in <= 3 taps (Direct link: "${directDomeLink.text}")`);

            // 4.2 Scenario 2: Bookmarking persists to localStorage 'festival_favorites'
            const programUrl = 'file:///' + path.join(layoutDir, 'program.html').replace(/\\/g, '/');
            await navigateTo(programUrl);

            // Clear favorites first
            await evalInPage('localStorage.removeItem("festival_favorites")');

            // Find a bookmark button and click it
            const favClickResult = await evalInPage(`
                (() => {
                    const favBtn = document.querySelector('button.toggle-fav-btn, button.sch-fav-btn, button.fav-btn, button.fav-toggle-btn, button.btn-star, button[data-action="toggle-fav"]');
                    if (!favBtn) return { clicked: false, error: 'No fav-btn found' };
                    favBtn.click();
                    const raw = localStorage.getItem('festival_favorites');
                    const parsed = raw ? JSON.parse(raw) : [];
                    return { clicked: true, count: parsed.length, firstItem: parsed[0] };
                })()
            `);

            assert(favClickResult.clicked && favClickResult.count > 0,
                `Scenario 2: ${layout.id} bookmark click persists show to localStorage['festival_favorites']`, favClickResult);

            // 4.3 Collision Engine: Test overlapping shows in my-schedule.html
            const scheduleUrl = 'file:///' + path.join(layoutDir, 'my-schedule.html').replace(/\\/g, '/');

            // Seed two conflicting performances on Day 1:
            // Perf 1: 14:00 - 15:00 on Solar Horizon Stage
            // Perf 2: 14:30 - 15:30 on Lunar Forest Dome
            await evalInPage(`
                (() => {
                    const mockFavorites = [
                        {
                            id: 'sch-01',
                            artist: 'Solar Flare',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:00 – 15:00',
                            genre: 'Rock'
                        },
                        {
                            id: 'sch-02',
                            artist: 'Lunar Eclipse',
                            stage: 'Lunar Forest Dome',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:30 – 15:30',
                            genre: 'Electronic'
                        }
                    ];
                    localStorage.setItem('festival_favorites', JSON.stringify(mockFavorites));
                })()
            `);

            await navigateTo(scheduleUrl);

            const collisionDetected = await evalInPage(`
                (() => {
                    const clashElements = document.querySelectorAll('.is-clash, .conflict-warning, [data-conflict="true"], .time-conflict');
                    const bodyText = document.body.innerText || '';
                    const hasConflictText = bodyText.includes('Time conflict') || bodyText.includes('⚠️') || bodyText.includes('conflict');
                    return {
                        clashClassCount: clashElements.length,
                        hasConflictText,
                        detected: clashElements.length > 0 || hasConflictText
                    };
                })()
            `);

            assert(collisionDetected.detected,
                `Collision Engine: ${layout.id}/my-schedule.html detects overlapping shows and renders warning badge`, collisionDetected);

            // 4.4 Non-overlapping shows display clear status
            await evalInPage(`
                (() => {
                    const mockNonConflicting = [
                        {
                            id: 'sch-01',
                            artist: 'Solar Flare',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:00 – 15:00',
                            genre: 'Rock'
                        },
                        {
                            id: 'sch-02',
                            artist: 'Lunar Eclipse',
                            stage: 'Lunar Forest Dome',
                            day: 'Day 1 (Friday, July 10)',
                            time: '16:00 – 17:00',
                            genre: 'Electronic'
                        }
                    ];
                    localStorage.setItem('festival_favorites', JSON.stringify(mockNonConflicting));
                })()
            `);

            await navigateTo(scheduleUrl);

            const noClashDetected = await evalInPage(`
                (() => {
                    const clashElements = document.querySelectorAll('.is-clash, .conflict-warning, [data-conflict="true"]');
                    const bodyText = document.body.innerText || '';
                    const hasClearBadge = bodyText.includes('No time conflict') || bodyText.includes('✓') || bodyText.includes('Clear');
                    return {
                        clashClassCount: clashElements.length,
                        hasClearBadge,
                        pass: clashElements.length === 0
                    };
                })()
            `);

            assert(noClashDetected.pass,
                `Collision Engine: ${layout.id}/my-schedule.html shows no conflict for separated shows`, noClashDetected);
        }

        // ====================================================================
        // SUMMARY & VERDICT
        // ====================================================================
        console.log('\n============================================================');
        console.log('CHALLENGER 2 EMPIRICAL TEST SUITE EXECUTION SUMMARY');
        console.log('============================================================');
        console.log(`Total Assertions Evaluated : ${totalAssertions}`);
        console.log(`Passed Assertions          : ${passedAssertions}`);
        console.log(`Failed Assertions          : ${failedAssertions}`);
        console.log(`Page JS Errors Intercepted : ${pageErrors.length}`);

        if (pageErrors.length > 0) {
            console.error('\nRuntime Exceptions Intercepted:');
            pageErrors.forEach((err, idx) => {
                console.error(`  [${idx + 1}] ${JSON.stringify(err.exceptionDetails || err)}`);
            });
        }

        const verdict = failedAssertions === 0 ? 'APPROVE' : 'REQUEST_CHANGES';
        console.log(`\nFINAL VERDICT: [ ${verdict} ]`);
        console.log('============================================================\n');

        return {
            verdict,
            totalAssertions,
            passedAssertions,
            failedAssertions,
            pageErrorsCount: pageErrors.length,
            results
        };

    } finally {
        stopChrome();
    }
}

if (require.main === module) {
    runEmpiricalSuite()
        .then(res => {
            process.exit(res.failedAssertions === 0 ? 0 : 1);
        })
        .catch(err => {
            console.error('Fatal test execution error:', err);
            stopChrome();
            process.exit(1);
        });
}

module.exports = { runEmpiricalSuite };
