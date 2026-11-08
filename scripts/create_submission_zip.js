// scripts/create_submission_zip.js
// Creates an optimized, verified submission .zip archive for Cvičení 4 (and Cvičení 3) per zadani.txt.

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const STAGING_DIR = path.join(ROOT_DIR, 'staging');
const PROJEKT_DIR = path.join(STAGING_DIR, 'projekt');
const ZIP_OUTPUT_CV4 = path.join(ROOT_DIR, 'FestivalOfDarkness2_Cviceni_4.zip');
const ZIP_OUTPUT_CV3 = path.join(ROOT_DIR, 'FestivalOfDarkness2_Cviceni_3.zip');

console.log('========================================================================');
console.log('Packaging Submission Archive for Cvičení 4: Festival of Darkness 2');
console.log('========================================================================\n');

// Step 1: Run submission verification & packaging to keep web/ in sync
console.log('--- Step 1: Running package_submission.js and verify_integrity.js ---');
execSync('node scripts/package_submission.js', { cwd: ROOT_DIR, stdio: 'inherit' });
execSync('node scripts/verify_integrity.js', { cwd: ROOT_DIR, stdio: 'inherit' });

// Step 2: Clean and initialize staging directory
console.log('\n--- Step 2: Preparing clean staging directory ---');
if (fs.existsSync(STAGING_DIR)) {
    fs.rmSync(STAGING_DIR, { recursive: true, force: true });
}
fs.mkdirSync(PROJEKT_DIR, { recursive: true });

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const items = fs.readdirSync(src);
        for (const item of items) {
            copyRecursive(path.join(src, item), path.join(dest, item));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

// Step 3: Copy required files into staging/projekt
console.log('--- Step 3: Populating staging/projekt directory ---');

const rootFiles = [
    'project-specification.md',
    'progress-02.md',
    'progress-03.md',
    'data.xml',
    'prez1.pptx',
    'index.html',
    'program.html',
    'artists.html',
    'artist-detail.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'search.html'
];

rootFiles.forEach(file => {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(PROJEKT_DIR, file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`  [COPIED] ${file}`);
    } else {
        console.warn(`  [NOTICE] Optional/missing file: ${file}`);
    }
});

const assetDirs = ['css', 'js', 'img', 'components', 'web'];
assetDirs.forEach(dir => {
    const src = path.join(ROOT_DIR, dir);
    const dest = path.join(PROJEKT_DIR, dir);
    if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        console.log(`  [COPIED] ${dir}/`);
    }
});

// Provide both prototype/ and prototypes/ so neither singular nor plural checks fail
const prototypesSrc = path.join(ROOT_DIR, 'prototypes');
if (fs.existsSync(prototypesSrc)) {
    copyRecursive(prototypesSrc, path.join(PROJEKT_DIR, 'prototypes'));
    console.log(`  [COPIED] prototypes/`);
    copyRecursive(prototypesSrc, path.join(PROJEKT_DIR, 'prototype'));
    console.log(`  [COPIED] prototype/ (alias per assignment structure)`);
}

// Step 4: Compress into .zip
console.log('\n--- Step 4: Compressing staging directory into ZIP ---');
if (fs.existsSync(ZIP_OUTPUT_CV4)) {
    fs.unlinkSync(ZIP_OUTPUT_CV4);
}

const pwshCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${STAGING_DIR}\\projekt' -DestinationPath '${ZIP_OUTPUT_CV4}' -CompressionLevel Optimal"`;
execSync(pwshCmd, { cwd: ROOT_DIR, stdio: 'inherit' });

// Also keep FestivalOfDarkness2_Cviceni_3.zip updated in case user selects that filename
fs.copyFileSync(ZIP_OUTPUT_CV4, ZIP_OUTPUT_CV3);

// Clean up staging directory
fs.rmSync(STAGING_DIR, { recursive: true, force: true });

// Step 5: Verify ZIP file
console.log('\n--- Step 5: Verifying ZIP Archive ---');
if (fs.existsSync(ZIP_OUTPUT_CV4)) {
    const stats = fs.statSync(ZIP_OUTPUT_CV4);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`  [SUCCESS] Archive generated successfully!`);
    console.log(`  Primary File: ${ZIP_OUTPUT_CV4}`);
    console.log(`  Mirrored File: ${ZIP_OUTPUT_CV3}`);
    console.log(`  Size: ${sizeKB} KB (${sizeMB} MB)`);
} else {
    console.error(`  [ERROR] ZIP file was not created!`);
    process.exit(1);
}

console.log('\n========================================================================');
console.log('ZIP Package is READY for submission on Moodle!');
console.log('========================================================================\n');
