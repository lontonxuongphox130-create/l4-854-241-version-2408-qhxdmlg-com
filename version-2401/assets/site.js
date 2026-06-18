(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(nextSlide, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterInput && filterScope) {
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('[data-card], .rank-item'));
        filterInput.addEventListener('input', function () {
            var keyword = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('is-hidden', !matched);
            });
        });
    }
})();

function initializePlayer(source) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-player-play]'));
    var loaded = false;
    var hlsInstance = null;

    if (!video) {
        return;
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function startPlayback() {
        loadSource();
        video.controls = true;

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', startPlayback);
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
