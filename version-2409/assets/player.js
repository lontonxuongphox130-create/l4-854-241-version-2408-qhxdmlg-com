(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId || 'movie-player');
    var overlay = document.getElementById(options.overlayId || 'play-overlay');
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      attached = true;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (overlay && video.paused && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    }

    function play() {
      attach();
      video.controls = true;
      hideOverlay();

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showOverlay();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
}());
