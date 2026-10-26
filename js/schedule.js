// js/schedule.js - Timetable interactions, favouriting, highlighting, band details, and schedule syncing
// Fully integrated with js/lang.js for English and Czech language switching.

const STORAGE_KEY = 'festival_favorites';

// Canonical artist biographies for all 60 performers (English fallback)
const ARTIST_BIOS = {
    "perf-01": "Atmospheric post-rock ensemble from Prague combining sweeping cinematic crescendos with ambient soundscapes and textured guitar delays.",
    "perf-02": "Bratislava-based dream pop four-piece known for shimmering jangle guitars, ethereal vocal harmonies, and nostalgic reverb-soaked arrangements.",
    "perf-03": "Stockholm indie rock quintet delivering driving rhythm sections, melodic riffs, and anthemic choruses influenced by 90s alternative rock.",
    "perf-04": "Energetic Czech indie pop collective blending sparkling synth hooks with infectious upbeat acoustic grooves and catchy vocal hooks.",
    "perf-05": "Vintage synthesizer aficionados crafting warm analogue synthpop driven by Roland Juno pulses and retro-futuristic drum machines.",
    "perf-06": "Viennese duo fusing traditional Alpine acoustic instruments with contemporary electronic beats, sub-bass, and organic textures.",
    "perf-07": "British four-piece playing gritty, guitar-driven alternative rock with soaring hooks, distorted basslines, and passionate lyrics.",
    "perf-08": "Berlin production outfit crafting irresistible nu-disco grooves, slap-bass lines, brass flourishes, and danceable funk rhythms.",
    "perf-09": "Parisian producer combining cinematic French Touch synths with emotive indie songwriting and lush electronic textures.",
    "perf-10": "High-octane Prague electro rock band blending aggressive guitar distortion with massive dance beats and hypnotic vocal lines.",
    "perf-11": "Modular synthesizer purist performing generative live ambient patches with eurorack systems and tape delay units.",
    "perf-12": "Warsaw sound designer exploring intricate micro-rhythms, glitch percussion, and warm nostalgic synthesizer textures.",
    "perf-13": "Berlin underground producer crafting cavernous dub techno soundscapes with echoing chord stabs and deep sub-bass frequencies.",
    "perf-14": "Brno electronic artist crafting hypnotic minimal techno driven by subtle groove modulations and percussive precision.",
    "perf-15": "Slovak dark ambient composer building immersive acoustic drones, monastic field recordings, and visceral low-frequency rumbles.",
    "perf-16": "Budapest club staple delivering relentless, hypnotic deep techno sets built around rolling basslines and dark modular loops.",
    "perf-17": "Live electronic act using drum machines and hardware synthesizers to construct raw, improvised peak-time techno.",
    "perf-18": "Amsterdam industrial techno heavyweight delivering pulverizing kick drums, distorted industrial textures, and metallic percussion.",
    "perf-19": "London underground live act pushing Roland TB-303 acid basslines into blistering, saturated distortion territories.",
    "perf-20": "Czech ambient sound artist creating calming dawn soundscapes utilizing singing bowls, hydrophone nature recordings, and gentle drone pads.",
    "perf-21": "Prague acoustic indie trio crafting delicate vocal harmonies, fingerpicked acoustic guitars, and organic percussion grooves.",
    "perf-22": "Valencia-based surf rock outfit delivering reverb-drenched guitar lines, driving drum beats, and sun-soaked Mediterranean melodies.",
    "perf-23": "London soulful indie collective blending warm Rhodes piano chords with passionate soul vocals and modern indie instrumentation.",
    "perf-24": "Bratislava indie pop quartet producing bright melodic synth lines, danceable drum rhythms, and sparkling vocal harmonies.",
    "perf-25": "Atmospheric shoegaze band from Brno submerging driving melodies underneath dense walls of fuzz, reverb, and shimmering modulation.",
    "perf-26": "Swedish electronic pop project blending Scandinavian crystalline synthesizer textures with polished dance-pop production.",
    "perf-27": "Hamburg post-punk revivalists featuring driving angular basslines, urgent drum rhythms, and raw expressive baritone vocals.",
    "perf-28": "French indie dance producer crafting upbeat electronic grooves with live bass, vocoder hooks, and energetic disco rhythms.",
    "perf-29": "Brighton nu-electro live outfit fusing electroclash energy with modern breaks and razor-sharp synthesizer leads.",
    "perf-30": "Czech progressive dance veterans crafting soaring melodic trance synth lines over driving 132 BPM club grooves.",
    "perf-31": "Czech drone pioneer utilizing layered cello bowings and tape loops to produce meditative, resonant acoustic drone fields.",
    "perf-32": "Vienna microhouse producer known for quirky percussion clicks, minimalist sub-bass grooves, and warm jazzy chord samples.",
    "perf-33": "Slovak organic house collective blending tribal percussion recordings with lush field atmospheres and deep melodic grooves.",
    "perf-34": "Bristol bass music producer delivering bone-shaking sub-bass frequencies, half-step rhythms, and atmospheric dub echoes.",
    "perf-35": "Frankfurt techno DJ renowned for high-energy peak-time sets with driving 138 BPM percussion and warehouse synth stabs.",
    "perf-36": "Lyon electro producer weaving classic 808 breakbeats with dark acid synth sequences and vocoded robotic vocal cuts.",
    "perf-37": "Prague DJ blending gothic dark wave synth melodies with driving four-to-the-floor techno rhythms and shadowy atmospheres.",
    "perf-38": "Krakow hard techno producer delivering punishing 150 BPM industrial kick drums and relentless warehouse energy.",
    "perf-39": "Brussels live acid outfit driving twin TB-303 synthesizers into hyper-speed sonic territory with live percussion sequencing.",
    "perf-40": "Czech chillout producer crafting restorative downtempo soundscapes with soft acoustic guitars and gentle ocean ambient pads.",
    "perf-41": "South Bohemian folk indie ensemble featuring acoustic instruments, acoustic violin, warm double bass, and lyrical storytelling.",
    "perf-42": "Bratislava chamber pop group incorporating orchestral strings, grand piano, and intimate acoustic melodies.",
    "perf-43": "Manchester psychedelic rock quartet known for sprawling organ passages, fuzz guitar freakouts, and hypnotic motorik rhythms.",
    "perf-44": "Cologne dream indie band pairing lush reverb guitars with melancholic synthesizer layers and contemplative lyrics.",
    "perf-45": "Prague art pop project blending avant-garde vocal arrangements with unconventional song structures and rich electroacoustic production.",
    "perf-46": "Milan indie funk collective delivering infectious rhythmic guitar strumming, vibrant horn arrangements, and danceable basslines.",
    "perf-47": "Gothenburg space rock unit crafting cosmic synth textures, driving krautrock basslines, and expansive sonic journeys.",
    "perf-48": "Leeds dance punk quartet combining post-punk bass urgency with frantic four-on-the-floor disco drum beats.",
    "perf-49": "Copenhagen headlining electropop powerhouse with chart-topping synth hooks, massive electronic drops, and dazzling visual live shows.",
    "perf-50": "Prague orchestral electronic ensemble pairing an 8-piece classical string section with massive modular electronic beats for the festival grand finale.",
    "perf-51": "Czech acoustic researcher creating immersive soundscapes built from binaural field recordings of ancient Bohemian forests.",
    "perf-52": "Graz deep ambient composer utilizing modular reverberation units to sculpt expansive, suspended acoustic chambers.",
    "perf-53": "Polish sound artist using vintage reel-to-reel tape decks to create decaying loops, tape saturation warmth, and nostalgic hiss.",
    "perf-54": "Berlin micro techno producer crafting subtle rhythmic textures with pinpoint sound design and warm dub echoes.",
    "perf-55": "Prague progressive club producer weaving deep hypnotic basslines with rolling melodic arpeggios and atmospheric pads.",
    "perf-56": "Tel Aviv psy techno innovator blending rolling hypnotic basslines with sharp psychedelic leads and relentless tribal propulsion.",
    "perf-57": "Rome melodic techno duo crafting emotionally charged synthesizer chords over driving, polished club rhythms.",
    "perf-58": "London sound system selector exploring unconventional halftime bass music, dub echoes, and leftfield low-end experiments.",
    "perf-59": "Amsterdam trance techno specialist bringing uplifting euphoric arpeggios, crisp percussion, and soaring climaxes.",
    "perf-60": "Prague downtempo pioneer performing the official festival sunrise farewell set with warm ambient chords and gentle rhythmic pulses."
};

