(function () {
    function initMoviePlayer(videoUrl) {
        var video = document.querySelector(".js-player-video");
        var cover = document.querySelector(".js-player-cover");
        var loaded = false;
        var hlsInstance = null;

        if (!video || !cover || !videoUrl) {
            return;
        }

        function attachVideo() {
            if (loaded) {
                return;
            }

            loaded = true;
            video.controls = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            }
        }

        function beginPlay() {
            attachVideo();
            cover.classList.add("is-hidden");
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        cover.addEventListener("click", beginPlay);

        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
