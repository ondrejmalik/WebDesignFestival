// components/nav.js - Unified App-Shell Navigation with Alza Drawer & Albert Bottom Dock
// Works seamlessly on local server and direct file:/// filesystem launch.
(function() {
    'use strict';

    // Robust path resolution for file:/// and HTTP environments
    function getCurrentPage() {
        let pathname = (window.location.pathname || '').replace(/\\/g, '/');
        // Filter empty tokens so trailing slashes (/artists/) don't produce an empty string
        const segments = pathname.split('/').filter(Boolean);
        const lastSegment = (segments.pop() || '').toLowerCase().split('?')[0].split('#')[0];
        let page = lastSegment;

        if (page === '' || page === 'index' || page === 'webdesignfestival') {
            return 'index.html';
        }
        if (!page.includes('.')) {
            page = page + '.html';
        }

        const validPages = [
            'index.html',
            'program.html',
            'artists.html',
            'stages.html',
            'practical-info.html',
            'my-schedule.html',
            'artist-detail.html'
        ];

        if (validPages.includes(page)) {
            return page;
        }

        for (const vp of validPages) {
            if (pathname.toLowerCase().includes(vp)) {
                return vp;
            }
        }

        return 'index.html';
    }

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

        const currentTheme = (typeof window.getFestivalTheme === 'function')
            ? window.getFestivalTheme()
            : (localStorage.getItem('festival_theme') || 'light');
        const isDark = currentTheme === 'dark';
        const themeIcon = isDark ? '☀️' : '🌙';
        const themeLabel = isDark
            ? (isCs ? 'Světlý' : 'Light')
            : (isCs ? 'Tmavý' : 'Dark');
        const themeTitle = isDark
            ? (isCs ? 'Přepnout na světlý režim' : 'Switch to Light Mode')
            : (isCs ? 'Přepnout na tmavý režim' : 'Switch to Dark Mode');

        // Detect current page for active indicator
        const currentPath = getCurrentPage();

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
        <button id="theme-switch-btn" class="btn-box theme-switch-btn" type="button" aria-label="${themeTitle}" title="${themeTitle}">
            <span class="theme-icon" id="theme-icon" aria-hidden="true">${themeIcon}</span>
            <span class="theme-label" id="theme-label">${themeLabel}</span>
        </button>
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
        <div class="theme-switch-box" style="margin-bottom: 8px; width: 100%;">
            <button id="theme-switch-btn-drawer" class="btn-box theme-switch-btn" type="button" aria-label="${themeTitle}" title="${themeTitle}" style="width: 100%; justify-content: center;">
                <span class="theme-icon" id="theme-icon-drawer" aria-hidden="true">${themeIcon}</span>
                <span class="theme-label" id="theme-label-drawer">${themeLabel}</span>
            </button>
        </div>
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

    // Synchronize active classes on bottom dock and drawer without destroying DOM
    function updateActiveNavigation(activePage) {
        const pageName = activePage || getCurrentPage();

        const dockItems = document.querySelectorAll('.bottom-nav-dock .bottom-dock-item, .bottom-nav-dock a');
        dockItems.forEach(item => {
            const href = (item.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
            if (href === pageName) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });

        const drawerLinks = document.querySelectorAll('.alza-drawer .drawer-links a');
        drawerLinks.forEach(link => {
            const href = (link.getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
            if (href === pageName) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    // Update navigation text and icons in-place without DOM destruction
    function updateNavLanguage(lang) {
        const isCs = lang === 'cs';
        const dict = (window.FESTIVAL_I18N && window.FESTIVAL_I18N[lang]) || {};

        const dockArtists = dict.dock_artists || (isCs ? 'Účinkující' : 'Artists');
        const dockStages = dict.dock_stages || (isCs ? 'Scény' : 'Stages');
        const dockHome = dict.dock_home || (isCs ? 'ÚVOD' : 'HOME');
        const dockTimetable = dict.dock_timetable || (isCs ? 'Program' : 'Timetable');
        const dockMyPlan = dict.dock_myplan || (isCs ? 'Můj plán' : 'My Plan');

        const flagImg = isCs ? 'img/1f1e8-1f1ff.svg' : 'img/1f1ec-1f1e7.svg';
        const flagAlt = isCs ? 'CZ' : 'GB';
        const langText = isCs ? 'Jazyk' : 'Language';
        const title = isCs ? 'Přepnout do angličtiny' : 'Switch language to Czech';

        const lblArtists = document.querySelector('[data-i18n="dock_artists"]');
        if (lblArtists) lblArtists.textContent = dockArtists;

        const lblStages = document.querySelector('[data-i18n="dock_stages"]');
        if (lblStages) lblStages.textContent = dockStages;

        const lblHome = document.querySelector('[data-i18n="dock_home"]');
        if (lblHome) lblHome.textContent = dockHome;

        const lblTimetable = document.querySelector('[data-i18n="dock_timetable"]');
        if (lblTimetable) lblTimetable.textContent = dockTimetable;

        const lblMyPlan = document.querySelector('[data-i18n="dock_myplan"]');
        if (lblMyPlan) lblMyPlan.textContent = dockMyPlan;

        document.querySelectorAll('.lang-switch-btn').forEach(btn => {
            const flagEl = btn.querySelector('.flag-icon, [id^="lang-flag"]');
            const labelEl = btn.querySelector('.lang-label, [id^="lang-label"]');
            if (flagEl) {
                flagEl.innerHTML = `<img src="${flagImg}" alt="${flagAlt}" class="flag-img" width="20" height="20">`;
            }
            if (labelEl) {
                labelEl.textContent = langText;
            }
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', langText);
        });

        const drawerLinkMap = {
            nav_home: isCs ? '🏠 [ Úvod ]' : '🏠 [ Home ]',
            nav_program: isCs ? '📅 [ Program ]' : '📅 [ Program ]',
            nav_artists: isCs ? '🎤 [ Účinkující ]' : '🎤 [ Artists ]',
            nav_stages: isCs ? '⛺ [ Scény ]' : '⛺ [ Stages ]',
            nav_practical: isCs ? '🚆 [ Praktické info ]' : '🚆 [ Practical Info ]',
            nav_myschedule: isCs ? '★ [ Můj program ]' : '★ [ My Schedule ]'
        };
        for (const [key, text] of Object.entries(drawerLinkMap)) {
            const link = document.querySelector(`.drawer-links a[data-i18n="${key}"]`);
            if (link) link.textContent = text;
        }

        const drawerCloseBtn = document.getElementById('menu-drawer-close-btn');
        if (drawerCloseBtn) {
            drawerCloseBtn.textContent = isCs ? '[ ✕ Zavřít ]' : '[ ✕ Close ]';
        }

        if (typeof window.updateThemeButtons === 'function') {
            window.updateThemeButtons();
        }
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
            const isCs = (typeof window.getFestivalLang === 'function' ? window.getFestivalLang() : 'en') === 'cs';
            const dockPlanLink = document.getElementById('dock-item-myplan');
            if (dockPlanLink) {
                if (count > 0) {
                    if (isCs) {
                        const countStr = count === 1 ? '1 uložené vystoupení' : (count >= 2 && count <= 4 ? `${count} uložená vystoupení` : `${count} uložených vystoupení`);
                        dockPlanLink.setAttribute('title', `Můj plán (${countStr})`);
                    } else {
                        dockPlanLink.setAttribute('title', `My Plan (${count === 1 ? '1 saved show' : count + ' saved shows'})`);
                    }
                } else {
                    dockPlanLink.setAttribute('title', isCs ? 'Můj plán' : 'My Plan');
                }
            }
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

    // Event delegation on bottom dock to guarantee instant hit-testing and smooth handling
    let dockInteractionsAttached = false;
    function setupBottomDockInteractions() {
        const dock = document.querySelector('.bottom-nav-dock');
        if (!dock || dockInteractionsAttached) return;

        dock.addEventListener('click', (e) => {
            const item = e.target.closest('.bottom-dock-item, a');
            if (!item) return;

            // Immediately dismiss open drawer if active
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

            const href = item.getAttribute('href');
            if (!href) return;

            const targetPage = href.split('?')[0].split('#')[0].toLowerCase();
            const currentPage = getCurrentPage();

            // If user taps the tab of the current page and there are no active query or hash parameters: smooth scroll to top
            if (targetPage === currentPage && !window.location.search && !window.location.hash) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Otherwise, allow standard browser navigation to target page
        });

        dockInteractionsAttached = true;
    }

    function initNav() {
        const placeholder = document.getElementById("nav-placeholder");
        const currentLang = (typeof window.getFestivalLang === 'function') 
            ? window.getFestivalLang() 
            : (localStorage.getItem('festival_language') || 'en');

        if (!placeholder) return;

        // Check if placeholder already has static HTML markup
        const hasExistingNav = placeholder.querySelector('.bottom-nav-dock') && placeholder.querySelector('.wf-top-app-bar');

        if (!hasExistingNav) {
            // Only inject HTML if container was empty
            placeholder.innerHTML = getNavHTML(currentLang);
        } else {
            // Non-destructive synchronization: preserve DOM nodes to eliminate click-drop race conditions
            updateNavLanguage(currentLang);
        }

        const currentPage = getCurrentPage();
        updateActiveNavigation(currentPage);
        setupDrawer();
        setupBottomDockInteractions();
        setupGlobalKeyboard();
        updateBottomBadge();

        const langBtns = placeholder.querySelectorAll('.lang-switch-btn');
        langBtns.forEach(btn => {
            if (typeof window.toggleFestivalLang === 'function') {
                btn.onclick = window.toggleFestivalLang;
            }
        });

        const themeBtns = placeholder.querySelectorAll('.theme-switch-btn');
        themeBtns.forEach(btn => {
            btn.onclick = () => {
                if (typeof window.toggleFestivalTheme === 'function') {
                    window.toggleFestivalTheme();
                } else {
                    const current = localStorage.getItem('festival_theme') || 'light';
                    const next = current === 'dark' ? 'light' : 'dark';
                    localStorage.setItem('festival_theme', next);
                    if (next === 'dark') {
                        document.documentElement.classList.add('dark-mode');
                        document.documentElement.setAttribute('data-theme', 'dark');
                    } else {
                        document.documentElement.classList.remove('dark-mode');
                        document.documentElement.setAttribute('data-theme', 'light');
                    }
                    if (typeof window.updateThemeButtons === 'function') {
                        window.updateThemeButtons(next);
                    }
                }
            };
        });

        if (typeof window.updateThemeButtons === 'function') {
            window.updateThemeButtons();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initNav);
    } else {
        initNav();
    }

    window.addEventListener('languageChanged', (e) => {
        const newLang = (e && e.detail && e.detail.lang) 
            ? e.detail.lang 
            : (localStorage.getItem('festival_language') || 'en');
        updateNavLanguage(newLang);
        updateActiveNavigation(getCurrentPage());
    });

    window.addEventListener('themeChanged', (e) => {
        const theme = (e && e.detail && e.detail.theme) || 'light';
        if (typeof window.updateThemeButtons === 'function') {
            window.updateThemeButtons(theme);
        }
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
    window.getCurrentPage = getCurrentPage;
    window.updateActiveNavigation = updateActiveNavigation;
})();