// Helper: retrieve active language
function getActiveLanguage() {
    if (typeof window.getFestivalLang === 'function') {
        return window.getFestivalLang();
    }
    try {
        return localStorage.getItem('festival_language') || 'en';
    } catch (e) {
        return 'en';
    }
}

// Helper: retrieve artist bio in active language
function getArtistBio(id) {
    const lang = getActiveLanguage();
    if (lang === 'cs' && window.ARTIST_BIOS_CS && window.ARTIST_BIOS_CS[id]) {
        return window.ARTIST_BIOS_CS[id];
    }
    return ARTIST_BIOS[id] || (lang === 'cs' ? 'Živé vystoupení na Festival of Darkness 2.' : 'Performing live at Festival of Darkness 2.');
}

// Helper: retrieve stored favorite items
function getFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

// Helper: save favorite items
function saveFavorites(favs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        if (typeof window.updateNavBadge === 'function') {
            window.updateNavBadge();
        }
    } catch (e) {
        console.error('LocalStorage write failed:', e);
    }
}

// Helper: toggle a single event favourite
function toggleFavorite(eventData) {
    const favs = getFavorites();
    const existingIndex = favs.findIndex(item => item.id === eventData.id);

    if (existingIndex > -1) {
        favs.splice(existingIndex, 1);
    } else {
        favs.push(eventData);
    }

    saveFavorites(favs);
    updateHighlightState();
    updateStatsBar();

    // If currently on my-schedule.html, re-render
    if (document.getElementById('my-schedule-container')) {
        renderMySchedule();
    }
}

