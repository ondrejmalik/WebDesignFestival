'use strict';

/**
 * E2E Spec: Favorites Persistence, Nav Badge Sync, Post-Midnight Collision Detection,
 * Czech Pluralization, and Clear Favorites Flow.
 *
 * Exports: async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot })
 */

function isLocalUrl(url, baseUrl) {
  if (!url) return false;
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('about:')) return true;
  try {
    const u = new URL(url);
    const b = new URL(baseUrl);
    return u.origin === b.origin || u.hostname === '127.0.0.1' || u.hostname === 'localhost';
  } catch {
    return false;
  }
}

function normalizeSitePrefix(siteRelPath) {
  if (!siteRelPath) return '';
  return '/' + String(siteRelPath).replace(/^\/+|\/+$/g, '');
}

function extractFavIds(storedFavs) {
  if (!Array.isArray(storedFavs)) return [];
  return storedFavs
    .map((item) => (typeof item === 'string' ? item : item && item.id ? String(item.id) : ''))
    .filter(Boolean);
}

async function waitForFestivalReady(page, timeoutMs = 8000) {
  await page.waitForFunction(
    () => Boolean(window.FESTIVAL_CORE && window.FESTIVAL_DATA && Array.isArray(window.FESTIVAL_DATA.PERFORMERS)),
    { timeout: timeoutMs }
  );
  await page.evaluate(() => new Promise((r) => setTimeout(r, 20)));
}

