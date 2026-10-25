/**
 * Layout 09: Swiss Typographic Index - Standalone Logic & State Engine
 * Festival of Darkness 2 | Kutna Hora, July 10–12, 2026
 * Pure client-side, zero external dependencies.
 * UX Metaphor: Modernist Swiss editorial index, oversized numbers, strict typographic hierarchy
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'festival_favorites';

    // Helper: Time to minutes with post-midnight wrap (< 08:00 adds 1440 mins)
    function timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const clean = timeStr.trim().split(/[–—-]/)[0].trim();
        const parts = clean.split(':');
        let hours = parseInt(parts[0], 10) || 0;
        const minutes = parseInt(parts[1], 10) || 0;
        if (hours < 8) {
            hours += 24;
        }
        return (hours * 60) + minutes;
    }

    // Helper: Interval overlap check
    function isOverlapping(timeStrA, timeStrB) {
        if (!timeStrA || !timeStrB) return false;
        function getBounds(t) {
            const parts = t.split(/[–—-]/).map(s => s.trim());
            return [timeToMinutes(parts[0]), timeToMinutes(parts[1])];
        }
        const [startA, endA] = getBounds(timeStrA);
        const [startB, endB] = getBounds(timeStrB);
        return (startA < endB) && (startB < endA);
    }

    // LocalStorage Helpers
    function getFavorites() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveFavorites(favs) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        } catch (e) {
            console.error('Failed to save favorites to localStorage', e);
        }
    }

    function isFavorite(id) {
        const favs = getFavorites();
        return favs.some(f => f.id === id);
    }

    function toggleFavorite(item) {
        const favs = getFavorites();
        const idx = favs.findIndex(f => f.id === item.id);
        let added = false;
        if (idx > -1) {
            favs.splice(idx, 1);
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
        updateUI();
        return { favs, added };
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

    function updateNavBadge() {
        const count = getFavorites().length;
        document.querySelectorAll('.fav-count-badge, #fav-count').forEach(el => {
            el.textContent = count;
        });
    }

    // Render program
    function renderProgram() {
        const container = document.getElementById('swiss-program-container');
        if (!container) return;

        const schedule = window.FESTIVAL_DATA ? window.FESTIVAL_DATA.SCHEDULE : [];
        if (!schedule.length) return;

        // Group by Day
        const days = [
            { key: 'day1', title: '01 // FRIDAY, JULY 10, 2026' },
            { key: 'day2', title: '02 // SATURDAY, JULY 11, 2026' },
            { key: 'day3', title: '03 // SUNDAY, JULY 12, 2026' }
        ];

        let html = '';
        days.forEach(d => {
            const dayItems = schedule.filter(s => s.dayKey === d.key);
            html += `
                <section class="wf-box" style="margin-top: 14px;">
                    <span class="swiss-index-tag">[ TIMETABLE SECTION ]</span>
                    <h2>[ ${d.title} ]</h2>
                    <hr>
                    ${dayItems.map(item => {
                        const fav = isFavorite(item.id);
                        return `
                            <div class="sch-item ${fav ? 'is-favourite' : ''}" data-id="${item.id}" data-stage="${item.stageId}">
                                <div style="flex: 1; min-width: 200px;">
                                    <span class="sch-item-time">[ ${item.time} ]</span>
                                    <span class="sch-item-artist">${item.name}</span>
                                    <div class="sch-item-stage">[ ${item.stage} &bull; ${item.genre} ]</div>
                                </div>
                                <button type="button" class="sch-fav-btn" data-fav-btn="${item.id}">
                                    ${fav ? '[ ★ SAVED ]' : '[ + SAVE ]'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </section>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('[data-fav-btn]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-fav-btn');
                const item = schedule.find(s => s.id === id);
                if (item) {
                    toggleFavorite(item);
                    renderProgram();
                }
            });
        });

        // Scenario 1: Filter to covered dome if query param exists
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('stage') === 'lunar') {
            document.querySelectorAll('.sch-item').forEach(el => {
                if (el.getAttribute('data-stage') !== 'lunar') {
                    el.style.display = 'none';
                }
            });
        }
    }

    // Render artists
    function renderArtists() {
        const grid = document.getElementById('artists-grid');
        if (!grid) return;

        const performers = window.FESTIVAL_DATA ? window.FESTIVAL_DATA.PERFORMERS : [];
        if (!performers.length) return;

        grid.innerHTML = performers.map(p => {
            const fav = isFavorite(p.id);
            return `
                <article class="artist-card ${fav ? 'is-favourite' : ''}" data-id="${p.id}" id="${p.id}">
                    <div>
                        <div class="artist-card-header">
                            <h3 class="artist-card-title">${p.name}</h3>
                            <span style="font-family: Consolas, monospace; font-size: 0.8rem; border: 1px solid #777; padding: 2px 6px;">[ ${p.origin} ]</span>
                        </div>
                        <div class="artist-card-genre">[ ${p.genre} ]</div>
                        <p style="font-size: 0.85rem; color: #444; margin-top: 4px;">${p.bio}</p>
                    </div>
                    <div>
                        <div class="artist-card-schedule">
                            <strong>${p.stage}</strong> &bull; ${p.day} &bull; ${p.time}
                        </div>
                        <button type="button" class="btn-box sch-fav-btn" style="width: 100%;" data-fav-artist="${p.id}">
                            ${fav ? '[ ★ IN ITINERARY ]' : '[ + ADD TO ITINERARY ]'}
                        </button>
                    </div>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('[data-fav-artist]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-fav-artist');
                const item = performers.find(p => p.id === id);
                if (item) {
                    toggleFavorite(item);
                    renderArtists();
                }
            });
        });
    }

    // Render My Schedule
    function renderMySchedule() {
        const container = document.getElementById('my-schedule-container');
        if (!container) return;

        const favs = getFavorites();
        if (favs.length === 0) {
            container.innerHTML = `
                <div class="wf-box-sub" style="text-align: center; padding: 24px;">
                    <span class="swiss-index-tag">[ ITINERARY STATUS: EMPTY ]</span>
                    <h3>[ 00 // NO SHOWS BOOKMARKED ]</h3>
                    <p>Select performances from the schedule index to curate your clash-free agenda.</p>
                    <hr>
                    <a href="program.html" class="btn-box btn-accent">[ OPEN SCHEDULE INDEX &rarr; ]</a>
                </div>
            `;
            return;
        }

        const conflicts = detectConflicts(favs);
        const conflictIds = new Set();
        conflicts.forEach(c => {
            conflictIds.add(c.itemA.id);
            conflictIds.add(c.itemB.id);
        });

        const days = ['Day 1 (Friday, July 10)', 'Day 2 (Saturday, July 11)', 'Day 3 (Sunday, July 12)'];
        let html = '';

        if (conflicts.length > 0) {
            html += `
                <div class="wf-box" style="border: 2px solid #b71c1c; background: #ffebee;">
                    <span class="swiss-index-tag" style="color: #b71c1c;">[ CONFLICT WARNING ENGINE ]</span>
                    <strong style="color: #b71c1c;">[ ⚠️ TIMETABLE CLASH DETECTED (${conflicts.length}) ]</strong>
                    <p style="font-size: 0.85rem; margin-top: 4px;">Overlapping performances across distinct stages:</p>
                    <ul style="margin-left: 20px; font-size: 0.85rem;">
                        ${conflicts.map(c => `<li><strong>${c.itemA.artist}</strong> (${c.itemA.stage}, ${c.itemA.time}) overlaps with <strong>${c.itemB.artist}</strong> (${c.itemB.stage}, ${c.itemB.time})</li>`).join('')}
                    </ul>
                </div>
            `;
        } else {
            html += `
                <div class="wf-box" style="border: 2px solid #28a745; background: #e8f5e9;">
                    <span class="swiss-index-tag" style="color: #2e7d32;">[ VERIFIED SCHEDULE ]</span>
                    <strong style="color: #1b5e20;">[ ✓ CONFLICT-FREE ITINERARY ]</strong>
                    <p style="font-size: 0.85rem; margin-top: 4px;">All ${favs.length} saved performances are free of stage overlap.</p>
                </div>
            `;
        }

        days.forEach((day, idx) => {
            const dayFavs = favs.filter(f => f.day.includes(day.split(' ')[0]) || f.day === day);
            if (dayFavs.length > 0) {
                html += `
                    <div class="wf-box" style="margin-top: 14px;">
                        <span class="swiss-index-tag">[ DAY 0${idx + 1} ITINERARY ]</span>
                        <h2>[ ${day} ]</h2>
                        <hr>
                        ${dayFavs.map(item => {
                            const hasConflict = conflictIds.has(item.id);
                            return `
                                <div class="sch-item ${hasConflict ? 'is-conflict' : 'is-favourite'}" style="margin-bottom: 8px;">
                                    <div style="flex: 1;">
                                        <span class="sch-item-time">[ ${item.time} ]</span>
                                        <span class="sch-item-artist">${item.artist}</span>
                                        <div class="sch-item-stage">[ ${item.stage} &bull; ${item.genre} ]</div>
                                        ${hasConflict ? '<span class="conflict-badge">[ ⚠️ TIME COLLISION ]</span>' : '<span class="ok-badge">[ ✓ SCHEDULED ]</span>'}
                                    </div>
                                    <button type="button" class="btn-box" data-remove-fav="${item.id}" style="min-height: 44px;">
                                        [ - REMOVE ]
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        });

        container.innerHTML = html;

        container.querySelectorAll('[data-remove-fav]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-remove-fav');
                const updated = getFavorites().filter(f => f.id !== id);
                saveFavorites(updated);
                updateUI();
                renderMySchedule();
            });
        });
    }

    function updateUI() {
        updateNavBadge();
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateUI();
        renderProgram();
        renderArtists();
        renderMySchedule();
    });

})();