// Apply highlighting to all schedule table cells matching favorites
function updateHighlightState() {
    const favs = getFavorites();
    const favIds = new Set(favs.map(f => f.id));
    const isCs = getActiveLanguage() === 'cs';

    const starFavTitle = isCs ? 'Odebrat z mého programu' : 'Remove from My Schedule';
    const starAddTitle = isCs ? 'Přidat do mého programu' : 'Add to My Schedule';

    const cells = document.querySelectorAll('.sch-cell[data-id]');
    cells.forEach(cell => {
        const id = cell.getAttribute('data-id');
        const starBtn = cell.querySelector('.sch-fav-btn');

        if (favIds.has(id)) {
            cell.classList.add('is-favourite');
            if (starBtn) {
                starBtn.textContent = '★';
                starBtn.title = starFavTitle;
            }
        } else {
            cell.classList.remove('is-favourite');
            if (starBtn) {
                starBtn.textContent = '☆';
                starBtn.title = starAddTitle;
            }
        }
    });
}

// Scroll to exact spot from return navigation hash
function scrollToSpotHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const targetCell = document.getElementById(hash) || document.querySelector(`.sch-cell[data-id="${hash}"]`);
    if (!targetCell) return;

    // Check which day section this cell belongs to and activate that day filter
    const daySection = targetCell.closest('.sch-day-section');
    if (daySection) {
        const dayKey = daySection.getAttribute('data-day');
        const dayBtn = document.querySelector(`.filter-btn[data-filter-day="${dayKey}"]`);
        if (dayBtn && !dayBtn.classList.contains('active')) {
            dayBtn.click();
        }
        daySection.style.display = '';
    }

    // Ensure row and cell are visible even if other filters were applied
    const row = targetCell.closest('tr');
    if (row && row.style.display === 'none') {
        row.style.display = '';
    }
    targetCell.style.display = '';

    setTimeout(() => {
        targetCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCell.classList.add('spot-highlight');
        setTimeout(() => targetCell.classList.remove('spot-highlight'), 2500);
    }, 150);
}

// Update the stats counter bar on program.html
function updateStatsBar() {
    const countEl = document.getElementById('fav-count');
    if (countEl) {
        const favs = getFavorites();
        countEl.textContent = favs.length;
    }
}

// Setup click handlers and band details on all program timetable tables
function setupProgramTimetable() {
    const tables = document.querySelectorAll('.sch-table');
    if (!tables || tables.length === 0) return;

    const isCs = getActiveLanguage() === 'cs';

    // Ensure each event cell has the detail button and star button at the end
    const eventCells = document.querySelectorAll('.sch-cell.sch-event');
    eventCells.forEach(cell => {
        const id = cell.getAttribute('data-id');
        const artist = cell.getAttribute('data-artist') || '';

        const card = cell.querySelector('.sch-card');
        if (card && !card.querySelector('.sch-actions')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'sch-actions';
            actionsDiv.innerHTML = `
                <a href="artist-detail.html?id=${id}&from=program#${id}" class="btn-box sch-detail-btn" title="${isCs ? 'Detail interpreta' : 'Artist Detail'}">
                    [ ℹ️ Detail &rarr; ]
                </a>
                <button type="button" class="sch-fav-btn" title="${isCs ? 'Přidat do mého programu' : 'Add to My Schedule'}">☆</button>
            `;
            card.appendChild(actionsDiv);
        }
    });

    // Delegate clicks across ALL timetable tables (Day 1, Day 2, Day 3)
    tables.forEach(table => {
        table.addEventListener('click', (e) => {
            // 1. If clicking a link inside (artist link or detail button): allow standard navigation
            if (e.target.closest('a')) {
                return;
            }

            const cell = e.target.closest('.sch-cell.sch-event');
            if (!cell) return;

            const id = cell.getAttribute('data-id');
            const artist = cell.getAttribute('data-artist');
            const stage = cell.getAttribute('data-stage');
            const day = cell.getAttribute('data-day');
            const time = cell.getAttribute('data-time');
            const genre = cell.getAttribute('data-genre');

            // 2. If clicking star button or anywhere on card: toggle favourite
            e.preventDefault();
            toggleFavorite({
                id: id,
                artist: artist,
                stage: stage,
                day: day,
                time: time,
                genre: genre
            });
        });
    });

    // Filtering controls (must be initialized before scrollToSpotHash)
    setupFilters();

    // Handle return navigation scroll
    scrollToSpotHash();
    window.addEventListener('hashchange', scrollToSpotHash);
}

