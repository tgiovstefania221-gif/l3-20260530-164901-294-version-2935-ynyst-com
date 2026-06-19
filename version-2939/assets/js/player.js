(function () {
  function startPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector("[data-play-button]");
    if (!video) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var hasStarted = false;

    function loadAndPlay() {
      if (!stream) {
        return;
      }

      if (!hasStarted) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        }
        hasStarted = true;
      }

      if (button) {
        button.classList.add("is-hidden");
      }

      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", loadAndPlay);
    }

    box.addEventListener("click", function (event) {
      if (event.target === video) {
        return;
      }
      loadAndPlay();
    });
  }

  document.querySelectorAll("[data-player]").forEach(startPlayer);
})();