async function run({ browser, baseUrl, designName, siteRelPath, pages, isRoot }) {
  if (isRoot) {
    return { passed: 0, failed: 0, warnings: [], errors: [], details: [] };
  }

  let passed = 0;
  let failed = 0;
  const warnings = [];
  const errors = [];
  const details = [];

  const pass = (check, info = {}) => {
    passed += 1;
    details.push({ status: 'pass', design: designName, check, ...info });
  };

  const fail = (check, message, info = {}) => {
    failed += 1;
    const formatted = `[${designName}] ${check}: ${message}`;
    errors.push(formatted);
    details.push({ status: 'fail', design: designName, check, message, ...info });
  };

  const warn = (check, message, info = {}) => {
    const formatted = `[${designName}] ${check}: ${message}`;
    warnings.push(formatted);
    details.push({ status: 'warn', design: designName, check, message, ...info });
  };

  const prefix = normalizeSitePrefix(siteRelPath);
  const availablePages = Array.isArray(pages) ? pages : [];
  const hasProgram = availablePages.length === 0 || availablePages.includes('program.html');
  const hasMySchedule = availablePages.length === 0 || availablePages.includes('my-schedule.html');

  const programUrl = `${baseUrl}${prefix}/program.html`;
  const myScheduleUrl = `${baseUrl}${prefix}/my-schedule.html`;

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const runtimeErrors = [];
  const localNetworkErrors = [];

  page.on('pageerror', (err) => {
    runtimeErrors.push(`pageerror: ${err && err.message ? err.message : String(err)}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg|jsdelivr/i.test(text)) {
        warn('external-console-error', text);
      } else {
        runtimeErrors.push(`console.error: ${text}`);
      }
    }
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400) {
      if (isLocalUrl(url, baseUrl)) {
        localNetworkErrors.push(`HTTP ${status} on ${url}`);
      } else {
        warn('external-http-error', `HTTP ${status} on external resource ${url}`);
      }
    }
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    const failure = req.failure()?.errorText || 'unknown';
    if (failure === 'net::ERR_ABORTED') return;
    if (isLocalUrl(url, baseUrl)) {
      localNetworkErrors.push(`Request failed (${failure}): ${url}`);
    } else {
      warn('external-request-failed', `External request failed (${failure}): ${url}`);
    }
  });

  try {
    // -------------------------------------------------------------------------
    // PART 1: Favorite Toggle on program.html -> localStorage & Nav Badge Sync
    // -------------------------------------------------------------------------
    let selectedPerformer = null;

    if (!hasProgram) {
      warn('missing-page', 'program.html not listed in site pages; skipping UI favorite click test.');
    } else {
      await page.goto(programUrl, { waitUntil: 'domcontentloaded' });
      await waitForFestivalReady(page);

      await page.evaluate(() => {
        if (window.FESTIVAL_CORE && typeof window.FESTIVAL_CORE.clearFavorites === 'function') {
          window.FESTIVAL_CORE.clearFavorites();
        } else {
          localStorage.removeItem('festival_favorites');
        }
      });

      await page.waitForFunction(
        () => {
          const root = document.querySelector('#fod-program-root');
          if (root && root.children.length > 0 && root.innerText.trim().length > 0) return true;
          return document.querySelectorAll('[data-fav-id], .fod-fav-btn, .fod-program-card, .artist-card, [data-performer-id]').length > 0;
        },
        { timeout: 8000 }
      );

      const favSelectors = [
        '#fod-program-root .fav-toggle-btn[data-perf-id]',
        '#fod-program-root button[data-perf-id]',
        '#fod-program-root .fod-fav-btn',
        '#fod-program-root [data-fav-id]',
        '#fod-program-root .fav-btn',
        '.fav-toggle-btn[data-perf-id]',
        '.fod-fav-btn',
        '[data-fav-id]',
        '.fav-btn',
      ];

      let clickedFavBtn = false;
      for (const sel of favSelectors) {
        const locator = page.locator(sel).first();
        if ((await locator.count()) > 0 && (await locator.isVisible().catch(() => false))) {
          const rawId =
            (await locator.getAttribute('data-perf-id').catch(() => null)) ||
            (await locator.getAttribute('data-fav-id').catch(() => null)) ||
            (await locator.getAttribute('data-id').catch(() => null));
          await locator.click();
          clickedFavBtn = true;
          selectedPerformer = await page.evaluate((idHint) => {
            const raw = JSON.parse(localStorage.getItem('festival_favorites') || '[]');
            const ids = raw.map((x) => (typeof x === 'string' ? x : x && x.id)).filter(Boolean);
            const targetId = idHint || ids[0] || null;
            const perf = (window.FESTIVAL_DATA?.PERFORMERS || []).find((p) => p.id === targetId);
            return perf ? { id: perf.id, name: perf.name } : targetId ? { id: targetId, name: null } : null;
          }, rawId);
          break;
        }
      }

      if (!clickedFavBtn) {
        warn(
          'fav-button-fallback',
          'No visible favorite button matched (.fod-fav-btn, [data-fav-id], button[aria-pressed], .fav-btn) on program.html; falling back to FESTIVAL_CORE.toggleFavoriteById.'
        );
        selectedPerformer = await page.evaluate(() => {
          const firstPerf = (window.FESTIVAL_DATA?.PERFORMERS || [])[0];
          const fallbackId = firstPerf ? firstPerf.id : 'perf-01';
          if (typeof window.FESTIVAL_CORE.toggleFavoriteById === 'function') {
            window.FESTIVAL_CORE.toggleFavoriteById(fallbackId);
          }
          return firstPerf ? { id: firstPerf.id, name: firstPerf.name } : { id: fallbackId, name: null };
        });
      }

      const storedFavs = await page.evaluate(() => {
        try {
          return JSON.parse(localStorage.getItem('festival_favorites') || '[]');
        } catch {
          return null;
        }
      });

      const storedIds = extractFavIds(storedFavs);
      if (!Array.isArray(storedFavs) || storedIds.length === 0) {
        fail('favorites-localstorage', `Expected festival_favorites in localStorage to contain added performer, got: ${JSON.stringify(storedFavs)}`);
      } else if (selectedPerformer?.id && !storedIds.includes(selectedPerformer.id)) {
        fail('favorites-localstorage-id', `Expected festival_favorites to include "${selectedPerformer.id}", got: ${JSON.stringify(storedIds)}`);
      } else {
        pass('favorites-localstorage', { favoriteIds: storedIds });
      }

      const badgeCheck = await page.evaluate(() => {
        const badgeEls = Array.from(
          document.querySelectorAll('.nav-badge-count, .fav-count-badge, #fav-count, [data-fav-count]')
        );
        const numericValues = badgeEls
          .map((el) => parseInt((el.textContent || '').trim(), 10))
          .filter((n) => !Number.isNaN(n));
        return {
          foundElements: badgeEls.length,
          values: numericValues,
          hasPositive: numericValues.some((n) => n > 0),
        };
      });

      if (badgeCheck.foundElements === 0) {
        warn('nav-badge-missing', 'No nav badge element (.nav-badge-count, .fav-count-badge, #fav-count) found in DOM.');
      } else if (!badgeCheck.hasPositive) {
        fail('nav-badge-update', `Expected nav badge count > 0 after favoriting, got values: ${JSON.stringify(badgeCheck.values)}`);
      } else {
        pass('nav-badge-update', { values: badgeCheck.values });
      }
    }

    // -------------------------------------------------------------------------
    // PART 2: Persistence on my-schedule.html & Reload Survival
    // -------------------------------------------------------------------------
    if (!hasMySchedule) {
      warn('missing-page', 'my-schedule.html not listed in site pages; skipping schedule & collision UI tests.');
    } else {
      if (!selectedPerformer) {
        await page.goto(myScheduleUrl, { waitUntil: 'domcontentloaded' });
        await waitForFestivalReady(page);
        selectedPerformer = await page.evaluate(() => {
          const first = (window.FESTIVAL_DATA?.PERFORMERS || [])[0];
          const id = first ? first.id : 'perf-01';
          window.FESTIVAL_CORE.saveFavorites([id]);
          return first ? { id: first.id, name: first.name } : { id, name: null };
        });
      }

      await page.goto(myScheduleUrl, { waitUntil: 'domcontentloaded' });
      await waitForFestivalReady(page);

      const verifySavedArtistRendered = async () => {
        await page.waitForFunction(
          () => document.body && document.body.innerText.trim().length > 0,
          { timeout: 6000 }
        );
        return page.evaluate((perf) => {
          const raw = JSON.parse(localStorage.getItem('festival_favorites') || '[]');
          const favIds = raw.map((x) => (typeof x === 'string' ? x : x && x.id)).filter(Boolean);
          const container =
            document.querySelector('#fod-my-schedule-root, #fod-schedule-root, #my-schedule-root, main, .schedule-container') ||
            document.body;
          const text = container.innerText || '';
          const idAttrMatch = perf?.id ? Boolean(container.querySelector(`[data-id="${perf.id}"], [data-fav-id="${perf.id}"], [data-performer-id="${perf.id}"]`)) : false;
          const nameMatch = perf?.name ? text.toLowerCase().includes(perf.name.toLowerCase()) : false;
          return { favIds, idAttrMatch, nameMatch, textSample: text.slice(0, 300) };
        }, selectedPerformer);
      };

      const initialScheduleState = await verifySavedArtistRendered();
      if (
        !initialScheduleState.favIds.includes(selectedPerformer.id) ||
        (!initialScheduleState.nameMatch && !initialScheduleState.idAttrMatch)
      ) {
        fail(
          'my-schedule-render',
          `Saved artist (${selectedPerformer.id} / ${selectedPerformer.name}) did not appear on my-schedule.html`,
          initialScheduleState
        );
      } else {
        pass('my-schedule-render', { performer: selectedPerformer });
      }

      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForPageReadyFallback(page);

      const reloadedScheduleState = await verifySavedArtistRendered();
      if (
        !reloadedScheduleState.favIds.includes(selectedPerformer.id) ||
        (!reloadedScheduleState.nameMatch && !reloadedScheduleState.idAttrMatch)
      ) {
        fail(
          'my-schedule-reload-persistence',
          `Saved artist (${selectedPerformer.id} / ${selectedPerformer.name}) did not survive page.reload() on my-schedule.html`,
          reloadedScheduleState
        );
      } else {
        pass('my-schedule-reload-persistence', { performer: selectedPerformer });
      }

      // -----------------------------------------------------------------------
      // PART 3: Collision Detection Unit Invariants (Post-Midnight +24h Logic)
      // -----------------------------------------------------------------------
      const collisionMathResult = await page.evaluate(() => {
        const core = window.FESTIVAL_CORE;
        if (!core || typeof core.timeToMinutes !== 'function' || typeof core.isOverlapping !== 'function') {
          return { missing: true };
        }
        const t0030 = core.timeToMinutes('00:30');
        const t2330 = core.timeToMinutes('23:30');
        const overlapLateNight = core.isOverlapping('23:30 - 00:30', '00:15 - 01:15');
        const nonOverlapGap = core.isOverlapping('22:00 - 23:00', '00:00 - 01:00');
        return {
          missing: false,
          t0030,
          t2330,
          postMidnightGreater: t0030 > t2330,
          overlapLateNight,
          nonOverlapGap,
        };
      });

      if (collisionMathResult.missing) {
        fail('collision-core-api', 'window.FESTIVAL_CORE.timeToMinutes or isOverlapping is missing.');
      } else if (
        !collisionMathResult.postMidnightGreater ||
        collisionMathResult.overlapLateNight !== true ||
        collisionMathResult.nonOverlapGap !== false
      ) {
        fail(
          'collision-post-midnight-logic',
          `Post-midnight timeToMinutes/isOverlapping invariant failed: ${JSON.stringify(collisionMathResult)}`
        );
      } else {
        pass('collision-post-midnight-logic', collisionMathResult);
      }

      // -----------------------------------------------------------------------
      // PART 4: Collision UI Rendering (Demo Button + Seeded Overlapping Performers)
      // -----------------------------------------------------------------------
      const demoBtn = page.locator('#load-conflict-demo-btn').first();
      if ((await demoBtn.count()) > 0 && (await demoBtn.isVisible().catch(() => false))) {
        await demoBtn.click();
        await page.waitForFunction(
          () => /(conflict|collision|overlap|kolize|překrýv|souběh)/i.test(document.body.innerText || ''),
          { timeout: 4000 }
        ).catch(() => {});

        const demoConflictDetected = await page.evaluate(() => {
          const conflictEl = document.querySelector(
            '.fod-alert-banner.is-conflict, .fod-conflict-banner, .fod-conflict-warning, .fod-collision-alert, .conflict-warning, .schedule-conflict, [data-conflict="true"], .fod-item-conflict, [class*="conflict"]'
          );
          const bodyText = document.body.innerText || '';
          const textMatches = /(conflict|collision|overlap|kolize|překrýv|souběh)/i.test(bodyText);
          return Boolean(conflictEl) || textMatches;
        });

        if (!demoConflictDetected) {
          fail('conflict-demo-button', 'Clicked #load-conflict-demo-btn but no conflict/collision warning UI appeared.');
        } else {
          pass('conflict-demo-button');
        }
      }

      const seededConflictSetup = await page.evaluate(() => {
        const performers = window.FESTIVAL_DATA?.PERFORMERS || [];
        const core = window.FESTIVAL_CORE;
        let pair = null;

        for (let i = 0; i < performers.length && !pair; i += 1) {
          for (let j = i + 1; j < performers.length; j += 1) {
            const a = performers[i];
            const b = performers[j];
            if (a.dayKey === b.dayKey && a.time && b.time && core.isOverlapping(a.time, b.time)) {
              const hasLateNight = /(^|\s|-)0[0-7]:/.test(a.time) || /(^|\s|-)0[0-7]:/.test(b.time);
              if (hasLateNight) {
                pair = [a, b];
                break;
              }
            }
          }
        }

        if (!pair) {
          for (let i = 0; i < performers.length && !pair; i += 1) {
            for (let j = i + 1; j < performers.length; j += 1) {
              const a = performers[i];
              const b = performers[j];
              if (a.dayKey === b.dayKey && a.time && b.time && core.isOverlapping(a.time, b.time)) {
                pair = [a, b];
                break;
              }
            }
          }
        }

        if (!pair && performers.length >= 2) {
          pair = [performers[0], performers[1]];
        }

        if (!pair) return { ok: false };

        const ids = pair.map((p) => p.id);
        core.saveFavorites(ids);
        return {
          ok: true,
          ids,
          pair: pair.map((p) => ({ id: p.id, name: p.name, dayKey: p.dayKey, time: p.time })),
          actuallyOverlaps: core.isOverlapping(pair[0].time, pair[1].time) && pair[0].dayKey === pair[1].dayKey,
        };
      });

      if (!seededConflictSetup.ok) {
        warn('conflict-seed-skipped', 'Insufficient performers in FESTIVAL_DATA.PERFORMERS to seed collision check.');
      } else {
        await page.reload({ waitUntil: 'domcontentloaded' });
        await waitForPageReadyFallback(page);

        const conflictUiCheck = await page.evaluate(() => {
          const conflictEls = document.querySelectorAll(
            '.fod-conflict-banner, .fod-conflict-warning, .fod-collision-alert, .conflict-warning, .schedule-conflict, [data-conflict="true"], .fod-item-conflict, [class*="conflict"], [class*="collision"]'
          );
          const visibleConflictEl = Array.from(conflictEls).some((el) => {
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
          });
          const bodyText = document.body.innerText || '';
          const textMatches = /(conflict|collision|overlap|kolize|překrýv|souběh)/i.test(bodyText);
          return {
            visibleConflictEl,
            textMatches,
            matchedCount: conflictEls.length,
          };
        });

        if (seededConflictSetup.actuallyOverlaps) {
          if (!conflictUiCheck.visibleConflictEl && !conflictUiCheck.textMatches) {
            fail(
              'seeded-collision-ui',
              `Seeded overlapping performers (${JSON.stringify(seededConflictSetup.pair)}) on my-schedule.html, but no collision/conflict warning UI rendered.`
            );
          } else {
            pass('seeded-collision-ui', { pair: seededConflictSetup.pair, ...conflictUiCheck });
          }
        } else {
          warn(
            'no-natural-overlap-in-data',
            'FESTIVAL_DATA.PERFORMERS did not contain two naturally overlapping same-day slots; skipped strict UI collision assertion.'
          );
        }

        // ---------------------------------------------------------------------
        // PART 5: Czech Pluralization ('cs' mode) of Saved Shows Count
        // ---------------------------------------------------------------------
        await page.evaluate(() => {
          if (typeof window.setFestivalLang === 'function') {
            window.setFestivalLang('cs');
          }
        });

        const checkCountInCs = async (count) => {
          await page.evaluate((n) => {
            const ids = (window.FESTIVAL_DATA?.PERFORMERS || []).slice(0, n).map((p) => p.id);
            window.FESTIVAL_CORE.saveFavorites(ids);
          }, count);
          await page.reload({ waitUntil: 'domcontentloaded' });
          await waitForPageReadyFallback(page);
          return page.evaluate(() => document.body.innerText || '');
        };

        const text1 = await checkCountInCs(1);
        const text3 = await checkCountInCs(3);
        const text5 = await checkCountInCs(5);

        const has1 = /\b1\s+(uložené\s+vystoupení|uložený\s+koncert|koncert|vystoupení|show|akce|oblíbený)/i.test(text1);
        const has3 = /\b3\s+(uložená\s+vystoupení|uložené\s+koncerty|koncerty|vystoupení|shows|akce|oblíbené)/i.test(text3);
        const has5 = /\b5\s+(uložených\s+vystoupení|uložených\s+koncertů|koncertů|vystoupení|shows|akcí|oblíbených)/i.test(text5);

        if (!has1 || !has3 || !has5) {
          warn(
            'cz-pluralization-mismatch',
            `Czech pluralization labels for 1/3/5 saved shows did not match expected forms: 1="${(text1.match(/\b1\s+\S+(?:\s+\S+)?/i) || [])[0]}", 3="${(text3.match(/\b3\s+\S+(?:\s+\S+)?/i) || [])[0]}", 5="${(text5.match(/\b5\s+\S+(?:\s+\S+)?/i) || [])[0]}"`
          );
        } else {
          pass('cz-pluralization', { has1, has3, has5 });
        }

        await page.evaluate(() => {
          if (typeof window.setFestivalLang === 'function') {
            window.setFestivalLang('en');
          }
        });
      }

      // -----------------------------------------------------------------------
      // PART 6: Clear Favorites Flow (#clear-favorites-btn or clearFavorites())
      // -----------------------------------------------------------------------
      await page.evaluate(() => {
        const current = window.FESTIVAL_CORE.getFavorites();
        if (current.length === 0) {
          const firstId = (window.FESTIVAL_DATA?.PERFORMERS || [])[0]?.id || 'perf-01';
          window.FESTIVAL_CORE.saveFavorites([firstId]);
        }
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await waitForPageReadyFallback(page);

      const dialogHandler = (dialog) => dialog.accept().catch(() => {});
      page.on('dialog', dialogHandler);

      const clearBtn = page.locator('#clear-favorites-btn, [data-clear-favorites], .clear-favorites-btn').first();
      if ((await clearBtn.count()) > 0 && (await clearBtn.isVisible().catch(() => false))) {
        await clearBtn.click();
      } else {
        warn('clear-button-fallback', '#clear-favorites-btn not visible on my-schedule.html; calling FESTIVAL_CORE.clearFavorites().');
        await page.evaluate(() => {
          window.FESTIVAL_CORE.clearFavorites();
        });
      }

      page.off('dialog', dialogHandler);

      await page.waitForFunction(
        () => {
          try {
            const raw = localStorage.getItem('festival_favorites');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) && parsed.length === 0;
          } catch {
            return false;
          }
        },
        { timeout: 5000 }
      ).catch(() => {});

      const clearedState = await page.evaluate(() => {
        const raw = localStorage.getItem('festival_favorites');
        let parsed = null;
        try {
          parsed = raw ? JSON.parse(raw) : [];
        } catch {
          parsed = raw;
        }
        const emptyEl = document.querySelector(
          '.fod-empty-card, .fod-empty-state, .empty-schedule, .no-favorites, [data-empty-state]'
        );
        const bodyText = document.body.innerText || '';
        const hasEmptyCopy = /(no\s+(sets|saved|favorite|shows)|empty|nothing\s+saved|žádn[áé]\s+(vystoupení|uložen|oblíben)|zatím\s+nemáte|prázdn)/i.test(bodyText);
        return {
          raw,
          parsed,
          isEmptyArray: Array.isArray(parsed) && parsed.length === 0,
          hasEmptyUi: Boolean(emptyEl) || hasEmptyCopy,
        };
      });

      if (!clearedState.isEmptyArray) {
        fail('clear-favorites-storage', `Expected festival_favorites to become [], got: ${clearedState.raw}`);
      } else if (!clearedState.hasEmptyUi) {
        fail('clear-favorites-empty-ui', 'Cleared festival_favorites to [], but empty state UI was not rendered.');
      } else {
        pass('clear-favorites', clearedState);
      }
    }

    if (runtimeErrors.length > 0) {
      fail('runtime-js-errors', runtimeErrors.join(' | '));
    } else {
      pass('no-runtime-js-errors');
    }

    if (localNetworkErrors.length > 0) {
      fail('local-network-errors', localNetworkErrors.join(' | '));
    } else {
      pass('no-local-network-errors');
    }
  } catch (err) {
    fail('unexpected-exception', err && err.stack ? err.stack : String(err));
  } finally {
    await context.close();
  }

  return { passed, failed, warnings, errors, details };
}

async function waitForPageReadyFallback(page) {
  await waitForFestivalReady(page);
  await page.waitForFunction(
    () => document.body && document.body.innerText.trim().length > 0,
    { timeout: 6000 }
  );
}

module.exports = { run };
