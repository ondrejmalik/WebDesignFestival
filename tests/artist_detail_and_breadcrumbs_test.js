const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`  [FAIL] ${name}: ${err.message}`);
        failed++;
    }
}

console.log('========================================================================');
console.log('TEST SUITE: Artist Detail, Breadcrumbs, Exact Spot Return & Timetable');
console.log('========================================================================\n');

// 1. artist-detail.html verification
test('artist-detail.html exists and contains core structural components', () => {
    const filePath = path.join(ROOT_DIR, 'artist-detail.html');
    assert(fs.existsSync(filePath), 'artist-detail.html must exist');
    const html = fs.readFileSync(filePath, 'utf8');

    assert(html.includes('id="detail-breadcrumbs"'), 'Must have detail-breadcrumbs container');
    assert(html.includes('id="detail-back-btn"'), 'Must have detail-back-btn');
    assert(html.includes('id="artist-profile-content"'), 'Must have artist-profile-content container');
    assert(html.includes('js/artist-detail.js'), 'Must load js/artist-detail.js');
    assert(html.includes('js/lang.js'), 'Must load js/lang.js');
    assert(html.includes('css/wireframe.css'), 'Must load css/wireframe.css');

    // High contrast typography verification
    assert(html.includes('class="artist-detail-meta-text"'), 'Must have artist-detail-meta-text');
    assert(html.includes('class="artist-detail-bio-text"'), 'Must have artist-detail-bio-text');
    assert(html.includes('class="artist-detail-stage-text"'), 'Must have artist-detail-stage-text');
    assert(html.includes('class="stage-link"'), 'Must have stage-link');

    // Bottom dock IDs check
    const expectedDockIds = ['dock-item-artists', 'dock-item-stages', 'dock-item-home', 'dock-item-timetable', 'dock-item-myplan'];
    expectedDockIds.forEach(id => {
        assert(html.includes(id), `Must contain dock id ${id}`);
    });
});

// 2. js/artist-detail.js catalog verification
test('js/artist-detail.js catalogs all 60 performers with bilingual bios and stage mapping', () => {
    const filePath = path.join(ROOT_DIR, 'js', 'artist-detail.js');
    assert(fs.existsSync(filePath), 'js/artist-detail.js must exist');
    const content = fs.readFileSync(filePath, 'utf8');

    for (let i = 1; i <= 60; i++) {
        const id = 'perf-' + (i < 10 ? '0' + i : i);
        assert(content.includes(`"id": "${id}"`), `Must contain artist ${id} in catalog`);
        assert(content.includes(`"${id}":`), `Must contain bio for ${id}`);
    }

    assert(content.includes('program.html#'), 'Must link return navigation to program.html with hash');
    assert(content.includes('artists.html#'), 'Must link return navigation to artists.html with hash');
    assert(content.includes('my-schedule.html#'), 'Must link return navigation to my-schedule.html with hash');
    assert(content.includes('stages.html#'), 'Must link stage to stages.html');
});

// 3. program.html verification
test('program.html has breadcrumbs, all 60 cells have id, bigger band details and detail+star at the end', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'program.html'), 'utf8');

    assert(html.includes('class="wf-breadcrumbs"'), 'program.html must have breadcrumbs');
    assert(html.includes('data-i18n="nav_program"'), 'program.html breadcrumbs must be localized');

    // Verify all 60 cells have id="perf-XX"
    for (let i = 1; i <= 60; i++) {
        const id = 'perf-' + (i < 10 ? '0' + i : i);
        assert(html.includes(`id="${id}"`), `program.html must have cell with id="${id}" for exact-spot return`);
        assert(html.includes(`artist-detail.html?id=${id}&amp;from=program#${id}`) || html.includes(`artist-detail.html?id=${id}&from=program#${id}`), `program.html must link to artist-detail for ${id}`);
    }

    // Verify no sch-add-btn exists in program.html
    assert(!html.includes('sch-add-btn'), 'program.html must not contain unnecessary sch-add-btn');

    // Verify detail and star button classes in cards
    assert(html.includes('sch-detail-btn'), 'program.html must have sch-detail-btn');
    assert(html.includes('sch-fav-btn'), 'program.html must have sch-fav-btn');
});