// Update table headers, day titles, and empty slot descriptions when language switches
function updateTimetableLanguage() {
    const isCs = getActiveLanguage() === 'cs';

    // 1. Update day section headings
    const dayHeaders = document.querySelectorAll('.sch-day-heading, .sch-day-title');
    dayHeaders.forEach(h => {
        const day = h.getAttribute('data-day') || (h.closest('.sch-day-section') && h.closest('.sch-day-section').getAttribute('data-day'));
        if (day === 'day1') h.textContent = isCs ? '[ Den 1: Pátek 10. července 2026 ]' : '[ Day 1: Friday, July 10, 2026 ]';
        else if (day === 'day2') h.textContent = isCs ? '[ Den 2: Sobota 11. července 2026 ]' : '[ Day 2: Saturday, July 11, 2026 ]';
        else if (day === 'day3') h.textContent = isCs ? '[ Den 3: Neděle 12. července 2026 ]' : '[ Day 3: Sunday, July 12, 2026 ]';
    });

    // 2. Update table column headers
    document.querySelectorAll('.th-slot, .sch-header.sch-time-col').forEach(th => th.textContent = isCs ? 'Časový slot' : 'Time Slot');
    document.querySelectorAll('.th-solar, .sch-header.col-solar').forEach(th => th.textContent = isCs ? '☀️ Solar Horizon Stage (Venkovní amfiteátr)' : '☀️ Solar Horizon Stage (Open-air Amphitheater)');
    document.querySelectorAll('.th-lunar, .sch-header.col-lunar').forEach(th => th.textContent = isCs ? '🌙 Lunar Forest Dome (Krytá kupole – Ochrana před deštěm)' : '🌙 Lunar Forest Dome (Covered Dome – Rain Shelter)');

    // 3. Update empty slots text
    document.querySelectorAll('.sch-cell.sch-empty').forEach(cell => {
        const emptyType = cell.getAttribute('data-empty-type');
        if (emptyType === 'doors') {
            cell.textContent = isCs ? '[ Otevření areálu & Příprava ]' : '[ Doors Open & Grounds Preparation ]';
        } else if (emptyType === 'dome-sound' || emptyType === 'dome-open') {
            cell.textContent = isCs ? '[ Otevření kupole & Zvuková zkouška ]' : '[ Dome Open & Sound Check ]';
        } else if (emptyType === 'stage-change') {
            cell.textContent = isCs ? '[ Přestavba scény & Zvuková zkouška ]' : '[ Stage Changeover & Sound Setup ]';
        } else if (emptyType === 'intermission') {
            cell.textContent = isCs ? '[ Přestavba & Ambientní pauza ]' : '[ Changeover & Ambient Intermission ]';
        } else if (emptyType === 'curfew') {
            cell.textContent = isCs ? '[ Konec programu na Solar Stage (Noční klid) ]' : '[ Solar Stage Closed (Curfew) ]';
        } else if (emptyType === 'pause') {
            cell.textContent = isCs ? '[ Přestavba & Ambientní pauza ]' : '[ Changeover & Ambient Pause ]';
        }
    });

    // 4. Update band details bio text & drawer
    document.querySelectorAll('.sch-cell.sch-event').forEach(cell => {
        const id = cell.getAttribute('data-id');
        const artist = cell.getAttribute('data-artist') || '';
        const stage = cell.getAttribute('data-stage') || '';
        const time = cell.getAttribute('data-time') || '';
        const genre = cell.getAttribute('data-genre') || '';
        const bio = getArtistBio(id);

        const detailsDiv = cell.querySelector('.sch-band-details');
        if (detailsDiv) {
            const isHidden = detailsDiv.style.display === 'none';
            detailsDiv.innerHTML = `
                <p><strong>${isCs ? 'Detaily kapely & bio:' : 'Band Details & Bio:'}</strong> <span class="bio-text">${bio}</span></p>
                <p style="margin-top: 4px; color: #444;">
                    <strong>${isCs ? 'Scéna:' : 'Stage:'}</strong> ${stage} | <strong>${isCs ? 'Čas:' : 'Time:'}</strong> ${time} | <strong>${isCs ? 'Žánr:' : 'Genre:'}</strong> ${genre}
                </p>
                <div style="margin-top: 6px; display: flex; gap: 8px;">
                    <a href="artists.html#${id}" style="color: #000; text-decoration: underline; font-weight: bold;">${isCs ? '[ Kompletní profil v sekci Účinkující → ]' : '[ Full profile in Artists section → ]'}</a>
                </div>
            `;
            detailsDiv.style.display = isHidden ? 'none' : 'block';
        }

        const detailBtn = cell.querySelector('.sch-detail-btn');
        if (detailBtn) {
            const isHidden = !detailsDiv || detailsDiv.style.display === 'none';
            detailBtn.textContent = isHidden 
                ? (isCs ? '[ ℹ️ Detaily kapely ]' : '[ ℹ️ Band Details ]') 
                : (isCs ? '[ ✖ Skrýt detaily ]' : '[ ✖ Hide Details ]');
            detailBtn.title = isCs ? 'Zobrazit detaily kapely' : 'Show Band Details';
        }
    });

    updateHighlightState();
}

