#!/usr/bin/env node
/**
 * Design-Agnostic CI Smoke Test Suite
 *
 * Intentionally avoids hardcoded page lists, CSS selectors, or DOM IDs so that
 * radically different or simplified designs pass as long as the site is valid,
 * linked cleanly, and serves without errors.
 *
 * Usage:
 *   node tests/ci_smoke_test.js              # Auto-detects web/ and/or root
 *   node tests/ci_smoke_test.js --root web   # Test a specific directory
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const IGNORE_DIRS = new Set([
    '.git',
    '.github',
    '.idea',
    '.agents',
    'node_modules',
    'tests',
    'scripts',
    'prototypes',
    'scratch',
    'design-inspirations'
]);

const TEXT_EXTENSIONS = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.xml', '.svg']);
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2'
};

let failures = 0;
let warnings = 0;
let checks = 0;

function pass(msg) {
    checks++;
    console.log(`  [PASS] ${msg}`);
}

function fail(msg) {
    checks++;
    failures++;
    console.error(`  [FAIL] ${msg}`);
}

function warn(msg) {
    warnings++;
    console.warn(`  [WARN] ${msg}`);
}

function walkFiles(dir, excludeSubdirs = new Set()) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (IGNORE_DIRS.has(entry.name) || excludeSubdirs.has(entry.name)) continue;
            results.push(...walkFiles(path.join(dir, entry.name)));
        } else if (entry.isFile()) {
            results.push(path.join(dir, entry.name));
        }
    }
    return results;
}

function isExternalOrSpecialRef(ref) {
    if (!ref) return true;
    const trimmed = ref.trim();
    return (
        trimmed === '' ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:') ||
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('blob:')
    );
}

function resolveLocalRef(siteRoot, htmlFile, rawRef) {
    const cleanRef = rawRef.split('#')[0].split('?')[0].trim();
    if (!cleanRef) return null;
    if (cleanRef.startsWith('/')) {
        return path.join(siteRoot, cleanRef.slice(1));
    }
    return path.resolve(path.dirname(htmlFile), cleanRef);
}

function extractAttributes(html, tagRegex, attrName) {
    const refs = [];
    const attrRegex = new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i');
    let tagMatch;
    while ((tagMatch = tagRegex.exec(html)) !== null) {
        const attrMatch = attrRegex.exec(tagMatch[0]);
        if (attrMatch) {
            refs.push(attrMatch[1] ?? attrMatch[2] ?? '');
        }
    }
    return refs;
}

function startStaticServer(siteRoot) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
            let filePath = path.join(siteRoot, reqPath === '/' ? 'index.html' : reqPath);

            // Prevent path traversal outside siteRoot
            if (!filePath.startsWith(siteRoot)) {
                res.writeHead(403);
                res.end('Forbidden');
                return;
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }

            if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
                res.writeHead(404);
                res.end('Not Found');
                return;
            }

            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        });

        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ server, port: addr.port });
        });
    });
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
        }).on('error', reject);
    });
}

async function testSiteRoot(siteRoot, label) {
    console.log(`\n=== Testing site root: ${label} (${path.relative(REPO_ROOT, siteRoot) || '.'}) ===`);

    const excludeSubdirs = siteRoot === REPO_ROOT ? new Set(['web']) : new Set();
    const allFiles = walkFiles(siteRoot, excludeSubdirs);
    const htmlFiles = allFiles.filter(f => /\.(html|htm)$/i.test(f));
    const jsFiles = allFiles.filter(f => /\.(js|mjs)$/i.test(f));
    const textFiles = allFiles.filter(f => TEXT_EXTENSIONS.has(path.extname(f).toLowerCase()));

    // 1. Entrypoint check
    const indexHtml = path.join(siteRoot, 'index.html');
    if (fs.existsSync(indexHtml)) {
        pass(`${label}: index.html exists`);
    } else {
        fail(`${label}: missing index.html`);
    }

    if (htmlFiles.length === 0) {
        fail(`${label}: no HTML files found`);
        return;
    }
    pass(`${label}: discovered ${htmlFiles.length} HTML file(s), ${jsFiles.length} JS file(s)`);

    // 2. UTF-8 integrity check
    let utf8Issues = 0;
    for (const file of textFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('\uFFFD')) {
            fail(`${label}: UTF-8 replacement character (\\uFFFD) in ${path.relative(siteRoot, file)}`);
            utf8Issues++;
        }
    }
    if (utf8Issues === 0) {
        pass(`${label}: zero UTF-8 replacement characters across ${textFiles.length} text file(s)`);
    }

    // 3. HTML structure & broken local links/assets
    let htmlErrors = 0;
    let linkErrors = 0;

    for (const file of htmlFiles) {
        const rel = path.relative(siteRoot, file);
        const html = fs.readFileSync(file, 'utf8');
        const isPartial =
            /^(components|partials|includes)[\\/]/i.test(rel) ||
            (!/<html\b/i.test(html) && !/<!doctype\s+html>/i.test(html));

        if (!isPartial) {
            if (!/<!doctype\s+html>/i.test(html)) {
                fail(`${label}: ${rel} missing <!DOCTYPE html>`);
                htmlErrors++;
            }
            if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
                fail(`${label}: ${rel} missing <title>`);
                htmlErrors++;
            }
            if (!/<meta\b[^>]*name\s*=\s*["']viewport["']/i.test(html)) {
                fail(`${label}: ${rel} missing <meta name="viewport">`);
                htmlErrors++;
            }

            // Advisory accessibility checks (warn only)
            if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) {
                warn(`${label}: ${rel} is missing lang attribute on <html>`);
            }
            if (!/<h1\b/i.test(html)) {
                warn(`${label}: ${rel} has no <h1> heading`);
            }
        }

        const imgTags = html.match(/<img\b[^>]*>/gi) || [];
        for (const imgTag of imgTags) {
            if (!/\balt\s*=\s*(?:"[^"]*"|'[^']*')/i.test(imgTag)) {
                warn(`${label}: ${rel} has an <img> without an alt attribute`);
            }
        }

        // Check local references: <link href>, <script src>, <img src>, <a href>
        // Partials are injected into root pages, so resolve their relative paths from siteRoot.
        const baseFileForRefs = isPartial ? path.join(siteRoot, 'index.html') : file;
        const refs = [
            ...extractAttributes(html, /<link\b[^>]*>/gi, 'href').map(r => ({ type: 'link', ref: r })),
            ...extractAttributes(html, /<script\b[^>]*>/gi, 'src').map(r => ({ type: 'script', ref: r })),
            ...extractAttributes(html, /<img\b[^>]*>/gi, 'src').map(r => ({ type: 'img', ref: r })),
            ...extractAttributes(html, /<a\b[^>]*>/gi, 'href').map(r => ({ type: 'anchor', ref: r }))
        ];

        for (const { type, ref } of refs) {
            if (isExternalOrSpecialRef(ref)) continue;
            const resolved = resolveLocalRef(siteRoot, baseFileForRefs, ref);
            if (!resolved) continue;
            if (!fs.existsSync(resolved)) {
                fail(`${label}: ${rel} has broken ${type} reference -> "${ref}"`);
                linkErrors++;
            }
        }
    }

    if (htmlErrors === 0) {
        pass(`${label}: all ${htmlFiles.length} HTML file(s) have DOCTYPE, <title>, and viewport meta`);
    }
    if (linkErrors === 0) {
        pass(`${label}: zero broken local links or asset references`);
    }

    // 4. JavaScript syntax check
    let jsErrors = 0;
    for (const jsFile of jsFiles) {
        const rel = path.relative(siteRoot, jsFile);
        try {
            execFileSync(process.execPath, ['--check', jsFile], { stdio: 'pipe' });
        } catch (err) {
            fail(`${label}: JS syntax error in ${rel}: ${err.stderr?.toString().trim() || err.message}`);
            jsErrors++;
        }
    }
    if (jsErrors === 0 && jsFiles.length > 0) {
        pass(`${label}: all ${jsFiles.length} JS file(s) passed syntax check`);
    }

    // 5. Live HTTP smoke test
    const { server, port } = await startStaticServer(siteRoot);
    let httpErrors = 0;
    try {
        for (const file of htmlFiles) {
            const relUrl = path.relative(siteRoot, file).split(path.sep).join('/');
            const res = await httpGet(`http://127.0.0.1:${port}/${relUrl}`);
            if (res.status !== 200 || res.body.trim().length === 0) {
                fail(`${label}: HTTP GET /${relUrl} returned status ${res.status} (length ${res.body.length})`);
                httpErrors++;
            }
        }
        if (httpErrors === 0) {
            pass(`${label}: HTTP smoke test returned 200 OK for all ${htmlFiles.length} HTML page(s)`);
        }
    } finally {
        server.close();
    }
}

async function main() {
    const rootArgIdx = process.argv.indexOf('--root');
    const rootsToTest = [];

    if (rootArgIdx !== -1 && process.argv[rootArgIdx + 1]) {
        const target = path.resolve(REPO_ROOT, process.argv[rootArgIdx + 1]);
        rootsToTest.push({ dir: target, label: process.argv[rootArgIdx + 1] });
    } else {
        const webDir = path.join(REPO_ROOT, 'web');
        if (fs.existsSync(path.join(webDir, 'index.html'))) {
            rootsToTest.push({ dir: webDir, label: 'web/' });
        }
        if (fs.existsSync(path.join(REPO_ROOT, 'index.html'))) {
            rootsToTest.push({ dir: REPO_ROOT, label: 'root' });
        }
    }

    if (rootsToTest.length === 0) {
        fail('No site root with index.html found (checked web/index.html and ./index.html)');
        process.exit(1);
    }

    for (const target of rootsToTest) {
        await testSiteRoot(target.dir, target.label);
    }

    console.log(`\nSummary: ${checks} checks, ${failures} failure(s), ${warnings} warning(s).`);
    if (failures > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Unexpected test runner error:', err);
    process.exit(1);
});
