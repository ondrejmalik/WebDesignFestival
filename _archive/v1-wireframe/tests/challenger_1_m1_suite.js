/**
 * Milestone 1 (Layouts L01–L04): Empirical Stress & Verification Suite
 * Authored by Challenger 1 (EMPIRICAL CHALLENGER)
 *
 * Direct execution against real headless Google Chrome via CDP (Chrome DevTools Protocol).
 * Zero mocks. Full browser DOM lifecycle, touch/click events, localStorage mutations,
 * URL routing, and computed layout styles verified empirically.
 */

const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTTP_PORT = 8999;
const CDP_PORT = 9225;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

// Embedded static HTTP server with no-cache headers
function startServer() {
    return new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const parsedUrl = new URL(req.url, `http://127.0.0.1:${HTTP_PORT}`);
            let filePath = path.join(ROOT_DIR, decodeURIComponent(parsedUrl.pathname));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }

            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentType = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            });
            fs.createReadStream(filePath).pipe(res);
        });

        server.listen(HTTP_PORT, '127.0.0.1', () => {
            resolve(server);
        });
    });
}

// Lightweight CDP client using Node 22 native WebSocket
class ChromeSession {
    constructor(wsUrl) {
        this.ws = new WebSocket(wsUrl);
        this.id = 1;
        this.pending = new Map();
        this.ready = new Promise((resolve, reject) => {
            this.ws.onopen = () => resolve();
            this.ws.onerror = (err) => reject(err);
        });

        this.ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.id && this.pending.has(msg.id)) {
                    const { resolve, reject } = this.pending.get(msg.id);
                    this.pending.delete(msg.id);
                    if (msg.error) {
                        reject(new Error(msg.error.message || JSON.stringify(msg.error)));
                    } else {
                        resolve(msg.result);
                    }
                }
            } catch (e) {
                console.error('Error parsing CDP message:', e);
            }
        };
    }

    async send(method, params = {}) {
        await this.ready;
        return new Promise((resolve, reject) => {
            const reqId = this.id++;
            this.pending.set(reqId, { resolve, reject });
            this.ws.send(JSON.stringify({ id: reqId, method, params }));
        });
    }

    async navigate(url) {
        await this.send('Page.navigate', { url });
        await new Promise(r => setTimeout(r, 400));
    }

    async evaluate(expression) {
        const res = await this.send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.exceptionDetails) {
            const desc = res.exceptionDetails.exception ? res.exceptionDetails.exception.description : res.exceptionDetails.text;
            throw new Error(`Evaluation Error: ${desc}`);
        }
        return res.result ? res.result.value : undefined;
    }

    close() {
        try {
            this.ws.close();
        } catch (e) {}
    }
}

// Test Runner Infrastructure
let passedTests = 0;
let failedTests = 0;
const testDetails = [];

