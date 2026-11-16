'use strict';

let AxeBuilder = null;
try {
  ({ AxeBuilder } = require('@axe-core/playwright'));
} catch (_) {
  AxeBuilder = null;
}

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const TARGET_PAGES = ['index.html', 'program.html', 'my-schedule.html', 'search.html'];

function buildPageUrl(baseUrl, siteRelPath, pageName, isRoot) {
  const cleanBase = String(baseUrl || '').replace(/\/+$/, '');
  if (isRoot) {
    return `${cleanBase}/${pageName || 'index.html'}`;
  }
  const cleanRel = String(siteRelPath || '').replace(/^\/+|\/+$/g, '');
  return cleanRel ? `${cleanBase}/${cleanRel}/${pageName}` : `${cleanBase}/${pageName}`;
}

function isLocalUrl(url, baseUrl) {
  if (!url) return false;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return false;
  try {
    const parsed = new URL(url);
    const base = new URL(baseUrl);
    return parsed.origin === base.origin || parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  } catch (_) {
    return url.startsWith('/');
  }
}

async function waitForPageReady(page, isRoot) {
  await page.waitForFunction(
    () => document.readyState === 'complete' && document.body && document.body.innerText.trim().length > 0,
    null,
    { timeout: 6000 }
  ).catch(() => {});

  if (!isRoot) {
    await page.waitForFunction(
      () => Boolean(window.FESTIVAL_CORE || window.FESTIVAL_DATA || document.querySelector('main, [role="main"], header, nav')),
      null,
      { timeout: 3000 }
    ).catch(() => {});
  }
  await page.evaluate(() => new Promise((r) => setTimeout(r, 20)));
}

async function installPerfObservers(page) {
  await page.addInitScript(() => {
    window.__perfMetrics = { lcp: null, fcp: null };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          window.__perfMetrics.lcp = entries[entries.length - 1].startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            window.__perfMetrics.fcp = entry.startTime;
          }
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (_) {}
  });
}

async function toggleTheme(page) {
  const beforeState = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      htmlTheme: html.getAttribute('data-theme'),
      htmlClass: html.className,
      bodyTheme: body ? body.getAttribute('data-theme') : null,
      bodyClass: body ? body.className : '',
      colorScheme: getComputedStyle(html).colorScheme,
    };
  });

  const clicked = await page.evaluate(() => {
    const selectors = [
      '.theme-switch-btn',
      '#theme-switch-btn',
      '[data-theme-toggle]',
      '[data-action="toggle-theme"]',
      '#theme-toggle',
      '#themeToggle',
      '.theme-toggle',
      'button[aria-label*="theme" i]',
      'button[aria-label*="dark" i]',
      'button[aria-label*="light" i]',
      'button[aria-label*="režim" i]',
      'button[aria-label*="motiv" i]',
      'button[title*="theme" i]',
      'button[title*="dark" i]',
      'button[title*="light" i]',
      'button[title*="režim" i]',
      'button[title*="motiv" i]',
      '[data-set-theme]',
    ];
    for (const sel of selectors) {
      const candidates = Array.from(document.querySelectorAll(sel));
      for (const el of candidates) {
        const style = getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          el.click();
          return true;
        }
      }
    }
    return false;
  });

  if (clicked) {
    await page.waitForFunction(
      (prev) => {
        const html = document.documentElement;
        const body = document.body;
        return (
          html.getAttribute('data-theme') !== prev.htmlTheme ||
          html.className !== prev.htmlClass ||
          (body ? body.getAttribute('data-theme') : null) !== prev.bodyTheme ||
          (body ? body.className : '') !== prev.bodyClass
        );
      },
      beforeState,
      { timeout: 1000 }
    ).catch(() => {});
  }

  const afterClickState = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    return {
      htmlTheme: html.getAttribute('data-theme'),
      htmlClass: html.className,
      bodyTheme: body ? body.getAttribute('data-theme') : null,
      bodyClass: body ? body.className : '',
    };
  });

  const changedByClick =
    afterClickState.htmlTheme !== beforeState.htmlTheme ||
    afterClickState.htmlClass !== beforeState.htmlClass ||
    afterClickState.bodyTheme !== beforeState.bodyTheme ||
    afterClickState.bodyClass !== beforeState.bodyClass;

  if (!changedByClick) {
    await page.evaluate(() => {
      if (typeof window.toggleFestivalTheme === 'function') {
        window.toggleFestivalTheme();
        return;
      }
      if (window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.toggleTheme === 'function') {
        window.FESTIVAL_CORE.toggleTheme();
        return;
      }
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      if (current === 'dark') {
        html.setAttribute('data-theme', 'light');
      } else if (current === 'light') {
        html.setAttribute('data-theme', 'dark');
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'light' : 'dark');
      }
    });
  }

  const finalTheme = await page.evaluate(() => {
    const html = document.documentElement;
    return html.getAttribute('data-theme') || (html.classList.contains('dark-mode') ? 'dark' : 'toggled');
  });

  return { toggled: true, mode: clicked ? 'ui-click' : 'dom-fallback', theme: finalTheme };
}

