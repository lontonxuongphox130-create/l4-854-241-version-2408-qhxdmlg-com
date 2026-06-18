function initVideoPlayer(src) {
  var video = document.getElementById("movie-player");
  var trigger = document.getElementById("player-trigger");
  var attached = false;

  if (!video || !trigger || !src) {
    return;
  }

  var playVideo = function () {
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  };

  var attach = function () {
    if (attached) {
      playVideo();
      return;
    }

    attached = true;
    trigger.classList.add("is-hidden");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.addEventListener("loadedmetadata", playVideo, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = src;
    playVideo();
  };

  trigger.addEventListener("click", attach);
  video.addEventListener("click", function () {
    if (!attached) {
      attach();
    }
  });
}