async function test(name, fn) {
    try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passedTests++;
        testDetails.push({ name, status: 'PASS' });
    } catch (err) {
        console.error(`  [FAIL] ${name}`);
        console.error(`         Error: ${err.message}`);
        failedTests++;
        testDetails.push({ name, status: 'FAIL', error: err.message });
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

assert.strictEqual = function(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
};

assert.ok = assert;

async function runEmpiricalSuite() {
    console.log('========================================================================');
    console.log('CHALLENGER 1: EMPIRICAL HARNESS & STRESS TEST SUITE (MILESTONE 1)');
    console.log('Targets: L01 (App-Shell), L02 (Chrono Feed), L03 (Bento-Grid), L04 (Split Stage)');
    console.log('Engine: Headless Google Chrome over Chrome DevTools Protocol (CDP)');
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================================================================\n');

    // 1. Launch HTTP Server
    const server = await startServer();
    console.log(`Local testbed HTTP server running at http://127.0.0.1:${HTTP_PORT}`);

    // 2. Spawn Chrome
    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${CDP_PORT}`,
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-sync'
    ]);

    // Wait for CDP port
    let cdpReady = false;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 200));
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(`http://127.0.0.1:${CDP_PORT}/json/version`, res => {
                    res.resume();
                    resolve();
                });
                req.on('error', reject);
            });
            cdpReady = true;
            break;
        } catch (e) {}
    }

    if (!cdpReady) {
        chromeProc.kill();
        server.close();
        throw new Error(`Failed to connect to Chrome CDP on port ${CDP_PORT}`);
    }

    // Create target page via PUT
    const pageTarget = await new Promise((resolve, reject) => {
        const req = http.request(`http://127.0.0.1:${CDP_PORT}/json/new?http://127.0.0.1:${HTTP_PORT}/prototypes/index.html`, { method: 'PUT' }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });

    const session = new ChromeSession(pageTarget.webSocketDebuggerUrl);
    await session.send('Page.enable');
    await session.send('DOM.enable');
    await session.send('Runtime.enable');

    const LAYOUTS = [
        { id: 'layout-01-app-shell', name: 'L01 (App-Shell Bottom Nav)' },
        { id: 'layout-02-chronological-feed', name: 'L02 (Chronological Feed)' },
        { id: 'layout-03-bento-grid', name: 'L03 (Modular Bento-Grid)' },
        { id: 'layout-04-split-stage', name: 'L04 (Split Stage Switcher)' }
    ];

    try {
        // =====================================================================
        // SECTION 1: SCENARIO 1 (COVERED DOME ACCESS <= 3 TAPS)
        // =====================================================================
        console.log('------------------------------------------------------------------------');
        console.log('SECTION 1: Scenario 1 (Covered Dome Access <= 3 Taps from index.html)');
        console.log('------------------------------------------------------------------------');

        // Universal helper expression to inspect visible schedule cards
        const getVisibleCardsExpression = `
            (() => {
                const candidates = Array.from(document.querySelectorAll('article.sch-item, article.feed-item, article.sch-event, div.sch-cell'));
                const visible = candidates.filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                const allLunar = visible.length > 0 && visible.every(el => {
                    const t = (el.innerText + ' ' + (el.getAttribute('data-stage') || '') + ' ' + (el.getAttribute('data-stage-id') || '')).toLowerCase();
                    return t.includes('lunar') || t.includes('covered') || t.includes('dome');
                });
                return { count: visible.length, allLunar };
            })()
        `;

        for (const layout of LAYOUTS) {
            const baseDir = `http://127.0.0.1:${HTTP_PORT}/prototypes/${layout.id}`;

            // 1.1 Path A: Direct Shortcut from Homepage (1 Tap)
            await test(`[TC-S1-01] ${layout.name} - Path A: Direct Homepage Shortcut takes exactly 1 tap to covered dome`, async () => {
                await session.navigate(`${baseDir}/index.html`);

                // Find candidate link on index.html pointing to covered dome timetable
                const shortcutSelector = await session.evaluate(`
                    (() => {
                        const links = Array.from(document.querySelectorAll('a'));
                        const direct = links.find(a => {
                            const href = a.getAttribute('href') || '';
                            const text = (a.innerText || '').toLowerCase();
                            return (href.includes('stage=lunar') || href.includes('#stage-lunar') || href.includes('stages.html#stage-lunar')) &&
                                   (text.includes('covered') || text.includes('dome') || text.includes('shelter') || text.includes('lunar'));
                        });
                        return direct ? (direct.id ? '#' + direct.id : 'a[href="' + direct.getAttribute('href') + '"]') : null;
                    })()
                `);

                assert.ok(shortcutSelector, `Direct shortcut link to covered dome must exist on ${layout.id}/index.html`);

                // Click shortcut (Tap 1)
                const tapCount = 1;
                await session.evaluate(`document.querySelector('${shortcutSelector}').click()`);
                await new Promise(r => setTimeout(r, 400));

                const currentUrl = await session.evaluate(`window.location.href`);
                assert.ok(currentUrl.includes('program.html') || currentUrl.includes('stages.html'), `Shortcut must navigate to program or stages, got ${currentUrl}`);

                // If on program.html, verify that the schedule is rendered and filtered to Lunar stage acts
                if (currentUrl.includes('program.html')) {
                    const stageResult = await session.evaluate(getVisibleCardsExpression);
                    assert.strictEqual(stageResult.allLunar, true, `All displayed timetable items must belong to Lunar Forest Dome`);
                    assert.strictEqual(stageResult.count, 30, `Exactly 30 Lunar Forest Dome items must be displayed (got ${stageResult.count})`);
                }
                assert.ok(tapCount <= 3, `Tap count must be <= 3 (was ${tapCount})`);
            });

            // 1.2 Path B: Nav [ Program / Timetable ] -> Stage Filter [ Lunar Dome ] (2 Taps)
            await test(`[TC-S1-02] ${layout.name} - Path B: Nav Program -> Stage Filter takes exactly 2 taps`, async () => {
                await session.navigate(`${baseDir}/index.html`);
                let tapCount = 0;

                // Tap 1: Click Program/Timetable nav link
                const navClicked = await session.evaluate(`
                    (() => {
                        const links = Array.from(document.querySelectorAll('nav a, header a, .bottom-nav-item'));
                        const progLink = links.find(a => {
                            const href = a.getAttribute('href') || '';
                            const t = a.innerText.toLowerCase();
                            return href.includes('program.html') || t.includes('program') || t.includes('timetable');
                        });
                        if (progLink) {
                            progLink.click();
                            return true;
                        }
                        return false;
                    })()
                `);
                assert.ok(navClicked, `Must be able to tap Program/Timetable link in navigation`);
                tapCount++;
                await new Promise(r => setTimeout(r, 400));

                const urlAfterNav = await session.evaluate(`window.location.href`);
                assert.ok(urlAfterNav.includes('program.html'), `Tap 1 must navigate to program.html, got ${urlAfterNav}`);

                // Tap 2: Click Lunar Stage Filter
                const filterClicked = await session.evaluate(`
                    (() => {
                        const buttons = Array.from(document.querySelectorAll('button, .filter-btn, [data-filter-stage], [data-stage-switch], .stage-switch-btn'));
                        const lunarBtn = buttons.find(b => {
                            const stageAttr = b.getAttribute('data-filter-stage') || b.getAttribute('data-stage-switch') || '';
                            const t = b.innerText.toLowerCase();
                            return stageAttr === 'lunar' || (t.includes('lunar') && (t.includes('dome') || t.includes('covered')));
                        });
                        if (lunarBtn) {
                            lunarBtn.click();
                            return true;
                        }
                        return false;
                    })()
                `);
                assert.ok(filterClicked, `Must be able to tap Lunar Forest Dome filter button on program.html`);
                tapCount++;
                await new Promise(r => setTimeout(r, 300));

                const filterResult = await session.evaluate(getVisibleCardsExpression);
                assert.strictEqual(filterResult.allLunar, true, `All items displayed after Tap 2 filter must be Lunar Forest Dome`);
                assert.strictEqual(filterResult.count, 30, `Exactly 30 Lunar Forest Dome items must be displayed (got ${filterResult.count})`);
                assert.ok(tapCount <= 3, `Tap count must be <= 3 (was ${tapCount})`);
            });

            // 1.3 Path C: Nav [ Stages ] -> [ View Covered Dome Timetable ] (2 Taps)
            await test(`[TC-S1-03] ${layout.name} - Path C: Nav Stages -> Covered Dome Timetable takes exactly 2 taps`, async () => {
                await session.navigate(`${baseDir}/index.html`);
                let tapCount = 0;

                // Tap 1: Click Stages nav link
                const stagesClicked = await session.evaluate(`
                    (() => {
                        const links = Array.from(document.querySelectorAll('nav a, header a, .bottom-nav-item'));
                        const stgLink = links.find(a => {
                            const href = a.getAttribute('href') || '';
                            const t = a.innerText.toLowerCase();
                            return href.includes('stages.html') || t.includes('stages');
                        });
                        if (stgLink) {
                            stgLink.click();
                            return true;
                        }
                        return false;
                    })()
                `);
                assert.ok(stagesClicked, `Must be able to tap Stages link in navigation`);
                tapCount++;
                await new Promise(r => setTimeout(r, 400));

                const urlAfterStages = await session.evaluate(`window.location.href`);
                assert.ok(urlAfterStages.includes('stages.html'), `Tap 1 must navigate to stages.html`);

                // Tap 2: Click Covered Dome Timetable link
                const domeLink = await session.evaluate(`
                    (() => {
                        const links = Array.from(document.querySelectorAll('a'));
                        const link = links.find(a => {
                            const href = a.getAttribute('href') || '';
                            const t = a.innerText.toLowerCase();
                            return (href.includes('program.html?stage=lunar') || href.includes('program.html#stage-lunar')) &&
                                   (t.includes('timetable') || t.includes('program') || t.includes('covered') || t.includes('lunar'));
                        });
                        if (link) {
                            link.click();
                            return true;
                        }
                        return false;
                    })()
                `);
                assert.ok(domeLink, `Stages page must offer direct covered dome timetable link`);
                tapCount++;
                await new Promise(r => setTimeout(r, 400));

                const finalUrl = await session.evaluate(`window.location.href`);
                assert.ok(finalUrl.includes('program.html'), `Tap 2 must land on program.html`);

                const lunarResult = await session.evaluate(getVisibleCardsExpression);
                assert.strictEqual(lunarResult.count, 30, `Covered dome timetable from Stages must display exactly 30 Lunar performances`);
                assert.strictEqual(lunarResult.allLunar, true, `All items displayed must be Lunar Dome acts`);
                assert.ok(tapCount <= 3, `Tap count must be <= 3 (was ${tapCount})`);
            });
        }

        // =====================================================================
        // SECTION 2: SCENARIO 2 (SHARED FAVORITES & REAL-TIME HIGHLIGHT)
        // =====================================================================
        console.log('\n------------------------------------------------------------------------');
        console.log('SECTION 2: Scenario 2 (Shared Favorites & Real-time Star/Highlight Sync)');
        console.log('------------------------------------------------------------------------');

        for (const layout of LAYOUTS) {
            const baseDir = `http://127.0.0.1:${HTTP_PORT}/prototypes/${layout.id}`;

            await test(`[TC-S2-01] ${layout.name} - Toggling bookmark updates localStorage['festival_favorites'] schema`, async () => {
                await session.navigate(`${baseDir}/program.html`);
                await session.evaluate(`localStorage.removeItem('festival_favorites')`);
                await session.evaluate(`window.location.reload()`);
                await new Promise(r => setTimeout(r, 400));

                // Find first bookmark button
                const toggleResult = await session.evaluate(`
                    (() => {
                        const btn = document.querySelector('.btn-star, [data-action="toggle-fav"], .toggle-fav-btn, .sch-fav-btn, .fav-btn');
                        if (!btn) return { error: 'Bookmark button not found' };
                        btn.click();
                        const raw = localStorage.getItem('festival_favorites');
                        const parsed = raw ? JSON.parse(raw) : [];
                        return { parsed };
                    })()
                `);

                assert.ok(toggleResult.parsed && toggleResult.parsed.length === 1, `localStorage['festival_favorites'] must contain exactly 1 item after bookmark click`);
                const fav = toggleResult.parsed[0];
                assert.ok(fav.id, `Favorite object must have 'id'`);
                assert.ok(fav.artist, `Favorite object must have 'artist'`);
                assert.ok(fav.stage, `Favorite object must have 'stage'`);
                assert.ok(fav.day, `Favorite object must have 'day'`);
                assert.ok(fav.time, `Favorite object must have 'time'`);
                assert.ok(fav.genre, `Favorite object must have 'genre'`);
            });

            await test(`[TC-S2-02] ${layout.name} - Instant UI highlight synchronization (.is-favourite, #d4edda, #28a745, ★)`, async () => {
                // Check DOM state of the card that was favorited
                const uiState = await session.evaluate(`
                    (() => {
                        const favItem = document.querySelector('.is-favourite');
                        if (!favItem) return { error: '.is-favourite class missing on card' };
                        const style = window.getComputedStyle(favItem);
                        const btn = favItem.querySelector('.btn-star, [data-action="toggle-fav"], .toggle-fav-btn, .sch-fav-btn, .fav-btn');
                        const btnText = btn ? btn.innerText : '';
                        return {
                            hasFavClass: true,
                            bgColor: style.backgroundColor,
                            borderWidth: style.borderTopWidth,
                            borderColor: style.borderTopColor,
                            btnText
                        };
                    })()
                `);

                assert.strictEqual(uiState.hasFavClass, true, `Favorited card must receive class '.is-favourite'`);
                // Check green background (#d4edda = rgb(212, 237, 218))
                assert.strictEqual(uiState.bgColor, 'rgb(212, 237, 218)', `Favorited card background must be #d4edda`);
                // Check green border (#28a745 = rgb(40, 167, 69))
                assert.strictEqual(uiState.borderColor, 'rgb(40, 167, 69)', `Favorited card border must be #28a745`);
                assert.ok(uiState.btnText.includes('★'), `Bookmark button text must show filled star ★`);
            });

            await test(`[TC-S2-03] ${layout.name} - Untoggling bookmark restores normal styling and clears localStorage`, async () => {
                const untoggleResult = await session.evaluate(`
                    (() => {
                        const favItem = document.querySelector('.is-favourite');
                        if (!favItem) return { error: 'favItem not found' };
                        const btn = favItem.querySelector('.btn-star, [data-action="toggle-fav"], .toggle-fav-btn, .sch-fav-btn, .fav-btn');
                        if (!btn) return { error: 'btn not found' };
                        btn.click();
                        const raw = localStorage.getItem('festival_favorites');
                        const parsed = raw ? JSON.parse(raw) : [];
                        const remainingFavsInDom = document.querySelectorAll('.is-favourite').length;
                        return { count: parsed.length, remainingFavsInDom };
                    })()
                `);

                assert.strictEqual(untoggleResult.count, 0, `localStorage must have 0 items after un-bookmarking`);
                assert.strictEqual(untoggleResult.remainingFavsInDom, 0, `All .is-favourite classes must be removed from document`);
            });
        }

        // 2.4 Cross-layout shared state persistence
        await test(`[TC-S2-04] Cross-Layout State Persistence across all 4 layouts via shared localStorage`, async () => {
            // Seed favorite in L01
            await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/layout-01-app-shell/program.html`);
            await session.evaluate(`
                (() => {
                    const sample = [{
                        id: 'perf-01',
                        artist: 'Echoes of Light',
                        stage: 'Solar Horizon Stage',
                        day: 'Day 1 (Friday, July 10)',
                        time: '14:00 – 14:45',
                        genre: 'Post-Rock / Ambient'
                    }];
                    localStorage.setItem('festival_favorites', JSON.stringify(sample));
                })()
            `);

            // Verify all 4 layouts reflect this favorite immediately
            for (const other of ['layout-01-app-shell', 'layout-02-chronological-feed', 'layout-03-bento-grid', 'layout-04-split-stage']) {
                await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/${other}/program.html`);
                const hasFav = await session.evaluate(`
                    (() => {
                        const el = document.querySelector('[data-perf-id="perf-01"], [data-id="perf-01"], #sch-sch-01, #sch-01');
                        return el ? el.classList.contains('is-favourite') : false;
                    })()
                `);
                assert.strictEqual(hasFav, true, `${other} must show .is-favourite for perf-01 saved in shared localStorage`);
            }
        });

        // =====================================================================
        // SECTION 3: SCENARIO 2 (MY-SCHEDULE CONFLICT ENGINE & STATUS BADGES)
        // =====================================================================
        console.log('\n------------------------------------------------------------------------');
        console.log('SECTION 3: Scenario 2 (my-schedule.html Conflict Engine & Badges)');
        console.log('------------------------------------------------------------------------');

        for (const layout of LAYOUTS) {
            const baseDir = `http://127.0.0.1:${HTTP_PORT}/prototypes/${layout.id}`;

            await test(`[TC-S2-05] ${layout.name} - Overlapping shows (perf-02 + perf-11 on Day 1) trigger red conflict box (#b71c1c, #ffebee)`, async () => {
                // Inject perf-02 (Solar, 15:00-15:45) + perf-11 (Lunar, 15:00-15:50) + perf-01 (Solar, 14:00-14:45, non-overlapping)
                await session.navigate(`${baseDir}/my-schedule.html`);
                await session.evaluate(`
                    (() => {
                        const testLineup = [
                            {
                                id: 'perf-01',
                                artist: 'Echoes of Light',
                                stage: 'Solar Horizon Stage',
                                day: 'Day 1 (Friday, July 10)',
                                time: '14:00 – 14:45',
                                genre: 'Post-Rock / Ambient'
                            },
                            {
                                id: 'perf-02',
                                artist: 'Velvet Morning',
                                stage: 'Solar Horizon Stage',
                                day: 'Day 1 (Friday, July 10)',
                                time: '15:00 – 15:45',
                                genre: 'Dream Pop'
                            },
                            {
                                id: 'perf-11',
                                artist: 'Subtle Resonances',
                                stage: 'Lunar Forest Dome',
                                day: 'Day 1 (Friday, July 10)',
                                time: '15:00 – 15:50',
                                genre: 'Modular Ambient'
                            }
                        ];
                        localStorage.setItem('festival_favorites', JSON.stringify(testLineup));
                    })()
                `);
                await session.evaluate(`window.location.reload()`);
                await new Promise(r => setTimeout(r, 450));

                const conflictCheck = await session.evaluate(`
                    (() => {
                        const articles = Array.from(document.querySelectorAll('article, .wf-box-sub, .feed-item, .bento-card'));
                        // Find cards by identifying their specific title/header to avoid matching clash warning badges
                        const card02 = articles.find(a => {
                            const header = a.querySelector('h3, h4, .feed-item-title, .sch-artist-name');
                            return header && header.innerText.includes('Velvet Morning');
                        });
                        const card11 = articles.find(a => {
                            const header = a.querySelector('h3, h4, .feed-item-title, .sch-artist-name');
                            return header && header.innerText.includes('Subtle Resonances');
                        });
                        const card01 = articles.find(a => {
                            const header = a.querySelector('h3, h4, .feed-item-title, .sch-artist-name');
                            return header && header.innerText.includes('Echoes of Light');
                        });

                        function inspectCard(card) {
                            if (!card) return null;
                            const style = window.getComputedStyle(card);
                            return {
                                text: card.innerText,
                                bgColor: style.backgroundColor,
                                borderColor: style.borderTopColor,
                                borderWidth: style.borderTopWidth
                            };
                        }

                        return {
                            c02: inspectCard(card02),
                            c11: inspectCard(card11),
                            c01: inspectCard(card01)
                        };
                    })()
                `);

                assert.ok(conflictCheck.c02, `Card for perf-02 must be rendered`);
                assert.ok(conflictCheck.c11, `Card for perf-11 must be rendered`);
                assert.ok(conflictCheck.c01, `Card for perf-01 must be rendered`);

                // Assert red conflict styling on perf-02: background #ffebee (rgb(255, 235, 238)), border #b71c1c (rgb(183, 28, 28))
                assert.strictEqual(conflictCheck.c02.bgColor, 'rgb(255, 235, 238)', `perf-02 background must be #ffebee`);
                assert.strictEqual(conflictCheck.c02.borderColor, 'rgb(183, 28, 28)', `perf-02 border color must be #b71c1c`);
                assert.strictEqual(conflictCheck.c02.borderWidth, '2px', `perf-02 border width must be 2px`);
                assert.ok(conflictCheck.c02.text.includes('⚠️ Time conflict with:'), `perf-02 must display conflict warning badge '[ ⚠️ Time conflict with: ... ]'`);

                // Assert red conflict styling on perf-11:
                assert.strictEqual(conflictCheck.c11.bgColor, 'rgb(255, 235, 238)', `perf-11 background must be #ffebee`);
                assert.strictEqual(conflictCheck.c11.borderColor, 'rgb(183, 28, 28)', `perf-11 border color must be #b71c1c`);
                assert.strictEqual(conflictCheck.c11.borderWidth, '2px', `perf-11 border width must be 2px`);
                assert.ok(conflictCheck.c11.text.includes('⚠️ Time conflict with:'), `perf-11 must display conflict warning badge '[ ⚠️ Time conflict with: ... ]'`);

                // Assert clear status badge on non-overlapping perf-01:
                assert.ok(conflictCheck.c01.text.includes('✓ No time conflict'), `perf-01 must display clear status badge '[ ✓ No time conflict ]'`);
                assert.strictEqual(conflictCheck.c01.bgColor, 'rgb(250, 250, 250)', `perf-01 background must be standard #fafafa (not red)`);
            });

            // 3.2 Dynamic resolution upon removing one overlapping show
            await test(`[TC-S2-06] ${layout.name} - Removing perf-11 dynamically resolves conflict on perf-02 to clean badge`, async () => {
                const removeResult = await session.evaluate(`
                    (() => {
                        const btn11 = document.querySelector('button[data-id="perf-11"], [data-action="remove-fav"][data-id="perf-11"], .remove-fav-btn[data-id="perf-11"], .remove-show-btn[data-id="perf-11"]');
                        if (!btn11) return { error: 'remove button for perf-11 not found' };
                        btn11.click();
                        return { clicked: true };
                    })()
                `);
                assert.ok(removeResult.clicked, `Remove button on perf-11 must be clicked`);
                await new Promise(r => setTimeout(r, 350));

                const remainingState = await session.evaluate(`
                    (() => {
                        const articles = Array.from(document.querySelectorAll('article, .wf-box-sub, .feed-item, .bento-card'));
                        const card02 = articles.find(a => {
                            const header = a.querySelector('h3, h4, .feed-item-title, .sch-artist-name');
                            return header && header.innerText.includes('Velvet Morning');
                        });
                        if (!card02) return null;
                        const style = window.getComputedStyle(card02);
                        return {
                            text: card02.innerText,
                            bgColor: style.backgroundColor,
                            borderColor: style.borderTopColor
                        };
                    })()
                `);

                assert.ok(remainingState, `perf-02 card must still exist`);
                assert.ok(remainingState.text.includes('✓ No time conflict'), `perf-02 must now display '[ ✓ No time conflict ]'`);
                assert.strictEqual(remainingState.bgColor, 'rgb(250, 250, 250)', `perf-02 background must return to #fafafa`);
            });
        }

        // =====================================================================
        // SECTION 4: ADVERSARIAL CHALLENGES & EDGE CASE STRESS-TESTS
        // =====================================================================
        console.log('\n------------------------------------------------------------------------');
        console.log('SECTION 4: Adversarial Stress-Tests & Boundary Conditions');
        console.log('------------------------------------------------------------------------');

        // Adversarial Test 1: Overnight past-midnight interval crossover on different stages
        // Show A on Solar: 23:30 – 00:45 (perf-09)
        // Show B on Lunar: 00:05 – 01:25 (perf-17: Analog Void)
        // 00:05 is within 23:30 to 00:45. This MUST trigger a conflict!
        await test(`[TC-ADV-01] Overnight crossover conflict detection (23:30–00:45 vs 00:05–01:25)`, async () => {
            await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/layout-01-app-shell/my-schedule.html`);
            await session.evaluate(`
                (() => {
                    const overnightLineup = [
                        {
                            id: 'perf-09',
                            artist: 'Starlight Odyssey',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '23:30 – 00:45',
                            genre: 'Electronic Indie'
                        },
                        {
                            id: 'perf-17',
                            artist: 'Analog Void',
                            stage: 'Lunar Forest Dome',
                            day: 'Day 1 (Friday, July 10)',
                            time: '00:05 – 01:25',
                            genre: 'Dark Techno / Acid'
                        }
                    ];
                    localStorage.setItem('festival_favorites', JSON.stringify(overnightLineup));
                })()
            `);
            await session.evaluate(`window.location.reload()`);
            await new Promise(r => setTimeout(r, 400));

            const clashResult = await session.evaluate(`
                (() => {
                    const articles = Array.from(document.querySelectorAll('article'));
                    const c09 = articles.find(a => a.innerText.includes('Starlight Odyssey'));
                    const c17 = articles.find(a => a.innerText.includes('Analog Void'));
                    return {
                        c09Clash: c09 ? c09.innerText.includes('⚠️ Time conflict with:') : false,
                        c17Clash: c17 ? c17.innerText.includes('⚠️ Time conflict with:') : false
                    };
                })()
            `);

            assert.strictEqual(clashResult.c09Clash, true, `Overnight 23:30–00:45 must conflict with 00:05–01:25`);
            assert.strictEqual(clashResult.c17Clash, true, `Overnight 00:05–01:25 must conflict with 23:30–00:45`);
        });

        // Adversarial Test 2: Abutting intervals (14:00–14:45 vs 14:45–15:30) must NOT clash
        await test(`[TC-ADV-02] Abutting non-overlapping shows (14:00–14:45 and 14:45–15:30) must be CLEAN`, async () => {
            await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/layout-01-app-shell/my-schedule.html`);
            await session.evaluate(`
                (() => {
                    const abuttingLineup = [
                        {
                            id: 'perf-01',
                            artist: 'Echoes of Light',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:00 – 14:45',
                            genre: 'Post-Rock / Ambient'
                        },
                        {
                            id: 'perf-abut',
                            artist: 'Abutting Act',
                            stage: 'Lunar Forest Dome',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:45 – 15:30',
                            genre: 'Ambient'
                        }
                    ];
                    localStorage.setItem('festival_favorites', JSON.stringify(abuttingLineup));
                })()
            `);
            await session.evaluate(`window.location.reload()`);
            await new Promise(r => setTimeout(r, 400));

            const abuttingCheck = await session.evaluate(`
                (() => {
                    const articles = Array.from(document.querySelectorAll('article'));
                    const c01 = articles.find(a => a.innerText.includes('Echoes of Light'));
                    const cAbut = articles.find(a => a.innerText.includes('Abutting Act'));
                    return {
                        c01Clean: c01 ? c01.innerText.includes('✓ No time conflict') : false,
                        cAbutClean: cAbut ? cAbut.innerText.includes('✓ No time conflict') : false
                    };
                })()
            `);

            assert.strictEqual(abuttingCheck.c01Clean, true, `Abutting show 1 must have '[ ✓ No time conflict ]'`);
            assert.strictEqual(abuttingCheck.cAbutClean, true, `Abutting show 2 must have '[ ✓ No time conflict ]'`);
        });

        // Adversarial Test 3: Same stage shows with overlapping times
        await test(`[TC-ADV-03] Same-stage shows do not falsely trigger cross-stage conflict`, async () => {
            await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/layout-01-app-shell/my-schedule.html`);
            await session.evaluate(`
                (() => {
                    const sameStageLineup = [
                        {
                            id: 'perf-01',
                            artist: 'Echoes of Light',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:00 – 14:45',
                            genre: 'Post-Rock'
                        },
                        {
                            id: 'perf-01b',
                            artist: 'Same Stage Twin',
                            stage: 'Solar Horizon Stage',
                            day: 'Day 1 (Friday, July 10)',
                            time: '14:15 – 14:45',
                            genre: 'Post-Rock'
                        }
                    ];
                    localStorage.setItem('festival_favorites', JSON.stringify(sameStageLineup));
                })()
            `);
            await session.evaluate(`window.location.reload()`);
            await new Promise(r => setTimeout(r, 400));

            const sameStageCheck = await session.evaluate(`
                (() => {
                    const articles = Array.from(document.querySelectorAll('article'));
                    const c01 = articles.find(a => a.innerText.includes('Echoes of Light'));
                    return c01 ? c01.innerText.includes('✓ No time conflict') : false;
                })()
            `);

            assert.strictEqual(sameStageCheck, true, `Same-stage saved items must not falsely flag stage collision`);
        });

        // Adversarial Test 4: Clear All button empties schedule and renders empty notice
        await test(`[TC-ADV-04] Clear All button empties schedule and renders empty notice`, async () => {
            await session.navigate(`http://127.0.0.1:${HTTP_PORT}/prototypes/layout-01-app-shell/my-schedule.html`);
            const clearSuccess = await session.evaluate(`
                (() => {
                    window.confirm = () => true;
                    const clearBtn = document.getElementById('clear-favorites-btn') || document.querySelector('.btn-danger');
                    if (clearBtn) {
                        clearBtn.click();
                        const raw = localStorage.getItem('festival_favorites');
                        const parsed = raw ? JSON.parse(raw) : [];
                        const hasEmptyMsg = document.body.innerText.includes('Schedule is Empty');
                        return { cleared: parsed.length === 0, hasEmptyMsg };
                    }
                    return { error: 'clearBtn not found' };
                })()
            `);

            assert.strictEqual(clearSuccess.cleared, true, `localStorage must be cleared`);
            assert.strictEqual(clearSuccess.hasEmptyMsg, true, `Empty schedule message must be displayed`);
        });

    } finally {
        session.close();
        chromeProc.kill();
        server.close();
    }

    console.log('\n========================================================================');
    console.log('EMPIRICAL TEST SUITE EXECUTION SUMMARY');
    console.log('========================================================================');
    console.log(`Total Empirical Tests Executed : ${passedTests + failedTests}`);
    console.log(`Passed                         : ${passedTests}`);
    console.log(`Failed                         : ${failedTests}`);
    console.log('Verdict                        :', failedTests === 0 ? 'APPROVE' : 'REQUEST_CHANGES');
    console.log('========================================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runEmpiricalSuite().catch((err) => {
    console.error('Fatal Test Suite Error:', err);
    process.exit(1);
});
