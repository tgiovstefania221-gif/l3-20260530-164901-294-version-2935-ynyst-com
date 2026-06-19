(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let index = 0;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
      });
    });

    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  const grid = document.querySelector('[data-card-grid]');
  const pageSearch = document.querySelector('[data-page-search]');
  const pageSort = document.querySelector('[data-page-sort]');
  const emptyState = document.querySelector('[data-empty-state]');

  if (grid) {
    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    const applyFilters = function () {
      const keyword = pageSearch ? pageSearch.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.dataset.search || '').toLowerCase();
        const matched = !keyword || text.includes(keyword);
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visible === 0);
      }
    };

    const applySort = function () {
      if (!pageSort) {
        return;
      }

      const mode = pageSort.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (mode === 'rating') {
          return Number(b.dataset.rating) - Number(a.dataset.rating);
        }

        if (mode === 'views') {
          return Number(b.dataset.views) - Number(a.dataset.views);
        }

        if (mode === 'date') {
          return String(b.dataset.date).localeCompare(String(a.dataset.date));
        }

        return 0;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      applyFilters();
    };

    if (pageSearch) {
      pageSearch.addEventListener('input', applyFilters);
    }

    if (pageSort) {
      pageSort.addEventListener('change', applySort);
    }
  }

  const playerConfig = document.getElementById('playback-config');
  const video = document.getElementById('videoPlayer');
  const playTrigger = document.querySelector('[data-play-trigger]');

  if (playerConfig && video && playTrigger) {
    let attached = false;
    let hlsInstance = null;

    const getUrl = function () {
      try {
        const parsed = JSON.parse(playerConfig.textContent || '{}');
        return parsed.url || '';
      } catch (error) {
        return '';
      }
    };

    const attachStream = function () {
      if (attached) {
        return;
      }

      const url = getUrl();

      if (!url) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        attached = true;
        return;
      }

      video.src = url;
      attached = true;
    };

    const startPlay = function () {
      attachStream();
      playTrigger.classList.add('is-hidden');
      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          playTrigger.classList.remove('is-hidden');
        });
      }
    };

    playTrigger.addEventListener('click', startPlay);

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    video.addEventListener('play', function () {
      playTrigger.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        playTrigger.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  const siteSearch = document.querySelector('[data-site-search]');
  const siteSort = document.querySelector('[data-site-sort]');
  const siteResults = document.querySelector('[data-search-results]');
  const siteEmpty = document.querySelector('[data-search-empty]');

  if (siteSearch && siteResults && Array.isArray(window.movieSearchIndex)) {
    const render = function () {
      const keyword = siteSearch.value.trim().toLowerCase();
      const mode = siteSort ? siteSort.value : 'match';
      let list = window.movieSearchIndex.slice();

      if (keyword) {
        list = list.filter(function (item) {
          return item.text.toLowerCase().includes(keyword);
        });
      } else {
        list = list.slice(0, 24);
      }

      if (mode === 'rating') {
        list.sort(function (a, b) {
          return Number(b.rating) - Number(a.rating);
        });
      }

      if (mode === 'views') {
        list.sort(function (a, b) {
          return Number(b.views) - Number(a.views);
        });
      }

      if (mode === 'date') {
        list.sort(function (a, b) {
          return String(b.date).localeCompare(String(a.date));
        });
      }

      list = list.slice(0, 96);

      siteResults.innerHTML = list.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="movie-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
          '<div class="poster poster-video" style="--poster: url(\'' + item.cover + '\');">',
          '<span class="quality-badge">HD</span>',
          '<span class="play-hover">▶</span>',
          '</div>',
          '<div class="movie-info">',
          '<h3>' + escapeHtml(item.title) + '</h3>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '<div class="meta-row">',
          '<span>' + escapeHtml(item.year) + '</span>',
          '<span>' + escapeHtml(item.region) + '</span>',
          '<span>' + escapeHtml(item.duration) + '</span>',
          '</div>',
          '<div class="card-bottom">',
          '<span class="category-pill">' + escapeHtml(item.category) + '</span>',
          '<span class="rating">★ ' + escapeHtml(item.rating) + '</span>',
          '</div>',
          '</div>',
          '</a>',
          '</article>'
        ].join('');
      }).join('');

      if (siteEmpty) {
        siteEmpty.classList.toggle('visible', list.length === 0);
        if (keyword && list.length === 0) {
          siteEmpty.textContent = '没有找到匹配的影片';
        } else if (!keyword) {
          siteEmpty.textContent = '输入关键词开始搜索';
        }
      }
    };

    siteSearch.addEventListener('input', render);

    if (siteSort) {
      siteSort.addEventListener('change', render);
    }

    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
