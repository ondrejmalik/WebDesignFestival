// shared/js/festival-pages.js - Unified interactive page controllers for all 11 designs
(function () {
  'use strict';

  function C() { return window.FESTIVAL_CORE; }
  function D() { return window.FESTIVAL_DATA; }

  // =========================================================================
  // 1. PROGRAM PAGE (60-set timetable, Day/Stage/Genre/Fav/Search filters)
  // =========================================================================
  function initProgramPage() {
    const root = document.getElementById('fod-program-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    const state = {
      day: 'all',
      stage: 'all',
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
      const hl = params.get('highlight') || window.location.hash.replace('#', '');
      if (hl && /^perf-\d+$/i.test(hl)) state.highlightId = hl.toLowerCase();
    } catch (e) {}

    function getFilteredPerformers() {
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const q = core.normalizeStr(state.query.trim());
      return data.PERFORMERS.filter(p => {
        if (state.day !== 'all' && p.dayKey !== state.day) return false;
        if (state.stage !== 'all' && p.stageKey !== state.stage) return false;
        if (state.genre !== 'all' && !core.matchesGenreFilter(p.genre, state.genre)) return false;
        if (state.onlyFavs && !favIds.has(p.id)) return false;
        if (q) {
          const hay = core.normalizeStr(`${p.name} ${p.genre} ${p.stage} ${p.origin} ${p.time}`);
          if (!hay.includes(q)) return false;
        }
        return true;
      });
    }

    function renderShell() {
      const isCs = core.getLang() === 'cs';
      const favCount = core.getFavorites().length;
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
        <div class="fod-toolbar-panel">
          <div class="fod-plan-summary-row">
            <div class="fod-plan-summary-left">
              <span class="fod-pill-stat">
                <strong id="fav-count">${favCount}</strong>
                <span id="fod-prog-fav-label">${isCs ? 'uloženo v Mém plánu' : 'saved in My Schedule'}</span>
              </span>
              <span class="fod-status-text" id="filter-status-text" aria-live="polite"></span>
            </div>
            <div class="fod-plan-summary-actions">
              <button type="button" id="quick-lunar-btn" class="fod-btn fod-btn-accent">
                ${isCs ? 'Prší? Krytý Lunar Dome (Den 1)' : 'Rain Shelter: Lunar Dome (Day 1)'}
              </button>
              <a href="my-schedule.html" class="fod-btn fod-btn-primary">
                ${isCs ? 'Otevřít Můj plán' : 'Open My Schedule'} (<span class="fav-count-badge">${favCount}</span>)
              </a>
              <button type="button" id="clear-favorites-btn" class="fod-btn fod-btn-ghost">
                ${isCs ? 'Vymazat oblíbené' : 'Clear Saved'}
              </button>
            </div>
          </div>

          <div class="fod-filter-stack">
            <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle dne' : 'Filter by day'}">
              <button type="button" class="fod-chip ${state.day === 'all' ? 'is-active' : ''}" data-filter-day="all">${isCs ? 'Všechny dny (60)' : 'All Days (60)'}</button>
              <button type="button" class="fod-chip ${state.day === 'day1' ? 'is-active' : ''}" data-filter-day="day1">${isCs ? 'Den 1 · Pá 10. 7.' : 'Day 1 · Fri 10 Jul'}</button>
              <button type="button" class="fod-chip ${state.day === 'day2' ? 'is-active' : ''}" data-filter-day="day2">${isCs ? 'Den 2 · So 11. 7.' : 'Day 2 · Sat 11 Jul'}</button>
              <button type="button" class="fod-chip ${state.day === 'day3' ? 'is-active' : ''}" data-filter-day="day3">${isCs ? 'Den 3 · Ne 12. 7.' : 'Day 3 · Sun 12 Jul'}</button>
            </div>

            <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle pódia' : 'Filter by stage'}">
              <button type="button" class="fod-chip ${state.stage === 'all' ? 'is-active' : ''}" data-filter-stage="all">${isCs ? 'Všechna pódia' : 'All Stages'}</button>
              <button type="button" class="fod-chip ${state.stage === 'solar' ? 'is-active' : ''}" data-filter-stage="solar">Solar Horizon Stage</button>
              <button type="button" class="fod-chip ${state.stage === 'lunar' ? 'is-active' : ''}" data-filter-stage="lunar">Lunar Forest Dome</button>
              <button type="button" id="filter-fav-only" class="fod-chip fod-chip-fav ${state.onlyFavs ? 'is-active' : ''}" aria-pressed="${state.onlyFavs}">
                ${isCs ? '★ Jen moje oblíbené' : '★ My Favourites Only'}
              </button>
            </div>

            <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Filtrovat podle žánru' : 'Filter by genre'}">
              ${genres.map(g => `
                <button type="button" class="fod-chip ${state.genre === g.key ? 'is-active' : ''}" data-filter-genre="${g.key}">
                  ${isCs ? g.cs : g.en}
                </button>
              `).join('')}
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
        </div>

        <div id="fod-program-days"></div>
      `;

      bindShellEvents();
      renderDays();
    }

    function renderDays() {
      const daysContainer = document.getElementById('fod-program-days');
      const statusEl = document.getElementById('filter-status-text');
      if (!daysContainer) return;

      const isCs = core.getLang() === 'cs';
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const matched = getFilteredPerformers();

      if (statusEl) {
        const total = data.PERFORMERS.length;
        const stageLabel = state.stage === 'lunar'
          ? ' (Lunar Forest Dome)'
          : (state.stage === 'solar' ? ' (Solar Horizon Stage)' : '');
        statusEl.textContent = isCs
          ? `Zobrazeno ${matched.length} z ${total} vystoupení${stageLabel}`
          : `Showing ${matched.length} of ${total} shows${stageLabel}`;
      }

      if (matched.length === 0) {
        daysContainer.innerHTML = `
          <div class="fod-empty-card">
            <h3>${isCs ? 'Žádná vystoupení neodpovídají vybraným filtrům' : 'No shows match the active filters'}</h3>
            <p>${isCs ? 'Zkuste upravit den, pódium, žánr nebo vyhledávací dotaz.' : 'Try adjusting day, stage, genre, or search query.'}</p>
            <button type="button" class="fod-btn fod-btn-primary" id="fod-prog-reset-btn">
              ${isCs ? 'Resetovat všechny filtry' : 'Reset All Filters'}
            </button>
          </div>
        `;
        const resetBtn = document.getElementById('fod-prog-reset-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            state.day = 'all';
            state.stage = 'all';
            state.genre = 'all';
            state.onlyFavs = false;
            state.query = '';
            renderShell();
          });
        }
        return;
      }

      function getNormalizedHour(startStr) {
        const h = parseInt(String(startStr || '0').split(':')[0], 10) || 0;
        return h < 8 ? h + 24 : h;
      }

      function formatHourSlotLabel(normHour) {
        const startH = normHour >= 24 ? normHour - 24 : normHour;
        const endH = (startH + 1) % 24;
        return `${String(startH).padStart(2, '0')}:00 - ${String(endH).padStart(2, '0')}:00`;
      }

      function renderPerformerCard(p) {
        const isFav = favIds.has(p.id);
        const stageCls = p.stageKey === 'lunar' ? 'is-lunar' : 'is-solar';
        const hlCls = state.highlightId === p.id ? 'spot-highlight' : '';
        return `
          <article class="fod-timetable-card ${stageCls} ${isFav ? 'is-saved' : ''} ${hlCls}" id="${p.id}" data-id="${p.id}">
            <div class="fod-timetable-card-top">
              <span class="fod-slot-time">${core.escapeHtml(p.time)}</span>
              <span class="fod-stage-pill ${stageCls}">${core.escapeHtml(p.stage)}</span>
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
            <div class="fod-slot-actions">
              <a href="artist-detail.html?id=${p.id}&from=program#${p.id}" class="fod-btn fod-btn-ghost fod-btn-sm">
                Detail<span class="fod-sr-only"> (${core.escapeHtml(p.name)})</span>
              </a>
              <button type="button" class="fod-btn fod-btn-sm fav-toggle-btn ${isFav ? 'is-saved' : ''}" data-perf-id="${p.id}" aria-pressed="${isFav}">
                ${isFav ? (isCs ? '✓ V plánu' : '✓ In Plan') : (isCs ? '+ Přidat' : '+ Add')}<span class="fod-sr-only"> (${core.escapeHtml(p.name)})</span>
              </button>
            </div>
          </article>
        `;
      }

      function renderEmptySlotCell() {
        const hasSecondaryFilter = state.genre !== 'all' || state.onlyFavs || state.query.trim() !== '';
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
          const hourLabel = formatHourSlotLabel(bucket.normHour);

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
          root.querySelectorAll('[data-filter-day]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderDays();
        });
      });

      root.querySelectorAll('[data-filter-stage]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.stage = btn.getAttribute('data-filter-stage');
          root.querySelectorAll('[data-filter-stage]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderDays();
        });
      });

      root.querySelectorAll('[data-filter-genre]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.genre = btn.getAttribute('data-filter-genre');
          root.querySelectorAll('[data-filter-genre]').forEach(b => b.classList.toggle('is-active', b === btn));
          renderDays();
        });
      });

      const favOnlyBtn = document.getElementById('filter-fav-only');
      if (favOnlyBtn) {
        favOnlyBtn.addEventListener('click', () => {
          state.onlyFavs = !state.onlyFavs;
          favOnlyBtn.classList.toggle('is-active', state.onlyFavs);
          favOnlyBtn.setAttribute('aria-pressed', String(state.onlyFavs));
          renderDays();
        });
      }

      const searchInput = document.getElementById('artist-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', e => {
          state.query = e.target.value;
          renderDays();
        });
      }

      const clearSearchBtn = document.getElementById('clear-search-btn');
      if (clearSearchBtn && searchInput) {
        clearSearchBtn.addEventListener('click', () => {
          state.query = '';
          searchInput.value = '';
          renderDays();
          searchInput.focus();
        });
      }

      const quickLunarBtn = document.getElementById('quick-lunar-btn');
      if (quickLunarBtn) {
        quickLunarBtn.addEventListener('click', () => {
          state.stage = 'lunar';
          state.day = 'day1';
          state.genre = 'all';
          state.onlyFavs = false;
          state.query = '';
          renderShell();
          const sec = document.getElementById('program-day1');
          if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    root.addEventListener('click', e => {
      const btn = e.target && e.target.closest && e.target.closest('.fav-toggle-btn[data-perf-id]');
      if (!btn) return;
      const id = btn.getAttribute('data-perf-id');
      if (!id) return;
      core.toggleFavoriteById(id);
      renderDays();
      const fc = document.getElementById('fav-count');
      if (fc) fc.textContent = String(core.getFavorites().length);
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', () => {
      const fc = document.getElementById('fav-count');
      if (fc) fc.textContent = String(core.getFavorites().length);
      renderDays();
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

    function getFilteredArtists() {
      const favIds = new Set(core.getFavorites().map(f => f.id));
      const q = core.normalizeStr(state.query.trim());
      return data.PERFORMERS.filter(p => {
        if (state.day !== 'all' && p.dayKey !== state.day) return false;
        if (state.genre !== 'all' && !core.matchesGenreFilter(p.genre, state.genre)) return false;
        if (state.onlyFavs && !favIds.has(p.id)) return false;
        if (q) {
          const country = data.COUNTRIES[p.origin] || { en: '', cs: '' };
          const hay = core.normalizeStr(`${p.name} ${p.genre} ${p.origin} ${country.en} ${country.cs} ${p.stage} ${p.bioEn} ${p.bioCs}`);
          if (!hay.includes(q)) return false;
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
              <img src="../../../shared/img/artist-placeholder-${p.stageKey}.svg" alt="${core.escapeHtml(thumbAlt)}" width="400" height="225">
              <span class="fod-artist-monogram" aria-hidden="true">${core.escapeHtml(initials)}</span>
            </figure>
            <div class="fod-card-top">
              <span class="fod-stage-pill ${stageCls}">${core.escapeHtml(p.stage)}</span>
              <span class="fod-origin-pill" title="${core.escapeHtml(country)}">${core.escapeHtml(p.origin)}</span>
            </div>
            <h2 class="fod-card-title">
              <a href="artist-detail.html?id=${p.id}&from=artists#${p.id}">${core.escapeHtml(p.name)}</a>
            </h2>
            <p class="fod-card-meta">${core.escapeHtml(p.genre)} · ${core.escapeHtml(dayShort)} · ${core.escapeHtml(p.time)}</p>
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

    root.addEventListener('click', e => {
      const btn = e.target && e.target.closest && e.target.closest('.artist-fav-btn[data-perf-id]');
      if (!btn) return;
      core.toggleFavoriteById(btn.getAttribute('data-perf-id'));
      const fc = document.getElementById('artists-fav-count');
      if (fc) fc.textContent = String(core.getFavorites().length);
      renderGrid();
    });

    window.addEventListener('languageChanged', renderShell);
    window.addEventListener('favoritesUpdated', () => {
      const fc = document.getElementById('artists-fav-count');
      if (fc) fc.textContent = String(core.getFavorites().length);
      renderGrid();
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
          <p class="fod-detail-sub">${core.escapeHtml(artist.genre)} · ${core.escapeHtml(dayLabel)} · ${core.escapeHtml(artist.time)}</p>
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
                <dd>${core.escapeHtml(artist.time)}</dd>
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

    function render() {
      const isCs = core.getLang() === 'cs';
      const solar = data.STAGES.solar;
      const lunar = data.STAGES.lunar;
      const hasArtistsOnPage = Boolean(document.getElementById('fod-artists-root'));

      root.innerHTML = `
        <div class="fod-merged-section-head">
          <h2>${isCs ? 'Pódia a areál' : 'Stages & Grounds'}</h2>
          ${hasArtistsOnPage ? `
            <a href="#fod-artists-root" class="fod-btn fod-btn-secondary fod-btn-sm">
              ${isCs ? 'Přejít na účinkující' : 'Jump to Artists'}
            </a>
          ` : ''}
        </div>

        <div class="fod-stages-grid">
          <section class="fod-panel fod-stage-card" id="stage-solar">
            <figure class="fod-stage-photo">
              <img src="../../../shared/img/stage-solar.jpg" alt="${isCs ? 'Ilustrační fotografie venkovního amfiteátru Solar Horizon Stage při západu slunce' : 'Placeholder photo of the open-air Solar Horizon Stage amphitheater at sunset'}" width="1280" height="720">
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
            <div class="fod-card-actions">
              <a href="program.html?stage=solar" class="fod-btn fod-btn-primary">${isCs ? 'Otevřít v Programu' : 'Open Solar Schedule'}</a>
            </div>
          </section>

          <section class="fod-panel fod-stage-card" id="stage-lunar">
            <figure class="fod-stage-photo">
              <img src="../../../shared/img/stage-lunar.jpg" alt="${isCs ? 'Ilustrační fotografie kryté kupole Lunar Forest Dome v lese za soumraku' : 'Placeholder photo of the covered Lunar Forest Dome marquee in the forest at twilight'}" width="1280" height="720">
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
            <div class="fod-card-actions">
              <a href="program.html?stage=lunar" class="fod-btn fod-btn-primary">${isCs ? 'Otevřít v Programu' : 'Open Lunar Schedule'}</a>
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

    window.addEventListener('hashchange', highlightStageFromHash);
    window.addEventListener('languageChanged', render);
    render();
  }

  // =========================================================================
  // 5. PRACTICAL INFO PAGE (Bilingual content + Interactive SVG Route Map)
  // =========================================================================
  function initPracticalInfoPage() {
    const root = document.getElementById('fod-practical-root');
    if (!root || !C()) return;

    const core = C();
    let activeRoute = 'all';

    function setMapRoute(type) {
      activeRoute = type || 'all';
      root.querySelectorAll('.route-bus-group').forEach(el => {
        el.classList.toggle('is-dimmed', activeRoute !== 'all' && activeRoute !== 'bus');
      });
      root.querySelectorAll('.route-walk-group').forEach(el => {
        el.classList.toggle('is-dimmed', activeRoute !== 'all' && activeRoute !== 'walk');
      });
      root.querySelectorAll('[data-route-filter]').forEach(btn => {
        btn.classList.toggle('is-active', btn.getAttribute('data-route-filter') === activeRoute);
      });
    }
    window.setMapRoute = setMapRoute;

    function render() {
      const isCs = core.getLang() === 'cs';
      root.innerHTML = `
        <form action="search.html" method="get" class="fod-toolbar-panel fod-search-row" role="search">
          <label for="info-search-input" class="fod-sr-only">${isCs ? 'Vyhledat na festivalu' : 'Search festival'}</label>
          <input type="search" id="info-search-input" name="q" class="fod-input"
            placeholder="${isCs ? 'Hledat interprety, pódia, shuttle bus, kemp nebo FAQ...' : 'Search artists, stages, shuttle bus, camping, or FAQ...'}">
          <button type="submit" class="fod-btn fod-btn-primary">${isCs ? 'Hledat' : 'Search'}</button>
          <a href="my-schedule.html" class="fod-btn fod-btn-secondary">${isCs ? 'Můj plán' : 'My Schedule'}</a>
        </form>

        <nav class="fod-filter-row fod-info-nav" aria-label="${isCs ? 'Sekce praktických informací' : 'Practical Info Sections'}">
          <a href="#parametry" class="fod-chip">${isCs ? 'Parametry 2026' : '2026 Key Facts'}</a>
          <a href="#doprava" class="fod-chip">${isCs ? 'Doprava a mapa' : 'Transit & Map'}</a>
          <a href="#shuttle-bus" class="fod-chip">${isCs ? 'Jízdní řád Shuttle' : 'Shuttle Timetable'}</a>
          <a href="#pesi-trasa" class="fod-chip">${isCs ? 'Pěší trasa' : 'Walking Route'}</a>
          <a href="#kemp" class="fod-chip">${isCs ? 'Kempování' : 'Camping'}</a>
          <a href="#cashless" class="fod-chip">${isCs ? 'Cashless & Bezpečí' : 'Cashless & Safety'}</a>
          <a href="#faq" class="fod-chip">FAQ</a>
        </nav>

        <section class="fod-panel" id="parametry">
          <h2>${isCs ? 'Klíčové parametry ročníku 2026' : 'Key Parameters of the 2026 Edition'}</h2>
          <div class="fod-info-grid">
            <article class="fod-sub-card">
              <h3>${isCs ? '3 festivalové dny' : '3 Festival Days'}</h3>
              <p>${isCs ? 'Pátek 10. 7., sobota 11. 7., neděle 12. 7. 2026 (areál otevřen od 13:00 do 04:00).' : 'Friday July 10, Saturday July 11, Sunday July 12, 2026 (grounds open 13:00 to 04:00).'}</p>
            </article>
            <article class="fod-sub-card">
              <h3>${isCs ? '2 odlišná pódia' : '2 Distinct Stages'}</h3>
              <p>${isCs ? 'Solar Horizon Stage (venkovní amfiteátr, 4 500 míst) a krytý Lunar Forest Dome (1 800 míst).' : 'Solar Horizon Stage (open-air amphitheater, 4,500 cap) and covered Lunar Forest Dome (1,800 cap).'}</p>
            </article>
            <article class="fod-sub-card">
              <h3>${isCs ? '60 živých vystoupení' : '60 Live Performances'}</h3>
              <p>${isCs ? 'Kurátorovaný mezinárodní program elektroniky, post-rocku, indie, techna a audiovizuálních setů.' : 'Curated international lineup of electronic, post-rock, indie, techno, and audiovisual sets.'}</p>
            </article>
          </div>
        </section>

        <section class="fod-panel" id="doprava">
          <h2>${isCs ? 'Doprava z nádraží Kutná Hora a mapa trasy' : 'Transit from Kutná Hora Station & Route Map'}</h2>
          <div class="fod-info-grid">
            <article class="fod-sub-card" id="shuttle-bus">
              <h3>${isCs ? 'Kyvadlový Shuttle Bus (ZDARMA)' : 'Festival Shuttle Bus (FREE)'}</h3>
              <p>${isCs
                ? 'Bezplatná kyvadlová linka z hlavního nádraží Kutná Hora hl.n. přímo k Hlavní bráně (Vstup A). Jezdí každých 10 až 15 minut po celý den i v noci (doba jízdy 7 minut). Garance návaznosti na rychlíky R9 z Prahy a Brna.'
                : 'Free festival shuttle bus connecting Kutná Hora main railway station directly to Venue Entrance A. Departs every 10 to 15 minutes day and night (7 min travel time). Guaranteed sync with R9 express trains from Prague & Brno.'}</p>
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
                    <tr><td>${isCs ? 'Pá 10. 7.' : 'Fri Jul 10'}</td><td>11:30–04:00</td><td>${isCs ? '10–15 min' : '10–15 min'}</td></tr>
                    <tr><td>${isCs ? 'So 11. 7.' : 'Sat Jul 11'}</td><td>12:00–04:00</td><td>15 min</td></tr>
                    <tr><td>${isCs ? 'Ne 12. 7.' : 'Sun Jul 12'}</td><td>12:00–03:30</td><td>15 min</td></tr>
                    <tr><td>${isCs ? 'Po 13. 7. (Odjezdy)' : 'Mon Jul 13 (Departures)'}</td><td>07:00–13:00</td><td>15–20 min</td></tr>
                  </tbody>
                </table>
              </div>
            </article>
            <article class="fod-sub-card" id="pesi-trasa">
              <h3>${isCs ? 'Značená pěší trasa (1,8 km, 22–25 min)' : 'Marked Walking Route (1.8 km, 22–25 min)'}</h3>
              <p>${isCs
                ? 'Osvětlená pěší trasa osazená žlutými reflexními směrovkami z nádraží až ke Vstupu A:'
                : 'Illuminated walking corridor marked with yellow reflective signs from the station straight to Entrance A:'}</p>
              <ol class="fod-feature-list">
                <li>${isCs ? 'Kutná Hora hl. n. (0,0 km): vyjděte před nádraží a držte se vlevo do ulice Nádražní.' : 'Kutná Hora Main Station (0.0 km): exit straight onto the plaza and follow Nádražní St.'}</li>
                <li>${isCs ? 'Nádražní → Křižovatka Sedlec (0,1–0,7 km): rovně kolem viaduktu ke Katedrále.' : 'Nádražní → Sedlec Junction (0.1–0.7 km): continue past the viaduct to the Cathedral.'}</li>
                <li>${isCs ? 'Kolem Sedlecké kostnice do Zámecké (0,7–1,2 km): odbočte vpravo do Vítězné, poté vlevo do Zámecké.' : 'Past Sedlec Ossuary into Zámecká St (0.7–1.2 km): turn right on Vítězná, then left into Zámecká.'}</li>
                <li>${isCs ? 'Lávka přes Vrchlici (1,2–1,6 km): osvětlená festivalová lávka do klidové zóny.' : 'Vrchlice Footbridge (1.2–1.6 km): cross the lit festival footbridge into the venue sector.'}</li>
                <li>${isCs ? 'Hlavní brána – Vstup A (1,8 km): pokladna, RFID pásky a turniketový vstup.' : 'Main Gate – Entrance A (1.8 km): box office, RFID wristbands, and main entry.'}</li>
              </ol>
            </article>
            <article class="fod-sub-card">
              <h3>${isCs ? 'Auto a Parkoviště P1' : 'Arrival by Car & Parking P1'}</h3>
              <p>${isCs
                ? 'Centrální parkoviště P1 na okraji Kutné Hory má kapacitu 800 vozidel (100 Kč / den). Z parkoviště vede značená cesta přímo ke Vstupu A (400 m, cca 5 minut chůze).'
                : 'Central Parking Lot P1 offers 800 spaces (100 CZK / day) with a marked pedestrian path leading directly to Entrance A (400 m, approx. 5 min walk).'}</p>
            </article>
          </div>

          <div class="fod-map-box" id="mapa-trasy">
            <div class="fod-map-toolbar">
              <strong>${isCs ? 'Interaktivní mapa trasy: Nádraží -> Areál' : 'Interactive Route Map: Station -> Venue'}</strong>
              <div class="fod-filter-row" role="group" aria-label="${isCs ? 'Zvýraznit trasu' : 'Highlight route'}">
                <button type="button" class="fod-chip ${activeRoute === 'all' ? 'is-active' : ''}" data-route-filter="all">${isCs ? 'Všechny trasy' : 'All Routes'}</button>
                <button type="button" class="fod-chip ${activeRoute === 'bus' ? 'is-active' : ''}" data-route-filter="bus">${isCs ? 'Shuttle Bus (7 min)' : 'Shuttle Bus (7 min)'}</button>
                <button type="button" class="fod-chip ${activeRoute === 'walk' ? 'is-active' : ''}" data-route-filter="walk">${isCs ? 'Pěší trasa (1,8 km)' : 'Walking Route (1.8 km)'}</button>
              </div>
            </div>

            <svg viewBox="0 0 880 340" class="fod-route-svg" role="img" aria-label="${isCs ? 'Mapa trasy z hlavního nádraží Kutná Hora do festivalového areálu' : 'Route map from Kutná Hora main station to the festival grounds'}">
              <rect x="0" y="0" width="880" height="340" rx="12" class="fod-svg-bg"/>
              <g>
                <rect x="24" y="105" width="180" height="120" rx="8" class="fod-svg-node"/>
                <text x="114" y="138" text-anchor="middle" class="fod-svg-title">${isCs ? 'Kutná Hora hl.n.' : 'Kutná Hora Station'}</text>
                <text x="114" y="160" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Příjezd vlaků (Praha 55m)' : 'Train Arrival (Prague 55m)'}</text>
                <text x="114" y="182" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Nástupiště Shuttle Busu' : 'Shuttle Bus Stop'}</text>
              </g>
              <g class="route-bus-group">
                <path d="M 204 135 Q 440 25 685 135" fill="none" class="fod-svg-bus-path"/>
                <rect x="330" y="26" width="230" height="28" rx="6" class="fod-svg-bus-badge"/>
                <text x="445" y="45" text-anchor="middle" class="fod-svg-bus-text">${isCs ? 'Shuttle Bus: 7 min (Zdarma)' : 'Shuttle Bus: 7 min (Free)'}</text>
              </g>
              <g>
                <rect x="285" y="185" width="165" height="82" rx="8" class="fod-svg-node"/>
                <text x="367" y="214" text-anchor="middle" class="fod-svg-title">${isCs ? 'Sedlec a Kostnice' : 'Sedlec & Ossuary'}</text>
                <text x="367" y="234" text-anchor="middle" class="fod-svg-sub">0.7 km · ${isCs ? 'Značená trasa' : 'Signposted'}</text>
                <rect x="495" y="190" width="150" height="74" rx="8" class="fod-svg-node"/>
                <text x="570" y="218" text-anchor="middle" class="fod-svg-title">${isCs ? 'Lávka Vrchlice' : 'Vrchlice Footbridge'}</text>
                <text x="570" y="238" text-anchor="middle" class="fod-svg-sub">1.4 km · ${isCs ? 'Osvětlený koridor' : 'Lit Corridor'}</text>
              </g>
              <g class="route-walk-group">
                <path d="M 204 185 L 285 220 M 450 225 L 495 225 M 645 220 L 685 175" fill="none" class="fod-svg-walk-path"/>
                <rect x="305" y="288" width="280" height="28" rx="6" class="fod-svg-walk-badge"/>
                <text x="445" y="307" text-anchor="middle" class="fod-svg-walk-text">${isCs ? 'Pěší trasa: 1,8 km (22-25 min)' : 'Walking Route: 1.8 km (22-25 min)'}</text>
              </g>
              <g>
                <rect x="685" y="96" width="172" height="145" rx="8" class="fod-svg-venue"/>
                <text x="771" y="128" text-anchor="middle" class="fod-svg-title">${isCs ? 'Vstup A · Areál' : 'Entrance A · Venue'}</text>
                <text x="771" y="150" text-anchor="middle" class="fod-svg-sub">${isCs ? 'Akreditace & Úschovna' : 'Wristbands & Lockers'}</text>
                <text x="771" y="182" text-anchor="middle" class="fod-svg-sub">Solar Horizon (4,500)</text>
                <text x="771" y="204" text-anchor="middle" class="fod-svg-sub">Lunar Dome (1,800 · ${isCs ? 'Kryté' : 'Covered'})</text>
              </g>
            </svg>
          </div>
        </section>

        <section class="fod-panel" id="kemp">
          <h2>${isCs ? 'Stanové městečko a ubytování' : 'Camping & Accommodation'}</h2>
          <p>${isCs
            ? 'Stanové městečko leží přímo u areálu (300 m od Vstupu A) a je vybaveno teplými sprchami, pitnou vodou, sociálním zázemím a nonstop recepcí. Otevřeno od pátku 10:00 do pondělí 12:00.'
            : 'The official festival campsite sits 300 m from Entrance A with hot showers, drinking water, sanitation, and 24/7 reception. Open Friday 10:00 through Monday 12:00.'}</p>
        </section>

        <section class="fod-panel" id="cashless">
          <h2>${isCs ? 'Cashless systém, úschovna a zdravotní péče' : 'Cashless RFID, Lockers & First Aid'}</h2>
          <div class="fod-info-grid">
            <article class="fod-sub-card">
              <h3>${isCs ? '100% Cashless RFID náramek' : '100% Cashless RFID Wristband'}</h3>
              <p>${isCs
                ? 'Všude v areálu platíte čipem na náramku. Dobití zdarma online předem nebo na místě hotově i kartou.'
                : 'All bars and food stalls operate strictly via RFID wristband. Free top-ups online or on-site by card or cash.'}</p>
            </article>
            <article class="fod-sub-card">
              <h3>${isCs ? 'Úschovna zavazadel a skříňky 230V' : 'Lockers & 230V Charging'}</h3>
              <p>${isCs
                ? 'Bezpečnostní skříňky se zásuvkami 230V pro nabíjení telefonů jsou umístěny ihned vedle Vstupu A.'
                : 'Secure storage lockers with built-in 230V power sockets are located right beside Entrance A accreditation.'}</p>
            </article>
            <article class="fod-sub-card">
              <h3>${isCs ? 'Zdravotnická služba 24/7' : '24/7 Medical & Welfare'}</h3>
              <p>${isCs
                ? 'Stanoviště Červeného kříže s nepřetržitou péčí se nachází mezi Lunar Forest Dome a Vstupem A.'
                : 'Red Cross medical station providing round-the-clock care sits between Lunar Forest Dome and Entrance A.'}</p>
            </article>
          </div>
        </section>

        <section class="fod-panel" id="faq">
          <h2>${isCs ? 'Často kladené otázky (FAQ)' : 'Frequently Asked Questions (FAQ)'}</h2>
          <div class="fod-faq-list">
            <details class="fod-faq-item" open>
              <summary>${isCs ? 'Co se stane v případě prudkého deště?' : 'What happens if it rains heavily?'}</summary>
              <p>${isCs
                ? 'Festival probíhá za každého počasí. Kryté pódium Lunar Forest Dome poskytuje zastřešený prostor pro 1 800 návštěvníků s nepřerušeným hudebním programem.'
                : 'The festival runs in all weather. Lunar Forest Dome provides a solid covered shelter for 1,800 visitors with uninterrupted live performances.'}</p>
            </details>
            <details class="fod-faq-item">
              <summary>${isCs ? 'Je shuttle bus z hlavního nádraží zpoplatněn?' : 'Is the shuttle bus from the train station free?'}</summary>
              <p>${isCs
                ? 'Ne, kyvadlový autobus z Kutné Hory hl.n. je pro všechny držitele vstupenek zcela ZDARMA a jezdí každých 10 až 15 minut.'
                : 'No, the shuttle bus from Kutná Hora main station is 100% FREE for all ticket holders and departs every 10-15 minutes.'}</p>
            </details>
            <details class="fod-faq-item">
              <summary>${isCs ? 'Mohu po festivalu vrátit zbývající kredit na náramku?' : 'Can I refund unused cashless balance?'}</summary>
              <p>${isCs
                ? 'Ano, nevyčerpaný kredit je možné po skončení festivalu do 14 dnů zdarma převést zpět na bankovní účet.'
                : 'Yes, remaining cashless credit can be refunded fee-free to your bank account within 14 days after the festival.'}</p>
            </details>
          </div>
        </section>
      `;

      root.querySelectorAll('[data-route-filter]').forEach(btn => {
        btn.addEventListener('click', () => setMapRoute(btn.getAttribute('data-route-filter')));
      });
      setMapRoute(activeRoute);
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
              byId.set(a.id, b);
              byId.set(b.id, a);
            }
          }
        }
      });
      return { total, byId };
    }

    function render() {
      const isCs = core.getLang() === 'cs';
      const favs = core.getFavorites();
      const { total: totalCollisions, byId: collisionMap } = computeCollisions(favs);

      root.innerHTML = `
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

      const container = document.getElementById('my-schedule-container');
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
                    const colliding = collisionMap.get(item.id);
                    const hasCol = !!colliding;
                    const stageKey = core.normalizeStageKey(item.stage);
                    const stageHash = stageKey === 'lunar' ? 'stage-lunar' : 'stage-solar';
                    const bio = isCs ? (p.bioCs || '') : (p.bioEn || '');

                    return `
                      <article class="fod-plan-card ${hasCol ? 'has-collision' : ''}" id="${item.id}">
                        <div class="fod-card-top">
                          <span class="fod-slot-time">${core.escapeHtml(item.time)}</span>
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
                            ? `<strong>${isCs ? '⚠ ČASOVÁ KOLIZE' : '⚠ TIME CONFLICT'}</strong> — ${isCs ? 'Překrývá se s' : 'Overlaps with'} <strong>${core.escapeHtml(colliding.artist)}</strong> (${core.escapeHtml(colliding.stage)}, ${core.escapeHtml(colliding.time)})`
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

      // Bind action buttons
      const sampleFn = () => {
        core.saveFavorites(data.SAMPLE_IDS);
        core.showToast(isCs ? 'Načten ukázkový bezkolizní plán.' : 'Loaded curated conflict-free sample.');
        render();
      };
      const emptySampleBtn = document.getElementById('empty-sample-btn');
      if (emptySampleBtn) emptySampleBtn.addEventListener('click', sampleFn);

      const shareBtn = document.getElementById('share-schedule-btn');
      if (shareBtn) shareBtn.addEventListener('click', shareSchedule);

      const exportBtn = document.getElementById('export-schedule-btn');
      if (exportBtn) exportBtn.addEventListener('click', exportIcs);

      const clearBtn = document.getElementById('clear-favorites-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          const msg = isCs ? 'Opravdu chcete odebrat všechna uložená vystoupení?' : 'Are you sure you want to remove all saved performances?';
          if (window.confirm(msg)) {
            core.clearFavorites();
            render();
          }
        });
      }

      const hashId = (window.location.hash || '').replace('#', '');
      if (hashId) {
        const el = document.getElementById(hashId);
        if (el) {
          el.classList.add('spot-highlight');
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
        }
      }
    }

    root.addEventListener('click', e => {
      const rem = e.target && e.target.closest && e.target.closest('.remove-btn[data-id]');
      if (rem) {
        core.toggleFavoriteById(rem.getAttribute('data-id'));
        render();
      }
    });

    window.addEventListener('languageChanged', render);
    window.addEventListener('favoritesUpdated', render);
    render();
  }

  // =========================================================================
  // 7. SEARCH PAGE (Full 60 performers + timetable + practical info + synonyms)
  // =========================================================================
  function initSearchPage() {
    const root = document.getElementById('fod-search-root');
    if (!root || !C() || !D()) return;

    const core = C();
    const data = D();

    function matchesQuery(haystack, tokens) {
      if (!tokens.length) return true;
      const norm = core.normalizeStr(haystack);
      return tokens.every(tok => {
        if (norm.includes(tok)) return true;
        if (tok === 'info') return norm.includes('informac') || norm.includes('information') || norm.includes('praktick') || norm.includes('practical');
        if (tok === 'informace' || tok === 'information') return norm.includes('info') || norm.includes('praktick') || norm.includes('practical');
        if (tok === 'prakticke' || tok === 'practical') return norm.includes('info') || norm.includes('informac');
        if (tok === 'bus' || tok === 'autobus') return norm.includes('shuttle') || norm.includes('kyvadlov');
        if (tok === 'vlak' || tok === 'train') return norm.includes('nadrazi') || norm.includes('station') || norm.includes('shuttle');
        if (tok === 'ticket' || tok === 'tickets' || tok === 'listky' || tok === 'vstupenky') return norm.includes('vstupenk') || norm.includes('ticket') || norm.includes('faq');
        if (tok === 'dest' || tok === 'rain' || tok === 'shelter' || tok === 'ukryt') return norm.includes('lunar') || norm.includes('shelter') || norm.includes('dest');
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
        return matchesQuery(`${p.id} ${p.name} ${p.genre} ${p.origin} ${p.stage} ${p.dayEn} ${p.dayCs} ${p.time} ${p.bioEn} ${p.bioCs}`, tokens);
      });

      const matchedTimetable = cleanQuery
        ? data.PERFORMERS.filter(p => matchesQuery(`${p.name} ${p.time} ${p.dayEn} ${p.dayCs} ${p.stage} ${p.genre} ${p.origin}`, tokens))
        : [];

      const matchedInfo = data.PRACTICAL_INFO.filter(info => {
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
                <p class="fod-card-meta">${core.escapeHtml(p.genre)} · ${core.escapeHtml(p.stage)} · ${core.escapeHtml(p.time)}</p>
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
              <h3>${core.escapeHtml(p.stage)} - ${core.escapeHtml(isCs ? p.dayShortCs : p.dayShortEn)}, ${core.escapeHtml(p.time)}</h3>
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
