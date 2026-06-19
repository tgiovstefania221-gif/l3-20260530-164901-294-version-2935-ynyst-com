
(function () {
  const body = document.body;
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const searchInputs = document.querySelectorAll('[data-live-search]');
  const filters = document.querySelectorAll('[data-filter-input], [data-filter-select]');
  const backTop = document.querySelector('[data-backtop]');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  if (backTop) {
    const updateBackTop = () => {
      if (window.scrollY > 500) backTop.classList.add('visible');
      else backTop.classList.remove('visible');
    };
    window.addEventListener('scroll', updateBackTop, { passive: true });
    updateBackTop();
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function normalize(str) {
    return String(str || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    const root = scope || document;
    const items = root.querySelectorAll('[data-item]');
    if (!items.length) return;

    const keywordInput = root.querySelector('[data-filter-input="keyword"]') || root.querySelector('[data-live-search]');
    const typeSelect = root.querySelector('[data-filter-select="type"]');
    const regionSelect = root.querySelector('[data-filter-select="region"]');
    const yearSelect = root.querySelector('[data-filter-select="year"]');
    const genreSelect = root.querySelector('[data-filter-select="genre"]');
    const sortSelect = root.querySelector('[data-filter-select="sort"]');
    const countNode = root.querySelector('[data-result-count]');

    const keyword = normalize(keywordInput ? keywordInput.value : '');
    const typeVal = normalize(typeSelect ? typeSelect.value : 'all');
    const regionVal = normalize(regionSelect ? regionSelect.value : 'all');
    const yearVal = normalize(yearSelect ? yearSelect.value : 'all');
    const genreVal = normalize(genreSelect ? genreSelect.value : 'all');

    let visible = [];
    items.forEach(item => {
      const text = normalize(item.dataset.search || item.textContent);
      const type = normalize(item.dataset.type);
      const region = normalize(item.dataset.region);
      const year = normalize(item.dataset.year);
      const genre = normalize(item.dataset.genre);
      let ok = true;
      if (keyword && !text.includes(keyword)) ok = false;
      if (typeVal !== 'all' && type !== typeVal) ok = false;
      if (regionVal !== 'all' && region !== regionVal) ok = false;
      if (yearVal !== 'all' && year !== yearVal) ok = false;
      if (genreVal !== 'all' && !genre.includes(genreVal)) ok = false;
      item.classList.toggle('hide', !ok);
      if (ok) visible.push(item);
    });

    if (sortSelect) {
      const sort = normalize(sortSelect.value || 'newest');
      visible.sort((a, b) => {
        const ay = Number(a.dataset.year || 0);
        const by = Number(b.dataset.year || 0);
        const as = Number(a.dataset.score || 0);
        const bs = Number(b.dataset.score || 0);
        const at = normalize(a.dataset.title || '');
        const bt = normalize(b.dataset.title || '');
        if (sort === 'oldest') return ay - by || bt.localeCompare(at);
        if (sort === 'title') return at.localeCompare(bt);
        if (sort === 'score') return bs - as || by - ay;
        return by - ay || bs - as;
      });
      const wrap = root.querySelector('[data-sort-target]');
      if (wrap) visible.forEach(node => wrap.appendChild(node));
    }

    if (countNode) countNode.textContent = visible.length;
  }

  if (filters.length) {
    const root = filters[0].closest('[data-filter-scope]') || document;
    filters.forEach(el => {
      el.addEventListener('input', () => applyFilters(root));
      el.addEventListener('change', () => applyFilters(root));
    });
    applyFilters(root);
  }

  searchInputs.forEach(input => {
    input.addEventListener('input', () => {
      const q = input.value.trim();
      const target = input.getAttribute('data-live-search');
      if (!target) return;
      document.querySelectorAll(target).forEach(item => {
        const text = normalize(item.dataset.search || item.textContent);
        item.classList.toggle('hide', q && !text.includes(normalize(q)));
      });
    });
  });

  // Hero rail scroll buttons
  document.querySelectorAll('[data-rail]').forEach(railWrap => {
    const rail = railWrap.querySelector('.rail.scroller');
    const prev = railWrap.querySelector('[data-rail-prev]');
    const next = railWrap.querySelector('[data-rail-next]');
    if (!rail || !prev || !next) return;
    const step = () => Math.max(260, rail.clientWidth * 0.8);
    prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
  });

  // Detail player logic
  document.querySelectorAll('[data-player]').forEach(block => {
    const video = block.querySelector('video');
    const overlay = block.querySelector('[data-player-overlay]');
    const playBtn = block.querySelector('[data-player-play]');
    if (!video) return;

    const mp4 = video.dataset.mp4;
    const hlsUrl = video.dataset.hls;

    function attachSource() {
      try {
        if (window.Hls && hlsUrl && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            if (overlay) overlay.classList.remove('hidden');
          });
          video._hls = hls;
          return;
        }
      } catch (err) {}
      if (hlsUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
      } else if (mp4) {
        video.src = mp4;
      }
    }

    attachSource();

    function playNow() {
      if (overlay) overlay.classList.add('hidden');
      video.play().catch(() => {
        if (overlay) overlay.classList.remove('hidden');
      });
    }

    if (playBtn) playBtn.addEventListener('click', playNow);
    if (overlay) overlay.addEventListener('click', playNow);
    video.addEventListener('play', () => overlay && overlay.classList.add('hidden'));
    video.addEventListener('pause', () => overlay && overlay.classList.remove('hidden'));
    video.addEventListener('ended', () => overlay && overlay.classList.remove('hidden'));
  });

  // Smooth anchor focus
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
