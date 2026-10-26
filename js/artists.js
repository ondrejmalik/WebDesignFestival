// js/artists.js - Artist catalog interactions, detail view, filtering, and favorites sync
// Fully integrated with js/lang.js for English and Czech language switching.

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

function getArtistBio(id) {
    const lang = getActiveLanguage();
    if (lang === 'cs' && window.ARTIST_BIOS_CS && window.ARTIST_BIOS_CS[id]) {
        return window.ARTIST_BIOS_CS[id];
    }
    return ARTIST_BIOS[id] || (lang === 'cs' ? 'Živé vystoupení na Festival of Darkness 2.' : 'Performing live at Festival of Darkness 2.');
}

// Retrieve favorites from LocalStorage
function getFavorites() {
    try {
        const stored = localStorage.getItem('festival_favorites');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

// Save favorites to LocalStorage
function saveFavorites(favs) {
    try {
        localStorage.setItem('festival_favorites', JSON.stringify(favs));
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
        if (typeof window.updateNavBadge === 'function') {
            window.updateNavBadge();
        }
    } catch (e) {
        console.error('LocalStorage write failed:', e);
    }
}

// Toggle favourite state
function toggleArtistFavorite(cardData) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.id === cardData.id);

    if (idx > -1) {
        favs.splice(idx, 1);
    } else {
        favs.push(cardData);
    }

    saveFavorites(favs);
    syncFavoriteCards();
    updateDetailFavoriteButton(cardData.id);
}

// Synchronize card highlight states with favorites
function syncFavoriteCards() {
    const favIds = new Set(getFavorites().map(f => f.id));
    const cards = document.querySelectorAll('.artist-card');
    const isCs = getActiveLanguage() === 'cs';

    cards.forEach(card => {
        const id = card.getAttribute('data-id');
        const starBtn = card.querySelector('.artist-fav-btn');
        const detailBtn = card.querySelector('.view-detail-btn');

        if (favIds.has(id)) {
            card.classList.add('is-favourite');
            if (starBtn) {
                starBtn.textContent = isCs ? '★ Uloženo' : '★ Bookmarked';
                starBtn.style.background = '#28a745';
                starBtn.style.color = '#fff';
            }
        } else {
            card.classList.remove('is-favourite');
            if (starBtn) {
                starBtn.textContent = isCs ? '☆ Uložit' : '☆ Bookmark';
                starBtn.style.background = '';
                starBtn.style.color = '';
            }
        }

        if (detailBtn) {
            detailBtn.textContent = isCs ? '[ Zobrazit detail → ]' : '[ View Detail → ]';
        }
    });

    const countEl = document.getElementById('artists-fav-count');
    if (countEl) {
        countEl.textContent = favIds.size;
    }
}

// Update the favourite button inside the open detail box
function updateDetailFavoriteButton(artistId) {
    const detailBtn = document.getElementById('detail-fav-btn');
    if (!detailBtn) return;

    const isCs = getActiveLanguage() === 'cs';
    const favIds = new Set(getFavorites().map(f => f.id));
    if (favIds.has(artistId)) {
        detailBtn.textContent = isCs ? '★ Odebrat z mého programu' : '★ Remove from My Schedule';
        detailBtn.style.background = '#28a745';
        detailBtn.style.color = '#fff';
    } else {
        detailBtn.textContent = isCs ? '☆ Přidat do mého programu' : '☆ Add to My Schedule';
        detailBtn.style.background = '';
        detailBtn.style.color = '';
    }
}

