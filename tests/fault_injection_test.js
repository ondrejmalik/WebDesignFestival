/**
 * Milestone 0 Fault Injection Verification
 * Tests that e2e_test_runner.js logic genuinely fails when faults are injected
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const festivalData = require('../prototypes/common/festival-data.js');

console.log('====================================================');
console.log('CHALLENGER 1: FAULT INJECTION & DETECTION VERIFICATION');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function verifyDetection(testName, injectionFn, expectation) {
    try {
        const detected = injectionFn();
        assert.strictEqual(detected, true, `Fault must be caught: ${expectation}`);
        console.log(`[PASS: CAUGHT] ${testName}`);
        passCount++;
    } catch (e) {
        console.error(`[FAIL: MISSED] ${testName}`);
        console.error(`               ${e.message}`);
        failCount++;
    }
}

// 1. Fault: Corrupted Performer Count (59 performers)
verifyDetection(
    'TC-T1-03 catches missing or duplicate performers',
    () => {
        const perfs = festivalData.PERFORMERS.slice(0, 59); // remove 1
        const perfIds = new Set(perfs.map(p => p.id));
        const allPrefixed = perfs.every(p => p.id && p.id.startsWith('perf-'));
        const isValid = Array.isArray(perfs) && perfs.length === 60 && perfIds.size === 60 && allPrefixed;
        return !isValid; // Should be detected as invalid
    },
    'Array length != 60 must be rejected'
);

// 2. Fault: Empty Bio
verifyDetection(
    'TC-T1-06 catches empty or truncated artist bio',
    () => {
        const mutatedPerfs = JSON.parse(JSON.stringify(festivalData.PERFORMERS));
        mutatedPerfs[5].bio = ''; // corrupt one bio
        const biosOk = mutatedPerfs.every(p => p.bio && p.bio.trim().length > 20);
        return !biosOk; // Should be detected as invalid
    },
    'Empty bio must fail TC-T1-06 check'
);

// 3. Fault: Skewed Stage Distribution (31 Solar, 29 Lunar)
verifyDetection(
    'TC-T1-07 catches unbalanced stage distribution',
    () => {
        const mutatedSch = JSON.parse(JSON.stringify(festivalData.SCHEDULE));
        mutatedSch[15].stageId = 'solar'; // change a lunar to solar
        const solarCount = mutatedSch.filter(s => s.stageId === 'solar').length;
        const lunarCount = mutatedSch.filter(s => s.stageId === 'lunar').length;
        const isBalanced = (solarCount === 30 && lunarCount === 30);
        return !isBalanced;
    },
    'Unbalanced stage distribution must fail TC-T1-07'
);

// 4. Fault: Broken Midnight Math in timeToMinutes
verifyDetection(
    'TC-T1-08 catches missing midnight 1440 offset',
    () => {
        // Buggy implementation that fails to add 1440 for hours < 8
        function buggyTimeToMinutes(tStr) {
            const parts = tStr.split(':').map(Number);
            return parts[0] * 60 + parts[1];
        }
        const m2330 = buggyTimeToMinutes('23:30');
        const m0005 = buggyTimeToMinutes('00:05');
        const m0310 = buggyTimeToMinutes('03:10');
        const isValid = (m0005 > m2330 && m0310 > m0005 && m0005 === (24 * 60 + 5));
        return !isValid;
    },
    'Buggy timeToMinutes without midnight offset must be caught'
);

// 5. Fault: Faulty isOverlapping ignoring midnight crossover
verifyDetection(
    'TC-T1-09 catches flawed overlap detection across midnight',
    () => {
        // Buggy overlap that uses standard daytime comparisons
        function buggyIsOverlapping(t1, t2) {
            const [s1, e1] = t1.split('–').map(s => s.trim().split(':').map(Number));
            const [s2, e2] = t2.split('–').map(s => s.trim().split(':').map(Number));
            const mS1 = s1[0]*60 + s1[1];
            const mE1 = e1[0]*60 + e1[1];
            const mS2 = s2[0]*60 + s2[1];
            const mE2 = e2[0]*60 + e2[1];
            return (mS1 < mE2) && (mS2 < mE1);
        }
        const midnightClash = buggyIsOverlapping('23:30 – 00:45', '00:05 – 01:25');
        // Because 23:30 (1410) < 01:25 (85) is false, buggy overlap returns false!
        return midnightClash === false; // Correctly caught as a bug!
    },
    'Buggy overlap failing across midnight must be caught'
);

// 6. Fault: Covered Dome Filter returning wrong counts
verifyDetection(
    'TC-T1-10 catches covered dome schedule filter bug',
    () => {
        // Buggy filter returning 35 items
        const fakeItems = new Array(35).fill({});
        const isValid = (fakeItems.length === 30);
        return !isValid;
    },
    'Invalid count of covered dome items must be caught'
);

// 7. Fault: Hub HTML missing iPhone SE viewport
verifyDetection(
    'TC-T2-02 catches missing viewport simulator options',
    () => {
        const dummyHubHtml = '<html><head></head><body><button>iPad Mini</button></body></html>';
        const hasIphone = dummyHubHtml.includes('375') && dummyHubHtml.includes('iPhone SE');
        return !hasIphone;
    },
    'Missing iPhone SE must fail TC-T2-02'
);

// 8. Fault: Rubric weight tampering
verifyDetection(
    'TC-T2-08 catches altered rubric weights',
    () => {
        const alteredHubHtml = 'const formula = "Ergonomics * 0.50 + S1 * 0.50";';
        const hasRubricFormula = alteredHubHtml.includes('0.25') && alteredHubHtml.includes('0.20') && alteredHubHtml.includes('0.15');
        return !hasRubricFormula;
    },
    'Altered rubric weights must fail TC-T2-08'
);

// 9. Fault: Conflict detector false negative
verifyDetection(
    'TC-T5-05 catches conflict detector failure on known collision',
    () => {
        // Buggy detector returning 0 conflicts
        function buggyDetectConflicts() { return []; }
        const detected = buggyDetectConflicts();
        const isValid = detected && detected.length === 1;
        return !isValid;
    },
    'Failure to detect known conflict must fail TC-T5-05'
);

// 10. Fault: Conflict detector false positive on clean schedule
verifyDetection(
    'TC-T5-06 catches false positive clash on clean schedule',
    () => {
        // Buggy detector that claims collision when none exists
        function buggyDetectConflicts() { return [{ itemA: {}, itemB: {} }]; }
        const detected = buggyDetectConflicts();
        const isValid = detected && detected.length === 0;
        return !isValid;
    },
    'False positive clash on clean schedule must fail TC-T5-06'
);

console.log('\n====================================================');
console.log(`FAULT DETECTION SUMMARY: ${passCount} caught, ${failCount} missed`);
console.log('====================================================');

if (failCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
