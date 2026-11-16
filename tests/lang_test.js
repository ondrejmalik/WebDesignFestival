#!/usr/bin/env node
// Design-agnostic language test. Usage: node tests/lang_test.js designs/NN-name
// Checks only the language CONTRACT (js/lang.js API + dictionaries + keys used in markup).
// Agents may freely add/remove/reword elements, change markup, or restyle the switcher.
const fs = require('fs'), path = require('path'), vm = require('vm');
const target = process.argv[2];
if (!target) { console.error('Usage: node tests/lang_test.js designs/NN-name'); process.exit(2); }
const v2 = path.resolve(target, 'v2');
const isV2 = fs.existsSync(path.join(v2, 'index.html'));
const web = isV2 ? v2 : path.resolve(target, 'web');
let failed = 0;
const ok = (c, m) => { if (c) console.log('  [PASS] ' + m); else { console.error('  [FAIL] ' + m); failed++; } };
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);

// 1. Every page loads lang.js
const pages = isV2 ? ['index','program'] : ['index','program','artists','artist-detail','stages','practical-info','my-schedule','search'];
for (const p of pages) {
  const f = path.join(web, p + '.html');
  if (!fs.existsSync(f)) { ok(false, p + '.html exists'); continue; }
  ok(/<script[^>]+src=["'][^"']*lang\.js/.test(fs.readFileSync(f, 'utf8')), p + '.html loads js/lang.js');
}

// 2. Load lang.js in a lenient sandbox
const langPath = path.join(web, 'js', 'lang.js');
if (!fs.existsSync(langPath)) { ok(false, 'js/lang.js exists'); process.exit(1); }
const store = {};
const doc = { readyState: 'complete', documentElement: { lang: 'en', setAttribute() {} }, title: '', body: { classList: { add() {}, remove() {}, toggle() {} } },
  addEventListener() {}, querySelectorAll: () => [], querySelector: () => null, getElementById: () => null, createElement: () => ({ style: {}, classList: { add() {} }, setAttribute() {} }) };
const win = { document: doc, location: { search: '', pathname: '/index.html', href: '' }, addEventListener() {}, dispatchEvent: () => true,
  localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } } };
win.window = win;
const ctx = vm.createContext({ window: win, document: doc, localStorage: win.localStorage, location: win.location, URLSearchParams, console,
  CustomEvent: class { constructor(t, d) { this.type = t; this.detail = d; } }, setTimeout, clearTimeout, requestAnimationFrame: f => f() });
let I;
try { vm.runInContext(fs.readFileSync(langPath, 'utf8'), ctx); I = win.FESTIVAL_I18N; ok(true, 'js/lang.js runs without errors'); }
catch (e) { ok(false, 'js/lang.js runs without errors: ' + e.message); process.exit(1); }

ok(I && I.en && I.cs, 'window.FESTIVAL_I18N has en and cs');
if (I && I.en && I.cs) {
  const en = Object.keys(I.en), cs = Object.keys(I.cs);
  ok(en.length >= 10, 'EN dictionary has keys (' + en.length + ')');
  const mCs = en.filter(k => !(k in I.cs)), mEn = cs.filter(k => !(k in I.en));
  ok(!mCs.length, 'every EN key exists in CS (missing: ' + (mCs.slice(0, 8).join(', ') || 'none') + ')');
  ok(!mEn.length, 'every CS key exists in EN (missing: ' + (mEn.slice(0, 8).join(', ') || 'none') + ')');
  ok(cs.some(k => /[áčďéěíňóřšťúůýž]/i.test(String(I.cs[k]))), 'CS dictionary contains Czech diacritics');

  // 3. Every data-i18n key used in markup/components exists in both languages
  const files = walk(web).filter(f => /\.(html|js)$/.test(f) && !/lang\.js$/.test(f));
  const used = new Set();
  for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/data-i18n(?:-html|-placeholder|-title)?=["']([^"']+)["']/g)) { if (!/[\$\{\}]/.test(m[1])) used.add(m[1]); }
  const unknown = [...used].filter(k => !(k in I.en) || !(k in I.cs));
  ok(!unknown.length, used.size + ' data-i18n keys used; unknown: ' + (unknown.slice(0, 8).join(', ') || 'none'));
}

// 4. Public API behaves
const w = win;
ok(['getFestivalLang','setFestivalLang','toggleFestivalLang'].every(n => typeof w[n] === 'function'), 'get/set/toggleFestivalLang exposed on window');
if (typeof w.toggleFestivalLang === 'function' && typeof w.getFestivalLang === 'function') {
  const start = w.getFestivalLang();
  ok(start === 'en' || start === 'cs', 'default language is en or cs (' + start + ')');
  const t1 = w.toggleFestivalLang();
  ok(t1 !== start && w.getFestivalLang() === t1, 'toggle switches language');
  ok(Object.values(store).includes(t1), 'language persisted in localStorage');
  w.setFestivalLang('cs'); ok(w.getFestivalLang() === 'cs', 'setFestivalLang("cs")');
  w.setFestivalLang('en'); ok(w.getFestivalLang() === 'en', 'setFestivalLang("en")');
}
const cp = w.czechPlural || w.formatCzPlural;
if (typeof w.formatCzPlural === 'function') {
  const f = w.formatCzPlural;
  ok(/a/.test(f(1, 'a', 'b', 'c')) && /b/.test(f(3, 'a', 'b', 'c')) && /c/.test(f(5, 'a', 'b', 'c')), 'Czech plural: 1 / 2-4 / 5+');
} else ok(false, 'window.formatCzPlural exposed');

console.log(failed ? '\nLANG TEST FAILED (' + failed + ')' : '\nLANG TEST PASSED');
process.exit(failed ? 1 : 0);