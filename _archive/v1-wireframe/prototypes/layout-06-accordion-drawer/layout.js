/**
 * Festival of Darkness 2 – Layout 06: Accordion Drawer Hub Engine
 * Standalone client-side controller supporting:
 * - Zero-scroll progressive disclosure accordion drawers (<details>/<summary>)
 * - Expand All / Collapse All global drawer controls
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
        const clean = timeStr.trim().split('–')[0].split('-')[0].trim();
        const parts = clean.split(':');
        if (parts.length < 2) return 0;
        let hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        if (isNaN(hours) || isNaN(minutes)) return 0;
        // Post-midnight festival hours (< 08:00) roll into next calendar day (+1440 mins)
        if (hours < 8) {
            hours += 24;
        }
        return (hours * 60) + minutes;
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
        let added = false;
        if (index > -1) {
            favs.splice(index, 1);
            added = false;
        } else {
            favs.push({
                id: eventData.id,
                artist: eventData.artist || eventData.name,
                stage: eventData.stage,
                day: eventData.day,
                time: eventData.time,
                genre: eventData.genre || 'Electronic / Alternative'
            });
            added = true;
        }
        saveFavorites(favs);
        updateUIFavorites();
        return { added, favs };
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
            const starBtn = el.querySelector('.btn-fav-star, .sch-fav-btn, .artist-fav-btn');
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

        // Re-render my-schedule if on that page
        if (document.getElementById('my-schedule-container')) {
            renderMySchedulePage();
        }
    }

    // -------------------------------------------------------------
    // Conflict Detection Engine
    // -------------------------------------------------------------
    function detectConflicts(items) {
        const list = Array.isArray(items) ? items : getFavorites();
        const conflicts = [];
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                const a = list[i];
                const b = list[j];
                const dayA = a.day || '';
                const dayB = b.day || '';
                const sameDay = dayA === dayB ||
                    (dayA.includes('Day 1') && dayB.includes('Day 1')) ||
                    (dayA.includes('Day 2') && dayB.includes('Day 2')) ||
                    (dayA.includes('Day 3') && dayB.includes('Day 3'));
                if (sameDay && a.stage !== b.stage && isOverlapping(a.time, b.time)) {
                    conflicts.push({
                        itemA: a,
                        itemB: b,
                        reason: `${a.artist} (${a.time}) on ${a.stage} conflicts with ${b.artist} (${b.time}) on ${b.stage}`
                    });
                }
            }
        }
        return conflicts;
    }

    // -------------------------------------------------------------
    // Data Resolver
    // -------------------------------------------------------------
    function getData() {
        if (typeof window.FESTIVAL_DATA !== 'undefined') {
            return window.FESTIVAL_DATA;
        }
        return null;
    }

    // -------------------------------------------------------------
    // Accordion Global Controls (Expand All / Collapse All)
    // -------------------------------------------------------------
    function setupGlobalAccordionControls() {
        const expandBtns = document.querySelectorAll('[data-action="expand-all"]');
        const collapseBtns = document.querySelectorAll('[data-action="collapse-all"]');

        expandBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('details.wf-drawer, details.wf-drawer-sub').forEach(d => {
                    d.open = true;
                });
            });
        });

        collapseBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('details.wf-drawer, details.wf-drawer-sub').forEach(d => {
                    d.open = false;
                });
            });
        });
    }

    // -------------------------------------------------------------
    // Program Page: Accordion Day & Time Window Drawers
    // -------------------------------------------------------------
    let currentStageFilter = 'all'; // 'solar' | 'lunar' | 'all'
    let currentDayFilter = 'all';     // 'day1' | 'day2' | 'day3' | 'all'
    let currentGenreFilter = 'all';
    let currentFavOnly = false;
    let currentSearchQuery = '';

    function initProgramPage() {
        const container = document.getElementById('accordion-program-container');
        if (!container) return;

        // Parse query params for scenario 1 fast path (?stage=lunar or #stage-lunar)
        const params = new URLSearchParams(window.location.search);
        const stageParam = params.get('stage') || (window.location.hash.includes('lunar') ? 'lunar' : (window.location.hash.includes('solar') ? 'solar' : null));
        if (stageParam && ['solar', 'lunar', 'all'].includes(stageParam)) {
            currentStageFilter = stageParam;
        }
        const dayParam = params.get('day');
        if (dayParam && ['day1', 'day2', 'day3', 'all'].includes(dayParam)) {
            currentDayFilter = dayParam;
        }

        // Setup Stage buttons
        const stageBtns = document.querySelectorAll('[data-filter-stage]');
        stageBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter-stage') === currentStageFilter);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentStageFilter = btn.getAttribute('data-filter-stage');
                stageBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderSchedule();
            });
        });

        // Setup Day buttons
        const dayBtns = document.querySelectorAll('[data-filter-day]');
        dayBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-filter-day') === currentDayFilter);
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentDayFilter = btn.getAttribute('data-filter-day');
                dayBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderSchedule();
            });
        });

        // Setup Genre buttons
        const genreBtns = document.querySelectorAll('[data-filter-genre]');
        genreBtns.forEach(btn => {
            genreBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-genre') === currentGenreFilter));
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentGenreFilter = btn.getAttribute('data-filter-genre');
                genreBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderSchedule();
            });
        });

        // Setup Bookmarked Only
        const favOnlyBtn = document.getElementById('filter-fav-only');
        if (favOnlyBtn) {
            favOnlyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                currentFavOnly = !currentFavOnly;
                favOnlyBtn.classList.toggle('active', currentFavOnly);
                renderSchedule();
            });
        }

        // Setup Search
        const searchInput = document.getElementById('program-search-input');
        const clearBtn = document.getElementById('clear-search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchQuery = e.target.value.trim().toLowerCase();
                renderSchedule();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentSearchQuery = '';
                renderSchedule();
            });
        }

        // Initial render
        renderSchedule();
    }

    function categorizeTimeWindow(timeStart) {
        // Afternoon: 13:00–17:59, Evening: 18:00–22:59, Night: 23:00–04:00
        const m = timeToMinutes(timeStart);
        // 13:00 is 780, 18:00 is 1080, 23:00 is 1380
        if (m < 1080) {
            return { id: 'afternoon', label: 'Afternoon (13:00–18:00)' };
        } else if (m < 1380) {
            return { id: 'evening', label: 'Evening (18:00–23:00)' };
        } else {
            return { id: 'night', label: 'Night (23:00–04:00)' };
        }
    }

    function renderSchedule() {
        const container = document.getElementById('accordion-program-container');
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
            if (currentStageFilter !== 'all' && item.stageId !== currentStageFilter) return false;
            if (currentDayFilter !== 'all' && item.dayKey !== currentDayFilter) return false;
            if (currentGenreFilter !== 'all' && !item.genre.toLowerCase().includes(currentGenreFilter.toLowerCase())) return false;
            if (currentFavOnly && !favIds.has(item.id)) return false;
            if (currentSearchQuery) {
                const match = item.artist.toLowerCase().includes(currentSearchQuery) ||
                              item.genre.toLowerCase().includes(currentSearchQuery) ||
                              item.stage.toLowerCase().includes(currentSearchQuery);
                if (!match) return false;
            }
            return true;
        });

        // Update stats
        const statusEl = document.getElementById('program-status-count');
        if (statusEl) {
            statusEl.textContent = `[ Showing ${filtered.length} of ${data.SCHEDULE.length} performance slots ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                    <p><strong>[ No performances match the selected filters. ]</strong></p>
                    <p>Try resetting stage or genre filters, or clearing your search term.</p>
                </div>
            `;
            return;
        }

        // Group by Day, then by Time Window
        const daysDef = [
            { key: 'day1', title: 'Friday, July 10, 2026', badge: 'Day 1' },
            { key: 'day2', title: 'Saturday, July 11, 2026', badge: 'Day 2' },
            { key: 'day3', title: 'Sunday, July 12, 2026', badge: 'Day 3' }
        ];

        let html = '';

        daysDef.forEach((dayDef, dayIdx) => {
            const dayItems = filtered.filter(item => item.dayKey === dayDef.key);
            if (dayItems.length === 0) return;

            // Group into time windows
            const windows = [
                { id: 'afternoon', label: 'Afternoon Block (13:00–18:00)', items: [] },
                { id: 'evening', label: 'Evening Block (18:00–23:00)', items: [] },
                { id: 'night', label: 'Night Block (23:00–04:00)', items: [] }
            ];

            dayItems.forEach(item => {
                const tw = categorizeTimeWindow(item.timeStart);
                const win = windows.find(w => w.id === tw.id);
                if (win) {
                    win.items.push(item);
                }
            });

            // Is day drawer open? Default open first matching day or if filtered by day or stage
            const isOpen = (currentDayFilter === dayDef.key) || (currentDayFilter === 'all' && dayIdx === 0) || (currentStageFilter === 'lunar');

            html += `
                <details class="wf-drawer" ${isOpen ? 'open' : ''} data-day="${dayDef.key}">
                    <summary>
                        <div class="drawer-summary-title">
                            <span>📅 [ ${dayDef.title} ]</span>
                            <span class="drawer-badge">${dayItems.length} shows</span>
                        </div>
                        <span class="drawer-icon">▼</span>
                    </summary>
                    <div class="drawer-body">
            `;

            windows.forEach(win => {
                if (win.items.length === 0) return;

                html += `
                    <details class="wf-drawer-sub" open data-window="${win.id}">
                        <summary>
                            <div class="drawer-summary-title">
                                <span>⏰ [ ${win.label} ]</span>
                                <span class="drawer-badge">${win.items.length} acts</span>
                            </div>
                            <span class="drawer-icon">▼</span>
                        </summary>
                        <div class="drawer-sub-body">
                `;

                win.items.forEach(item => {
                    const isFav = favIds.has(item.id);
                    const isLunar = item.stageId === 'lunar';

                    html += `
                        <div class="sch-cell ${isFav ? 'is-favourite' : ''}" data-id="${item.id}" id="sch-${item.id}">
                            <div class="sch-cell-info">
                                <div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                                    <strong><a href="artists.html#${item.id}" style="color: #111; text-decoration: underline;">${item.artist}</a></strong>
                                    <span style="font-family: monospace; font-size: 0.95rem; font-weight: bold;">[ ${item.time} ]</span>
                                </div>
                                <div style="font-size: 0.85rem; color: #444; margin-top: 4px;">
                                    <span>Genre: <em>${item.genre}</em></span> &bull; 
                                    <span class="stage-badge ${isLunar ? 'stage-badge-lunar' : ''}">
                                        ${item.stage} ${isLunar ? '(Covered Shelter)' : '(Open-Air)'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <button class="btn-fav-star" data-action="toggle-fav" data-id="${item.id}" title="${isFav ? 'Remove from My Schedule' : 'Add to My Schedule'}" aria-label="${isFav ? 'Remove from My Schedule' : 'Add to My Schedule'}">
                                    ${isFav ? '★' : '☆'}
                                </button>
                            </div>
                        </div>
                    `;
                });

                html += `
                        </div>
                    </details>
                `;
            });

            html += `
                    </div>
                </details>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners for bookmark stars
        container.querySelectorAll('[data-action="toggle-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const schItem = data.SCHEDULE.find(s => s.id === id);
                if (schItem) {
                    toggleFavorite(schItem);
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Artists Page: Genre Accordion Drawers & Deep-Linking
    // -------------------------------------------------------------
    let currentArtistGenre = 'all';
    let currentArtistSearch = '';

    function initArtistsPage() {
        const container = document.getElementById('accordion-artists-container');
        if (!container) return;

        // Setup Genre Filter Buttons
        const genreBtns = document.querySelectorAll('[data-filter-genre]');
        genreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                currentArtistGenre = btn.getAttribute('data-filter-genre');
                genreBtns.forEach(b => b.classList.toggle('active', b === btn));
                renderArtists();
            });
        });

        // Setup Search
        const searchInput = document.getElementById('artist-search-input');
        const clearBtn = document.getElementById('clear-artist-search-btn');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentArtistSearch = e.target.value.trim().toLowerCase();
                renderArtists();
            });
        }
        if (clearBtn && searchInput) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                currentArtistSearch = '';
                renderArtists();
            });
        }

        // Render Artists
        renderArtists();

        // Handle Deep Linking (#perf-XX)
        handleArtistDeepLink();
        window.addEventListener('hashchange', handleArtistDeepLink);
    }

    function handleArtistDeepLink() {
        const hash = window.location.hash;
        if (!hash || !hash.startsWith('#perf-')) return;
        const targetId = hash.substring(1);
        const targetEl = document.getElementById(targetId) || document.querySelector(`[data-id="${targetId}"]`);
        if (targetEl) {
            // Expand all parent details elements
            let parent = targetEl.parentElement;
            while (parent) {
                if (parent.tagName === 'DETAILS') {
                    parent.open = true;
                }
                parent = parent.parentElement;
            }
            if (targetEl.tagName === 'DETAILS') {
                targetEl.open = true;
            }
            setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }

    function renderArtists() {
        const container = document.getElementById('accordion-artists-container');
        if (!container) return;

        const data = getData();
        if (!data || !data.PERFORMERS) {
            container.innerHTML = '<div class="wf-box-sub"><p>[ Loading 60 performers... ]</p></div>';
            return;
        }

        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        // Filter performers
        const filtered = data.PERFORMERS.filter(p => {
            if (currentArtistGenre !== 'all' && !p.genre.toLowerCase().includes(currentArtistGenre.toLowerCase())) {
                return false;
            }
            if (currentArtistSearch) {
                const match = p.name.toLowerCase().includes(currentArtistSearch) ||
                              p.genre.toLowerCase().includes(currentArtistSearch) ||
                              p.bio.toLowerCase().includes(currentArtistSearch) ||
                              p.origin.toLowerCase().includes(currentArtistSearch) ||
                              p.stage.toLowerCase().includes(currentArtistSearch);
                if (!match) return false;
            }
            return true;
        });

        // Status update
        const statusEl = document.getElementById('artists-status-count');
        if (statusEl) {
            statusEl.textContent = `[ Showing ${filtered.length} of ${data.PERFORMERS.length} performers ]`;
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                    <p><strong>[ No performers match your search criteria. ]</strong></p>
                    <p>Try clearing your search input or switching genre filters.</p>
                </div>
            `;
            return;
        }

        // Group into primary musical styles for accordions
        const genreGroups = [
            { id: 'ambient-postrock', title: 'Post-Rock, Ambient & Dream Pop', match: ['ambient', 'post-rock', 'dream pop', 'shoegaze', 'indie', 'modern classical'] },
            { id: 'techno-darkwave', title: 'Dark Techno, EBM & Acid', match: ['techno', 'dark techno', 'industrial techno', 'ebm', 'acid', 'electro'] },
            { id: 'synth-electronic', title: 'Synthwave, Darkwave & IDM', match: ['synth', 'darkwave', 'idm', 'glitch', 'downtempo', 'electronica'] },
            { id: 'noise-experimental', title: 'Industrial, Noise & Experimental', match: ['industrial', 'noise', 'experimental', 'drone', 'power electronics'] }
        ];

        let html = '';

        genreGroups.forEach((group, gIdx) => {
            // Find performers belonging to this group
            const groupPerfs = filtered.filter(p => {
                const gLower = p.genre.toLowerCase();
                return group.match.some(m => gLower.includes(m));
            });

            // Also check for any remaining performers in last group
            let itemsToRender = groupPerfs;
            if (gIdx === genreGroups.length - 1) {
                const allAssignedIds = new Set(
                    genreGroups.slice(0, -1).flatMap(grp => 
                        filtered.filter(p => grp.match.some(m => p.genre.toLowerCase().includes(m))).map(p => p.id)
                    )
                );
                itemsToRender = filtered.filter(p => !allAssignedIds.has(p.id));
            }

            if (itemsToRender.length === 0) return;

            // Open if search active or first group
            const isOpen = Boolean(currentArtistSearch) || gIdx === 0;

            html += `
                <details class="wf-drawer" ${isOpen ? 'open' : ''} data-genre-group="${group.id}">
                    <summary>
                        <div class="drawer-summary-title">
                            <span>🎸 [ ${group.title} ]</span>
                            <span class="drawer-badge">${itemsToRender.length} performers</span>
                        </div>
                        <span class="drawer-icon">▼</span>
                    </summary>
                    <div class="drawer-body">
            `;

            itemsToRender.forEach(p => {
                const isFav = favIds.has(p.id);
                const isLunar = p.stageId === 'lunar';

                html += `
                    <details class="wf-drawer-sub artist-card ${isFav ? 'is-favourite' : ''}" data-id="${p.id}" id="${p.id}">
                        <summary>
                            <div class="drawer-summary-title">
                                <span><strong>${p.name}</strong> [${p.origin}] &bull; <em>${p.genre}</em></span>
                                <span class="stage-badge ${isLunar ? 'stage-badge-lunar' : ''}">
                                    ${p.stage}
                                </span>
                            </div>
                            <span class="drawer-icon">▼</span>
                        </summary>
                        <div class="drawer-sub-body">
                            <div class="artist-card-header">
                                <div>
                                    <h4 style="margin-bottom: 4px;">[ ${p.name} (${p.origin}) ]</h4>
                                    <p style="font-size: 0.88rem; color: #333; margin-bottom: 6px;">
                                        <strong>Stage:</strong> ${p.stage} ${isLunar ? '(Covered Dome)' : '(Open-Air)'}<br>
                                        <strong>Performance Slot:</strong> ${p.day} &bull; ${p.time}
                                    </p>
                                </div>
                                <div>
                                    <button class="btn-box ${isFav ? 'active' : ''}" data-action="toggle-artist-fav" data-id="${p.id}">
                                        ${isFav ? '★ Saved to Schedule' : '☆ Add to My Schedule'}
                                    </button>
                                </div>
                            </div>
                            <hr>
                            <p style="font-size: 0.92rem; line-height: 1.5; margin-bottom: 10px;">
                                ${p.bio}
                            </p>
                            <div style="background: #eee; border: 1px solid #777; padding: 8px 12px; margin-top: 8px; font-size: 0.85rem;">
                                <strong>[ Audio Preview (Wireframe Placeholder) ]:</strong> 30s mastered festival sample &bull; <em>"${p.name} - Live at Festival of Darkness 2026"</em>
                            </div>
                            <div style="margin-top: 8px; font-size: 0.82rem; color: #666;">
                                Direct Link: <a href="#${p.id}">#${p.id}</a> &bull; <a href="program.html?stage=${p.stageId}">View on Stage Timetable &rarr;</a>
                            </div>
                        </div>
                    </details>
                `;
            });

            html += `
                    </div>
                </details>
            `;
        });

        container.innerHTML = html;

        // Attach event listeners for bookmark buttons
        container.querySelectorAll('[data-action="toggle-artist-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const perf = data.PERFORMERS.find(p => p.id === id);
                if (perf) {
                    toggleFavorite(perf);
                }
            });
        });
    }

    // -------------------------------------------------------------
    // Stages Page: Collapsible Stage Specifications & Scenario 1 Fast Path
    // -------------------------------------------------------------
    function initStagesPage() {
        const hash = window.location.hash;
        if (hash === '#stage-lunar' || hash === '#lunar') {
            const lunarDrawer = document.getElementById('drawer-lunar-stage');
            if (lunarDrawer) lunarDrawer.open = true;
        } else if (hash === '#stage-solar' || hash === '#solar') {
            const solarDrawer = document.getElementById('drawer-solar-stage');
            if (solarDrawer) solarDrawer.open = true;
        }
    }

    // -------------------------------------------------------------
    // My Schedule Page: Pairwise Conflict Detection & Day Drawers
    // -------------------------------------------------------------
    function initMySchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        // Seed buttons
        const seedConflictBtn = document.getElementById('seed-conflict-btn');
        const seedCleanBtn = document.getElementById('seed-clean-btn');
        const clearAllBtn = document.getElementById('clear-all-favs-btn');

        if (seedConflictBtn) {
            seedConflictBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const conflictPair = [
                    { id: 'perf-02', artist: 'Velvet Morning', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:45', genre: 'Dream Pop' },
                    { id: 'perf-11', artist: 'Subtle Resonances', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '15:00 – 15:50', genre: 'Modular Ambient' }
                ];
                saveFavorites(conflictPair);
                updateUIFavorites();
            });
        }

        if (seedCleanBtn) {
            seedCleanBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const cleanList = [
                    { id: 'perf-01', artist: 'Echoes of Light', stage: 'Solar Horizon Stage', day: 'Day 1 (Friday, July 10)', time: '14:00 – 14:45', genre: 'Post-Rock / Ambient' },
                    { id: 'perf-12', artist: 'Binary Fields', stage: 'Lunar Forest Dome', day: 'Day 1 (Friday, July 10)', time: '16:05 – 17:00', genre: 'IDM / Glitch' }
                ];
                saveFavorites(cleanList);
                updateUIFavorites();
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Clear all saved bookmarks from your personal schedule?')) {
                    saveFavorites([]);
                    updateUIFavorites();
                }
            });
        }

        // Render schedule
        renderMySchedulePage();
    }

    function renderMySchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const favs = getFavorites();
        const conflicts = detectConflicts(favs);

        // Update overall summary bar
        const totalSavedEl = document.getElementById('my-total-saved');
        const totalConflictsEl = document.getElementById('my-total-conflicts');
        const conflictAlertBanner = document.getElementById('my-conflict-alert-banner');

        if (totalSavedEl) totalSavedEl.textContent = favs.length;
        if (totalConflictsEl) totalConflictsEl.textContent = conflicts.length;

        if (conflictAlertBanner) {
            if (conflicts.length > 0) {
                conflictAlertBanner.style.display = 'block';
                conflictAlertBanner.className = 'conflict-alert-box';
                conflictAlertBanner.innerHTML = `
                    <strong>[ ⚠️ Schedule Clash Detected: ${conflicts.length} Overlapping Show${conflicts.length > 1 ? 's' : ''}! ]</strong><br>
                    <span>You have bookmarked simultaneous performances on different stages. Review the highlighted red cards below.</span>
                `;
            } else if (favs.length > 0) {
                conflictAlertBanner.style.display = 'block';
                conflictAlertBanner.className = 'clear-alert-box';
                conflictAlertBanner.innerHTML = `
                    <strong>[ ✓ No time conflicts detected. All ${favs.length} performances have clear time slots! ]</strong>
                `;
            } else {
                conflictAlertBanner.style.display = 'none';
            }
        }

        if (favs.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 28px;">
                    <h3>[ No Performances Bookmarked Yet ]</h3>
                    <p>You have not added any shows to your personal schedule.</p>
                    <p style="margin-top: 10px;">
                        <a href="program.html" class="btn-box active">[ Browse Timetable & Add Shows &rarr; ]</a>
                        <a href="artists.html" class="btn-box">[ Explore 60 Artists Catalog &rarr; ]</a>
                    </p>
                </div>
            `;
            return;
        }

        // Set of conflicting IDs for quick lookup
        const conflictMap = new Map();
        conflicts.forEach(c => {
            if (!conflictMap.has(c.itemA.id)) conflictMap.set(c.itemA.id, []);
            if (!conflictMap.has(c.itemB.id)) conflictMap.set(c.itemB.id, []);
            conflictMap.get(c.itemA.id).push(c.itemB);
            conflictMap.get(c.itemB.id).push(c.itemA);
        });

        // Group into Day Drawers
        const daysDef = [
            { key: 'Day 1', label: 'Friday, July 10, 2026' },
            { key: 'Day 2', label: 'Saturday, July 11, 2026' },
            { key: 'Day 3', label: 'Sunday, July 12, 2026' }
        ];

        let html = '';

        daysDef.forEach(dayDef => {
            const dayItems = favs.filter(f => (f.day || '').includes(dayDef.key));
            if (dayItems.length === 0) return;

            // Sort chronologically
            dayItems.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

            html += `
                <details class="wf-drawer" open data-day="${dayDef.key}">
                    <summary>
                        <div class="drawer-summary-title">
                            <span>📅 [ ${dayDef.label} ]</span>
                            <span class="drawer-badge">${dayItems.length} saved show${dayItems.length > 1 ? 's' : ''}</span>
                        </div>
                        <span class="drawer-icon">▼</span>
                    </summary>
                    <div class="drawer-body">
            `;

            dayItems.forEach(item => {
                const hasConflict = conflictMap.has(item.id);
                const opposingItems = hasConflict ? conflictMap.get(item.id) : [];

                html += `
                    <div class="sch-cell ${hasConflict ? 'is-conflict' : 'wf-box-sub'}" style="margin-bottom: 12px; border: ${hasConflict ? '2px solid #b71c1c' : '1px solid #777'}; background: ${hasConflict ? '#ffebee' : '#fafafa'}; padding: 12px;" data-id="${item.id}">
                        <div class="sch-cell-info">
                            <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px;">
                                <strong style="font-size: 1.05rem;">
                                    <a href="artists.html#${item.id}" style="color: #111; text-decoration: underline;">${item.artist}</a>
                                </strong>
                                <span style="font-family: monospace; font-size: 1rem; font-weight: bold;">[ ${item.time} ]</span>
                            </div>
                            <div style="font-size: 0.88rem; color: #444; margin-top: 4px;">
                                <span><strong>Stage:</strong> ${item.stage}</span> &bull; 
                                <span><strong>Genre:</strong> ${item.genre}</span>
                            </div>
                            <div style="margin-top: 8px;">
                                ${hasConflict 
                                    ? `<div class="conflict-alert-box">[ ⚠️ Time conflict with: ${opposingItems.map(o => `${o.artist} (${o.time} on ${o.stage})`).join('; ')} ]</div>`
                                    : `<div class="clear-alert-box">[ ✓ No time conflict ]</div>`
                                }
                            </div>
                        </div>
                        <div>
                            <button class="btn-box" data-action="remove-fav" data-id="${item.id}" title="Remove from My Schedule" aria-label="Remove from My Schedule">
                                [ Remove &times; ]
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </details>
            `;
        });

        container.innerHTML = html;

        // Attach remove buttons
        container.querySelectorAll('[data-action="remove-fav"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const id = btn.getAttribute('data-id');
                const favs = getFavorites();
                const updated = favs.filter(f => f.id !== id);
                saveFavorites(updated);
                updateUIFavorites();
            });
        });
    }

    // -------------------------------------------------------------
    // Page Initializer on DOMContentLoaded
    // -------------------------------------------------------------
    document.addEventListener('DOMContentLoaded', () => {
        setupGlobalAccordionControls();
        updateUIFavorites();

        // Identify current page
        const path = window.location.pathname;
        if (path.endsWith('program.html') || document.getElementById('accordion-program-container')) {
            initProgramPage();
        } else if (path.endsWith('artists.html') || document.getElementById('accordion-artists-container')) {
            initArtistsPage();
        } else if (path.endsWith('stages.html') || document.getElementById('drawer-lunar-stage')) {
            initStagesPage();
        } else if (path.endsWith('my-schedule.html') || document.getElementById('my-schedule-container')) {
            initMySchedulePage();
        }
    });

})();
