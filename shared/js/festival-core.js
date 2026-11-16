// shared/js/festival-core.js - Unified theme, language, favorites, nav, and utilities for all 11 designs
(function () {
  'use strict';

  const FAV_KEY = 'festival_favorites';
  const THEME_KEY = 'festival_theme';
  const LANG_COMPAT_KEY = 'festival_language';
  const DARK_NATIVE_DESIGNS = new Set(['05-linear', '06-neurosama', '09-wand', '11-zzz']);

  function getDesignId() {
    const attr = document.documentElement.getAttribute('data-design');
    if (attr) return attr;
    const m = (window.location.pathname || '').match(/designs\/([^/]+)\//);
    return m ? m[1] : '';
  }

  function getNativeTheme() {
    const attr = document.documentElement.getAttribute('data-native-theme');
    if (attr === 'dark' || attr === 'light') return attr;
    return DARK_NATIVE_DESIGNS.has(getDesignId()) ? 'dark' : 'light';
  }

  function getCurrentPage() {
    const pathname = (window.location.pathname || '').replace(/\\/g, '/');
    const segments = pathname.split('/').filter(Boolean);
    let page = (segments.pop() || '').toLowerCase().split('?')[0].split('#')[0];
    if (!page || page === 'index' || page === 'v2') return 'index.html';
    if (!page.includes('.')) page += '.html';
    const valid = [
      'index.html', 'program.html', 'artists.html', 'artist-detail.html',
      'stages.html', 'practical-info.html', 'my-schedule.html', 'search.html'
    ];
    if (valid.includes(page)) return page;
    for (let i = 0; i < valid.length; i++) {
      if (pathname.toLowerCase().includes(valid[i])) return valid[i];
    }
    return 'index.html';
  }

  function getLang() {
    if (typeof window.getFestivalLang === 'function') {
      return window.getFestivalLang();
    }
    try {
      const saved = localStorage.getItem(LANG_COMPAT_KEY) || localStorage.getItem('fod2_lang') || localStorage.getItem('festival_lang') || localStorage.getItem('fd2_lang');
      if (saved === 'cs' || saved === 'en') return saved;
    } catch (e) {}
    return document.documentElement.lang === 'cs' ? 'cs' : 'en';
  }

  function t(en, cs) {
    return getLang() === 'cs' ? cs : en;
  }

  function formatCzPlural(n, one, few, many) {
    const num = Number(n);
    const abs = Number.isFinite(num) ? Math.abs(num) : 0;
    let form = many;
    if (abs === 1) form = one;
    else if (Number.isInteger(abs) && abs >= 2 && abs <= 4) form = few;
    return `${abs} ${form}`;
  }

  function formatShowsCount(n, lang) {
    const isCs = (lang || getLang()) === 'cs';
    if (isCs) return formatCzPlural(n, 'uložené vystoupení', 'uložená vystoupení', 'uložených vystoupení');
    return n === 1 ? '1 saved show' : `${n} saved shows`;
  }

  function formatSetsCount(n, lang) {
    const isCs = (lang || getLang()) === 'cs';
    if (isCs) return formatCzPlural(n, 'vystoupení', 'vystoupení', 'vystoupení');
    return n === 1 ? '1 set' : `${n} sets`;
  }

  // =========================================================================
  // THEME MANAGER
  // =========================================================================
  function getFestivalTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return getNativeTheme();
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    const root = document.documentElement;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    root.classList.toggle('dark-mode', isDark);
    root.classList.toggle('light-mode', !isDark);
    if (document.body) {
      document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', isDark);
      document.body.classList.toggle('light-mode', !isDark);
    }
    updateThemeButtons(theme);
  }

  function updateThemeButtons(theme) {
    const cur = theme || getFestivalTheme();
    const isDark = cur === 'dark';
    const isCs = getLang() === 'cs';
    const icon = isDark ? '☀' : '☾';
    const label = isDark ? (isCs ? 'Světlý' : 'Light') : (isCs ? 'Tmavý' : 'Dark');
    const title = isDark
      ? (isCs ? 'Přepnout na světlý režim' : 'Switch to Light Mode')
      : (isCs ? 'Přepnout na tmavý režim' : 'Switch to Dark Mode');

    document.querySelectorAll('.theme-switch-btn').forEach(btn => {
      btn.setAttribute('title', title);
      btn.setAttribute('aria-label', title);
      btn.setAttribute('data-current-theme', cur);
      const iconEl = btn.querySelector('.theme-icon');
      const labelEl = btn.querySelector('.theme-label');
      if (iconEl) iconEl.textContent = icon;
      if (labelEl) labelEl.textContent = label;
    });
  }

  function setFestivalTheme(theme) {
    const target = theme === 'dark' ? 'dark' : 'light';
    try {
      localStorage.setItem(THEME_KEY, target);
    } catch (e) {}
    applyTheme(target);
    try {
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: target } }));
    } catch (e) {}
    return target;
  }

  function toggleFestivalTheme() {
    const next = getFestivalTheme() === 'dark' ? 'light' : 'dark';
    return setFestivalTheme(next);
  }

  // Immediate FOUC prevention before DOMContentLoaded
  (function initThemeEarly() {
    const native = getNativeTheme();
    document.documentElement.setAttribute('data-native-theme', native);
    const id = getDesignId();
    if (id) document.documentElement.setAttribute('data-design', id);
    const initial = getFestivalTheme();
    document.documentElement.setAttribute('data-theme', initial);
    document.documentElement.classList.toggle('dark-mode', initial === 'dark');
    document.documentElement.classList.toggle('light-mode', initial === 'light');
  })();

  window.getFestivalTheme = getFestivalTheme;
  window.setFestivalTheme = setFestivalTheme;
  window.toggleFestivalTheme = toggleFestivalTheme;
  window.updateThemeButtons = updateThemeButtons;

  // =========================================================================
  // LANGUAGE BRIDGE (enhances each design's v2/js/lang.js cleanly)
  // =========================================================================
  const NAV_LABELS = {
    'index.html': { en: 'Overview', cs: 'Přehled' },
    'program.html': { en: 'Program', cs: 'Program' },
    'artists.html': { en: 'Artists', cs: 'Účinkující' },
    'stages.html': { en: 'Stages', cs: 'Pódia' },
    'practical-info.html': { en: 'Info', cs: 'Info' },
    'my-schedule.html': { en: 'My Schedule', cs: 'Můj plán' },
    'search.html': { en: 'Search', cs: 'Hledat' }
  };

  function applyExtraTranslations(lang) {
    const isCs = lang === 'cs';
    const dict = (window.FESTIVAL_I18N && (window.FESTIVAL_I18N[lang] || window.FESTIVAL_I18N.en)) || {};

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.innerHTML = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key && Object.prototype.hasOwnProperty.call(dict, key)) {
        el.setAttribute('title', dict[key]);
      }
    });

    document.querySelectorAll('.lang-en').forEach(el => el.classList.toggle('is-hidden', isCs));
    document.querySelectorAll('.lang-cs').forEach(el => el.classList.toggle('is-hidden', !isCs));

    // Translate header/footer nav links that do not already have a valid dict key
    document.querySelectorAll('header nav a, footer a, .side-rail nav a').forEach(a => {
      if (a.classList.contains('brand') || a.classList.contains('eb-logo') || a.classList.contains('rail-brand')) return;
      const existingKey = a.getAttribute('data-i18n');
      if (existingKey && Object.prototype.hasOwnProperty.call(dict, existingKey)) return;
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!NAV_LABELS[href]) return;
      const badge = a.querySelector('.nav-badge-count');
      const labelSpan = a.querySelector('span:not(.nav-badge-count)');
      const labelText = isCs ? NAV_LABELS[href].cs : NAV_LABELS[href].en;
      if (labelSpan) {
        labelSpan.textContent = labelText;
      } else {
        // Preserve badge node if present
        a.textContent = labelText;
        if (badge) {
          a.appendChild(document.createTextNode(' '));
          a.appendChild(badge);
        }
      }
    });

    // Update all language buttons consistently
    document.querySelectorAll('#lang-toggle, .lang-btn, .lang-switch, .lang-toggle, .mobile-lang-btn').forEach(btn => {
      const optPills = btn.querySelectorAll('[data-lang-opt], [data-lang-option]');
      if (optPills.length > 0) {
        optPills.forEach(p => {
          const val = (p.getAttribute('data-lang-opt') || p.getAttribute('data-lang-option') || '').toLowerCase();
          p.classList.toggle('is-active', val === lang);
          p.classList.toggle('active', val === lang);
        });
      } else {
        const textTarget = btn.querySelector('[data-i18n="lang_code"], [data-i18n="nav.langToggle"]') || btn;
        if (textTarget === btn && btn.querySelector('.lang-indicator')) {
          const spans = btn.querySelectorAll('span:not(.lang-indicator)');
          if (spans.length) spans[0].textContent = isCs ? 'EN' : 'CZ';
        } else if (btn.children.length === 0 || textTarget !== btn) {
          textTarget.textContent = isCs ? 'EN' : 'CZ';
        } else {
          btn.textContent = isCs ? 'EN' : 'CZ';
        }
      }
      btn.setAttribute('aria-label', isCs ? 'Switch to English' : 'Přepnout do češtiny');
      btn.setAttribute('title', isCs ? 'Switch to English' : 'Přepnout do češtiny');
    });

    updateThemeButtons(getFestivalTheme());
  }

  function bindLangButtonsClean() {
    document.querySelectorAll('#lang-toggle, .lang-btn, .lang-switch, .lang-toggle, .mobile-lang-btn').forEach(btn => {
      if (btn.dataset.fodLangBound) return;
      if (btn.getAttribute('onclick')) {
        btn.dataset.fodLangBound = '1';
        return;
      }
      const clone = btn.cloneNode(true);
      clone.dataset.fodLangBound = '1';
      clone.addEventListener('click', () => window.toggleFestivalLang());
      if (btn.parentNode) btn.parentNode.replaceChild(clone, btn);
    });
  }

  function installLanguageBridge() {
    const origSet = window.setFestivalLang;
    window.setFestivalLang = function (lang) {
      const normalized = lang === 'cs' ? 'cs' : 'en';
      let res = normalized;
      if (typeof origSet === 'function') {
        res = origSet(normalized);
      }
      try {
        localStorage.setItem(LANG_COMPAT_KEY, normalized);
      } catch (e) {}
      document.documentElement.lang = normalized;
      applyExtraTranslations(normalized);
      try {
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: normalized } }));
      } catch (e) {}
      return res;
    };

    window.toggleFestivalLang = function () {
      const cur = getLang();
      return window.setFestivalLang(cur === 'en' ? 'cs' : 'en');
    };

    bindLangButtonsClean();

    // Sync initial language cleanly if festival_language was set on another design
    try {
      const compat = localStorage.getItem(LANG_COMPAT_KEY);
      if ((compat === 'cs' || compat === 'en') && compat !== getLang()) {
        window.setFestivalLang(compat);
      } else {
        applyExtraTranslations(getLang());
      }
    } catch (e) {
      applyExtraTranslations(getLang());
    }
  }

  // =========================================================================
  // FAVORITES ENGINE (festival_favorites)
  // =========================================================================
  function getCatalogMap() {
    const map = {};
    const list = (window.FESTIVAL_DATA && window.FESTIVAL_DATA.PERFORMERS) || [];
    for (let i = 0; i < list.length; i++) {
      map[list[i].id] = list[i];
    }
    return map;
  }

  function enrichFavorite(item) {
    if (!item) return null;
    const id = typeof item === 'string' ? item : String(item.id || '');
    if (!id) return null;
    const cat = getCatalogMap()[id] || {};
    return {
      id: id,
      artist: (typeof item === 'object' && (item.artist || item.name)) || cat.name || id,
      stage: (typeof item === 'object' && item.stage) || cat.stage || 'Solar Horizon Stage',
      day: (typeof item === 'object' && item.day) || cat.dayEn || 'Friday, July 10, 2026',
      time: (typeof item === 'object' && item.time) || cat.time || '14:00 - 14:45',
      genre: (typeof item === 'object' && item.genre) || cat.genre || 'Electronic'
    };
  }

  function getFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const seen = new Set();
      const out = [];
      for (let i = 0; i < parsed.length; i++) {
        const enr = enrichFavorite(parsed[i]);
        if (enr && !seen.has(enr.id)) {
          seen.add(enr.id);
          out.push(enr);
        }
      }
      return out;
    } catch (e) {
      return [];
    }
  }

  function saveFavorites(items) {
    const seen = new Set();
    const clean = [];
    (items || []).forEach(it => {
      const enr = enrichFavorite(it);
      if (enr && !seen.has(enr.id)) {
        seen.add(enr.id);
        clean.push(enr);
      }
    });
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(clean));
    } catch (e) {}
    updateAllFavBadges(clean.length);
    try {
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { count: clean.length } }));
    } catch (e) {}
    return clean;
  }

  function isFavorite(id) {
    return getFavorites().some(f => f.id === id);
  }

  function toggleFavoriteById(id) {
    const favs = getFavorites();
    const idx = favs.findIndex(f => f.id === id);
    let added = false;
    if (idx > -1) {
      favs.splice(idx, 1);
    } else {
      const enr = enrichFavorite(id);
      if (enr) {
        favs.push(enr);
        added = true;
      }
    }
    saveFavorites(favs);
    const cat = getCatalogMap()[id];
    const name = cat ? cat.name : id;
    showToast(added
      ? t(`Added ${name} to My Schedule`, `${name} přidáno do Mého plánu`)
      : t(`Removed ${name} from My Schedule`, `${name} odebráno z Mého plánu`));
    return added;
  }

  function clearFavorites() {
    saveFavorites([]);
  }

  function updateAllFavBadges(countOverride) {
    const count = typeof countOverride === 'number' ? countOverride : getFavorites().length;
    document.querySelectorAll('.nav-badge-count, .fav-count-badge, #fav-count').forEach(el => {
      el.textContent = String(count);
      if (el.classList.contains('nav-badge-count')) {
        el.classList.toggle('is-hidden', count === 0);
      }
    });
    const planBarCount = document.getElementById('plan-bar-count');
    if (planBarCount) {
      planBarCount.textContent = formatShowsCount(count, getLang());
    }
    const homeCountEl = document.getElementById('fod-home-fav-text');
    if (homeCountEl) {
      homeCountEl.textContent = formatShowsCount(count, getLang());
    }
  }

  window.updateNavBadge = function () { updateAllFavBadges(); };

  // =========================================================================
  // TIME & SCHEDULE COLLISION UTILITIES
  // =========================================================================
  function timeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const parts = timeStr.trim().split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return 0;
    let mins = parts[0] * 60 + parts[1];
    // Post-midnight hours (00:00-07:59) belong to the same festival night (+24h)
    if (parts[0] < 8) mins += 24 * 60;
    return mins;
  }

  function isOverlapping(t1, t2) {
    if (!t1 || !t2) return false;
    const p1 = String(t1).split(/[–-]/).map(s => s.trim());
    const p2 = String(t2).split(/[–-]/).map(s => s.trim());
    if (p1.length < 2 || p2.length < 2) return false;
    return timeToMinutes(p1[0]) < timeToMinutes(p2[1]) && timeToMinutes(p2[0]) < timeToMinutes(p1[1]);
  }

  function normalizeStageKey(stageStr) {
    return String(stageStr || '').toLowerCase().includes('lunar') ? 'lunar' : 'solar';
  }

  function normalizeDayKey(item) {
    if (!item) return 'day1';
    const id = typeof item === 'string' ? item : String(item.id || '');
    const m = id.match(/perf-(\d+)/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n >= 1 && n <= 20) return 'day1';
      if (n >= 21 && n <= 40) return 'day2';
      if (n >= 41 && n <= 60) return 'day3';
    }
    const raw = String(item.day || '').toLowerCase();
    if (raw.includes('day 2') || raw.includes('day2') || raw.includes('saturday') || raw.includes('sobota') || raw.includes('11.')) return 'day2';
    if (raw.includes('day 3') || raw.includes('day3') || raw.includes('sunday') || raw.includes('ned') || raw.includes('12.')) return 'day3';
    return 'day1';
  }

  function normalizeStr(str) {
    return String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function matchesGenreFilter(genre, filter) {
    const f = String(filter || '').toLowerCase();
    if (!f || f === 'all') return true;
    const g = String(genre || '').toLowerCase();
    const aliases = window.FESTIVAL_DATA && window.FESTIVAL_DATA.GENRE_ALIASES && window.FESTIVAL_DATA.GENRE_ALIASES[f];
    if (aliases) return aliases.some(a => g.includes(a));
    return g.includes(f);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // TOAST FEEDBACK
  // =========================================================================
  let toastTimer = null;
  function showToast(msg) {
    if (!document.body) return;
    let el = document.getElementById('fod-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fod-toast';
      el.className = 'fod-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  // =========================================================================
  // HEADER & NAV ENHANCEMENTS (Theme button, Nav Badges, Active States)
  // =========================================================================
  function injectHeaderControls() {
    // 1. Ensure Theme Switch button exists next to language toggle
    if (!document.querySelector('.theme-switch-btn')) {
      const langBtn = document.getElementById('lang-toggle') ||
        document.querySelector('.lang-btn, .lang-switch, .lang-toggle, .eb-lang-btn');
      if (langBtn && langBtn.parentElement) {
        const themeBtn = document.createElement('button');
        themeBtn.type = 'button';
        themeBtn.id = 'theme-switch-btn';
        themeBtn.className = 'fod-theme-btn theme-switch-btn';
        themeBtn.innerHTML = '<span class="theme-icon" aria-hidden="true"></span><span class="theme-label"></span>';
        themeBtn.addEventListener('click', toggleFestivalTheme);
        langBtn.parentElement.insertBefore(themeBtn, langBtn);
      }
    } else {
      document.querySelectorAll('.theme-switch-btn').forEach(btn => {
        if (!btn.dataset.fodThemeBound) {
          btn.dataset.fodThemeBound = '1';
          btn.addEventListener('click', toggleFestivalTheme);
        }
      });
    }
    updateThemeButtons(getFestivalTheme());

    // 2. Ensure My Schedule links in nav & bottom dock carry a live count badge
    document.querySelectorAll('header nav a[href="my-schedule.html"], .side-rail nav a[href="my-schedule.html"], .bottom-nav-dock a[href="my-schedule.html"]').forEach(a => {
      if (!a.querySelector('.nav-badge-count')) {
        const badge = document.createElement('span');
        badge.className = 'nav-badge-count is-hidden';
        badge.textContent = '0';
        const labelEl = a.querySelector('.dock-label') || a;
        labelEl.appendChild(document.createTextNode(' '));
        labelEl.appendChild(badge);
      }
    });

    // 3. Highlight active page in header nav & bottom dock
    const current = getCurrentPage();
    document.querySelectorAll('header nav a, .side-rail nav a, .bottom-nav-dock a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!href || href.startsWith('#')) return;
      const isMatch = href === current || (current === 'artist-detail.html' && href === 'artists.html');
      if (a.closest('.bottom-nav-dock')) {
        a.classList.toggle('active', isMatch);
        a.classList.toggle('is-active', isMatch);
      } else {
        a.classList.toggle('active', isMatch);
        a.classList.toggle('is-active', isMatch);
      }
      if (isMatch) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    updateAllFavBadges();
  }

  function enhanceHomepage() {
    if (getCurrentPage() !== 'index.html') return;

    // Update live telemetry clock if present
    const clockEl = document.getElementById('telemetry-clock');
    if (clockEl) {
      const tick = () => {
        clockEl.textContent = new Date().toTimeString().split(' ')[0];
      };
      tick();
      setInterval(tick, 1000);
    }

    // Wire highlight artist cards on homepage to their real artist-detail pages
    const performers = (window.FESTIVAL_DATA && window.FESTIVAL_DATA.PERFORMERS) || [];
    if (performers.length) {
      const byName = new Map(performers.map(p => [p.name.toLowerCase(), p]));
      document.querySelectorAll('main article, main .card, main .data-panel, main .highlight-card').forEach(card => {
        if (card.querySelector('a[href*="artist-detail.html"]')) return;
        const h = card.querySelector('h2, h3, h4, .card-title, .panel-title');
        if (!h) return;
        const p = byName.get(h.textContent.trim().toLowerCase());
        if (!p) return;
        const a = document.createElement('a');
        a.href = `artist-detail.html?id=${p.id}&from=home#${p.id}`;
        a.className = 'fod-inline-artist-link';
        a.textContent = h.textContent;
        h.textContent = '';
        h.appendChild(a);
      });
    }

    // Add lightweight live quick-action strip (Saved Schedule + Rain Shelter Lunar Dome + Live Clock) at end of main
    const main = document.querySelector('main');
    if (main && !document.getElementById('fod-home-live-bar')) {
      const wrap = document.createElement('div');
      wrap.id = 'fod-home-live-bar';
      wrap.className = 'fod-home-live-wrap';
      const containerCls = document.querySelector('.eb-container') ? 'eb-container' : 'container';
      wrap.innerHTML = `
        <div class="${containerCls}">
          <div class="fod-home-live-bar">
            <div class="fod-home-live-info">
              <span class="fod-live-pill">Kutná Hora · 10-12 Jul 2026</span>
              <a href="my-schedule.html" class="fod-live-stat" id="fod-home-fav-text"></a>
            </div>
            <div class="fod-home-live-actions">
              <a href="program.html?stage=lunar&day=day1" class="fod-btn fod-btn-secondary" id="fod-home-lunar-btn"></a>
              <a href="search.html" class="fod-btn fod-btn-secondary" id="fod-home-search-btn"></a>
              <a href="my-schedule.html" class="fod-btn fod-btn-primary" id="fod-home-plan-btn"></a>
            </div>
          </div>
        </div>
      `;
      main.appendChild(wrap);
      const syncHomeBar = () => {
        const isCs = getLang() === 'cs';
        const favEl = document.getElementById('fod-home-fav-text');
        const lunarEl = document.getElementById('fod-home-lunar-btn');
        const searchEl = document.getElementById('fod-home-search-btn');
        const planEl = document.getElementById('fod-home-plan-btn');
        if (favEl) favEl.textContent = formatShowsCount(getFavorites().length, getLang());
        if (lunarEl) lunarEl.textContent = isCs ? 'Kryté pódium (Lunar Dome)' : 'Rain Shelter (Lunar Dome)';
        if (searchEl) searchEl.textContent = isCs ? 'Hledat na festivalu' : 'Search Festival';
        if (planEl) planEl.textContent = isCs ? 'Můj plán' : 'My Schedule';
      };
      syncHomeBar();
      window.addEventListener('languageChanged', syncHomeBar);
      window.addEventListener('favoritesUpdated', syncHomeBar);
    }
  }

  function setupGlobalKeyboard() {
    document.addEventListener('keydown', e => {
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) return;
      if ((e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') || document.getElementById('artist-search-input');
        if (searchInput) {
          searchInput.focus();
        } else {
          window.location.href = 'search.html';
        }
      }
    });
  }

  // =========================================================================
  // EXPORTS & INIT
  // =========================================================================
  window.FESTIVAL_CORE = {
    getDesignId,
    getNativeTheme,
    getCurrentPage,
    getLang,
    t,
    formatCzPlural,
    formatShowsCount,
    formatSetsCount,
    getFavorites,
    saveFavorites,
    isFavorite,
    toggleFavoriteById,
    clearFavorites,
    updateAllFavBadges,
    timeToMinutes,
    isOverlapping,
    normalizeStageKey,
    normalizeDayKey,
    normalizeStr,
    matchesGenreFilter,
    escapeHtml,
    showToast
  };

  function boot() {
    applyTheme(getFestivalTheme());
    installLanguageBridge();
    injectHeaderControls();
    enhanceHomepage();
    setupGlobalKeyboard();
    setTimeout(() => {
      bindLangButtonsClean();
      applyExtraTranslations(getLang());
    }, 0);
  }

  if (document.readyState === 'loading' || document.readyState === 'interactive') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.addEventListener('storage', e => {
    if (!e || e.key === THEME_KEY) applyTheme(getFestivalTheme());
    if (!e || e.key === FAV_KEY) updateAllFavBadges();
    if (!e || e.key === LANG_COMPAT_KEY) {
      const target = e.newValue === 'cs' ? 'cs' : 'en';
      if (target !== getLang() && typeof window.setFestivalLang === 'function') {
        window.setFestivalLang(target);
      }
    }
  });
})();
