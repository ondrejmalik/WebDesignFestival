// shared/js/festival-core.js - Unified theme, language, favorites, nav, and utilities for all 11 designs
(function () {
  'use strict';

  const FAV_KEY = 'festival_favorites';
  const CART_KEY = 'festival_cart';
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
      'stages.html', 'tickets.html', 'practical-info.html', 'my-schedule.html', 'search.html'
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
    'artists.html': { en: 'Artists & Stages', cs: 'Účinkující & Pódia' },
    'stages.html': { en: 'Artists & Stages', cs: 'Účinkující & Pódia' },
    'tickets.html': { en: 'Tickets', cs: 'Vstupenky' },
    'practical-info.html': { en: 'Info & Search', cs: 'Info & Hledání' },
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

    document.querySelectorAll('.skip-link').forEach(el => {
      const existingKey = el.getAttribute('data-i18n');
      if (existingKey && Object.prototype.hasOwnProperty.call(dict, existingKey)) return;
      el.textContent = isCs ? 'Přeskočit na hlavní obsah' : 'Skip to main content';
    });

    // Translate header/footer/rail/dock nav links that do not already have a valid dict key
    document.querySelectorAll('header nav a, footer a, .side-rail nav a, .bottom-nav-dock a').forEach(a => {
      if (a.classList.contains('brand') || a.classList.contains('eb-logo') || a.classList.contains('rail-brand')) return;
      const existingKey = a.getAttribute('data-i18n');
      if (existingKey && Object.prototype.hasOwnProperty.call(dict, existingKey)) return;
      const dockLabel = a.querySelector('.dock-label');
      const dockKey = dockLabel && dockLabel.getAttribute('data-i18n');
      if (dockKey && Object.prototype.hasOwnProperty.call(dict, dockKey)) return;
      if (a.closest('footer')) {
        const childI18n = a.querySelector('[data-i18n]');
        const childKey = childI18n && childI18n.getAttribute('data-i18n');
        if (childKey && Object.prototype.hasOwnProperty.call(dict, childKey)) return;
      }
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!NAV_LABELS[href]) return;
      const favBadge = a.querySelector('.nav-badge-count:not(.fod-cart-badge)');
      const cartBadge = a.querySelector('.fod-cart-badge');
      const labelSpan = dockLabel || a.querySelector('span:not(.nav-badge-count):not(.fod-cart-badge):not(.dock-icon)');
      const labelText = isCs ? NAV_LABELS[href].cs : NAV_LABELS[href].en;
      if (labelSpan) {
        if (!favBadge && !cartBadge) {
          labelSpan.textContent = labelText;
        } else {
          // Replace leading text node inside labelSpan cleanly while preserving badge child
          let replaced = false;
          for (let i = 0; i < labelSpan.childNodes.length; i++) {
            if (labelSpan.childNodes[i].nodeType === 3) {
              labelSpan.childNodes[i].nodeValue = labelText + ' ';
              replaced = true;
              break;
            }
          }
          if (!replaced) {
            labelSpan.insertBefore(document.createTextNode(labelText + ' '), labelSpan.firstChild);
          }
        }
      } else {
        // Preserve badge nodes if present directly inside anchor
        a.textContent = labelText;
        if (favBadge) {
          a.appendChild(document.createTextNode(' '));
          a.appendChild(favBadge);
        }
        if (cartBadge) {
          a.appendChild(document.createTextNode(' '));
          a.appendChild(cartBadge);
        }
      }
    });

    // Update all language buttons consistently
    document.querySelectorAll('#lang-toggle, .lang-btn, .lang-switch, .lang-toggle, .eb-lang-btn, .mobile-lang-btn').forEach(btn => {
      const optPills = btn.querySelectorAll('[data-lang-opt], [data-lang-option]');
      if (optPills.length > 0) {
        optPills.forEach(p => {
          const val = (p.getAttribute('data-lang-opt') || p.getAttribute('data-lang-option') || '').toLowerCase();
          p.classList.toggle('is-active', val === lang);
          p.classList.toggle('active', val === lang);
        });
      } else {
        const textTarget = btn.querySelector('[data-i18n="lang_code"], [data-i18n="lang_switch"], [data-i18n="nav.langToggle"]') || btn;
        if (textTarget === btn && btn.querySelector('.lang-indicator')) {
          const spans = btn.querySelectorAll('span:not(.lang-indicator)');
          if (spans.length) spans[0].textContent = isCs ? 'EN' : 'CZ';
        } else if (btn.children.length === 0 || textTarget !== btn) {
          textTarget.textContent = isCs ? 'EN' : 'CZ';
        } else {
          btn.textContent = isCs ? 'EN' : 'CZ';
        }
      }
      const visibleText = (btn.innerText || btn.textContent || '').replace(/\s+/g, ' ').trim();
      let a11yLabel;
      if (optPills.length > 0 || visibleText.includes('/')) {
        a11yLabel = `${visibleText || 'CZ / EN'} - ${isCs ? 'Přepnout jazyk' : 'Switch language'}`;
      } else if (visibleText.toUpperCase() === 'EN') {
        a11yLabel = 'EN - Switch to English';
      } else if (visibleText.toUpperCase() === 'CZ') {
        a11yLabel = 'CZ - Přepnout do češtiny';
      } else {
        a11yLabel = `${visibleText ? visibleText + ' - ' : ''}${isCs ? 'Switch to English' : 'Přepnout do češtiny'}`;
      }
      btn.setAttribute('aria-label', a11yLabel);
      btn.setAttribute('title', a11yLabel);
    });

    updateThemeButtons(getFestivalTheme());
    updateMobileScheduleButtons(getFavorites().length, lang);
  }

  function updateMobileScheduleButtons(count, langOverride) {
    const isCs = (langOverride || getLang()) === 'cs';
    const c = typeof count === 'number' ? count : getFavorites().length;
    const label = isCs
      ? (c > 0 ? `Můj plán (${c})` : 'Můj plán')
      : (c > 0 ? `My Schedule (${c})` : 'My Schedule');
    document.querySelectorAll('.fod-mobile-schedule-btn').forEach(btn => {
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    });
  }

  function bindLangButtonsClean() {
    document.querySelectorAll('#lang-toggle, .lang-btn, .lang-switch, .lang-toggle, .eb-lang-btn, .mobile-lang-btn').forEach(btn => {
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

  function saveFavorites(items, meta) {
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
      window.dispatchEvent(new CustomEvent('favoritesUpdated', {
        detail: Object.assign({ count: clean.length }, meta || {})
      }));
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
    const conflicts = added ? getCollisionsForItem(id, favs) : [];
    saveFavorites(favs, { lastToggledId: id, added, conflicts });
    const cat = getCatalogMap()[id];
    const name = cat ? cat.name : id;

    if (added && conflicts.length > 0) {
      const first = conflicts[0];
      const firstArtist = first.artist || first.name || first.id;
      const extra = conflicts.length - 1;
      const msg = extra === 0
        ? t(
            `Time conflict: ${name} overlaps with ${firstArtist} (${first.time})`,
            `Časová kolize: ${name} se překrývá s ${firstArtist} (${first.time})`
          )
        : t(
            `Time conflict: ${name} overlaps with ${firstArtist} (${first.time}) and ${extra} more`,
            `Časová kolize: ${name} se překrývá s ${firstArtist} (${first.time}) a ${formatCzPlural(extra, 'dalším setem', 'dalšími sety', 'dalšími sety')}`
          );
      showToast(msg, {
        variant: 'conflict',
        duration: 6000,
        action: getCurrentPage() === 'my-schedule.html'
          ? null
          : { label: t('My Schedule', 'Můj plán'), href: 'my-schedule.html' }
      });
    } else {
      showToast(added
        ? t(`Added ${name} to My Schedule`, `${name} přidáno do Mého plánu`)
        : t(`Removed ${name} from My Schedule`, `${name} odebráno z Mého plánu`));
    }
    return added;
  }

  function clearFavorites() {
    saveFavorites([]);
  }

  function updateAllFavBadges(countOverride) {
    const count = typeof countOverride === 'number' ? countOverride : getFavorites().length;
    const badgeText = count > 99 ? '99+' : String(count);
    document.querySelectorAll('.nav-badge-count, .fav-count-badge, #fav-count').forEach(el => {
      el.textContent = el.classList.contains('nav-badge-count') ? badgeText : String(count);
      if (el.classList.contains('nav-badge-count')) {
        el.classList.toggle('is-hidden', count === 0);
      }
    });
    updateMobileScheduleButtons(count);
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
  // TICKET CART PERSISTENCE (localStorage 'festival_cart') & BADGE SYNC
  // =========================================================================
  function sanitizeCartItems(items) {
    if (!Array.isArray(items)) return [];
    const merged = new Map();
    items.forEach(raw => {
      if (!raw || !raw.id) return;
      const id = String(raw.id).trim();
      const qty = Math.max(0, parseInt(raw.qty, 10) || 0);
      if (!id || qty <= 0) return;
      const prev = merged.get(id);
      merged.set(id, {
        id,
        qty: prev ? prev.qty + qty : qty,
        priceCzk: Math.max(0, Number(raw.priceCzk) || (prev ? prev.priceCzk : 0)),
        category: String(raw.category || (prev ? prev.category : '')),
        nameEn: String(raw.nameEn || (prev ? prev.nameEn : id)),
        nameCs: String(raw.nameCs || raw.nameEn || (prev ? prev.nameCs : id))
      });
    });
    return Array.from(merged.values());
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      return sanitizeCartItems(JSON.parse(raw));
    } catch (e) {
      return [];
    }
  }

  function setCart(items) {
    const clean = sanitizeCartItems(items);
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(clean));
    } catch (e) {}
    updateAllCartBadges();
    window.dispatchEvent(new CustomEvent('festivalCartChanged', { detail: { items: clean } }));
    return clean;
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + (parseInt(item.qty, 10) || 0), 0);
  }

  function updateAllCartBadges() {
    const count = getCartCount();
    const display = count > 99 ? '99+' : (count > 0 ? String(count) : '');
    document.querySelectorAll('.fod-cart-badge').forEach(el => {
      el.textContent = display;
      el.setAttribute('data-count', String(count));
      el.classList.toggle('is-hidden', count === 0);
    });
  }

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

  function getStartMinutes(item) {
    if (!item || !item.time) return 0;
    const startStr = String(item.time).split(/[–-]/)[0];
    return timeToMinutes(startStr);
  }

  function getCollisionsForItem(itemOrId, favoritesList) {
    const list = Array.isArray(favoritesList) ? favoritesList : getFavorites();
    const target = typeof itemOrId === 'string'
      ? (list.find(f => f && f.id === itemOrId) || enrichFavorite(itemOrId))
      : enrichFavorite(itemOrId);
    if (!target || !target.id || !target.time) return [];

    const targetDay = normalizeDayKey(target);
    const targetStage = normalizeStageKey(target.stage);
    const seen = new Set();
    const conflicts = [];

    list.forEach(raw => {
      const other = enrichFavorite(raw);
      if (!other || !other.id || other.id === target.id || seen.has(other.id)) return;
      if (normalizeDayKey(other) !== targetDay) return;
      if (normalizeStageKey(other.stage) === targetStage) return;
      if (!isOverlapping(target.time, other.time)) return;
      seen.add(other.id);
      conflicts.push(other);
    });

    conflicts.sort((a, b) => getStartMinutes(a) - getStartMinutes(b));
    return conflicts;
  }

  function computeScheduleCollisions(favoritesList) {
    const rawList = Array.isArray(favoritesList) ? favoritesList : getFavorites();
    const seenIds = new Set();
    const items = [];
    rawList.forEach(raw => {
      const enr = enrichFavorite(raw);
      if (enr && enr.id && !seenIds.has(enr.id)) {
        seenIds.add(enr.id);
        items.push(enr);
      }
    });

    const pairs = [];
    const byIdSets = new Map();

    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      if (!a.time) continue;
      const dayA = normalizeDayKey(a);
      const stageA = normalizeStageKey(a.stage);

      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        if (!b.time || a.id === b.id) continue;
        if (normalizeDayKey(b) !== dayA) continue;
        if (normalizeStageKey(b.stage) === stageA) continue;
        if (!isOverlapping(a.time, b.time)) continue;

        const ordered = getStartMinutes(a) <= getStartMinutes(b) ? [a, b] : [b, a];
        pairs.push({ dayKey: dayA, a: ordered[0], b: ordered[1] });

        if (!byIdSets.has(a.id)) byIdSets.set(a.id, new Map());
        if (!byIdSets.has(b.id)) byIdSets.set(b.id, new Map());
        byIdSets.get(a.id).set(b.id, b);
        byIdSets.get(b.id).set(a.id, a);
      }
    }

    pairs.sort((p1, p2) => {
      if (p1.dayKey !== p2.dayKey) return p1.dayKey.localeCompare(p2.dayKey);
      const diffA = getStartMinutes(p1.a) - getStartMinutes(p2.a);
      if (diffA !== 0) return diffA;
      return getStartMinutes(p1.b) - getStartMinutes(p2.b);
    });

    const byId = new Map();
    byIdSets.forEach((map, id) => {
      const sorted = Array.from(map.values()).sort((x, y) => getStartMinutes(x) - getStartMinutes(y));
      byId.set(id, sorted);
    });

    return {
      total: pairs.length,
      pairs,
      byId
    };
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
  let toastDuration = 2600;
  let toastPaused = false;

  function hideToast() {
    clearTimeout(toastTimer);
    toastTimer = null;
    toastPaused = false;
    const el = document.getElementById('fod-toast');
    if (el) el.classList.remove('is-visible');
  }

  function scheduleToastHide(duration) {
    clearTimeout(toastTimer);
    if (toastPaused) return;
    toastTimer = setTimeout(hideToast, duration);
  }

  function showToast(msg, opts) {
    if (!document.body) return;
    const options = opts && typeof opts === 'object' ? opts : {};
    const isConflict = options.variant === 'conflict';
    const duration = typeof options.duration === 'number' && options.duration > 0
      ? options.duration
      : (isConflict ? 6000 : 2600);
    const action = options.action && options.action.label && options.action.href ? options.action : null;

    let el = document.getElementById('fod-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fod-toast';
      el.className = 'fod-toast';
      el.addEventListener('mouseenter', () => {
        toastPaused = true;
        clearTimeout(toastTimer);
      });
      el.addEventListener('focusin', () => {
        toastPaused = true;
        clearTimeout(toastTimer);
      });
      el.addEventListener('mouseleave', () => {
        toastPaused = false;
        if (el.classList.contains('is-visible')) {
          scheduleToastHide(toastDuration);
        }
      });
      el.addEventListener('focusout', e => {
        if (!el.contains(e.relatedTarget)) {
          toastPaused = false;
          if (el.classList.contains('is-visible')) {
            scheduleToastHide(toastDuration);
          }
        }
      });
      el.addEventListener('click', e => {
        if (e.target && e.target.closest && e.target.closest('.fod-toast-close')) {
          hideToast();
        }
      });
      document.body.appendChild(el);
    }

    el.classList.toggle('is-conflict', isConflict);
    el.setAttribute('role', isConflict ? 'alert' : 'status');
    el.setAttribute('aria-live', isConflict ? 'assertive' : 'polite');

    if (isConflict) {
      const iconHtml = '<svg class="fod-toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
      const msgHtml = `<span class="fod-toast-msg">${escapeHtml(msg)}</span>`;
      const actionHtml = action
        ? `<a class="fod-toast-action" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>`
        : '';
      const closeHtml = `<button type="button" class="fod-toast-close" aria-label="${escapeHtml(t('Dismiss notification', 'Zavřít upozornění'))}">&times;</button>`;
      el.innerHTML = `<span class="fod-toast-body">${iconHtml}${msgHtml}</span><span class="fod-toast-actions">${actionHtml}${closeHtml}</span>`;
    } else {
      el.textContent = msg;
    }

    toastDuration = duration;
    toastPaused = false;
    el.classList.add('is-visible');
    scheduleToastHide(duration);
  }

  // =========================================================================
  // HEADER & NAV ENHANCEMENTS (Theme button, Nav Badges, Active States)
  // =========================================================================
  function injectHeaderControls() {
    // 1. Ensure Theme Switch button exists next to every language toggle container (including mobile topbar in 11-zzz)
    const langBtns = document.querySelectorAll('#lang-toggle, .lang-btn, .lang-switch, .lang-toggle, .eb-lang-btn, .mobile-lang-btn');
    langBtns.forEach((langBtn, idx) => {
      const parent = langBtn.parentElement;
      if (!parent) return;
      if (!parent.querySelector('.theme-switch-btn')) {
        const themeBtn = document.createElement('button');
        themeBtn.type = 'button';
        if (idx === 0 && !document.getElementById('theme-switch-btn')) {
          themeBtn.id = 'theme-switch-btn';
        }
        themeBtn.className = 'fod-theme-btn theme-switch-btn' + (langBtn.classList.contains('mobile-lang-btn') ? ' fod-mobile-theme-btn' : '');
        themeBtn.innerHTML = '<span class="theme-icon" aria-hidden="true"></span><span class="theme-label"></span>';
        themeBtn.dataset.fodThemeBound = '1';
        themeBtn.addEventListener('click', toggleFestivalTheme);
        parent.insertBefore(themeBtn, langBtn);
      }
    });
    document.querySelectorAll('.theme-switch-btn').forEach(btn => {
      if (!btn.dataset.fodThemeBound) {
        btn.dataset.fodThemeBound = '1';
        btn.addEventListener('click', toggleFestivalTheme);
      }
    });
    updateThemeButtons(getFestivalTheme());

    // 1b. Mobile/tablet top-right My Schedule shortcut in .eb-header-actions
    document.querySelectorAll('.eb-header-actions').forEach(actions => {
      if (!actions.querySelector('.fod-mobile-schedule-btn')) {
        const schedLink = document.createElement('a');
        schedLink.href = 'my-schedule.html';
        schedLink.className = 'fod-mobile-schedule-btn';
        schedLink.innerHTML =
          '<svg class="fod-mobile-schedule-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
          '<span class="nav-badge-count is-hidden">0</span>';
        const isOnSchedule = getCurrentPage() === 'my-schedule.html';
        if (isOnSchedule) {
          schedLink.classList.add('is-active');
          schedLink.setAttribute('aria-current', 'page');
        }
        actions.insertBefore(schedLink, actions.firstChild);
      }
    });

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

    // 2b. Ensure Tickets nav links carry highlight CTA class and live cart badge
    document.querySelectorAll('header nav a[href="tickets.html"], .side-rail nav a[href="tickets.html"], .bottom-nav-dock a[href="tickets.html"]').forEach(a => {
      if (a.closest('.bottom-nav-dock')) {
        a.classList.add('bottom-dock-tickets');
      } else if (a.closest('.side-rail')) {
        a.classList.add('rail-link-tickets');
      } else {
        a.classList.add('nav-link-tickets');
      }
      if (!a.querySelector('.fod-cart-badge')) {
        const badge = document.createElement('span');
        badge.className = 'fod-cart-badge is-hidden';
        badge.setAttribute('data-count', '0');
        badge.setAttribute('aria-hidden', 'true');
        a.appendChild(badge);
      }
    });

    // 3. Highlight active page in header nav & bottom dock
    const current = getCurrentPage();
    document.querySelectorAll('header nav a, .side-rail nav a, .bottom-nav-dock a').forEach(a => {
      const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
      if (!href || href.startsWith('#')) return;
      const isMatch = href === current || ((current === 'artist-detail.html' || current === 'stages.html') && href === 'artists.html');
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
    updateAllCartBadges();
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

    // Wire clickable stage table rows (e.g. 02-clutterbench stages table)
    document.querySelectorAll('tr[data-href]').forEach(row => {
      if (row.dataset.hrefWired) return;
      row.dataset.hrefWired = '1';
      row.addEventListener('click', e => {
        if (e.target && e.target.closest('a, button')) return;
        const href = row.getAttribute('data-href');
        if (href) window.location.href = href;
      });
    });

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
  // SUNDER C60 HE ANIMATION ENGINE (Scroll reveals + Smart Sticky Header)
  // =========================================================================
  let sunderObserver = null;

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function applyScrollTriggerTargets(root) {
    const scope = root && root.querySelectorAll ? root : document;

    // Fade-in hero media
    scope.querySelectorAll('.hero-stage-media, .hero img, .hero-banner img').forEach(el => {
      if (!el.classList.contains('scroll-trigger')) {
        el.classList.add('scroll-trigger', 'animate--fade-in');
      }
    });

    // Slide-in sections, panels, cards, and footer blocks
    const slideSelectors = [
      'main > section:not(.eb-hero-banner):not(.eb-program-hero):not(.eb-main-layout)',
      'main > article',
      '.eb-organizer-bar',
      '.eb-section-block',
      '.eb-stage-card',
      '.eb-ticket-box',
      '.fod-panel',
      '.fod-info-block',
      '.fod-card',
      '.fod-stage-card',
      '.fod-plan-card',
      '.fod-footer-top',
      '.fod-footer-col',
      '.fod-footer-bottom',
      '.eb-footer-grid',
      '.eb-footer-brand-col',
      '.eb-footer-col',
      '.eb-footer-colophon'
    ].join(', ');

    scope.querySelectorAll(slideSelectors).forEach(el => {
      if (!el.classList.contains('scroll-trigger')) {
        el.classList.add('scroll-trigger', 'animate--slide-in');
      }
    });

    // Cascade stagger (capped per batch) for grid/featured/footer children
    scope.querySelectorAll('.fod-cards-grid > *, .eb-featured-list > *, .eb-stages-grid > *, .fod-footer-top > *, .eb-footer-grid > *, .cards-grid > *, .grid > *').forEach(el => {
      if (!el.classList.contains('scroll-trigger')) {
        el.classList.add('scroll-trigger', 'animate--slide-in');
      }
      if (!el.hasAttribute('data-cascade')) {
        el.setAttribute('data-cascade', '');
      }
    });

    // Subtle scroll-trigger animations for program timetable sections and cards
    scope.querySelectorAll('.fod-day-section, .fod-empty-card').forEach(el => {
      if (!el.classList.contains('scroll-trigger')) {
        el.classList.add('scroll-trigger', 'animate--slide-in', 'animate--subtle');
      }
    });

    scope.querySelectorAll('.fod-timetable-card, .fod-slot-row').forEach(el => {
      if (!el.classList.contains('scroll-trigger')) {
        el.classList.add('scroll-trigger', 'animate--slide-in', 'animate--subtle');
      }
      if (!el.hasAttribute('data-cascade')) {
        el.setAttribute('data-cascade', '');
      }
    });
  }

  function refreshScrollTriggers(root, isDynamicMutation) {
    applyScrollTriggerTargets(root);
    const scope = root && root.querySelectorAll ? root : document;
    const elements = scope.querySelectorAll('.scroll-trigger');
    if (!elements.length) return;

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      elements.forEach(el => {
        el.classList.remove('scroll-trigger--offscreen');
        el.classList.add('scroll-trigger--cancel');
      });
      return;
    }

    if (!sunderObserver) {
      sunderObserver = new IntersectionObserver(
        (entries, observer) => {
          let cascadeIndex = 0;
          entries.forEach(entry => {
            const target = entry.target;
            if (entry.isIntersecting) {
              if (target.hasAttribute('data-cascade')) {
                target.style.setProperty('--animation-order', String(Math.min(cascadeIndex, 5)));
                cascadeIndex += 1;
              }
              target.classList.remove('scroll-trigger--offscreen');
              observer.unobserve(target);
              setTimeout(() => {
                target.classList.add('sunder-settled');
                target.style.removeProperty('--animation-order');
              }, 800);
            }
          });
        },
        { rootMargin: '0px 0px -24px 0px', threshold: 0.02 }
      );
    }

    const viewportCutoff = (window.innerHeight || 900) * 0.96;

    elements.forEach(el => {
      if (el.dataset.sunderObserved === '1') return;
      el.dataset.sunderObserved = '1';

      // Never hide elements already in/above the viewport (including dynamic updates)
      // so deferred JS and live DOM updates never cause a visible -> hidden -> animate flash.
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportCutoff) {
        el.classList.remove('scroll-trigger--offscreen');
        el.classList.add('scroll-trigger--cancel');
        return;
      }

      el.classList.add('scroll-trigger--offscreen');
      sunderObserver.observe(el);
    });
  }

  function setupStickyRevealHeader() {
    const header = document.querySelector('header.site-header, header.eb-header, header.topbar');
    if (!header || prefersReducedMotion()) return;

    header.classList.add('sunder-header-sticky', 'sunder-header-animate');
    let lastScrollY = Math.max(0, window.scrollY || 0);
    let ticking = false;

    const updateHeader = () => {
      ticking = false;
      const rect = header.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;

      // Keep mobile/tablet header permanently visible to avoid overscroll bounce flicker
      if (window.innerWidth <= 960) {
        header.classList.remove('sunder-header-hidden');
        lastScrollY = Math.max(0, window.scrollY || 0);
        return;
      }

      const menuOpen = Boolean(
        header.classList.contains('menu-open') ||
        header.classList.contains('is-open') ||
        header.querySelector('[aria-expanded="true"], details[open]')
      );

      const currentScrollY = Math.max(0, window.scrollY || 0);
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const threshold = Math.max(rect.height, 106);

      if (menuOpen || currentScrollY <= threshold) {
        header.classList.remove('sunder-header-hidden');
      } else if (currentScrollY >= maxScroll - 4) {
        // Ignore bottom overscroll bounce
      } else if (currentScrollY > lastScrollY + 16) {
        header.classList.add('sunder-header-hidden');
      } else if (currentScrollY < lastScrollY - 16) {
        header.classList.remove('sunder-header-hidden');
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateHeader);
        }
      },
      { passive: true }
    );
  }

  function initSunderAnimations() {
    refreshScrollTriggers(document);
    setupStickyRevealHeader();

    const mainEl = document.querySelector('main');
    if (mainEl && typeof MutationObserver !== 'undefined') {
      const mo = new MutationObserver(() => {
        refreshScrollTriggers(mainEl, true);
      });
      mo.observe(mainEl, { childList: true, subtree: true });
    }
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
    getCart,
    setCart,
    getCartCount,
    updateAllCartBadges,
    timeToMinutes,
    isOverlapping,
    normalizeStageKey,
    normalizeDayKey,
    getCollisionsForItem,
    computeScheduleCollisions,
    normalizeStr,
    matchesGenreFilter,
    escapeHtml,
    showToast,
    refreshScrollTriggers
  };

  function setupFooterActions() {
    document.addEventListener('click', e => {
      const topBtn = e.target && e.target.closest ? e.target.closest('[data-footer-top]') : null;
      if (topBtn) {
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        return;
      }

      const socialBtn = e.target && e.target.closest ? e.target.closest('.fod-social-btn[data-social-platform]') : null;
      if (socialBtn) {
        const platform = socialBtn.getAttribute('data-social-platform') || 'Social';
        showToast(t(`${platform}: social channel coming soon`, `${platform}: sociální kanál připravujeme`));
      }
    });
  }

  function boot() {
    const mainEl = document.querySelector('main');
    if (mainEl && !mainEl.id) mainEl.id = 'main-content';
    applyTheme(getFestivalTheme());
    installLanguageBridge();
    injectHeaderControls();
    enhanceHomepage();
    setupGlobalKeyboard();
    setupFooterActions();
    initSunderAnimations();
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

  window.addEventListener('festivalCartChanged', () => updateAllCartBadges());

  window.addEventListener('storage', e => {
    if (!e || e.key === THEME_KEY) applyTheme(getFestivalTheme());
    if (!e || e.key === FAV_KEY) updateAllFavBadges();
    if (!e || e.key === CART_KEY) updateAllCartBadges();
    if (!e || e.key === LANG_COMPAT_KEY) {
      const target = e.newValue === 'cs' ? 'cs' : 'en';
      if (target !== getLang() && typeof window.setFestivalLang === 'function') {
        window.setFestivalLang(target);
      }
    }
  });
})();
