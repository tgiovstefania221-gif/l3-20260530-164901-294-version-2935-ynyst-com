(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var query = input ? input.value.trim() : '';
        var url = 'search.html';
        if (query) {
          url += '?q=' + encodeURIComponent(query);
        }
        window.location.href = url;
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var grid = qs('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var cards = qsa('[data-movie-card]', grid);
    var keyword = qs('[data-filter-keyword]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    var empty = qs('[data-empty-state]');
    function apply() {
      var k = keyword ? keyword.value.trim().toLowerCase() : '';
      var t = type ? type.value : '';
      var y = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-tags')).toLowerCase();
        var passKeyword = !k || text.indexOf(k) !== -1;
        var passType = !t || card.getAttribute('data-type') === t;
        var passYear = !y || card.getAttribute('data-year') === y;
        var pass = passKeyword && passType && passYear;
        card.style.display = pass ? '' : 'none';
        if (pass) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }
    [keyword, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function initPlayers() {
    qsa('.movie-video').forEach(function (video) {
      var shell = video.closest('.player-shell');
      var overlay = shell ? qs('.play-overlay', shell) : null;
      var source = video.getAttribute('data-hls');
      var ready = false;
      function attach() {
        if (ready || !source) {
          return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video.hlsEngine = hls;
        } else {
          video.src = source;
        }
      }
      function play() {
        attach();
        video.controls = true;
        if (overlay) {
          overlay.classList.add('hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      attach();
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('hidden');
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card" data-movie-card data-title="' + escapeHtml(movie.title) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml((movie.tags || []).join(' ')) + '" data-type="' + escapeHtml(movie.type) + '" data-year="' + escapeHtml(movie.year) + '">',
      '  <a href="' + escapeHtml(movie.url) + '">',
      '    <div class="card-cover">',
      '      <span class="card-badge">' + escapeHtml(movie.rating) + '</span>',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    </div>',
      '    <div class="card-body">',
      '      <h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
      '      <p class="card-desc">' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var root = qs('[data-search-results]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var input = qs('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function render() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var data = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.genre, movie.type, movie.region, (movie.tags || []).join(' '), movie.one_line].join(' ').toLowerCase();
        return !query || text.indexOf(query) !== -1;
      }).slice(0, 160);
      root.innerHTML = data.map(cardTemplate).join('');
      var label = qs('[data-search-count]');
      if (label) {
        label.textContent = String(data.length);
      }
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
    initSearchPage();
  });
})();
