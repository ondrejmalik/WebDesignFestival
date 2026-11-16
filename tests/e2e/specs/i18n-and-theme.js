'use strict';

/**
 * tests/e2e/specs/i18n-and-theme.js
 * Design-agnostic Playwright E2E spec verifying EN/CZ bilingual switching,
 * translation integrity, Czech pluralization helper, and Dark/Light theme persistence.
 */

const LANG_TOGGLE_SELECTORS = [
  '#lang-toggle',
  '.lang-btn',
  '.lang-switch',
  '.lang-toggle',
  '.eb-lang-btn',
  '.mobile-lang-btn',
];

const THEME_TOGGLE_SELECTORS = [
  '.theme-switch-btn',
  '#theme-switch-btn',
  '.theme-toggle',
  '#theme-toggle',
];

const CORRUPTION_PATTERNS = [
  { label: 'undefined literal', regex: /\bundefined\b/ },
  { label: 'NaN literal', regex: /\bNaN\b/ },
  { label: '[object Object] leak', regex: /\[object Object\]/ },
  { label: 'Unicode replacement character (\\uFFFD)', regex: /\uFFFD/ },
];

function buildPageUrl(baseUrl, siteRelPath, pageName) {
  const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
  const cleanRel = String(siteRelPath || '').replace(/^\/+|\/+$/g, '');
  const cleanPage = String(pageName || '').replace(/^\/+/, '');
  return cleanRel
    ? `${cleanBase}/${cleanRel}/${cleanPage}`
    : `${cleanBase}/${cleanPage}`;
}

async function waitForPageReady(page, timeoutMs = 8000) {
  await page.waitForFunction(
    () =>
      document.readyState === 'complete' &&
      Boolean(document.body) &&
      document.body.innerText.trim().length > 0,
    { timeout: timeoutMs }
  );

  await page
    .waitForFunction(
      () =>
        typeof window.FESTIVAL_CORE !== 'undefined' ||
        typeof window.toggleFestivalLang === 'function' ||
        typeof window.setFestivalLang === 'function' ||
        Boolean(document.documentElement.getAttribute('lang')),
      { timeout: 3000 }
    )
    .catch(() => {});

  // Let deferred setTimeout(..., 0) hooks in festival-core.js flush
  await page.evaluate(() => new Promise((r) => setTimeout(r, 20)));
}

async function findFirstVisibleLocator(page, selectors) {
  for (const selector of selectors) {
    const locator = page.locator(selector);
    const count = await locator.count();
    for (let i = 0; i < count; i += 1) {
      const candidate = locator.nth(i);
      if (await candidate.isVisible().catch(() => false)) {
        return { locator: candidate, selector };
      }
    }
  }
  return null;
}

async function captureTextSnapshot(page) {
  return page.evaluate(() => {
    const bodyText = (document.body && document.body.innerText) || '';
    const navEl = document.querySelector('nav, header, [role="navigation"]');
    const navText = navEl ? navEl.innerText : '';
    const langAttr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    const langStorage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && /lang|locale|i18n/i.test(k)) {
        langStorage[k] = localStorage.getItem(k);
      }
    }
    return {
      langAttr,
      bodyText: bodyText.replace(/\s+/g, ' ').trim(),
      navText: navText.replace(/\s+/g, ' ').trim(),
      langStorage,
    };
  });
}

function findCorruptedStrings(text) {
  const hits = [];
  if (!text) return hits;
  for (const { label, regex } of CORRUPTION_PATTERNS) {
    const match = text.match(regex);
    if (match) {
      const idx = match.index || 0;
      const snippet = text.slice(Math.max(0, idx - 30), Math.min(text.length, idx + 40));
      hits.push(`${label} near "${snippet}"`);
    }
  }
  return hits;
}

