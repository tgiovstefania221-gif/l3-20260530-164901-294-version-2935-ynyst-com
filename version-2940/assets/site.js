(function () {
    var menuButton = document.querySelector('.menu-button');
    var mainNav = document.querySelector('.main-nav');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.slide-dots button'));
    var slideIndex = 0;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        slideIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, index) {
            slide.classList.toggle('is-active', index === slideIndex);
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === slideIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('.movie-search');
    var yearFilter = document.querySelector('.movie-year-filter');
    var genreFilter = document.querySelector('.movie-genre-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function runFilter() {
        var keyword = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var genre = normalize(genreFilter && genreFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.category,
                card.textContent
            ].join(' '));
            var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchYear = !year || normalize(card.dataset.year) === year;
            var matchGenre = !genre || text.indexOf(genre) !== -1;
            var matched = matchKeyword && matchYear && matchGenre;

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        var empty = document.querySelector('.empty-state');
        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    [searchInput, yearFilter, genreFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', runFilter);
            control.addEventListener('change', runFilter);
        }
    });

    function bindPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');
        var hlsInstance = null;

        function prepare() {
            var url = video && video.getAttribute('data-video');
            if (!video || !url || video.dataset.ready === 'true') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                video.src = url;
            }

            video.dataset.ready = 'true';
        }

        function play() {
            prepare();

            if (button) {
                button.classList.add('is-hidden');
            }

            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.dataset.ready !== 'true') {
                    play();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
})();
