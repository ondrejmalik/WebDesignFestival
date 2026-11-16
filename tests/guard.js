#!/usr/bin/env node
// Guard rail: a design may only be submitted if smoke + language tests pass.
// A design with v2/index.html is tested as a 2-page site (v2/) instead of web/.
// Usage: node tests/guard.js designs/NN-name [...]   test given designs
//        node tests/guard.js --changed [base-ref]    test designs changed vs base-ref (default origin/main)
//        node tests/guard.js --all                   test every design
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const all = () => fs.readdirSync(path.join(root, 'designs'), { withFileTypes: true }).filter(e => e.isDirectory()).map(e => 'designs/' + e.name);
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
let args = process.argv.slice(2).filter(a => a !== '--verbose'), designs;
if (args[0] === '--all') designs = all();
else if (args[0] === '--changed') {
  const base = args[1] || 'origin/main';
  let r = sh('git', ['diff', '--name-only', base + '...HEAD']);
  if (r.status !== 0) r = sh('git', ['diff', '--name-only', 'HEAD~1']);
  const dirty = sh('git', ['status', '--porcelain']).stdout.split('\n').map(l => l.slice(3));
  const files = (r.stdout || '').split('\n').concat(dirty);
  designs = [...new Set(files.map(f => (f.trim().replace(/"/g, '').match(/^designs\/([^/]+)\//) || [])[1]).filter(Boolean))].map(n => 'designs/' + n).filter(d => fs.existsSync(path.join(root, d)));
  if (!designs.length) { console.log('No design changes detected - nothing to guard.'); process.exit(0); }
} else designs = args.map(a => a.replace(/\\/g, '/').replace(/\/$/, ''));
if (!designs.length) { console.error('Usage: node tests/guard.js designs/NN-name | --changed | --all'); process.exit(2); }
let bad = [];
let hasPlaywright = true;
try {
  require.resolve('playwright');
} catch (_) {
  hasPlaywright = false;
}

for (const d of designs) {
  console.log('\n######## ' + d + ' ########');
  const run = (...x) => { const r = spawnSync('node', x, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }); const out = (r.stdout || '') + (r.stderr || '');
    console.log(process.argv.includes('--verbose') ? out : out.split('\n').filter(l => /FAIL|WARN|Error/.test(l)).join('\n')); return r; };
  const a = run('tests/ci_smoke_test.js', '--root', d + (fs.existsSync(path.join(root, d, 'v2', 'index.html')) ? '/v2' : '/web')); console.log('  smoke: ' + (a.status ? 'FAILED' : 'ok'));
  const b = run('tests/lang_test.js', d); console.log('  lang:  ' + (b.status ? 'FAILED' : 'ok'));
  let e2eFailed = false;
  if (hasPlaywright && !process.argv.includes('--skip-e2e')) {
    const e2eArgs = ['tests/e2e/run-e2e.js', d, '--fast'];
    if (process.argv.includes('--verbose')) e2eArgs.push('--verbose');
    const c = run(...e2eArgs);
    e2eFailed = c.status !== 0;
    console.log('  e2e:   ' + (e2eFailed ? 'FAILED' : 'ok'));
  } else {
    console.log('  e2e:   skipped (' + (hasPlaywright ? '--skip-e2e' : 'playwright not installed') + ')');
  }
  if (a.status !== 0 || b.status !== 0 || e2eFailed) bad.push(d + (a.status ? ' [smoke]' : '') + (b.status ? ' [lang]' : '') + (e2eFailed ? ' [e2e]' : ''));
}
if (bad.length) { console.error('\nGUARD FAILED: ' + bad.join(', ')); process.exit(1); }
console.log('\nGUARD PASSED: ' + designs.join(', '));