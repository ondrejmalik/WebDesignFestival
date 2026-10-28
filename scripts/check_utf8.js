const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const filesToCheck = [
    'index.html',
    'program.html',
    'artists.html',
    'artist-detail.html',
    'stages.html',
    'practical-info.html',
    'my-schedule.html',
    'search.html',
    'components/nav.html',
    'components/footer.html',
    'components/nav.js',
    'components/footer.js',
    'js/lang.js',
    'js/schedule.js',
    'js/artists.js',
    'js/artist-detail.js',
    'js/theme.js',
    'js/search.js',
    'css/wireframe.css'
];

if (fs.existsSync(path.join(ROOT_DIR, 'web'))) {
    const webFiles = [
        'web/index.html',
        'web/program.html',
        'web/artists.html',
        'web/artist-detail.html',
        'web/stages.html',
        'web/practical-info.html',
        'web/my-schedule.html',
        'web/search.html',
        'web/components/nav.html',
        'web/components/footer.html',
        'web/components/nav.js',
        'web/components/footer.js',
        'web/js/lang.js',
        'web/js/schedule.js',
        'web/js/artists.js',
        'web/js/artist-detail.js',
        'web/js/theme.js',
        'web/js/search.js',
        'web/css/wireframe.css'
    ];
    filesToCheck.push(...webFiles);
}

let corruptedCount = 0;
filesToCheck.forEach(relPath => {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('\uFFFD')) {
            console.error(`CORRUPTED UTF-8: ${relPath}`);
            corruptedCount++;
        }
    }
});

if (corruptedCount === 0) {
    console.log('PASS: Zero UTF-8 replacement characters found.');
} else {
    console.error(`FAIL: Found ${corruptedCount} files with UTF-8 replacement characters!`);
    process.exit(1);
}
