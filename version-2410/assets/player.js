(function () {
  function showMessage(frame, text) {
    var message = frame ? frame.querySelector('[data-player-message]') : null;
    if (message) {
      message.textContent = text || '';
    }
  }

  document.querySelectorAll('.movie-player').forEach(function (video) {
    var frame = video.closest('.video-frame');
    var cover = frame ? frame.querySelector('.player-cover') : null;
    var stream = video.getAttribute('data-stream') || '';
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage(frame, '网络波动，正在恢复播放');
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage(frame, '播放中断，正在恢复播放');
            hls.recoverMediaError();
            return;
          }
          showMessage(frame, '播放暂时不可用，请稍后重试');
        });
        return;
      }

      showMessage(frame, '播放暂时不可用，请稍后重试');
    }

    function startPlayback() {
      prepare();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
      showMessage(frame, '');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && cover) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
