(function () {
  function render(list) {
    var target = document.querySelector(".search-results");
    var none = document.querySelector(".no-result");
    if (!target) {
      return;
    }
    target.innerHTML = list.slice(0, 300).map(function (movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return [
        "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + movie.year + "\" data-category=\"" + escapeHtml(movie.category) + "\" data-tags=\"" + escapeHtml(movie.tags.join(" ")) + "\">",
        "<a class=\"card-cover\" href=\"" + movie.href + "\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.remove()\"><span class=\"card-badge\">" + escapeHtml(movie.category) + "</span></a>",
        "<div class=\"card-body\"><h3><a href=\"" + movie.href + "\">" + escapeHtml(movie.title) + "</a></h3><p>" + escapeHtml(movie.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div><div class=\"card-meta\"><span>" + movie.year + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + movie.views + "</span></div></div>",
        "</article>"
      ].join("");
    }).join("");
    if (none) {
      none.style.display = list.length ? "none" : "block";
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[char];
    });
  }

  function run() {
    var params = new URLSearchParams(location.search);
    var q = params.get("q") || "";
    var input = document.querySelector("#searchInput");
    var year = document.querySelector("#yearSelect");
    var category = document.querySelector("#categorySelect");
    if (input) {
      input.value = q;
    }
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var categoryValue = category ? category.value : "";
      var result = (window.MOVIES || []).filter(function (movie) {
        var hay = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.tags.join(" "), movie.oneLine].join(" ").toLowerCase();
        return (!keyword || hay.indexOf(keyword) !== -1) && (!yearValue || String(movie.year) === yearValue) && (!categoryValue || movie.category === categoryValue);
      });
      render(result);
    };
    [input, year, category].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
    apply();
  }

  if (document.readyState !== "loading") {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
})();
