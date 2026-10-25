/**
 * Festival of Darkness 2 – Layout 04: Split Stage Switcher Engine
 * Standalone client-side controller supporting:
 * - Segmented Stage Switcher: Solar Horizon Stage vs Lunar Forest Dome vs Both
 * - 60 Performers Lineup & 60 Schedule Slots
 * - Shared LocalStorage Favorites under 'festival_favorites'
 * - Real-time Star Bookmarking & Highlighting (.is-favourite)
 * - Pairwise Schedule Clash Engine (+1440m post-midnight math, #b71c1c)
 * - Deep-linking (#perf-XX) and Scenario 1 instant covered dome access (?stage=lunar)
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    // -------------------------------------------------------------
    // Helper: Time & Minutes conversion with +1440m post-midnight wrap
    // -------------------------------------------------------------
    function timeToMinutes(timeStr) {
        if (!timeStr || typeof timeStr !== 'string') return 0;
        const parts = timeStr.trim().split(':');
        if (parts.length < 2) return 0;
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        // Post-midnight festival hours (< 08:00) roll into next calendar day (+1440 mins)
        const adjustedHours = hours < 8 ? hours + 24 : hours;
        return (adjustedHours * 60) + minutes;
    }

    function isOverlapping(t1, t2) {
        if (!t1 || !t2 || typeof t1 !== 'string' || typeof t2 !== 'string') return false;
        const parts1 = t1.split(/[–—-]/).map(s => s.trim());
        const parts2 = t2.split(/[–—-]/).map(s => s.trim());
        if (parts1.length < 2 || parts2.length < 2) return false;
        const [start1, end1] = parts1;
        const [start2, end2] = parts2;
        const mStart1 = timeToMinutes(start1);
        const mEnd1 = timeToMinutes(end1);
        const mStart2 = timeToMinutes(start2);
        const mEnd2 = timeToMinutes(end2);
        return (mStart1 < mEnd2) && (mStart2 < mEnd1);
    }

    // -------------------------------------------------------------
    // LocalStorage Favorites Helpers
    // -------------------------------------------------------------
    function getFavorites() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('LocalStorage read error:', e);
            return [];
        }
    }

    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        } catch (e) {
            console.error('LocalStorage write error:', e);
        }
    }

    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(f => f.id === id);
    }

    function toggleFavorite(eventData) {
        const favs = getFavorites();
        const index = favs.findIndex(f => f.id === eventData.id);
        if (index > -1) {
            favs.splice(index, 1);
        } else {
            favs.push({
                id: eventData.id,
                artist: eventData.artist || eventData.name,
                stage: eventData.stage,
                day: eventData.day,
                time: eventData.time,
                genre: eventData.genre || 'Electronic / Alternative'
            });
        }
        saveFavorites(favs);
        updateUIFavorites();
        return favs;
    }

    function updateUIFavorites() {
        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        // Update fav count elements
        document.querySelectorAll('#fav-count, .fav-count-badge').forEach(el => {
            el.textContent = favs.length;
        });

        // Update schedule cells
        document.querySelectorAll('.sch-cell[data-id], .artist-card[data-id]').forEach(el => {
            const id = el.getAttribute('data-id');
            const starBtn = el.querySelector('.sch-fav-btn, .artist-fav-btn');
            if (favIds.has(id)) {
                el.classList.add('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '★';
                    starBtn.title = 'Remove from My Schedule';
                    starBtn.setAttribute('aria-label', 'Remove from My Schedule');
                }
            } else {
                el.classList.remove('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '☆';
                    starBtn.title = 'Add to My Schedule';
                    starBtn.setAttribute('aria-label', 'Add to My Schedule');
                }
            }
        });

        // If on my-schedule.html, re-render schedule list
        if (document.getElementById('my-schedule-container')) {
            renderMySchedulePage();
        }
    }

    // -------------------------------------------------------------
    // Data Resolver (window.FESTIVAL_DATA or fallback)
    // -------------------------------------------------------------
    function getData() {
        if (typeof window.FESTIVAL_DATA !== 'undefined') {
            return window.FESTIVAL_DATA;
        }
        return null;
    }

    // -------------------------------------------------------------
    // Split Stage Switcher: Program Timetable Page
    // -------------------------------------------------------------
    let currentStage = 'all'; // 'solar' | 'lunar' | 'all'
    let currentDay = 'all';     // 'all' | 'day1' | 'day2' | 'day3'
    let currentGenre = 'all';
    let currentFavOnly = false;
    let currentSearch = '';

    function initProgramPage() {
        const container = document.getElementById('split-stage-program-container');
        if (!container) return;

        // Parse URL parameters for direct stage switching (e.g. ?stage=lunar or #stage-lunar)
        const params = new URLSearchParams(window.location.search);
        const stageParam = params.get('stage') || (window.location.hash.includes('lunar') ? 'lunar' : (window.location.hash.includes('solar') ? 'solar' : null));
        if (stageParam && (stageParam === 'lunar' || stageParam === 'solar' || stageParam === 'all')) {
            currentStage = stageParam;
        }
        const dayParam = params.get('day');
        if (dayParam && ['day1', 'day2', 'day3', 'all'].includes(dayParam)) {
            currentDay = dayParam;
        }

        // Setup Stage Segmented Switcher buttons
        const stageSwitchBtns = document.querySelectorAll('[data-stage-switch]');
        stageSwitchBtns.forEach(btn => {
            const targetStage = btn.getAttribute('data-stage-switch');
            if (targetStage === currentStage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentStage = targetStage;
                stageSwitchBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderProgramSchedule();
            });
        });

        // Setup Day filter buttons
        const dayBtns = document.querySelectorAll('[data-filter-day]');
        dayBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter-day') === currentDay);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentDay = btn.getAttribute('data-filter-day');
                dayBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderProgramSchedule();
            });
        });

        // Setup Genre filter pills
        const genreBtns = document.querySelectorAll('[data-filter-genre]');
        genreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentGenre = btn.getAttribute('data-filter-genre');
                genreBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderProgramSchedule();
            });
        });

        // Setup Bookmarked Only button
        const favOnlyBtn = document.getElementById('filter-fav-only');
        if (favOnlyBtn) {
            favOnlyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentFavOnly = !currentFavOnly;
                favOnlyBtn.classList.toggle('active', currentFavOnly);
                renderProgramSchedule();
            });
        }

        // Setup Search Input
        const searchInput = document.getElementById('artist-search-input');
        const clearSearchBtn = document.getElementById('clear-search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim().toLowerCase();
                renderProgramSchedule();
            });
        }
        if (clearSearchBtn && searchInput) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                renderProgramSchedule();
            });
        }

        // Render schedule slots
        renderProgramSchedule();
    }

    function renderProgramSchedule() {
        const container = document.getElementById('split-stage-program-container');
        if (!container) return;

        const data = getData();
        if (!data || !data.SCHEDULE) {
            container.innerHTML = '<div class="wf-box-sub"><p>[ Loading festival schedule... ]</p></div>';
            return;
        }

        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        // Filter schedule items
        const filtered = data.SCHEDULE.filter(item => {
            // Stage filter
            if (currentStage !== 'all' && item.stageId !== currentStage) {
                return false;
            }
            // Day filter
            if (currentDay !== 'all' && item.dayKey !== currentDay) {
                return false;
            }
            // Genre filter
            if (currentGenre !== 'all' && !item.genre.toLowerCase().includes(currentGenre.toLowerCase())) {
                return false;
            }
            // Fav only filter
            if (currentFavOnly && !favIds.has(item.perfId)) {
                return false;
            }
            // Search text
            if (currentSearch) {
                const matchName = item.artist.toLowerCase().includes(currentSearch);
                const matchGenre = item.genre.toLowerCase().includes(currentSearch);
                if (!matchName && !matchGenre) return false;
            }
            return true;
        });

        // Update counter & status
        const countStatus = document.getElementById('filter-status-text');
        if (countStatus) {
            countStatus.textContent = `[ Showing ${filtered.length} of ${data.SCHEDULE.length} performances ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                    <p style="font-size: 1.05rem; font-weight: bold;">[ No performances match the selected filters. ]</p>
                    <p style="color: #666; margin-top: 6px;">[ Try switching stages, resetting filters, or clearing your search. ]</p>
                    <button class="btn-box" id="reset-all-filters-btn" style="margin-top: 12px;">[ Reset All Filters ]</button>
                </div>
            `;
            const resetBtn = document.getElementById('reset-all-filters-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    currentStage = 'all';
                    currentDay = 'all';
                    currentGenre = 'all';
                    currentFavOnly = false;
                    currentSearch = '';
                    const searchInput = document.getElementById('artist-search-input');
                    if (searchInput) searchInput.value = '';
                    const favOnlyBtn = document.getElementById('filter-fav-only');
                    if (favOnlyBtn) favOnlyBtn.classList.remove('active');
                    document.querySelectorAll('[data-stage-switch]').forEach(b => b.classList.toggle('active', b.getAttribute('data-stage-switch') === 'all'));
                    document.querySelectorAll('[data-filter-day]').forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-day') === 'all'));
                    document.querySelectorAll('[data-filter-genre]').forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-genre') === 'all'));
                    renderProgramSchedule();
                });
            }
            return;
        }

        // Group by Day, and within Day by Stage if 'all' stage is selected
        const days = [
            { key: 'day1', label: 'Day 1 — Friday, July 10, 2026' },
            { key: 'day2', label: 'Day 2 — Saturday, July 11, 2026' },
            { key: 'day3', label: 'Day 3 — Sunday, July 12, 2026' }
        ];

        let html = '';

        days.forEach(day => {
            const dayItems = filtered.filter(i => i.dayKey === day.key);
            if (dayItems.length === 0) return;

            html += `<section class="wf-box" style="margin-bottom: 20px;">`;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">`;
            html += `<h3 style="font-size: 1.15rem;">[ 📅 ${day.label} ]</h3>`;
            html += `<span style="font-size: 0.85rem; color: #555;">[ ${dayItems.length} shows ]</span>`;
            html += `</div><hr>`;

            if (currentStage === 'all') {
                // Render Split View: Parallel columns for Solar and Lunar stages
                const solarItems = dayItems.filter(i => i.stageId === 'solar');
                const lunarItems = dayItems.filter(i => i.stageId === 'lunar');

                html += `<div class="split-stage-container parallel-mode">`;

                // Solar Column
                html += `<div class="split-stage-column">`;
                html += `<div class="stage-column-header">`;
                html += `<div><strong>☀️ Solar Horizon Stage</strong><br><small style="color: #444;">Open-air Amphitheater (4,500 cap)</small></div>`;
                html += `<span class="stage-badge-solar">${solarItems.length} shows</span>`;
                html += `</div>`;
                solarItems.forEach(item => {
                    html += buildScheduleCellHtml(item, favIds.has(item.perfId));
                });
                if (solarItems.length === 0) {
                    html += `<p style="color: #777; font-style: italic; padding: 10px;">[ No Solar Stage shows match current filters ]</p>`;
                }
                html += `</div>`;

                // Lunar Column
                html += `<div class="split-stage-column">`;
                html += `<div class="stage-column-header">`;
                html += `<div><strong>🌙 Lunar Forest Dome</strong><br><small style="color: #444;">Covered Rain Shelter (1,800 cap)</small></div>`;
                html += `<span class="stage-badge-lunar">${lunarItems.length} shows</span>`;
                html += `</div>`;
                lunarItems.forEach(item => {
                    html += buildScheduleCellHtml(item, favIds.has(item.perfId));
                });
                if (lunarItems.length === 0) {
                    html += `<p style="color: #777; font-style: italic; padding: 10px;">[ No Lunar Dome shows match current filters ]</p>`;
                }
                html += `</div>`;

                html += `</div>`; // .split-stage-container
            } else {
                // Single Stage View: Focused, streamlined, zero-clutter
                const stageName = currentStage === 'solar' ? '☀️ Solar Horizon Stage (Open-air)' : '🌙 Lunar Forest Dome (Covered Rain Shelter)';
                const stageDesc = currentStage === 'solar' ? 'Open-air amphitheater | 4,500 capacity' : 'Covered indoor dome | 1,800 capacity | Weatherproof rain shelter';

                html += `<div class="stage-column-header">`;
                html += `<div><strong>${stageName}</strong><br><small style="color: #444;">${stageDesc}</small></div>`;
                html += `<span class="${currentStage === 'solar' ? 'stage-badge-solar' : 'stage-badge-lunar'}">${dayItems.length} shows</span>`;
                html += `</div>`;

                dayItems.forEach(item => {
                    html += buildScheduleCellHtml(item, favIds.has(item.perfId));
                });
            }

            html += `</section>`;
        });

        container.innerHTML = html;

        // Attach Bookmark Star event listeners
        container.querySelectorAll('.sch-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cell = btn.closest('.sch-cell');
                if (!cell) return;
                toggleFavoriteFromCell(cell);
            });
        });

        // Also allow clicking the entire cell to bookmark
        container.querySelectorAll('.sch-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('.sch-fav-btn')) return;
                toggleFavoriteFromCell(cell);
            });
        });
    }

    function buildScheduleCellHtml(item, isFav) {
        const favClass = isFav ? 'is-favourite' : '';
        const starChar = isFav ? '★' : '☆';
        const starTitle = isFav ? 'Remove from My Schedule' : 'Add to My Schedule';

        return `
            <div class="sch-cell sch-event ${favClass}" 
                 data-id="${item.perfId}" 
                 data-artist="${item.artist}" 
                 data-stage="${item.stage}" 
                 data-stage-id="${item.stageId}"
                 data-day="${item.day}" 
                 data-time="${item.time}" 
                 data-genre="${item.genre}">
                <div class="sch-cell-content">
                    <div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;">
                        <span class="sch-cell-time">${item.time}</span>
                        <span style="font-size: 0.8rem; color: #555;">[ ${item.duration} min ]</span>
                    </div>
                    <div class="sch-cell-artist">${item.artist}</div>
                    <div class="sch-cell-meta">
                        <span>${item.genre}</span> • 
                        <a href="artists.html#${item.perfId}" style="color: #333; text-decoration: underline;" title="View bio & artist details">[ Profile &rarr; ]</a>
                    </div>
                </div>
                <button class="sch-fav-btn" title="${starTitle}" aria-label="${starTitle}">
                    ${starChar}
                </button>
            </div>
        `;
    }

    function toggleFavoriteFromCell(cell) {
        const id = cell.getAttribute('data-id');
        const artist = cell.getAttribute('data-artist');
        const stage = cell.getAttribute('data-stage');
        const day = cell.getAttribute('data-day');
        const time = cell.getAttribute('data-time');
        const genre = cell.getAttribute('data-genre');

        toggleFavorite({
            id: id,
            artist: artist,
            stage: stage,
            day: day,
            time: time,
            genre: genre
        });
    }

    // -------------------------------------------------------------
    // Artists Catalog Page
    // -------------------------------------------------------------
    let artistStageFilter = 'all';
    let artistSearchQuery = '';

    function initArtistsPage() {
        const container = document.getElementById('artists-catalog-container');
        if (!container) return;

        // Stage Switch buttons on Artists page
        const stageBtns = document.querySelectorAll('[data-artist-stage]');
        stageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                artistStageFilter = btn.getAttribute('data-artist-stage');
                stageBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderArtistsCatalog();
            });
        });

        // Search Input
        const searchInput = document.getElementById('artist-search-input');
        const clearBtn = document.getElementById('clear-search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                artistSearchQuery = e.target.value.trim().toLowerCase();
                renderArtistsCatalog();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                artistSearchQuery = '';
                renderArtistsCatalog();
            });
        }

        renderArtistsCatalog();

        // Handle URL hash deep linking (e.g. #perf-05)
        if (window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash.replace('#', '');
                const targetCard = document.querySelector(`.artist-card[data-id="${targetId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.outline = '3px solid #000';
                }
            }, 150);
        }
    }

    function renderArtistsCatalog() {
        const container = document.getElementById('artists-catalog-container');
        if (!container) return;

        const data = getData();
        if (!data || !data.PERFORMERS) {
            container.innerHTML = '<div class="wf-box-sub"><p>[ Loading artists lineup... ]</p></div>';
            return;
        }

        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        const filtered = data.PERFORMERS.filter(perf => {
            if (artistStageFilter !== 'all' && perf.stageId !== artistStageFilter) {
                return false;
            }
            if (artistSearchQuery) {
                const matchName = perf.name.toLowerCase().includes(artistSearchQuery);
                const matchGenre = perf.genre.toLowerCase().includes(artistSearchQuery);
                const matchOrigin = perf.origin.toLowerCase().includes(artistSearchQuery);
                if (!matchName && !matchGenre && !matchOrigin) return false;
            }
            return true;
        });

        const statusEl = document.getElementById('artist-count-status');
        if (statusEl) {
            statusEl.textContent = `[ Displaying ${filtered.length} of ${data.PERFORMERS.length} artists ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="grid-column: 1 / -1; text-align: center; padding: 24px;">
                    <p><strong>[ No artists match the current filter or search criteria. ]</strong></p>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(perf => {
            const isFav = favIds.has(perf.id);
            const favClass = isFav ? 'is-favourite' : '';
            const starChar = isFav ? '★' : '☆';
            const stageBadge = perf.stageId === 'solar' 
                ? '<span class="stage-badge-solar">☀️ Solar Horizon</span>' 
                : '<span class="stage-badge-lunar">🌙 Lunar Dome</span>';

            html += `
                <article class="artist-card ${favClass}" id="${perf.id}" data-id="${perf.id}"
                         data-artist="${perf.name}"
                         data-stage="${perf.stage}"
                         data-day="${perf.day}"
                         data-time="${perf.time}"
                         data-genre="${perf.genre}">
                    <div class="artist-card-header">
                        <div>
                            <div class="artist-card-name">${perf.name} <small style="color: #666;">(${perf.origin})</small></div>
                            <div class="artist-card-genre">${perf.genre}</div>
                        </div>
                        <button class="sch-fav-btn artist-fav-btn" title="Bookmark ${perf.name}" aria-label="Bookmark ${perf.name}">
                            ${starChar}
                        </button>
                    </div>
                    <p class="artist-card-bio">${perf.bio}</p>
                    <div class="artist-card-footer">
                        <div>${stageBadge}</div>
                        <div style="font-size: 0.85rem; font-weight: bold;">${perf.dayKey.toUpperCase()} • ${perf.time}</div>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners for star button
        container.querySelectorAll('.artist-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.artist-card');
                if (!card) return;
                toggleFavoriteFromCell(card);
            });
        });
    }

    // -------------------------------------------------------------
    // My Schedule Page & Clash Engine (Scenario 2)
    // -------------------------------------------------------------
    function initMySchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const clearBtn = document.getElementById('clear-favorites-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all saved performances from your personal schedule?')) {
                    saveFavorites([]);
                    updateUIFavorites();
                    renderMySchedulePage();
                }
            });
        }

        renderMySchedulePage();
    }

    function renderMySchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const favs = getFavorites();

        // Counter updates
        document.querySelectorAll('#fav-count, .fav-count-badge').forEach(el => {
            el.textContent = favs.length;
        });

        if (favs.length === 0) {
            container.innerHTML = `
                <section class="wf-box" style="text-align: center; padding: 28px 16px;">
                    <h3>[ Your Personal Schedule is Empty ]</h3>
                    <hr>
                    <p style="color: #555; margin-bottom: 14px;">[ You haven't bookmarked any performances yet. Click the ★ star on any show in the Timetable or Artist catalog to add it here. ]</p>
                    <a href="program.html" class="btn-box"><strong>[ Browse Full Timetable &rarr; ]</strong></a>
                </section>
            `;
            return;
        }

        const days = [
            { key: 'Day 1', label: 'Day 1 — Friday, July 10, 2026' },
            { key: 'Day 2', label: 'Day 2 — Saturday, July 11, 2026' },
            { key: 'Day 3', label: 'Day 3 — Sunday, July 12, 2026' }
        ];

        let html = '';
        let totalConflictsCount = 0;

        days.forEach(d => {
            const dayFavs = favs.filter(f => f.day && f.day.includes(d.key));

            html += `<section class="wf-box" style="margin-bottom: 16px;">`;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">`;
            html += `<h3>[ ${d.label} ]</h3>`;
            html += `<span style="font-size: 0.85rem; color: #555;">[ ${dayFavs.length} shows bookmarked ]</span>`;
            html += `</div><hr>`;

            if (dayFavs.length === 0) {
                html += `<p style="color: #666; font-style: italic;">[ No performances saved for this day. ]</p>`;
                html += `<div style="margin-top: 10px;"><a href="program.html" class="btn-box" style="font-size: 0.85rem;">[ Add shows from Program &rarr; ]</a></div>`;
            } else {
                // Chronological sorting using +1440m post-midnight math
                dayFavs.sort((a, b) => {
                    const sA = (a.time || '').split(/[–—-]/)[0].trim();
                    const sB = (b.time || '').split(/[–—-]/)[0].trim();
                    return timeToMinutes(sA) - timeToMinutes(sB);
                });

                // Detect pairwise collisions
                html += `<div class="row">`;
                dayFavs.forEach((item, idx) => {
                    let hasConflict = false;
                    let conflictingArtists = [];

                    dayFavs.forEach((other, oIdx) => {
                        if (idx !== oIdx && item.stage !== other.stage && isOverlapping(item.time, other.time)) {
                            hasConflict = true;
                            conflictingArtists.push(`${other.artist} (${other.time} @ ${other.stage})`);
                        }
                    });

                    if (hasConflict) totalConflictsCount++;

                    const cardBorder = hasConflict 
                        ? 'border: 2px solid #b71c1c; background: #ffebee;' 
                        : 'border: 1px solid #777; background: #fafafa;';

                    const badgeHtml = hasConflict
                        ? `<div class="conflict-warning-badge">[ ⚠️ Time conflict with: ${conflictingArtists.join(', ')} ]</div>`
                        : `<div class="clear-status-badge">[ ✓ No time conflict ]</div>`;

                    html += `
                        <article class="col wf-box-sub" style="${cardBorder}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                <h4 style="font-size: 1.05rem;">[ ${item.time} | ${item.artist} ]</h4>
                                <button class="btn-box btn-box-danger remove-show-btn" data-id="${item.id}" style="padding: 4px 8px; font-size: 0.8rem; min-height: 44px; min-width: 44px;">
                                    [ Remove ]
                                </button>
                            </div>
                            <p style="margin-top: 6px;"><strong>Stage:</strong> ${item.stage}</p>
                            <p><strong>Genre:</strong> ${item.genre}</p>
                            <div style="margin-top: 8px;">
                                ${badgeHtml}
                            </div>
                        </article>
                    `;
                });
                html += `</div>`;
            }

            html += `</section>`;
        });

        // Top Alert Banner if collisions exist
        const bannerContainer = document.getElementById('conflict-summary-banner');
        if (bannerContainer) {
            if (totalConflictsCount > 0) {
                bannerContainer.innerHTML = `
                    <div class="wf-box has-conflict" style="margin-bottom: 14px;">
                        <strong style="color: #b71c1c;">[ ⚠️ Scheduling Alert: ${totalConflictsCount} time conflicts detected! ]</strong>
                        <p style="font-size: 0.9rem; color: #7f0000; margin-top: 4px;">
                            You have bookmarked overlapping performances occurring simultaneously on Solar Horizon Stage and Lunar Forest Dome. Review the red-highlighted cards below to adjust your itinerary.
                        </p>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="wf-box" style="border: 1px solid #28a745; background: #f4fff4; margin-bottom: 14px;">
                        <strong style="color: #1e7e34;">[ ✓ Schedule Status: All saved shows are conflict-free! ]</strong>
                        <p style="font-size: 0.9rem; color: #2e7d32; margin-top: 4px;">
                            No overlapping stage slots detected. You are ready to experience the Festival of Darkness 2.
                        </p>
                    </div>
                `;
            }
        }

        container.innerHTML = html;

        // Attach Remove handlers
        container.querySelectorAll('.remove-show-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const updated = getFavorites().filter(item => item.id !== id);
                saveFavorites(updated);
                updateUIFavorites();
                renderMySchedulePage();
            });
        });
    }

    // -------------------------------------------------------------
    // Global Initializer
    // -------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        initProgramPage();
        initArtistsPage();
        initMySchedulePage();
        updateUIFavorites();
    });

    // Expose helpers on window for simulator & testing access
    window.SplitStageApp = {
        timeToMinutes,
        isOverlapping,
        getFavorites,
        saveFavorites,
        toggleFavorite,
        updateUIFavorites,
        renderProgramSchedule,
        renderArtistsCatalog,
        renderMySchedulePage
    };

})();
