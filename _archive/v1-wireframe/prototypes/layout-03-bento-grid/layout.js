
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
 * layout.js - Layout 03: Modular Bento-Grid Prototype Script
 * Festival of Darkness 2 (July 10–12, 2026, Kutna Hora)
 * Pure client-side, offline and file:/// compatible.
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    // ============================================================
    // LOCALSTORAGE SYNC & FAVORITES ENGINE
    // ============================================================
    function getFavorites() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            return [];
        }
    }

    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        } catch (e) {
            console.error('LocalStorage write failed:', e);
        }
    }

    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(item => item.id === id);
    }

    function toggleFavorite(eventData) {
        if (!eventData || !eventData.id) return [];
        const favs = getFavorites();
        const existingIdx = favs.findIndex(item => item.id === eventData.id);

        if (existingIdx > -1) {
            favs.splice(existingIdx, 1);
        } else {
            // Normalize day if necessary
            let normalizedDay = eventData.day || '';
            if (normalizedDay.includes('Day 1') || normalizedDay.includes('July 10') || normalizedDay === 'day1') {
                normalizedDay = 'Day 1 (Friday, July 10)';
            } else if (normalizedDay.includes('Day 2') || normalizedDay.includes('July 11') || normalizedDay === 'day2') {
                normalizedDay = 'Day 2 (Saturday, July 11)';
            } else if (normalizedDay.includes('Day 3') || normalizedDay.includes('July 12') || normalizedDay === 'day3') {
                normalizedDay = 'Day 3 (Sunday, July 12)';
            }

            favs.push({
                id: eventData.id,
                artist: eventData.artist || eventData.name || 'Unknown Artist',
                stage: eventData.stage || (eventData.stageId === 'lunar' ? 'Lunar Forest Dome' : 'Solar Horizon Stage'),
                day: normalizedDay,
                time: eventData.time || '14:00 – 14:45',
                genre: eventData.genre || 'Electronic / Alternative'
            });
        }

        saveFavorites(favs);
        updateAllHighlightStates();
        updateBentoWidgets();

        if (document.getElementById('my-schedule-container')) {
            renderMySchedule();
        }

        return favs;
    }

    // ============================================================
    // TIME MATH & COLLISION DETECTION ENGINE (+1440m post-midnight)
    // ============================================================
    function timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const parts = timeStr.trim().split(':');
        let h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) || 0;
        if (h < 8) h += 24; // Post-midnight hour adjustment (festival runs 13:00 to 04:00)
        return h * 60 + m;
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

    // ============================================================
    // BENTO STATUS WIDGETS LOGIC (HOMEPAGE & GLOBAL)
    // ============================================================
    function updateBentoWidgets() {
        const favs = getFavorites();
        const conflicts = detectConflicts(favs);

        // My Schedule Summary widget
        const favCountEl = document.getElementById('bento-fav-count');
        if (favCountEl) favCountEl.textContent = favs.length;

        const conflictStatusEl = document.getElementById('bento-conflict-status');
        if (conflictStatusEl) {
            if (conflicts.length > 0) {
                conflictStatusEl.innerHTML = `<span class="badge-conflict">[ ⚠️ ${conflicts.length} Time Conflict${conflicts.length > 1 ? 's' : ''} ]</span>`;
            } else {
                conflictStatusEl.innerHTML = `<span class="badge-clear">[ ✓ ${favs.length} Saved • 0 Conflicts ]</span>`;
            }
        }

        // Program Stats counter
        const favCounter = document.getElementById('fav-count');
        if (favCounter) favCounter.textContent = favs.length;
    }

    function initHomepageBento() {
        updateBentoWidgets();

        // Bento quick lineup search widget
        const bentoSearch = document.getElementById('bento-search-input');
        const bentoSearchResults = document.getElementById('bento-search-results');
        if (bentoSearch && bentoSearchResults && window.FESTIVAL_DATA) {
            bentoSearch.addEventListener('input', (e) => {
                const q = e.target.value.trim().toLowerCase();
                if (!q) {
                    bentoSearchResults.innerHTML = '';
                    bentoSearchResults.style.display = 'none';
                    return;
                }
                const matches = (window.FESTIVAL_DATA.PERFORMERS || []).filter(p =>
                    p.name.toLowerCase().includes(q) || p.genre.toLowerCase().includes(q)
                ).slice(0, 5);

                if (matches.length === 0) {
                    bentoSearchResults.innerHTML = '<p style="color: #666; font-size: 0.85rem; padding: 6px;">[ No matching performers found ]</p>';
                    bentoSearchResults.style.display = 'block';
                    return;
                }

                let html = '<div class="bento-card-sub">';
                matches.forEach(p => {
                    const isFav = isFavorite(p.id);
                    html += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed #ccc;">
                            <div>
                                <a href="artists.html#${p.id}" style="font-weight: bold; color: #111;">${p.name}</a>
                                <span style="font-size: 0.8rem; color: #555;">(${p.genre})</span><br>
                                <span style="font-size: 0.75rem; color: #777;">${p.stage} • ${p.time}</span>
                            </div>
                            <button class="btn-box bento-quick-fav-btn" data-id="${p.id}" style="min-height: 44px; min-width: 44px; padding: 4px 8px;">
                                ${isFav ? '★' : '☆'}
                            </button>
                        </div>
                    `;
                });
                html += '</div>';
                bentoSearchResults.innerHTML = html;
                bentoSearchResults.style.display = 'block';

                bentoSearchResults.querySelectorAll('.bento-quick-fav-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const id = btn.getAttribute('data-id');
                        const perf = (window.FESTIVAL_DATA.PERFORMERS || []).find(p => p.id === id);
                        if (perf) {
                            toggleFavorite({
                                id: perf.id,
                                artist: perf.name,
                                stage: perf.stage,
                                day: perf.day,
                                time: perf.time,
                                genre: perf.genre
                            });
                            btn.textContent = isFavorite(id) ? '★' : '☆';
                        }
                    });
                });
            });
        }
    }

    // ============================================================
    // HIGHLIGHT STATE UPDATE ACROSS ALL PAGES
    // ============================================================
    function updateAllHighlightStates() {
        const favs = getFavorites();
        const favIds = new Set(favs.map(f => f.id));

        // Program schedule items
        const schCards = document.querySelectorAll('.sch-event, .sch-cell, .bento-slot-card');
        schCards.forEach(card => {
            const id = card.getAttribute('data-id');
            const starBtn = card.querySelector('.sch-fav-btn');
            if (id && favIds.has(id)) {
                card.classList.add('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '★';
                    starBtn.title = 'Remove from My Schedule';
                }
            } else {
                card.classList.remove('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '☆';
                    starBtn.title = 'Add to My Schedule';
                }
            }
        });

        // Artist cards
        const artistCards = document.querySelectorAll('.artist-card');
        artistCards.forEach(card => {
            const id = card.getAttribute('data-id');
            const starBtn = card.querySelector('.fav-toggle-btn');
            if (id && favIds.has(id)) {
                card.classList.add('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '★ Bookmarked';
                }
            } else {
                card.classList.remove('is-favourite');
                if (starBtn) {
                    starBtn.textContent = '☆ Bookmark';
                }
            }
        });
    }

    // ============================================================
    // PROGRAM TIMETABLE (BENTO SCHEDULE CARDS & FILTERING)
    // ============================================================
    function initProgramPage() {
        const scheduleContainer = document.getElementById('bento-schedule-container');
        if (!scheduleContainer) return;

        // Check URL params for Scenario 1 fast jump (?stage=lunar) or hash (#stage-lunar)
        const urlParams = new URLSearchParams(window.location.search);
        let activeStage = urlParams.get('stage') || '';
        if (!activeStage && window.location.hash) {
            if (window.location.hash.includes('lunar')) activeStage = 'lunar';
            else if (window.location.hash.includes('solar')) activeStage = 'solar';
        }

        let activeDay = urlParams.get('day') || 'all';
        let activeGenre = 'all';
        let favOnly = false;
        let searchQuery = '';

        const dayButtons = document.querySelectorAll('[data-filter-day]');
        const stageButtons = document.querySelectorAll('[data-filter-stage]');
        const favOnlyBtn = document.getElementById('filter-fav-only');
        const genrePills = document.querySelectorAll('[data-filter-genre]');
        const searchInput = document.getElementById('program-search-input');
        const rainShelterBannerBtn = document.getElementById('rain-shelter-quick-filter');

        function applyFilters() {
            // Update button active classes
            dayButtons.forEach(btn => {
                const day = btn.getAttribute('data-filter-day');
                btn.classList.toggle('active', day === activeDay);
            });

            stageButtons.forEach(btn => {
                const stage = btn.getAttribute('data-filter-stage');
                btn.classList.toggle('active', stage === (activeStage || 'all'));
            });

            if (favOnlyBtn) {
                favOnlyBtn.classList.toggle('active', favOnly);
            }

            genrePills.forEach(pill => {
                const g = pill.getAttribute('data-filter-genre');
                pill.classList.toggle('active', g === activeGenre);
            });

            // Filter cards
            const favs = getFavorites();
            const favIds = new Set(favs.map(f => f.id));
            const cards = scheduleContainer.querySelectorAll('.sch-event, .bento-slot-card');
            let visibleCount = 0;

            cards.forEach(card => {
                const day = card.getAttribute('data-day') || '';
                const stage = card.getAttribute('data-stage') || '';
                const genre = card.getAttribute('data-genre') || '';
                const artist = card.getAttribute('data-artist') || '';
                const id = card.getAttribute('data-id') || '';

                const matchesDay = activeDay === 'all' || day.includes(activeDay) ||
                    (activeDay === 'day1' && day.includes('Day 1')) ||
                    (activeDay === 'day2' && day.includes('Day 2')) ||
                    (activeDay === 'day3' && day.includes('Day 3'));

                const matchesStage = !activeStage || activeStage === 'all' ||
                    (activeStage === 'lunar' && (stage.toLowerCase().includes('lunar') || card.getAttribute('data-stage-id') === 'lunar')) ||
                    (activeStage === 'solar' && (stage.toLowerCase().includes('solar') || card.getAttribute('data-stage-id') === 'solar'));

                const matchesGenre = activeGenre === 'all' || genre.toLowerCase().includes(activeGenre.toLowerCase());
                const matchesFav = !favOnly || favIds.has(id);
                const matchesSearch = !searchQuery || artist.toLowerCase().includes(searchQuery) || genre.toLowerCase().includes(searchQuery);

                if (matchesDay && matchesStage && matchesGenre && matchesFav && matchesSearch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update status text
            const statusEl = document.getElementById('filter-status-text');
            if (statusEl) {
                statusEl.textContent = `[ Showing ${visibleCount} performances | Day: ${activeDay.toUpperCase()} | Stage: ${(activeStage || 'ALL').toUpperCase()} ]`;
            }
        }

        // Attach event listeners
        dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activeDay = btn.getAttribute('data-filter-day');
                applyFilters();
            });
        });

        stageButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                activeStage = btn.getAttribute('data-filter-stage');
                applyFilters();
            });
        });

        if (rainShelterBannerBtn) {
            rainShelterBannerBtn.addEventListener('click', () => {
                activeStage = 'lunar';
                applyFilters();
            });
        }

        if (favOnlyBtn) {
            favOnlyBtn.addEventListener('click', () => {
                favOnly = !favOnly;
                applyFilters();
            });
        }

        genrePills.forEach(pill => {
            pill.addEventListener('click', () => {
                activeGenre = pill.getAttribute('data-filter-genre');
                applyFilters();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                applyFilters();
            });
        }

        // Delegate favorite button clicks
        scheduleContainer.addEventListener('click', (e) => {
            const favBtn = e.target.closest('.sch-fav-btn');
            const card = e.target.closest('.sch-event, .bento-slot-card');
            if (favBtn || card) {
                const targetCard = card || favBtn.closest('.sch-event, .bento-slot-card');
                if (!targetCard) return;

                const eventData = {
                    id: targetCard.getAttribute('data-id'),
                    artist: targetCard.getAttribute('data-artist'),
                    stage: targetCard.getAttribute('data-stage'),
                    day: targetCard.getAttribute('data-day'),
                    time: targetCard.getAttribute('data-time'),
                    genre: targetCard.getAttribute('data-genre')
                };

                toggleFavorite(eventData);
                if (favOnly) {
                    applyFilters();
                }
            }
        });

        // Initial filter application
        applyFilters();
        updateAllHighlightStates();
    }

    // ============================================================
    // ARTISTS CATALOG & DETAIL MODAL
    // ============================================================
    function initArtistsPage() {
        const catalogContainer = document.getElementById('artists-catalog-container');
        const modal = document.getElementById('artist-modal-overlay');
        const modalTitle = document.getElementById('modal-artist-name');
        const modalGenre = document.getElementById('modal-artist-genre');
        const modalStage = document.getElementById('modal-artist-stage');
        const modalDayTime = document.getElementById('modal-artist-daytime');
        const modalBio = document.getElementById('modal-artist-bio');
        const modalFavBtn = document.getElementById('modal-fav-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        let activeArtistId = null;

        function openArtistModal(id) {
            activeArtistId = id;
            let artist = null;
            if (window.FESTIVAL_DATA && window.FESTIVAL_DATA.PERFORMERS) {
                artist = window.FESTIVAL_DATA.PERFORMERS.find(p => p.id === id);
            }
            if (!artist) {
                const card = document.querySelector(`.artist-card[data-id="${id}"]`);
                if (card) {
                    artist = {
                        id: id,
                        name: card.getAttribute('data-name'),
                        genre: card.getAttribute('data-genre'),
                        stage: card.getAttribute('data-stage'),
                        day: card.getAttribute('data-day'),
                        time: card.getAttribute('data-time'),
                        bio: card.getAttribute('data-bio') || 'Performer profile and audiovisual biography.'
                    };
                }
            }

            if (!artist) return;

            if (modalTitle) modalTitle.textContent = `[ ${artist.name || artist.artist} ]`;
            if (modalGenre) modalGenre.textContent = `Genre: ${artist.genre}`;
            if (modalStage) modalStage.textContent = `Stage: ${artist.stage}`;
            if (modalDayTime) modalDayTime.textContent = `When: ${artist.day} | ${artist.time}`;
            if (modalBio) modalBio.textContent = artist.bio || 'Performer biography.';

            if (modalFavBtn) {
                const isFav = isFavorite(id);
                modalFavBtn.textContent = isFav ? '★ Remove from Schedule' : '☆ Add to My Schedule';
            }

            if (modal) {
                modal.classList.add('active');
            }

            // Update URL hash for deep-linking
            window.location.hash = id;
        }

        function closeArtistModal() {
            if (modal) {
                modal.classList.remove('active');
            }
            activeArtistId = null;
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeArtistModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeArtistModal();
            });
        }

        if (modalFavBtn) {
            modalFavBtn.addEventListener('click', () => {
                if (!activeArtistId) return;
                const card = document.querySelector(`.artist-card[data-id="${activeArtistId}"]`);
                let eventData = null;
                if (window.FESTIVAL_DATA && window.FESTIVAL_DATA.PERFORMERS) {
                    const perf = window.FESTIVAL_DATA.PERFORMERS.find(p => p.id === activeArtistId);
                    if (perf) {
                        eventData = {
                            id: perf.id,
                            artist: perf.name,
                            stage: perf.stage,
                            day: perf.day,
                            time: perf.time,
                            genre: perf.genre
                        };
                    }
                }
                if (!eventData && card) {
                    eventData = {
                        id: activeArtistId,
                        artist: card.getAttribute('data-name'),
                        stage: card.getAttribute('data-stage'),
                        day: card.getAttribute('data-day'),
                        time: card.getAttribute('data-time'),
                        genre: card.getAttribute('data-genre')
                    };
                }

                if (eventData) {
                    toggleFavorite(eventData);
                    const isFav = isFavorite(activeArtistId);
                    modalFavBtn.textContent = isFav ? '★ Remove from Schedule' : '☆ Add to My Schedule';
                }
            });
        }

        // Search & genre filter
        const searchInput = document.getElementById('artist-search-input');
        const genrePills = document.querySelectorAll('[data-filter-genre]');
        let activeGenre = 'all';
        let searchQuery = '';

        function filterArtists() {
            const cards = document.querySelectorAll('.artist-card');
            cards.forEach(card => {
                const name = (card.getAttribute('data-name') || '').toLowerCase();
                const genre = (card.getAttribute('data-genre') || '').toLowerCase();
                const origin = (card.getAttribute('data-origin') || '').toLowerCase();

                const matchesQuery = !searchQuery || name.includes(searchQuery) || genre.includes(searchQuery) || origin.includes(searchQuery);
                const matchesGenre = activeGenre === 'all' || genre.includes(activeGenre.toLowerCase());

                card.style.display = (matchesQuery && matchesGenre) ? '' : 'none';
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value.trim().toLowerCase();
                filterArtists();
            });
        }

        genrePills.forEach(pill => {
            pill.addEventListener('click', () => {
                activeGenre = pill.getAttribute('data-filter-genre');
                genrePills.forEach(p => p.classList.toggle('active', p === pill));
                filterArtists();
            });
        });

        // Delegate open modal and favorite toggle clicks
        if (catalogContainer) {
            catalogContainer.addEventListener('click', (e) => {
                const favBtn = e.target.closest('.fav-toggle-btn');
                const detailBtn = e.target.closest('.view-details-btn');
                const card = e.target.closest('.artist-card');

                if (favBtn) {
                    e.stopPropagation();
                    const targetCard = favBtn.closest('.artist-card');
                    if (!targetCard) return;
                    const eventData = {
                        id: targetCard.getAttribute('data-id'),
                        artist: targetCard.getAttribute('data-name'),
                        stage: targetCard.getAttribute('data-stage'),
                        day: targetCard.getAttribute('data-day'),
                        time: targetCard.getAttribute('data-time'),
                        genre: targetCard.getAttribute('data-genre')
                    };
                    toggleFavorite(eventData);
                    return;
                }

                if (detailBtn || card) {
                    const targetCard = card || detailBtn.closest('.artist-card');
                    if (targetCard) {
                        openArtistModal(targetCard.getAttribute('data-id'));
                    }
                }
            });
        }

        // Deep linking via URL hash: #perf-XX
        if (window.location.hash) {
            const hashId = window.location.hash.replace('#', '');
            if (hashId.startsWith('perf-')) {
                setTimeout(() => openArtistModal(hashId), 100);
            }
        }

        window.addEventListener('hashchange', () => {
            const hashId = window.location.hash.replace('#', '');
            if (hashId.startsWith('perf-')) {
                openArtistModal(hashId);
            }
        });

        updateAllHighlightStates();
    }

    // ============================================================
    // MY SCHEDULE PAGE (PAIRWISE COLLISION DETECTION)
    // ============================================================
    function renderMySchedule() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const favs = getFavorites();
        const conflicts = detectConflicts(favs);

        // Update summary badges
        const countBadge = document.getElementById('schedule-summary-count');
        if (countBadge) countBadge.textContent = `${favs.length} shows bookmarked`;

        const conflictBadge = document.getElementById('schedule-summary-conflicts');
        if (conflictBadge) {
            if (conflicts.length > 0) {
                conflictBadge.innerHTML = `<span class="badge-conflict">[ ⚠️ ${conflicts.length} Time Conflict${conflicts.length > 1 ? 's' : ''} Detected ]</span>`;
            } else {
                conflictBadge.innerHTML = `<span class="badge-clear">[ ✓ 0 Time Conflicts — Schedule is Clear ]</span>`;
            }
        }

        if (favs.length === 0) {
            container.innerHTML = `
                <section class="wf-box" style="margin-bottom: 16px;">
                    <h3>[ Your Personal Schedule is Empty ]</h3>
                    <hr>
                    <p>[ You haven't bookmarked any performances yet. Use the star icon (★) in the program or artist list to add shows to your personal timetable. ]</p>
                    <div style="margin-top: 14px;">
                        <a href="program.html" class="btn-box"><strong>[ Browse Full Timetable &rarr; ]</strong></a>
                    </div>
                </section>
            `;
            return;
        }

        const days = [
            { key: 'Day 1', label: 'Friday, July 10, 2026 – Day 1' },
            { key: 'Day 2', label: 'Saturday, July 11, 2026 – Day 2' },
            { key: 'Day 3', label: 'Sunday, July 12, 2026 – Day 3' }
        ];

        let html = '';

        days.forEach(d => {
            const dayFavs = favs.filter(f => isItemInDay(f, d.key));

            html += `<section class="wf-box" style="margin-bottom: 16px;">`;
            html += `<h3>[ ${d.label} (${dayFavs.length} shows) ]</h3><hr>`;

            if (dayFavs.length === 0) {
                html += `
                    <div class="wf-box-sub">
                        <p style="color: #666; font-style: italic;">[ No performances bookmarked for ${d.label.split('–')[0].trim()}. ]</p>
                        <a href="program.html" class="btn-box" style="margin-top: 8px;">[ Add Shows from Program &rarr; ]</a>
                    </div>
                `;
            } else {
                // Sort chronologically using timeToMinutes
                dayFavs.sort((a, b) => {
                    const sA = (a.time || '').split(/[–—-]/)[0].trim();
                    const sB = (b.time || '').split(/[–—-]/)[0].trim();
                    return timeToMinutes(sA) - timeToMinutes(sB);
                });

                html += `<div class="bento-grid">`;

                dayFavs.forEach((item, idx) => {
                    let hasCollision = false;
                    let collidingWith = '';

                    dayFavs.forEach((other, oIdx) => {
                        if (idx !== oIdx && item.stage !== other.stage && isOverlapping(item.time, other.time)) {
                            hasCollision = true;
                            collidingWith = other.artist;
                        }
                    });

                    const cardClass = hasCollision ? 'bento-card has-collision' : 'bento-card';
                    const borderInlineStyle = hasCollision
                        ? 'border: 2px solid #b71c1c; background: #ffebee;'
                        : 'border: 1px solid #777; background: #fafafa;';
                    const statusBadge = hasCollision
                        ? `<span class="badge-conflict" style="color: #b71c1c; font-weight: bold;">[ ⚠️ Time conflict with: ${collidingWith} ]</span>`
                        : `<span class="badge-clear" style="color: #2e7d32; font-weight: bold;">[ ✓ No time conflict ]</span>`;

                    html += `
                        <article class="${cardClass}" style="${borderInlineStyle}">
                            <div class="bento-card-header">
                                <h4>[ ${item.time} | ${item.artist} ]</h4>
                                <span class="bento-badge">${item.stage.includes('Lunar') ? '🌙 DOME (COVERED)' : '☀️ SOLAR'}</span>
                            </div>
                            <div class="bento-card-sub" style="background: transparent; border: 0; padding: 0;">
                                <p><strong>Stage:</strong> ${item.stage}</p>
                                <p><strong>Genre:</strong> ${item.genre || 'Electronic / Alternative'}</p>
                                <p style="margin-top: 4px; font-size: 0.85rem;">${statusBadge}</p>
                            </div>
                            <div class="bento-actions" style="margin-top: 10px;">
                                <button class="btn-box btn-box-danger remove-fav-btn" data-id="${item.id}">[ Remove Show ]</button>
                                <a href="artists.html#${item.id}" class="btn-box">[ View Bio ]</a>
                            </div>
                        </article>
                    `;
                });

                html += `</div>`;
            }

            html += `</section>`;
        });

        container.innerHTML = html;

        // Attach remove buttons
        container.querySelectorAll('.remove-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const updated = getFavorites().filter(item => item.id !== id);
                saveFavorites(updated);
                renderMySchedule();
                updateBentoWidgets();
            });
        });
    }

    function initMySchedulePage() {
        renderMySchedule();

        const clearBtn = document.getElementById('clear-favorites-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all bookmarked performances from your personal schedule?')) {
                    saveFavorites([]);
                    renderMySchedule();
                    updateBentoWidgets();
                }
            });
        }

        const shareBtn = document.getElementById('share-schedule-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                alert('Personal schedule link copied to clipboard!');
            });
        }

        const exportBtn = document.getElementById('export-ics-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                alert('Exporting schedule to .ics calendar file...');
            });
        }
    }

    // ============================================================
    // GLOBAL BOOTSTRAPPER
    // ============================================================
    document.addEventListener('DOMContentLoaded', () => {
        // Highlight active nav link
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.wf-nav-inline a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active');
            }
        });

        // Initialize page-specific logic
        if (document.getElementById('bento-schedule-container')) {
            initProgramPage();
        } else if (document.getElementById('artists-catalog-container')) {
            initArtistsPage();
        } else if (document.getElementById('my-schedule-container')) {
            initMySchedulePage();
        } else {
            initHomepageBento();
        }

        updateBentoWidgets();
        updateAllHighlightStates();
    });

    // Expose helpers globally for testing or embedded inline callers
    window.BENTO_APP = {
        getFavorites,
        saveFavorites,
        toggleFavorite,
        isFavorite,
        timeToMinutes,
        isOverlapping,
        detectConflicts,
        renderMySchedule,
        updateBentoWidgets
    };

})();
