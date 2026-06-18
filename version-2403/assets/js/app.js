(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterBar = document.querySelector('[data-filter-bar]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterBar && filterList) {
        var input = filterBar.querySelector('[data-filter-input]');
        var typeSelect = filterBar.querySelector('[data-filter-type]');
        var yearSelect = filterBar.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && input) {
            input.value = query;
        }

        function applyFilters() {
            var words = input ? input.value.trim().toLowerCase() : '';
            var typeValue = typeSelect ? typeSelect.value : '';
            var yearValue = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var searchText = (card.getAttribute('data-search') || '').toLowerCase();
                var typeText = card.getAttribute('data-type') || '';
                var yearText = card.getAttribute('data-year') || '';
                var visible = true;

                if (words && searchText.indexOf(words) === -1) {
                    visible = false;
                }

                if (typeValue && typeText !== typeValue) {
                    visible = false;
                }

                if (yearValue && yearText !== yearValue) {
                    visible = false;
                }

                card.classList.toggle('is-filter-hidden', !visible);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilters);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilters);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilters);
        }

        applyFilters();
    }

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var trigger = player.querySelector('[data-player-trigger]');
        var streamUrl = video ? video.getAttribute('data-stream') : '';
        var hlsInstance = null;
        var started = false;

        function preparePlayback() {
            if (!video || !streamUrl) {
                return;
            }

            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (trigger) {
                trigger.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = streamUrl;
            video.play().catch(function () {});
        }

        if (trigger) {
            trigger.addEventListener('click', preparePlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    preparePlayback();
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
