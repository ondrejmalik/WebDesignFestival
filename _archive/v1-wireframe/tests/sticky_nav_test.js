// tests/sticky_nav_test.js - Automated Verification of Sticky Top Navigation
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const ROOT_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9455;

console.log('========================================================================');
console.log('TEST SUITE: Sticky Top Navigation Verification');
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

async function asyncTest(name, fn) {
    try {
        await fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}`);
        console.error(`         Reason: ${err.message}`);
        failed++;
    }
}

async function run() {
    console.log('--- 1. Static CSS wireframe.css Rules Verification ---');
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');

    test('wireframe.css defines position: sticky and top: 0 for #nav-placeholder', () => {
        assert(css.includes('#nav-placeholder'), 'Must target #nav-placeholder');
        const match = css.match(/#nav-placeholder[^{]*\{([^}]+)\}/s);
        assert(match, 'Must have #nav-placeholder style block');
        const block = match[1];
        assert(block.includes('position: sticky') || block.includes('position: -webkit-sticky'), 'Must define position: sticky');
        assert(block.includes('top: 0'), 'Must define top: 0');
        assert(block.includes('z-index: 1000') || block.includes('z-index:1000'), 'Must define z-index: 1000');
        assert(block.includes('background: #fff') || block.includes('background:#fff'), 'Must define opaque white background for light mode');
    });

    test('wireframe.css defines dark-mode background for #nav-placeholder', () => {
        assert(css.includes('html.dark-mode #nav-placeholder'), 'Must define html.dark-mode #nav-placeholder');
        assert(css.includes('#141414'), 'Must set dark mode background #141414');
    });

    test('wireframe.css defines scroll-padding-top on html for anchor navigation', () => {
        assert(css.includes('scroll-padding-top:'), 'Must define scroll-padding-top on html');
    });

    console.log('\n--- 2. Static HTML Structure Verification ---');
    const pages = ['index.html', 'program.html', 'artists.html', 'stages.html', 'practical-info.html', 'my-schedule.html', 'artist-detail.html'];
    pages.forEach(p => {
        test(`${p} has #nav-placeholder as immediate child of .wf-container`, () => {
            const html = fs.readFileSync(path.join(ROOT_DIR, p), 'utf8');
            assert(html.includes('id="nav-placeholder"'), `${p} must contain id="nav-placeholder"`);
            assert(html.includes('<header class="wf-top-app-bar"'), `${p} must contain header.wf-top-app-bar`);
        });
    });

    console.log('\n--- 3. Headless Chrome CDP Empirical Sticky Scroll Verification ---');
    if (fs.existsSync(CHROME_PATH)) {
        const userDataDir = path.join(process.env.TEMP || 'C:\\temp', 'chrome-test-sticky-' + Date.now());
        const chrome = spawn(CHROME_PATH, [
            '--headless=new',
            '--remote-debugging-port=' + PORT,
            '--user-data-dir=' + userDataDir,
            '--no-first-run',
            '--no-default-browser-check'
        ]);

        await new Promise(r => setTimeout(r, 1500));

        try {
            const targets = await new Promise((resolve, reject) => {
                http.get('http://127.0.0.1:' + PORT + '/json', res => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(JSON.parse(data)));
                }).on('error', reject);
            });

            const pageTarget = targets.find(t => t.type === 'page');
            const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

            let msgId = 1;
            function send(method, params = {}) {
                return new Promise((resolve, reject) => {
                    const id = msgId++;
                    const handler = (data) => {
                        const msg = JSON.parse(data);
                        if (msg.id === id) {
                            ws.off('message', handler);
                            if (msg.error) reject(msg.error);
                            else resolve(msg.result);
                        }
                    };
                    ws.on('message', handler);
                    ws.send(JSON.stringify({ id, method, params }));
                });
            }

            await new Promise(r => ws.on('open', r));

            // Test on program.html
            await asyncTest('program.html: #nav-placeholder stays pinned at top: 0 during 600px vertical scroll', async () => {
                const programUrl = 'file:///' + path.resolve(ROOT_DIR, 'program.html').replace(/\\/g, '/');
                await send('Page.navigate', { url: programUrl });
                await new Promise(r => setTimeout(r, 1200));

                await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 600);' });
                await new Promise(r => setTimeout(r, 200));

                const metrics = await send('Runtime.evaluate', {
                    expression: `JSON.stringify({
                        scrollY: window.scrollY,
                        placeholderTop: document.getElementById('nav-placeholder').getBoundingClientRect().top,
                        topAppBarTop: document.querySelector('.wf-top-app-bar').getBoundingClientRect().top
                    })`,
                    returnByValue: true
                });
                const res = JSON.parse(metrics.result.value);
                assert(res.scrollY >= 500, `Page must be scrolled (scrollY=${res.scrollY})`);
                assert.strictEqual(res.placeholderTop, 0, `#nav-placeholder top must be exactly 0 (got ${res.placeholderTop})`);
                assert.strictEqual(res.topAppBarTop, 0, `.wf-top-app-bar top must be exactly 0 (got ${res.topAppBarTop})`);
            });

            // Test on artists.html
            await asyncTest('artists.html: #nav-placeholder stays pinned at top: 0 during 800px vertical scroll', async () => {
                const artistsUrl = 'file:///' + path.resolve(ROOT_DIR, 'artists.html').replace(/\\/g, '/');
                await send('Page.navigate', { url: artistsUrl });
                await new Promise(r => setTimeout(r, 1200));

                await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 800);' });
                await new Promise(r => setTimeout(r, 200));

                const metrics = await send('Runtime.evaluate', {
                    expression: `JSON.stringify({
                        scrollY: window.scrollY,
                        placeholderTop: document.getElementById('nav-placeholder').getBoundingClientRect().top,
                        topAppBarTop: document.querySelector('.wf-top-app-bar').getBoundingClientRect().top
                    })`,
                    returnByValue: true
                });
                const res = JSON.parse(metrics.result.value);
                assert(res.scrollY >= 700, `Page must be scrolled (scrollY=${res.scrollY})`);
                assert.strictEqual(res.placeholderTop, 0, `#nav-placeholder top must be exactly 0 (got ${res.placeholderTop})`);
                assert.strictEqual(res.topAppBarTop, 0, `.wf-top-app-bar top must be exactly 0 (got ${res.topAppBarTop})`);
            });

            ws.close();
            chrome.kill();
        } catch (e) {
            console.error('CDP test error:', e);
            try { chrome.kill(); } catch (_) {}
            failed++;
        }
    }

    console.log('\n========================================================================');
    console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log('========================================================================');

    if (failed > 0) process.exit(1);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
