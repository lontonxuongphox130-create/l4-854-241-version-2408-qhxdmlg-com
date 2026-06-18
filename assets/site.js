(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-menu-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function initCardFilters() {
        qsa('[data-filter-scope]').forEach(function (scope) {
            var textInput = qs('[data-card-filter]', scope);
            var yearSelect = qs('[data-year-filter]', scope);
            var typeSelect = qs('[data-type-filter]', scope);
            var cards = qsa('[data-card]', scope);
            var empty = qs('[data-empty-state]', scope);

            function apply() {
                var query = normalize(textInput && textInput.value);
                var year = normalize(yearSelect && yearSelect.value);
                var type = normalize(typeSelect && typeSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-filter-text'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (year && cardYear !== year) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [textInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    function initImageFallback() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            });
        });
    }

    function attachHls(video, src) {
        if (video.dataset.ready === '1') {
            return Promise.resolve();
        }
        video.dataset.ready = '1';

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                hls.destroy();
            });
            video._hls = hls;
            return Promise.resolve();
        }

        video.src = src;
        return Promise.resolve();
    }

    function initPlayer() {
        var video = qs('[data-hls-player]');
        var button = qs('[data-player-button]');
        if (!video || !button) {
            return;
        }
        var src = video.getAttribute('data-src');
        var play = function () {
            if (!src) {
                return;
            }
            attachHls(video, src).then(function () {
                button.classList.add('is-hidden');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            });
        };
        button.addEventListener('click', play);
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
    }

    function movieCardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card small">',
            '<a class="movie-cover" href="' + escapeHtml(movie.url) + '">',
            '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p class="movie-meta">' + escapeHtml([movie.region, movie.type, movie.year].filter(Boolean).join(' · ')) + '</p>',
            '<p class="movie-line line-clamp-2">' + escapeHtml(movie.oneLine || '') + '</p>',
            '<div class="tag-row">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initSearchPage() {
        var results = qs('[data-search-results]');
        var empty = qs('[data-search-empty]');
        var input = qs('[data-search-input]');
        if (!results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (input) {
            input.value = query;
        }

        function render(value) {
            var q = normalize(value);
            var list = window.SEARCH_INDEX.filter(function (movie) {
                if (!q) {
                    return true;
                }
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(' '),
                    movie.oneLine
                ].join(' ')).indexOf(q) !== -1;
            }).slice(0, 120);

            results.innerHTML = list.map(movieCardHtml).join('');
            initImageFallback();
            if (empty) {
                empty.hidden = list.length !== 0;
            }
        }

        render(query);
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initCardFilters();
        initImageFallback();
        initPlayer();
        initSearchPage();
    });
}());
