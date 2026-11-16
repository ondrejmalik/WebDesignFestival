// tests/e2e/specs/responsiveness-layout.js
'use strict';

const SECONDARY_VIEWPORTS = [
  { width: 320, height: 900, label: '320x900' },
  { width: 768, height: 900, label: '768x900' },
  { width: 1024, height: 900, label: '1024x900' },
  { width: 1440, height: 900, label: '1440x900' },
];

const MOBILE_PRIMARY_VIEWPORT = { width: 375, height: 812, label: '375x812' };

function buildPageUrl(baseUrl, siteRelPath, pageName, isRoot) {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  if (isRoot) {
    return `${cleanBase}/index.html`;
  }
  const cleanRel = String(siteRelPath || '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  return cleanRel ? `${cleanBase}/${cleanRel}/${pageName}` : `${cleanBase}/${pageName}`;
}

async function waitForPageReady(page) {
  await page
    .waitForFunction(
      () => {
        const bodyReady = document.body && document.body.innerText.trim().length > 0;
        const complete = document.readyState === 'complete';
        return complete && bodyReady;
      },
      { timeout: 6000 }
    )
    .catch(() => {});

  await page
    .evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      }
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    })
    .catch(() => {});
}

async function setLanguage(page, lang) {
  if (!lang || lang === 'en') return true;

  const switched = await page
    .evaluate((targetLang) => {
      try {
        localStorage.setItem('festival_language', targetLang);
        localStorage.setItem('festival_lang', targetLang);
      } catch (_) {}

      if (typeof window.setFestivalLang === 'function') {
        window.setFestivalLang(targetLang);
        return true;
      }
      if (window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.setLang === 'function') {
        window.FESTIVAL_CORE.setLang(targetLang);
        return true;
      }
      if (typeof window.toggleFestivalLang === 'function') {
        const cur = typeof window.getFestivalLang === 'function' ? window.getFestivalLang() : 'en';
        if (cur !== targetLang) window.toggleFestivalLang();
        return true;
      }

      document.documentElement.lang = targetLang;
      return false;
    }, lang)
    .catch(() => false);

  await page
    .evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    )
    .catch(() => {});

  return switched;
}