async function triggerLanguageSwitch(page, contextLabel, warnings) {
  const visibleToggle = await findFirstVisibleLocator(page, LANG_TOGGLE_SELECTORS);

  if (visibleToggle) {
    await visibleToggle.locator.click();
    return { method: `click(${visibleToggle.selector})` };
  }

  warnings.push(
    `[${contextLabel}] No visible language toggle button found among (${LANG_TOGGLE_SELECTORS.join(', ')}); falling back to window.toggleFestivalLang().`
  );

  const invoked = await page.evaluate(() => {
    if (typeof window.toggleFestivalLang === 'function') {
      window.toggleFestivalLang();
      return 'window.toggleFestivalLang()';
    }
    if (window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.toggleLang === 'function') {
      window.FESTIVAL_CORE.toggleLang();
      return 'window.FESTIVAL_CORE.toggleLang()';
    }
    return null;
  });

  if (!invoked) {
    throw new Error(
      `[${contextLabel}] Neither a visible language toggle button nor window.toggleFestivalLang() was available.`
    );
  }

  return { method: invoked };
}

async function verifyPageI18n(page, { baseUrl, designName, siteRelPath, pageName, checkPersistence }, state) {
  const { warnings, errors, details } = state;
  const label = `${designName}/${pageName}`;
  const url = buildPageUrl(baseUrl, siteRelPath, pageName);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);

  const initialLang = await page.evaluate(() =>
    (document.documentElement.getAttribute('lang') || '').toLowerCase()
  );
  if (initialLang.startsWith('cs') || initialLang.startsWith('cz')) {
    await triggerLanguageSwitch(page, `${label}:normalize-en`, warnings);
    await page.waitForFunction(
      () => (document.documentElement.getAttribute('lang') || '').toLowerCase().startsWith('en'),
      { timeout: 4000 }
    );
  }

  const enSnap = await captureTextSnapshot(page);
  if (!enSnap.langAttr.startsWith('en')) {
    errors.push(`[${label}] Expected initial <html lang="en">, got "${enSnap.langAttr || '(empty)'}".`);
    state.failed += 1;
    return;
  }
  state.passed += 1;

  const enCorruptions = findCorruptedStrings(enSnap.bodyText);
  if (enCorruptions.length > 0) {
    errors.push(`[${label}] Corrupted string(s) detected in EN render: ${enCorruptions.join('; ')}`);
    state.failed += 1;
  } else {
    state.passed += 1;
  }

  let switchToCsMethod = '';
  try {
    const res = await triggerLanguageSwitch(page, `${label}:en->cs`, warnings);
    switchToCsMethod = res.method;
  } catch (err) {
    errors.push(err.message);
    state.failed += 1;
    return;
  }

  const switchedToCs = await page
    .waitForFunction(
      () => {
        const l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
        return l === 'cs' || l === 'cz' || l.startsWith('cs-');
      },
      { timeout: 4000 }
    )
    .then(() => true)
    .catch(() => false);

  const csSnap = await captureTextSnapshot(page);
  if (!switchedToCs) {
    errors.push(
      `[${label}] Language switch (${switchToCsMethod}) failed to update <html lang> to "cs" (got "${csSnap.langAttr || '(empty)'}").`
    );
    state.failed += 1;
    return;
  }
  state.passed += 1;

  if (csSnap.bodyText === enSnap.bodyText) {
    errors.push(`[${label}] <html lang> changed to "${csSnap.langAttr}", but visible body text did not change.`);
    state.failed += 1;
  } else {
    state.passed += 1;
  }

  if (enSnap.navText && csSnap.navText && enSnap.navText === csSnap.navText) {
    warnings.push(`[${label}] Navigation text remained identical between EN and CS ("${csSnap.navText.slice(0, 60)}").`);
  }

  const csCorruptions = findCorruptedStrings(csSnap.bodyText);
  if (csCorruptions.length > 0) {
    errors.push(`[${label}] Corrupted string(s) detected in CS render: ${csCorruptions.join('; ')}`);
    state.failed += 1;
  } else {
    state.passed += 1;
  }

  if (checkPersistence) {
    const hasLangStorage = Object.values(csSnap.langStorage).some((val) =>
      /^(cs|cz)/i.test(String(val || ''))
    );
    if (!hasLangStorage) {
      errors.push(
        `[${label}] Expected Czech language preference persisted in localStorage, found: ${JSON.stringify(csSnap.langStorage)}`
      );
      state.failed += 1;
    } else {
      state.passed += 1;
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);
    const reloadedLang = await page.evaluate(() =>
      (document.documentElement.getAttribute('lang') || '').toLowerCase()
    );
    if (!reloadedLang.startsWith('cs')) {
      errors.push(
        `[${label}] Czech language did not persist across page.reload() (got "${reloadedLang || '(empty)'}").`
      );
      state.failed += 1;
    } else {
      state.passed += 1;
    }

    const scheduleUrl = buildPageUrl(baseUrl, siteRelPath, 'my-schedule.html');
    await page.goto(scheduleUrl, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);
    const scheduleSnap = await captureTextSnapshot(page);
    if (!scheduleSnap.langAttr.startsWith('cs')) {
      errors.push(
        `[${designName}/my-schedule.html] Czech language did not persist after navigation (got "${scheduleSnap.langAttr || '(empty)'}").`
      );
      state.failed += 1;
    } else {
      state.passed += 1;
    }

    const scheduleCorruptions = findCorruptedStrings(scheduleSnap.bodyText);
    if (scheduleCorruptions.length > 0) {
      errors.push(
        `[${designName}/my-schedule.html] Corrupted string(s) in CS render: ${scheduleCorruptions.join('; ')}`
      );
      state.failed += 1;
    }

    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);
  }

  let switchToEnMethod = '';
  try {
    const res = await triggerLanguageSwitch(page, `${label}:cs->en`, warnings);
    switchToEnMethod = res.method;
  } catch (err) {
    errors.push(err.message);
    state.failed += 1;
    return;
  }

  const switchedBackToEn = await page
    .waitForFunction(
      () => (document.documentElement.getAttribute('lang') || '').toLowerCase().startsWith('en'),
      { timeout: 4000 }
    )
    .then(() => true)
    .catch(() => false);

  const restoredEnSnap = await captureTextSnapshot(page);
  if (!switchedBackToEn) {
    errors.push(
      `[${label}] Switching back to EN (${switchToEnMethod}) failed (got "${restoredEnSnap.langAttr || '(empty)'}").`
    );
    state.failed += 1;
  } else if (restoredEnSnap.bodyText === csSnap.bodyText) {
    errors.push(`[${label}] <html lang> returned to "en", but visible body text remained in Czech.`);
    state.failed += 1;
  } else {
    state.passed += 1;
  }

  details.push({
    check: `i18n:${pageName}`,
    switchToCsMethod,
    switchToEnMethod,
    initialLang: enSnap.langAttr,
    switchedLang: csSnap.langAttr,
    restoredLang: restoredEnSnap.langAttr,
  });
}

