const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 9556;

async function runTargetedChecks() {
    const userDataDir = path.join(process.env.TEMP || 'C:\\temp', 'chrome-targeted-' + Date.now());
    const chromeProc = spawn(CHROME_PATH, [
        '--headless=new',
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${userDataDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--window-size=1200,900',
        'about:blank'
    ]);

    const pageErrors = [];

    try {
        let targetWsUrl = null;
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 200));
            try {
                const json = await new Promise((resolve, reject) => {
                    http.get(`http://localhost:${PORT}/json/version`, res => {
                        let d = '';
                        res.on('data', c => d += c);
                        res.on('end', () => resolve(JSON.parse(d)));
                    }).on('error', reject);
                });
                if (json.webSocketDebuggerUrl) {
                    targetWsUrl = json.webSocketDebuggerUrl;
                    break;
                }
            } catch (e) {}
        }

        const browserWs = new WebSocket(targetWsUrl);
        await new Promise((r, rej) => { browserWs.onopen = r; browserWs.onerror = rej; });
        const createTargetRes = await new Promise(resolve => {
            browserWs.onmessage = e => resolve(JSON.parse(e.data).result);
            browserWs.send(JSON.stringify({ id: 1, method: 'Target.createTarget', params: { url: 'about:blank' } }));
        });
        browserWs.close();

        const ws = new WebSocket(`ws://localhost:${PORT}/devtools/page/${createTargetRes.targetId}`);
        await new Promise((r, rej) => { ws.onopen = r; ws.onerror = rej; });

        let msgId = 1;
        const pending = new Map();
        ws.onmessage = e => {
            const data = JSON.parse(e.data);
            if (data.method === 'Runtime.exceptionThrown') {
                pageErrors.push(data.params);
            }
            if (data.id && pending.has(data.id)) {
                const cb = pending.get(data.id);
                pending.delete(data.id);
                if (data.error) cb.reject(data.error);
                else cb.resolve(data.result);
            }
        };

        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = msgId++;
                pending.set(id, { resolve, reject });
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');

        console.log('=== TARGET 1: L01 stages.html Viewport & Hub Iframe Overflow ===');
        const l01StagesPath = path.join(ROOT_DIR, 'prototypes', 'layout-01-app-shell', 'stages.html');
        const l01StagesUrl = 'file:///' + l01StagesPath.replace(/\\/g, '/');

        const viewports = [
            { name: 'iPhone SE', width: 375, height: 667, mobile: true },
            { name: 'Pixel 7', width: 412, height: 915, mobile: true },
            { name: 'iPad Mini', width: 768, height: 1024, mobile: true },
            { name: 'Desktop Standard', width: 1200, height: 900, mobile: false }
        ];

        for (const vp of viewports) {
            await send('Emulation.setDeviceMetricsOverride', {
                width: vp.width,
                height: vp.height,
                deviceScaleFactor: 1,
                mobile: vp.mobile
            });
            await send('Page.navigate', { url: l01StagesUrl });
            await new Promise(r => setTimeout(r, 600));

            const metrics = await send('Runtime.evaluate', {
                expression: `(() => {
                    const scrollW = document.documentElement.scrollWidth;
                    const clientW = document.documentElement.clientWidth;
                    return { scrollW, clientW, overflowDelta: scrollW - clientW };
                })()`,
                returnByValue: true
            });
            console.log(`[Viewport Check] ${vp.name} (${vp.width}px): scrollW=${metrics.result.value.scrollW}, clientW=${metrics.result.value.clientW}, delta=${metrics.result.value.overflowDelta}px`);
        }

        // Test in Showcase Hub Iframe at 375px
        console.log('\n--- Hub Simulator Iframe Check for L01 stages.html ---');
        const hubPath = path.join(ROOT_DIR, 'prototypes', 'index.html');
        const hubUrl = 'file:///' + hubPath.replace(/\\/g, '/');
        await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
        await send('Page.navigate', { url: hubUrl });
        await new Promise(r => setTimeout(r, 800));

        // Switch to iPhone SE (375px), L01, and stages.html
        const iframeResult = await send('Runtime.evaluate', {
            expression: `(async () => {
                const btnIphone = document.querySelector('button[data-device="iphone-se"]');
                if (btnIphone) btnIphone.click();

                const iframe = document.getElementById('simulator-iframe');
                iframe.src = './layout-01-app-shell/stages.html';
                await new Promise(r => { iframe.onload = r; setTimeout(r, 1000); });

                const idoc = iframe.contentDocument || iframe.contentWindow.document;
                const scrollW = idoc.documentElement.scrollWidth;
                const clientW = idoc.documentElement.clientWidth;
                return { scrollW, clientW, overflowDelta: scrollW - clientW };
            })()`,
            awaitPromise: true,
            returnByValue: true
        });
        console.log(`[Hub Iframe Check] L01 stages.html in 375px simulator: scrollW=${iframeResult.result.value.scrollW}, clientW=${iframeResult.result.value.clientW}, delta=${iframeResult.result.value.overflowDelta}px`);

        console.log('\n=== TARGET 2: L02 initHomePreview & Page JS Errors ===');
        const l02IndexPath = path.join(ROOT_DIR, 'prototypes', 'layout-02-chronological-feed', 'index.html');
        const l02IndexUrl = 'file:///' + l02IndexPath.replace(/\\/g, '/');
        pageErrors.length = 0; // reset error log

        await send('Page.navigate', { url: l02IndexUrl });
        await new Promise(r => setTimeout(r, 800));

        const previewRender = await send('Runtime.evaluate', {
            expression: `(() => {
                const container = document.getElementById('home-feed-preview');
                const cards = container ? container.querySelectorAll('article, .wf-box-sub, [style*="border"]') : [];
                const innerText = container ? container.innerText : '';
                return {
                    hasContainer: !!container,
                    cardCount: cards.length,
                    hasExpectedArtist: innerText.includes('Echoes of Light') || innerText.includes('Solar Flare') || innerText.length > 50,
                    textSnippet: innerText.substring(0, 150)
                };
            })()`,
            returnByValue: true
        });
        console.log('[L02 Index Preview Render]:', JSON.stringify(previewRender.result.value));
        console.log(`[Intercepted JS Errors on L02 Index]: ${pageErrors.length}`);
        if (pageErrors.length > 0) {
            console.error('Errors:', JSON.stringify(pageErrors));
        }

        // Test all other L02 pages for JS errors
        const l02Pages = ['program.html', 'artists.html', 'stages.html', 'practical-info.html', 'my-schedule.html'];
        for (const p of l02Pages) {
            const pUrl = 'file:///' + path.join(ROOT_DIR, 'prototypes', 'layout-02-chronological-feed', p).replace(/\\/g, '/');
            await send('Page.navigate', { url: pUrl });
            await new Promise(r => setTimeout(r, 600));
        }
        console.log(`[Intercepted JS Errors across ALL L02 subpages]: ${pageErrors.length}`);

        ws.close();
    } finally {
        chromeProc.kill();
    }
}

runTargetedChecks().catch(err => {
    console.error('Targeted check failed:', err);
    process.exit(1);
});