// 4. artists.html verification
test('artists.html has breadcrumbs, all 60 cards have id, and links to artist detail', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'artists.html'), 'utf8');

    assert(html.includes('class="wf-breadcrumbs"'), 'artists.html must have breadcrumbs');

    for (let i = 1; i <= 60; i++) {
        const id = 'perf-' + (i < 10 ? '0' + i : i);
        assert(html.includes(`id="${id}"`), `artists.html must have card with id="${id}" for exact-spot return`);
        assert(html.includes(`artist-detail.html?id=${id}&amp;from=artists#${id}`) || html.includes(`artist-detail.html?id=${id}&from=artists#${id}`), `artists.html must have direct link to artist-detail for ${id}`);
    }

    const js = fs.readFileSync(path.join(ROOT_DIR, 'js', 'artists.js'), 'utf8');
    assert(js.includes('artist-detail.html?id='), 'artists.js must navigate to artist-detail.html on view detail click');
    assert(js.includes('spot-highlight'), 'artists.js must apply spot-highlight animation on return');
});

// 5. my-schedule.html and schedule.js verification
test('my-schedule.html has breadcrumbs and schedule.js links to artist detail and stages tabs', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'my-schedule.html'), 'utf8');
    assert(html.includes('class="wf-breadcrumbs"'), 'my-schedule.html must have breadcrumbs');
    assert(html.includes('artist-detail.html?id='), 'my-schedule.html static fallback must link to artist detail');
    assert(html.includes('stages.html#stage-solar'), 'my-schedule.html static fallback must link to stage solar');
    assert(html.includes('stages.html#stage-lunar'), 'my-schedule.html static fallback must link to stage lunar');

    const js = fs.readFileSync(path.join(ROOT_DIR, 'js', 'schedule.js'), 'utf8');
    assert(js.includes('artist-detail.html?id='), 'schedule.js renderMySchedule must link to artist detail');
    assert(js.includes('stages.html#'), 'schedule.js renderMySchedule must link to stage tabs');
    assert(js.includes('stage-solar'), 'schedule.js must reference stage-solar');
    assert(js.includes('stage-lunar'), 'schedule.js must reference stage-lunar');
    assert(js.includes('spot-highlight'), 'schedule.js must apply spot-highlight animation on return');
});

// 6. stages.html tabs verification
test('stages.html has breadcrumbs, stage-solar and stage-lunar ids and navigation tabs', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'stages.html'), 'utf8');

    assert(html.includes('class="wf-breadcrumbs"'), 'stages.html must have breadcrumbs');
    assert(html.includes('id="stage-solar"'), 'stages.html must have id="stage-solar"');
    assert(html.includes('id="stage-lunar"'), 'stages.html must have id="stage-lunar"');
    assert(html.includes('class="stage-nav-tabs"'), 'stages.html must have stage-nav-tabs');
    assert(html.includes('href="#stage-solar"'), 'stages.html must have tab linking to #stage-solar');
    assert(html.includes('href="#stage-lunar"'), 'stages.html must have tab linking to #stage-lunar');
});

// 7. practical-info.html verification
test('practical-info.html has breadcrumbs navigation', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'practical-info.html'), 'utf8');
    assert(html.includes('class="wf-breadcrumbs"'), 'practical-info.html must have breadcrumbs');
    assert(html.includes('data-i18n="nav_practical"'), 'practical-info.html breadcrumb must be localized');
});

// 8. wireframe.css styling verification
test('wireframe.css has breadcrumbs, bigger sch-artist, spot-highlight and stage-tabs styling', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'wireframe.css'), 'utf8');

    assert(css.includes('.wf-breadcrumbs'), 'wireframe.css must define .wf-breadcrumbs');
    assert(css.includes('.spot-highlight'), 'wireframe.css must define .spot-highlight');
    assert(css.includes('@keyframes spot-pulse-highlight'), 'wireframe.css must define spot-pulse-highlight keyframes');
    assert(css.includes('.stage-nav-tabs'), 'wireframe.css must define .stage-nav-tabs');
    assert(css.includes('.sch-detail-btn'), 'wireframe.css must define .sch-detail-btn');
    assert(css.includes('.artist-detail-meta-text'), 'wireframe.css must define .artist-detail-meta-text');
    assert(css.includes('.artist-detail-bio-text'), 'wireframe.css must define .artist-detail-bio-text');
    assert(css.includes('.artist-detail-stage-text'), 'wireframe.css must define .artist-detail-stage-text');
    assert(css.includes('html.dark-mode .artist-detail-bio-text'), 'wireframe.css must define dark mode for .artist-detail-bio-text');
    assert(css.includes('html.dark-mode .artist-detail-stage-text'), 'wireframe.css must define dark mode for .artist-detail-stage-text');
    assert(css.includes('.stage-link'), 'wireframe.css must define .stage-link');
    assert(css.includes('html.dark-mode .stage-link'), 'wireframe.css must define dark mode for .stage-link');
});

console.log('\n========================================================================');
console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================================================');

if (failed > 0) process.exit(1);
else process.exit(0);
