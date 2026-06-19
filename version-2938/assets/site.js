(function () {
  const index = window.SITE_INDEX || [];

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function normalize(text) {
    return String(text || '').toLowerCase();
  }

  function renderSearch() {
    const root = document.querySelector('[data-search-results]');
    if (!root) return;

    const input = document.querySelector('[data-search-input]');
    const typeSel = document.querySelector('[data-search-type]');
    const regionSel = document.querySelector('[data-search-region]');
    const yearSel = document.querySelector('[data-search-year]');

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';
    if (input) input.value = query;

    function applyFilters() {
      const q = normalize(input ? input.value : query);
      const typeVal = typeSel ? typeSel.value : '';
      const regionVal = regionSel ? regionSel.value : '';
      const yearVal = yearSel ? yearSel.value : '';

      const rows = index.filter(item => {
        const text = normalize(item.text || '');
        const okQuery = !q || text.includes(q);
        const okType = !typeVal || item.type === typeVal;
        const okRegion = !regionVal || item.region === regionVal;
        const okYear = !yearVal || String(item.year) === yearVal;
        return okQuery && okType && okRegion && okYear;
      }).slice(0, 120);

      root.innerHTML = rows.length ? rows.map((item, idx) => `
        <article class="search-card">
          <h3><a href="${item.url}">${item.title}</a></h3>
          <div class="film-meta">
            <span>#${item.id}</span>
            <span>${item.year}</span>
            <span>${item.region}</span>
            <span>${item.type}</span>
            <span>${item.genre}</span>
          </div>
          <p class="snippet">${(item.text || '').slice(0, 180)}${(item.text || '').length > 180 ? '…' : ''}</p>
        </article>
      `).join('') : '<div class="empty-state">未找到匹配内容，试试更短的关键词或切换筛选条件。</div>';
    }

    [input, typeSel, regionSel, yearSel].forEach(el => {
      if (!el) return;
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });

    applyFilters();
  }

  function renderHeroSwitch() {
    const hero = document.querySelector('[data-hero-rotator]');
    if (!hero) return;
    const items = JSON.parse(hero.dataset.items || '[]');
    if (!items.length) return;
    let idx = 0;
    const title = hero.querySelector('[data-hero-title]');
    const desc = hero.querySelector('[data-hero-desc]');
    const link = hero.querySelector('[data-hero-link]');
    const badge = hero.querySelector('[data-hero-badge]');

    function paint() {
      const item = items[idx];
      if (title) title.textContent = item.title;
      if (desc) desc.textContent = item.lead;
      if (link) link.href = item.url;
      if (badge) badge.textContent = item.badge;
      hero.style.backgroundImage = `linear-gradient(135deg, rgba(15, 23, 42, .92), rgba(9, 16, 31, .86)), url('${item.poster}')`;
    }

    paint();
    setInterval(() => {
      idx = (idx + 1) % items.length;
      paint();
    }, 5000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderSearch();
    renderHeroSwitch();
  });
})();
