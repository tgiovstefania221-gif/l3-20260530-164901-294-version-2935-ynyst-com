(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".mobile-nav");
    if (toggle && mobile) {
      toggle.addEventListener("click", function () {
        mobile.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length && dots.length) {
      var active = 0;
      var show = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
        });
      });
      setInterval(function () {
        show(active + 1);
      }, 5200);
      show(0);
    }

    var filterBox = document.querySelector("[data-local-filter]");
    if (filterBox) {
      var input = filterBox.querySelector("input");
      var select = filterBox.querySelector("select");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-title]"));
      var none = document.querySelector(".no-result");
      var apply = function () {
        var q = input ? input.value.trim().toLowerCase() : "";
        var year = select ? select.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = [card.dataset.title, card.dataset.category, card.dataset.tags].join(" ").toLowerCase();
          var okText = !q || text.indexOf(q) !== -1;
          var okYear = !year || card.dataset.year === year;
          var showCard = okText && okYear;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (none) {
          none.style.display = visible ? "none" : "block";
        }
      };
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
    }
  });
})();