// Setup filtering toolbar (Day, Stage, Genre, Only Favourites, Search)
function setupFilters() {
    const dayBtns = document.querySelectorAll('[data-filter-day]');
    const stageBtns = document.querySelectorAll('[data-filter-stage]');
    const favToggleBtn = document.getElementById('filter-fav-only');
    const genrePills = document.querySelectorAll('[data-filter-genre]');
    const searchInput = document.getElementById('artist-search-input');
    const filterStatusText = document.getElementById('filter-status-text');

    let currentDay = 'all';
    let currentStage = 'all';
    let currentGenre = 'all';
    let onlyFavs = false;
    let searchQuery = '';

    // Check URL parameters for pre-selection (e.g. ?stage=lunar&day=day1)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const stageParam = urlParams.get('stage');
        const dayParam = urlParams.get('day');
        if (stageParam) {
            currentStage = stageParam.toLowerCase();
            stageBtns.forEach(btn => {
                if (btn.getAttribute('data-filter-stage') === currentStage) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
        if (dayParam) {
            currentDay = dayParam.toLowerCase();
            dayBtns.forEach(btn => {
                if (btn.getAttribute('data-filter-day') === currentDay) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    } catch (e) {}

    function applyFilters() {
        const favIds = new Set(getFavorites().map(f => f.id));
        const daySections = document.querySelectorAll('.sch-day-section');
        let visibleCount = 0;
        let totalCount = 0;

        // 1. Day filtering
        daySections.forEach(sec => {
            const secDay = sec.getAttribute('data-day');
            if (currentDay === 'all' || currentDay === secDay) {
                sec.style.display = '';
            } else {
                sec.style.display = 'none';
            }
        });

        // 2. Stage filtering (columns and empty rows)
        const allTables = document.querySelectorAll('.sch-table');
        allTables.forEach(table => {
            const solarCols = table.querySelectorAll('.col-solar');
            const lunarCols = table.querySelectorAll('.col-lunar');

            solarCols.forEach(el => {
                if (currentStage === 'all' || currentStage === 'solar') {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            });

            lunarCols.forEach(el => {
                if (currentStage === 'all' || currentStage === 'lunar') {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            });

            const tableRows = table.querySelectorAll('tbody tr');
            tableRows.forEach(tr => {
                const lunarCell = tr.querySelector('.col-lunar');
                const solarCell = tr.querySelector('.col-solar');

                if (currentStage === 'lunar') {
                    if (lunarCell && lunarCell.classList.contains('sch-empty')) {
                        tr.style.display = 'none';
                    } else {
                        tr.style.display = '';
                    }
                } else if (currentStage === 'solar') {
                    if (solarCell && solarCell.classList.contains('sch-empty')) {
                        tr.style.display = 'none';
                    } else {
                        tr.style.display = '';
                    }
                } else {
                    tr.style.display = '';
                }
            });
        });

        // 3. Highlight matching event cells
        const eventCells = document.querySelectorAll('.sch-cell.sch-event');
        eventCells.forEach(cell => {
            totalCount++;
            const genre = (cell.getAttribute('data-genre') || '').toLowerCase();
            const artist = (cell.getAttribute('data-artist') || '').toLowerCase();
            const stage = (cell.getAttribute('data-stage') || '').toLowerCase();
            const id = cell.getAttribute('data-id');
            const isFav = favIds.has(id);

            let matches = true;

            // Genre check
            if (currentGenre !== 'all') {
                if (!genre.includes(currentGenre)) {
                    matches = false;
                }
            }

            // Favourite check
            if (onlyFavs && !isFav) {
                matches = false;
            }

            // Search query
            if (searchQuery && !artist.includes(searchQuery) && !genre.includes(searchQuery) && !stage.includes(searchQuery)) {
                matches = false;
            }

            if (matches) {
                visibleCount++;
                cell.style.opacity = '1';
                cell.style.pointerEvents = 'auto';
                cell.style.filter = 'none';
            } else {
                cell.style.opacity = '0.15';
                cell.style.pointerEvents = 'none';
                cell.style.filter = 'grayscale(100%)';
            }
        });

        if (filterStatusText) {
            const isCs = getActiveLanguage() === 'cs';
            const stageLabel = currentStage === 'lunar' ? ' (Lunar Forest Dome)' : (currentStage === 'solar' ? ' (Solar Horizon)' : '');
            filterStatusText.textContent = isCs 
                ? `[ Zobrazeno ${visibleCount} vystoupení${stageLabel} ]`
                : `[ Showing ${visibleCount} shows${stageLabel} ]`;
        }
    }

    // Day button listeners
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDay = btn.getAttribute('data-filter-day');
            applyFilters();
        });
    });

    // Stage button listeners
    stageBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            stageBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStage = btn.getAttribute('data-filter-stage');
            applyFilters();
        });
    });

    // Quick Lunar Dome button (e.g. from rain banner)
    const quickLunarBtn = document.getElementById('quick-lunar-btn');
    if (quickLunarBtn) {
        quickLunarBtn.addEventListener('click', () => {
            stageBtns.forEach(btn => {
                if (btn.getAttribute('data-filter-stage') === 'lunar') btn.classList.add('active');
                else btn.classList.remove('active');
            });
            currentStage = 'lunar';

            dayBtns.forEach(btn => {
                if (btn.getAttribute('data-filter-day') === 'day1') btn.classList.add('active');
                else btn.classList.remove('active');
            });
            currentDay = 'day1';

            applyFilters();

            const day1Sec = document.querySelector('.sch-day-section[data-day="day1"]');
            if (day1Sec) {
                day1Sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Genre filter button listeners
    genrePills.forEach(pill => {
        pill.addEventListener('click', () => {
            genrePills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            currentGenre = pill.getAttribute('data-filter-genre').toLowerCase();
            applyFilters();
        });
    });

    // Favourite toggle listener
    if (favToggleBtn) {
        favToggleBtn.addEventListener('click', () => {
            onlyFavs = !onlyFavs;
            favToggleBtn.classList.toggle('active', onlyFavs);
            applyFilters();
        });
    }

    // Search query listener
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        });

        const clearSearchBtn = document.getElementById('clear-search-btn');
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                applyFilters();
            });
        }
    }

    // Initial filter pass
    applyFilters();
}

