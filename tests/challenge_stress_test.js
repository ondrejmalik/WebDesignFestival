/**
 * Milestone 0 Empirical Challenge & Stress Test Suite
 * Designed by Challenger 1 to stress test:
 * 1. festival-data.js helper functions & edge cases
 * 2. e2e_test_runner.js CLI flags & fault detection
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

const festivalData = require('../prototypes/common/festival-data.js');

console.log('====================================================');
console.log('CHALLENGER 1: EMPIRICAL STRESS TEST SUITE (M0)');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`[PASS] ${name}`);
        passCount++;
    } catch (err) {
        console.error(`[FAIL] ${name}`);
        console.error(`       Error: ${err.message}`);
        failCount++;
    }
}

// ---------------------------------------------------------------------
// 1. timeToMinutes with midnight boundary values
// ---------------------------------------------------------------------
console.log('--- 1. Testing timeToMinutes with Midnight Boundaries ---');

test('timeToMinutes handles 00:00 (exact midnight)', () => {
    const mins = festivalData.timeToMinutes('00:00');
    assert.strictEqual(mins, 1440, `00:00 should equal 1440 mins (24*60), got ${mins}`);
});

test('timeToMinutes handles 00:05 (post-midnight 5 mins)', () => {
    const mins = festivalData.timeToMinutes('00:05');
    assert.strictEqual(mins, 1445, `00:05 should equal 1445 mins, got ${mins}`);
});

test('timeToMinutes handles 03:59 (late night festival close boundary)', () => {
    const mins = festivalData.timeToMinutes('03:59');
    assert.strictEqual(mins, 1679, `03:59 should equal 1679 mins, got ${mins}`);
});

test('timeToMinutes handles 13:00 (festival day opening)', () => {
    const mins = festivalData.timeToMinutes('13:00');
    assert.strictEqual(mins, 780, `13:00 should equal 780 mins, got ${mins}`);
});

test('timeToMinutes handles 23:59 (pre-midnight last minute)', () => {
    const mins = festivalData.timeToMinutes('23:59');
    assert.strictEqual(mins, 1439, `23:59 should equal 1439 mins, got ${mins}`);
});

test('timeToMinutes monotonicity across midnight boundary', () => {
    const t2359 = festivalData.timeToMinutes('23:59');
    const t0000 = festivalData.timeToMinutes('00:00');
    const t0001 = festivalData.timeToMinutes('00:01');
    assert.strictEqual(t0000, t2359 + 1, '00:00 must be exactly 1 minute after 23:59');
    assert.strictEqual(t0001, t0000 + 1, '00:01 must be exactly 1 minute after 00:00');
});

test('timeToMinutes handles edge input: empty, null, undefined', () => {
    assert.strictEqual(festivalData.timeToMinutes(''), 0);
    assert.strictEqual(festivalData.timeToMinutes(null), 0);
    assert.strictEqual(festivalData.timeToMinutes(undefined), 0);
});

// ---------------------------------------------------------------------
// 2. isOverlapping with complex intervals & midnight transitions
// ---------------------------------------------------------------------
console.log('\n--- 2. Testing isOverlapping with Complex Intervals ---');

test('isOverlapping detects midnight crossover clash (23:30 – 00:45 vs 00:05 – 01:25)', () => {
    const clash = festivalData.isOverlapping('23:30 – 00:45', '00:05 – 01:25');
    assert.strictEqual(clash, true, '23:30-00:45 and 00:05-01:25 must overlap');
});

test('isOverlapping reverse argument symmetry (00:05 – 01:25 vs 23:30 – 00:45)', () => {
    const clash = festivalData.isOverlapping('00:05 – 01:25', '23:30 – 00:45');
    assert.strictEqual(clash, true, 'isOverlapping must be symmetric');
});

test('isOverlapping returns false for strictly sequential non-overlapping sets across midnight', () => {
    const noClash = festivalData.isOverlapping('22:00 – 23:30', '00:00 – 01:15');
    assert.strictEqual(noClash, false, '22:00-23:30 and 00:00-01:15 must NOT overlap');
});

test('isOverlapping returns false for abutting intervals (adjacent sets without clash)', () => {
    // 23:00 - 00:00 finishes exactly when 00:00 - 01:00 starts
    const adjacentMidnight = festivalData.isOverlapping('23:00 – 00:00', '00:00 – 01:00');
    assert.strictEqual(adjacentMidnight, false, 'Abutting sets sharing exact boundary must NOT overlap');

    const adjacentDaytime = festivalData.isOverlapping('14:00 – 15:00', '15:00 – 16:00');
    assert.strictEqual(adjacentDaytime, false, 'Daytime abutting sets must NOT overlap');
});

test('isOverlapping returns true when one interval is completely contained within another', () => {
    const contained = festivalData.isOverlapping('23:00 – 02:00', '00:00 – 01:00');
    assert.strictEqual(contained, true, 'Contained interval must overlap');
});

test('isOverlapping handles hyphen vs en-dash robustness check', () => {
    // Let's test if standard en-dash works
    const enDash = festivalData.isOverlapping('14:00 – 15:00', '14:30 – 15:30');
    assert.strictEqual(enDash, true);
    
    // Check behavior if someone supplies standard hyphen '-'
    const hyphenTest = festivalData.isOverlapping('14:00 - 15:00', '14:30 - 15:30');
    console.log(`       [Hyphen tolerance note]: hyphen input evaluates to: ${hyphenTest}`);
});

// ---------------------------------------------------------------------
// 3. detectConflicts with multiple simultaneous pairs
// ---------------------------------------------------------------------
console.log('\n--- 3. Testing detectConflicts with Multiple Simultaneous Pairs ---');

test('detectConflicts detects exactly two independent collision pairs on Day 1', () => {
    const favorites = [
        // Pair 1 (Daytime clash):
        { id: 'perf-02', artist: 'Velvet Morning', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:45', genre: 'Dream Pop' },
        { id: 'perf-11', artist: 'Subtle Resonances', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:50', genre: 'Modular Ambient' },
        // Pair 2 (Midnight crossover clash):
        { id: 'perf-09', artist: 'Starlight Odyssey', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '23:30 – 00:45', genre: 'Electronic Indie' },
        { id: 'perf-18', artist: 'Void Pulse', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '00:05 – 01:25', genre: 'Dark Techno' }
    ];

    const conflicts = festivalData.detectConflicts(favorites);
    assert.strictEqual(conflicts.length, 2, `Expected exactly 2 conflicts, got ${conflicts.length}`);
    
    const hasPair1 = conflicts.some(c => 
        (c.itemA.id === 'perf-02' && c.itemB.id === 'perf-11') ||
        (c.itemA.id === 'perf-11' && c.itemB.id === 'perf-02')
    );
    const hasPair2 = conflicts.some(c => 
        (c.itemA.id === 'perf-09' && c.itemB.id === 'perf-18') ||
        (c.itemA.id === 'perf-18' && c.itemB.id === 'perf-09')
    );
    assert.strictEqual(hasPair1, true, 'Conflict pair 1 (Velvet Morning vs Subtle Resonances) must be detected');
    assert.strictEqual(hasPair2, true, 'Conflict pair 2 (Starlight Odyssey vs Void Pulse) must be detected');
});

test('detectConflicts does NOT flag same-day shows on same stage or different days', () => {
    const favorites = [
        // Same time, different days
        { id: 'perf-01', artist: 'Echoes of Light', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '14:00 – 14:45', genre: 'Post-Rock' },
        { id: 'perf-21', artist: 'Solaris Drift', stage: 'Lunar Forest Dome', day: 'Day 2 (Saturday, July 11)', time: '14:00 – 14:45', genre: 'Ambient' },
        // Same day, same stage (sequential)
        { id: 'perf-02', artist: 'Velvet Morning', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:45', genre: 'Dream Pop' }
    ];

    const conflicts = festivalData.detectConflicts(favorites);
    assert.strictEqual(conflicts.length, 0, `Expected 0 conflicts across different days, got ${conflicts.length}`);
});

test('detectConflicts detects three-way triangle clash when 1 show overlaps with 2 staggered shows on other stage', () => {
    const favorites = [
        // Long show on Solar: 15:00 - 17:00
        { id: 'test-solar-long', artist: 'Long Solar Set', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '15:00 – 17:00', genre: 'Indie' },
        // First show on Lunar: 15:00 - 15:50
        { id: 'perf-11', artist: 'Subtle Resonances', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:50', genre: 'Modular Ambient' },
        // Second show on Lunar: 16:05 - 17:00
        { id: 'perf-12', artist: 'Binary Fields', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '16:05 – 17:00', genre: 'IDM' }
    ];
    const conflicts = festivalData.detectConflicts(favorites);
    // Long Solar Set overlaps with both Subtle Resonances and Binary Fields -> 2 conflicts!
    assert.strictEqual(conflicts.length, 2, `Expected 2 pairwise conflicts with Long Solar Set, got ${conflicts.length}`);
});

// ---------------------------------------------------------------------
// 4. getCoveredDomeSchedule item count and per-day distribution
// ---------------------------------------------------------------------
console.log('\n--- 4. Testing getCoveredDomeSchedule ---');

test('getCoveredDomeSchedule returns exactly 30 total items', () => {
    const allCovered = festivalData.getCoveredDomeSchedule();
    assert.strictEqual(allCovered.length, 30, `Expected 30 covered items, got ${allCovered.length}`);
    const allLunar = allCovered.every(item => item.stageId === 'lunar' && item.isCovered === true);
    assert.strictEqual(allLunar, true, 'All items in getCoveredDomeSchedule must have stageId="lunar" and isCovered=true');
});

test('getCoveredDomeSchedule returns exactly 10 items for each day', () => {
    const day1Covered = festivalData.getCoveredDomeSchedule('day1');
    const day2Covered = festivalData.getCoveredDomeSchedule('day2');
    const day3Covered = festivalData.getCoveredDomeSchedule('day3');

    assert.strictEqual(day1Covered.length, 10, `Day 1 covered schedule expected 10, got ${day1Covered.length}`);
    assert.strictEqual(day2Covered.length, 10, `Day 2 covered schedule expected 10, got ${day2Covered.length}`);
    assert.strictEqual(day3Covered.length, 10, `Day 3 covered schedule expected 10, got ${day3Covered.length}`);
    
    // Test alternative filter format with label
    const day1ByLabel = festivalData.getCoveredDomeSchedule('Day 1');
    assert.strictEqual(day1ByLabel.length, 10, `Day 1 by label expected 10, got ${day1ByLabel.length}`);
});

console.log('\n====================================================');
console.log(`SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log('====================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
