(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".menu-button");
        var navLinks = document.querySelector(".nav-links");

        if (menuButton && navLinks) {
            menuButton.addEventListener("click", function () {
                navLinks.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function startAuto() {
            if (timer) {
                clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                startAuto();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startAuto();
            });
        }

        startAuto();

        var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var clearButtons = Array.prototype.slice.call(document.querySelectorAll(".clear-filter"));
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter(value) {
            var keyword = normalize(value);

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.textContent);
                card.classList.toggle("is-filter-hidden", keyword.length > 0 && haystack.indexOf(keyword) === -1);
            });
        }

        if (q && filterInputs.length) {
            filterInputs[0].value = q;
            applyFilter(q);
        }

        filterInputs.forEach(function (input) {
            input.addEventListener("input", function () {
                applyFilter(input.value);
            });
        });

        clearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterInputs.forEach(function (input) {
                    input.value = "";
                });
                applyFilter("");
            });
        });
    });
})();
