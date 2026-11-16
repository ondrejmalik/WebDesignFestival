'use strict';

/**
 * tests/e2e/specs/runtime-and-links.js
 *
 * Design-agnostic runtime health, link integrity, asset readiness, and core script verification
 * for WebDesignFestival (root hub + 11 design variants).
 */

function isLocalUrl(urlString, baseOrigin) {
  if (!urlString) return false;
  if (urlString.startsWith('data:') || urlString.startsWith('blob:') || urlString.startsWith('about:')) {
    return false;
  }
  try {
    const parsed = new URL(urlString);
    return (
      parsed.origin === baseOrigin ||
      parsed.hostname === '127.0.0.1' ||
      parsed.hostname === 'localhost'
    );
  } catch {
    return false;
  }
}

function attachPageListeners(page, { baseOrigin, contextLabel, errors, warnings, pageTelemetry }) {
  page.on('pageerror', (err) => {
    const msg = err && err.message ? err.message : String(err);
    errors.push(`[${contextLabel}] Uncaught pageerror: ${msg}`);
    pageTelemetry.pageErrors.push(msg);
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const loc = msg.location();
    const locStr = loc && loc.url ? ` (${loc.url}:${loc.lineNumber || 0})` : '';

    if (type === 'error') {
      const isExternalRef =
        (loc && loc.url && !isLocalUrl(loc.url, baseOrigin) && /^https?:\/\//i.test(loc.url)) ||
        /fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|cdnjs\.cloudflare\.com/i.test(text);

      if (isExternalRef) {
        warnings.push(`[${contextLabel}] External console.error: ${text}${locStr}`);
      } else {
        errors.push(`[${contextLabel}] console.error: ${text}${locStr}`);
        pageTelemetry.consoleErrors.push(text);
      }
    } else if (type === 'warning') {
      warnings.push(`[${contextLabel}] console.warning: ${text}${locStr}`);
      pageTelemetry.consoleWarnings.push(text);
    }
  });

  page.on('requestfailed', (request) => {
    const reqUrl = request.url();
    const failure = request.failure();
    const errorText = failure ? failure.errorText : 'unknown';

    if (errorText === 'net::ERR_ABORTED') return;

    if (isLocalUrl(reqUrl, baseOrigin)) {
      errors.push(`[${contextLabel}] Local requestfailed (${errorText}): ${reqUrl}`);
      pageTelemetry.failedRequests.push({ url: reqUrl, reason: errorText, local: true });
    } else {
      warnings.push(`[${contextLabel}] External requestfailed (${errorText}): ${reqUrl}`);
      pageTelemetry.failedRequests.push({ url: reqUrl, reason: errorText, local: false });
    }
  });

  page.on('response', (response) => {
    const status = response.status();
    if (status < 400) return;
    const resUrl = response.url();

    if (isLocalUrl(resUrl, baseOrigin)) {
      errors.push(`[${contextLabel}] Local HTTP ${status}: ${resUrl}`);
      pageTelemetry.httpErrors.push({ url: resUrl, status, local: true });
    } else {
      warnings.push(`[${contextLabel}] External HTTP ${status}: ${resUrl}`);
      pageTelemetry.httpErrors.push({ url: resUrl, status, local: false });
    }
  });
}

async function waitForPageSettle(page, isV2Design) {
  await page.waitForFunction(
    () => document.readyState === 'complete',
    undefined,
    { timeout: 10000 }
  );

  if (isV2Design) {
    await page
      .waitForFunction(
        () => Boolean(window.FESTIVAL_DATA && window.FESTIVAL_CORE),
        undefined,
        { timeout: 5000 }
      )
      .catch(() => {});
  }
}

async function verifyLinksWithHttp(context, baseUrl, baseOrigin, links, contextLabel, errors, warnings) {
  const checkedUrls = new Set();

  for (const link of links) {
    const rawHref = (link.href || '').trim();
    if (
      !rawHref ||
      rawHref.startsWith('#') ||
      rawHref.startsWith('mailto:') ||
      rawHref.startsWith('tel:') ||
      rawHref.startsWith('javascript:')
    ) {
      continue;
    }

    let resolvedUrl;
    try {
      resolvedUrl = new URL(link.resolvedHref || rawHref, baseUrl).toString();
    } catch {
      errors.push(`[${contextLabel}] Malformed link href "${rawHref}"`);
      continue;
    }

    const fetchTarget = resolvedUrl.split('#')[0];
    if (!fetchTarget || checkedUrls.has(fetchTarget)) continue;
    checkedUrls.add(fetchTarget);

    if (!isLocalUrl(fetchTarget, baseOrigin)) {
      warnings.push(`[${contextLabel}] External nav link skipped HTTP probe: ${fetchTarget}`);
      continue;
    }

    try {
      const response = await context.request.get(fetchTarget, { timeout: 8000 });
      const status = response.status();
      if (status >= 400) {
        errors.push(`[${contextLabel}] Broken local link (${status}): "${rawHref}" -> ${fetchTarget}`);
      }
    } catch (err) {
      errors.push(
        `[${contextLabel}] Failed fetching local link "${rawHref}" (${fetchTarget}): ${err.message}`
      );
    }
  }
}

async function runRootHubAudit({ browser, baseUrl, baseOrigin, errors, warnings, details }) {
  let passed = 0;
  let failed = 0;
  const pageUrl = new URL('/index.html', baseUrl).toString();
  const contextLabel = 'root:/index.html';

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  try {
    const page = await context.newPage();
    const pageTelemetry = {
      pageErrors: [],
      consoleErrors: [],
      consoleWarnings: [],
      failedRequests: [],
      httpErrors: [],
    };

    const errStart = errors.length;
    attachPageListeners(page, { baseOrigin, contextLabel, errors, warnings, pageTelemetry });

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await waitForPageSettle(page, false);

    const docMetrics = await page.evaluate(() => {
      const title = (document.title || '').trim();
      const bodyText = document.body ? document.body.innerText.trim() : '';
      const h1Count = document.querySelectorAll('h1').length;

      const cardAnchors = Array.from(document.querySelectorAll('a.card, .card a'));
      const seen = new Set();
      const cards = [];

      for (const a of cardAnchors) {
        const href = a.getAttribute('href') || '';
        const resolvedHref = a.href || '';
        const key = `${href}|${resolvedHref}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const rect = a.getBoundingClientRect();
        const style = window.getComputedStyle(a);
        const visible =
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0;

        cards.push({
          href,
          resolvedHref,
          text: (a.innerText || '').trim().slice(0, 60),
          visible,
        });
      }

      return { title, bodyLength: bodyText.length, h1Count, cards };
    });

    if (!docMetrics.title) {
      errors.push(`[${contextLabel}] Empty <title> on root hub`);
    }
    if (docMetrics.bodyLength === 0) {
      errors.push(`[${contextLabel}] Empty visible body text on root hub`);
    }
    if (docMetrics.h1Count === 0) {
      warnings.push(`[${contextLabel}] Missing <h1> on root hub`);
    }

    if (docMetrics.cards.length < 11) {
      errors.push(
        `[${contextLabel}] Expected at least 11 .card design links, found ${docMetrics.cards.length}`
      );
    }

    for (let i = 1; i <= 11; i++) {
      const prefix = String(i).padStart(2, '0');
      const expectedPattern = new RegExp(`designs/${prefix}-[^/]+/(v2|web)/index\\.html`, 'i');
      const match = docMetrics.cards.find(
        (c) => expectedPattern.test(c.href) || expectedPattern.test(c.resolvedHref)
      );

      if (!match) {
        errors.push(`[${contextLabel}] Missing .card link for design #${prefix} (designs/${prefix}-*/v2/index.html)`);
      } else if (!match.visible) {
        errors.push(`[${contextLabel}] Design #${prefix} .card link is not visible (${match.href})`);
      }
    }

    await verifyLinksWithHttp(
      context,
      pageUrl,
      baseOrigin,
      docMetrics.cards,
      contextLabel,
      errors,
      warnings
    );

    const pageHadErrors = errors.length > errStart;
    if (pageHadErrors) {
      failed += 1;
    } else {
      passed += 1;
    }

    details.push({
      page: '/index.html',
      status: pageHadErrors ? 'failed' : 'passed',
      cardCount: docMetrics.cards.length,
      title: docMetrics.title,
      telemetry: pageTelemetry,
    });
  } finally {
    await context.close();
  }

  return { passed, failed };
}

async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot }) {
  const errors = [];
  const warnings = [];
  const details = [];
  let passed = 0;
  let failed = 0;

  const baseOrigin = new URL(baseUrl).origin;

  if (isRoot) {
    const rootResult = await runRootHubAudit({
      browser,
      baseUrl,
      baseOrigin,
      errors,
      warnings,
      details,
    });
    return {
      passed: rootResult.passed,
      failed: rootResult.failed,
      warnings,
      errors,
      details,
    };
  }

  const normalizedRelPath = (siteRelPath || `designs/${designName}/v2`)
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  const isV2Design = /\/v2$/i.test(normalizedRelPath);
  const basePages =
    Array.isArray(pages) && pages.length > 0
      ? pages
      : [
          'index.html',
          'program.html',
          'artists.html',
          'artist-detail.html',
          'stages.html',
          'practical-info.html',
          'my-schedule.html',
          'search.html',
        ];
  const targetPages = basePages.map((p) => (p === 'artist-detail.html' ? 'artist-detail.html?id=perf-01' : p));

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  try {
    const page = await context.newPage();

    const activeState = {
      contextLabel: `${designName}:init`,
      pageTelemetry: {
        pageErrors: [],
        consoleErrors: [],
        consoleWarnings: [],
        failedRequests: [],
        httpErrors: [],
      },
    };

    page.on('pageerror', (err) => {
      const msg = err && err.message ? err.message : String(err);
      errors.push(`[${activeState.contextLabel}] Uncaught pageerror: ${msg}`);
      activeState.pageTelemetry.pageErrors.push(msg);
    });

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const loc = msg.location();
      const locStr = loc && loc.url ? ` (${loc.url}:${loc.lineNumber || 0})` : '';

      if (type === 'error') {
        const isExternalRef =
          (loc && loc.url && !isLocalUrl(loc.url, baseOrigin) && /^https?:\/\//i.test(loc.url)) ||
          /fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|cdnjs\.cloudflare\.com/i.test(text);

        if (isExternalRef) {
          warnings.push(`[${activeState.contextLabel}] External console.error: ${text}${locStr}`);
        } else {
          errors.push(`[${activeState.contextLabel}] console.error: ${text}${locStr}`);
          activeState.pageTelemetry.consoleErrors.push(text);
        }
      } else if (type === 'warning') {
        warnings.push(`[${activeState.contextLabel}] console.warning: ${text}${locStr}`);
        activeState.pageTelemetry.consoleWarnings.push(text);
      }
    });

    page.on('requestfailed', (request) => {
      const reqUrl = request.url();
      const failure = request.failure();
      const errorText = failure ? failure.errorText : 'unknown';

      if (errorText === 'net::ERR_ABORTED') return;

      if (isLocalUrl(reqUrl, baseOrigin)) {
        errors.push(`[${activeState.contextLabel}] Local requestfailed (${errorText}): ${reqUrl}`);
        activeState.pageTelemetry.failedRequests.push({ url: reqUrl, reason: errorText, local: true });
      } else {
        warnings.push(`[${activeState.contextLabel}] External requestfailed (${errorText}): ${reqUrl}`);
        activeState.pageTelemetry.failedRequests.push({ url: reqUrl, reason: errorText, local: false });
      }
    });

    page.on('response', (response) => {
      const status = response.status();
      if (status < 400) return;
      const resUrl = response.url();

      if (isLocalUrl(resUrl, baseOrigin)) {
        errors.push(`[${activeState.contextLabel}] Local HTTP ${status}: ${resUrl}`);
        activeState.pageTelemetry.httpErrors.push({ url: resUrl, status, local: true });
      } else {
        warnings.push(`[${activeState.contextLabel}] External HTTP ${status}: ${resUrl}`);
        activeState.pageTelemetry.httpErrors.push({ url: resUrl, status, local: false });
      }
    });

    const verifiedNavTargets = new Set();

    for (const pageEntry of targetPages) {
      const cleanEntry = pageEntry.replace(/^\/+/, '');
      const fullUrl = new URL(`/${normalizedRelPath}/${cleanEntry}`, baseUrl).toString();
      const contextLabel = `${designName}/${cleanEntry}`;

      activeState.contextLabel = contextLabel;
      activeState.pageTelemetry = {
        pageErrors: [],
        consoleErrors: [],
        consoleWarnings: [],
        failedRequests: [],
        httpErrors: [],
      };

      const errStart = errors.length;

      try {
        const navResponse = await page.goto(fullUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        if (!navResponse) {
          errors.push(`[${contextLabel}] Navigation returned null response for ${fullUrl}`);
        } else if (navResponse.status() >= 400) {
          errors.push(`[${contextLabel}] Navigation HTTP ${navResponse.status()} for ${fullUrl}`);
        }

        await waitForPageSettle(page, isV2Design);

        const audit = await page.evaluate((expectV2Globals) => {
          const title = (document.title || '').trim();
          const bodyText = document.body ? document.body.innerText.trim() : '';
          const h1Els = Array.from(document.querySelectorAll('h1'));
          const h1Text = h1Els.map((el) => (el.innerText || '').trim()).filter(Boolean);

          const hasFestivalData = typeof window.FESTIVAL_DATA !== 'undefined' && window.FESTIVAL_DATA !== null;
          const hasFestivalCore = typeof window.FESTIVAL_CORE !== 'undefined' && window.FESTIVAL_CORE !== null;

          const navSelectors = [
            'header a[href]',
            'nav a[href]',
            '[role="navigation"] a[href]',
            '.nav a[href]',
            '.navbar a[href]',
            '.site-nav a[href]',
            '.menu a[href]',
            'footer a[href]',
          ];
          const navAnchorSet = new Set();
          for (const sel of navSelectors) {
            for (const a of document.querySelectorAll(sel)) {
              navAnchorSet.add(a);
            }
          }

          const navLinks = Array.from(navAnchorSet).map((a) => ({
            href: a.getAttribute('href') || '',
            resolvedHref: a.href || '',
            text: (a.innerText || '').trim().slice(0, 50),
          }));

          const brokenImages = [];
          let visibleImageCount = 0;

          for (const img of Array.from(document.querySelectorAll('img'))) {
            const rect = img.getBoundingClientRect();
            const style = window.getComputedStyle(img);
            const isVisible =
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              parseFloat(style.opacity || '1') > 0 &&
              (rect.width > 0 || rect.height > 0 || img.offsetParent !== null);

            if (!isVisible) continue;
            visibleImageCount += 1;

            if (!img.complete || img.naturalWidth === 0) {
              brokenImages.push({
                src: img.getAttribute('src') || '',
                currentSrc: img.currentSrc || '',
                alt: (img.getAttribute('alt') || '').slice(0, 50),
                complete: img.complete,
                naturalWidth: img.naturalWidth,
              });
            }
          }

          return {
            title,
            bodyLength: bodyText.length,
            h1Count: h1Els.length,
            h1Text,
            expectV2Globals,
            hasFestivalData,
            hasFestivalCore,
            navLinks,
            visibleImageCount,
            brokenImages,
          };
        }, isV2Design);

        if (!audit.title) {
          errors.push(`[${contextLabel}] Empty <title>`);
        }
        if (audit.bodyLength === 0) {
          errors.push(`[${contextLabel}] Empty visible body text`);
        }
        if (audit.h1Count === 0) {
          warnings.push(`[${contextLabel}] Missing <h1> element`);
        }

        if (isV2Design) {
          if (!audit.hasFestivalData) {
            errors.push(`[${contextLabel}] window.FESTIVAL_DATA is missing or undefined`);
          }
          if (!audit.hasFestivalCore) {
            errors.push(`[${contextLabel}] window.FESTIVAL_CORE is missing or undefined`);
          }
        }

        for (const img of audit.brokenImages) {
          const targetSrc = img.currentSrc || img.src || '(no src)';
          const isExternalImg =
            /^https?:\/\//i.test(targetSrc) &&
            !targetSrc.includes('127.0.0.1') &&
            !targetSrc.includes('localhost');

          if (isExternalImg) {
            warnings.push(
              `[${contextLabel}] External visible <img> failed to load: src="${img.src}" alt="${img.alt}"`
            );
          } else {
            errors.push(
              `[${contextLabel}] Broken local visible <img> (complete=${img.complete}, naturalWidth=${img.naturalWidth}): src="${img.src}" alt="${img.alt}"`
            );
          }
        }

        const unverifiedLinks = audit.navLinks.filter((l) => {
          try {
            const abs = new URL(l.resolvedHref || l.href, fullUrl).toString().split('#')[0];
            if (verifiedNavTargets.has(abs)) return false;
            verifiedNavTargets.add(abs);
            return true;
          } catch {
            return true;
          }
        });

        await verifyLinksWithHttp(
          context,
          fullUrl,
          baseOrigin,
          unverifiedLinks,
          contextLabel,
          errors,
          warnings
        );
      } catch (err) {
        errors.push(`[${contextLabel}] Page audit exception: ${err.message}`);
      }

      const pageHadErrors = errors.length > errStart;
      if (pageHadErrors) {
        failed += 1;
      } else {
        passed += 1;
      }

      details.push({
        page: cleanEntry,
        url: fullUrl,
        status: pageHadErrors ? 'failed' : 'passed',
        telemetry: { ...activeState.pageTelemetry },
      });
    }
  } finally {
    await context.close();
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
