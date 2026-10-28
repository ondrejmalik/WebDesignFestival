// scripts/package_submission.js - Automated packaging and verification harness
// Prepares and validates web/ deliverable directory per semester assignment (zadani.txt).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT_DIR, 'web');

console.log('========================================================================');
console.log('Festival of Darkness 2 — Submission Packaging & Verification Harness');
console.log('========================================================================\n');

// 1. Run Static Inline Styles Verification
console.log('--- STEP 1: Verifying Zero Static Inline Styles ---');
try {
    const inlineOutput = execSync('node scripts/check_inline_styles.js', { cwd: ROOT_DIR, encoding: 'utf8' });
    console.log(inlineOutput.trim());
    if (inlineOutput.includes('Total inline styles: 0')) {
        console.log('[PASS] Zero static inline styles verified.\n');
    } else {
        console.error('[FAIL] Static inline styles detected!');
        process.exit(1);
    }
} catch (err) {
    console.error('[FAIL] Error executing check_inline_styles.js:', err.message);
    process.exit(1);
}

// 2. Run UTF-8 Encoding Verification
console.log('--- STEP 2: Verifying Zero UTF-8 Corruption ---');
try {
    const utf8Output = execSync('node scripts/check_utf8.js', { cwd: ROOT_DIR, encoding: 'utf8' });
    console.log(utf8Output.trim());
    console.log('[PASS] UTF-8 character encoding verified.\n');
} catch (err) {
    console.error('[FAIL] UTF-8 replacement characters detected:', err.message);
    process.exit(1);
}

// 3. Run Automated Regression Test Suites
console.log('--- STEP 3: Executing Automated Test Harness ---');
const testSuites = [
    'tests/e2e_test_runner.js',
    'tests/artist_detail_and_breadcrumbs_test.js',
    'tests/dark_mode_test.js',
    'tests/bottom_switcher_test.js',
    'tests/lang_switcher_test.js',
    'tests/sticky_nav_test.js',
    'tests/challenger_1_m0_r2_suite.js'
];

testSuites.forEach(suite => {
    try {
        console.log(`Running ${suite}...`);
        execSync(`node ${suite}`, { cwd: ROOT_DIR, stdio: 'ignore' });
        console.log(`  [PASS] ${suite}`);
    } catch (err) {
        console.error(`  [FAIL] Test suite failed: ${suite}`);
        process.exit(1);
    }
});
console.log('[PASS] All automated test suites passed successfully.\n');

// 4. Mirror Canonical Deliverables to web/ Directory
console.log('--- STEP 4: Packaging Production Files to web/ ---');
if (!fs.existsSync(WEB_DIR)) {
    fs.mkdirSync(WEB_DIR, { recursive: true });
}

function copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const htmlFiles = [
    'index.html',
    'program.html',
    'artists.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'artist-detail.html',
    'search.html'
];

htmlFiles.forEach(file => {
    const srcPath = path.join(ROOT_DIR, file);
    const destPath = path.join(WEB_DIR, file);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  [SYNC] ${file} -> web/${file}`);
    } else {
        console.error(`  [ERROR] Missing required file: ${file}`);
        process.exit(1);
    }
});

const assetDirs = ['css', 'js', 'img', 'components'];
assetDirs.forEach(dir => {
    const srcDir = path.join(ROOT_DIR, dir);
    const destDir = path.join(WEB_DIR, dir);
    copyDirectoryRecursive(srcDir, destDir);
    console.log(`  [SYNC] ${dir}/ -> web/${dir}/`);
});

// Also create web/images pointing to or aliasing web/img for assignment naming compatibility
const webImagesDir = path.join(WEB_DIR, 'images');
copyDirectoryRecursive(path.join(ROOT_DIR, 'img'), webImagesDir);
console.log(`  [SYNC] img/ -> web/images/ (alias for assignment compatibility)`);

console.log('\n--- STEP 5: Verifying Submission Package Foundation ---');
const foundationFiles = [
    'project-specification.md',
    'data.xml'
];

foundationFiles.forEach(f => {
    const p = path.join(ROOT_DIR, f);
    if (fs.existsSync(p)) {
        console.log(`  [PASS] Found foundation file: ${f}`);
    } else {
        console.warn(`  [WARNING] Foundation file missing: ${f}`);
    }
});

const prototypeDir = path.join(ROOT_DIR, 'prototypes');
if (fs.existsSync(prototypeDir)) {
    console.log(`  [PASS] Found prototype directory: prototypes/`);
} else {
    console.warn(`  [WARNING] prototype directory missing!`);
}

console.log('\n========================================================================');
console.log('SUCCESS: Deliverables verified and mirrored to web/ successfully!');
console.log('========================================================================\n');