async function runAxeAudit(page, label, warnings) {
  if (!AxeBuilder) {
    return { skipped: true, violations: [] };
  }
  try {
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    const violations = results.violations || [];
    for (const v of violations) {
      const firstNode = Array.isArray(v.nodes) && v.nodes.length > 0 ? v.nodes[0] : null;
      const firstSelector = firstNode && Array.isArray(firstNode.target) && firstNode.target.length > 0
        ? String(firstNode.target[0])
        : 'unknown';
      warnings.push(
        `[a11y][${label}] (${v.impact || 'unknown'}) ${v.id}: ${v.nodes.length} node(s) — first: ${firstSelector}`
      );
    }
    return {
      skipped: false,
      violations: violations.map((v) => ({
        id: v.id,
        impact: v.impact || 'unknown',
        count: v.nodes.length,
        firstSelector:
          v.nodes[0] && Array.isArray(v.nodes[0].target) ? v.nodes[0].target[0] : 'unknown',
      })),
    };
  } catch (err) {
    warnings.push(`[a11y][${label}] Axe analysis failed: ${err && err.message ? err.message : String(err)}`);
    return { skipped: true, error: String(err), violations: [] };
  }
}

async function auditSemanticsAndStaticStyles(page, pageLabel, warnings) {
  const audit = await page.evaluate(() => {
    const htmlLang = (document.documentElement.getAttribute('lang') || '').trim().toLowerCase();
    const coreLang =
      window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.getLang === 'function'
        ? String(window.FESTIVAL_CORE.getLang() || '').trim().toLowerCase()
        : null;
    const storedLang = (() => {
      try {
        return (localStorage.getItem('festival_language') || localStorage.getItem('festival_lang') || '').trim().toLowerCase();
      } catch (_) {
        return '';
      }
    })();

    const mainEls = document.querySelectorAll('main, [role="main"]');
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el) => ({
      level: Number(el.tagName.slice(1)),
      text: (el.textContent || '').trim().slice(0, 60),
    }));

    const h1Count = headings.filter((h) => h.level === 1).length;
    const skippedHeadings = [];
    for (let i = 1; i < headings.length; i++) {
      const prev = headings[i - 1].level;
      const curr = headings[i].level;
      if (curr - prev > 1) {
        skippedHeadings.push(`h${prev} -> h${curr} ("${headings[i].text}")`);
      }
    }

    const inlineStyled = Array.from(document.querySelectorAll('[style]')).map((el) => {
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls =
        typeof el.className === 'string' && el.className.trim()
          ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
          : '';
      return `${tag}${id}${cls}`;
    });

    return {
      htmlLang,
      coreLang,
      storedLang,
      mainCount: mainEls.length,
      h1Count,
      skippedHeadings,
      inlineStyleCount: inlineStyled.length,
      inlineStyleSample: inlineStyled.slice(0, 5),
    };
  });

  if (!audit.htmlLang) {
    warnings.push(`[semantics][${pageLabel}] Missing <html lang="..."> attribute`);
  } else {
    const expectedLang = audit.coreLang || audit.storedLang;
    if (expectedLang && !audit.htmlLang.startsWith(expectedLang.slice(0, 2))) {
      warnings.push(
        `[semantics][${pageLabel}] <html lang="${audit.htmlLang}"> does not match active language "${expectedLang}"`
      );
    }
  }

  if (audit.mainCount === 0) {
    warnings.push(`[semantics][${pageLabel}] Missing <main> landmark`);
  } else if (audit.mainCount > 1) {
    warnings.push(`[semantics][${pageLabel}] Multiple <main> landmarks found (${audit.mainCount})`);
  }

  if (audit.h1Count === 0) {
    warnings.push(`[semantics][${pageLabel}] Missing <h1> heading`);
  } else if (audit.h1Count > 1) {
    warnings.push(`[semantics][${pageLabel}] Multiple <h1> headings found (${audit.h1Count})`);
  }

  if (audit.skippedHeadings.length > 0) {
    warnings.push(
      `[semantics][${pageLabel}] Skipped heading level(s): ${audit.skippedHeadings.join('; ')}`
    );
  }

  if (audit.inlineStyleCount > 0) {
    warnings.push(
      `[style-policy][${pageLabel}] Found ${audit.inlineStyleCount} element(s) with inline style="" attribute (AGENTS.md forbids inline styles) — sample: ${audit.inlineStyleSample.join(', ')}`
    );
  }

  return audit;
}

