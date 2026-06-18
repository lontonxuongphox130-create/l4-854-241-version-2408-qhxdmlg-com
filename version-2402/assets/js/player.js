(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            var source = player.getAttribute("data-hls");
            var initialized = false;
            var hlsInstance = null;

            function initialize() {
                if (!video || !source || initialized) {
                    return;
                }

                initialized = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                initialize();
                player.classList.add("is-playing");
                var promise = video.play();

                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        player.classList.remove("is-playing");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }

            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });

                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        player.classList.remove("is-playing");
                    }
                });

                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    }
                });
            }

            player.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    play();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