// Convert "HH:MM" string to minutes from start of festival day (13:00)
function timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    let mins = parts[0] * 60 + parts[1];
    // If hour is post-midnight (00:00 to 07:59), add 24 hours so chronological comparison stays monotonic
    if (parts[0] < 8) mins += 24 * 60;
    return mins;
}

// Detect collisions between two time intervals (resilient to hyphen - and en-dash –)
function isOverlapping(t1, t2) {
    if (!t1 || !t2) return false;
    const parts1 = t1.split(/[–-]/).map(s => s.trim());
    const parts2 = t2.split(/[–-]/).map(s => s.trim());
    if (parts1.length < 2 || parts2.length < 2) return false;
    return (timeToMinutes(parts1[0]) < timeToMinutes(parts2[1])) && (timeToMinutes(parts2[0]) < timeToMinutes(parts1[1]));
}

// Render dynamic user schedule on my-schedule.html
function renderMySchedule() {
    const container = document.getElementById('my-schedule-container');
    if (!container) return;

    const favs = getFavorites();
    const isCs = getActiveLanguage() === 'cs';

    if (favs.length === 0) {
        const emptyTitle = isCs 
            ? '[ Zatím nemáte v osobním plánu žádná uložená vystoupení ]'
            : '[ You currently have no performances saved in your personal schedule ]';
        const emptyDesc = isCs
            ? 'Zatím nemáte v osobním programu uložena žádná vystoupení. Můžete si je přidat v sekci Program.'
            : 'You have not added any performances to your schedule yet. You can add them in the Program section.';
        const emptyBtn = isCs ? '[ Přejít do sekce „Program“ &rarr; ]' : '[ Go to "Program" Section &rarr; ]';

        container.innerHTML = `
            <div class="wf-box-sub" style="padding: 24px; text-align: center;">
                <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${emptyTitle}</h3>
                <p style="color: #444; max-width: 600px; margin: 0 auto 14px;">
                    ${emptyDesc}
                </p>
                <a href="program.html" class="btn-box" style="font-weight: bold; background: #222; color: #fff; padding: 8px 16px;">
                    ${emptyBtn}
                </a>
            </div>
        `;
        return;
    }

    // Days configuration (language-specific without bilingual slashes)
    const days = [
        { key: 'Day 1', label: isCs ? 'Pátek 10. 7. 2026 – 1. den' : 'Friday, July 10, 2026 – Day 1' },
        { key: 'Day 2', label: isCs ? 'Sobota 11. 7. 2026 – 2. den' : 'Saturday, July 11, 2026 – Day 2' },
        { key: 'Day 3', label: isCs ? 'Neděle 12. 7. 2026 – 3. den' : 'Sunday, July 12, 2026 – Day 3' }
    ];

    let totalCollisions = 0;
    let html = '';

    // Check overall collisions across all days
    days.forEach(d => {
        const dayFavs = favs.filter(f => f.day && f.day.includes(d.key));
        dayFavs.forEach((item, idx) => {
            dayFavs.forEach((other, oIdx) => {
                if (idx < oIdx && item.stage !== other.stage && isOverlapping(item.time, other.time)) {
                    totalCollisions++;
                }
            });
        });
    });

    // Top summary banner
    if (totalCollisions > 0) {
        const bannerTitle = isCs 
            ? `[ ⚠️ Upozornění na časové kolize: Nalezeno ${totalCollisions} překrývajících se vystoupení! ]`
            : `[ ⚠️ Schedule Conflict Alert: Found ${totalCollisions} overlapping shows! ]`;
        const bannerDesc = isCs
            ? `V některých časech máte naplánována překrývající se vystoupení na scéně <strong>Solar Horizon Stage</strong> a v <strong>Lunar Forest Dome</strong>.`
            : `You have overlapping performances scheduled at the same time on the <strong>Solar Horizon Stage</strong> and in the <strong>Lunar Forest Dome</strong>.`;

        html += `
            <div class="wf-box" style="border: 2px solid #b71c1c; background: #ffebee; margin-bottom: 16px; padding: 14px;">
                <h3 style="color: #b71c1c; margin-bottom: 6px;">${bannerTitle}</h3>
                <p style="color: #721c24; font-size: 0.92rem; line-height: 1.45;">
                    ${bannerDesc}
                </p>
            </div>
        `;
    } else {
        const cleanMsg = isCs
            ? '[ ✓ Váš harmonogram je bez časových kolizí! Všechna vybraná vystoupení na sebe navazují a stíháte je v plné délce. ]'
            : '[ ✓ Your schedule has no conflicts! All selected performances follow each other seamlessly. ]';

        html += `
            <div class="wf-box" style="border: 2px solid #28a745; background: #d4edda; margin-bottom: 16px; padding: 12px 14px;">
                <p style="color: #155724; font-weight: bold; font-size: 0.95rem; margin: 0;">
                    ${cleanMsg}
                </p>
            </div>
        `;
    }

    // Render by Day
    days.forEach(d => {
        const dayFavs = favs.filter(f => f.day && f.day.includes(d.key));
        const showsCountText = isCs ? `${dayFavs.length} uložených vystoupení` : `${dayFavs.length} saved shows`;
        
        html += `<section class="wf-box" style="margin-bottom: 18px;">`;
        html += `<h3>[ 📅 ${d.label} – ${showsCountText} ]</h3><hr>`;

        if (dayFavs.length === 0) {
            const noShowsText = isCs 
                ? '[ Pro tento den zatím nemáte uložená žádná vystoupení. ]'
                : '[ You currently have no performances saved for this day. ]';
            const pickBtnText = isCs ? '[ Vybrat vystoupení v Programu &rarr; ]' : '[ Pick shows from the schedule &rarr; ]';

            html += `
                <div class="wf-box-sub" style="padding: 12px; color: #555;">
                    <p><em>${noShowsText}</em></p>
                    <a href="program.html" class="btn-box" style="margin-top: 8px;">${pickBtnText}</a>
                </div>
            `;
        } else {
            // Sort by start time chronologically
            dayFavs.sort((a, b) => {
                const sA = (a.time || '').split(/[–-]/)[0].trim();
                const sB = (b.time || '').split(/[–-]/)[0].trim();
                return timeToMinutes(sA) - timeToMinutes(sB);
            });

            // Detect collisions for this specific day
            let dayCollisions = 0;
            const collisionMap = new Map();

            dayFavs.forEach((item, idx) => {
                dayFavs.forEach((other, oIdx) => {
                    if (idx !== oIdx && item.stage !== other.stage && isOverlapping(item.time, other.time)) {
                        dayCollisions++;
                        collisionMap.set(item.id, other);
                    }
                });
            });

            if (dayCollisions > 0) {
                const dayConflictMsg = isCs
                    ? '[ ⚠️ V tomto dni dochází ke kolizi mezi Solar a Lunar scénou! Zkontrolujte označené koncerty níže. ]'
                    : '[ ⚠️ A time conflict occurs on this day between the Solar and Lunar stages! Inspect highlighted shows below. ]';

                html += `
                    <div style="border: 1px solid #b71c1c; background: #fff5f5; padding: 8px 12px; margin-bottom: 12px; font-size: 0.88rem; color: #b71c1c;">
                        <strong>${dayConflictMsg}</strong>
                    </div>
                `;
            }

            html += `<div class="row">`;
            dayFavs.forEach(item => {
                const collidingWithObj = collisionMap.get(item.id);
                const hasCollision = !!collidingWithObj;

                const borderStyle = hasCollision 
                    ? 'border: 2px solid #b71c1c; background: #ffebee;' 
                    : 'border: 1px solid #777; background: #fafafa;';

                const statusBadge = hasCollision 
                    ? `
                        <div style="margin-top: 8px; padding: 6px 8px; border: 1px solid #b71c1c; background: #fff; font-size: 0.84rem; color: #b71c1c;">
                            <strong>${isCs ? '[ ⚠️ ČASOVÁ KOLIZE ]' : '[ ⚠️ TIME CONFLICT ]'}</strong>
                            <p style="margin-top: 3px; color: #900;">
                                ${isCs ? 'Překrývá se s:' : 'Overlaps with:'} <strong>${collidingWithObj.artist}</strong> ${isCs ? 'na scéně' : 'on'} <em>${collidingWithObj.stage}</em> (${collidingWithObj.time}).
                            </p>
                        </div>
                      `
                    : `
                        <div style="margin-top: 8px; padding: 4px 8px; border: 1px solid #28a745; background: #f4faf5; font-size: 0.84rem; color: #155724;">
                            <strong>${isCs ? '[ ✓ Bez časové kolize ]' : '[ ✓ No time conflict ]'}</strong>
                        </div>
                      `;

                const removeBtnClass = hasCollision ? 'btn-box remove-btn has-collision' : 'btn-box remove-btn';
                const removeBtnStyle = hasCollision
                    ? 'border: 1px solid #b71c1c; font-weight: bold;'
                    : 'border: 1px solid #333;';

                const removeBtnText = hasCollision 
                    ? (isCs ? '[ 🗑️ Odebrat vystoupení ]' : '[ 🗑️ Remove performance ]')
                    : (isCs ? '[ 🗑️ Odebrat z programu ]' : '[ 🗑️ Remove from schedule ]');

                const bio = getArtistBio(item.id);
                const stageHash = (item.stage && item.stage.toLowerCase().includes('solar')) ? 'stage-solar' : 'stage-lunar';
                const stageDisplayName = isCs
                    ? (stageHash === 'stage-solar' ? '☀️ Solar Horizon Stage' : '🌙 Lunar Forest Dome')
                    : (stageHash === 'stage-solar' ? '☀️ Solar Horizon Stage' : '🌙 Lunar Forest Dome');

                html += `
                    <article class="col wf-box-sub" id="${item.id}" style="${borderStyle}; min-width: 260px;">
                        <h4 style="font-size: 1.05rem; margin-bottom: 6px;">
                            [ ${item.time} | <a href="artist-detail.html?id=${item.id}&from=myschedule#${item.id}" style="color: inherit; text-decoration: underline;" title="${isCs ? 'Detail interpreta' : 'Artist Detail'}">${item.artist}</a> ]
                        </h4>
                        <p>
                            <strong>${isCs ? 'Scéna:' : 'Stage:'}</strong> 
                            <a href="stages.html#${stageHash}" class="stage-link" style="color: #111; font-weight: bold; text-decoration: underline;" title="${isCs ? 'Zobrazit informace o scéně' : 'View Stage Details'}">
                                ${stageDisplayName} &rarr;
                            </a>
                        </p>
                        <p><strong>${isCs ? 'Žánr:' : 'Genre:'}</strong> ${item.genre || (isCs ? 'Elektronická hudba' : 'Electronic')}</p>
                        ${bio ? `<p style="font-size: 0.8rem; color: #555; margin-top: 4px;"><em>${bio}</em></p>` : ''}
                        ${statusBadge}
                        <div style="display: flex; gap: 6px; margin-top: 10px;">
                            <a href="artist-detail.html?id=${item.id}&from=myschedule#${item.id}" class="btn-box" style="flex: 1; text-align: center; font-size: 0.82rem; font-weight: bold; text-decoration: none; padding: 6px 8px;">
                                ${isCs ? '[ ℹ️ Detail interpreta → ]' : '[ ℹ️ Artist Detail → ]'}
                            </a>
                            <button class="${removeBtnClass}" data-id="${item.id}" style="flex: 1; text-align: center; font-size: 0.82rem; padding: 6px 8px; ${removeBtnStyle}">
                                ${removeBtnText}
                            </button>
                        </div>
                    </article>
                `;
            });
            html += `</div>`;
        }

        html += `</section>`;
    });

    container.innerHTML = html;

    // Attach remove handlers
    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const updated = getFavorites().filter(item => item.id !== id);
            saveFavorites(updated);
            renderMySchedule();
        });
    });

    // Check return navigation hash on my-schedule
    scrollToPlanSpot();
}

