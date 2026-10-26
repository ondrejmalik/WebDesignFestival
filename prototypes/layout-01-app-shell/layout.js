/**
 * Layout 01: App-Shell Bottom Nav - Standalone Logic & State Engine
 * Festival of Darkness 2 | Kutna Hora, July 10–12, 2026
 * Pure client-side, zero external dependencies.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    // Helper: Parse time to minutes with post-midnight adjustment (hours < 8 add 1440 mins)
    function timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const clean = timeStr.trim().split('–')[0].split('-')[0].trim();
        const parts = clean.split(':');
        let hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        if (hours < 8) {
            hours += 24;
        }
        return hours * 60 + minutes;
    }

    // Helper: Test interval overlap between two time strings
    function isOverlapping(timeStrA, timeStrB) {
        if (!timeStrA || !timeStrB) return false;
        function getBounds(t) {
            const sep = t.includes('–') ? '–' : '-';
            const parts = t.split(sep);
            return [timeToMinutes(parts[0]), timeToMinutes(parts[1])];
        }
        const [startA, endA] = getBounds(timeStrA);
        const [startB, endB] = getBounds(timeStrB);
        return (startA < endB) && (startB < endA);
    }

    // Helper: Get favorites array from LocalStorage
    function getFavorites() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    // Helper: Save favorites array to LocalStorage
    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        } catch (e) {
            console.error('Failed to save favorites to localStorage', e);
        }
    }

    // Helper: Check if item is favorited
    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(f => f.id === id);
    }

    // Helper: Toggle favorite state
    function toggleFavorite(perf) {
        let favs = getFavorites();
        const existingIdx = favs.findIndex(f => f.id === perf.id);
        let added = false;
        if (existingIdx >= 0) {
            favs.splice(existingIdx, 1);
            added = false;
        } else {
            favs.push({
                id: perf.id,
                artist: perf.name || perf.artist,
                stage: perf.stage,
                day: perf.day,
                time: perf.time,
                genre: perf.genre
            });
            added = true;
        }
        saveFavorites(favs);
        updateNavBadge();
        return { added, favs };
    }

    // Helper: Detect pairwise conflicts on a list of favorite items
    function detectConflicts(items) {
        const conflicts = [];
        for (let i = 0; i < items.length; i++) {
            for (let j = i + 1; j < items.length; j++) {
                const a = items[i];
                const b = items[j];
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

    // Update bottom nav badge count
    function updateNavBadge() {
        const favs = getFavorites();
        const badges = document.querySelectorAll('.nav-badge-count');
        badges.forEach(b => {
            b.textContent = favs.length;
            b.style.display = favs.length > 0 ? 'inline-block' : 'none';
        });
        const favCountSpan = document.getElementById('fav-count') || document.getElementById('artists-fav-count');
        if (favCountSpan) {
            favCountSpan.textContent = favs.length;
        }
    }

    // Setup active state on bottom navigation
    function setupBottomNav() {
        let pathname = (window.location.pathname || '').replace(/\\/g, '/');
        const segments = pathname.split('/').filter(Boolean);
        let rawLast = (segments.pop() || 'index.html').toLowerCase().split('?')[0].split('#')[0];
        let currentPath = rawLast.endsWith('.html') ? rawLast : 'index.html';
        if (currentPath === '') currentPath = 'index.html';

        const navItems = document.querySelectorAll('.bottom-nav-item');
        navItems.forEach(item => {
            const href = (item.getAttribute('href') || '').toLowerCase().split('?')[0].split('#')[0];
            if (href === currentPath || (currentPath === 'index.html' && href === 'index.html')) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });

        // Add smooth scroll to top when clicking current active tab
        const navBar = document.querySelector('.bottom-nav-bar');
        if (navBar && !navBar.hasAttribute('data-interactions-bound')) {
            navBar.setAttribute('data-interactions-bound', 'true');
            navBar.addEventListener('click', (e) => {
                const item = e.target.closest('.bottom-nav-item');
                if (!item) return;
                const href = (item.getAttribute('href') || '').toLowerCase().split('?')[0].split('#')[0];
                if (href === currentPath && !window.location.search && !window.location.hash) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        updateNavBadge();
    }

    // Setup Timetable page (program.html)
    function setupProgramPage() {
        const data = window.FESTIVAL_DATA;
        if (!data || !data.SCHEDULE) return;

        const scheduleList = data.SCHEDULE;
        const container = document.getElementById('schedule-container');
        if (!container) return;

        let activeDay = 'all';
        let activeStage = 'all';
        let activeGenre = 'all';
        let favOnly = false;

        // Check URL query parameters for fast Scenario 1 shortcut (e.g. ?stage=lunar or #stage-lunar)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('stage') === 'lunar' || window.location.hash === '#stage-lunar') {
            activeStage = 'lunar';
        }

        // Setup filter button listeners
        const dayButtons = document.querySelectorAll('[data-filter-day]');
        const stageButtons = document.querySelectorAll('[data-filter-stage]');
        const genreButtons = document.querySelectorAll('[data-filter-genre]');
        const favOnlyBtn = document.getElementById('filter-fav-only');
        const clearFavBtn = document.getElementById('clear-favorites-btn');

        // Reflect active stage from URL if set
        if (activeStage === 'lunar') {
            stageButtons.forEach(btn => {
                if (btn.getAttribute('data-filter-stage') === 'lunar') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                dayButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDay = btn.getAttribute('data-filter-day');
                render();
            });
        });

        stageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                stageButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeStage = btn.getAttribute('data-filter-stage');
                render();
            });
        });

        genreButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                genreButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeGenre = btn.getAttribute('data-filter-genre');
                render();
            });
        });

        if (favOnlyBtn) {
            favOnlyBtn.addEventListener('click', () => {
                favOnly = !favOnly;
                favOnlyBtn.classList.toggle('active', favOnly);
                render();
            });
        }

        if (clearFavBtn) {
            clearFavBtn.addEventListener('click', () => {
                if (confirm('Clear all bookmarked performances?')) {
                    saveFavorites([]);
                    updateNavBadge();
                    render();
                }
            });
        }

        function render() {
            const favs = getFavorites();
            const filtered = scheduleList.filter(item => {
                const matchesDay = (activeDay === 'all') || (item.dayKey === activeDay) || (item.day && item.day.toLowerCase().includes(activeDay));
                const matchesStage = (activeStage === 'all') || (item.stageId === activeStage);
                const matchesGenre = (activeGenre === 'all') || (item.genre && item.genre.toLowerCase().includes(activeGenre.toLowerCase()));
                const matchesFav = !favOnly || favs.some(f => f.id === item.perfId);
                return matchesDay && matchesStage && matchesGenre && matchesFav;
            });

            const statusSpan = document.getElementById('filter-status-text');
            if (statusSpan) {
                statusSpan.textContent = `[ Showing ${filtered.length} of ${scheduleList.length} performances ]`;
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="wf-box-sub" style="text-align: center; padding: 24px; color: #666;">
                        <p>[ No performances match your current filter combination. ]</p>
                        <button class="btn-box" id="reset-filters-btn" style="margin-top: 8px;">[ Reset Filters ]</button>
                    </div>
                `;
                const resetBtn = document.getElementById('reset-filters-btn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        activeDay = 'all';
                        activeStage = 'all';
                        activeGenre = 'all';
                        favOnly = false;
                        dayButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-day') === 'all'));
                        stageButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-stage') === 'all'));
                        genreButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter-genre') === 'all'));
                        if (favOnlyBtn) favOnlyBtn.classList.remove('active');
                        render();
                    });
                }
                return;
            }

            let html = '';
            filtered.forEach(item => {
                const isFav = favs.some(f => f.id === item.perfId);
                const stageTagClass = item.stageId === 'solar' ? 'solar' : 'lunar';
                const stageLabel = item.stageId === 'solar' ? '☀️ Solar Horizon' : '🌙 Lunar Dome (Covered)';

                html += `
                    <article class="sch-item ${isFav ? 'is-favourite' : ''}" data-perf-id="${item.perfId}">
                        <div class="sch-item-header">
                            <div>
                                <span class="sch-time">${item.time}</span>
                                <span class="sch-stage-tag ${stageTagClass}">${stageLabel}</span>
                            </div>
                            <button class="btn-star toggle-fav-btn" data-perf-id="${item.perfId}" title="${isFav ? 'Remove Bookmark' : 'Bookmark Performance'}">
                                ${isFav ? '★ Saved' : '☆ Bookmark'}
                            </button>
                        </div>
                        <div class="sch-artist-name">${item.artist}</div>
                        <div class="sch-genre">[ ${item.day} • ${item.genre} ]</div>
                        <div style="margin-top: 4px;">
                            <a href="artists.html#${item.perfId}" class="btn-box" style="font-size: 0.78rem; min-height: 44px;">
                                [ View Artist Profile &rarr; ]
                            </a>
                        </div>
                    </article>
                `;
            });

            container.innerHTML = html;

            // Bind toggle buttons
            container.querySelectorAll('.toggle-fav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const perfId = btn.getAttribute('data-perf-id');
                    const perf = data.PERFORMERS.find(p => p.id === perfId);
                    if (perf) {
                        toggleFavorite(perf);
                        render();
                    }
                });
            });
        }

        render();
    }

    // Setup Artists catalog page (artists.html)
    function setupArtistsPage() {
        const data = window.FESTIVAL_DATA;
        if (!data || !data.PERFORMERS) return;

        const performersList = data.PERFORMERS;
        const container = document.getElementById('artists-container');
        const detailContainer = document.getElementById('artist-detail-container');
        if (!container) return;

        let activeDay = 'all';
        let activeGenre = 'all';
        let searchQuery = '';
        let favOnly = false;

        const dayButtons = document.querySelectorAll('[data-filter-day]');
        const genreButtons = document.querySelectorAll('[data-filter-genre]');
        const favOnlyBtn = document.getElementById('filter-fav-only');
        const searchInput = document.getElementById('artist-search-input');
        const clearSearchBtn = document.getElementById('clear-search-btn');

        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                dayButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeDay = btn.getAttribute('data-filter-day');
                render();
            });
        });

        genreButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                genreButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeGenre = btn.getAttribute('data-filter-genre');
                render();
            });
        });

        if (favOnlyBtn) {
            favOnlyBtn.addEventListener('click', () => {
                favOnly = !favOnly;
                favOnlyBtn.classList.toggle('active', favOnly);
                render();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                render();
            });
        }

        if (clearSearchBtn && searchInput) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                render();
            });
        }

        function showArtistDetail(perf) {
            if (!detailContainer) return;
            const isFav = isFavorite(perf.id);
            detailContainer.innerHTML = `
                <section class="artist-detail-expanded wf-box" id="detail-${perf.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                        <div>
                            <h2>[ ${perf.name} ] (${perf.origin})</h2>
                            <p style="font-size: 0.88rem; color: #444;">
                                <strong>Genre:</strong> ${perf.genre} | <strong>Stage:</strong> ${perf.stage} | <strong>Time:</strong> ${perf.day}, ${perf.time}
                            </p>
                        </div>
                        <button class="btn-box" id="close-detail-btn" style="min-height: 44px;">[ ✕ Close ]</button>
                    </div>
                    <hr>
                    <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 12px;">${perf.bio}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button class="btn-box toggle-fav-detail-btn ${isFav ? 'is-favourite' : ''}" data-perf-id="${perf.id}">
                            ${isFav ? '★ Saved to My Plan' : '☆ Bookmark Show'}
                        </button>
                        <a href="program.html" class="btn-box">[ View in Timetable &rarr; ]</a>
                    </div>
                </section>
            `;
            const closeBtn = document.getElementById('close-detail-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    detailContainer.innerHTML = `
                        <div class="wf-box-sub" style="padding: 14px; text-align: center; color: #555;">
                            <p>[ Select any artist card below by clicking <strong>[ View Detail &rarr; ]</strong> to view their full profile, photo preview, and set info. ]</p>
                        </div>
                    `;
                });
            }
            const favDetailBtn = detailContainer.querySelector('.toggle-fav-detail-btn');
            if (favDetailBtn) {
                favDetailBtn.addEventListener('click', () => {
                    toggleFavorite(perf);
                    showArtistDetail(perf);
                    render();
                });
            }
            detailContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function render() {
            const favs = getFavorites();
            const filtered = performersList.filter(p => {
                const matchesDay = (activeDay === 'all') || (p.dayKey === activeDay) || (p.day && p.day.toLowerCase().includes(activeDay));
                const matchesGenre = (activeGenre === 'all') || (p.genre && p.genre.toLowerCase().includes(activeGenre.toLowerCase()));
                const matchesQuery = !searchQuery ||
                    p.name.toLowerCase().includes(searchQuery) ||
                    p.genre.toLowerCase().includes(searchQuery) ||
                    p.origin.toLowerCase().includes(searchQuery);
                const matchesFav = !favOnly || favs.some(f => f.id === p.id);
                return matchesDay && matchesGenre && matchesQuery && matchesFav;
            });

            const statusSpan = document.getElementById('filtered-count');
            if (statusSpan) {
                statusSpan.textContent = `[ Showing ${filtered.length} of ${performersList.length} performers ]`;
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="wf-box-sub" style="text-align: center; padding: 24px; color: #666; width: 100%;">
                        <p>[ No performers found matching "${searchQuery}". ]</p>
                    </div>
                `;
                return;
            }

            let html = '';
            filtered.forEach(perf => {
                const isFav = favs.some(f => f.id === perf.id);
                html += `
                    <article class="artist-card ${isFav ? 'is-favourite' : ''}" id="${perf.id}">
                        <div class="artist-card-header">
                            <div>
                                <h3 class="artist-card-title">${perf.name}</h3>
                                <span style="font-size: 0.8rem; color: #666;">[ ${perf.origin} • ${perf.genre} ]</span>
                            </div>
                            <button class="btn-star toggle-fav-card-btn" data-perf-id="${perf.id}" title="${isFav ? 'Saved' : 'Bookmark'}">
                                ${isFav ? '★' : '☆'}
                            </button>
                        </div>
                        <div class="artist-card-meta">
                            <strong>${perf.stage}</strong><br>
                            ${perf.day} | ${perf.time}
                        </div>
                        <p style="font-size: 0.84rem; color: #333; margin-bottom: 8px;">
                            ${perf.bio.length > 95 ? perf.bio.substring(0, 95) + '...' : perf.bio}
                        </p>
                        <div class="artist-card-actions">
                            <button class="btn-box view-detail-btn" data-perf-id="${perf.id}">
                                [ View Detail &rarr; ]
                            </button>
                        </div>
                    </article>
                `;
            });

            container.innerHTML = html;

            container.querySelectorAll('.toggle-fav-card-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const perfId = btn.getAttribute('data-perf-id');
                    const perf = performersList.find(p => p.id === perfId);
                    if (perf) {
                        toggleFavorite(perf);
                        render();
                    }
                });
            });

            container.querySelectorAll('.view-detail-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const perfId = btn.getAttribute('data-perf-id');
                    const perf = performersList.find(p => p.id === perfId);
                    if (perf) {
                        showArtistDetail(perf);
                        window.location.hash = perf.id;
                    }
                });
            });
        }

        // Deep linking support via hash (#perf-XX)
        if (window.location.hash && window.location.hash.startsWith('#perf-')) {
            const perfId = window.location.hash.substring(1);
            const perf = performersList.find(p => p.id === perfId);
            if (perf) {
                showArtistDetail(perf);
            }
        }

        render();
    }

    // Setup My Schedule page (my-schedule.html)
    function setupSchedulePage() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const clearBtn = document.getElementById('clear-favorites-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all items from your personal schedule?')) {
                    saveFavorites([]);
                    updateNavBadge();
                    renderSchedule();
                }
            });
        }

        function renderSchedule() {
            const favs = getFavorites();
            if (favs.length === 0) {
                container.innerHTML = `
                    <section class="wf-box" style="text-align: center; padding: 24px;">
                        <h3>[ Your Schedule is Empty ]</h3>
                        <hr>
                        <p style="color: #666; margin-bottom: 12px;">[ You haven't bookmarked any performances yet. Explore the lineup or timetable to add shows! ]</p>
                        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                            <a href="program.html" class="btn-box"><strong>[ Browse Full Timetable &rarr; ]</strong></a>
                            <a href="artists.html" class="btn-box">[ View All 60 Artists &rarr; ]</a>
                        </div>
                    </section>
                `;
                return;
            }

            // Run collision detection
            const conflicts = detectConflicts(favs);

            // Group by days
            const days = [
                { key: 'Day 1', label: 'Friday, July 10, 2026' },
                { key: 'Day 2', label: 'Saturday, July 11, 2026' },
                { key: 'Day 3', label: 'Sunday, July 12, 2026' }
            ];

            let html = '';

            days.forEach(d => {
                const dayItems = favs.filter(item => item.day && item.day.includes(d.key));
                // Sort chronologically using timeToMinutes
                dayItems.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

                html += `
                    <section class="wf-box">
                        <h3>[ Your Timetable: ${d.label} ]</h3>
                        <hr>
                `;

                if (dayItems.length === 0) {
                    html += `
                        <div class="wf-box-sub">
                            <p style="color: #666;"><em>[ You currently have no performances saved for this day. ]</em></p>
                            <a href="program.html" class="btn-box" style="margin-top: 8px;">[ Pick shows from the schedule &rarr; ]</a>
                        </div>
                    `;
                } else {
                    html += `<div class="row">`;
                    dayItems.forEach(item => {
                        // Find if this item has any conflict
                        const itemConflicts = conflicts.filter(c => c.itemA.id === item.id || c.itemB.id === item.id);
                        const hasConflict = itemConflicts.length > 0;
                        const cardClass = hasConflict ? 'col wf-box-sub is-clash' : 'col wf-box-sub';

                        let statusBadgeHtml = '';
                        if (hasConflict) {
                            const conflictPartners = itemConflicts.map(c => {
                                const partner = c.itemA.id === item.id ? c.itemB : c.itemA;
                                return `${partner.artist} (${partner.time} on ${partner.stage})`;
                            }).join(', ');
                            statusBadgeHtml = `
                                <div class="status-badge-clash" style="margin: 6px 0;">
                                    [ ⚠️ Time conflict with: ${conflictPartners} ]
                                </div>
                            `;
                        } else {
                            statusBadgeHtml = `
                                <div class="status-badge-clean" style="margin: 6px 0;">
                                    [ ✓ No time conflict ]
                                </div>
                            `;
                        }

                        html += `
                            <article class="${cardClass}" style="border-width: ${hasConflict ? '2px' : '1px'};">
                                <h4>[ ${item.time} | ${item.artist} ]</h4>
                                <p><strong>Stage:</strong> ${item.stage}</p>
                                <p style="font-size: 0.82rem; color: #555;"><strong>Genre:</strong> ${item.genre}</p>
                                ${statusBadgeHtml}
                                <div style="margin-top: 8px;">
                                    <button class="btn-box btn-danger remove-fav-btn" data-id="${item.id}">[ Remove ]</button>
                                </div>
                            </article>
                        `;
                    });
                    html += `</div>`;
                }

                html += `</section><hr>`;
            });

            container.innerHTML = html;

            container.querySelectorAll('.remove-fav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    const updated = favs.filter(f => f.id !== id);
                    saveFavorites(updated);
                    updateNavBadge();
                    renderSchedule();
                });
            });
        }

        renderSchedule();
    }

    // Initialize layout on DOMContentLoaded or immediately if already loaded
    function init() {
        setupBottomNav();

        const path = window.location.pathname;
        if (path.includes('program.html')) {
            setupProgramPage();
        } else if (path.includes('artists.html')) {
            setupArtistsPage();
        } else if (path.includes('my-schedule.html')) {
            setupSchedulePage();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose helpers globally if needed for testing
    window.LayoutAppShell = {
        timeToMinutes,
        isOverlapping,
        getFavorites,
        saveFavorites,
        toggleFavorite,
        isFavorite,
        detectConflicts,
        updateNavBadge
    };

})();
