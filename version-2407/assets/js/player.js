(function () {
    function initMoviePlayer(videoId, url) {
        var video = document.getElementById(videoId);

        if (!video) {
            return;
        }

        var frame = video.closest("[data-player]");
        var overlay = frame ? frame.querySelector(".play-overlay") : null;
        var prepared = false;

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video.hlsPlayer = hls;
                return;
            }

            video.src = url;
        }

        function play() {
            prepare();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            var action = video.play();

            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                play();
            });
        }

        if (frame) {
            frame.addEventListener("click", function (event) {
                if (event.target === frame) {
                    play();
                }
            });
        }

        video.addEventListener("click", function () {
            if (!prepared) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