async function verifyCzPluralHelper(page, designName, state) {
  const { warnings, errors, details } = state;
  const result = await page.evaluate(() => {
    const fn =
      typeof window.formatCzPlural === 'function'
        ? window.formatCzPlural
        : window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.formatCzPlural === 'function'
          ? window.FESTIVAL_CORE.formatCzPlural
          : null;

    if (!fn) {
      return { missing: true };
    }

    try {
      return {
        missing: false,
        one: String(fn(1, 'den', 'dny', 'dnů')),
        three: String(fn(3, 'den', 'dny', 'dnů')),
        five: String(fn(5, 'den', 'dny', 'dnů')),
      };
    } catch (err) {
      return { missing: false, threw: err && err.message ? err.message : String(err) };
    }
  });

  if (result.missing) {
    warnings.push(`[${designName}] window.formatCzPlural is not defined on window.`);
    return;
  }

  if (result.threw) {
    errors.push(`[${designName}] window.formatCzPlural threw an error: ${result.threw}`);
    state.failed += 1;
    return;
  }

  const validOne = result.one === 'den' || result.one === '1 den';
  const validThree = result.three === 'dny' || result.three === '3 dny';
  const validFive = result.five === 'dnů' || result.five === '5 dnů';

  if (!validOne || !validThree || !validFive) {
    errors.push(
      `[${designName}] window.formatCzPlural returned unexpected forms: (1)=>"${result.one}", (3)=>"${result.three}", (5)=>"${result.five}"`
    );
    state.failed += 1;
  } else {
    state.passed += 1;
  }

  details.push({
    check: 'formatCzPlural',
    outputs: { 1: result.one, 3: result.three, 5: result.five },
  });
}