async function collectLayoutMetrics(page, options = {}) {
  const { runFullMobileAudit = false } = options;

  return page.evaluate(({ fullAudit }) => {
    const vw = window.innerWidth;
    const docEl = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(
      docEl ? docEl.scrollWidth : 0,
      body ? body.scrollWidth : 0
    );
    const overflowDelta = Math.round((scrollWidth - vw) * 10) / 10;

    function getSelector(el) {
      if (!el || el.nodeType !== 1) return 'unknown';
      if (el.id) return `#${el.id}`;
      const parts = [];
      let curr = el;
      let depth = 0;
      while (curr && curr.nodeType === 1 && depth < 4) {
        let part = curr.tagName.toLowerCase();
        if (curr.id) {
          parts.unshift(`#${curr.id}`);
          break;
        }
        if (typeof curr.className === 'string' && curr.className.trim()) {
          const classes = curr.className
            .trim()
            .split(/\s+/)
            .filter((c) => !c.startsWith('js-') && c.length < 32)
            .slice(0, 2);
          if (classes.length) {
            part += `.${classes.join('.')}`;
          }
        }
        const parent = curr.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter(
            (c) => c.tagName === curr.tagName
          );
          if (sameTag.length > 1) {
            part += `:nth-of-type(${sameTag.indexOf(curr) + 1})`;
          }
        }
        parts.unshift(part);
        curr = parent;
        depth++;
      }
      return parts.join(' > ');
    }

    function isElementVisible(el, style) {
      if (!el || !style) return false;
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      if (parseFloat(style.opacity) === 0) return false;
      if (el.hasAttribute('hidden') || el.getAttribute('aria-hidden') === 'true') {
        return false;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (
        style.position === 'absolute' &&
        rect.width <= 2 &&
        rect.height <= 2 &&
        style.overflow === 'hidden'
      ) {
        return false;
      }
      return true;
    }

    const overflowing = [];
    const allElements = Array.from(document.querySelectorAll('body *'));
    for (const el of allElements) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') {
        continue;
      }
      const style = window.getComputedStyle(el);
      if (!isElementVisible(el, style)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1) {
        const delta = Math.round((rect.right - vw) * 10) / 10;
        overflowing.push({
          selector: getSelector(el),
          delta,
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          text: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40),
        });
      }
    }

    overflowing.sort((a, b) => b.delta - a.delta || b.selector.length - a.selector.length);
    const dedupedOverflow = [];
    const seenSelectors = new Set();
    for (const item of overflowing) {
      if (!seenSelectors.has(item.selector)) {
        seenSelectors.add(item.selector);
        dedupedOverflow.push(item);
      }
      if (dedupedOverflow.length >= 6) break;
    }

    const result = {
      viewportWidth: vw,
      scrollWidth,
      overflowDelta,
      hasHorizontalOverflow: scrollWidth > vw + 1,
      offendingSelectors: dedupedOverflow,
      smallTouchTargets: [],
      smallFonts: [],
      clippedTexts: [],
      overlappingNavItems: [],
    };

    if (!fullAudit) {
      return result;
    }

    const interactiveEls = Array.from(
      document.querySelectorAll('a[href], button, input:not([type="hidden"]), select')
    );
    for (const el of interactiveEls) {
      const style = window.getComputedStyle(el);
      if (!isElementVisible(el, style)) continue;
      if (el.disabled || el.getAttribute('aria-disabled') === 'true') continue;

      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width * 10) / 10;
      const h = Math.round(rect.height * 10) / 10;

      const inNavOrHeader = Boolean(
        el.closest('header, nav, [role="navigation"], [role="banner"]')
      );
      const isPrimaryControl =
        inNavOrHeader ||
        el.matches(
          '[data-lang], [data-set-lang], [class*="btn"], [class*="cta"], [class*="filter"], [class*="tab"], [class*="toggle"], [class*="menu"], [class*="burger"]'
        );

      const label = (
        el.getAttribute('aria-label') ||
        el.innerText ||
        el.value ||
        el.getAttribute('placeholder') ||
        ''
      )
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 32);

      if (w < 24 || h < 24) {
        result.smallTouchTargets.push({
          tier: 'wcag-24',
          selector: getSelector(el),
          width: w,
          height: h,
          label,
        });
      } else if (isPrimaryControl && (w < 44 || h < 44)) {
        result.smallTouchTargets.push({
          tier: 'mobile-44',
          selector: getSelector(el),
          width: w,
          height: h,
          label,
        });
      }
    }

    const seenFontSelectors = new Set();
    for (const el of allElements) {
      if (
        el.tagName === 'SCRIPT' ||
        el.tagName === 'STYLE' ||
        el.tagName === 'NOSCRIPT' ||
        el.tagName === 'SVG' ||
        el.closest('svg')
      ) {
        continue;
      }
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim().length > 0
      );
      if (!hasDirectText) continue;

      const style = window.getComputedStyle(el);
      if (!isElementVisible(el, style)) continue;

      const fontSize = parseFloat(style.fontSize);
      if (!Number.isNaN(fontSize) && fontSize < 11) {
        const sel = getSelector(el);
        if (!seenFontSelectors.has(sel)) {
          seenFontSelectors.add(sel);
          result.smallFonts.push({
            selector: sel,
            fontSize: Math.round(fontSize * 10) / 10,
            text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 32),
          });
        }
      }
    }

    const seenClippedSelectors = new Set();
    for (const el of allElements) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.closest('svg')) {
        continue;
      }
      const style = window.getComputedStyle(el);
      if (!isElementVisible(el, style)) continue;
      if (style.overflowX !== 'hidden') continue;
      if (style.textOverflow === 'ellipsis') continue;
      if (el.clientWidth <= 0) continue;

      const textContent = (el.innerText || '').trim();
      if (!textContent) continue;

      if (el.scrollWidth > el.clientWidth + 2) {
        const sel = getSelector(el);
        if (!seenClippedSelectors.has(sel)) {
          seenClippedSelectors.add(sel);
          result.clippedTexts.push({
            selector: sel,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            text: textContent.replace(/\s+/g, ' ').slice(0, 36),
          });
        }
      }
    }

    const navContainers = Array.from(
      document.querySelectorAll('header, nav, [role="navigation"]')
    );
    const seenOverlapPairs = new Set();
    for (const container of navContainers) {
      const cStyle = window.getComputedStyle(container);
      if (!isElementVisible(container, cStyle)) continue;

      const items = Array.from(
        container.querySelectorAll('a[href], button')
      ).filter((item) => {
        const s = window.getComputedStyle(item);
        return isElementVisible(item, s);
      });

      for (let i = 0; i < items.length; i++) {
        const r1 = items[i].getBoundingClientRect();
        for (let j = i + 1; j < items.length; j++) {
          if (items[i].contains(items[j]) || items[j].contains(items[i])) {
            continue;
          }
          const r2 = items[j].getBoundingClientRect();
          const overlapX = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
          const overlapY = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
          if (overlapX > 2 && overlapY > 2) {
            const s1 = getSelector(items[i]);
            const s2 = getSelector(items[j]);
            const pairKey = [s1, s2].sort().join(' <> ');
            if (!seenOverlapPairs.has(pairKey)) {
              seenOverlapPairs.add(pairKey);
              result.overlappingNavItems.push({
                itemA: s1,
                itemB: s2,
                overlapX: Math.round(overlapX),
                overlapY: Math.round(overlapY),
              });
            }
          }
        }
      }
    }

    return result;
  }, { fullAudit: runFullMobileAudit });
}