async function auditKeyboardFocus(page, pageLabel, warnings) {
  const focusSteps = [];
  const visitedSignatures = new Set();

  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) {
        return { isBody: true };
      }
      const cs = getComputedStyle(el);
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : '';
      const cls =
        typeof el.className === 'string' && el.className.trim()
          ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}`
          : '';
      const role = el.getAttribute('role') || '';
      const href = el.getAttribute('href') || '';
      const text = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40);
      const isInteractive =
        ['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(tag) ||
        ['button', 'link', 'tab', 'menuitem', 'checkbox', 'radio', 'switch', 'searchbox'].includes(role) ||
        el.hasAttribute('tabindex');
      const hasVisibleOutline = cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px';
      const hasVisibleShadow = Boolean(cs.boxShadow && cs.boxShadow !== 'none');

      return {
        isBody: false,
        signature: `${tag}${id}${cls}|${href}|${text}`,
        tag,
        selector: `${tag}${id}${cls}`,
        isInteractive,
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        boxShadow: cs.boxShadow,
        hasVisibleIndicator: hasVisibleOutline || hasVisibleShadow,
      };
    });

    focusSteps.push(info);
    if (!info.isBody && info.signature) {
      visitedSignatures.add(info.signature);
    }
  }

  const interactiveStops = focusSteps.filter((s) => !s.isBody && s.isInteractive);
  const missingIndicatorStops = interactiveStops.filter((s) => !s.hasVisibleIndicator);

  if (interactiveStops.length === 0) {
    warnings.push(`[keyboard][${pageLabel}] Pressing Tab 5 times did not focus any interactive element`);
  } else if (visitedSignatures.size < Math.min(2, interactiveStops.length)) {
    warnings.push(
      `[keyboard][${pageLabel}] Tab focus did not advance across multiple distinct interactive elements (unique=${visitedSignatures.size})`
    );
  }

  if (missingIndicatorStops.length > 0) {
    const selectors = [...new Set(missingIndicatorStops.map((s) => s.selector))].join(', ');
    warnings.push(
      `[keyboard][${pageLabel}] ${missingIndicatorStops.length}/${interactiveStops.length} focused interactive element(s) lack a visible focus indicator (outlineStyle !== 'none' or boxShadow !== 'none'): ${selectors}`
    );
  }

  return {
    tabPresses: 5,
    interactiveStopsCount: interactiveStops.length,
    uniqueFocusedCount: visitedSignatures.size,
    missingIndicatorCount: missingIndicatorStops.length,
    steps: focusSteps,
  };
}

async function collectPerfMetrics(page, pageLabel, warnings) {
  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');
    const injected = window.__perfMetrics || {};

    let lcpValue = typeof injected.lcp === 'number' ? injected.lcp : null;
    if (lcpValue === null) {
      try {
        const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
        if (lcpEntries && lcpEntries.length > 0) {
          lcpValue = lcpEntries[lcpEntries.length - 1].startTime;
        }
      } catch (_) {}
    }

    const fcpValue = fcpEntry
      ? fcpEntry.startTime
      : typeof injected.fcp === 'number'
      ? injected.fcp
      : null;

    return {
      ttfbMs: nav ? Math.round((nav.responseStart - nav.requestStart) * 100) / 100 : null,
      domContentLoadedMs: nav ? Math.round((nav.domContentLoadedEventEnd - nav.startTime) * 100) / 100 : null,
      loadCompleteMs: nav ? Math.round((nav.loadEventEnd - nav.startTime) * 100) / 100 : null,
      fcpMs: fcpValue !== null ? Math.round(fcpValue * 100) / 100 : null,
      lcpMs: lcpValue !== null ? Math.round(lcpValue * 100) / 100 : null,
      domNodeCount: document.querySelectorAll('*').length,
    };
  });

  if (perf.fcpMs !== null && perf.fcpMs > 2500) {
    warnings.push(`[perf][${pageLabel}] High FCP: ${perf.fcpMs}ms (> 2500ms)`);
  }
  if (perf.lcpMs !== null && perf.lcpMs > 2500) {
    warnings.push(`[perf][${pageLabel}] High LCP: ${perf.lcpMs}ms (> 2500ms)`);
  }
  if (perf.domNodeCount > 2500) {
    warnings.push(`[perf][${pageLabel}] Large DOM: ${perf.domNodeCount} nodes (> 2500 nodes)`);
  }

  return perf;
}

async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot }) {
  let passed = 0;
  let failed = 0;
  const warnings = [];
  const errors = [];
  const details = [];

  if (!AxeBuilder) {
    warnings.push('[a11y] @axe-core/playwright is not installed or failed to load; skipping axe WCAG scans.');
  }

  const availablePages = Array.isArray(pages) && pages.length > 0 ? pages : TARGET_PAGES;
  const pagesToAudit = isRoot
    ? ['index.html']
    : TARGET_PAGES.filter((p) => availablePages.includes(p));

  const effectivePages = pagesToAudit.length > 0 ? pagesToAudit : ['index.html'];

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  try {
    for (const pageName of effectivePages) {
      const page = await context.newPage();
      const url = buildPageUrl(baseUrl, siteRelPath, pageName, isRoot);
      const pageLabel = isRoot ? 'root/index.html' : `${designName}/${pageName}`;
      const localNetworkErrors = [];
      const runtimeErrors = [];

      page.on('pageerror', (err) => {
        runtimeErrors.push(`pageerror: ${err && err.message ? err.message : String(err)}`);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (/fonts\.googleapis|fonts\.gstatic|cdn\.|unpkg\.com|jsdelivr/i.test(text)) {
            warnings.push(`[external-console][${pageLabel}] ${text}`);
          } else {
            runtimeErrors.push(`console.error: ${text}`);
          }
        }
      });

      page.on('response', (res) => {
        const status = res.status();
        const reqUrl = res.url();
        if (status >= 400) {
          if (isLocalUrl(reqUrl, baseUrl)) {
            localNetworkErrors.push(`HTTP ${status} on local asset ${reqUrl}`);
          } else {
            warnings.push(`[external-http][${pageLabel}] HTTP ${status} on ${reqUrl}`);
          }
        }
      });

      page.on('requestfailed', (req) => {
        const reqUrl = req.url();
        const failureText = req.failure() ? req.failure().errorText : 'unknown';
        if (failureText === 'net::ERR_ABORTED') return;
        if (isLocalUrl(reqUrl, baseUrl)) {
          localNetworkErrors.push(`requestfailed (${failureText}) on local asset ${reqUrl}`);
        } else {
          warnings.push(`[external-requestfailed][${pageLabel}] (${failureText}) ${reqUrl}`);
        }
      });

      try {
        await installPerfObservers(page);
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        if (!response || response.status() >= 400) {
          const status = response ? response.status() : 'no-response';
          errors.push(`[${pageLabel}] Failed to load page (${status}) at ${url}`);
          failed += 1;
          details.push({ page: pageName, url, status, ok: false });
          continue;
        }

        await waitForPageReady(page, isRoot);

        const perfMetrics = await collectPerfMetrics(page, pageLabel, warnings);
        const semanticAudit = await auditSemanticsAndStaticStyles(page, pageLabel, warnings);

        let keyboardAudit = null;
        if (pageName === 'index.html') {
          keyboardAudit = await auditKeyboardFocus(page, pageLabel, warnings);
        }

        const nativeAxe = await runAxeAudit(page, `${pageLabel}:native`, warnings);

        let toggledAxe = { skipped: true, violations: [] };
        let themeToggleResult = { toggled: false, mode: 'skipped', theme: 'n/a' };
        if (!isRoot) {
          themeToggleResult = await toggleTheme(page);
          toggledAxe = await runAxeAudit(
            page,
            `${pageLabel}:toggled(${themeToggleResult.theme})`,
            warnings
          );
        }

        if (localNetworkErrors.length > 0 || runtimeErrors.length > 0) {
          for (const e of localNetworkErrors) errors.push(`[${pageLabel}] ${e}`);
          for (const e of runtimeErrors) errors.push(`[${pageLabel}] ${e}`);
          failed += 1;
        } else {
          passed += 1;
        }

        details.push({
          page: pageName,
          url,
          ok: localNetworkErrors.length === 0 && runtimeErrors.length === 0,
          perf: perfMetrics,
          semantics: semanticAudit,
          keyboard: keyboardAudit,
          axeNative: {
            skipped: nativeAxe.skipped,
            violationCount: nativeAxe.violations.length,
            violations: nativeAxe.violations,
          },
          axeToggled: {
            skipped: toggledAxe.skipped,
            theme: themeToggleResult.theme,
            toggleMode: themeToggleResult.mode,
            violationCount: toggledAxe.violations.length,
            violations: toggledAxe.violations,
          },
        });
      } catch (err) {
        failed += 1;
        errors.push(`[${pageLabel}] Unexpected audit error: ${err && err.message ? err.message : String(err)}`);
        details.push({
          page: pageName,
          url,
          ok: false,
          error: err && err.message ? err.message : String(err),
        });
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await context.close().catch(() => {});
  }

  return {
    passed,
    failed,
    warnings,
    errors,
    details,
  };
}

module.exports = { run };
