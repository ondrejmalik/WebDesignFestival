// js/theme.js - Dark Mode & Theme Manager for Festival of Darkness 2
// Pure client-side solution supporting local server and direct file:/// launch.
(function() {
    'use strict';

    const THEME_STORAGE_KEY = 'festival_theme';

    function getFestivalTheme() {
        try {
            const saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
        } catch (e) {}
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark-mode');
            root.setAttribute('data-theme', 'dark');
            if (document.body) {
                document.body.classList.add('dark-mode');
                document.body.setAttribute('data-theme', 'dark');
            }
        } else {
            root.classList.remove('dark-mode');
            root.setAttribute('data-theme', 'light');
            if (document.body) {
                document.body.classList.remove('dark-mode');
                document.body.setAttribute('data-theme', 'light');
            }
        }

        updateThemeButtons(theme);
    }

    function updateThemeButtons(theme) {
        const currentTheme = theme || getFestivalTheme();
        const isDark = currentTheme === 'dark';
        const lang = (typeof window.getFestivalLang === 'function')
            ? window.getFestivalLang()
            : (localStorage.getItem('festival_language') || 'en');
        const isCs = lang === 'cs';

        // When Dark mode is active, the button offers switching to Light mode
        // When Light mode is active, the button offers switching to Dark mode
        const icon = isDark ? '☀️' : '🌙';
        const label = isDark
            ? (isCs ? 'Světlý' : 'Light')
            : (isCs ? 'Tmavý' : 'Dark');
        const title = isDark
            ? (isCs ? 'Přepnout na světlý režim' : 'Switch to Light Mode')
            : (isCs ? 'Přepnout na tmavý režim' : 'Switch to Dark Mode');

        const buttons = document.querySelectorAll('.theme-switch-btn');
        buttons.forEach(btn => {
            btn.setAttribute('title', title);
            btn.setAttribute('aria-label', title);
            btn.setAttribute('data-current-theme', currentTheme);

            const iconEl = btn.querySelector('.theme-icon, [id^="theme-icon"]');
            if (iconEl) {
                iconEl.textContent = icon;
            }
            const labelEl = btn.querySelector('.theme-label, [id^="theme-label"]');
            if (labelEl) {
                labelEl.textContent = label;
            }
        });
    }

    function setFestivalTheme(theme) {
        const targetTheme = (theme === 'dark') ? 'dark' : 'light';
        try {
            localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
        } catch (e) {}
        applyTheme(targetTheme);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: targetTheme } }));
    }

    function toggleFestivalTheme() {
        const current = getFestivalTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        setFestivalTheme(next);
        return next;
    }

    // Immediate execution for anti-flicker (FOUC prevention)
    const initialTheme = getFestivalTheme();
    if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.documentElement.setAttribute('data-theme', 'light');
    }

    // Attach click handlers when DOM is ready
    function initThemeUI() {
        const currentTheme = getFestivalTheme();
        applyTheme(currentTheme);

        document.querySelectorAll('.theme-switch-btn').forEach(btn => {
            btn.onclick = toggleFestivalTheme;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeUI);
    } else {
        initThemeUI();
    }

    // Synchronize across tabs
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_STORAGE_KEY) {
            const newTheme = e.newValue || 'light';
            applyTheme(newTheme);
        }
    });

    // Update button text when language changes
    window.addEventListener('languageChanged', () => {
        updateThemeButtons(getFestivalTheme());
    });

    // Expose helpers globally
    window.getFestivalTheme = getFestivalTheme;
    window.setFestivalTheme = setFestivalTheme;
    window.toggleFestivalTheme = toggleFestivalTheme;
    window.updateThemeButtons = updateThemeButtons;
})();
