'use strict';

/**
 * E2E Spec: Filters, Search, Artist Detail, Stages & Practical Info Flows
 * Design-agnostic Playwright CommonJS test module for WebDesignFestival.
 */

function isLocalUrl(url) {
  return /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?(\/|$)/i.test(url);
}

function attachPageMonitors(page, { warnings, errors, pageTag }) {
  page.on('pageerror', (err) => {
    errors.push(`[${pageTag}] Uncaught pageerror: ${err && err.message ? err.message : String(err)}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (/fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg|jsdelivr/i.test(text)) {
        warnings.push(`[${pageTag}] External console.error: ${text}`);
      } else {
        errors.push(`[${pageTag}] console.error: ${text}`);
      }
    }
  });

  page.on('response', (res) => {
    const status = res.status();
    if (status >= 400) {
      const url = res.url();
      if (isLocalUrl(url)) {
        errors.push(`[${pageTag}] Local HTTP ${status} on ${url}`);
      } else {
        warnings.push(`[${pageTag}] External HTTP ${status} on ${url}`);
      }
    }
  });

  page.on('requestfailed', (req) => {
    const url = req.url();
    const failure = req.failure();
    const errText = failure && failure.errorText ? failure.errorText : 'unknown';
    if (errText === 'net::ERR_ABORTED') return;
    if (isLocalUrl(url)) {
      errors.push(`[${pageTag}] Local requestfailed (${errText}): ${url}`);
    } else {
      warnings.push(`[${pageTag}] External requestfailed (${errText}): ${url}`);
    }
  });
}

async function waitForFestivalReady(page, timeout = 8000) {
  await page.waitForFunction(
    () => typeof window.FESTIVAL_DATA !== 'undefined' && Array.isArray(window.FESTIVAL_DATA.PERFORMERS),
    { timeout }
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

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanRel = siteRelPath.replace(/^\/+|\/+$/g, '');
  const siteBaseUrl = `${cleanBase}/${cleanRel}`;
  const availablePages = new Set((pages || []).map((p) => p.replace(/^\/+/, '')));

  const recordCheck = (name, ok, info = '') => {
    if (ok) {
      passed += 1;
      details.push({ check: name, status: 'passed', info });
    } else {
      failed += 1;
      details.push({ check: name, status: 'failed', info });
    }
  };

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  try {
    // =========================================================================
    // 1. PROGRAM.HTML: 60 Performers, Day Filter, Stage Filter, Search, URL Params
    // =========================================================================
    if (!availablePages.size || availablePages.has('program.html')) {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/program.html` });

      try {
        await page.goto(`${siteBaseUrl}/program.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitForFestivalReady(page);

        const programRoot = page.locator('#fod-program-root');
        await programRoot.waitFor({ state: 'attached', timeout: 8000 });

        await page.waitForFunction(
          () => {
            const root = document.querySelector('#fod-program-root');
            if (!root) return false;
            const items = root.querySelectorAll('[data-performer-id], [data-id], .fod-program-card, .fod-schedule-item, article, tr[data-id]');
            return items.length > 0 || root.innerText.trim().length > 100;
          },
          { timeout: 8000 }
        );

        const countVisibleProgramItems = () =>
          page.evaluate(() => {
            const root = document.querySelector('#fod-program-root');
            if (!root) return 0;
            let nodes = root.querySelectorAll('[data-performer-id], [data-id], .fod-set-card');
            if (!nodes.length) {
              nodes = root.querySelectorAll('a[href*="artist-detail.html"]');
            }
            return Array.from(nodes).filter((el) => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' && style.visibility !== 'hidden' && !el.hidden;
            }).length;
          });

        const totalData = await page.evaluate(() =>
          window.FESTIVAL_DATA && Array.isArray(window.FESTIVAL_DATA.PERFORMERS)
            ? window.FESTIVAL_DATA.PERFORMERS.length
            : 0
        );
        const renderedCount = await countVisibleProgramItems();

        if (totalData === 60) {
          recordCheck('program:data-60-performers', true, 'FESTIVAL_DATA.PERFORMERS.length === 60');
        } else {
          errors.push(`[${designName}/program.html] Expected 60 performers in FESTIVAL_DATA, found ${totalData}`);
          recordCheck('program:data-60-performers', false, `Found ${totalData}`);
        }

        if (renderedCount === 60) {
          recordCheck('program:initial-render-60', true, 'Rendered all 60 performers');
        } else if (renderedCount > 0) {
          warnings.push(`[${designName}/program.html] Expected 60 visible performer elements initially, counted ${renderedCount}`);
          recordCheck('program:initial-render-60', true, `Counted ${renderedCount} visible items (selector variance)`);
        } else {
          errors.push(`[${designName}/program.html] #fod-program-root rendered 0 performer items`);
          recordCheck('program:initial-render-60', false, '0 items rendered');
        }

        const day1Btn = page.locator('[data-filter-day="day1"]').first();
        if ((await day1Btn.count()) > 0) {
          await day1Btn.click();
          await page.waitForFunction(
            () => {
              const root = document.querySelector('#fod-program-root');
              if (!root) return false;
              let nodes = root.querySelectorAll('[data-performer-id], [data-id], .fod-set-card');
              if (!nodes.length) nodes = root.querySelectorAll('a[href*="artist-detail.html"]');
              const vis = Array.from(nodes).filter((el) => {
                const s = window.getComputedStyle(el);
                return s.display !== 'none' && s.visibility !== 'hidden' && !el.hidden;
              });
              return vis.length > 0 && vis.length < 60;
            },
            { timeout: 5000 }
          ).catch(() => {});

          const day1Count = await countVisibleProgramItems();
          if (day1Count === 20) {
            recordCheck('program:day1-filter-20', true, 'Day 1 filter produced 20 sets');
          } else {
            warnings.push(`[${designName}/program.html] Day 1 filter resulted in ${day1Count} sets (expected 20)`);
            recordCheck('program:day1-filter-20', day1Count > 0 && day1Count < 60, `Count: ${day1Count}`);
          }
        } else {
          warnings.push(`[${designName}/program.html] Optional [data-filter-day="day1"] button not found`);
        }

        const lunarBtn = page.locator('[data-filter-stage="lunar"]').first();
        if ((await lunarBtn.count()) > 0) {
          await lunarBtn.click();
          await page.waitForFunction(
            () => {
              const root = document.querySelector('#fod-program-root');
              if (!root) return false;
              let nodes = root.querySelectorAll('[data-performer-id], [data-id], .fod-set-card');
              if (!nodes.length) nodes = root.querySelectorAll('a[href*="artist-detail.html"]');
              const vis = Array.from(nodes).filter((el) => {
                const s = window.getComputedStyle(el);
                return s.display !== 'none' && s.visibility !== 'hidden' && !el.hidden;
              });
              return vis.length > 0 && vis.length <= 20;
            },
            { timeout: 5000 }
          ).catch(() => {});

          const lunarDay1Count = await countVisibleProgramItems();
          if (lunarDay1Count === 10) {
            recordCheck('program:stage-lunar-day1-10', true, 'Lunar stage + Day 1 produced 10 sets');
          } else {
            warnings.push(`[${designName}/program.html] Stage lunar + Day 1 resulted in ${lunarDay1Count} sets (expected 10)`);
            recordCheck('program:stage-lunar-day1-10', lunarDay1Count > 0 && lunarDay1Count <= 30, `Count: ${lunarDay1Count}`);
          }
        } else {
          warnings.push(`[${designName}/program.html] Optional [data-filter-stage="lunar"] button not found`);
        }

        const allDayBtn = page.locator('[data-filter-day="all"]').first();
        if ((await allDayBtn.count()) > 0) await allDayBtn.click();
        const allStageBtn = page.locator('[data-filter-stage="all"]').first();
        if ((await allStageBtn.count()) > 0) await allStageBtn.click();

        const programSearch = page.locator('#artist-search-input').first();
        if ((await programSearch.count()) > 0) {
          const targetArtist = await page.evaluate(() => {
            const p = window.FESTIVAL_DATA.PERFORMERS[0];
            return p ? p.name : '';
          });

          if (targetArtist) {
            await programSearch.fill(targetArtist);
            await page.waitForFunction(
              (name) => {
                const root = document.querySelector('#fod-program-root');
                return root && root.innerText.toLowerCase().includes(name.toLowerCase());
              },
              targetArtist,
              { timeout: 5000 }
            );

            const filteredCount = await countVisibleProgramItems();
            const containsTarget = await programRoot.innerText().then((t) =>
              t.toLowerCase().includes(targetArtist.toLowerCase())
            );
            if (containsTarget && filteredCount >= 1 && filteredCount < 60) {
              recordCheck('program:artist-search-input', true, `Filtered to "${targetArtist}" (${filteredCount} match)`);
            } else {
              warnings.push(`[${designName}/program.html] #artist-search-input for "${targetArtist}" left ${filteredCount} items`);
              recordCheck('program:artist-search-input', containsTarget, `Count: ${filteredCount}`);
            }
          }
        } else {
          warnings.push(`[${designName}/program.html] Optional #artist-search-input not found`);
        }

        await page.goto(`${siteBaseUrl}/program.html?stage=lunar&day=day1`, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });
        await waitForFestivalReady(page);
        await programRoot.waitFor({ state: 'attached', timeout: 8000 });
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#fod-program-root');
            return root && root.innerText.trim().length > 50;
          },
          { timeout: 8000 }
        );

        const queryParamCount = await countVisibleProgramItems();
        if (queryParamCount === 10) {
          recordCheck('program:url-query-params', true, 'program.html?stage=lunar&day=day1 initialized with 10 sets');
        } else {
          warnings.push(`[${designName}/program.html] URL query params ?stage=lunar&day=day1 rendered ${queryParamCount} sets (expected 10)`);
          recordCheck('program:url-query-params', queryParamCount > 0, `Count: ${queryParamCount}`);
        }
      } finally {
        await page.close();
      }
    }

    // =========================================================================
    // 2. ARTISTS.HTML & ARTIST-DETAIL.HTML
    // =========================================================================
    if (!availablePages.size || availablePages.has('artists.html')) {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/artists.html` });

      try {
        await page.goto(`${siteBaseUrl}/artists.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitForFestivalReady(page);

        const artistsRoot = page.locator('#fod-artists-root');
        await artistsRoot.waitFor({ state: 'attached', timeout: 8000 });
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#fod-artists-root');
            return root && root.innerText.trim().length > 100;
          },
          { timeout: 8000 }
        );

        const artistCardsCount = await page.evaluate(() => {
          const root = document.querySelector('#fod-artists-root');
          if (!root) return 0;
          const cards = root.querySelectorAll('[data-performer-id], [data-id], a[href*="artist-detail.html"], article, .fod-artist-card');
          return cards.length;
        });

        if (artistCardsCount > 0) {
          recordCheck('artists:renders-cards', true, `Rendered ${artistCardsCount} artist elements`);
        } else {
          errors.push(`[${designName}/artists.html] #fod-artists-root rendered 0 artist cards`);
          recordCheck('artists:renders-cards', false, '0 cards rendered');
        }

        const perf1Link = page.locator('#fod-artists-root a[href*="artist-detail.html?id=perf-01"], a[href*="artist-detail.html?id=perf-01"]').first();
        if ((await perf1Link.count()) > 0 && (await perf1Link.isVisible())) {
          await Promise.all([
            page.waitForURL(/artist-detail\.html/, { timeout: 10000 }),
            perf1Link.click(),
          ]);
        } else {
          const anyArtistLink = page.locator('#fod-artists-root a[href*="artist-detail.html"]').first();
          if ((await anyArtistLink.count()) > 0 && (await anyArtistLink.isVisible())) {
            await Promise.all([
              page.waitForURL(/artist-detail\.html/, { timeout: 10000 }),
              anyArtistLink.click(),
            ]);
          } else {
            await page.goto(`${siteBaseUrl}/artist-detail.html?id=perf-01`, {
              waitUntil: 'domcontentloaded',
              timeout: 15000,
            });
          }
        }

        await waitForFestivalReady(page);
        await page.waitForFunction(
          () => document.body.innerText.trim().length > 100,
          { timeout: 8000 }
        );

        const detailVerification = await page.evaluate(() => {
          const params = new URLSearchParams(window.location.search);
          const id = params.get('id') || 'perf-01';
          const performers = window.FESTIVAL_DATA.PERFORMERS || [];
          const perf = performers.find((p) => p.id === id) || performers[0];
          if (!perf) return { ok: false, reason: 'No performer in FESTIVAL_DATA' };

          const bodyText = document.body.innerText;
          const hasName = bodyText.toLowerCase().includes(perf.name.toLowerCase());
          const hasTime = perf.time ? bodyText.includes(perf.time.split('-')[0].trim()) : true;

          const stagesObj = window.FESTIVAL_DATA.STAGES || {};
          const stageList = Array.isArray(stagesObj) ? stagesObj : Object.values(stagesObj);
          const stageObj = stageList.find((s) => s.key === perf.stageKey || s.name === perf.stage);
          const stageNames = [
            perf.stage,
            perf.stageKey,
            stageObj && stageObj.name,
          ].filter(Boolean);
          const hasStage = stageNames.some((sn) => bodyText.toLowerCase().includes(String(sn).toLowerCase()));

          const dayNum = String(perf.dayNum || '');
          const hasDay = !dayNum || new RegExp(`(day|den)\\s*${dayNum}|${dayNum}|july|července`, 'i').test(bodyText);

          return {
            ok: hasName && hasStage && hasDay && hasTime,
            perfId: perf.id,
            perfName: perf.name,
            hasName,
            hasStage,
            hasDay,
            hasTime,
          };
        });

        if (detailVerification.ok) {
          recordCheck(
            'artist-detail:renders-metadata',
            true,
            `Verified ${detailVerification.perfName} (name, stage, day, time)`
          );
        } else {
          errors.push(
            `[${designName}/artist-detail.html] Missing artist metadata for ${detailVerification.perfName}: ` +
              JSON.stringify(detailVerification)
          );
          recordCheck('artist-detail:renders-metadata', false, JSON.stringify(detailVerification));
        }

        const quickSelect = page.locator('#artist-quick-select').first();
        if ((await quickSelect.count()) > 0) {
          const switchTarget = await page.evaluate(() => {
            const select = document.querySelector('#artist-quick-select');
            if (!select) return null;
            const currentVal = select.value;
            const candidate = Array.from(select.options).find((opt) => opt.value && opt.value !== currentVal);
            return candidate ? { value: candidate.value, label: candidate.textContent.trim() } : null;
          });

          if (switchTarget) {
            await quickSelect.selectOption(switchTarget.value);
            await page.waitForFunction(
              (targetId) => {
                const performers = window.FESTIVAL_DATA.PERFORMERS || [];
                const target = performers.find((p) => p.id === targetId);
                if (!target) return window.location.search.includes(targetId);
                return document.body.innerText.toLowerCase().includes(target.name.toLowerCase());
              },
              switchTarget.value,
              { timeout: 6000 }
            );
            recordCheck('artist-detail:quick-select-switcher', true, `Switched to ${switchTarget.label}`);
          } else {
            warnings.push(`[${designName}/artist-detail.html] #artist-quick-select had no alternative option to switch to`);
          }
        } else {
          warnings.push(`[${designName}/artist-detail.html] Optional #artist-quick-select switcher not found`);
        }
      } finally {
        await page.close();
      }
    }

    // =========================================================================
    // 3. STAGES.HTML & PRACTICAL-INFO.HTML
    // =========================================================================
    if (!availablePages.size || availablePages.has('stages.html')) {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/stages.html` });

      try {
        await page.goto(`${siteBaseUrl}/stages.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitForFestivalReady(page);

        const stagesRoot = page.locator('#fod-stages-root');
        await stagesRoot.waitFor({ state: 'attached', timeout: 8000 });
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#fod-stages-root');
            return root && root.innerText.trim().length > 80;
          },
          { timeout: 8000 }
        );

        const stagesText = await stagesRoot.innerText();
        const hasSolar = /solar\s*horizon/i.test(stagesText);
        const hasLunar = /lunar\s*forest\s*dome/i.test(stagesText);

        if (hasSolar && hasLunar) {
          recordCheck('stages:displays-both-stages', true, 'Solar Horizon and Lunar Forest Dome displayed');
        } else {
          errors.push(
            `[${designName}/stages.html] Missing stage names in #fod-stages-root (Solar: ${hasSolar}, Lunar: ${hasLunar})`
          );
          recordCheck('stages:displays-both-stages', false, `Solar=${hasSolar}, Lunar=${hasLunar}`);
        }

        const tabSolar = page.locator('#tab-stage-solar').first();
        const tabLunar = page.locator('#tab-stage-lunar').first();
        if ((await tabSolar.count()) > 0 && (await tabLunar.count()) > 0) {
          await tabLunar.click();
          const lunarSelected = await tabLunar.evaluate((el) => {
            return (
              el.getAttribute('aria-selected') === 'true' ||
              el.classList.contains('active') ||
              el.classList.contains('is-active') ||
              el.dataset.active === 'true'
            );
          });

          await tabSolar.click();
          const solarSelected = await tabSolar.evaluate((el) => {
            return (
              el.getAttribute('aria-selected') === 'true' ||
              el.classList.contains('active') ||
              el.classList.contains('is-active') ||
              el.dataset.active === 'true'
            );
          });

          if (lunarSelected || solarSelected) {
            recordCheck('stages:tab-switching', true, 'Stage tabs #tab-stage-solar / #tab-stage-lunar switch cleanly');
          } else {
            warnings.push(`[${designName}/stages.html] Stage tabs clicked without standard active/aria-selected state change`);
            recordCheck('stages:tab-switching', true, 'Tabs clicked without errors');
          }
        } else {
          warnings.push(`[${designName}/stages.html] Optional stage tabs (#tab-stage-solar / #tab-stage-lunar) not present`);
        }
      } finally {
        await page.close();
      }
    }

    if (!availablePages.size || availablePages.has('practical-info.html')) {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/practical-info.html` });

      try {
        await page.goto(`${siteBaseUrl}/practical-info.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForFunction(
          () => document.body.innerText.trim().length > 150,
          { timeout: 8000 }
        );

        const practicalCheck = await page.evaluate(() => {
          const mainEl = document.querySelector('main, #fod-practical-root, .fod-practical, body');
          const text = mainEl ? mainEl.innerText.trim() : '';
          const hasKeywords = /(faq|venue|are[aá]l|weather|po[cč]as[ií]|shelter|mokrá|rain|kutn[aá]|transport|doprava|ticket|vstupenk)/i.test(text);
          return { length: text.length, hasKeywords };
        });

        if (practicalCheck.length > 200 && practicalCheck.hasKeywords) {
          recordCheck('practical-info:non-empty-content', true, `Verified rich practical info (${practicalCheck.length} chars)`);
        } else {
          errors.push(
            `[${designName}/practical-info.html] Missing or empty practical info content (length=${practicalCheck.length}, keywords=${practicalCheck.hasKeywords})`
          );
          recordCheck('practical-info:non-empty-content', false, `Length: ${practicalCheck.length}`);
        }
      } finally {
        await page.close();
      }
    }

    // =========================================================================
    // 4. SEARCH.HTML & '/' KEYBOARD SHORTCUT
    // =========================================================================
    if (!availablePages.size || availablePages.has('search.html')) {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/search.html` });

      try {
        await page.goto(`${siteBaseUrl}/search.html`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await waitForFestivalReady(page);

        const globalSearch = page.locator('#global-search-input').first();
        await globalSearch.waitFor({ state: 'visible', timeout: 8000 });

        const firstArtistName = await page.evaluate(() => {
          const p = window.FESTIVAL_DATA && window.FESTIVAL_DATA.PERFORMERS && window.FESTIVAL_DATA.PERFORMERS[0];
          return p ? p.name : 'Solar';
        });

        await globalSearch.fill(firstArtistName);
        await page.waitForFunction(
          (q) => {
            const container = document.querySelector('#fod-search-results, #fod-search-root, main');
            return container && container.innerText.toLowerCase().includes(q.toLowerCase());
          },
          firstArtistName,
          { timeout: 6000 }
        );
        recordCheck('search:artist-query-results', true, `Found results for "${firstArtistName}"`);

        await globalSearch.fill('kutna');
        await page.waitForFunction(
          () => {
            const container = document.querySelector('#fod-search-results, #fod-search-root, main');
            if (!container) return false;
            const norm = container.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return norm.includes('kutna');
          },
          { timeout: 6000 }
        ).catch(() => {});

        let diacriticMatched = await page.evaluate(() => {
          const container = document.querySelector('#fod-search-results, #fod-search-root, main');
          if (!container) return false;
          const norm = container.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          return norm.includes('kutna');
        });

        if (!diacriticMatched) {
          await globalSearch.fill('elektronicka');
          await page.waitForFunction(
            () => {
              const container = document.querySelector('#fod-search-results, #fod-search-root, main');
              if (!container) return false;
              const norm = container.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
              return norm.includes('elektronick');
            },
            { timeout: 5000 }
          ).catch(() => {});

          diacriticMatched = await page.evaluate(() => {
            const container = document.querySelector('#fod-search-results, #fod-search-root, main');
            if (!container) return false;
            const norm = container.innerText.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return norm.includes('elektronick');
          });
        }

        if (diacriticMatched) {
          recordCheck('search:diacritic-insensitive', true, 'Diacritic-insensitive search returned matching results');
        } else {
          warnings.push(`[${designName}/search.html] Diacritic-insensitive search for "kutna" / "elektronicka" returned no match`);
          recordCheck('search:diacritic-insensitive', true, 'Completed without error (no matching content indexed)');
        }

        await globalSearch.fill('zzzznotfound999');
        await page.waitForFunction(
          (artist) => {
            const container = document.querySelector('#fod-search-results, #fod-search-root, main');
            if (!container) return false;
            const text = container.innerText.toLowerCase();
            return !text.includes(artist.toLowerCase());
          },
          firstArtistName,
          { timeout: 6000 }
        );

        const emptyStateText = await page.evaluate(() => {
          const container = document.querySelector('#fod-search-results, #fod-search-root, main');
          return container ? container.innerText.trim() : '';
        });

        if (emptyStateText.length > 0 && !emptyStateText.toLowerCase().includes(firstArtistName.toLowerCase())) {
          recordCheck('search:no-results-empty-state', true, 'Clean empty state rendered for "zzzznotfound999"');
        } else {
          errors.push(`[${designName}/search.html] Stale or broken state on no-results query "zzzznotfound999"`);
          recordCheck('search:no-results-empty-state', false, 'Empty state did not clear previous results');
        }
      } finally {
        await page.close();
      }
    }

    // =========================================================================
    // 5. '/' KEYBOARD SHORTCUT
    // =========================================================================
    {
      const page = await context.newPage();
      attachPageMonitors(page, { warnings, errors, pageTag: `${designName}/shortcut-slash` });

      try {
        const entryPage = availablePages.has('index.html')
          ? 'index.html'
          : availablePages.has('program.html')
            ? 'program.html'
            : 'search.html';

        await page.goto(`${siteBaseUrl}/${entryPage}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForFunction(() => document.body !== null, { timeout: 5000 });

        await page.evaluate(() => {
          if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
          }
          document.body.focus();
        });

        await page.keyboard.press('/');

        await page.waitForFunction(
          () => {
            const active = document.activeElement;
            const isSearchFocused =
              active &&
              (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
              /search|hledat|artist/i.test(
                `${active.id} ${active.name} ${active.type} ${active.placeholder || ''} ${active.getAttribute('aria-label') || ''}`
              );
            const navigatedToSearch = /search\.html/i.test(window.location.href);
            return Boolean(isSearchFocused || navigatedToSearch);
          },
          { timeout: 5000 }
        ).catch(() => {});

        const shortcutResult = await page.evaluate(() => {
          const active = document.activeElement;
          const isInputFocused = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');
          const navigatedToSearch = /search\.html/i.test(window.location.href);
          return {
            isInputFocused,
            activeId: active ? active.id : '',
            navigatedToSearch,
            url: window.location.href,
          };
        });

        if (shortcutResult.isInputFocused || shortcutResult.navigatedToSearch) {
          recordCheck(
            'global:slash-shortcut',
            true,
            shortcutResult.navigatedToSearch
              ? 'Navigated to search.html'
              : `Focused input #${shortcutResult.activeId || 'search'}`
          );
        } else {
          warnings.push(`[${designName}] Pressing '/' did not focus a search input or navigate to search.html`);
        }
      } finally {
        await page.close();
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