async function verifyThemeSwitching(page, { baseUrl, designName, siteRelPath }, state) {
  const { warnings, errors, details } = state;
  const label = `${designName}/theme`;
  const url = buildPageUrl(baseUrl, siteRelPath, 'index.html');

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);

  const readThemeState = async () =>
    page.evaluate(() => {
      const htmlTheme = document.documentElement.getAttribute('data-theme');
      const bodyTheme = document.body ? document.body.getAttribute('data-theme') : null;
      const effectiveTheme = (htmlTheme || bodyTheme || '').toLowerCase();
      const storedTheme = localStorage.getItem('festival_theme');
      const styles = document.body ? window.getComputedStyle(document.body) : null;
      return {
        htmlTheme,
        bodyTheme,
        effectiveTheme,
        storedTheme,
        color: styles ? styles.color : '',
        backgroundColor: styles ? styles.backgroundColor : '',
      };
    });

  const before = await readThemeState();

  if (before.effectiveTheme && before.effectiveTheme !== 'light' && before.effectiveTheme !== 'dark') {
    warnings.push(`[${label}] Unexpected initial data-theme="${before.effectiveTheme}" (expected "light" or "dark").`);
  }

  if (before.color && before.backgroundColor && before.color === before.backgroundColor) {
    warnings.push(
      `[${label}] Initial body color (${before.color}) matches backgroundColor (${before.backgroundColor}); text may be invisible.`
    );
  }

  let toggleMethod = '';
  const visibleThemeBtn = await findFirstVisibleLocator(page, THEME_TOGGLE_SELECTORS);

  if (visibleThemeBtn) {
    toggleMethod = `click(${visibleThemeBtn.selector})`;
    await visibleThemeBtn.locator.click();
  } else {
    warnings.push(
      `[${label}] No visible theme switch button found among (${THEME_TOGGLE_SELECTORS.join(', ')}); falling back to window.toggleFestivalTheme().`
    );
    const fallbackRes = await page.evaluate(() => {
      try {
        if (typeof window.toggleFestivalTheme === 'function') {
          window.toggleFestivalTheme();
          return { ok: true, method: 'window.toggleFestivalTheme()' };
        }
        if (window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.toggleTheme === 'function') {
          window.FESTIVAL_CORE.toggleTheme();
          return { ok: true, method: 'window.FESTIVAL_CORE.toggleTheme()' };
        }
        return { ok: false, reason: 'missing' };
      } catch (err) {
        return { ok: false, reason: 'threw', error: err && err.message ? err.message : String(err) };
      }
    });

    if (!fallbackRes.ok) {
      if (fallbackRes.reason === 'threw') {
        errors.push(`[${label}] toggleFestivalTheme() threw an exception: ${fallbackRes.error}`);
        state.failed += 1;
      } else {
        warnings.push(`[${label}] Theme toggling is not supported in this design (no button and no toggleFestivalTheme()).`);
      }
      return;
    }
    toggleMethod = fallbackRes.method;
  }

  await page
    .waitForFunction(
      (prevTheme) => {
        const cur = (
          document.documentElement.getAttribute('data-theme') ||
          (document.body && document.body.getAttribute('data-theme')) ||
          ''
        ).toLowerCase();
        return Boolean(cur) && cur !== prevTheme;
      },
      before.effectiveTheme,
      { timeout: 3000 }
    )
    .catch(() => {});

  const after = await readThemeState();
  const expectedToggled =
    before.effectiveTheme === 'dark'
      ? 'light'
      : before.effectiveTheme === 'light'
        ? 'dark'
        : null;

  if (!after.effectiveTheme || after.effectiveTheme === before.effectiveTheme) {
    warnings.push(
      `[${label}] Theme toggle (${toggleMethod}) did not change data-theme from "${before.effectiveTheme || '(unset)'}".`
    );
    return;
  }

  if (expectedToggled && after.effectiveTheme !== expectedToggled) {
    warnings.push(
      `[${label}] Expected data-theme="${expectedToggled}" after toggling from "${before.effectiveTheme}", got "${after.effectiveTheme}".`
    );
  } else {
    state.passed += 1;
  }

  if (after.storedTheme !== after.effectiveTheme) {
    warnings.push(
      `[${label}] localStorage.festival_theme ("${after.storedTheme}") did not match active data-theme ("${after.effectiveTheme}").`
    );
  } else {
    state.passed += 1;
  }

  if (after.color && after.backgroundColor && after.color === after.backgroundColor) {
    warnings.push(
      `[${label}] After switching to "${after.effectiveTheme}", body color (${after.color}) equals backgroundColor (${after.backgroundColor}).`
    );
  } else {
    state.passed += 1;
  }

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForPageReady(page);
  const reloaded = await readThemeState();

  if (reloaded.effectiveTheme !== after.effectiveTheme) {
    warnings.push(
      `[${label}] Theme "${after.effectiveTheme}" did not persist across page.reload() (reloaded as "${reloaded.effectiveTheme || '(unset)'}").`
    );
  } else {
    state.passed += 1;
  }

  if (reloaded.color && reloaded.backgroundColor && reloaded.color === reloaded.backgroundColor) {
    warnings.push(
      `[${label}] After reload in "${reloaded.effectiveTheme}", body color (${reloaded.color}) equals backgroundColor (${reloaded.backgroundColor}).`
    );
  }

  details.push({
    check: 'themeSwitch',
    toggleMethod,
    initialTheme: before.effectiveTheme || '(unset)',
    toggledTheme: after.effectiveTheme,
    reloadedTheme: reloaded.effectiveTheme,
    storedTheme: reloaded.storedTheme,
  });
}

