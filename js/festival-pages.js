// shared/js/festival-pages.js - Unified interactive page controllers for all 11 designs
(function () {
  'use strict';

  function C() { return window.FESTIVAL_CORE; }
  function D() { return window.FESTIVAL_DATA; }

  const CZ_GENRE_TAGS = {
    electronic: "elektronika elektronicka",
    dance: "tanecni",
    experimental: "experimentalni",
    ambient: "ambientni",
    folk: "akustika",
    rock: "kytary"
  };

  function buildPerformerSearchHaystack(p, core, data) {
    const country = (data.COUNTRIES && data.COUNTRIES[p.origin]) || { en: "", cs: "" };
    const stageExtra = p.stageKey === "lunar"
      ? "kryty kryte covered dome kupole rain shelter dest ukryt"
      : "venkovni open-air open air amfiteatr amphitheater";
    const genreTags = [];
    if (data.GENRE_ALIASES) {
      Object.keys(data.GENRE_ALIASES).forEach(key => {
        if (core.matchesGenreFilter(p.genre, key)) {
          genreTags.push(key);
          if (CZ_GENRE_TAGS[key]) genreTags.push(CZ_GENRE_TAGS[key]);
        }
      });
    }
    return core.normalizeStr(
      `${p.id} ${p.name} ${p.genre} ${genreTags.join(" ")} ${p.stage} ${stageExtra} ${p.origin} ${country.en} ${country.cs} ${p.dayEn} ${p.dayCs} ${p.dayShortEn} ${p.dayShortCs} den ${p.dayNum} day ${p.dayNum} ${p.time} ${p.bioEn} ${p.bioCs}`
    );
  }

  function matchesAllTokens(haystack, tokens) {
    if (!tokens.length) return true;
    return tokens.every(tok => haystack.includes(tok));
  }

  const DAY_ISO_MAP = { day1: '2026-07-10', day2: '2026-07-11', day3: '2026-07-12' };
  const NEXT_DAY_ISO_MAP = { day1: '2026-07-11', day2: '2026-07-12', day3: '2026-07-13' };

  function toIsoDateTime(dayKey, hmStr) {
    const m = String(hmStr || '').trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return '';
    const h = parseInt(m[1], 10);
    const min = m[2];
    const baseDate = h < 8 ? NEXT_DAY_ISO_MAP[dayKey] : DAY_ISO_MAP[dayKey];
    if (!baseDate) return '';
    return `${baseDate}T${String(h).padStart(2, '0')}:${min}`;
  }

  function renderTimeTag(dayKey, hmStr, core) {
    const clean = String(hmStr || '').trim();
    const iso = toIsoDateTime(dayKey, clean);
    const safeText = core ? core.escapeHtml(clean) : clean;
    return iso ? `<time datetime="${iso}">${safeText}</time>` : safeText;
  }

  function renderTimeRangeHtml(dayKey, timeStr, core) {
    const raw = String(timeStr || '').trim();
    if (!raw) return '';
    const sep = raw.includes('–') ? ' – ' : ' - ';
    const parts = raw.split(/[–-]/).map(s => s.trim()).filter(Boolean);
    if (parts.length === 0) return core ? core.escapeHtml(raw) : raw;
    if (parts.length === 1) return renderTimeTag(dayKey, parts[0], core);
    return `${renderTimeTag(dayKey, parts[0], core)}${sep}${renderTimeTag(dayKey, parts[1], core)}`;
  }

  function renderHourSlotHtml(dayKey, normHour) {
    const startH = normHour >= 24 ? normHour - 24 : normHour;
    const endH = (startH + 1) % 24;
    const startStr = `${String(startH).padStart(2, '0')}:00`;
    const endStr = `${String(endH).padStart(2, '0')}:00`;
    return `${renderTimeTag(dayKey, startStr)} - ${renderTimeTag(dayKey, endStr)}`;
  }

  // =========================================================================
  // 1. PROGRAM PAGE (60-set timetable, Day/Stage/Genre/Fav/Search filters)
  // =========================================================================
  function getActiveFestivalContext(nowInput) {
    const now = nowInput instanceof Date ? nowInput : new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const h = now.getHours();
    const min = now.getMinutes();
    const normMinutes = (h < 8 ? h + 24 : h) * 60 + min;

    let effDay = d;
    if (h < 8) {
      const prev = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      if (prev.getFullYear() === 2026 && prev.getMonth() + 1 === 7) {
        effDay = prev.getDate();
      } else {
        effDay = -1;
      }
    }

    let activeDayKey = 'day1';
    let isLiveFestival = false;
    if (y === 2026 && m === 7 && effDay >= 10 && effDay <= 12) {
      activeDayKey = effDay === 10 ? 'day1' : (effDay === 11 ? 'day2' : 'day3');
      isLiveFestival = true;
    }

    return { activeDayKey, isLiveFestival, nowMinutes: normMinutes };
  }

  function parseSlotBounds(timeStr, core) {
    const parts = String(timeStr || '').split(/[–-]/).map(s => s.trim()).filter(Boolean);
    const startMin = core.timeToMinutes(parts[0] || '14:00');
    let endMin = parts[1] ? core.timeToMinutes(parts[1]) : startMin + 60;
    if (endMin < startMin) endMin += 24 * 60;
    return { startMin, endMin };
  }

  function initProgramPage() {
    const root = document.getElementById('fod-program-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();
    const festCtx = getActiveFestivalContext();

    const state = {
      day: 'all',
      stage: 'all',
      timeWindow: 'all',
      genre: 'all',
      onlyFavs: false,
      query: '',
      highlightId: ''
    };

    try {
      const params = new URLSearchParams(window.location.search);
      const sp = (params.get('stage') || '').toLowerCase();
      if (sp === 'solar' || sp === 'lunar') state.stage = sp;
      const dp = (params.get('day') || '').toLowerCase();
      if (dp === '1' || dp === 'day1') state.day = 'day1';
      else if (dp === '2' || dp === 'day2') state.day = 'day2';
      else if (dp === '3' || dp === 'day3') state.day = 'day3';
      else if (dp === 'today' || dp === 'tonight') state.day = festCtx.activeDayKey;
      const wp = (params.get('window') || '').toLowerCase();
      if (wp === 'tonight' || wp === 'evening') {
        state.timeWindow = 'tonight';
        if (state.day === 'all') state.day = festCtx.activeDayKey;
      }
      const gp = (params.get('genre') || '').toLowerCase();
      if (gp) state.genre = gp;
      const fp = (params.get('favs') || '').toLowerCase();
      if (fp === '1' || fp === 'true') state.onlyFavs = true;
      const qp = params.get('q');
      if (qp) state.query = qp;
      const hl = params.get('highlight') || window.location.hash.replace('#', '');
      if (hl && /^perf-\d+$/i.test(hl)) state.highlightId = hl.toLowerCase();
    } catch (e) {}

    function syncProgramUrl() {
      try {
        const url = new URL(window.location.href);
        const params = new URLSearchParams();
        if (state.stage !== 'all') params.set('stage', state.stage);
        if (state.day !== 'all') params.set('day', state.day);
        if (state.timeWindow !== 'all') params.set('window', state.timeWindow);
        if (state.genre !== 'all') params.set('genre', state.genre);
        if (state.onlyFavs) params.set('favs', '1');
        if (state.query.trim()) params.set('q', state.query.trim());
        const qs = params.toString();
        url.search = qs ? `?${qs}` : '';
        window.history.replaceState({}, '', url.pathname + url.search + url.hash);
      } catch (e) {}
    }

    function getFilteredPerformers() {
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const tokens = core.normalizeStr(state.query.trim()).split(/\s+/).filter(Boolean);
      return data.PERFORMERS.filter(p => {
        if (state.day !== "all" && p.dayKey !== state.day) return false;
        if (state.stage !== "all" && p.stageKey !== state.stage) return false;
        if (state.timeWindow === "tonight" && core.timeToMinutes(p.start) < 18 * 60) return false;
        if (state.genre !== "all" && !core.matchesGenreFilter(p.genre, state.genre)) return false;
        if (state.onlyFavs && !favIds.has(p.id)) return false;
        if (tokens.length) {
          const hay = buildPerformerSearchHaystack(p, core, data);
          if (!matchesAllTokens(hay, tokens)) return false;
        }
        return true;
      });
    }

    function renderShell() {
      const isCs = core.getLang() === 'cs';
      const favCount = core.getFavorites().length;
      const isQuickLunarActive = state.stage === 'lunar' && state.timeWindow === 'tonight' && state.day === festCtx.activeDayKey;
      const activeDayObj = data.DAYS.find(d => d.key === festCtx.activeDayKey) || data.DAYS[0];
      const activeDayShort = isCs ? activeDayObj.shortCs : activeDayObj.shortEn;
      const hasSecondaryActive = state.genre !== 'all' || state.query.trim() !== '';
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 769;
      const secondaryCount = (state.genre !== 'all' ? 1 : 0) + (state.query.trim() ? 1 : 0);
      const genres = [
        { key: 'all', en: 'All Genres', cs: 'Všechny žánry' },
        { key: 'ambient', en: 'Ambient', cs: 'Ambient' },
        { key: 'indie', en: 'Indie', cs: 'Indie' },
        { key: 'rock', en: 'Rock', cs: 'Rock' },
        { key: 'pop', en: 'Pop', cs: 'Pop' },
        { key: 'techno', en: 'Techno', cs: 'Techno' },
        { key: 'electronic', en: 'Electronic', cs: 'Elektronika' },
        { key: 'dance', en: 'Dance', cs: 'Taneční' },
        { key: 'experimental', en: 'Experimental', cs: 'Experimentální' },
        { key: 'folk', en: 'Folk', cs: 'Folk' },
        { key: 'bass', en: 'Bass', cs: 'Bass' }
      ];

      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="index.html">${isCs ? 'Přehled' : 'Overview'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Program' : 'Program'}</span>
        </nav>

        <div class="fod-rain-quickbar" role="region" aria-label="${isCs ? 'Rychlý přístup ke krytému pódiu' : 'Covered stage quick filter'}">
          <div class="fod-rain-quickbar-copy">
            <strong>${isCs ? 'Prší nebo hledáte střechu?' : 'Rain or need a roof?'}</strong>
            <span>${isCs
              ? `Krytý Lunar Forest Dome (1 800 míst) hraje za každého počasí (${activeDayShort}).`
              : `Covered Lunar Forest Dome (1,800 cap) runs uninterrupted in all weather (${activeDayShort}).`}</span>
          </div>
          <button type="button" id="quick-lunar-btn" class="fod-btn fod-btn-lunar ${isQuickLunarActive ? 'is-active' : ''}" aria-pressed="${isQuickLunarActive}">
            ${isQuickLunarActive
              ? (isCs ? '✓ Kryté pódium dnes večer (Zobrazit vše)' : '✓ Covered Stage Tonight (Show All)')
              : (isCs ? 'Lunar Dome dnes večer (Kryté)' : 'Lunar Dome Tonight (Covered)')}
          </button>
        </div>

        <div class="fod-toolbar-panel">
          <div class="fod-plan-summary-row">
            <div class="fod-plan-summary-left">
              <span class="fod-pill-stat">
                <strong id="fav-count">${favCount}</strong>
                <span id="fod-prog-fav-label">${isCs ? 'uloženo v Mém plánu' : 'saved in My Schedule'}</span>
              </span>
              <button type="button" id="fod-program-conflict-pill" class="fod-conflict-pill is-hidden" aria-controls="fod-program-conflict-slot"></button>
              <span class="fod-status-text" id="filter-status-text" aria-live="polite"></span>
            </div>
            <div class="fod-plan-summary-actions">
              <a href="my-schedule.html" class="fod-btn fod-btn-primary fod-open-schedule-cta">
                ${isCs ? 'Otevřít Můj plán' : 'Open My Schedule'} (<span class="fav-count-badge">${favCount}</span>)
              </a>
              <button type="button" id="clear-favorites-btn" class="fod-btn fod-btn-ghost">
                ${isCs ? 'Vymazat oblíbené' : 'Clear Saved'}
              </button>
            </div>
          </div>

          <div class="fod-filter-stack">
            <div class="fod-filter-group">
              <span class="fod-filter-group-label">${isCs ? 'Dny' : 'Days'}</span>
              <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle dne' : 'Filter by day'}">
                <button type="button" class="fod-chip ${state.day === 'all' ? 'is-active' : ''}" data-filter-day="all" aria-pressed="${state.day === 'all'}">${isCs ? 'Všechny dny (60)' : 'All Days (60)'}</button>
                <button type="button" class="fod-chip ${state.day === 'day1' ? 'is-active' : ''}" data-filter-day="day1" aria-pressed="${state.day === 'day1'}">${isCs ? 'Den 1 · Pá 10. 7.' : 'Day 1 · Fri 10 Jul'}${festCtx.isLiveFestival && festCtx.activeDayKey === 'day1' ? (isCs ? ' (Dnes)' : ' (Today)') : ''}</button>
                <button type="button" class="fod-chip ${state.day === 'day2' ? 'is-active' : ''}" data-filter-day="day2" aria-pressed="${state.day === 'day2'}">${isCs ? 'Den 2 · So 11. 7.' : 'Day 2 · Sat 11 Jul'}${festCtx.isLiveFestival && festCtx.activeDayKey === 'day2' ? (isCs ? ' (Dnes)' : ' (Today)') : ''}</button>
                <button type="button" class="fod-chip ${state.day === 'day3' ? 'is-active' : ''}" data-filter-day="day3" aria-pressed="${state.day === 'day3'}">${isCs ? 'Den 3 · Ne 12. 7.' : 'Day 3 · Sun 12 Jul'}${festCtx.isLiveFestival && festCtx.activeDayKey === 'day3' ? (isCs ? ' (Dnes)' : ' (Today)') : ''}</button>
              </div>
            </div>

            <div class="fod-filter-group">
              <span class="fod-filter-group-label">${isCs ? 'Pódia a čas' : 'Stages & Time'}</span>
              <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle pódia' : 'Filter by stage'}">
                <button type="button" class="fod-chip ${state.stage === 'all' ? 'is-active' : ''}" data-filter-stage="all" aria-pressed="${state.stage === 'all'}">${isCs ? 'Všechna pódia' : 'All Stages'}</button>
                <button type="button" class="fod-chip ${state.stage === 'solar' ? 'is-active' : ''}" data-filter-stage="solar" aria-pressed="${state.stage === 'solar'}">${isCs ? 'Solar Horizon (Venkovní)' : 'Solar Horizon (Open-air)'}</button>
                <button type="button" class="fod-chip fod-chip-lunar ${state.stage === 'lunar' ? 'is-active' : ''}" data-filter-stage="lunar" aria-pressed="${state.stage === 'lunar'}">${isCs ? 'Lunar Forest Dome (Kryté)' : 'Lunar Forest Dome (Covered)'}</button>
                <button type="button" class="fod-chip ${state.timeWindow === 'tonight' ? 'is-active' : ''}" data-filter-window="tonight" aria-pressed="${state.timeWindow === 'tonight'}">${isCs ? 'Večer a noc (18:00-04:00)' : 'Tonight (18:00-04:00)'}</button>
                <button type="button" id="filter-fav-only" class="fod-chip fod-chip-fav ${state.onlyFavs ? 'is-active' : ''}" aria-pressed="${state.onlyFavs}">
                  ${isCs ? '★ Jen moje oblíbené' : '★ My Favourites Only'}
                </button>
              </div>
            </div>

            <details class="fod-more-filters" id="fod-more-filters" ${(isDesktop || hasSecondaryActive) ? 'open' : ''}>
              <summary class="fod-more-filters-summary">
                <span>${isCs ? 'Žánry a vyhledávání' : 'Genres & Search'}</span>
                ${secondaryCount > 0 ? `<span class="fod-badge is-active">${secondaryCount}</span>` : ''}
              </summary>
              <div class="fod-more-filters-body">
                <div class="fod-filter-group">
                  <span class="fod-filter-group-label">${isCs ? 'Žánry' : 'Genres'}</span>
                  <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle žánru' : 'Filter by genre'}">
                    ${genres.map(g => `
                      <button type="button" class="fod-chip ${state.genre === g.key ? 'is-active' : ''}" data-filter-genre="${g.key}" aria-pressed="${state.genre === g.key}">
                        ${isCs ? g.cs : g.en}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <div class="fod-search-row">
                  <label for="artist-search-input" class="fod-sr-only">${isCs ? 'Hledat v programu' : 'Search timetable'}</label>
                  <input type="search" id="artist-search-input" class="fod-input"
                    value="${core.escapeHtml(state.query)}"
                    placeholder="${isCs ? 'Filtrovat podle interpreta, žánru nebo pódia...' : 'Filter by artist, genre, or stage...'}">
                  <button type="button" id="clear-search-btn" class="fod-btn fod-btn-secondary">
                    ${isCs ? 'Vymazat' : 'Clear'}
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>

        <div id="fod-program-conflict-slot" class="fod-program-conflict-slot is-hidden" aria-live="polite"></div>
        <div id="fod-stage-context-slot"></div>
        <div id="fod-program-days"></div>
      `;

      bindShellEvents();
      renderDays();
    }

    function updateQuickLunarButton() {
      const quickLunarBtn = document.getElementById('quick-lunar-btn');
      if (!quickLunarBtn) return;
      const isCs = core.getLang() === 'cs';
      const isActive = state.stage === 'lunar' && state.timeWindow === 'tonight' && state.day === festCtx.activeDayKey;
      quickLunarBtn.classList.toggle('is-active', isActive);
      quickLunarBtn.setAttribute('aria-pressed', String(isActive));
      quickLunarBtn.textContent = isActive
        ? (isCs ? '✓ Kryté pódium dnes večer (Zobrazit vše)' : '✓ Covered Stage Tonight (Show All)')
        : (isCs ? 'Lunar Dome dnes večer (Kryté)' : 'Lunar Dome Tonight (Covered)');
    }

    const CONFLICT_ICON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';

    function formatCardConflictText(conflicts, isCs) {
      if (!conflicts || !conflicts.length) return '';
      const first = conflicts[0];
      const firstArtist = first.artist || first.name || first.id;
      const extra = conflicts.length - 1;
      if (extra > 0) {
        return isCs
          ? `Kolize s ${firstArtist} (${first.time}) +${extra} další`
          : `Overlaps with ${firstArtist} (${first.time}) +${extra} more`;
      }
      return isCs
        ? `Kolize s ${firstArtist} (${first.time})`
        : `Overlaps with ${firstArtist} (${first.time})`;
    }

    function renderCardConflictNoteHtml(conflicts, isCs) {
      if (!conflicts || !conflicts.length) return '';
      const heading = isCs ? 'Časová kolize:' : 'Time conflict:';
      return `<div class="fod-card-conflict-note">${CONFLICT_ICON_SVG}<span><strong>${heading}</strong> ${core.escapeHtml(formatCardConflictText(conflicts, isCs))}</span></div>`;
    }

    function syncProgramConflictUi(collisionsArg) {
      const isCs = core.getLang() === 'cs';
      const collisions = collisionsArg || (typeof core.computeScheduleCollisions === 'function'
        ? core.computeScheduleCollisions(core.getFavorites())
        : { total: 0, pairs: [], byId: new Map() });
      const pill = document.getElementById('fod-program-conflict-pill');
      const slot = document.getElementById('fod-program-conflict-slot');

      if (pill) {
        if (collisions.total > 0) {
          const pillLabel = isCs
            ? core.formatCzPlural(collisions.total, 'kolize', 'kolize', 'kolizí')
            : (collisions.total === 1 ? '1 conflict' : `${collisions.total} conflicts`);
          pill.innerHTML = `${CONFLICT_ICON_SVG}<span>${core.escapeHtml(pillLabel)}</span>`;
          pill.classList.remove('is-hidden');
        } else {
          pill.classList.add('is-hidden');
          pill.innerHTML = '';
        }
      }

      if (slot) {
        if (collisions.total === 0) {
          slot.classList.add('is-hidden');
          if (slot.innerHTML !== '') slot.innerHTML = '';
          return;
        }
        const dayLookup = new Map(data.DAYS.map(d => [d.key, d]));
        const headingText = isCs
          ? `${core.formatCzPlural(collisions.total, 'časová kolize', 'časové kolize', 'časových kolizí')} ve vašem plánu`
          : `${collisions.total === 1 ? '1 time conflict' : `${collisions.total} time conflicts`} in your schedule`;
        const maxShown = 3;
        const shownPairs = collisions.pairs.slice(0, maxShown);
        const remaining = collisions.pairs.length - shownPairs.length;

        const pairsHtml = shownPairs.map(pair => {
          const dayObj = dayLookup.get(pair.dayKey);
          const dayShort = dayObj ? (isCs ? dayObj.shortCs : dayObj.shortEn) : pair.dayKey;
          const aName = pair.a.artist || pair.a.name || pair.a.id;
          const bName = pair.b.artist || pair.b.name || pair.b.id;
          return `
            <li class="fod-conflict-pair-item">
              <div class="fod-conflict-pair-text">
                <span class="fod-conflict-pair-day">${core.escapeHtml(dayShort)}</span>
                <span><strong>${core.escapeHtml(aName)}</strong> (${core.escapeHtml(pair.a.time)}) vs <strong>${core.escapeHtml(bName)}</strong> (${core.escapeHtml(pair.b.time)})</span>
              </div>
              <button type="button" class="fod-conflict-jump-btn" data-jump-perf="${core.escapeHtml(pair.b.id)}">
                ${isCs ? 'Zobrazit v programu' : 'Show in Program'}
              </button>
            </li>
          `;
        }).join('');

        const moreHtml = remaining > 0
          ? `<p class="fod-conflict-more-note">${isCs
              ? `+ ${core.formatCzPlural(remaining, 'další kolize', 'další kolize', 'dalších kolizí')} v Mém plánu`
              : `+ ${remaining} more ${remaining === 1 ? 'conflict' : 'conflicts'} in My Schedule`}</p>`
          : '';

        slot.classList.remove('is-hidden');
        slot.innerHTML = `
          <div class="fod-program-conflict-banner" role="alert">
            <div class="fod-conflict-banner-head">
              <p class="fod-conflict-banner-title">${CONFLICT_ICON_SVG}<span>${core.escapeHtml(headingText)}</span></p>
              <a href="my-schedule.html" class="fod-conflict-banner-link">${isCs ? 'Vyřešit v Mém plánu' : 'Resolve in My Schedule'}</a>
            </div>
            <ul class="fod-conflict-pair-list">${pairsHtml}</ul>
            ${moreHtml}
          </div>
        `;
      }
    }

    function focusPerformerCard(perfId) {
      if (!perfId) return;
      let el = document.getElementById(perfId);
      if (!el || state.stage !== 'all') {
        const perf = data.PERFORMERS.find(p => p.id === perfId);
        if (perf) {
          state.stage = 'all';
          state.genre = 'all';
          state.timeWindow = 'all';
          state.query = '';
          state.onlyFavs = false;
          if (state.day !== 'all' && state.day !== perf.dayKey) {
            state.day = perf.dayKey;
          }
          syncProgramUrl();
          renderShell();
          el = document.getElementById(perfId);
        }
      }
      if (!el) return;
      const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      el.classList.remove('is-conflict-focus');
      void el.offsetWidth;
      el.classList.add('is-conflict-focus');
      setTimeout(() => el.classList.remove('is-conflict-focus'), 1800);
    }

    function renderDays() {
      const daysContainer = document.getElementById('fod-program-days');
      const contextSlot = document.getElementById('fod-stage-context-slot');
      const statusEl = document.getElementById('filter-status-text');
      if (!daysContainer) return;

      const isCs = core.getLang() === 'cs';
      const favs = core.getFavorites();
      const favIds = new Set(favs.map(f => f.id));
      const collisions = typeof core.computeScheduleCollisions === 'function'
        ? core.computeScheduleCollisions(favs)
        : { total: 0, pairs: [], byId: new Map() };
      const matched = getFilteredPerformers();
      syncProgramConflictUi(collisions);

      if (contextSlot) {
        if (state.stage === 'lunar') {
          const lunar = data.STAGES.lunar;
          contextSlot.innerHTML = `
            <div class="fod-stage-context-banner is-lunar" role="status">
              <div>
                <strong>${core.escapeHtml(lunar.name)} (${isCs ? 'Kryté pódium · Úkryt před deštěm' : 'Covered Indoor Stage · Rain Shelter'})</strong>
                <p>${core.escapeHtml(isCs ? lunar.locationCs : lunar.locationEn)} (${lunar.capacity.toLocaleString()} ${isCs ? 'míst' : 'cap'}, ${lunar.hours})${state.timeWindow === 'tonight' ? (isCs ? ' - zobrazen večerní a noční program (18:00-04:00).' : ' - showing evening and late-night sets (18:00-04:00).') : ''}</p>
              </div>
              ${state.day === 'all' ? `
                <button type="button" class="fod-btn fod-btn-secondary fod-btn-sm" id="fod-ctx-today-btn">
                  ${isCs ? 'Zobrazit jen 1 den' : 'Focus Single Day'}
                </button>
              ` : ''}
            </div>
          `;
          const ctxBtn = document.getElementById('fod-ctx-today-btn');
          if (ctxBtn) {
            ctxBtn.addEventListener('click', () => {
              state.day = festCtx.activeDayKey;
              syncProgramUrl();
              renderShell();
            });
          }
        } else if (state.stage === 'solar') {
          const solar = data.STAGES.solar;
          contextSlot.innerHTML = `
            <div class="fod-stage-context-banner is-solar" role="status">
              <div>
                <strong>${core.escapeHtml(solar.name)} (${isCs ? 'Venkovní amfiteátr' : 'Open-air Amphitheater'})</strong>
                <p>${core.escapeHtml(isCs ? solar.locationCs : solar.locationEn)} (${solar.capacity.toLocaleString()} ${isCs ? 'míst' : 'cap'}, ${solar.hours})</p>
              </div>
            </div>
          `;
        } else {
          contextSlot.innerHTML = '';
        }
      }

      if (statusEl) {
        const total = data.PERFORMERS.length;
        const parts = [];
        if (state.stage === 'lunar') parts.push(isCs ? 'Lunar Forest Dome (Kryté)' : 'Lunar Forest Dome (Covered)');
        else if (state.stage === 'solar') parts.push(isCs ? 'Solar Horizon (Venkovní)' : 'Solar Horizon (Open-air)');
        if (state.timeWindow === 'tonight') parts.push(isCs ? '18:00-04:00' : 'Tonight 18:00-04:00');
        const suffix = parts.length ? ` (${parts.join(', ')})` : '';
        statusEl.textContent = isCs
          ? `Zobrazeno ${matched.length} z ${total} vystoupení${suffix}`
          : `Showing ${matched.length} of ${total} shows${suffix}`;
      }

      if (matched.length === 0) {
        const qTrim = state.query.trim();
        const searchHref = qTrim ? `search.html?q=${encodeURIComponent(qTrim)}` : "search.html";
        daysContainer.innerHTML = `
          <div class="fod-empty-card">
            <h3>${isCs ? "Žádná vystoupení neodpovídají vybraným filtrům" : "No shows match the active filters"}</h3>
            <p>${isCs ? "Zkuste upravit den, pódium, žánr nebo vyhledat pojem napříč celým webem festivalu." : "Try adjusting day, stage, genre, or search across the whole festival site."}</p>
            <div class="fod-empty-actions">
              <button type="button" class="fod-btn fod-btn-primary" id="fod-prog-reset-btn">
                ${isCs ? "Resetovat všechny filtry" : "Reset All Filters"}
              </button>
              <a href="${searchHref}" class="fod-btn fod-btn-secondary">
                ${isCs ? "Hledat na celém webu" : "Search Whole Festival"}
              </a>
            </div>
          </div>
        `;
        const resetBtn = document.getElementById('fod-prog-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            state.day = 'all';
            state.stage = 'all';
            state.timeWindow = 'all';
            state.genre = 'all';
            state.onlyFavs = false;
            state.query = '';
            syncProgramUrl();
            renderShell();
          });
        }
        return;
      }

      function getNormalizedHour(startStr) {
        const h = parseInt(String(startStr || '0').split(':')[0], 10) || 0;
        return h < 8 ? h + 24 : h;
      }

      const upNextByStage = new Set();
      if (festCtx.isLiveFestival) {
        ['solar', 'lunar'].forEach(sk => {
          const next = matched
            .filter(p => p.dayKey === festCtx.activeDayKey && p.stageKey === sk && parseSlotBounds(p.time, core).startMin > festCtx.nowMinutes)
            .sort((a, b) => core.timeToMinutes(a.start) - core.timeToMinutes(b.start))[0];
          if (next) upNextByStage.add(next.id);
        });
      }

      function renderPerformerCard(p) {
        const isFav = favIds.has(p.id);
        const cardConflicts = isFav ? (collisions.byId.get(p.id) || []) : [];
        const hasCol = cardConflicts.length > 0;
        const stageCls = p.stageKey === 'lunar' ? 'is-lunar' : 'is-solar';
        const hlCls = state.highlightId === p.id ? 'spot-highlight' : '';
        const bounds = parseSlotBounds(p.time, core);
        const isLiveNow = festCtx.isLiveFestival && p.dayKey === festCtx.activeDayKey && festCtx.nowMinutes >= bounds.startMin && festCtx.nowMinutes < bounds.endMin;
        const isUpNext = !isLiveNow && upNextByStage.has(p.id);
        const statusPill = isLiveNow
          ? `<span class="fod-live-pill">${isCs ? 'Právě hraje' : 'Live Now'}</span>`
          : (isUpNext ? `<span class="fod-next-pill">${isCs ? 'Následuje' : 'Up Next'}</span>` : '');
        const stageLabel = p.stageKey === 'lunar'
          ? (isCs ? 'Lunar Dome (Kryté)' : 'Lunar Dome (Covered)')
          : (isCs ? 'Solar Horizon (Venkovní)' : 'Solar Horizon (Open-air)');

        return `
          <article class="fod-timetable-card ${stageCls} ${isFav ? 'is-saved' : ''} ${hasCol ? 'has-collision' : ''} ${isLiveNow ? 'is-live-now' : ''} ${hlCls}" id="${p.id}" data-id="${p.id}"${hasCol ? ' data-conflict="true"' : ''}>
            <div class="fod-timetable-card-top">
              <span class="fod-slot-time">${renderTimeRangeHtml(p.dayKey, p.time, core)}</span>
              ${statusPill}
              <span class="fod-stage-pill ${stageCls}">${core.escapeHtml(stageLabel)}</span>
            </div>
            <div class="fod-timetable-card-body">
              <a href="artist-detail.html?id=${p.id}&from=program#${p.id}" class="fod-slot-artist">
                ${core.escapeHtml(p.name)}
              </a>
              <div class="fod-timetable-card-meta">
                <span class="fod-origin-pill">${core.escapeHtml(p.origin)}</span>
                <span class="fod-slot-genre">${core.escapeHtml(p.genre)}</span>
              </div>
            </div>
            <div class="fod-card-conflict-slot">${renderCardConflictNoteHtml(cardConflicts, isCs)}</div>
            <div class="fod-slot-actions">
              <a href="artist-detail.html?id=${p.id}&from=program#${p.id}" class="fod-btn fod-btn-ghost fod-btn-sm">
                ${isCs ? 'Detail' : 'Details'}<span class="fod-sr-only"> (${core.escapeHtml(p.name)})</span>
              </a>
              <button type="button" class="fod-btn fod-btn-sm fav-toggle-btn ${isFav ? 'is-saved' : ''}" data-perf-id="${p.id}" aria-pressed="${isFav}">
                ${isFav ? (isCs ? '✓ V plánu' : '✓ In Plan') : (isCs ? '+ Přidat' : '+ Add')}<span class="fod-sr-only"> (${core.escapeHtml(p.name)})</span>
              </button>
            </div>
          </article>
        `;
      }

      function renderEmptySlotCell() {
        const hasSecondaryFilter = state.genre !== 'all' || state.onlyFavs || state.query.trim() !== '' || state.timeWindow !== 'all';
        const label = hasSecondaryFilter
          ? (isCs ? 'Bez odpovídajícího setu' : 'No matching set')
          : (isCs ? 'Přestavba pódia' : 'Stage changeover');
        return `<div class="fod-slot-empty">${label}</div>`;
      }

      const isSingleStage = state.stage === 'solar' || state.stage === 'lunar';
      const daysToShow = data.DAYS.filter(d => state.day === 'all' || state.day === d.key);
      daysContainer.innerHTML = daysToShow.map(day => {
        const items = matched
          .filter(p => p.dayKey === day.key)
          .sort((a, b) => core.timeToMinutes(a.start) - core.timeToMinutes(b.start));

        if (items.length === 0) return '';

        const countLabel = isCs
          ? core.formatCzPlural(items.length, 'vystoupení', 'vystoupení', 'vystoupení')
          : (items.length === 1 ? '1 set' : `${items.length} sets`);

        const bucketMap = new Map();
        items.forEach(p => {
          const normHour = getNormalizedHour(p.start);
          if (!bucketMap.has(normHour)) {
            bucketMap.set(normHour, { normHour, solar: [], lunar: [] });
          }
          const bucket = bucketMap.get(normHour);
          if (p.stageKey === 'lunar') bucket.lunar.push(p);
          else bucket.solar.push(p);
        });

        const buckets = Array.from(bucketMap.values()).sort((a, b) => a.normHour - b.normHour);

        const headHtml = isSingleStage
          ? `
            <div class="fod-timetable-head is-single">
              <div class="fod-th-time">${isCs ? 'Časový slot' : 'Time Slot'}</div>
              <div class="fod-th-stage ${state.stage === 'lunar' ? 'is-lunar' : 'is-solar'}">
                <span class="fod-stage-pill ${state.stage === 'lunar' ? 'is-lunar' : 'is-solar'}">
                  ${state.stage === 'lunar'
                    ? (isCs ? 'Lunar Forest Dome (Kryté)' : 'Lunar Forest Dome (Covered)')
                    : (isCs ? 'Solar Horizon Stage (Venkovní)' : 'Solar Horizon Stage (Open-air)')}
                </span>
              </div>
            </div>
          `
          : `
            <div class="fod-timetable-head is-parallel">
              <div class="fod-th-time">${isCs ? 'Časový slot' : 'Time Slot'}</div>
              <div class="fod-th-stage is-solar">
                <span class="fod-stage-pill is-solar">${isCs ? 'Solar Horizon Stage (Venkovní)' : 'Solar Horizon Stage (Open-air)'}</span>
              </div>
              <div class="fod-th-stage is-lunar">
                <span class="fod-stage-pill is-lunar">${isCs ? 'Lunar Forest Dome (Kryté)' : 'Lunar Forest Dome (Covered)'}</span>
              </div>
            </div>
          `;

        const rowsHtml = buckets.map(bucket => {
          const hourLabel = renderHourSlotHtml(day.key, bucket.normHour);

          if (isSingleStage) {
            const stageItems = state.stage === 'lunar' ? bucket.lunar : bucket.solar;
            return `
              <div class="fod-time-row is-single">
                <div class="fod-time-cell">${hourLabel}</div>
                <div class="fod-stage-cell is-${state.stage}">
                  ${stageItems.map(p => renderPerformerCard(p)).join('')}
                </div>
              </div>
            `;
          }

          const solarHtml = bucket.solar.length > 0
            ? bucket.solar.map(p => renderPerformerCard(p)).join('')
            : renderEmptySlotCell();
          const lunarHtml = bucket.lunar.length > 0
            ? bucket.lunar.map(p => renderPerformerCard(p)).join('')
            : renderEmptySlotCell();

          return `
            <div class="fod-time-row is-parallel">
              <div class="fod-time-cell">${hourLabel}</div>
              <div class="fod-stage-cell is-solar">
                ${solarHtml}
              </div>
              <div class="fod-stage-cell is-lunar">
                ${lunarHtml}
              </div>
            </div>
          `;
        }).join('');

        return `
          <section class="fod-day-section" data-day="${day.key}" id="program-${day.key}">
            <div class="fod-day-header">
              <div>
                <h2 class="fod-day-title">${isCs ? day.cs : day.en}</h2>
                <p class="fod-day-sub">${isCs ? day.subCs : day.subEn}</p>
              </div>
              <span class="fod-badge">${countLabel}</span>
            </div>

            <div class="fod-timetable-grid ${isSingleStage ? 'is-single' : 'is-parallel'}">
              ${headHtml}
              <div class="fod-timetable-body">
                ${rowsHtml}
              </div>
            </div>
          </section>
        `;
      }).join('');

      if (state.highlightId) {
        const el = document.getElementById(state.highlightId);
        if (el) {
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
          state.highlightId = '';
        }
      }
    }

    function bindShellEvents() {
      root.querySelectorAll('[data-filter-day]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.day = btn.getAttribute('data-filter-day');
          root.querySelectorAll('[data-filter-day]').forEach(b => {
            const active = b === btn;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', String(active));
          });
          syncProgramUrl();
          updateQuickLunarButton();
          renderDays();
        });
      });

      root.querySelectorAll('[data-filter-stage]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.stage = btn.getAttribute('data-filter-stage');
          root.querySelectorAll('[data-filter-stage]').forEach(b => {
            const active = b === btn;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', String(active));
          });
          syncProgramUrl();
          updateQuickLunarButton();
          renderDays();
        });
      });

      root.querySelectorAll('[data-filter-window]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.timeWindow = state.timeWindow === 'tonight' ? 'all' : 'tonight';
          if (state.timeWindow === 'tonight' && state.day === 'all') {
            state.day = festCtx.activeDayKey;
            root.querySelectorAll('[data-filter-day]').forEach(b => {
              const active = b.getAttribute('data-filter-day') === state.day;
              b.classList.toggle('is-active', active);
              b.setAttribute('aria-pressed', String(active));
            });
          }
          const isTonight = state.timeWindow === 'tonight';
          btn.classList.toggle('is-active', isTonight);
          btn.setAttribute('aria-pressed', String(isTonight));
          syncProgramUrl();
          updateQuickLunarButton();
          renderDays();
        });
      });

      root.querySelectorAll('[data-filter-genre]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.genre = btn.getAttribute('data-filter-genre');
          root.querySelectorAll('[data-filter-genre]').forEach(b => {
            const active = b === btn;
            b.classList.toggle('is-active', active);
            b.setAttribute('aria-pressed', String(active));
          });
          syncProgramUrl();
          renderDays();
        });
      });

      const favOnlyBtn = document.getElementById('filter-fav-only');
      if (favOnlyBtn) {
        favOnlyBtn.addEventListener('click', () => {
          state.onlyFavs = !state.onlyFavs;
          favOnlyBtn.classList.toggle('is-active', state.onlyFavs);
          favOnlyBtn.setAttribute('aria-pressed', String(state.onlyFavs));
          syncProgramUrl();
          renderDays();
        });
      }

      const searchInput = document.getElementById('artist-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          state.query = e.target.value;
          syncProgramUrl();
          renderDays();
        });
      }

      const clearSearchBtn = document.getElementById('clear-search-btn');
      if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
          state.query = '';
          searchInput.value = '';
          syncProgramUrl();
          renderDays();
          searchInput.focus();
        });
      }

      const quickLunarBtn = document.getElementById('quick-lunar-btn');
      if (quickLunarBtn) {
        quickLunarBtn.addEventListener('click', () => {
          const isAlready = state.stage === 'lunar' && state.timeWindow === 'tonight' && state.day === festCtx.activeDayKey;
          if (isAlready) {
            state.stage = 'all';
            state.day = 'all';
            state.timeWindow = 'all';
          } else {
            state.stage = 'lunar';
            state.day = festCtx.activeDayKey;
            state.timeWindow = 'tonight';
            state.genre = 'all';
            state.onlyFavs = false;
            state.query = '';
          }
          syncProgramUrl();
          renderShell();
          const sec = document.getElementById('fod-stage-context-slot') || document.getElementById('fod-program-days');
          if (!isAlready && sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }

      const clearFavBtn = document.getElementById('clear-favorites-btn');
      if (clearFavBtn) {
        clearFavBtn.addEventListener('click', () => {
          const isCs = core.getLang() === 'cs';
          const msg = isCs ? 'Opravdu chcete odebrat všechna uložená vystoupení?' : 'Remove all saved shows from My Schedule?';
          if (window.confirm(msg)) {
            core.clearFavorites();
            renderShell();
          }
        });
      }
    }

    function syncFavoriteCardStates() {
      const isCs = core.getLang() === 'cs';
      const favs = core.getFavorites();
      const favIds = new Set(favs.map(f => f.id));
      const collisions = typeof core.computeScheduleCollisions === 'function'
        ? core.computeScheduleCollisions(favs)
        : { total: 0, pairs: [], byId: new Map() };
      const fc = document.getElementById('fav-count');
      if (fc) fc.textContent = String(favIds.size);

      syncProgramConflictUi(collisions);

      root.querySelectorAll('.fod-timetable-card[data-id]').forEach(card => {
        const id = card.getAttribute('data-id');
        const isFav = favIds.has(id);
        const cardConflicts = isFav ? (collisions.byId.get(id) || []) : [];
        const hasCol = cardConflicts.length > 0;

        card.classList.toggle('is-saved', isFav);
        card.classList.toggle('has-collision', hasCol);
        if (hasCol) card.setAttribute('data-conflict', 'true');
        else card.removeAttribute('data-conflict');

        const noteSlot = card.querySelector('.fod-card-conflict-slot');
        if (noteSlot) {
          const nextHtml = renderCardConflictNoteHtml(cardConflicts, isCs);
          if (noteSlot.innerHTML !== nextHtml) {
            noteSlot.innerHTML = nextHtml;
          }
        }

        const btn = card.querySelector('.fav-toggle-btn[data-perf-id]');
        if (btn) {
          btn.classList.toggle('is-saved', isFav);
          btn.setAttribute('aria-pressed', String(isFav));
          const sr = btn.querySelector('.fod-sr-only');
          const srHtml = sr ? sr.outerHTML : '';
          btn.innerHTML = `${isFav ? (isCs ? '✓ V plánu' : '✓ In Plan') : (isCs ? '+ Přidat' : '+ Add')}${srHtml}`;
        }
      });
    }

    root.addEventListener('click', e => {
      const jumpBtn = e.target && e.target.closest && e.target.closest('[data-jump-perf]');
      if (jumpBtn) {
        const targetId = jumpBtn.getAttribute('data-jump-perf');
        if (targetId) focusPerformerCard(targetId);
        return;
      }

      const conflictPill = e.target && e.target.closest && e.target.closest('#fod-program-conflict-pill');
      if (conflictPill) {
        const target = document.getElementById('fod-program-conflict-slot') || root.querySelector('.fod-timetable-card.has-collision');
        if (target && !target.classList.contains('is-hidden')) {
          const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        }
        return;
      }

      const btn = e.target && e.target.closest && e.target.closest('.fav-toggle-btn[data-perf-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-perf-id');
      if (!id) return;
      core.toggleFavoriteById(id);
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', () => {
      if (state.onlyFavs) {
        const fc = document.getElementById('fav-count');
        if (fc) fc.textContent = String(core.getFavorites().length);
        renderDays();
      } else {
        syncFavoriteCardStates();
      }
    });

    renderShell();
  }

  // =========================================================================
  // 2. ARTISTS PAGE (All 60 artists, search, day/genre/fav filters, bridge)
  // =========================================================================
  function initArtistsPage() {
    const root = document.getElementById('fod-artists-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    const state = {
      day: 'all',
      genre: 'all',
      onlyFavs: false,
      query: '',
      hashId: (window.location.hash || '').replace('#', '').toLowerCase()
    };

    const COUNTRY_ABBR_ALIASES = { gb: 'uk', cr: 'cz' };
    const STAGE_ABBR_MAP = { sh: 'solar', lfd: 'lunar' };
    const KNOWN_COUNTRY_CODES = new Set(
      Object.keys(data.COUNTRIES || {}).map(code => core.normalizeStr(code))
    );

    function getFilteredArtists() {
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const qRaw = core.normalizeStr(state.query.trim());
      const tokens = qRaw ? qRaw.split(/\s+/).filter(Boolean) : [];
      return data.PERFORMERS.filter(p => {
        if (state.day !== 'all' && p.dayKey !== state.day) return false;
        if (state.genre !== 'all' && !core.matchesGenreFilter(p.genre, state.genre)) return false;
        if (state.onlyFavs && !favIds.has(p.id)) return false;
        if (tokens.length > 0) {
          const originCode = core.normalizeStr(p.origin);
          const initials = core.normalizeStr(getArtistInitials(p.name));
          const stageAbbr = p.stageKey === 'lunar' ? 'lfd' : 'sh';
          const dayShortEn = core.normalizeStr(p.dayShortEn || '').split(/\s+/)[0] || '';
          const dayShortCs = core.normalizeStr(p.dayShortCs || '').split(/\s+/)[0] || '';
          const hay = buildPerformerSearchHaystack(p, core, data);
          const nameGenreTokens = core.normalizeStr(`${p.name} ${p.genre}`).split(/[^a-z0-9]+/).filter(Boolean);

          const allMatch = tokens.every(tok => {
            const countryAlias = COUNTRY_ABBR_ALIASES[tok] || tok;
            if (KNOWN_COUNTRY_CODES.has(countryAlias)) {
              return originCode === countryAlias || initials === tok || nameGenreTokens.includes(tok);
            }
            if (STAGE_ABBR_MAP[tok]) {
              return p.stageKey === STAGE_ABBR_MAP[tok] || initials === tok || nameGenreTokens.includes(tok);
            }
            if (tok === initials || tok === stageAbbr || tok === dayShortEn || tok === dayShortCs) {
              return true;
            }
            if (tok.length <= 2) {
              return originCode === tok || initials === tok || nameGenreTokens.some(w => w.startsWith(tok));
            }
            return hay.includes(tok);
          });
          if (!allMatch) return false;
        }
        return true;
      });
    }

    function getArtistInitials(name) {
      const words = String(name || '')
        .trim()
        .split(/[\s\-_./]+/)
        .map(w => w.replace(/^[^A-Za-z0-9À-ž]+|[^A-Za-z0-9À-ž]+$/g, ''))
        .filter(Boolean);
      if (words.length >= 2) {
        return words.slice(0, 3).map(w => w[0].toUpperCase()).join('');
      }
      const single = words[0] || String(name || '').trim();
      return single.slice(0, 2).toUpperCase() || 'FD';
    }

    function renderShell() {
      const isCs = core.getLang() === 'cs';
      const favCount = core.getFavorites().length;
      const hasStagesOnPage = Boolean(document.getElementById('fod-stages-root'));
      const genres = [
        { key: 'all', en: 'All Genres', cs: 'Všechny žánry' },
        { key: 'techno', en: 'Techno', cs: 'Techno' },
        { key: 'ambient', en: 'Ambient', cs: 'Ambient' },
        { key: 'indie', en: 'Indie', cs: 'Indie' },
        { key: 'dream pop', en: 'Dream Pop', cs: 'Dream Pop' },
        { key: 'synth', en: 'Synth', cs: 'Synth' },
        { key: 'post-rock', en: 'Post-Rock', cs: 'Post-Rock' }
      ];

      root.innerHTML = `
        ${!hasStagesOnPage ? `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="index.html">${isCs ? 'Přehled' : 'Overview'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Účinkující' : 'Artists'}</span>
        </nav>
        ` : ''}
        ${hasStagesOnPage ? `
          <div class="fod-merged-section-head">
            <h2>${isCs ? 'Účinkující a program (60)' : 'Artists & Lineup (60)'}</h2>
            <a href="#fod-stages-root" class="fod-btn fod-btn-secondary fod-btn-sm">
              ${isCs ? 'Přejít na pódia' : 'Jump to Stages'}
            </a>
          </div>
        ` : ''}

        <div class="fod-toolbar-panel">
          <div class="fod-plan-summary-row">
            <div class="fod-plan-summary-left">
              <span class="fod-pill-stat">
                <strong id="artists-fav-count">${favCount}</strong>
                <span>${isCs ? 'uloženo v plánu' : 'saved in plan'}</span>
              </span>
              <span class="fod-status-text" id="filtered-count" aria-live="polite"></span>
            </div>
            <div class="fod-plan-summary-actions">
              <a href="my-schedule.html" class="fod-btn fod-btn-primary">
                ${isCs ? 'Můj plán' : 'My Schedule'} (<span class="fav-count-badge">${favCount}</span>)
              </a>
            </div>
          </div>

          <div class="fod-filter-stack">
            <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Den vystoupení' : 'Performance day'}">
              <button type="button" class="fod-chip ${state.day === 'all' ? 'is-active' : ''}" data-filter-day="all">${isCs ? 'Všechny dny' : 'All Days'}</button>
              <button type="button" class="fod-chip ${state.day === 'day1' ? 'is-active' : ''}" data-filter-day="day1">${isCs ? 'Pátek 10. 7.' : 'Friday'}</button>
              <button type="button" class="fod-chip ${state.day === 'day2' ? 'is-active' : ''}" data-filter-day="day2">${isCs ? 'Sobota 11. 7.' : 'Saturday'}</button>
              <button type="button" class="fod-chip ${state.day === 'day3' ? 'is-active' : ''}" data-filter-day="day3">${isCs ? 'Neděle 12. 7.' : 'Sunday'}</button>
              <button type="button" id="filter-fav-only" class="fod-chip fod-chip-fav ${state.onlyFavs ? 'is-active' : ''}" aria-pressed="${state.onlyFavs}">
                ${isCs ? '★ Jen oblíbení' : '★ My Favourites Only'}
              </button>
            </div>

            <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Žánr' : 'Genre'}">
              ${genres.map(g => `
                <button type="button" class="fod-chip ${state.genre === g.key ? 'is-active' : ''}" data-filter-genre="${g.key}">
                  ${isCs ? g.cs : g.en}
                </button>
              `).join('')}
            </div>

            <div class="fod-search-row">
              <label for="artist-search-input" class="fod-sr-only">${isCs ? 'Vyhledat interpreta' : 'Search performers'}</label>
              <input type="search" id="artist-search-input" class="fod-input"
                value="${core.escapeHtml(state.query)}"
                placeholder="${isCs ? 'Hledat podle jména, žánru, země nebo biografie...' : 'Search by artist name, genre, country, or bio...'}">
              <button type="button" id="clear-search-btn" class="fod-btn fod-btn-secondary">
                ${isCs ? 'Vymazat' : 'Clear'}
              </button>
            </div>
          </div>
        </div>

        <div id="fod-artists-grid" class="fod-cards-grid"></div>
        <div id="artists-empty-msg" class="fod-empty-card is-hidden"></div>
      `;

      bindEvents();
      renderGrid();
    }

    function renderGrid() {
      const grid = document.getElementById('fod-artists-grid');
      const countEl = document.getElementById('filtered-count');
      const emptyEl = document.getElementById('artists-empty-msg');
      if (!grid) return;

      const isCs = core.getLang() === 'cs';
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const list = getFilteredArtists();

      if (countEl) {
        countEl.textContent = isCs
          ? `Zobrazeno ${list.length} ze 60 interpretů`
          : `Showing ${list.length} of 60 performers`;
      }

      if (list.length === 0) {
        grid.innerHTML = '';
        if (emptyEl) {
          emptyEl.classList.remove('is-hidden');
          const bridgeHref = state.query ? `search.html?q=${encodeURIComponent(state.query.trim())}` : 'search.html';
          emptyEl.innerHTML = `
            <h3>${isCs ? 'Žádní účinkující neodpovídají zadání' : 'No performers match your filters'}</h3>
            <p>${isCs ? 'Hledáte praktické informace, dopravu, kemp nebo pódia?' : 'Looking for practical info, shuttle buses, camping, or stages?'}</p>
            <div class="fod-empty-actions">
              <a href="${bridgeHref}" id="bridge-search-link" class="fod-btn fod-btn-primary">
                ${isCs ? 'Hledat na celém webu' : 'Search Whole Festival'}
              </a>
              <button type="button" id="fod-art-reset-btn" class="fod-btn fod-btn-secondary">
                ${isCs ? 'Resetovat filtry' : 'Reset Filters'}
              </button>
            </div>
          `;
          const rb = document.getElementById('fod-art-reset-btn');
          if (rb) {
            rb.addEventListener('click', () => {
              state.day = 'all';
              state.genre = 'all';
              state.onlyFavs = false;
              state.query = '';
              renderShell();
            });
          }
        }
        return;
      }

      if (emptyEl) emptyEl.classList.add('is-hidden');

      grid.innerHTML = list.map(p => {
        const isFav = favIds.has(p.id);
        const stageCls = p.stageKey === 'lunar' ? 'is-lunar' : 'is-solar';
        const country = data.COUNTRIES[p.origin] ? (isCs ? data.COUNTRIES[p.origin].cs : data.COUNTRIES[p.origin].en) : p.origin;
        const bio = isCs ? p.bioCs : p.bioEn;
        const dayShort = isCs ? p.dayShortCs : p.dayShortEn;
        const hlCls = state.hashId === p.id ? 'spot-highlight' : '';
        const initials = getArtistInitials(p.name);
        const thumbAlt = isCs ? `${p.name} ilustrační vizuál interpreta` : `${p.name} artist visual`;

        return `
          <article class="fod-artist-card ${isFav ? 'is-saved' : ''} ${hlCls}" id="${p.id}" data-id="${p.id}">
            <figure class="fod-artist-thumb is-${p.stageKey}">
              <img src="shared/img/artist-placeholder-${p.stageKey}.svg" alt="${core.escapeHtml(thumbAlt)}" width="400" height="225">
              <span class="fod-artist-monogram" aria-hidden="true">${core.escapeHtml(initials)}</span>
            </figure>
            <div class="fod-card-top">
              <span class="fod-stage-pill ${stageCls}">${core.escapeHtml(p.stage)}</span>
              <span class="fod-origin-pill" title="${core.escapeHtml(country)}">${core.escapeHtml(p.origin)}</span>
            </div>
            <h2 class="fod-card-title">
              <a href="artist-detail.html?id=${p.id}&from=artists#${p.id}">${core.escapeHtml(p.name)}</a>
            </h2>
            <p class="fod-card-meta">${core.escapeHtml(p.genre)} · ${core.escapeHtml(dayShort)} · ${renderTimeRangeHtml(p.dayKey, p.time, core)}</p>
            <p class="fod-card-bio">${core.escapeHtml(bio)}</p>
            <div class="fod-card-actions">
              <a href="artist-detail.html?id=${p.id}&from=artists#${p.id}" class="fod-btn fod-btn-secondary fod-btn-sm">
                ${isCs ? 'Detail profilu' : 'View Profile'}
              </a>
              <button type="button" class="fod-btn fod-btn-sm artist-fav-btn ${isFav ? 'is-saved' : ''}" data-perf-id="${p.id}" aria-pressed="${isFav}">
                ${isFav ? (isCs ? '★ V plánu' : '★ Saved') : (isCs ? '☆ Přidat' : '☆ Add')}
              </button>
            </div>
          </article>
        `;
      }).join('');

      if (state.hashId) {
        const target = document.getElementById(state.hashId);
        if (target) {
          setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
          state.hashId = '';
        }
      }
    }

    function bindEvents() {
      root.querySelectorAll('[data-filter-day]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.day = btn.getAttribute('data-filter-day');
          root.querySelectorAll('[data-filter-day]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderGrid();
        });
      });

      root.querySelectorAll('[data-filter-genre]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.genre = btn.getAttribute('data-filter-genre');
          root.querySelectorAll('[data-filter-genre]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderGrid();
        });
      });

      const favBtn = document.getElementById('filter-fav-only');
      if (favBtn) {
        favBtn.addEventListener('click', () => {
          state.onlyFavs = !state.onlyFavs;
          favBtn.classList.toggle('is-active', state.onlyFavs);
          favBtn.setAttribute('aria-pressed', String(state.onlyFavs));
          renderGrid();
        });
      }

      const input = document.getElementById('artist-search-input');
      if (input) {
        input.addEventListener('input', e => {
          state.query = e.target.value;
          renderGrid();
        });
      }

      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn && input) {
        clearBtn.addEventListener('click', () => {
          state.query = '';
          input.value = '';
          renderGrid();
          input.focus();
        });
      }
    }

    function syncArtistFavStates() {
      const isCs = core.getLang() === 'cs';
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const fc = document.getElementById('artists-fav-count');
      if (fc) fc.textContent = String(favIds.size);

      root.querySelectorAll('.fod-artist-card[data-id]').forEach(card => {
        const id = card.getAttribute('data-id');
        const isFav = favIds.has(id);
        card.classList.toggle('is-saved', isFav);
        const btn = card.querySelector('.artist-fav-btn[data-perf-id]');
        if (btn) {
          btn.classList.toggle('is-saved', isFav);
          btn.setAttribute('aria-pressed', String(isFav));
          btn.textContent = isFav
            ? (isCs ? '★ V plánu' : '★ Saved')
            : (isCs ? '☆ Přidat' : '☆ Add');
        }
      });
    }

    root.addEventListener('click', e => {
      const btn = e.target && e.target.closest && e.target.closest('.artist-fav-btn[data-perf-id]');
      if (!btn) return;
      core.toggleFavoriteById(btn.getAttribute('data-perf-id'));
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', () => {
      if (state.onlyFavs) {
        const fc = document.getElementById('artists-fav-count');
        if (fc) fc.textContent = String(core.getFavorites().length);
        renderGrid();
      } else {
        syncArtistFavStates();
      }
    });

    renderShell();
  }

  // =========================================================================
  // 3. ARTIST DETAIL PAGE (Dynamic ?id=, breadcrumbs, Web Audio preview, quick select)
  // =========================================================================
  function initArtistDetailPage() {
    const root = document.getElementById('fod-artist-detail-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    let audioCtx = null;
    let audioTimer = null;
    let isPlaying = false;

    function stopAudio() {
      isPlaying = false;
      if (audioTimer) {
        clearInterval(audioTimer);
        audioTimer = null;
      }
      if (audioCtx && typeof audioCtx.close === 'function') {
        try { audioCtx.close(); } catch (e) {}
        audioCtx = null;
      }
    }

    function startAudio(artist) {
      stopAudio();
      isPlaying = true;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        const isTechno = /techno|industrial|acid|electronic|electro|idm/i.test(artist.genre);
        const notes = isTechno ? [110, 130.81, 146.83, 164.81, 196] : [196, 246.94, 293.66, 329.63, 392];
        let step = 0;

        const playStep = () => {
          if (!isPlaying || !audioCtx) return;
          const now = audioCtx.currentTime;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = isTechno ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(notes[step % notes.length], now);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
          step++;
        };
        playStep();
        audioTimer = setInterval(playStep, isTechno ? 280 : 480);
      } catch (e) {}
    }

    function getParams() {
      const p = new URLSearchParams(window.location.search);
      const id = p.get('id') || window.location.hash.replace('#', '') || 'perf-01';
      const from = p.get('from') || 'artists';
      return { id, from };
    }

    function render() {
      stopAudio();
      const { id, from } = getParams();
      const artist = data.PERFORMERS.find(a => a.id === id) || data.PERFORMERS[0];
      const isCs = core.getLang() === 'cs';
      const isFav = core.isFavorite(artist.id);
      const stageMeta = data.STAGES[artist.stageKey];
      const country = data.COUNTRIES[artist.origin] ? (isCs ? data.COUNTRIES[artist.origin].cs : data.COUNTRIES[artist.origin].en) : artist.origin;
      const dayLabel = isCs ? artist.dayCs : artist.dayEn;
      const bio = isCs ? artist.bioCs : artist.bioEn;

      let backLabel = isCs ? 'Zpět na Účinkující' : 'Back to Artists';
      let backUrl = `artists.html#${artist.id}`;
      let crumbName = isCs ? 'Účinkující' : 'Artists';
      if (from === 'program') {
        backLabel = isCs ? 'Zpět do Programu' : 'Back to Program';
        backUrl = `program.html#${artist.id}`;
        crumbName = 'Program';
      } else if (from === 'myschedule') {
        backLabel = isCs ? 'Zpět do Mého plánu' : 'Back to My Schedule';
        backUrl = `my-schedule.html#${artist.id}`;
        crumbName = isCs ? 'Můj plán' : 'My Schedule';
      } else if (from === 'search') {
        backLabel = isCs ? 'Zpět na Vyhledávání' : 'Back to Search';
        backUrl = 'search.html';
        crumbName = isCs ? 'Vyhledávání' : 'Search';
      } else if (from === 'home') {
        backLabel = isCs ? 'Zpět na Úvod' : 'Back to Overview';
        backUrl = 'index.html';
        crumbName = isCs ? 'Úvod' : 'Overview';
      }

      document.title = `${artist.name} - Festival of Darkness 2`;

      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="Breadcrumb">
          <a href="index.html">${isCs ? 'Úvod' : 'Overview'}</a>
          <span aria-hidden="true">/</span>
          <a href="${backUrl}">${core.escapeHtml(crumbName)}</a>
          <span aria-hidden="true">/</span>
          <span>${core.escapeHtml(artist.name)}</span>
        </nav>

        <div class="fod-detail-hero">
          <div class="fod-detail-badges">
            <span class="fod-stage-pill ${artist.stageKey === 'lunar' ? 'is-lunar' : 'is-solar'}">${core.escapeHtml(artist.stage)}</span>
            <span class="fod-origin-pill">${core.escapeHtml(country)}</span>
            <span class="fod-badge">${core.escapeHtml(artist.id.toUpperCase())}</span>
          </div>
          <h1 class="fod-detail-title">${core.escapeHtml(artist.name)}</h1>
          <p class="fod-detail-sub">${core.escapeHtml(artist.genre)} · ${core.escapeHtml(dayLabel)} · ${renderTimeRangeHtml(artist.dayKey, artist.time, core)}</p>
          <div class="fod-detail-cta-row">
            <button type="button" id="profile-star-btn" class="fod-btn ${isFav ? 'fod-btn-primary is-saved' : 'fod-btn-primary'}" aria-pressed="${isFav}">
              ${isFav ? (isCs ? '✓ Uloženo v Mém plánu' : '✓ Saved in My Schedule') : (isCs ? '★ Přidat do Mého plánu' : '★ Add to My Schedule')}
            </button>
            <a href="${backUrl}" id="detail-back-btn" class="fod-btn fod-btn-secondary">← ${core.escapeHtml(backLabel)}</a>
          </div>
        </div>

        <div class="fod-detail-grid">
          <section class="fod-panel">
            <h2>${isCs ? 'O interpretovi' : 'Artist Biography'}</h2>
            <p class="fod-detail-bio">${core.escapeHtml(bio)}</p>

            <div class="fod-audio-box">
              <div class="fod-audio-meta">
                <strong>${isCs ? 'Zvuková ukázka setu' : 'Live Synth Audio Preview'}</strong>
                <span id="fod-audio-status">${isCs ? 'Připraveno k přehrání' : 'Ready to play preview'}</span>
              </div>
              <button type="button" id="preview-play-btn" class="fod-btn fod-btn-secondary" aria-pressed="false">
                ${isCs ? '▶ Přehrát ukázku' : '▶ Play Preview'}
              </button>
            </div>
          </section>

          <aside class="fod-panel">
            <h2>${isCs ? 'Informace o vystoupení' : 'Performance Details'}</h2>
            <dl class="fod-meta-list">
              <div>
                <dt>${isCs ? 'Den' : 'Day'}</dt>
                <dd>${core.escapeHtml(dayLabel)}</dd>
              </div>
              <div>
                <dt>${isCs ? 'Čas' : 'Set Time'}</dt>
                <dd>${renderTimeRangeHtml(artist.dayKey, artist.time, core)}</dd>
              </div>
              <div>
                <dt>${isCs ? 'Pódium' : 'Stage'}</dt>
                <dd><a href="stages.html#${stageMeta.id}">${core.escapeHtml(artist.stage)}</a> (${stageMeta.capacity.toLocaleString()} ${isCs ? 'míst' : 'cap'})</dd>
              </div>
              <div>
                <dt>${isCs ? 'Prostředí' : 'Environment'}</dt>
                <dd>${core.escapeHtml(isCs ? stageMeta.typeCs : stageMeta.typeEn)}</dd>
              </div>
              <div>
                <dt>${isCs ? 'Země původu' : 'Origin'}</dt>
                <dd>${core.escapeHtml(country)}</dd>
              </div>
              <div>
                <dt>${isCs ? 'Žánr' : 'Genre'}</dt>
                <dd>${core.escapeHtml(artist.genre)}</dd>
              </div>
            </dl>
            <div class="fod-detail-links">
              <a href="program.html?highlight=${artist.id}#${artist.id}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'Zobrazit v programu' : 'View in Timetable'}</a>
              <a href="stages.html#${stageMeta.id}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'Detaily pódia' : 'Stage Details'}</a>
              <a href="my-schedule.html#${artist.id}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'Můj plán' : 'My Schedule'}</a>
            </div>
          </aside>
        </div>

        <section class="fod-panel fod-quick-select-panel">
          <label for="artist-quick-select"><strong>${isCs ? 'Přejít na jiného ze 60 interpretů:' : 'Jump to another of the 60 performers:'}</strong></label>
          <select id="artist-quick-select" class="fod-select">
            ${data.PERFORMERS.map(a => `
              <option value="${a.id}" ${a.id === artist.id ? 'selected' : ''}>
                ${core.escapeHtml(a.name)} (${core.escapeHtml(a.origin)}) - ${core.escapeHtml(a.genre)}
              </option>
            `).join('')}
          </select>
        </section>
      `;

      const starBtn = document.getElementById('profile-star-btn');
      if (starBtn) {
        starBtn.addEventListener('click', () => {
          core.toggleFavoriteById(artist.id);
          render();
        });
      }

      const playBtn = document.getElementById('preview-play-btn');
      const statusEl = document.getElementById('fod-audio-status');
      if (playBtn) {
        playBtn.addEventListener('click', () => {
          if (isPlaying) {
            stopAudio();
            playBtn.textContent = isCs ? '▶ Přehrát ukázku' : '▶ Play Preview';
            playBtn.setAttribute('aria-pressed', 'false');
            if (statusEl) statusEl.textContent = isCs ? 'Pozastaveno' : 'Paused';
          } else {
            startAudio(artist);
            playBtn.textContent = isCs ? '❚❚ Pozastavit' : '❚❚ Pause';
            playBtn.setAttribute('aria-pressed', 'true');
            if (statusEl) statusEl.textContent = isCs ? 'Přehrávání syntetizované ukázky...' : 'Playing synthesized preview...';
          }
        });
      }

      const selectEl = document.getElementById('artist-quick-select');
      if (selectEl) {
        selectEl.addEventListener('change', e => {
          const newId = e.target.value;
          const newUrl = `artist-detail.html?id=${encodeURIComponent(newId)}&from=${encodeURIComponent(from)}#${encodeURIComponent(newId)}`;
          try {
            window.history.pushState({}, '', newUrl);
            render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err) {
            window.location.href = newUrl;
          }
        });
      }
    }

    window.addEventListener('languageChanged', render);
    window.addEventListener('popstate', render);
    window.addEventListener('favoritesUpdated', render);
    window.addEventListener('pagehide', stopAudio);
    render();
  }

  // =========================================================================
  // 4. STAGES PAGE (Tabs, Hash highlighting, Stage Info & Photos)
  // =========================================================================
  function initStagesPage() {
    const root = document.getElementById('fod-stages-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();
    const festCtx = getActiveFestivalContext();
    const previewState = {
      solar: { day: festCtx.activeDayKey, tonight: false },
      lunar: { day: festCtx.activeDayKey, tonight: false }
    };

    function highlightStageFromHash() {
      const hash = window.location.hash;
      const secSolar = document.getElementById('stage-solar');
      const secLunar = document.getElementById('stage-lunar');
      const target = hash === '#stage-lunar' ? secLunar : (hash === '#stage-solar' ? secSolar : null);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('spot-highlight');
          setTimeout(() => target.classList.remove('spot-highlight'), 2200);
        }, 80);
      }
    }

    function renderStageTimetablePreview(stageKey, isCs) {
      const st = previewState[stageKey];
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const sets = data.PERFORMERS
        .filter(p => p.stageKey === stageKey && p.dayKey === st.day && (!st.tonight || core.timeToMinutes(p.start) >= 18 * 60))
        .sort((a, b) => core.timeToMinutes(a.start) - core.timeToMinutes(b.start));

      const dayBtns = data.DAYS.map(d => `
        <button type="button" class="fod-chip fod-chip-sm ${st.day === d.key ? 'is-active' : ''}" data-stage-preview-day="${stageKey}:${d.key}" aria-pressed="${st.day === d.key}">
          ${isCs ? d.shortCs : d.shortEn}
        </button>
      `).join('');

      const rowsHtml = sets.length
        ? sets.map(p => {
            const isFav = favIds.has(p.id);
            return `
              <li class="fod-stage-mini-row">
                <span class="fod-stage-mini-time">${renderTimeRangeHtml(p.dayKey, p.time, core)}</span>
                <div class="fod-stage-mini-info">
                  <a href="artist-detail.html?id=${p.id}&from=stages#${p.id}" class="fod-stage-mini-artist">${core.escapeHtml(p.name)}</a>
                  <span class="fod-stage-mini-genre">${core.escapeHtml(p.genre)}</span>
                </div>
                <button type="button" class="fod-btn fod-btn-sm fav-toggle-btn ${isFav ? 'is-saved' : ''}" data-perf-id="${p.id}" aria-pressed="${isFav}">
                  ${isFav ? (isCs ? '✓ V plánu' : '✓ Saved') : (isCs ? '+ Přidat' : '+ Add')}<span class="fod-sr-only"> (${core.escapeHtml(p.name)})</span>
                </button>
              </li>
            `;
          }).join('')
        : `<li class="fod-stage-mini-empty">${isCs ? 'Pro vybraný filtr nejsou žádná vystoupení.' : 'No sets match this filter.'}</li>`;

      return `
        <div class="fod-stage-preview" data-stage-preview="${stageKey}">
          <div class="fod-stage-preview-head">
            <h3>${isCs ? 'Chronologický harmonogram pódia' : 'Chronological Stage Timetable'}</h3>
            <span class="fod-badge">${isCs ? core.formatCzPlural(sets.length, 'set', 'sety', 'setů') : (sets.length === 1 ? '1 set' : `${sets.length} sets`)}</span>
          </div>
          <div class="fod-stage-preview-controls" role="group" aria-label="${isCs ? 'Výběr dne pro pódium' : 'Select day for stage timetable'}">
            ${dayBtns}
            <button type="button" class="fod-chip fod-chip-sm ${st.tonight ? 'is-active' : ''}" data-stage-preview-tonight="${stageKey}" aria-pressed="${st.tonight}">
              ${isCs ? 'Večer (18:00+)' : 'Tonight (18:00+)'}
            </button>
          </div>
          <ol class="fod-stage-mini-list">
            ${rowsHtml}
          </ol>
        </div>
      `;
    }

    function render() {
      const isCs = core.getLang() === 'cs';
      const solar = data.STAGES.solar;
      const lunar = data.STAGES.lunar;
      const hasArtistsOnPage = Boolean(document.getElementById('fod-artists-root'));

      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="index.html">${isCs ? 'Přehled' : 'Overview'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Pódia a areál' : 'Stages & Grounds'}</span>
        </nav>

        <div class="fod-merged-section-head">
          <h2>${isCs ? 'Pódia a areál' : 'Stages & Grounds'}</h2>
          <div class="fod-card-actions">
            <a href="#stage-lunar" class="fod-btn fod-btn-lunar fod-btn-sm">
              ${isCs ? 'Kryté pódium (Lunar Dome)' : 'Covered Stage (Lunar Dome)'}
            </a>
            ${hasArtistsOnPage ? `
              <a href="#fod-artists-root" class="fod-btn fod-btn-secondary fod-btn-sm">
                ${isCs ? 'Přejít na účinkující' : 'Jump to Artists'}
              </a>
            ` : `
              <a href="artists.html" class="fod-btn fod-btn-secondary fod-btn-sm">
                ${isCs ? 'Všech 60 účinkujících' : 'All 60 Artists'}
              </a>
            `}
          </div>
        </div>

        <div class="fod-stages-grid">
          <section class="fod-panel fod-stage-card" id="stage-lunar">
            <figure class="fod-stage-photo">
              <img src="shared/img/stage-lunar.jpg" alt="${isCs ? 'Ilustrační fotografie kryté kupole Lunar Forest Dome v lese za soumraku' : 'Photo of the covered Lunar Forest Dome marquee in the forest at twilight'}" width="1280" height="720">
            </figure>
            <div class="fod-card-top">
              <span class="fod-stage-pill is-lunar">${core.escapeHtml(isCs ? lunar.typeCs : lunar.typeEn)}</span>
              <span class="fod-badge">${lunar.capacity.toLocaleString()} ${isCs ? 'kapacita' : 'capacity'}</span>
            </div>
            <h2>${core.escapeHtml(lunar.name)}</h2>
            <p>${core.escapeHtml(isCs ? lunar.focusCs : lunar.focusEn)}</p>
            <p class="fod-shelter-callout">${core.escapeHtml(isCs ? lunar.shelterCs : lunar.shelterEn)}</p>
            <p class="fod-meta-line"><strong>${isCs ? 'Lokalita:' : 'Location:'}</strong> ${core.escapeHtml(isCs ? lunar.locationCs : lunar.locationEn)} · <strong>${isCs ? 'Provoz:' : 'Hours:'}</strong> ${lunar.hours}</p>
            <ul class="fod-feature-list">
              ${(isCs ? lunar.featuresCs : lunar.featuresEn).map(f => `<li>${core.escapeHtml(f)}</li>`).join('')}
            </ul>
            ${renderStageTimetablePreview('lunar', isCs)}
            <div class="fod-card-actions">
              <a href="program.html?stage=lunar&day=${previewState.lunar.day}${previewState.lunar.tonight ? '&window=tonight' : ''}" class="fod-btn fod-btn-primary">${isCs ? 'Otevřít Lunar v Programu' : 'Open Full Lunar Schedule'}</a>
              <a href="program.html?stage=lunar&day=${previewState.lunar.day}&window=tonight" class="fod-btn fod-btn-secondary">${isCs ? 'Lunar dnes večer (18:00+)' : 'Lunar Tonight (18:00+)'}</a>
            </div>
          </section>

          <section class="fod-panel fod-stage-card" id="stage-solar">
            <figure class="fod-stage-photo">
              <img src="shared/img/stage-solar.jpg" alt="${isCs ? 'Ilustrační fotografie venkovního amfiteátru Solar Horizon Stage při západu slunce' : 'Photo of the open-air Solar Horizon Stage amphitheater at sunset'}" width="1280" height="720">
            </figure>
            <div class="fod-card-top">
              <span class="fod-stage-pill is-solar">${core.escapeHtml(isCs ? solar.typeCs : solar.typeEn)}</span>
              <span class="fod-badge">${solar.capacity.toLocaleString()} ${isCs ? 'kapacita' : 'capacity'}</span>
            </div>
            <h2>${core.escapeHtml(solar.name)}</h2>
            <p>${core.escapeHtml(isCs ? solar.focusCs : solar.focusEn)}</p>
            <p class="fod-meta-line"><strong>${isCs ? 'Lokalita:' : 'Location:'}</strong> ${core.escapeHtml(isCs ? solar.locationCs : solar.locationEn)} · <strong>${isCs ? 'Provoz:' : 'Hours:'}</strong> ${solar.hours}</p>
            <ul class="fod-feature-list">
              ${(isCs ? solar.featuresCs : solar.featuresEn).map(f => `<li>${core.escapeHtml(f)}</li>`).join('')}
            </ul>
            ${renderStageTimetablePreview('solar', isCs)}
            <div class="fod-card-actions">
              <a href="program.html?stage=solar&day=${previewState.solar.day}${previewState.solar.tonight ? '&window=tonight' : ''}" class="fod-btn fod-btn-primary">${isCs ? 'Otevřít Solar v Programu' : 'Open Full Solar Schedule'}</a>
            </div>
          </section>
        </div>

        <section class="fod-panel fod-grounds-bar">
          <div>
            <h2>${isCs ? 'Orientace v areálu Kutná Hora' : 'Festival Grounds Orientation'}</h2>
            <p>${isCs ? 'Vstup A (Hlavní brána) · Solar Horizon Stage · Lunar Forest Dome (Krytý) · Kemp · Cashless zóna · Zastávka Shuttle Busu' : 'Entrance A (Main Gate) · Solar Horizon Stage · Lunar Forest Dome (Covered) · Camping Ground · Cashless Zone · Shuttle Bus Stop'}</p>
          </div>
          <div class="fod-card-actions">
            ${hasArtistsOnPage ? `
              <a href="#fod-artists-root" class="fod-btn fod-btn-secondary">
                ${isCs ? 'Přejít na účinkující' : 'Jump to Artists'}
              </a>
            ` : ''}
            <a href="practical-info.html#doprava" class="fod-btn fod-btn-secondary">
              ${isCs ? 'Doprava z nádraží a mapa trasy' : 'Transit & Route Map'}
            </a>
          </div>
        </section>
      `;

      highlightStageFromHash();
    }

    root.addEventListener('click', e => {
      const dayBtn = e.target && e.target.closest && e.target.closest('[data-stage-preview-day]');
      if (dayBtn) {
        const [stageKey, dayKey] = (dayBtn.getAttribute('data-stage-preview-day') || '').split(':');
        if (previewState[stageKey] && dayKey) {
          previewState[stageKey].day = dayKey;
          render();
        }
        return;
      }
      const tonightBtn = e.target && e.target.closest && e.target.closest('[data-stage-preview-tonight]');
      if (tonightBtn) {
        const stageKey = tonightBtn.getAttribute('data-stage-preview-tonight');
        if (previewState[stageKey]) {
          previewState[stageKey].tonight = !previewState[stageKey].tonight;
          render();
        }
        return;
      }
      const favBtn = e.target && e.target.closest && e.target.closest('.fav-toggle-btn[data-perf-id]');
      if (favBtn) {
        const id = favBtn.getAttribute('data-perf-id');
        if (id) {
          core.toggleFavoriteById(id);
        }
      }
    });

    window.addEventListener('hashchange', highlightStageFromHash);
    window.addEventListener('languageChanged', render);
    window.addEventListener('favoritesUpdated', render);
    render();
  }

  // =========================================================================
  // 5. PRACTICAL INFO & SEARCH PAGE (Simple, arrival-first editorial layout)
  // =========================================================================
  function initPracticalInfoPage() {
    const root = document.getElementById('fod-practical-root');
    if (!root || !C()) return;

    const core = C();
    let activeRoute = 'all';
    let estimatorDay = 'fri';
    let estimatorTime = '14:10';

    const SHUTTLE_WINDOWS = {
      fri: { startMin: 11 * 60 + 30, endMin: 28 * 60, maxHeadway: 15, freqEn: '10-15 min', freqCs: '10-15 min', dirEn: 'to Entrance A', dirCs: 'ke Vstupu A' },
      sat: { startMin: 12 * 60, endMin: 28 * 60, maxHeadway: 15, freqEn: '15 min', freqCs: '15 min', dirEn: 'to Entrance A', dirCs: 'ke Vstupu A' },
      sun: { startMin: 12 * 60, endMin: 27 * 60 + 30, maxHeadway: 15, freqEn: '15 min', freqCs: '15 min', dirEn: 'to Entrance A', dirCs: 'ke Vstupu A' },
      mon: { startMin: 7 * 60, endMin: 13 * 60, maxHeadway: 20, freqEn: '15-20 min', freqCs: '15-20 min', dirEn: 'to Kutná Hora hl.n.', dirCs: 'na Kutná Hora hl.n.' }
    };

    function formatMinutesHHMM(totalMin) {
      const m = ((totalMin % (24 * 60)) + (24 * 60)) % (24 * 60);
      return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    }

    function updateShuttleEstimator() {
      const box = document.getElementById('fod-shuttle-result');
      if (!box) return;
      const isCs = core.getLang() === 'cs';
      const win = SHUTTLE_WINDOWS[estimatorDay] || SHUTTLE_WINDOWS.fri;
      const parts = String(estimatorTime || '14:10').split(':');
      const rawH = Math.max(0, Math.min(23, parseInt(parts[0], 10) || 0));
      const rawM = Math.max(0, Math.min(59, parseInt(parts[1], 10) || 0));
      const normMin = ((estimatorDay !== 'mon' && rawH < 5) ? rawH + 24 : rawH) * 60 + rawM;
      const isRunning = normMin >= win.startMin && normMin <= win.endMin;

      box.className = `fod-simple-status ${isRunning ? 'is-running' : 'is-closed'}`;
      if (isRunning) {
        const minArr = formatMinutesHHMM(normMin + 7);
        const maxArr = formatMinutesHHMM(normMin + win.maxHeadway + 7);
        box.textContent = isCs
          ? `V provozu: každých ${win.freqCs}, příjezd ${win.dirCs} kolem ${minArr}-${maxArr}.`
          : `Running: every ${win.freqEn}, arrive ${win.dirEn} around ${minArr}-${maxArr}.`;
      } else {
        const nextStart = formatMinutesHHMM(win.startMin);
        box.textContent = isCs
          ? `Mimo provoz v ${formatMinutesHHMM(normMin)}. Další spoje od ${nextStart}, nebo jděte pěšky (22-25 min).`
          : `No shuttle at ${formatMinutesHHMM(normMin)}. Next buses start at ${nextStart}, or walk (22-25 min).`;
      }
    }

    function setMapRoute(type) {
      activeRoute = type || 'all';
      const isCs = core.getLang() === 'cs';
      root.querySelectorAll('.route-bus-group').forEach(el => {
        el.classList.toggle('is-dimmed', activeRoute !== 'all' && activeRoute !== 'bus');
      });
      root.querySelectorAll('.route-walk-group').forEach(el => {
        el.classList.toggle('is-dimmed', activeRoute !== 'all' && activeRoute !== 'walk');
      });
      root.querySelectorAll('[data-route-filter]').forEach(btn => {
        const isActive = btn.getAttribute('data-route-filter') === activeRoute;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      const statusText = activeRoute === 'bus'
        ? (isCs ? 'Shuttle Bus: 7 min zdarma, každých 10-15 min ze Stanoviště 1 (Kutná Hora hl.n.) ke Vstupu A.' : 'Shuttle Bus: 7 min free, every 10-15 min from Bus Bay 1 (Kutná Hora hl.n.) to Entrance A.')
        : (activeRoute === 'walk'
          ? (isCs ? 'Pěší trasa: 1,8 km (22-25 min) po osvětleném chodníku přes Sedlec a lávku přes Vrchlici.' : 'Walking route: 1.8 km (22-25 min) along the lit path via Sedlec and Vrchlice Footbridge.')
          : (isCs ? 'Obě trasy z Kutná Hora hl.n. ke Vstupu A: Shuttle Bus (7 min) a pěší trasa (1,8 km).' : 'Both routes from Kutná Hora hl.n. to Entrance A: Shuttle Bus (7 min) and Walking Route (1.8 km).'));

      const statusEl = document.getElementById('fod-map-status');
      if (statusEl) statusEl.textContent = statusText;
      const svgEl = root.querySelector('.fod-route-svg');
      if (svgEl) svgEl.setAttribute('aria-label', statusText);
    }
    window.setMapRoute = setMapRoute;

    function render() {
      const isCs = core.getLang() === 'cs';
      const mapyWalkUrl = 'https://mapy.cz/turisticka?q=49.9615N%2C%2015.2882E';
      const gmapsWalkUrl = 'https://www.google.com/maps/dir/?api=1&origin=Kutna+Hora+hl.n.&destination=Sedlec,+Kutna+Hora&travelmode=walking';
      const venueAddressCopy = 'Sedlec Festival Grounds, 284 03 Kutná Hora (49.9615 N, 15.2882 E)';

      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="index.html">${isCs ? 'Přehled' : 'Overview'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Praktické informace' : 'Practical Info'}</span>
        </nav>
        <div class="fod-info-sheet">
          <div class="fod-info-top">
            <form action="search.html" method="get" class="fod-simple-search" role="search">
              <label for="info-search-input" class="fod-sr-only">${isCs ? 'Hledat na festivalu' : 'Search festival'}</label>
              <input type="search" id="info-search-input" name="q" class="fod-input"
                placeholder="${isCs ? 'Hledat interprety, pódia, shuttle bus, kemp nebo FAQ...' : 'Search artists, stages, shuttle bus, camping, or FAQ...'}">
              <button type="submit" class="fod-btn fod-btn-primary">${isCs ? 'Hledat' : 'Search'}</button>
            </form>
            <nav class="fod-simple-jump" aria-label="${isCs ? 'Sekce informací' : 'Information sections'}">
              <a href="#doprava">${isCs ? 'Doprava z nádraží' : 'Getting there'}</a>
              <a href="#kemp">${isCs ? 'Kemp' : 'Camping'}</a>
              <a href="#cashless">${isCs ? 'Cashless a zázemí' : 'Cashless & on site'}</a>
              <a href="#faq">FAQ</a>
            </nav>
          </div>

          <section class="fod-info-block" id="doprava">
            <div class="fod-info-block-head">
              <h2>${isCs ? 'Doprava z nádraží Kutná Hora hl.n.' : 'Getting there from Kutná Hora hl.n.'}</h2>
              <p class="fod-station-note">${isCs
                ? 'Vystupte ve stanici <strong>Kutná Hora hl.n.</strong> (ne Kutná Hora město). Zastávka shuttle busu je na <strong>Stanovišti 1 vpravo před hlavní halou</strong>.'
                : 'Get off at <strong>Kutná Hora hl.n.</strong> (not Kutná Hora město). Shuttle pickup is at <strong>Bus Bay 1, right outside the main hall</strong>.'}</p>
            </div>

            <div class="fod-transit-cols">
              <div class="fod-transit-col" id="shuttle-bus">
                <h3>${isCs ? 'Shuttle Bus (zdarma, 7 min)' : 'Free Shuttle Bus (7 min)'}</h3>
                <p class="fod-prose">${isCs
                  ? 'Přímá bezbariérová linka ze Stanoviště 1 přímo ke Vstupu A. Návaznost na rychlíky R9 z Prahy a Brna, místo na zavazadla.'
                  : 'Non-stop step-free bus from Bus Bay 1 directly to Entrance A. Synced with R9 trains from Prague and Brno, with luggage space.'}</p>

                <div class="fod-table-scroll">
                  <table class="fod-mini-table">
                    <thead>
                      <tr>
                        <th>${isCs ? 'Den' : 'Day'}</th>
                        <th>${isCs ? 'Provoz' : 'Hours'}</th>
                        <th>${isCs ? 'Interval' : 'Frequency'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td><time datetime="2026-07-10">${isCs ? 'Pá 10. 7.' : 'Fri 10 Jul'}</time></td><td><time datetime="2026-07-10T11:30">11:30</time>–<time datetime="2026-07-11T04:00">04:00</time></td><td>10-15 min</td></tr>
                      <tr><td><time datetime="2026-07-11">${isCs ? 'So 11. 7.' : 'Sat 11 Jul'}</time></td><td><time datetime="2026-07-11T12:00">12:00</time>–<time datetime="2026-07-12T04:00">04:00</time></td><td>15 min</td></tr>
                      <tr><td><time datetime="2026-07-12">${isCs ? 'Ne 12. 7.' : 'Sun 12 Jul'}</time></td><td><time datetime="2026-07-12T12:00">12:00</time>–<time datetime="2026-07-13T03:30">03:30</time></td><td>15 min</td></tr>
                      <tr><td><time datetime="2026-07-13">${isCs ? 'Po 13. 7. (Odjezdy)' : 'Mon 13 Jul (Departures)'}</time></td><td><time datetime="2026-07-13T07:00">07:00</time>–<time datetime="2026-07-13T13:00">13:00</time></td><td>15-20 min</td></tr>
                    </tbody>
                  </table>
                </div>

                <div class="fod-simple-check">
                  <label for="fod-shuttle-day" class="fod-check-label">${isCs ? 'Ověřit příjezd vlaku' : 'Check train arrival'}</label>
                  <div class="fod-simple-check-row">
                    <select id="fod-shuttle-day" class="fod-select" aria-label="${isCs ? 'Den příjezdu' : 'Arrival day'}">
                      <option value="fri" ${estimatorDay === 'fri' ? 'selected' : ''}>${isCs ? 'Pá 10. 7.' : 'Fri 10 Jul'}</option>
                      <option value="sat" ${estimatorDay === 'sat' ? 'selected' : ''}>${isCs ? 'So 11. 7.' : 'Sat 11 Jul'}</option>
                      <option value="sun" ${estimatorDay === 'sun' ? 'selected' : ''}>${isCs ? 'Ne 12. 7.' : 'Sun 12 Jul'}</option>
                      <option value="mon" ${estimatorDay === 'mon' ? 'selected' : ''}>${isCs ? 'Po 13. 7. (Odjezdy)' : 'Mon 13 Jul (Departures)'}</option>
                    </select>
                    <label for="fod-shuttle-time" class="fod-sr-only">${isCs ? 'Čas příjezdu' : 'Arrival time'}</label>
                    <input type="time" id="fod-shuttle-time" class="fod-input fod-time-input" aria-label="${isCs ? 'Čas příjezdu' : 'Arrival time'}" value="${core.escapeHtml(estimatorTime)}">
                  </div>
                  <p id="fod-shuttle-result" class="fod-simple-status" role="status" aria-live="polite"></p>
                </div>
              </div>

              <div class="fod-transit-col" id="pesi-trasa">
                <h3>${isCs ? 'Pěší trasa (1,8 km, 22-25 min)' : 'Walking Route (1.8 km, 22-25 min)'}</h3>
                <p class="fod-prose">${isCs
                  ? 'Osvětlený chodník a zpevněná cesta se žlutými reflexními směrovkami z nádraží až ke Vstupu A.'
                  : 'Lit sidewalk and paved path marked with yellow reflective signs from the station to Entrance A.'}</p>

                <ol class="fod-clean-steps">
                  <li>
                    <span class="fod-step-km">0.0 km</span>
                    <span><strong>Kutná Hora hl.n.</strong> ${isCs ? 'Vyjděte z haly a dejte se vlevo do ulice Nádražní.' : 'Exit the main hall and bear left onto Nádražní St.'}</span>
                  </li>
                  <li>
                    <span class="fod-step-km">0.7 km</span>
                    <span><strong>${isCs ? 'Křižovatka Sedlec.' : 'Sedlec Junction.'}</strong> ${isCs ? 'Rovně po chodníku kolem viaduktu ke Katedrále.' : 'Straight past the viaduct toward the Cathedral.'}</span>
                  </li>
                  <li>
                    <span class="fod-step-km">1.2 km</span>
                    <span><strong>${isCs ? 'Sedlecká kostnice.' : 'Sedlec Ossuary.'}</strong> ${isCs ? 'Vpravo do Vítězné, pak vlevo do Zámecké.' : 'Turn right on Vítězná St, then left into Zámecká St.'}</span>
                  </li>
                  <li>
                    <span class="fod-step-km">1.6 km</span>
                    <span><strong>${isCs ? 'Lávka přes Vrchlici.' : 'Vrchlice Footbridge.'}</strong> ${isCs ? 'Přejděte osvětlenou lávku do areálu.' : 'Cross the lit footbridge into the venue sector.'}</span>
                  </li>
                  <li>
                    <span class="fod-step-km">1.8 km</span>
                    <span><strong>${isCs ? 'Vstup A.' : 'Entrance A.'}</strong> ${isCs ? 'Pokladna, RFID pásky a úschovna.' : 'Box office, RFID wristbands, and lockers.'}</span>
                  </li>
                </ol>

                <div class="fod-inline-links">
                  <a href="${mapyWalkUrl}" target="_blank" rel="noopener noreferrer" class="eb-text-link">${isCs ? 'Otevřít v Mapy.cz' : 'Open in Mapy.cz'}<span class="fod-sr-only"> (${isCs ? 'nová záložka' : 'opens in new tab'})</span></a>
                  <a href="${gmapsWalkUrl}" target="_blank" rel="noopener noreferrer" class="eb-text-link">${isCs ? 'Google Maps' : 'Google Maps'}<span class="fod-sr-only"> (${isCs ? 'nová záložka' : 'opens in new tab'})</span></a>
                  <button type="button" id="fod-copy-venue-btn" class="fod-link-btn" data-copy-text="${core.escapeHtml(venueAddressCopy)}">${isCs ? 'Kopírovat adresu a GPS' : 'Copy address & GPS'}</button>
                </div>
              </div>
            </div>

            <div class="fod-simple-map" id="mapa-trasy">
              <div class="fod-map-toolbar">
                <strong>${isCs ? 'Mapa trasy: Kutná Hora hl.n. -> Vstup A' : 'Route map: Kutná Hora hl.n. -> Entrance A'}</strong>
                <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Zvýraznit trasu' : 'Highlight route'}">
                  <button type="button" class="fod-chip fod-chip-sm ${activeRoute === 'all' ? 'is-active' : ''}" data-route-filter="all" aria-pressed="${activeRoute === 'all'}">${isCs ? 'Vše' : 'All'}</button>
                  <button type="button" class="fod-chip fod-chip-sm ${activeRoute === 'bus' ? 'is-active' : ''}" data-route-filter="bus" aria-pressed="${activeRoute === 'bus'}">${isCs ? 'Shuttle (7 min)' : 'Shuttle (7 min)'}</button>
                  <button type="button" class="fod-chip fod-chip-sm ${activeRoute === 'walk' ? 'is-active' : ''}" data-route-filter="walk" aria-pressed="${activeRoute === 'walk'}">${isCs ? 'Pěšky (1,8 km)' : 'Walk (1.8 km)'}</button>
                </div>
              </div>

              <p id="fod-map-status" class="fod-map-status" role="status" aria-live="polite"></p>

              <div class="fod-mobile-route-schematic" aria-label="${isCs ? 'Schéma trasy z nádraží do areálu' : 'Route schematic from station to venue'}">
                <div class="fod-route-stop is-start">
                  <span class="fod-route-dot" aria-hidden="true"></span>
                  <div>
                    <strong>Kutná Hora hl.n.</strong>
                    <span>${isCs ? 'Vlaky R9 · Stanoviště 1 Shuttle Busu' : 'R9 trains · Shuttle Bus Bay 1'}</span>
                  </div>
                </div>
                <div class="fod-route-branch route-bus-group">
                  <span class="fod-route-line is-bus" aria-hidden="true"></span>
                  <div class="fod-route-branch-card is-bus">
                    <strong>${isCs ? 'Shuttle Bus: 7 min (zdarma)' : 'Shuttle Bus: 7 min (free)'}</strong>
                    <span>${isCs ? 'Přímý spoj každých 10-15 min ke Vstupu A' : 'Non-stop every 10-15 min to Entrance A'}</span>
                  </div>
                </div>
                <div class="fod-route-branch route-walk-group">
                  <span class="fod-route-line is-walk" aria-hidden="true"></span>
                  <div class="fod-route-branch-card is-walk">
                    <strong>${isCs ? 'Pěšky: 1,8 km (22-25 min)' : 'Walk: 1.8 km (22-25 min)'}</strong>
                    <span>${isCs ? '0.7 km Sedlec -> 1.6 km Lávka Vrchlice' : '0.7 km Sedlec -> 1.6 km Vrchlice Footbridge'}</span>
                  </div>
                </div>
                <div class="fod-route-stop is-end">
                  <span class="fod-route-dot is-end" aria-hidden="true"></span>
                  <div>
                    <strong>${isCs ? 'Vstup A · Areál Sedlec' : 'Entrance A · Sedlec Grounds'}</strong>
                    <span>${isCs ? 'Solar Horizon · Lunar Dome (kryté)' : 'Solar Horizon · Lunar Dome (covered)'}</span>
                  </div>
                </div>
              </div>

              <p class="fod-map-pan-hint" aria-hidden="true">${isCs ? '← Posuňte mapu do stran →' : '← Swipe map sideways →'}</p>
              <div class="fod-map-scroll">
                <svg viewBox="0 0 880 340" class="fod-route-svg" role="img" aria-label="${isCs ? 'Mapa trasy z Kutná Hora hl.n. ke Vstupu A' : 'Route map from Kutná Hora hl.n. to Entrance A'}">
                  <rect x="0" y="0" width="880" height="340" rx="12" class="fod-svg-bg"/>
                  <g>
                    <rect x="24" y="105" width="180" height="120" rx="8" class="fod-svg-node"/>
                    <text x="114" y="138" text-anchor="middle" class="fod-svg-title">Kutná Hora hl.n.</text>
                    <text x="114" y="160" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Vlaky R9 (Praha 55m)' : 'R9 Trains (Prague 55m)'}</text>
                    <text x="114" y="182" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Shuttle: Stanoviště 1' : 'Shuttle: Bus Bay 1'}</text>
                  </g>
                  <g class="route-bus-group">
                    <path d="M 204 135 Q 440 25 685 135" fill="none" class="fod-svg-bus-path"/>
                    <rect x="315" y="26" width="260" height="28" rx="6" class="fod-svg-bus-badge"/>
                    <text x="445" y="45" text-anchor="middle" class="fod-svg-bus-text">${isCs ? 'Shuttle Bus: 7 min (zdarma)' : 'Shuttle Bus: 7 min (free)'}</text>
                  </g>
                  <g class="route-walk-group">
                    <rect x="285" y="185" width="165" height="82" rx="8" class="fod-svg-node"/>
                    <text x="367" y="214" text-anchor="middle" class="fod-svg-title">${isCs ? 'Sedlec a Kostnice' : 'Sedlec & Ossuary'}</text>
                    <text x="367" y="234" text-anchor="middle" class="fod-svg-sub">0.7 km</text>
                    <rect x="495" y="190" width="150" height="74" rx="8" class="fod-svg-node"/>
                    <text x="570" y="218" text-anchor="middle" class="fod-svg-title">${isCs ? 'Lávka Vrchlice' : 'Vrchlice Footbridge'}</text>
                    <text x="570" y="238" text-anchor="middle" class="fod-svg-sub">1.6 km</text>
                    <path d="M 204 185 L 285 220 M 450 225 L 495 225 M 645 220 L 685 175" fill="none" class="fod-svg-walk-path"/>
                    <rect x="305" y="288" width="280" height="28" rx="6" class="fod-svg-walk-badge"/>
                    <text x="445" y="307" text-anchor="middle" class="fod-svg-walk-text">${isCs ? 'Pěší trasa: 1,8 km (22-25 min)' : 'Walking route: 1.8 km (22-25 min)'}</text>
                  </g>
                  <g>
                    <rect x="685" y="96" width="172" height="145" rx="8" class="fod-svg-venue"/>
                    <text x="771" y="128" text-anchor="middle" class="fod-svg-title">${isCs ? 'Vstup A · Areál' : 'Entrance A · Venue'}</text>
                    <text x="771" y="150" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Akreditace & Úschovna' : 'Wristbands & Lockers'}</text>
                    <text x="771" y="182" text-anchor="middle" class="fod-svg-sub">Solar Horizon (4,500)</text>
                    <text x="771" y="204" text-anchor="middle" class="fod-svg-sub">Lunar Dome (1,800 · ${isCs ? 'kryté' : 'covered'})</text>
                  </g>
                </svg>
              </div>
            </div>

            <p class="fod-car-footnote">${isCs
              ? '<strong>Autem:</strong> Parkoviště P1 na okraji Kutné Hory (800 míst, 100 Kč/den), značená cesta ke Vstupu A (400 m, cca 5 min pěšky).'
              : '<strong>By car:</strong> Parking P1 on the edge of Kutná Hora (800 spaces, 100 CZK/day), marked 400 m path to Entrance A (approx. 5 min walk).'}</p>
          </section>

          <section class="fod-info-block" id="kemp">
            <h2>${isCs ? 'V areálu' : 'On site'}</h2>
            <dl class="fod-info-dl">
              <div>
                <dt>${isCs ? 'Stanové městečko' : 'Camping'}</dt>
                <dd>${isCs
                  ? '300 m od Vstupu A. Teplé sprchy, pitná voda a nonstop recepce. Otevřeno od pátku 10:00 do pondělí 12:00.'
                  : '300 m from Entrance A. Hot showers, drinking water, and 24/7 reception. Open Fri 10:00 to Mon 12:00.'}</dd>
              </div>
              <div id="cashless">
                <dt>${isCs ? 'Cashless náramek' : 'Cashless RFID'}</dt>
                <dd>${isCs
                  ? 'Na barech i ve stáncích se platí pouze čipem na náramku. Dobití zdarma online nebo na místě kartou i hotově; vrácení zůstatku zdarma do 14 dnů.'
                  : 'All bars and food stalls take RFID wristbands only. Free top-up online or on site by card or cash; fee-free refunds within 14 days.'}</dd>
              </div>
              <div>
                <dt>${isCs ? 'Úschovna a zdravotníci' : 'Lockers & Medical'}</dt>
                <dd>${isCs
                  ? 'Skříňky se zásuvkami 230V jsou hned vedle Vstupu A. Nepřetržité stanoviště Červeného kříže leží mezi Lunar Forest Dome a Vstupem A.'
                  : '230V charging lockers sit beside Entrance A. A 24/7 Red Cross medical station sits between Lunar Forest Dome and Entrance A.'}</dd>
              </div>
              <div id="parametry">
                <dt>${isCs ? 'Ročník 2026' : '2026 Facts'}</dt>
                <dd>${isCs
                  ? '10.-12. 7. 2026 (areál 13:00-04:00). Dvě pódia: venkovní Solar Horizon (4 500 míst) a krytý Lunar Forest Dome (1 800 míst). 60 živých vystoupení.'
                  : '10-12 Jul 2026 (grounds 13:00-04:00). Two stages: open-air Solar Horizon (4,500 cap) and covered Lunar Forest Dome (1,800 cap). 60 live acts.'}</dd>
              </div>
            </dl>
          </section>

          <section class="fod-info-block" id="faq">
            <h2>${isCs ? 'Časté dotazy' : 'FAQ'}</h2>
            <div class="fod-clean-faq">
              <details>
                <summary>${isCs ? 'Co se stane v případě silného deště?' : 'What happens if it rains heavily?'}</summary>
                <p>${isCs
                  ? 'Festival probíhá za každého počasí. Krytý Lunar Forest Dome pojme 1 800 návštěvníků a hraje bez přerušení.'
                  : 'The festival runs in all weather. Covered Lunar Forest Dome shelters 1,800 visitors with uninterrupted live sets.'}</p>
              </details>
              <details>
                <summary>${isCs ? 'Je shuttle bus z nádraží zdarma?' : 'Is the shuttle bus from the station free?'}</summary>
                <p>${isCs
                  ? 'Ano, pro všechny držitele vstupenek je kyvadlová linka z Kutná Hora hl.n. zcela zdarma.'
                  : 'Yes, the shuttle bus from Kutná Hora hl.n. is free for all ticket holders.'}</p>
              </details>
              <details>
                <summary>${isCs ? 'Jak získám zpět nevyčerpaný kredit z náramku?' : 'How do I refund unused wristband balance?'}</summary>
                <p>${isCs
                  ? 'Po skončení festivalu si zůstatek do 14 dnů zdarma převedete zpět na bankovní účet.'
                  : 'Request a fee-free bank refund within 14 days after the festival ends.'}</p>
              </details>
            </div>
          </section>
        </div>
      `;

      root.querySelectorAll('[data-route-filter]').forEach(btn => {
        btn.addEventListener('click', () => setMapRoute(btn.getAttribute('data-route-filter')));
      });

      const daySelect = document.getElementById('fod-shuttle-day');
      const timeInput = document.getElementById('fod-shuttle-time');
      if (daySelect) {
        daySelect.addEventListener('change', () => {
          estimatorDay = daySelect.value;
          updateShuttleEstimator();
        });
      }
      if (timeInput) {
        timeInput.addEventListener('input', () => {
          estimatorTime = timeInput.value || '14:10';
          updateShuttleEstimator();
        });
      }

      const copyBtn = document.getElementById('fod-copy-venue-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const txt = copyBtn.getAttribute('data-copy-text') || venueAddressCopy;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(() => {
              core.showToast(isCs ? 'Adresa a GPS zkopírovány.' : 'Address and GPS copied.');
            }).catch(() => {
              window.prompt(isCs ? 'Zkopírujte adresu areálu:' : 'Copy venue address:', txt);
            });
          } else {
            window.prompt(isCs ? 'Zkopírujte adresu areálu:' : 'Copy venue address:', txt);
          }
        });
      }

      setMapRoute(activeRoute);
      updateShuttleEstimator();
    }

    window.addEventListener('languageChanged', render);
    render();
  }

  // =========================================================================
  // 6. MY SCHEDULE PAGE (Collision detection, Czech 3-case plural, .ics export, Share)
  // =========================================================================
  function initMySchedulePage() {
    const root = document.getElementById('fod-my-schedule-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    // Support importing shared schedule via ?plan=perf-01,perf-17
    try {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get('plan');
      if (plan) {
        const ids = plan.split(',').map(s => s.trim()).filter(id => data.PERFORMERS.some(p => p.id === id));
        if (ids.length > 0) {
          core.saveFavorites(ids);
        }
      }
    } catch (e) {}

    function exportIcs() {
      const favs = core.getFavorites();
      const isCs = core.getLang() === 'cs';
      if (favs.length === 0) {
        core.showToast(isCs ? 'Nejsou uložena žádná vystoupení pro export.' : 'No saved sets to export.');
        return;
      }
      const dateByDay = { day1: '20260710', day2: '20260711', day3: '20260712' };
      const nextDateByDay = { day1: '20260711', day2: '20260712', day3: '20260713' };
      const fmtDt = (dayKey, hm) => {
        const [hStr, mStr] = hm.split(':');
        const h = parseInt(hStr, 10);
        const dateStr = h < 8 ? nextDateByDay[dayKey] : dateByDay[dayKey];
        return `${dateStr}T${hStr.padStart(2, '0')}${mStr.padStart(2, '0')}00`;
      };

      const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Festival of Darkness 2//My Schedule//EN',
        'CALSCALE:GREGORIAN'
      ];
      favs.forEach(item => {
        const p = data.PERFORMERS.find(x => x.id === item.id) || item;
        const dayKey = core.normalizeDayKey(p);
        const [s, e] = String(p.time || '14:00 - 14:45').split(/[–-]/).map(x => x.trim());
        lines.push(
          'BEGIN:VEVENT',
          `UID:${p.id}@festivalofdarkness.com`,
          `DTSTART;TZID=Europe/Prague:${fmtDt(dayKey, s)}`,
          `DTEND;TZID=Europe/Prague:${fmtDt(dayKey, e || s)}`,
          `SUMMARY:${p.name || p.artist} - Festival of Darkness 2`,
          `LOCATION:${p.stage}, Kutná Hora`,
          `DESCRIPTION:${p.genre}`,
          'END:VEVENT'
        );
      });
      lines.push('END:VCALENDAR');

      const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'festival-of-darkness-2-schedule.ics';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      core.showToast(isCs ? 'Kalendář .ics byl stažen!' : 'Exported .ics calendar file!');
    }

    function shareSchedule() {
      const favs = core.getFavorites();
      const isCs = core.getLang() === 'cs';
      if (favs.length === 0) {
        core.showToast(isCs ? 'Nejprve přidejte alespoň 1 vystoupení.' : 'Save at least 1 set first.');
        return;
      }
      const url = new URL(window.location.href);
      url.hash = '';
      url.search = `?plan=${favs.map(f => f.id).join(',')}`;
      const shareStr = url.toString();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareStr).then(() => {
          core.showToast(isCs ? 'Odkaz na váš plán byl zkopírován do schránky!' : 'Schedule link copied to clipboard!');
        }).catch(() => {
          window.prompt(isCs ? 'Zkopírujte odkaz na váš plán:' : 'Copy your schedule link:', shareStr);
        });
      } else {
        window.prompt(isCs ? 'Zkopírujte odkaz na váš plán:' : 'Copy your schedule link:', shareStr);
      }
    }

    function computeCollisions(favs) {
      if (typeof core.computeScheduleCollisions === 'function') {
        return core.computeScheduleCollisions(favs);
      }
      let total = 0;
      const byId = new Map();
      data.DAYS.forEach(d => {
        const dayFavs = favs.filter(f => core.normalizeDayKey(f) === d.key);
        for (let i = 0; i < dayFavs.length; i++) {
          for (let j = i + 1; j < dayFavs.length; j++) {
            const a = dayFavs[i];
            const b = dayFavs[j];
            if (core.normalizeStageKey(a.stage) !== core.normalizeStageKey(b.stage) && core.isOverlapping(a.time, b.time)) {
              total++;
              if (!byId.has(a.id)) byId.set(a.id, []);
              if (!byId.has(b.id)) byId.set(b.id, []);
              byId.get(a.id).push(b);
              byId.get(b.id).push(a);
            }
          }
        }
      });
      return { total, byId };
    }

    let pendingHashId = (window.location.hash || '').replace('#', '');

    function renderShell() {
      const isCs = core.getLang() === 'cs';
      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="program.html">${isCs ? 'Program' : 'Program'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Můj plán' : 'My Schedule'}</span>
        </nav>
        <div class="fod-toolbar-panel">
          <div class="fod-plan-summary-actions">
            <a href="program.html" class="fod-btn fod-btn-primary">${isCs ? '+ Přidat z Programu' : '+ Add from Program'}</a>
            <button type="button" id="share-schedule-btn" class="fod-btn fod-btn-secondary">${isCs ? 'Sdílet plán' : 'Share My Plan'}</button>
            <button type="button" id="export-schedule-btn" class="fod-btn fod-btn-secondary">${isCs ? 'Export .ics' : 'Export .ics'}</button>
            <button type="button" id="clear-favorites-btn" class="fod-btn fod-btn-ghost">${isCs ? 'Vymazat vše' : 'Clear All'}</button>
          </div>
        </div>

        <div id="my-schedule-container"></div>
      `;

      const shareBtn = document.getElementById('share-schedule-btn');
      if (shareBtn) shareBtn.addEventListener('click', shareSchedule);

      const exportBtn = document.getElementById('export-schedule-btn');
      if (exportBtn) exportBtn.addEventListener('click', exportIcs);

      const clearBtn = document.getElementById('clear-favorites-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          const msg = core.getLang() === 'cs'
            ? 'Opravdu chcete odebrat všechna uložená vystoupení?'
            : 'Are you sure you want to remove all saved performances?';
          if (window.confirm(msg)) {
            core.clearFavorites();
          }
        });
      }

      renderBody();
    }

    function renderBody() {
      const container = document.getElementById('my-schedule-container');
      if (!container) return;
      const isCs = core.getLang() === 'cs';
      const favs = core.getFavorites();
      const { total: totalCollisions, byId: collisionMap } = computeCollisions(favs);

      if (favs.length === 0) {
        container.innerHTML = `
          <div class="fod-empty-card">
            <h2>${isCs ? 'Zatím nemáte v osobním plánu žádná vystoupení' : 'No sets saved in your personal schedule yet'}</h2>
            <p>${isCs
              ? 'Vyberte si interprety v sekci Program nebo Účinkující, nebo si načtěte připravený bezkolizní výběr.'
              : 'Pick performances in Program or Artists, or load the curated conflict-free sample itinerary.'}</p>
            <div class="fod-empty-actions">
              <a href="program.html" class="fod-btn fod-btn-primary">${isCs ? 'Přejít do Programu' : 'Browse Program'}</a>
              <button type="button" id="empty-sample-btn" class="fod-btn fod-btn-secondary">${isCs ? 'Načíst ukázkový plán' : 'Load Curated Sample'}</button>
            </div>
          </div>
        `;
      } else {
        const bannerHtml = totalCollisions > 0
          ? `
            <div class="fod-alert-banner is-conflict" role="alert">
              <h3>${isCs
                ? `Upozornění na časové kolize: nalezeno ${core.formatCzPlural(totalCollisions, 'překrývající se vystoupení', 'překrývající se vystoupení', 'překrývajících se vystoupení')}!`
                : `Schedule Conflict Alert: Found ${totalCollisions} overlapping ${totalCollisions === 1 ? 'show' : 'shows'}!`}</h3>
              <p>${isCs
                ? 'V některých časech máte současně naplánována vystoupení na Solar Horizon Stage a v Lunar Forest Dome.'
                : 'You have overlapping performances scheduled simultaneously on Solar Horizon Stage and Lunar Forest Dome.'}</p>
            </div>
          `
          : `
            <div class="fod-alert-banner is-clean">
              <strong>${isCs
                ? '✓ Váš harmonogram je bez časových kolizí! Všechna vybraná vystoupení stíháte v plné délce.'
                : '✓ Your schedule has no time conflicts! All selected performances fit together cleanly.'}</strong>
            </div>
          `;

        const daysHtml = data.DAYS.map(d => {
          const dayFavs = favs
            .filter(f => core.normalizeDayKey(f) === d.key)
            .sort((a, b) => {
              const sA = String(a.time || '').split(/[–-]/)[0].trim();
              const sB = String(b.time || '').split(/[–-]/)[0].trim();
              return core.timeToMinutes(sA) - core.timeToMinutes(sB);
            });

          const countText = core.formatShowsCount(dayFavs.length, core.getLang());
          const hasDayCollision = dayFavs.some(item => collisionMap.has(item.id));

          return `
            <section class="fod-day-section">
              <div class="fod-day-header">
                <h2 class="fod-day-title">${isCs ? d.cs : d.en}</h2>
                <span class="fod-badge">${countText}</span>
              </div>
              ${hasDayCollision ? `
                <div class="fod-day-conflict-note">
                  ${isCs
                    ? '⚠ V tomto dni dochází k časové kolizi mezi Solar Horizon a Lunar Forest Dome.'
                    : '⚠ A time conflict occurs on this day between Solar Horizon and Lunar Forest Dome.'}
                </div>
              ` : ''}
              ${dayFavs.length === 0 ? `
                <div class="fod-empty-day">
                  <span>${isCs ? 'Pro tento den nemáte uloženo žádné vystoupení.' : 'No performances saved for this day.'}</span>
                  <a href="program.html?day=${d.key}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'Vybrat v Programu' : 'Pick in Program'}</a>
                </div>
              ` : `
                <div class="fod-cards-grid">
                  ${dayFavs.map(item => {
                    const p = data.PERFORMERS.find(x => x.id === item.id) || {};
                    const collidingRaw = collisionMap.get(item.id);
                    const collidingList = Array.isArray(collidingRaw) ? collidingRaw : (collidingRaw ? [collidingRaw] : []);
                    const hasCol = collidingList.length > 0;
                    const collidingSummaryHtml = collidingList.map(c =>
                      `<strong>${core.escapeHtml(c.artist)}</strong> (${core.escapeHtml(c.stage)}, ${renderTimeRangeHtml(d.key, c.time, core)})`
                    ).join(', ');
                    const stageKey = core.normalizeStageKey(item.stage);
                    const stageHash = stageKey === 'lunar' ? 'stage-lunar' : 'stage-solar';
                    const bio = isCs ? (p.bioCs || '') : (p.bioEn || '');

                    return `
                      <article class="fod-plan-card ${hasCol ? 'has-collision' : ''}" id="${item.id}"${hasCol ? ' data-conflict="true"' : ''}>
                        <div class="fod-card-top">
                          <span class="fod-slot-time">${renderTimeRangeHtml(d.key, item.time, core)}</span>
                          <span class="fod-stage-pill ${stageKey === 'lunar' ? 'is-lunar' : 'is-solar'}">
                            <a href="stages.html#${stageHash}">${core.escapeHtml(item.stage)}</a>
                          </span>
                        </div>
                        <h3 class="fod-card-title">
                          <a href="artist-detail.html?id=${item.id}&from=myschedule#${item.id}">${core.escapeHtml(item.artist)}</a>
                        </h3>
                        <p class="fod-card-meta">${core.escapeHtml(item.genre)}</p>
                        ${bio ? `<p class="fod-card-bio">${core.escapeHtml(bio)}</p>` : ''}
                        <div class="fod-status-badge ${hasCol ? 'is-conflict' : 'is-clean'}">
                          ${hasCol
                            ? `<strong>${isCs ? '⚠ ČASOVÁ KOLIZE' : '⚠ TIME CONFLICT'}</strong>: ${isCs ? 'Překrývá se s' : 'Overlaps with'} ${collidingSummaryHtml}`
                            : `<strong>${isCs ? '✓ Bez časové kolize' : '✓ No time conflict'}</strong>`
                          }
                        </div>
                        <div class="fod-card-actions">
                          <a href="artist-detail.html?id=${item.id}&from=myschedule#${item.id}" class="fod-btn fod-btn-secondary fod-btn-sm">
                            ${isCs ? 'Detail' : 'Artist Detail'}
                          </a>
                          <button type="button" class="fod-btn fod-btn-ghost fod-btn-sm remove-btn" data-id="${item.id}">
                            ${isCs ? 'Odebrat' : 'Remove'}
                          </button>
                        </div>
                      </article>
                    `;
                  }).join('')}
                </div>
              `}
            </section>
          `;
        }).join('');

        container.innerHTML = bannerHtml + daysHtml;
      }

      const emptySampleBtn = document.getElementById('empty-sample-btn');
      if (emptySampleBtn) {
        emptySampleBtn.addEventListener('click', () => {
          core.saveFavorites(data.SAMPLE_IDS);
          core.showToast(isCs ? 'Načten ukázkový bezkolizní plán.' : 'Loaded curated conflict-free sample.');
        });
      }

      if (pendingHashId) {
        const el = document.getElementById(pendingHashId);
        if (el) {
          el.classList.add('spot-highlight');
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        }
        pendingHashId = '';
      }
    }

    root.addEventListener('click', e => {
      const rem = e.target && e.target.closest && e.target.closest('.remove-btn[data-id]');
      if (rem) {
        core.toggleFavoriteById(rem.getAttribute('data-id'));
      }
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', renderBody);
    renderShell();
  }

  // =========================================================================
  // 7. SEARCH PAGE (Full 60 performers + timetable + practical info + synonyms)
  // =========================================================================
  function initSearchPage() {
    const root = document.getElementById('fod-search-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    const SITE_EXTRA_INFO = [
      {
        id: "site-tickets-passes",
        titleEn: "Festival Passes: 3-Day Pass, Comfy+ Upgrade & 1-Day Tickets",
        titleCs: "Festivalové vstupenky: 3denní pas, Comfy+ upgrade a 1denní vstupenky",
        descEn: "3-Day Full Pass (2,490 CZK / 99 EUR), Comfy+ priority lane & lounge upgrade, and Friday/Saturday/Sunday single-day passes exchanged for RFID wristbands at Entrance A.",
        descCs: "3denní základní vstupenka (2 490 Kč / 99 EUR), Comfy+ prioritní vstup a lounge, i jednodenní vstupenky Pátek/Sobota/Neděle vyměňované za RFID náramky na Vstupu A.",
        link: "tickets.html",
        linkTextEn: "View Festival Passes ->",
        linkTextCs: "Zobrazit vstupenky ->",
        keywords: "tickets vstupenky pasy 3denni 3-day comfy comfy+ upgrade 1denni 1-day jednodenni 2490 99 eur 1490 3290 2190 2690 vlna wave"
      },
      {
        id: "site-camping-glamping",
        titleEn: "Camping, Glamping & Parking P1",
        titleCs: "Kempování, Glamping a Parkoviště P1",
        descEn: "Tent pitch in Kutná Hora grove (300 m from Entrance A), furnished Glamping tents, hot showers, drinking water, 24/7 reception (Fri 10:00-Mon 12:00), and Parking P1 (800 cars, 100 CZK / day).",
        descCs: "Stanové městečko v háji u Kutné Hory (300 m od Vstupu A), vybavený Glamping, teplé sprchy, pitná voda, recepce 24/7 (Pá 10:00-Po 12:00) a Parkoviště P1 (800 míst, 100 Kč / den).",
        link: "tickets.html",
        linkTextEn: "Camping & Parking ->",
        linkTextCs: "Kemp a parkování ->",
        keywords: "kemp camping glamping stan stanove mestecko sprchy voda parking parkoviste p1 800 100 kc czk auto car"
      },
      {
        id: "site-walking-waypoints",
        titleEn: "Marked Walking Route & Waypoints (1.8 km, 22-25 min)",
        titleCs: "Značená pěší trasa a orientační body (1,8 km, 22-25 min)",
        descEn: "Illuminated route from Kutná Hora hl.n. via Nádražní St, Sedlec Junction, Sedlec Ossuary (Kostnice), Vítězná & Zámecká St, and Vrchlice Footbridge directly to Main Gate Entrance A.",
        descCs: "Osvětlená trasa z nádraží Kutná Hora hl.n. přes Nádražní, Sedlec, kolem Sedlecké kostnice, Vítěznou a Zámeckou ulicí přes lávku nad Vrchlicí přímo k Hlavní bráně Vstup A.",
        link: "practical-info.html#pesi-trasa",
        linkTextEn: "Walking Directions ->",
        linkTextCs: "Pěší trasa ->",
        keywords: "pesi trasa walking route nadrazni sedlec kostnice ossuary vitezna zamecka vrchlice lavka footbridge vstup a 1.8 km"
      },
      {
        id: "site-shuttle-sync",
        titleEn: "Shuttle Bus Schedule & R9 Express Train Sync",
        titleCs: "Jízdní řád Shuttle Busu & Návaznost na rychlíky R9",
        descEn: "Free 7-minute shuttle every 10-15 min (Fri 11:30-04:00, Sat/Sun 12:00-04:00/03:30, Mon departures 07:00-13:00), synced with R9 express trains from Prague and Brno.",
        descCs: "Bezplatný shuttle bus (jízda 7 minut, interval 10-15 min: Pá 11:30-04:00, So/Ne 12:00-04:00/03:30, Po odjezdy 07:00-13:00) s garancí návaznosti na rychlíky R9 z Prahy a Brna.",
        link: "practical-info.html#shuttle-bus",
        linkTextEn: "Shuttle Timetable ->",
        linkTextCs: "Jízdní řád Shuttle ->",
        keywords: "shuttle bus kyvadlovy autobus r9 praha brno prague rychlik vlak train jizdni rad timetable pondeli monday 7 minut"
      },
      {
        id: "site-lockers-cashless",
        titleEn: "230V Charging Lockers, Cashless RFID & 14-Day Refund",
        titleCs: "Úschovna s 230V zásuvkami, Cashless RFID a vrácení do 14 dnů",
        descEn: "Security lockers with 230V phone charging sockets beside Entrance A, 100% cashless RFID wristbands, 24/7 Red Cross medical post, and free refund of unused balance within 14 days.",
        descCs: "Bezpečnostní skříňky se zásuvkami 230V pro nabíjení telefonů u Vstupu A, 100% cashless RFID náramky, Červený kříž 24/7 a bezplatné vrácení kreditu do 14 dnů po festivalu.",
        link: "practical-info.html#cashless",
        linkTextEn: "Cashless & Lockers ->",
        linkTextCs: "Cashless a úschovna ->",
        keywords: "230v skrinky uschovna lockers nabijeni charging cashless rfid cerveny kriz red cross 14 dnu days refund vraceni darkness collective"
      }
    ];

    const ALL_INFO_ENTRIES = [...data.PRACTICAL_INFO, ...SITE_EXTRA_INFO];

    function matchesQuery(haystack, tokens) {
      if (!tokens.length) return true;
      const norm = core.normalizeStr(haystack);
      return tokens.every(tok => {
        if (norm.includes(tok)) return true;
        if (tok === "info") return norm.includes("informac") || norm.includes("information") || norm.includes("praktick") || norm.includes("practical");
        if (tok === "informace" || tok === "information") return norm.includes("info") || norm.includes("praktick") || norm.includes("practical");
        if (tok === "prakticke" || tok === "practical") return norm.includes("info") || norm.includes("informac");
        if (tok === "bus" || tok === "autobus") return norm.includes("shuttle") || norm.includes("kyvadlov");
        if (tok === "vlak" || tok === "train") return norm.includes("nadrazi") || norm.includes("station") || norm.includes("shuttle") || norm.includes("r9");
        if (tok === "ticket" || tok === "tickets" || tok === "listky" || tok === "vstupenky") return norm.includes("vstupenk") || norm.includes("ticket") || norm.includes("faq") || norm.includes("pas");
        if (tok === "dest" || tok === "rain" || tok === "shelter" || tok === "ukryt") return norm.includes("lunar") || norm.includes("shelter") || norm.includes("dest");
        if (tok === "elektronika") return norm.includes("electronic") || norm.includes("electro") || norm.includes("techno");
        if (tok === "tanecni") return norm.includes("dance") || norm.includes("disco");
        if (tok === "experimentalni") return norm.includes("experimental") || norm.includes("idm") || norm.includes("glitch");
        return false;
      });
    }

    let initialQuery = '';
    try {
      initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    } catch (e) {}

    function renderShell() {
      const isCs = core.getLang() === 'cs';

      root.innerHTML = `
        <nav class="fod-breadcrumbs" aria-label="${isCs ? 'Drobečková navigace' : 'Breadcrumb'}">
          <a href="program.html">${isCs ? 'Program' : 'Program'}</a>
          <span class="fod-breadcrumb-sep" aria-hidden="true">&gt;</span>
          <span aria-current="page">${isCs ? 'Vyhledávání' : 'Search'}</span>
        </nav>
        <div class="fod-toolbar-panel">
          <form id="search-form" class="fod-search-row" role="search">
            <label for="global-search-input" class="fod-sr-only">${isCs ? 'Vyhledat na festivalu' : 'Search festival'}</label>
            <input type="search" id="global-search-input" class="fod-input"
              value="${core.escapeHtml(initialQuery)}"
              placeholder="${isCs ? 'Hledat interprety, žánry, pódia, shuttle bus, kemp...' : 'Search artists, genres, stages, shuttle bus, camping...'}">
            <button type="button" id="search-clear-btn" class="fod-btn fod-btn-secondary">${isCs ? 'Vymazat' : 'Clear'}</button>
            <button type="submit" id="search-submit-btn" class="fod-btn fod-btn-primary">${isCs ? 'Hledat' : 'Search'}</button>
          </form>

          <div class="fod-plan-summary-row" id="search-status-bar">
            <span class="fod-status-text">
              ${isCs ? 'Dotaz:' : 'Query:'} <strong id="active-query-text"></strong> ·
              <strong id="results-count">0</strong> ${isCs ? 'výsledků' : 'results'}
            </span>
          </div>
        </div>

        <section id="results-performers" class="fod-search-section">
          <h2>${isCs ? 'Účinkující' : 'Performers'}</h2>
          <div id="performers-results-container" class="fod-search-list"></div>
        </section>

        <section id="results-timetable" class="fod-search-section">
          <h2>${isCs ? 'Časové sloty v Programu' : 'Timetable Slots'}</h2>
          <div id="timetable-results-container" class="fod-search-list"></div>
        </section>

        <section id="results-info" class="fod-search-section">
          <h2>${isCs ? 'Praktické informace a pódia' : 'Practical Info & Stages'}</h2>
          <div id="info-results-container" class="fod-search-list"></div>
        </section>

        <div id="search-empty-msg" class="fod-empty-card is-hidden"></div>
      `;

      const input = document.getElementById('global-search-input');
      const form = document.getElementById('search-form');
      const clearBtn = document.getElementById('search-clear-btn');

      input.addEventListener('input', e => {
        initialQuery = e.target.value;
        executeSearch(initialQuery);
      });
      form.addEventListener('submit', e => {
        e.preventDefault();
        initialQuery = input.value;
        executeSearch(initialQuery);
      });
      clearBtn.addEventListener('click', () => {
        initialQuery = '';
        input.value = '';
        executeSearch('');
        input.focus();
      });

      executeSearch(initialQuery);
    }

    function executeSearch(query) {
      const cleanQuery = String(query || '').toLowerCase().trim();
      const tokens = core.normalizeStr(query).trim().split(/\s+/).filter(Boolean);
      const isCs = core.getLang() === 'cs';
      const favIds = new Set(core.getFavorites().map(f => f.id));

      const qSpan = document.getElementById('active-query-text');
      const cSpan = document.getElementById('results-count');
      const perfBox = document.getElementById('performers-results-container');
      const timeBox = document.getElementById('timetable-results-container');
      const infoBox = document.getElementById('info-results-container');
      const secPerf = document.getElementById('results-performers');
      const secTime = document.getElementById('results-timetable');
      const secInfo = document.getElementById('results-info');
      const emptyEl = document.getElementById('search-empty-msg');

      if (qSpan) qSpan.textContent = query || (isCs ? 'vše' : 'all');

      try {
        const newUrl = cleanQuery ? `search.html?q=${encodeURIComponent(cleanQuery)}` : 'search.html';
        window.history.replaceState({}, '', newUrl);
      } catch (e) {}

      const matchedPerformers = data.PERFORMERS.filter(p => {
        if (!tokens.length) return true;
        return matchesQuery(buildPerformerSearchHaystack(p, core, data), tokens);
      });

      const matchedTimetable = cleanQuery
        ? data.PERFORMERS.filter(p => matchesQuery(buildPerformerSearchHaystack(p, core, data), tokens))
        : [];

      const matchedInfo = ALL_INFO_ENTRIES.filter(info => {
        if (!tokens.length) return true;
        return matchesQuery(`${info.id} ${info.titleEn} ${info.titleCs} ${info.descEn} ${info.descCs} ${info.keywords}`, tokens);
      });

      const total = matchedPerformers.length + matchedTimetable.length + matchedInfo.length;
      if (cSpan) cSpan.textContent = String(total);

      if (secPerf && perfBox) {
        secPerf.classList.toggle('is-hidden', matchedPerformers.length === 0);
        perfBox.innerHTML = matchedPerformers.map(p => {
          const isFav = favIds.has(p.id);
          return `
            <article class="fod-search-item">
              <div class="fod-search-item-main">
                <h3><a href="artist-detail.html?id=${p.id}&from=search#${p.id}">${core.escapeHtml(p.name)}</a> <span class="fod-origin-pill">${core.escapeHtml(p.origin)}</span></h3>
                <p class="fod-card-meta">${core.escapeHtml(p.genre)} · ${core.escapeHtml(p.stage)} · ${renderTimeRangeHtml(p.dayKey, p.time, core)}</p>
                <p>${core.escapeHtml(isCs ? p.bioCs : p.bioEn)}</p>
              </div>
              <div class="fod-search-item-actions">
                <a href="artist-detail.html?id=${p.id}&from=search#${p.id}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'Profil' : 'View Profile'}</a>
                <button type="button" class="fod-btn fod-btn-sm fav-toggle-btn ${isFav ? 'is-saved' : ''}" data-perf-id="${p.id}" aria-pressed="${isFav}">
                  ${isFav ? (isCs ? '✓ V plánu' : '✓ In Plan') : (isCs ? '+ Přidat' : '+ Add')}
                </button>
              </div>
            </article>
          `;
        }).join('');
      }

      if (secTime && timeBox) {
        secTime.classList.toggle('is-hidden', matchedTimetable.length === 0);
        timeBox.innerHTML = matchedTimetable.slice(0, 10).map(p => `
          <div class="fod-search-item">
            <div class="fod-search-item-main">
              <h3>${core.escapeHtml(p.stage)} - ${core.escapeHtml(isCs ? p.dayShortCs : p.dayShortEn)}, ${renderTimeRangeHtml(p.dayKey, p.time, core)}</h3>
              <p><strong>${core.escapeHtml(p.name)}</strong> - ${core.escapeHtml(p.genre)} (${core.escapeHtml(p.origin)})</p>
            </div>
            <div class="fod-search-item-actions">
              <a href="program.html?day=${p.dayNum}&highlight=${p.id}#${p.id}" class="fod-btn fod-btn-secondary fod-btn-sm">${isCs ? 'V Programu' : 'In Timetable'}</a>
            </div>
          </div>
        `).join('');
      }

      if (secInfo && infoBox) {
        secInfo.classList.toggle('is-hidden', matchedInfo.length === 0);
        infoBox.innerHTML = matchedInfo.map(info => `
          <div class="fod-search-item">
            <div class="fod-search-item-main">
              <h3>${core.escapeHtml(isCs ? info.titleCs : info.titleEn)}</h3>
              <p>${core.escapeHtml(isCs ? info.descCs : info.descEn)}</p>
            </div>
            <div class="fod-search-item-actions">
              <a href="${core.escapeHtml(info.link)}" class="fod-btn fod-btn-secondary fod-btn-sm">${core.escapeHtml(isCs ? info.linkTextCs : info.linkTextEn)}</a>
            </div>
          </div>
        `).join('');
      }

      if (emptyEl) {
        emptyEl.classList.toggle('is-hidden', total > 0);
        if (total === 0) {
          const suggestions = ['info', 'shuttle', 'techno', 'ambient', 'lunar', 'camping', 'cashless'];
          emptyEl.innerHTML = `
            <h3>${isCs ? 'Pro váš dotaz nebyly nalezeny žádné výsledky.' : 'No results found matching your query.'}</h3>
            <p>${isCs ? 'Zkuste vyhledat některé z oblíbených témat:' : 'Try one of these popular topics:'}</p>
            <div class="fod-filter-row">
              ${suggestions.map(s => `<button type="button" class="fod-chip search-suggestion-chip" data-suggest="${s}">${core.escapeHtml(s)}</button>`).join('')}
            </div>
          `;
          emptyEl.querySelectorAll('.search-suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
              const s = chip.getAttribute('data-suggest') || '';
              initialQuery = s;
              const inp = document.getElementById('global-search-input');
              if (inp) { inp.value = s; inp.focus(); }
              executeSearch(s);
            });
          });
        }
      }

      window.executeFestivalSearch = executeSearch;
    }

    root.addEventListener('click', e => {
      const btn = e.target && e.target.closest && e.target.closest('.fav-toggle-btn[data-perf-id]');
      if (!btn) return;
      core.toggleFavoriteById(btn.getAttribute('data-perf-id'));
      executeSearch(initialQuery);
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', () => executeSearch(initialQuery));
    renderShell();
  }

  // =========================================================================
  // 8. TICKETS PAGE (Category Filters + Interactive Cart + Mobile Summary Bar)
  // =========================================================================
  function initTicketsPage() {
    const ticketCards = Array.from(document.querySelectorAll('article[data-ticket-id]'));
    const ticketsRoot = document.querySelector('.fod-tickets-workspace') || document.querySelector('.fod-mount');
    const cartPanel = document.getElementById('fod-ticket-cart');
    const mobileBar = document.getElementById('fod-mobile-cart-bar');

    if (!ticketCards.length && !cartPanel && !mobileBar) return;

    const core = C();
    const CART_STORAGE_KEY = 'festival_cart';
    const state = {
      filter: 'all',
      reviewOpen: false
    };

    function getLang() {
      return core && typeof core.getLang === 'function' ? core.getLang() : 'en';
    }

    function escapeText(str) {
      if (core && typeof core.escapeHtml === 'function') return core.escapeHtml(str);
      return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function formatItemsCount(count, isCs) {
      if (!isCs) return count === 1 ? '1 item' : `${count} items`;
      if (typeof window.formatCzPlural === 'function') {
        return `${count} ${window.formatCzPlural(count, 'položka', 'položky', 'položek')}`;
      }
      if (count === 1) return '1 položka';
      if (count >= 2 && count <= 4) return `${count} položky`;
      return `${count} položek`;
    }

    function readCart() {
      if (core && typeof core.getCart === 'function') {
        const list = core.getCart();
        return Array.isArray(list) ? list : [];
      }
      try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function writeCart(nextCart) {
      const normalized = Array.isArray(nextCart)
        ? nextCart
            .map(item => ({
              id: String(item.id || ''),
              qty: Math.max(0, parseInt(item.qty, 10) || 0),
              priceCzk: Number(item.priceCzk) || 0,
              category: String(item.category || ''),
              nameEn: String(item.nameEn || item.id || ''),
              nameCs: String(item.nameCs || item.nameEn || item.id || '')
            }))
            .filter(item => item.id && item.qty > 0)
        : [];

      if (core && typeof core.setCart === 'function') {
        core.setCart(normalized);
        return;
      }
      try {
        window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalized));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('festivalCartChanged', { detail: { items: normalized } }));
    }

    function getCardCatalog() {
      const map = new Map();
      ticketCards.forEach(card => {
        const id = card.getAttribute('data-ticket-id');
        if (!id) return;
        map.set(id, {
          id,
          priceCzk: Number(card.getAttribute('data-price-czk')) || 0,
          category: card.getAttribute('data-category') || 'all',
          nameEn: card.getAttribute('data-name-en') || id,
          nameCs: card.getAttribute('data-name-cs') || card.getAttribute('data-name-en') || id
        });
      });
      return map;
    }

    function setTicketQty(ticketId, deltaOrExact, isExact) {
      const catalog = getCardCatalog();
      const cart = readCart();
      const idx = cart.findIndex(item => item.id === ticketId);
      const meta = catalog.get(ticketId) || (idx >= 0 ? cart[idx] : null);
      if (!meta) return;

      const currentQty = idx >= 0 ? (parseInt(cart[idx].qty, 10) || 0) : 0;
      const nextQty = isExact ? Math.max(0, deltaOrExact) : Math.max(0, currentQty + deltaOrExact);

      if (nextQty === 0) {
        if (idx >= 0) cart.splice(idx, 1);
        if (cart.length === 0) state.reviewOpen = false;
      } else if (idx >= 0) {
        cart[idx] = {
          ...cart[idx],
          qty: nextQty,
          priceCzk: meta.priceCzk || cart[idx].priceCzk || 0,
          category: meta.category || cart[idx].category || '',
          nameEn: meta.nameEn || cart[idx].nameEn || ticketId,
          nameCs: meta.nameCs || cart[idx].nameCs || ticketId
        };
      } else {
        cart.push({
          id: ticketId,
          qty: nextQty,
          priceCzk: meta.priceCzk,
          category: meta.category,
          nameEn: meta.nameEn,
          nameCs: meta.nameCs
        });
      }

      writeCart(cart);
      renderAll();
    }

    function applyFilter() {
      const scope = ticketsRoot || document;
      scope.querySelectorAll('.fod-filter-row [data-filter]').forEach(chip => {
        const val = chip.getAttribute('data-filter') || 'all';
        const active = val === state.filter;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-pressed', String(active));
      });

      const targetFilter = state.filter.toLowerCase();
      ticketCards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').toLowerCase();
        const visible = targetFilter === 'all' || cat === targetFilter;
        card.classList.toggle('is-hidden', !visible);
      });

      scope.querySelectorAll('[data-category-section]').forEach(sec => {
        const secCat = (sec.getAttribute('data-category-section') || '').toLowerCase();
        const visible = targetFilter === 'all' || secCat === targetFilter;
        sec.classList.toggle('is-hidden', !visible);
      });
    }

    function renderCardActions() {
      const isCs = getLang() === 'cs';
      const cart = readCart();
      const qtyById = new Map(cart.map(item => [item.id, parseInt(item.qty, 10) || 0]));

      ticketCards.forEach(card => {
        const id = card.getAttribute('data-ticket-id');
        if (!id) return;
        let actionsBox = card.querySelector('.fod-ticket-card-actions');
        if (!actionsBox) {
          actionsBox = document.createElement('div');
          actionsBox.className = 'fod-ticket-card-actions';
          card.appendChild(actionsBox);
        }

        const qty = qtyById.get(id) || 0;
        const title = isCs
          ? (card.getAttribute('data-name-cs') || card.getAttribute('data-name-en') || id)
          : (card.getAttribute('data-name-en') || id);

        if (qty <= 0) {
          actionsBox.innerHTML = `
            <button type="button" class="fod-btn fod-btn-primary fod-btn-sm fod-ticket-add-btn" data-ticket-action="inc" data-ticket-id="${escapeText(id)}">
              ${isCs ? '+ Přidat do košíku' : '+ Add to Cart'}
            </button>
          `;
        } else {
          actionsBox.innerHTML = `
            <div class="fod-qty-stepper" role="group" aria-label="${escapeText(title)}">
              <button type="button" data-ticket-action="dec" data-ticket-id="${escapeText(id)}" aria-label="${isCs ? 'Snížit počet' : 'Decrease quantity'}">-</button>
              <span class="fod-qty-value" aria-live="polite">${qty}</span>
              <button type="button" data-ticket-action="inc" data-ticket-id="${escapeText(id)}" aria-label="${isCs ? 'Zvýšit počet' : 'Increase quantity'}">+</button>
            </div>
          `;
        }
      });
    }

    function renderCartPanel() {
      if (!cartPanel) return;
      const isCs = getLang() === 'cs';
      const catalog = getCardCatalog();
      const cart = readCart();

      const enriched = cart.map(item => {
        const meta = catalog.get(item.id) || {};
        const qty = parseInt(item.qty, 10) || 0;
        const priceCzk = Number(item.priceCzk || meta.priceCzk) || 0;
        const title = isCs
          ? (item.nameCs || meta.nameCs || item.nameEn || meta.nameEn || item.id)
          : (item.nameEn || meta.nameEn || item.id);
        return {
          id: item.id,
          qty,
          priceCzk,
          lineTotal: qty * priceCzk,
          title
        };
      }).filter(item => item.qty > 0);

      const totalCount = enriched.reduce((sum, item) => sum + item.qty, 0);
      const subtotalCzk = enriched.reduce((sum, item) => sum + item.lineTotal, 0);
      const eurApprox = Math.round(subtotalCzk / 25);

      if (enriched.length === 0) {
        cartPanel.innerHTML = `
          <div class="fod-cart-head">
            <h2>${isCs ? 'Košík vstupenek' : 'Ticket Cart'}</h2>
            <span class="fod-badge">${formatItemsCount(0, isCs)}</span>
          </div>
          <p class="fod-cart-empty">
            ${isCs ? 'Váš košík je zatím prázdný. Vyberte vstupenku nebo kemp výše.' : 'Your cart is empty. Select a pass or camping option above.'}
          </p>
        `;
        return;
      }

      cartPanel.innerHTML = `
        <div class="fod-cart-head">
          <h2>${isCs ? 'Košík vstupenek' : 'Ticket Cart'} (${totalCount})</h2>
          <button type="button" class="fod-btn fod-btn-secondary fod-btn-sm" data-ticket-action="clear">
            ${isCs ? 'Vyprázdnit košík' : 'Clear Cart'}
          </button>
        </div>

        <ul class="fod-cart-list">
          ${enriched.map(item => `
            <li class="fod-cart-line">
              <div class="fod-cart-line-info">
                <strong>${escapeText(item.title)}</strong>
                <span class="fod-card-meta">${item.priceCzk.toLocaleString()} CZK / ${isCs ? 'ks' : 'ea'}</span>
              </div>
              <div class="fod-cart-line-controls">
                <div class="fod-qty-stepper">
                  <button type="button" data-ticket-action="dec" data-ticket-id="${escapeText(item.id)}" aria-label="${isCs ? 'Snížit počet' : 'Decrease quantity'}">-</button>
                  <span class="fod-qty-value">${item.qty}</span>
                  <button type="button" data-ticket-action="inc" data-ticket-id="${escapeText(item.id)}" aria-label="${isCs ? 'Zvýšit počet' : 'Increase quantity'}">+</button>
                </div>
                <strong class="fod-cart-line-total">${item.lineTotal.toLocaleString()} CZK</strong>
                <button type="button" class="fod-btn fod-btn-secondary fod-btn-sm" data-ticket-action="remove" data-ticket-id="${escapeText(item.id)}">
                  ${isCs ? 'Odebrat' : 'Remove'}
                </button>
              </div>
            </li>
          `).join('')}
        </ul>

        <div class="fod-cart-summary">
          <div class="fod-cart-subtotal-row">
            <span>${isCs ? 'Mezisoučet' : 'Subtotal'}</span>
            <strong>${subtotalCzk.toLocaleString()} CZK</strong>
          </div>
          <p class="fod-card-meta">
            ${isCs ? `Orientační přepočet: ~${eurApprox.toLocaleString()} EUR` : `Estimated equivalent: ~${eurApprox.toLocaleString()} EUR`}
          </p>
        </div>

        <div class="fod-card-actions">
          <button type="button" class="fod-btn fod-btn-primary" data-ticket-action="toggle-review" aria-expanded="${state.reviewOpen}">
            ${isCs ? 'Zkontrolovat souhrn objednávky' : 'Review Order Summary'}
          </button>
        </div>

        ${state.reviewOpen ? `
          <div class="fod-order-confirm" role="status">
            <p><strong>${isCs ? 'Souhrn ukázkové objednávky:' : 'Demo Order Summary:'}</strong> ${formatItemsCount(totalCount, isCs)} · ${subtotalCzk.toLocaleString()} CZK (~${eurApprox.toLocaleString()} EUR)</p>
            <p>${isCs ? 'Souhrn ukázkové objednávky je připraven. Platební brána bude spuštěna v příští verzi.' : 'Demo order summary ready. Payment checkout opens in the next release.'}</p>
          </div>
        ` : ''}
      `;
    }

    function renderMobileBar() {
      if (!mobileBar) return;
      const isCs = getLang() === 'cs';
      const catalog = getCardCatalog();
      const cart = readCart();

      const totalCount = cart.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);
      const subtotalCzk = cart.reduce((sum, item) => {
        const meta = catalog.get(item.id) || {};
        const qty = parseInt(item.qty, 10) || 0;
        const price = Number(item.priceCzk || meta.priceCzk) || 0;
        return sum + qty * price;
      }, 0);

      const isEmpty = totalCount === 0;
      mobileBar.classList.toggle('is-empty', isEmpty);
      mobileBar.hidden = isEmpty;

      if (isEmpty) {
        mobileBar.innerHTML = '';
        return;
      }

      mobileBar.innerHTML = `
        <span class="fod-mobile-cart-summary">${formatItemsCount(totalCount, isCs)} · ${subtotalCzk.toLocaleString()} CZK</span>
        <a href="#fod-ticket-cart" class="fod-btn fod-btn-primary fod-btn-sm">
          ${isCs ? 'Zobrazit košík' : 'Review Cart'}
        </a>
      `;
    }

    function renderAll() {
      applyFilter();
      renderCardActions();
      renderCartPanel();
      renderMobileBar();
    }

    document.addEventListener('click', e => {
      const filterBtn = e.target && e.target.closest && e.target.closest('.fod-filter-row [data-filter]');
      if (filterBtn && (!ticketsRoot || ticketsRoot.contains(filterBtn))) {
        state.filter = filterBtn.getAttribute('data-filter') || 'all';
        applyFilter();
        return;
      }

      const actionBtn = e.target && e.target.closest && e.target.closest('[data-ticket-action]');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-ticket-action');
      const ticketId = actionBtn.getAttribute('data-ticket-id');

      if (action === 'inc' && ticketId) {
        setTicketQty(ticketId, 1, false);
      } else if (action === 'dec' && ticketId) {
        setTicketQty(ticketId, -1, false);
      } else if (action === 'remove' && ticketId) {
        setTicketQty(ticketId, 0, true);
      } else if (action === 'clear') {
        state.reviewOpen = false;
        writeCart([]);
        renderAll();
      } else if (action === 'toggle-review') {
        state.reviewOpen = !state.reviewOpen;
        renderCartPanel();
      }
    });

    window.addEventListener('languageChanged', renderAll);
    window.addEventListener('festivalCartChanged', renderAll);
    renderAll();
  }

  // =========================================================================
  // BOOTSTRAP BY CURRENT PAGE
  // =========================================================================
  function bootPages() {
    initProgramPage();
    initArtistsPage();
    initArtistDetailPage();
    initStagesPage();
    initPracticalInfoPage();
    initMySchedulePage();
    initSearchPage();
    initTicketsPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPages);
  } else {
    bootPages();
  }
})();
