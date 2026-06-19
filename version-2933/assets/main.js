(function() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        showSlide(activeIndex + 1);
      }, 5600);
    }
  }

  const pageFilter = document.querySelector("[data-page-filter]");
  const pageList = document.querySelector("[data-filter-list]");

  if (pageFilter && pageList) {
    const items = Array.from(pageList.querySelectorAll(".searchable-item"));
    pageFilter.addEventListener("input", function() {
      const keyword = pageFilter.value.trim().toLowerCase();
      items.forEach(function(item) {
        const haystack = (item.getAttribute("data-search") || "").toLowerCase();
        item.classList.toggle("is-hidden", keyword && !haystack.includes(keyword));
      });
    });
  }

  const searchInput = document.querySelector("[data-search-input]");
  const categorySelect = document.querySelector("[data-category-select]");
  const searchList = document.querySelector("[data-search-list]");
  const resultLine = document.querySelector("[data-result-line]");

  if (searchInput && searchList) {
    const items = Array.from(searchList.querySelectorAll(".searchable-item"));
    const params = new URLSearchParams(window.location.search);
    const initialKeyword = params.get("q") || "";

    if (initialKeyword) {
      searchInput.value = initialKeyword;
    }

    function applySearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      const category = categorySelect ? categorySelect.value : "";
      let visible = 0;

      items.forEach(function(item) {
        const haystack = (item.getAttribute("data-search") || "").toLowerCase();
        const itemCategory = item.getAttribute("data-category") || "";
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedCategory = !category || itemCategory === category;
        const matched = matchedKeyword && matchedCategory;
        item.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (resultLine) {
        resultLine.textContent = visible > 0 ? "匹配影片" : "暂无匹配影片";
      }
    }

    searchInput.addEventListener("input", applySearch);

    if (categorySelect) {
      categorySelect.addEventListener("change", applySearch);
    }

    applySearch();
  }
})();