function recordMobileWarnings(warnings, prefix, metrics) {
  for (const target of metrics.smallTouchTargets.slice(0, 8)) {
    if (target.tier === 'wcag-24') {
      warnings.push(
        `${prefix}: Interactive target below WCAG 2.5.8 24x24px minimum (${target.width}x${target.height}px) at ${target.selector}${target.label ? ` ("${target.label}")` : ''}`
      );
    } else {
      warnings.push(
        `${prefix}: Mobile nav/primary control below 44x44px touch target (${target.width}x${target.height}px) at ${target.selector}${target.label ? ` ("${target.label}")` : ''}`
      );
    }
  }
  if (metrics.smallTouchTargets.length > 8) {
    warnings.push(
      `${prefix}: +${metrics.smallTouchTargets.length - 8} additional undersized touch target(s)`
    );
  }

  for (const item of metrics.smallFonts.slice(0, 6)) {
    warnings.push(
      `${prefix}: Text font-size ${item.fontSize}px (< 11px) at ${item.selector} ("${item.text}")`
    );
  }
  if (metrics.smallFonts.length > 6) {
    warnings.push(
      `${prefix}: +${metrics.smallFonts.length - 6} additional element(s) with font-size < 11px`
    );
  }

  for (const item of metrics.clippedTexts.slice(0, 6)) {
    warnings.push(
      `${prefix}: Clipped text without ellipsis (scrollWidth ${item.scrollWidth}px > clientWidth ${item.clientWidth}px) at ${item.selector} ("${item.text}")`
    );
  }
  if (metrics.clippedTexts.length > 6) {
    warnings.push(
      `${prefix}: +${metrics.clippedTexts.length - 6} additional clipped text element(s)`
    );
  }

  for (const pair of metrics.overlappingNavItems.slice(0, 5)) {
    warnings.push(
      `${prefix}: Overlapping visible nav controls (${pair.overlapX}x${pair.overlapY}px overlap) between ${pair.itemA} and ${pair.itemB}`
    );
  }
}

