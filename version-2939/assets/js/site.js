(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setMissingImage(img) {
    img.classList.add("is-missing");
  }

  document.addEventListener("error", function (event) {
    var target = event.target;
    if (target && target.tagName === "IMG") {
      setMissingImage(target);
    }
  }, true);

  all("[data-menu-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector("[data-mobile-nav]");
      if (nav) {
        nav.classList.toggle("is-open");
      }
    });
  });

  all("[data-hero]").forEach(function (hero) {
    var slides = all(".hero-slide", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });

    show(0);
    restart();
  });

  all("[data-filter-panel]").forEach(function (panel) {
    var targetSelector = panel.getAttribute("data-filter-panel");
    var cards = all(targetSelector || "[data-card]");
    var buttons = all("[data-filter]", panel);

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-filter");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        cards.forEach(function (card) {
          var show = value === "all";
          if (!show) {
            var parts = value.split(":");
            show = (card.getAttribute("data-" + parts[0]) || "").indexOf(parts.slice(1).join(":")) !== -1;
          }
          card.classList.toggle("is-hidden-card", !show);
        });
      });
    });
  });

  function renderSearch() {
    var mount = document.querySelector("[data-search-results]");
    var input = document.querySelector("[data-search-input]");
    if (!mount || !input || !window.SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function createResult(item) {
      var link = document.createElement("a");
      link.className = "search-result";
      link.href = item.u;

      var img = document.createElement("img");
      img.src = item.c;
      img.alt = item.t;

      var body = document.createElement("span");
      var title = document.createElement("h3");
      title.textContent = item.t;
      var desc = document.createElement("p");
      desc.textContent = item.d;
      var meta = document.createElement("span");
      meta.className = "card-meta";
      meta.textContent = item.y + " · " + item.r + " · " + item.g;

      body.appendChild(title);
      body.appendChild(desc);
      body.appendChild(meta);
      link.appendChild(img);
      link.appendChild(body);
      return link;
    }

    function run() {
      var q = input.value.trim().toLowerCase();
      var results = window.SEARCH_INDEX.filter(function (item) {
        if (!q) {
          return true;
        }
        return (item.t + " " + item.d + " " + item.g + " " + item.r + " " + item.y + " " + item.k).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);

      mount.innerHTML = "";
      if (!results.length) {
        var empty = document.createElement("div");
        empty.className = "section-card";
        empty.textContent = "暂无匹配内容";
        mount.appendChild(empty);
        return;
      }

      results.forEach(function (item) {
        mount.appendChild(createResult(item));
      });
    }

    input.addEventListener("input", run);
    run();
  }

  renderSearch();
})();
