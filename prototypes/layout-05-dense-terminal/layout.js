
function isItemInDay(item, dayKey) {
    if (!item) return false;
    const raw = String(item.day || '').toLowerCase();
    if (dayKey === 'Day 1' && (raw.includes('day 1') || raw.includes('day1') || raw.includes('fri') || raw.includes('pát') || raw.includes('10'))) return true;
    if (dayKey === 'Day 2' && (raw.includes('day 2') || raw.includes('day2') || raw.includes('sat') || raw.includes('sob') || raw.includes('11'))) return true;
    if (dayKey === 'Day 3' && (raw.includes('day 3') || raw.includes('day3') || raw.includes('sun') || raw.includes('ned') || raw.includes('12'))) return true;
    const m = String(item.id || '').match(/perf-(\d+)/i);
    if (m) {
        const n = parseInt(m[1], 10);
        if (dayKey === 'Day 1' && n >= 1 && n <= 20) return true;
        if (dayKey === 'Day 2' && n >= 21 && n <= 40) return true;
        if (dayKey === 'Day 3' && n >= 41 && n <= 60) return true;
    }
    return false;
}

/**
 * Festival of Darkness 2 – Layout 05: Dense Data Terminal Engine
 * Standalone client-side controller supporting:
 * - Monospace Dense Data Terminal UX Metaphor & Teletext Flight Board Matrix
 * - 60 Performers Lineup & 60 Schedule Slots (Canonical Dataset)
 * - Shared LocalStorage Favorites under 'festival_favorites'
 * - Real-time Star Bookmarking & Highlighting (.is-favourite)
 * - Pairwise Schedule Conflict Engine (+1440m post-midnight math, #b71c1c)
 * - Scenario 1 instant covered dome access (?stage=lunar, #stage-lunar)
 * - Deep-linking (#perf-XX) and instant live search
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

        // Update schedule cells & artist cards
        document.querySelectorAll('.sch-cell[data-id], .artist-card[data-id]').forEach(el => {
            const id = el.getAttribute('data-id');
            const starBtn = el.querySelector('.sch-fav-btn, .artist-fav-btn');
            if (favIds.has(id)) {
                el.classList.add('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '★';
                    starBtn.title = 'Remove from Terminal Itinerary';
                    starBtn.setAttribute('aria-label', 'Remove from Terminal Itinerary');
                }
            } else {
                el.classList.remove('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '☆';
                    starBtn.title = 'Add to Terminal Itinerary';
                    starBtn.setAttribute('aria-label', 'Add to Terminal Itinerary');
                }
            }
        });

        // If on my-schedule.html, re-render
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
    // Program Timetable Controller
    // -------------------------------------------------------------
    let currentStage = 'all'; // 'solar' | 'lunar' | 'all'
    let currentDay = 'all';   // 'all' | 'day1' | 'day2' | 'day3'
    let currentGenre = 'all';
    let currentFavOnly = false;
    let currentSearch = '';

    function initProgramPage() {
        const container = document.getElementById('terminal-program-container');
        if (!container) return;

        // Parse URL params for direct stage/day switching (e.g. ?stage=lunar or #stage-lunar)
        const params = new URLSearchParams(window.location.search);
        const stageParam = params.get('stage') || (window.location.hash.includes('lunar') ? 'lunar' : (window.location.hash.includes('solar') ? 'solar' : null));
        if (stageParam && ['solar', 'lunar', 'all'].includes(stageParam)) {
            currentStage = stageParam;
        }
        const dayParam = params.get('day');
        if (dayParam && ['day1', 'day2', 'day3', 'all'].includes(dayParam)) {
            currentDay = dayParam;
        }

        // Setup Stage Filter buttons
        const stageBtns = document.querySelectorAll('[data-stage-filter]');
        stageBtns.forEach(btn => {
            const st = btn.getAttribute('data-stage-filter');
            btn.classList.toggle('active', st === currentStage);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentStage = st;
                stageBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderProgramSchedule();
            });
        });

        // Setup Day Filter buttons
        const dayBtns = document.querySelectorAll('[data-day-filter]');
        dayBtns.forEach(btn => {
            const dy = btn.getAttribute('data-day-filter');
            btn.classList.toggle('active', dy === currentDay);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentDay = dy;
                dayBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderProgramSchedule();
            });
        });

        // Setup Genre filter pills
        const genreBtns = document.querySelectorAll('[data-genre-filter]');
        genreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentGenre = btn.getAttribute('data-genre-filter');
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
        const searchInput = document.getElementById('terminal-search-input');
        const clearBtn = document.getElementById('clear-search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearch = e.target.value.trim().toLowerCase();
                renderProgramSchedule();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearch = '';
                renderProgramSchedule();
            });
        }

        renderProgramSchedule();
    }

    function renderProgramSchedule() {
        const container = document.getElementById('terminal-program-container');
        if (!container) return;

        const data = getData();
        if (!data || !data.SCHEDULE) {
            container.innerHTML = '<div class="wf-box-sub"><p>[ LOADING_DATA_STREAM... ]</p></div>';
            return;
        }

        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        const filtered = data.SCHEDULE.filter(item => {
            if (currentStage !== 'all' && item.stageId !== currentStage) {
                return false;
            }
            if (currentDay !== 'all' && item.dayKey !== currentDay) {
                return false;
            }
            if (currentGenre !== 'all' && !item.genre.toLowerCase().includes(currentGenre.toLowerCase())) {
                return false;
            }
            if (currentFavOnly && !favIds.has(item.perfId)) {
                return false;
            }
            if (currentSearch) {
                const matchName = item.artist.toLowerCase().includes(currentSearch);
                const matchGenre = item.genre.toLowerCase().includes(currentSearch);
                if (!matchName && !matchGenre) return false;
            }
            return true;
        });

        // Update telemetry status display
        const telemetryStatus = document.getElementById('terminal-telemetry-status');
        if (telemetryStatus) {
            telemetryStatus.textContent = `[ REGISTRY: ${filtered.length} / ${data.SCHEDULE.length} SLOTS ACTIVE ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                    <p style="font-weight: bold; font-size: 1rem;">[ 0 RECORDS RETURNED MATCHING QUERY ]</p>
                    <p style="color: #666; margin-top: 6px;">[ Criteria: Stage=${currentStage.toUpperCase()} | Day=${currentDay.toUpperCase()} | Search="${currentSearch}" ]</p>
                    <button class="btn-box" id="reset-terminal-filters" style="margin-top: 10px;">[ CMD: RESET_FILTERS ]</button>
                </div>
            `;
            const resetBtn = document.getElementById('reset-terminal-filters');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    currentStage = 'all';
                    currentDay = 'all';
                    currentGenre = 'all';
                    currentFavOnly = false;
                    currentSearch = '';
                    const searchInput = document.getElementById('terminal-search-input');
                    if (searchInput) searchInput.value = '';
                    const favBtn = document.getElementById('filter-fav-only');
                    if (favBtn) favBtn.classList.remove('active');
                    document.querySelectorAll('[data-stage-filter]').forEach(b => b.classList.toggle('active', b.getAttribute('data-stage-filter') === 'all'));
                    document.querySelectorAll('[data-day-filter]').forEach(b => b.classList.toggle('active', b.getAttribute('data-day-filter') === 'all'));
                    document.querySelectorAll('[data-genre-filter]').forEach(b => b.classList.toggle('active', b.getAttribute('data-genre-filter') === 'all'));
                    renderProgramSchedule();
                });
            }
            return;
        }

        const days = [
            { key: 'day1', label: 'DAY 1 // 2026-07-10 (FRIDAY)' },
            { key: 'day2', label: 'DAY 2 // 2026-07-11 (SATURDAY)' },
            { key: 'day3', label: 'DAY 3 // 2026-07-12 (SUNDAY)' }
        ];

        let html = '';

        days.forEach(day => {
            const dayItems = filtered.filter(i => i.dayKey === day.key);
            if (dayItems.length === 0) return;

            // Sort chronologically using +1440m post-midnight math
            dayItems.sort((a, b) => timeToMinutes(a.timeStart) - timeToMinutes(b.timeStart));

            html += `<section class="wf-box" style="margin-bottom: 14px;">`;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">`;
            html += `<h3 style="font-size: 1.05rem;">[ ${day.label} ]</h3>`;
            html += `<span style="font-size: 0.82rem; color: #555;">[ ${dayItems.length} ENTRIES ]</span>`;
            html += `</div><hr>`;

            html += `<div class="sch-terminal-matrix">`;
            dayItems.forEach(item => {
                const isFav = favIds.has(item.perfId);
                const favClass = isFav ? 'is-favourite' : '';
                const starChar = isFav ? '★' : '☆';
                const stageChip = item.stageId === 'solar'
                    ? '<span class="terminal-status-chip chip-solar">[SOLAR]</span>'
                    : '<span class="terminal-status-chip chip-lunar">[LUNAR (RAIN SHELTER)]</span>';

                html += `
                    <div class="sch-cell sch-event ${favClass}"
                         data-id="${item.perfId}"
                         data-artist="${item.artist}"
                         data-stage="${item.stage}"
                         data-stage-id="${item.stageId}"
                         data-day="${item.day}"
                         data-time="${item.time}"
                         data-genre="${item.genre}">
                        <div class="sch-cell-left">
                            <div class="sch-cell-row1">
                                <span class="sch-cell-time">${item.time}</span>
                                ${stageChip}
                                <span class="sch-cell-artist">${item.artist}</span>
                            </div>
                            <div class="sch-cell-row2">
                                <span>[ GENRE: ${item.genre} ]</span>
                                <span>[ DUR: ${item.duration}m ]</span>
                                <a href="artists.html#${item.perfId}" style="color: #111; text-decoration: underline;" title="View performer bio">[ PROFILE &rarr; ]</a>
                            </div>
                        </div>
                        <div class="sch-cell-right">
                            <button class="sch-fav-btn" title="Toggle Bookmark" aria-label="Toggle Bookmark for ${item.artist}">
                                ${starChar}
                            </button>
                        </div>
                    </div>
                `;
            });
            html += `</div>`; // .sch-terminal-matrix

            html += `</section>`;
        });

        container.innerHTML = html;

        // Attach event listeners for bookmarking
        container.querySelectorAll('.sch-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cell = btn.closest('.sch-cell');
                if (!cell) return;
                toggleFavoriteFromCell(cell);
            });
        });

        container.querySelectorAll('.sch-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('.sch-fav-btn')) return;
                toggleFavoriteFromCell(cell);
            });
        });
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
    // Artist Registry Catalog Controller
    // -------------------------------------------------------------
    let artistStage = 'all';
    let artistQuery = '';

    function initArtistsPage() {
        const container = document.getElementById('terminal-artists-container');
        if (!container) return;

        // Stage filter buttons
        const stageBtns = document.querySelectorAll('[data-artist-stage]');
        stageBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                artistStage = btn.getAttribute('data-artist-stage');
                stageBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderArtistsCatalog();
            });
        });

        // Search input
        const searchInput = document.getElementById('artist-search-input');
        const clearBtn = document.getElementById('clear-artist-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                artistQuery = e.target.value.trim().toLowerCase();
                renderArtistsCatalog();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                artistQuery = '';
                renderArtistsCatalog();
            });
        }

        renderArtistsCatalog();

        // Deep linking hash scroll (#perf-XX)
        if (window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash.replace('#', '');
                const targetCard = document.querySelector(`.artist-card[data-id="${targetId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetCard.style.outline = '3px solid #000';
                }
            }, 120);
        }
    }

    function renderArtistsCatalog() {
        const container = document.getElementById('terminal-artists-container');
        if (!container) return;

        const data = getData();
        if (!data || !data.PERFORMERS) {
            container.innerHTML = '<div class="wf-box-sub"><p>[ LOADING_ARTIST_DATABASE... ]</p></div>';
            return;
        }

        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        const filtered = data.PERFORMERS.filter(perf => {
            if (artistStage !== 'all' && perf.stageId !== artistStage) {
                return false;
            }
            if (artistQuery) {
                const matchName = perf.name.toLowerCase().includes(artistQuery);
                const matchGenre = perf.genre.toLowerCase().includes(artistQuery);
                const matchOrigin = perf.origin.toLowerCase().includes(artistQuery);
                if (!matchName && !matchGenre && !matchOrigin) return false;
            }
            return true;
        });

        const statusEl = document.getElementById('artist-telemetry-status');
        if (statusEl) {
            statusEl.textContent = `[ REGISTRY_ENTRIES: ${filtered.length} / ${data.PERFORMERS.length} ONLINE ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="grid-column: 1 / -1; text-align: center; padding: 20px;">
                    <p style="font-weight: bold;">[ NO RECORDS MATCHING QUERY CRITERIA ]</p>
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
                ? '<span class="terminal-status-chip chip-solar">[SOLAR // OPEN-AIR]</span>'
                : '<span class="terminal-status-chip chip-lunar">[LUNAR // RAIN SHELTER]</span>';

            html += `
                <article class="artist-card ${favClass}" id="${perf.id}" data-id="${perf.id}"
                         data-artist="${perf.name}"
                         data-stage="${perf.stage}"
                         data-day="${perf.day}"
                         data-time="${perf.time}"
                         data-genre="${perf.genre}">
                    <div class="artist-card-header">
                        <div>
                            <div class="artist-card-title">${perf.name} <small style="color: #555;">[${perf.origin}]</small></div>
                            <div class="artist-card-meta">[ GENRE: ${perf.genre} ]</div>
                        </div>
                        <button class="sch-fav-btn artist-fav-btn" title="Toggle Bookmark" aria-label="Toggle Bookmark for ${perf.name}">
                            ${starChar}
                        </button>
                    </div>
                    <p class="artist-card-bio">${perf.bio}</p>
                    <div class="artist-card-footer">
                        <div>${stageBadge}</div>
                        <div style="font-weight: bold;">${perf.dayKey.toUpperCase()} // ${perf.time}</div>
                    </div>
                </article>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners
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
    // My Schedule Conflict Engine & Report
    // -------------------------------------------------------------
    function initMySchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const clearBtn = document.getElementById('clear-favorites-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all entries from your terminal itinerary?')) {
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

        document.querySelectorAll('#fav-count, .fav-count-badge').forEach(el => {
            el.textContent = favs.length;
        });

        if (favs.length === 0) {
            container.innerHTML = `
                <section class="wf-box" style="text-align: center; padding: 28px 16px;">
                    <h3>[ TERMINAL_REPORT: NO SAVED ENTRIES ]</h3>
                    <hr>
                    <p style="color: #555; margin-bottom: 14px;">[ Itinerary registry is empty. Query the Timetable or Artist Registry and toggle [★] to assemble personal schedule. ]</p>
                    <a href="program.html" class="btn-box"><strong>[ CMD: QUERY_FULL_TIMETABLE &rarr; ]</strong></a>
                </section>
            `;
            const banner = document.getElementById('conflict-summary-banner');
            if (banner) banner.innerHTML = '';
            return;
        }

        const days = [
            { key: 'Day 1', label: 'DAY 1 // 2026-07-10 (FRIDAY)' },
            { key: 'Day 2', label: 'DAY 2 // 2026-07-11 (SATURDAY)' },
            { key: 'Day 3', label: 'DAY 3 // 2026-07-12 (SUNDAY)' }
        ];

        let html = '';
        let totalConflictsCount = 0;
        let totalRuntimeMinutes = 0;

        days.forEach(d => {
            const dayFavs = favs.filter(f => isItemInDay(f, d.key));

            html += `<section class="wf-box" style="margin-bottom: 14px;">`;
            html += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">`;
            html += `<h3>[ ${d.label} ]</h3>`;
            html += `<span style="font-size: 0.82rem; color: #555;">[ ${dayFavs.length} SLOTS BOOKMARKED ]</span>`;
            html += `</div><hr>`;

            if (dayFavs.length === 0) {
                html += `<p style="color: #666; font-style: italic;">[ 0 records logged for this festival cycle. ]</p>`;
                html += `<div style="margin-top: 8px;"><a href="program.html" class="btn-box" style="font-size: 0.82rem;">[ CMD: BROWSE_PROGRAM &rarr; ]</a></div>`;
            } else {
                // Chronological sort using +1440m post-midnight math
                dayFavs.sort((a, b) => {
                    const sA = (a.time || '').split(/[–—-]/)[0].trim();
                    const sB = (b.time || '').split(/[–—-]/)[0].trim();
                    return timeToMinutes(sA) - timeToMinutes(sB);
                });

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

                    // Duration estimate
                    const parts = (item.time || '').split(/[–—-]/).map(s => s.trim());
                    if (parts.length >= 2) {
                        const dur = timeToMinutes(parts[1]) - timeToMinutes(parts[0]);
                        if (dur > 0) totalRuntimeMinutes += dur;
                    }

                    const cardBorder = hasConflict
                        ? 'border: 2px solid #b71c1c; background: #ffebee;'
                        : 'border: 1px solid #777777; background: #fafafa;';

                    const badgeHtml = hasConflict
                        ? `<div class="conflict-warning-badge">[ ⚠️ Time conflict with: ${conflictingArtists.join(', ')} ]</div>`
                        : `<div class="clear-status-badge">[ ✓ No time conflict ]</div>`;

                    html += `
                        <article class="col wf-box-sub" style="${cardBorder}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                <h4 style="font-size: 0.95rem;">[ ${item.time} // ${item.artist} ]</h4>
                                <button class="btn-box btn-box-danger remove-show-btn" data-id="${item.id}" style="padding: 4px 8px; font-size: 0.78rem; min-height: 44px; min-width: 44px;">
                                    [ DEL ]
                                </button>
                            </div>
                            <p style="margin-top: 6px;"><strong>[ STAGE:</strong> ${item.stage} <strong>]</strong></p>
                            <p><strong>[ GENRE:</strong> ${item.genre} <strong>]</strong></p>
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

        // Update Conflict Summary Banner
        const bannerContainer = document.getElementById('conflict-summary-banner');
        if (bannerContainer) {
            if (totalConflictsCount > 0) {
                bannerContainer.innerHTML = `
                    <div class="wf-box has-conflict" style="margin-bottom: 12px;">
                        <strong style="color: #b71c1c; font-size: 0.95rem;">[ ⚠️ TIME CONFLICT ALERT: ${totalConflictsCount} CLASH(ES) DETECTED ]</strong>
                        <p style="font-size: 0.85rem; color: #7f0000; margin-top: 4px;">
                            Concurrent stage overlap detected across Solar Horizon Stage and Lunar Forest Dome. Review red highlighted cards below to resolve logistics.
                        </p>
                    </div>
                `;
            } else {
                bannerContainer.innerHTML = `
                    <div class="wf-box" style="border: 1px solid #28a745; background: #f4fff4; margin-bottom: 12px;">
                        <strong style="color: #1e7e34; font-size: 0.95rem;">[ ✓ STATUS: 0 CLASHES DETECTED // ITINERARY VERIFIED ]</strong>
                        <p style="font-size: 0.85rem; color: #2e7d32; margin-top: 4px;">
                            All ${favs.length} saved performances have clear, non-overlapping time envelopes.
                        </p>
                    </div>
                `;
            }
        }

        // Summary Stats Display
        const statsEl = document.getElementById('terminal-itinerary-stats');
        if (statsEl) {
            statsEl.textContent = `[ SUMMARY: ${favs.length} SHOWS | ${totalConflictsCount} CLASHES | ~${totalRuntimeMinutes} MIN RUNTIME ]`;
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

    // Window Export for Testing & Showcase Hub
    window.DenseTerminalApp = {
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