// Scroll to exact spot on my-schedule planner
function scrollToPlanSpot() {
    const planHash = window.location.hash.replace('#', '');
    if (planHash) {
        const targetPlan = document.getElementById(planHash);
        if (targetPlan) {
            setTimeout(() => {
                targetPlan.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetPlan.classList.add('spot-highlight');
                setTimeout(() => targetPlan.classList.remove('spot-highlight'), 2500);
            }, 150);
        }
    }
}

// Initialise upon DOM load
document.addEventListener('DOMContentLoaded', () => {
    // If on program page
    setupProgramTimetable();
    updateTimetableLanguage();
    updateHighlightState();
    updateStatsBar();

    // Clear all button
    const clearBtn = document.getElementById('clear-favorites-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const isCs = getActiveLanguage() === 'cs';
            const confirmPrompt = isCs 
                ? 'Opravdu si přejete odebrat všechna uložená vystoupení?' 
                : 'Are you sure you want to remove all saved performances?';
            if (confirm(confirmPrompt)) {
                saveFavorites([]);
                updateHighlightState();
                updateStatsBar();
                if (document.getElementById('my-schedule-container')) {
                    renderMySchedule();
                }
            }
        });
    }

    // If on my schedule page
    if (document.getElementById('my-schedule-container')) {
        renderMySchedule();
        window.addEventListener('hashchange', scrollToPlanSpot);
    }
});

// React immediately to language switch across all schedule components
window.addEventListener('languageChanged', () => {
    updateTimetableLanguage();
    updateStatsBar();
    if (document.getElementById('my-schedule-container')) {
        renderMySchedule();
    }
});
