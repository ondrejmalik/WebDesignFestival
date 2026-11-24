/* Design 4 Overrides: Mobile bottom dock sub-page active mapping */
(function () {
  'use strict';

  function syncDockActiveState() {
    var path = window.location.pathname || '';
    var page = (path.split('/').pop() || 'index.html').toLowerCase();
    if (!page || page === '') page = 'index.html';

    var dockTarget = page;
    if (page === 'artist-detail.html' || page === 'stages.html') dockTarget = 'artists.html';
    else if (page === 'my-schedule.html') dockTarget = 'program.html';
    else if (page === 'search.html') dockTarget = 'practical-info.html';

    document.querySelectorAll('.bottom-nav-dock a.bottom-dock-item').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0].toLowerCase();
      var match = href === dockTarget;
      a.classList.toggle('active', match);
      a.classList.toggle('is-active', match);
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    var headerTarget = page;
    if (page === 'artist-detail.html') headerTarget = 'artists.html';
    else if (page === 'search.html') headerTarget = 'practical-info.html';

    document.querySelectorAll('header nav a.eb-nav-link').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0].toLowerCase();
      var match = href === headerTarget;
      a.classList.toggle('active', match);
      a.classList.toggle('is-active', match);
      if (match) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(syncDockActiveState, 0);
  });
  window.addEventListener('languageChanged', function () {
    setTimeout(syncDockActiveState, 0);
  });
})();