// Show details for a specific artist
function displayArtistDetail(card) {
    const detailContainer = document.getElementById('artist-detail-container');
    if (!detailContainer) return;

    const id = card.getAttribute('data-id');
    const name = card.getAttribute('data-name');
    const genre = card.getAttribute('data-genre');
    const origin = card.getAttribute('data-origin');
    const day = card.getAttribute('data-day');
    const time = card.getAttribute('data-time');
    const stage = card.getAttribute('data-stage');
    const isCs = getActiveLanguage() === 'cs';
    const bio = getArtistBio(id);

    const favIds = new Set(getFavorites().map(f => f.id));
    const isFav = favIds.has(id);
    const favBtnText = isFav 
        ? (isCs ? '★ Odebrat z mého programu' : '★ Remove from My Schedule') 
        : (isCs ? '☆ Přidat do mého programu' : '☆ Add to My Schedule');
    const favBtnStyle = isFav ? 'background: #28a745; color: #fff;' : 'background: #eee; color: #000;';

    detailContainer.innerHTML = `
        <div class="artist-detail-box" id="detail-focus-target">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                <div>
                    <h3 style="font-size: 1.3rem; margin-bottom: 4px;">[ ${name} (${origin}) ]</h3>
                    <p style="color: #444; font-weight: bold; font-size: 0.9rem;">${isCs ? 'Žánr:' : 'Genre:'} ${genre} | ${isCs ? 'Země:' : 'Origin:'} ${origin}</p>
                </div>
                <button id="close-detail-btn" class="btn-box" style="padding: 4px 10px;" title="${isCs ? 'Zavřít profil' : 'Close Profile'}">[ ${isCs ? '&times; Zavřít profil' : '&times; Close Profile'} ]</button>
            </div>
            
            <hr>

            <div class="row" style="margin-top: 10px;">
                <div class="col" style="flex: 1 1 220px; max-width: 280px;">
                    <div class="wf-box-sub" style="height: 140px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 0.85rem; color: #555;">
                        ${isCs ? `[ Fotografie interpreta:<br><strong>${name}</strong> ]` : `[ Artist Press Kit Photo:<br><strong>${name}</strong> ]`}
                    </div>
                    <div style="margin-top: 8px; font-size: 0.8rem; color: #666; text-align: center;">
                        ${isCs ? '[ Zvuková ukázka: ♫ Bandcamp & Spotify ]' : '[ Audio Preview: ♫ Bandcamp & Spotify ]'}
                    </div>
                </div>

                <div class="col" style="flex: 2 1 320px;">
                    <h4>[ ${isCs ? 'Biografie a profil interpreta' : 'Artist Biography & Profile'} ]</h4>
                    <p class="artist-detail-bio-text" style="margin-top: 6px; line-height: 1.5; color: #111;">${bio}</p>
                    
                    <hr>

                    <div style="background: #f1f3f5; border: 1px solid #777; padding: 8px 12px; font-size: 0.88rem;">
                        <p><strong>${isCs ? 'Plánované vystoupení:' : 'Scheduled Performance:'}</strong> ${day}, ${time}</p>
                        <p><strong>${isCs ? 'Scéna:' : 'Stage:'}</strong> ${stage}</p>
                    </div>

                    <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 8px;">
                        <button id="detail-fav-btn" class="btn-box" style="font-weight: bold; ${favBtnStyle}">[ ${favBtnText} ]</button>
                        <a href="program.html" class="btn-box">[ ${isCs ? 'Zobrazit v harmonogramu &rarr;' : 'View in Timetable &rarr;'} ]</a>
                        <a href="my-schedule.html" class="btn-box">[ ${isCs ? 'Přejít do Mého programu &rarr;' : 'Go to My Schedule &rarr;'} ]</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Hook close button
    document.getElementById('close-detail-btn').addEventListener('click', () => {
        detailContainer.innerHTML = '';
        window.location.hash = '';
    });

    // Hook favorite button in detail
    document.getElementById('detail-fav-btn').addEventListener('click', () => {
        toggleArtistFavorite({
            id: id,
            artist: name,
            stage: stage,
            day: day,
            time: time,
            genre: genre
        });
    });

    // Scroll to detail smoothly
    const target = document.getElementById('detail-focus-target');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update hash for shareable deep-linking
    window.location.hash = id;
}

// Setup filtering and search
function setupArtistFilters() {
    const searchInput = document.getElementById('artist-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const genreBtns = document.querySelectorAll('[data-filter-genre]');
    const dayBtns = document.querySelectorAll('[data-filter-day]');
    const favToggleBtn = document.getElementById('filter-fav-only');
    const countEl = document.getElementById('filtered-count');

    let currentGenre = 'all';
    let currentDay = 'all';
    let onlyFavs = false;
    let searchQuery = '';

    function applyFilters() {
        const favIds = new Set(getFavorites().map(f => f.id));
        const cards = document.querySelectorAll('.artist-card');
        const isCs = getActiveLanguage() === 'cs';
        let visibleCount = 0;

        cards.forEach(card => {
            const id = card.getAttribute('data-id');
            const name = (card.getAttribute('data-name') || '').toLowerCase();
            const genre = (card.getAttribute('data-genre') || '').toLowerCase();
            const day = (card.getAttribute('data-day') || '').toLowerCase();
            const isFav = favIds.has(id);

            let match = true;

            if (currentGenre !== 'all' && !genre.includes(currentGenre)) {
                match = false;
            }

            if (currentDay !== 'all' && !day.includes(currentDay)) {
                match = false;
            }

            if (onlyFavs && !isFav) {
                match = false;
            }

            if (searchQuery && !name.includes(searchQuery) && !genre.includes(searchQuery)) {
                match = false;
            }

            if (match) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        if (countEl) {
            countEl.textContent = isCs 
                ? `[ Zobrazeno ${visibleCount} z 60 interpretů ]`
                : `[ Showing ${visibleCount} of 60 performers ]`;
        }
    }

    // Genre buttons
    genreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            genreBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGenre = btn.getAttribute('data-filter-genre').toLowerCase();
            applyFilters();
        });
    });

    // Day buttons
    dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dayBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDay = btn.getAttribute('data-filter-day').toLowerCase();
            applyFilters();
        });
    });

    // Favourites toggle
    if (favToggleBtn) {
        favToggleBtn.addEventListener('click', () => {
            onlyFavs = !onlyFavs;
            favToggleBtn.classList.toggle('active', onlyFavs);
            applyFilters();
        });
    }

    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFilters();
        });

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                searchQuery = '';
                applyFilters();
                searchInput.focus();
            });
        }
    }

    applyFilters();
}

// Initialise upon page load
document.addEventListener('DOMContentLoaded', () => {
    syncFavoriteCards();
    setupArtistFilters();

    // Delegate clicks for detail buttons and bookmark buttons
    const grid = document.querySelector('.artists-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const card = e.target.closest('.artist-card');
            if (!card) return;

            const id = card.getAttribute('data-id');

            // Clicked View Detail or Artist Title
            if (e.target.closest('.view-detail-btn') || e.target.closest('.artist-card-title')) {
                if (!e.target.closest('a')) {
                    window.location.href = `artist-detail.html?id=${encodeURIComponent(id)}&from=artists#${encodeURIComponent(id)}`;
                }
                return;
            }

            // Clicked Bookmark Button
            if (e.target.closest('.artist-fav-btn')) {
                toggleArtistFavorite({
                    id: id,
                    artist: card.getAttribute('data-name'),
                    stage: card.getAttribute('data-stage'),
                    day: card.getAttribute('data-day'),
                    time: card.getAttribute('data-time'),
                    genre: card.getAttribute('data-genre')
                });
                return;
            }
        });
    }

    // Scroll to exact spot when returning from detail page via hash (e.g. #perf-08)
    function scrollToArtistSpot() {
        const hash = window.location.hash.replace('#', '');
        if (!hash) return;
        const card = document.getElementById(hash) || document.querySelector(`.artist-card[data-id="${hash}"]`);
        if (card) {
            // Check day of card and activate that day filter if needed
            const cardDay = card.getAttribute('data-day') || '';
            let targetDay = 'all';
            if (cardDay.toLowerCase().includes('fri')) targetDay = 'friday';
            else if (cardDay.toLowerCase().includes('sat')) targetDay = 'saturday';
            else if (cardDay.toLowerCase().includes('sun')) targetDay = 'sunday';

            const dayBtn = document.querySelector(`.filter-btn[data-filter-day="${targetDay}"]`);
            if (dayBtn && !dayBtn.classList.contains('active')) {
                dayBtn.click();
            }

            // Ensure card is visible even if other filters were active
            card.style.display = '';

            setTimeout(() => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('spot-highlight');
                setTimeout(() => card.classList.remove('spot-highlight'), 2500);
            }, 150);
        }
    }

    scrollToArtistSpot();
    window.addEventListener('hashchange', scrollToArtistSpot);
});

// React immediately to language switch
window.addEventListener('languageChanged', () => {
    syncFavoriteCards();
    const countEl = document.getElementById('filtered-count');
    if (countEl) {
        const isCs = getActiveLanguage() === 'cs';
        const cards = document.querySelectorAll('.artist-card');
        const visible = Array.from(cards).filter(c => c.style.display !== 'none').length;
        countEl.textContent = isCs ? `[ Zobrazeno ${visible} z 60 interpretů ]` : `[ Showing ${visible} of 60 performers ]`;
    }
});
