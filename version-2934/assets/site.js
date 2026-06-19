document.addEventListener("DOMContentLoaded", function () {
    var toggles = document.querySelectorAll("[data-menu-toggle]");
    toggles.forEach(function (toggle) {
        toggle.addEventListener("click", function () {
            document.querySelectorAll(".nav, .search-form").forEach(function (item) {
                item.classList.toggle("open");
            });
        });
    });

    document.querySelectorAll(".search-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input");
            var value = input ? input.value.trim() : "";
            if (value) {
                window.location.href = "videos.html?q=" + encodeURIComponent(value);
            }
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var heroTitle = document.querySelector("[data-hero-title]");
    var heroDesc = document.querySelector("[data-hero-desc]");
    var heroLink = document.querySelector("[data-hero-link]");
    var heroTags = document.querySelector("[data-hero-tags]");
    var heroPoster = document.querySelector("[data-hero-poster]");
    var index = 0;

    function activateHero(next) {
        if (!slides.length) {
            return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("active", i === index);
        });
        var slide = slides[index];
        if (heroTitle) {
            heroTitle.textContent = slide.getAttribute("data-title") || "";
        }
        if (heroDesc) {
            heroDesc.textContent = slide.getAttribute("data-desc") || "";
        }
        if (heroLink) {
            heroLink.href = slide.getAttribute("data-url") || "#";
        }
        if (heroTags) {
            heroTags.innerHTML = "";
            (slide.getAttribute("data-tags") || "").split("|").filter(Boolean).forEach(function (tag) {
                var span = document.createElement("span");
                span.textContent = tag;
                heroTags.appendChild(span);
            });
        }
        if (heroPoster) {
            heroPoster.src = slide.getAttribute("data-cover") || "";
            heroPoster.alt = slide.getAttribute("data-title") || "";
        }
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            activateHero(i);
        });
    });

    if (slides.length) {
        activateHero(0);
        window.setInterval(function () {
            activateHero(index + 1);
        }, 5600);
    }

    var list = document.querySelector("[data-movie-list]");
    var keyword = document.querySelector("[data-filter-keyword]");
    var category = document.querySelector("[data-filter-category]");
    var sort = document.querySelector("[data-filter-sort]");

    function applyFilters() {
        if (!list) {
            return;
        }
        var q = keyword ? keyword.value.trim().toLowerCase() : "";
        var c = category ? category.value : "all";
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-text") || "").toLowerCase();
            var cat = card.getAttribute("data-category") || "";
            var show = (!q || text.indexOf(q) >= 0) && (c === "all" || cat === c);
            card.style.display = show ? "block" : "none";
        });
        var visible = cards.filter(function (card) {
            return card.style.display !== "none";
        });
        var mode = sort ? sort.value : "latest";
        visible.sort(function (a, b) {
            if (mode === "rating") {
                return parseFloat(b.getAttribute("data-rating")) - parseFloat(a.getAttribute("data-rating"));
            }
            if (mode === "views") {
                return parseInt(b.getAttribute("data-views"), 10) - parseInt(a.getAttribute("data-views"), 10);
            }
            return parseInt(b.getAttribute("data-year"), 10) - parseInt(a.getAttribute("data-year"), 10);
        });
        visible.forEach(function (card) {
            list.appendChild(card);
        });
    }

    if (keyword || category || sort) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        if (q && keyword) {
            keyword.value = q;
        }
        [keyword, category, sort].forEach(function (item) {
            if (item) {
                item.addEventListener("input", applyFilters);
                item.addEventListener("change", applyFilters);
            }
        });
        applyFilters();
    }

    document.querySelectorAll("[data-player]").forEach(function (box) {
        var video = box.querySelector("video");
        var button = box.querySelector(".play-layer");
        var ready = false;
        function bindVideo() {
            if (!video || ready) {
                return;
            }
            ready = true;
            var url = video.getAttribute("data-play") || "";
            if (!url) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }
        function start() {
            bindVideo();
            if (button) {
                button.classList.add("hidden");
            }
            var playResult = video.play();
            if (playResult && playResult.catch) {
                playResult.catch(function () {});
            }
        }
        if (button && video) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
    });
});
