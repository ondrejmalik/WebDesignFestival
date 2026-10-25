/**
 * Festival of Darkness 2 — Layout 02: Chronological Feed
 * Standalone Client-side Logic Engine
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    // Helper: LocalStorage operations
    function getFavorites() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.warn('LocalStorage access failed:', e);
            return [];
        }
    }

    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
            window.dispatchEvent(new CustomEvent('festival_favorites_updated', { detail: favs }));
        } catch (e) {
            console.warn('Failed to save to LocalStorage:', e);
        }
    }

    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(f => f.id === id);
    }

    function toggleFavorite(item) {
        const favs = getFavorites();
        const index = favs.findIndex(f => f.id === item.id);
        let added = false;
        if (index > -1) {
            favs.splice(index, 1);
            added = false;
        } else {
            favs.push({
                id: item.id,
                artist: item.name || item.artist,
                stage: item.stage,
                day: item.day,
                time: item.time,
                genre: item.genre
            });
            added = true;
        }
        saveFavorites(favs);
        return { favs, added };
    }

    // Time calculations (+1440 min post-midnight math)
    function timeToMinutes(tStr) {
        if (!tStr || typeof tStr !== 'string') return 0;
        const parts = tStr.split(':').map(Number);
        if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
        let mins = parts[0] * 60 + parts[1];
        if (parts[0] < 8) {
            mins += 24 * 60; // Post-midnight hours (00:00 - 07:59) add 1440 minutes
        }
        return mins;
    }

    // Interval overlap detection (en-dash and ASCII hyphen resilient)
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

    // Pairwise collision detection
    function detectConflicts(favs) {
        const list = Array.isArray(favs) ? favs : getFavorites();
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

    // Update navigation favorite count
    function updateNavBadge() {
        const count = getFavorites().length;
        document.querySelectorAll('.nav-fav-count').forEach(el => {
            el.textContent = count > 0 ? `(${count})` : '';
        });
    }

    // Highlight active link in header nav
    function highlightActiveNav() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.wf-nav-inline a').forEach(a => {
            const href = a.getAttribute('href');
            if (href === currentPath) {
                a.classList.add('active');
            } else {
                a.classList.remove('active');
            }
        });
    }

    // =========================================================================
    // Program / Chronological Feed Page Logic
    // =========================================================================
    function initScheduleFeed() {
        const feedContainer = document.getElementById('feed-stream-container');
        if (!feedContainer) return;

        const dataModule = window.FESTIVAL_DATA;
        if (!dataModule || !dataModule.SCHEDULE) {
            feedContainer.innerHTML = '<div class="wf-box-sub"><p>[ Loading festival data... ]</p></div>';
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        let activeDay = urlParams.get('day') || 'all';
        let activeStage = urlParams.get('stage') || 'all';
        let activeGenre = urlParams.get('genre') || 'all';
        let onlyBookmarked = urlParams.get('bookmarked') === '1';

        // Ribbon elements
        const dayPills = document.querySelectorAll('[data-filter-day]');
        const stagePills = document.querySelectorAll('[data-filter-stage]');
        const genreSelect = document.getElementById('filter-genre-select');
        const bookmarkToggle = document.getElementById('filter-bookmark-toggle');
        const feedSummary = document.getElementById('feed-summary-text');

        function updateRibbonUI() {
            dayPills.forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-filter-day') === activeDay);
            });
            stagePills.forEach(p => {
                p.classList.toggle('active', p.getAttribute('data-filter-stage') === activeStage);
            });
            if (genreSelect) genreSelect.value = activeGenre;
            if (bookmarkToggle) {
                bookmarkToggle.classList.toggle('active', onlyBookmarked);
                const count = getFavorites().length;
                bookmarkToggle.textContent = onlyBookmarked ? `★ Bookmarked Only (${count})` : `★ Bookmarked Only (${count})`;
            }
        }

        function renderSchedule() {
            updateRibbonUI();
            const allItems = dataModule.SCHEDULE;

            const filtered = allItems.filter(item => {
                const matchesDay = activeDay === 'all' || item.dayKey === activeDay;
                const matchesStage = activeStage === 'all' || item.stageId === activeStage;
                const matchesGenre = activeGenre === 'all' || item.genre.toLowerCase().includes(activeGenre.toLowerCase());
                const matchesFav = !onlyBookmarked || isFavorite(item.perfId);
                return matchesDay && matchesStage && matchesGenre && matchesFav;
            });

            if (feedSummary) {
                feedSummary.textContent = `Showing ${filtered.length} of ${allItems.length} scheduled acts | Filters: Day: ${activeDay.toUpperCase()}, Stage: ${activeStage.toUpperCase()}${onlyBookmarked ? ', Bookmarked Only' : ''}`;
            }

            if (filtered.length === 0) {
                feedContainer.innerHTML = `
                    <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                        <p><strong>[ No scheduled performances match the selected filters. ]</strong></p>
                        <p style="margin: 8px 0;">[ Try switching day or stage, or clearing your genre filter. ]</p>
                        <button type="button" class="btn-box" id="btn-reset-filters" style="margin-top: 8px;">[ Reset All Filters ]</button>
                    </div>
                `;
                const resetBtn = document.getElementById('btn-reset-filters');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        activeDay = 'all';
                        activeStage = 'all';
                        activeGenre = 'all';
                        onlyBookmarked = false;
                        renderSchedule();
                    });
                }
                return;
            }

            let html = '';
            let currentDayKey = null;

            filtered.forEach(item => {
                if (item.dayKey !== currentDayKey) {
                    currentDayKey = item.dayKey;
                    html += `
                        <div class="feed-day-divider">
                            📅 ${item.day}
                        </div>
                    `;
                }

                const perf = (dataModule.PERFORMERS || []).find(p => p.id === item.perfId || p.id === item.id) || {};
                const artistName = item.artist || item.performerName || perf.name || 'Unknown Performer';
                const bioText = perf.bio || item.bio || item.genre || '';
                const isFav = isFavorite(item.perfId || item.id);
                const favClass = isFav ? 'is-favourite' : '';
                const starActive = isFav ? 'active' : '';
                const isLunar = item.stageId === 'lunar';
                const stageBadgeClass = isLunar ? 'badge-lunar' : 'badge-solar';
                const stageIcon = isLunar ? '🌧️' : '☀️';

                let durationMins = item.durationMins;
                if (!durationMins && item.timeStart && item.timeEnd) {
                    const startM = timeToMinutes(item.timeStart);
                    const endM = timeToMinutes(item.timeEnd);
                    durationMins = endM >= startM ? endM - startM : (endM + 1440 - startM);
                }
                if (!durationMins) durationMins = 45;

                html += `
                    <article class="feed-item sch-item ${favClass}" id="sch-${item.id}" data-perf-id="${item.perfId || item.id}">
                        <div class="feed-item-header">
                            <div class="feed-item-badges">
                                <span class="badge badge-time">⏰ ${item.time}</span>
                                <span class="badge ${stageBadgeClass}">${stageIcon} ${item.stage}</span>
                                <span class="badge badge-genre">${item.genre}</span>
                            </div>
                            <button type="button" class="btn-star ${starActive}" data-action="toggle-fav" data-id="${item.perfId || item.id}" data-name="${artistName}" data-stage="${item.stage}" data-day="${item.day}" data-time="${item.time}" data-genre="${item.genre}" aria-label="Bookmark ${artistName}">
                                ${isFav ? '★ Saved' : '☆ Bookmark'}
                            </button>
                        </div>
                        <h3 class="feed-item-title">
                            <a href="artists.html#${item.perfId || item.id}">[ ${artistName} ] (${item.origin || perf.origin || ''})</a>
                        </h3>
                        <p class="feed-item-bio">${bioText}</p>
                        <div class="feed-item-footer">
                            <small style="color: #666;">Set duration: ${durationMins} min | Slot: #${item.id}</small>
                            <a href="artists.html#${item.perfId || item.id}" class="btn-box" style="padding: 4px 10px; font-size: 0.82rem; min-height: 44px; display: inline-flex; align-items: center;">[ View Performer Bio &rarr; ]</a>
                        </div>
                    </article>
                `;
            });

            feedContainer.innerHTML = html;
            attachFavListeners();
        }

        function attachFavListeners() {
            feedContainer.querySelectorAll('[data-action="toggle-fav"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = {
                        id: btn.getAttribute('data-id'),
                        name: btn.getAttribute('data-name'),
                        stage: btn.getAttribute('data-stage'),
                        day: btn.getAttribute('data-day'),
                        time: btn.getAttribute('data-time'),
                        genre: btn.getAttribute('data-genre')
                    };
                    const res = toggleFavorite(item);
                    updateNavBadge();
                    renderSchedule();
                });
            });
        }

        // Event listeners for sticky ribbon
        dayPills.forEach(pill => {
            pill.addEventListener('click', () => {
                activeDay = pill.getAttribute('data-filter-day');
                renderSchedule();
            });
        });

        stagePills.forEach(pill => {
            pill.addEventListener('click', () => {
                activeStage = pill.getAttribute('data-filter-stage');
                renderSchedule();
            });
        });

        if (genreSelect) {
            genreSelect.addEventListener('change', () => {
                activeGenre = genreSelect.value;
                renderSchedule();
            });
        }

        if (bookmarkToggle) {
            bookmarkToggle.addEventListener('click', () => {
                onlyBookmarked = !onlyBookmarked;
                renderSchedule();
            });
        }

        // Initial render
        renderSchedule();
    }

    // =========================================================================
    // Artists Catalog Page Logic
    // =========================================================================
    function initArtistsCatalog() {
        const grid = document.getElementById('artists-grid-container');
        if (!grid) return;

        const dataModule = window.FESTIVAL_DATA;
        if (!dataModule || !dataModule.PERFORMERS) {
            grid.innerHTML = '<p>[ Loading artist catalog... ]</p>';
            return;
        }

        const searchInput = document.getElementById('artist-search-input');
        const genreFilter = document.getElementById('artist-genre-filter');
        const stageFilter = document.getElementById('artist-stage-filter');
        const artistsSummary = document.getElementById('artists-summary-text');

        function renderArtists() {
            const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            const selGenre = genreFilter ? genreFilter.value : 'all';
            const selStage = stageFilter ? stageFilter.value : 'all';

            const filtered = dataModule.PERFORMERS.filter(p => {
                const matchesQuery = !query ||
                    p.name.toLowerCase().includes(query) ||
                    p.genre.toLowerCase().includes(query) ||
                    p.origin.toLowerCase().includes(query) ||
                    p.bio.toLowerCase().includes(query);
                const matchesGenre = selGenre === 'all' || p.genre.toLowerCase().includes(selGenre.toLowerCase());
                const matchesStage = selStage === 'all' || p.stageId === selStage;
                return matchesQuery && matchesGenre && matchesStage;
            });

            if (artistsSummary) {
                artistsSummary.textContent = `Displaying ${filtered.length} of ${dataModule.PERFORMERS.length} performers`;
            }

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="wf-box-sub" style="grid-column: 1 / -1; text-align: center; padding: 24px;">
                        <p><strong>[ No performers match your search query. ]</strong></p>
                    </div>
                `;
                return;
            }

            let html = '';
            filtered.forEach(p => {
                const isFav = isFavorite(p.id);
                const favClass = isFav ? 'is-favourite' : '';
                const starActive = isFav ? 'active' : '';
                const isLunar = p.stageId === 'lunar';
                const stageIcon = isLunar ? '🌧️' : '☀️';

                html += `
                    <article class="artist-card ${favClass}" id="${p.id}" data-id="${p.id}">
                        <div class="artist-card-header">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                                <h3 class="artist-card-name">[ ${p.name} ]</h3>
                                <span class="badge">[ ${p.origin} ]</span>
                            </div>
                            <div class="artist-card-details">
                                <div><strong>Genre:</strong> ${p.genre}</div>
                                <div><strong>Stage:</strong> ${stageIcon} ${p.stage}</div>
                                <div><strong>Slot:</strong> 📅 ${p.day.split(' ')[0]} | ⏰ ${p.time}</div>
                            </div>
                        </div>
                        <p class="artist-card-bio">${p.bio}</p>
                        <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 8px; border-top: 1px solid #ddd;">
                            <a href="program.html?day=${p.dayKey}&stage=${p.stageId}#sch-${p.id}" class="btn-box" style="padding: 4px 10px; font-size: 0.82rem; min-height: 44px; display: inline-flex; align-items: center;">[ View in Feed &rarr; ]</a>
                            <button type="button" class="btn-star ${starActive}" data-action="toggle-fav" data-id="${p.id}" data-name="${p.name}" data-stage="${p.stage}" data-day="${p.day}" data-time="${p.time}" data-genre="${p.genre}">
                                ${isFav ? '★ Saved' : '☆ Bookmark'}
                            </button>
                        </div>
                    </article>
                `;
            });

            grid.innerHTML = html;

            grid.querySelectorAll('[data-action="toggle-fav"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const item = {
                        id: btn.getAttribute('data-id'),
                        name: btn.getAttribute('data-name'),
                        stage: btn.getAttribute('data-stage'),
                        day: btn.getAttribute('data-day'),
                        time: btn.getAttribute('data-time'),
                        genre: btn.getAttribute('data-genre')
                    };
                    toggleFavorite(item);
                    updateNavBadge();
                    renderArtists();
                });
            });

            // Scroll to hash if present
            if (window.location.hash) {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }

        if (searchInput) searchInput.addEventListener('input', renderArtists);
        if (genreFilter) genreFilter.addEventListener('change', renderArtists);
        if (stageFilter) stageFilter.addEventListener('change', renderArtists);

        renderArtists();
    }

    // =========================================================================
    // My Schedule / Conflict Detection Page Logic
    // =========================================================================
    function initMySchedule() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const summaryBox = document.getElementById('schedule-summary-box');
        const clearBtn = document.getElementById('btn-clear-favorites');
        let activeDay = 'all';

        const dayPills = document.querySelectorAll('[data-schedule-day]');

        function renderSchedule() {
            const favs = getFavorites();
            const conflicts = detectConflicts(favs);
            const conflictIds = new Set();
            conflicts.forEach(c => {
                conflictIds.add(c.itemA.id);
                conflictIds.add(c.itemB.id);
            });

            // Update stats
            if (summaryBox) {
                const conflictCount = conflicts.length;
                summaryBox.innerHTML = `
                    <p><strong>[ Personal Schedule Status ]</strong></p>
                    <p>• Bookmarked Performances: <strong>${favs.length}</strong></p>
                    <p>• Overlapping Time Conflicts: <strong style="${conflictCount > 0 ? 'color: #b71c1c;' : 'color: #155724;'}">${conflictCount}</strong></p>
                    ${conflictCount > 0 ? '<div class="conflict-badge">[ ⚠️ Action Required: Some bookmarked shows overlap on different stages! ]</div>' : (favs.length > 0 ? '<div class="no-conflict-badge">[ ✓ All saved performances are free of time collisions! ]</div>' : '')}
                `;
            }

            if (favs.length === 0) {
                container.innerHTML = `
                    <div class="wf-box-sub" style="text-align: center; padding: 32px 16px;">
                        <h3>[ Your Schedule is Empty ]</h3>
                        <p style="margin: 12px 0;">[ You have not saved any performances yet. ]</p>
                        <p>[ Browse the Chronological Feed timetable or Artists list and tap the ★ Bookmark button to build your festival itinerary. ]</p>
                        <hr>
                        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                            <a href="program.html" class="btn-box btn-box-primary">[ Browse Chronological Feed &rarr; ]</a>
                            <a href="artists.html" class="btn-box">[ Browse Artists &rarr; ]</a>
                        </div>
                    </div>
                `;
                return;
            }

            // Filter by day if selected
            let filtered = favs;
            if (activeDay !== 'all') {
                filtered = favs.filter(f => f.day.toLowerCase().includes(activeDay.toLowerCase()));
            }

            // Sort chronologically (+1440 min math)
            filtered.sort((a, b) => {
                const tA = timeToMinutes(a.time.split(/[–—-]/)[0].trim());
                const tB = timeToMinutes(b.time.split(/[–—-]/)[0].trim());
                return tA - tB;
            });

            let html = '';
            filtered.forEach(item => {
                const isClashing = conflictIds.has(item.id);
                const clashDetails = conflicts.filter(c => c.itemA.id === item.id || c.itemB.id === item.id);
                const cardClass = isClashing ? 'is-conflict' : 'wf-box-sub';

                let clashHtml = '';
                if (isClashing) {
                    clashDetails.forEach(cd => {
                        const other = cd.itemA.id === item.id ? cd.itemB : cd.itemA;
                        clashHtml += `<div class="conflict-badge">[ ⚠️ Time conflict with: ${other.artist} (${other.time} at ${other.stage}) ]</div>`;
                    });
                } else {
                    clashHtml = `<div class="no-conflict-badge">[ ✓ No time conflict ]</div>`;
                }

                html += `
                    <article class="feed-item ${cardClass}" id="fav-${item.id}">
                        <div class="feed-item-header">
                            <div class="feed-item-badges">
                                <span class="badge badge-time">⏰ ${item.time}</span>
                                <span class="badge">${item.day}</span>
                                <span class="badge">${item.stage}</span>
                                <span class="badge badge-genre">${item.genre}</span>
                            </div>
                            <button type="button" class="btn-box" data-action="remove-fav" data-id="${item.id}" style="border-color: #b71c1c; color: #b71c1c;">
                                [ Remove &times; ]
                            </button>
                        </div>
                        <h3 class="feed-item-title">[ ${item.artist} ]</h3>
                        ${clashHtml}
                        <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                            <a href="artists.html#${item.id}" class="btn-box" style="padding: 4px 10px; font-size: 0.82rem; min-height: 44px; display: inline-flex; align-items: center;">[ View Performer Bio &rarr; ]</a>
                        </div>
                    </article>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll('[data-action="remove-fav"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const updated = getFavorites().filter(f => f.id !== id);
                    saveFavorites(updated);
                    updateNavBadge();
                    renderSchedule();
                });
            });
        }

        dayPills.forEach(pill => {
            pill.addEventListener('click', () => {
                dayPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                activeDay = pill.getAttribute('data-schedule-day');
                renderSchedule();
            });
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all bookmarked performances?')) {
                    saveFavorites([]);
                    updateNavBadge();
                    renderSchedule();
                }
            });
        }

        renderSchedule();
    }

    // =========================================================================
    // Homepage Live Stream Preview Logic
    // =========================================================================
    function initHomePreview() {
        const previewContainer = document.getElementById('home-feed-preview');
        if (!previewContainer) return;

        const dataModule = window.FESTIVAL_DATA;
        if (!dataModule || !dataModule.SCHEDULE) return;

        // Take first 4 items of Day 1
        const previewItems = dataModule.SCHEDULE.slice(0, 4);
        let html = '';
        previewItems.forEach(item => {
            const perf = (dataModule.PERFORMERS || []).find(p => p.id === item.perfId || p.id === item.id) || {};
            const artistName = item.artist || item.performerName || perf.name || 'Unknown Artist';
            const bioText = (perf.bio || item.genre || '').substring(0, 120);
            const isFav = isFavorite(item.perfId || item.id);
            const favClass = isFav ? 'is-favourite' : '';
            const isLunar = item.stageId === 'lunar';
            const stageIcon = isLunar ? '🌧️' : '☀️';

            html += `
                <div class="feed-item sch-item ${favClass}" style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                        <div>
                            <span class="badge badge-time">⏰ ${item.time}</span>
                            <span class="badge">${stageIcon} ${item.stage}</span>
                        </div>
                        <span class="badge badge-genre">${item.genre}</span>
                    </div>
                    <div style="font-weight: 700; margin: 4px 0;">[ ${artistName} ]</div>
                    <p style="font-size: 0.88rem; color: #444; margin: 0;">${bioText}${bioText.length >= 120 ? '...' : ''}</p>
                </div>
            `;
        });
        previewContainer.innerHTML = html;
    }

    // =========================================================================
    // Page Initializer
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        updateNavBadge();
        highlightActiveNav();

        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEY) {
                updateNavBadge();
            }
        });

        window.addEventListener('festival_favorites_updated', () => {
            updateNavBadge();
        });

        initScheduleFeed();
        initArtistsCatalog();
        initMySchedule();
        initHomePreview();
    });

    // Public export for integration / test suites
    window.LayoutEngine = {
        STORAGE_KEY,
        getFavorites,
        saveFavorites,
        toggleFavorite,
        isFavorite,
        timeToMinutes,
        isOverlapping,
        detectConflicts
    };

})();
