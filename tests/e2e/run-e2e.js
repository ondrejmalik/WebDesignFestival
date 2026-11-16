#!/usr/bin/env node
'use strict';

/**
 * Unified Playwright E2E Runner for WebDesignFestival
 *
 * Usage:
 *   node tests/e2e/run-e2e.js designs/01-checklist [designs/02-clutterbench ...]
 *   node tests/e2e/run-e2e.js --root
 *   node tests/e2e/run-e2e.js --all
 *   node tests/e2e/run-e2e.js --all --json scratch/e2e-report.json --verbose
 *   node tests/e2e/run-e2e.js designs/01-checklist --fast
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const REPO_ROOT = path.resolve(__dirname, '../..');

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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const CORE_SPECS = [
  { name: 'runtime-and-links', mod: require('./specs/runtime-and-links') },
  { name: 'i18n-and-theme', mod: require('./specs/i18n-and-theme') },
  { name: 'favorites-and-collisions', mod: require('./specs/favorites-and-collisions') },
  { name: 'filters-search-flows', mod: require('./specs/filters-search-flows') },
  { name: 'responsiveness-layout', mod: require('./specs/responsiveness-layout') },
];

const AUDIT_SPECS = [
  { name: 'a11y-and-perf-audit', mod: require('./specs/a11y-and-perf-audit') },
];

function startRepoServer(rootDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.resolve(rootDir, reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, ''));

      if (!filePath.startsWith(rootDir)) {
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
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function discoverPages(siteDir) {
  const expected = [
    'index.html',
    'program.html',
    'artists.html',
    'artist-detail.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'search.html',
  ];
  const found = expected.filter((p) => fs.existsSync(path.join(siteDir, p)));
  if (found.length > 0) return found;
  return fs
    .readdirSync(siteDir)
    .filter((f) => /\.html$/i.test(f));
}

function resolveTarget(designArg) {
  const rel = designArg.replace(/\\/g, '/').replace(/\/+$/, '');
  const full = path.resolve(REPO_ROOT, rel);
  const v2Dir = path.join(full, 'v2');
  const webDir = path.join(full, 'web');
  const hasV2 = fs.existsSync(path.join(v2Dir, 'index.html'));
  const siteDir = hasV2 ? v2Dir : webDir;
  const siteRelPath = path.relative(REPO_ROOT, siteDir).replace(/\\/g, '/');
  const designName = path.basename(full);
  return {
    isRoot: false,
    designName,
    siteRelPath,
    pages: fs.existsSync(siteDir) ? discoverPages(siteDir) : [],
  };
}

function getAllDesigns() {
  const designsDir = path.join(REPO_ROOT, 'designs');
  return fs
    .readdirSync(designsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => `designs/${e.name}`);
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const fast = args.includes('--fast');
  const includeRoot = args.includes('--root') || args.includes('--all');
  const runAll = args.includes('--all');

  let jsonOut = null;
  const jsonIdx = args.indexOf('--json');
  if (jsonIdx !== -1 && args[jsonIdx + 1]) {
    jsonOut = path.resolve(REPO_ROOT, args[jsonIdx + 1]);
  }

  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
      i++;
      continue;
    }
    if (args[i].startsWith('--')) continue;
    positional.push(args[i]);
  }

  const designArgs = runAll ? getAllDesigns() : positional;
  if (!includeRoot && designArgs.length === 0) {
    console.error('Usage: node tests/e2e/run-e2e.js [--root] [--all] [--fast] [--verbose] [--json out.json] [designs/NN-name ...]');
    process.exit(2);
  }

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch (err) {
    console.error('  [WARN] Playwright is not installed; cannot run E2E suite (' + err.message + ')');
    process.exit(3);
  }

  const targets = [];
  if (includeRoot) {
    targets.push({
      isRoot: true,
      designName: 'root',
      siteRelPath: '',
      pages: ['index.html'],
    });
  }
  for (const d of designArgs) {
    targets.push(resolveTarget(d));
  }

  const specs = fast ? CORE_SPECS : [...CORE_SPECS, ...AUDIT_SPECS];
  const { server, baseUrl } = await startRepoServer(REPO_ROOT);
  const browser = await chromium.launch({ headless: true });

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    fast,
    targets: [],
    summary: { totalPassed: 0, totalFailed: 0, totalErrors: 0, totalWarnings: 0 },
  };

  let overallFailed = false;

  try {
    for (const target of targets) {
      const targetLabel = target.isRoot ? 'root (index.html)' : target.designName;
      console.log(`\n=== E2E: ${targetLabel} (${target.siteRelPath || '/'}) ===`);

      const targetResult = {
        designName: target.designName,
        siteRelPath: target.siteRelPath,
        isRoot: target.isRoot,
        passed: 0,
        failed: 0,
        errors: [],
        warnings: [],
        specs: {},
      };

      for (const spec of specs) {
        const started = Date.now();
        let res;
        try {
          res = await spec.mod.run({
            browser,
            baseUrl,
            designName: target.designName,
            siteRelPath: target.siteRelPath,
            pages: target.pages,
            isRoot: target.isRoot,
          });
        } catch (err) {
          res = {
            passed: 0,
            failed: 1,
            errors: [`[${target.designName}] Spec ${spec.name} crashed: ${err && err.stack ? err.stack : err}`],
            warnings: [],
            details: [],
          };
        }
        const durationMs = Date.now() - started;

        targetResult.passed += res.passed || 0;
        targetResult.failed += res.failed || 0;
        targetResult.errors.push(...(res.errors || []));
        targetResult.warnings.push(...(res.warnings || []));
        targetResult.specs[spec.name] = {
          durationMs,
          passed: res.passed || 0,
          failed: res.failed || 0,
          errors: res.errors || [],
          warnings: res.warnings || [],
          details: res.details || [],
        };

        const specStatus = (res.errors && res.errors.length > 0) || res.failed > 0 ? 'FAIL' : 'PASS';
        if (verbose || specStatus === 'FAIL') {
          console.log(
            `  [${specStatus}] ${spec.name}: ${res.passed || 0} passed, ${(res.errors || []).length} error(s), ${(res.warnings || []).length} warning(s) (${durationMs}ms)`
          );
        }
        for (const e of res.errors || []) {
          console.error(`  [FAIL] ${e}`);
        }
        if (verbose) {
          for (const w of res.warnings || []) {
            console.warn(`  [WARN] ${w}`);
          }
        }
      }

      if (targetResult.errors.length > 0 || targetResult.failed > 0) {
        overallFailed = true;
      }

      report.summary.totalPassed += targetResult.passed;
      report.summary.totalFailed += targetResult.failed;
      report.summary.totalErrors += targetResult.errors.length;
      report.summary.totalWarnings += targetResult.warnings.length;
      report.targets.push(targetResult);

      console.log(
        `  Summary (${targetLabel}): ${targetResult.passed} passed, ${targetResult.errors.length} error(s), ${targetResult.warnings.length} warning(s)`
      );
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (jsonOut) {
    fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
    fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2), 'utf8');
    console.log(`\nJSON report saved to ${path.relative(REPO_ROOT, jsonOut)}`);
  }

  console.log(
    `\nE2E Total: ${report.summary.totalPassed} passed, ${report.summary.totalErrors} error(s), ${report.summary.totalWarnings} warning(s).`
  );
  process.exit(overallFailed ? 1 : 0);
}

main().catch((err) => {
  console.error('Unexpected E2E runner error:', err);
  process.exit(1);
});