async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot }) {
  if (isRoot) {
    return { passed: 0, failed: 0, warnings: [], errors: [], details: [] };
  }

  const state = {
    passed: 0,
    failed: 0,
    warnings: [],
    errors: [],
    details: [],
  };

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });

  try {
    const page = await context.newPage();

    page.on('pageerror', (err) => {
      state.errors.push(`[${designName}/i18n-theme] Uncaught pageerror: ${err.message}`);
      state.failed += 1;
    });

    const availablePages = Array.isArray(pages) && pages.length > 0 ? pages : ['index.html', 'program.html'];

    if (availablePages.includes('index.html')) {
      await verifyPageI18n(
        page,
        {
          baseUrl,
          designName,
          siteRelPath,
          pageName: 'index.html',
          checkPersistence: availablePages.includes('my-schedule.html'),
        },
        state
      );
      await verifyCzPluralHelper(page, designName, state);
    }

    if (availablePages.includes('program.html')) {
      await verifyPageI18n(
        page,
        {
          baseUrl,
          designName,
          siteRelPath,
          pageName: 'program.html',
          checkPersistence: false,
        },
        state
      );
    }

    await verifyThemeSwitching(page, { baseUrl, designName, siteRelPath }, state);
  } finally {
    await context.close();
  }

  return state;
}

module.exports = { run };
