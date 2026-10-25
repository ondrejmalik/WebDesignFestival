// components/nav.js - Unified App-Shell Navigation with Alza Drawer & Albert Bottom Dock
// Works seamlessly on local server and direct file:/// filesystem launch.
(function() {
    'use strict';

    function getNavHTML(lang) {
        const isCs = lang === 'cs';
        const brand = '[ Festival of Darkness 2 ]';
        const menuBtnText = isCs ? '[ ☰ Menu ]' : '[ ☰ Menu ]';
        const closeBtnText = isCs ? '[ ✕ Zavřít ]' : '[ ✕ Close ]';

        const home = isCs ? '[ Úvod ]' : '[ Home ]';
        const program = isCs ? '[ Program ]' : '[ Program ]';
        const artists = isCs ? '[ Účinkující ]' : '[ Artists ]';
        const stages = isCs ? '[ Scény ]' : '[ Stages ]';
        const practical = isCs ? '[ Praktické info ]' : '[ Practical Info ]';
        const mySchedule = isCs ? '[ Můj program ]' : '[ My Schedule ]';

        const dockArtists = isCs ? 'Účinkující' : 'Artists';
        const dockStages = isCs ? 'Scény' : 'Stages';
        const dockHome = isCs ? 'ÚVOD' : 'HOME';
        const dockTimetable = isCs ? 'Program' : 'Timetable';
        const dockMyPlan = isCs ? 'Můj plán' : 'My Plan';

        const flagImg = isCs ? 'img/1f1e8-1f1ff.svg' : 'img/1f1ec-1f1e7.svg';
        const flagAlt = isCs ? 'CZ' : 'GB';
        const flag = `<img src="${flagImg}" alt="${flagAlt}" class="flag-img" width="20" height="20">`;
        const langText = isCs ? 'Jazyk' : 'Language';
        const title = isCs ? 'Přepnout do angličtiny' : 'Switch language to Czech';

        // Detect current page for active indicator
        let currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
        if (currentPath === '') currentPath = 'index.html';

        return `
<!-- 1. Top Bar (Centered Festival Name + Right Menu Button) -->
<header class="wf-top-app-bar" role="banner">
    <div class="wf-top-bar-left">
        <button id="lang-switch-btn" class="btn-box lang-switch-btn" type="button" aria-label="${langText}" title="${title}">
            <span class="flag-icon" id="lang-flag" aria-hidden="true">${flag}</span>
            <span class="lang-label" id="lang-label">${langText}</span>
        </button>
    </div>
    <div class="wf-top-bar-center">
        <a href="index.html" class="festival-brand" aria-label="Festival of Darkness 2 Home">
            <strong>${brand}</strong>
        </a>
    </div>
    <div class="wf-top-bar-right">
        <button id="menu-drawer-open-btn" class="btn-box wf-menu-btn" type="button" aria-expanded="false" aria-controls="alza-menu-drawer" aria-label="Open Navigation Menu">
            ${menuBtnText}
        </button>
    </div>
</header>
<hr class="wf-top-bar-divider">

<!-- 2. Alza-Style Slide-Out Navigation Drawer & Overlay -->
<div id="alza-drawer-backdrop" class="drawer-backdrop" aria-hidden="true"></div>
<aside id="alza-menu-drawer" class="alza-drawer" aria-label="Site Menu" aria-hidden="true">
    <div class="drawer-header">
        <span class="drawer-title"><strong>${brand}</strong></span>
        <button id="menu-drawer-close-btn" class="btn-box drawer-close-btn" type="button" aria-label="Close navigation menu">
            ${closeBtnText}
        </button>
    </div>
    <hr>
    <nav class="drawer-links" aria-label="Drawer Navigation">
        <a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}" data-i18n="nav_home">🏠 ${home}</a>
        <a href="program.html" class="${currentPath === 'program.html' ? 'active' : ''}" data-i18n="nav_program">📅 ${program}</a>
        <a href="artists.html" class="${currentPath === 'artists.html' ? 'active' : ''}" data-i18n="nav_artists">🎤 ${artists}</a>
        <a href="stages.html" class="${currentPath === 'stages.html' ? 'active' : ''}" data-i18n="nav_stages">⛺ ${stages}</a>
        <a href="practical-info.html" class="${currentPath === 'practical-info.html' ? 'active' : ''}" data-i18n="nav_practical">🚆 ${practical}</a>
        <a href="my-schedule.html" class="${currentPath === 'my-schedule.html' ? 'active' : ''}" data-i18n="nav_myschedule">★ ${mySchedule}</a>
    </nav>
    <hr>
    <div class="drawer-footer">
        <div class="lang-switch-box" style="margin: 0; width: 100%;">
            <button id="lang-switch-btn-drawer" class="btn-box lang-switch-btn" type="button" aria-label="${langText}" title="${title}" style="width: 100%; justify-content: center;">
                <span class="flag-icon" id="lang-flag-drawer" aria-hidden="true">${flag}</span>
                <span class="lang-label" id="lang-label-drawer">${langText}</span>
            </button>
        </div>
    </div>
</aside>

<!-- 3. Ergonomic Bottom Thumb Navigation Dock (Albert App Style: Artists - Stages - HOME - Timetable - My Plan) -->
<nav class="bottom-nav-dock" aria-label="Mobile Bottom Navigation">
    <a href="artists.html" class="bottom-dock-item bottom-nav-item ${currentPath === 'artists.html' ? 'active' : ''}" id="dock-item-artists">
        <span class="dock-icon">🎤</span>
        <span class="dock-label" data-i18n="dock_artists">${dockArtists}</span>
    </a>
    <a href="stages.html" class="bottom-dock-item bottom-nav-item ${currentPath === 'stages.html' ? 'active' : ''}" id="dock-item-stages">
        <span class="dock-icon">⛺</span>
        <span class="dock-label" data-i18n="dock_stages">${dockStages}</span>
    </a>
    <a href="index.html" class="bottom-dock-item bottom-nav-item bottom-dock-home ${currentPath === 'index.html' ? 'active' : ''}" id="dock-item-home">
        <span class="dock-icon">🏠</span>
        <span class="dock-label" data-i18n="dock_home">${dockHome}</span>
    </a>
    <a href="program.html" class="bottom-dock-item bottom-nav-item ${currentPath === 'program.html' ? 'active' : ''}" id="dock-item-timetable">
        <span class="dock-icon">📅</span>
        <span class="dock-label" data-i18n="dock_timetable">${dockTimetable}</span>
    </a>
    <a href="my-schedule.html" class="bottom-dock-item bottom-nav-item ${currentPath === 'my-schedule.html' ? 'active' : ''}" id="dock-item-myplan">
        <span class="dock-icon">★</span>
        <span class="dock-label"><span data-i18n="dock_myplan">${dockMyPlan}</span> <span class="nav-badge-count" style="display:none;">0</span></span>
    </a>
</nav>
`;
    }

    // Badge synchronizer with localStorage['festival_favorites']
    function updateBottomBadge() {
        try {
            const raw = localStorage.getItem('festival_favorites');
            const favs = raw ? JSON.parse(raw) : [];
            const count = Array.isArray(favs) ? favs.length : 0;
            const badges = document.querySelectorAll('.nav-badge-count, .fav-count-badge');
            badges.forEach(b => {
                b.textContent = count;
                if (b.classList.contains('nav-badge-count')) {
                    b.style.display = count > 0 ? 'inline-block' : 'none';
                }
            });
        } catch (e) {}
    }

    // Global keyboard listener for Escape key (attached once)
    let escapeListenerAttached = false;
    function setupGlobalKeyboard() {
        if (escapeListenerAttached) return;
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const drawer = document.getElementById('alza-menu-drawer');
                const backdrop = document.getElementById('alza-drawer-backdrop');
                const openBtn = document.getElementById('menu-drawer-open-btn');
                if (drawer && drawer.classList.contains('is-open')) {
                    drawer.classList.remove('is-open');
                    if (backdrop) backdrop.classList.remove('is-open');
                    drawer.setAttribute('aria-hidden', 'true');
                    if (backdrop) backdrop.setAttribute('aria-hidden', 'true');
                    if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
                    document.body.classList.remove('drawer-open-noscroll');
                }
            }
        });
        escapeListenerAttached = true;
    }

    // Drawer state management
    function setupDrawer() {
        const openBtn = document.getElementById('menu-drawer-open-btn');
        const closeBtn = document.getElementById('menu-drawer-close-btn');
        const drawer = document.getElementById('alza-menu-drawer');
        const backdrop = document.getElementById('alza-drawer-backdrop');

        if (!drawer || !backdrop) return;

        function openDrawer() {
            drawer.classList.add('is-open');
            backdrop.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            backdrop.setAttribute('aria-hidden', 'false');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('drawer-open-noscroll');
        }

        function closeDrawer() {
            drawer.classList.remove('is-open');
            backdrop.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            backdrop.setAttribute('aria-hidden', 'true');
            if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('drawer-open-noscroll');
        }

        if (openBtn) openBtn.onclick = openDrawer;
        if (closeBtn) closeBtn.onclick = closeDrawer;
        backdrop.onclick = closeDrawer;

        drawer.querySelectorAll('.drawer-links a').forEach(a => {
            a.addEventListener('click', closeDrawer);
        });
    }

    function initNav() {
        const placeholder = document.getElementById("nav-placeholder");
        const currentLang = (typeof window.getFestivalLang === 'function') 
            ? window.getFestivalLang() 
            : (localStorage.getItem('festival_language') || 'en');

        if (placeholder) {
            // Check if drawer was open prior to re-render (e.g. language toggle inside drawer)
            const existingDrawer = document.getElementById('alza-menu-drawer');
            const wasDrawerOpen = existingDrawer && existingDrawer.classList.contains('is-open');

            placeholder.innerHTML = getNavHTML(currentLang);
            setupDrawer();
            setupGlobalKeyboard();
            updateBottomBadge();

            // Seamlessly preserve drawer open state across language toggles
            if (wasDrawerOpen) {
                const newDrawer = document.getElementById('alza-menu-drawer');
                const newBackdrop = document.getElementById('alza-drawer-backdrop');
                const newOpenBtn = document.getElementById('menu-drawer-open-btn');
                if (newDrawer && newBackdrop) {
                    newDrawer.classList.add('is-open');
                    newBackdrop.classList.add('is-open');
                    newDrawer.setAttribute('aria-hidden', 'false');
                    newBackdrop.setAttribute('aria-hidden', 'false');
                    if (newOpenBtn) newOpenBtn.setAttribute('aria-expanded', 'true');
                    document.body.classList.add('drawer-open-noscroll');
                }
            }

            const langBtns = placeholder.querySelectorAll('.lang-switch-btn');
            langBtns.forEach(btn => {
                if (typeof window.toggleFestivalLang === 'function') {
                    btn.onclick = window.toggleFestivalLang;
                }
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNav);
    } else {
        initNav();
    }

    window.addEventListener('languageChanged', () => {
        initNav();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'festival_favorites') {
            updateBottomBadge();
        }
    });

    // Custom event to update badge immediately from internal scripts
    window.addEventListener('favoritesUpdated', () => {
        updateBottomBadge();
    });

    window.updateNavBadge = updateBottomBadge;
})();