async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot }) {
  let passed = 0;
  let failed = 0;
  const warnings = [];
  const errors = [];
  const details = [];

  const targetPages = isRoot
    ? ['index.html']
    : Array.isArray(pages) && pages.length > 0
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

  const context = await browser.newContext({
    viewport: {
      width: MOBILE_PRIMARY_VIEWPORT.width,
      height: MOBILE_PRIMARY_VIEWPORT.height,
    },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  try {
    const page = await context.newPage();

    const mobileRuns = [];
    for (const pageName of targetPages) {
      mobileRuns.push({ pageName, lang: 'en' });
      if (!isRoot && (pageName === 'index.html' || pageName === 'program.html')) {
        mobileRuns.push({ pageName, lang: 'cs' });
      }
    }

    for (const { pageName, lang } of mobileRuns) {
      const url = buildPageUrl(baseUrl, siteRelPath, pageName, isRoot);
      const labelPrefix = `[${designName || 'root'}] ${pageName} (${lang} @ 375x812)`;

      try {
        await page.setViewportSize({
          width: MOBILE_PRIMARY_VIEWPORT.width,
          height: MOBILE_PRIMARY_VIEWPORT.height,
        });
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitForPageReady(page);

        if (lang === 'cs') {
          await setLanguage(page, 'cs');
          await waitForPageReady(page);
        } else if (!isRoot) {
          await setLanguage(page, 'en');
        }

        const metrics = await collectLayoutMetrics(page, {
          runFullMobileAudit: true,
        });

        recordMobileWarnings(warnings, labelPrefix, metrics);

        if (metrics.hasHorizontalOverflow) {
          failed += 1;
          const offendersDesc =
            metrics.offendingSelectors.length > 0
              ? metrics.offendingSelectors
                  .map((o) => `${o.selector} (+${o.delta}px, right=${o.right}px)`)
                  .join('; ')
              : 'documentElement/body exceeded viewport width';
          errors.push(
            `${labelPrefix}: Horizontal overflow detected (scrollWidth=${metrics.scrollWidth}px > innerWidth=${metrics.viewportWidth}px, +${metrics.overflowDelta}px). Offenders: ${offendersDesc}`
          );
        } else {
          passed += 1;
        }

        details.push({
          page: pageName,
          lang,
          viewport: MOBILE_PRIMARY_VIEWPORT.label,
          passed: !metrics.hasHorizontalOverflow,
          scrollWidth: metrics.scrollWidth,
          viewportWidth: metrics.viewportWidth,
          overflowDelta: metrics.overflowDelta,
          offendingSelectors: metrics.offendingSelectors,
          warningCounts: {
            smallTouchTargets: metrics.smallTouchTargets.length,
            smallFonts: metrics.smallFonts.length,
            clippedTexts: metrics.clippedTexts.length,
            overlappingNavItems: metrics.overlappingNavItems.length,
          },
        });
      } catch (err) {
        failed += 1;
        errors.push(`${labelPrefix}: Navigation/evaluation failed — ${err.message}`);
        details.push({
          page: pageName,
          lang,
          viewport: MOBILE_PRIMARY_VIEWPORT.label,
          passed: false,
          error: err.message,
        });
      }
    }

    const secondaryPages = isRoot
      ? ['index.html']
      : ['index.html', 'program.html'].filter((p) => targetPages.includes(p));

    const viewportsToRun = isRoot
      ? SECONDARY_VIEWPORTS.filter((v) => v.width === 1440)
      : SECONDARY_VIEWPORTS;

    for (const pageName of secondaryPages) {
      const url = buildPageUrl(baseUrl, siteRelPath, pageName, isRoot);

      for (const vp of viewportsToRun) {
        const labelPrefix = `[${designName || 'root'}] ${pageName} (en @ ${vp.label})`;
        try {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await waitForPageReady(page);

          const metrics = await collectLayoutMetrics(page, {
            runFullMobileAudit: false,
          });

          if (metrics.hasHorizontalOverflow) {
            const offendersDesc =
              metrics.offendingSelectors.length > 0
                ? metrics.offendingSelectors
                    .map((o) => `${o.selector} (+${o.delta}px)`)
                    .join('; ')
                : `scrollWidth=${metrics.scrollWidth}px vs innerWidth=${metrics.viewportWidth}px`;
            warnings.push(
              `${labelPrefix}: Horizontal overflow (+${metrics.overflowDelta}px; scrollWidth=${metrics.scrollWidth}px > ${metrics.viewportWidth}px). Offenders: ${offendersDesc}`
            );
          }

          passed += 1;
          details.push({
            page: pageName,
            lang: 'en',
            viewport: vp.label,
            passed: true,
            hasHorizontalOverflow: metrics.hasHorizontalOverflow,
            scrollWidth: metrics.scrollWidth,
            viewportWidth: metrics.viewportWidth,
            overflowDelta: metrics.overflowDelta,
            offendingSelectors: metrics.offendingSelectors,
          });
        } catch (err) {
          warnings.push(`${labelPrefix}: Breakpoint check failed — ${err.message}`);
          details.push({
            page: pageName,
            lang: 'en',
            viewport: vp.label,
            passed: true,
            error: err.message,
          });
        }
      }
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
