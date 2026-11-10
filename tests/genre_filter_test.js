// Regression tests for the broad program genre filters.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

global.window = { addEventListener() {} };
global.document = { addEventListener() {} };
const { GENRE_FILTER_ALIASES, matchesGenreFilter, TOTAL_PROGRAMS } = require('../js/schedule.js');

const programHtml = fs.readFileSync(path.join(__dirname, '..', 'program.html'), 'utf8');
const performances = [...programHtml.matchAll(/id="(perf-\d+)"[^>]*data-genre="([^"]+)"/g)]
    .map(([, id, genre]) => ({ id, genre }));
const filterNames = Object.keys(GENRE_FILTER_ALIASES);

assert.strictEqual(TOTAL_PROGRAMS, 60, 'The program total must remain 60');
assert.strictEqual(performances.length, 60, 'program.html must contain 60 individual performances');
assert.strictEqual(new Set(performances.map(item => item.id)).size, 60, 'performance IDs must be unique');

for (const performance of performances) {
    assert(
        filterNames.some(filter => matchesGenreFilter(performance.genre, filter)),
        `${performance.id} (${performance.genre}) must be discoverable by a genre filter`
    );
}

assert(matchesGenreFilter('Alternative Rock', 'rock'), 'Rock finds rock subgenres');
assert(matchesGenreFilter('Dream Pop', 'pop'), 'Pop finds dream pop');
assert(matchesGenreFilter('Electro-Folk', 'electronic'), 'Electronic finds electro variants');
assert(matchesGenreFilter('Hard Techno', 'techno'), 'Techno finds techno variants');
assert(!matchesGenreFilter('Dream Pop', 'techno'), 'Techno does not match unrelated genres');

console.log(`PASS: ${performances.length} programs are covered by meaningful genre filters.`);
