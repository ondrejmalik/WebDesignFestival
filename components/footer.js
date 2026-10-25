// components/footer.js - Inline footer component without box
(function() {
    'use strict';

    function getFooterHTML(lang) {
        const isCs = lang === 'cs';
        const home = isCs ? '[ Úvod ]' : '[ Home ]';
        const program = '[ Program ]';
        const artists = isCs ? '[ Účinkující ]' : '[ Artists ]';
        const stages = isCs ? '[ Scény ]' : '[ Stages ]';
        const practical = isCs ? '[ Praktické info ]' : '[ Practical Info ]';
        const mySchedule = isCs ? '[ Můj program ]' : '[ My Schedule ]';

        return `
<hr>
<footer class="wf-footer-inline">
    <strong class="festival-brand">[ © 2026 Festival of Darkness 2 ]</strong>
    <a href="index.html" data-i18n="nav_home">${home}</a>
    <a href="program.html" data-i18n="nav_program">${program}</a>
    <a href="artists.html" data-i18n="nav_artists">${artists}</a>
    <a href="stages.html" data-i18n="nav_stages">${stages}</a>
    <a href="practical-info.html" data-i18n="nav_practical">${practical}</a>
    <a href="my-schedule.html" data-i18n="nav_myschedule">${mySchedule}</a>
    <span>[ info@festivalofdarkness.com ]</span>
</footer>
`;
    }

    function initFooter() {
        const placeholder = document.getElementById("footer-placeholder");
        const currentLang = (typeof window.getFestivalLang === 'function') 
            ? window.getFestivalLang() 
            : (localStorage.getItem('festival_language') || 'en');

        if (placeholder) {
            placeholder.innerHTML = getFooterHTML(currentLang);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFooter);
    } else {
        initFooter();
    }

    window.addEventListener('languageChanged', (e) => {
        initFooter();
    });
})();
