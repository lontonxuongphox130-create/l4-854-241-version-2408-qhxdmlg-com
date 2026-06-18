(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-site-search]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = "./all.html";

                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }

                window.location.href = url;
            });
        });

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var previous = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer = null;

            function showSlide(nextIndex) {
                if (!slides.length) {
                    return;
                }

                index = (nextIndex + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function startTimer() {
                clearInterval(timer);
                timer = setInterval(function () {
                    showSlide(index + 1);
                }, 5200);
            }

            if (previous) {
                previous.addEventListener("click", function () {
                    showSlide(index - 1);
                    startTimer();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    showSlide(index + 1);
                    startTimer();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                    startTimer();
                });
            });

            showSlide(0);
            startTimer();
        }

        var filterForm = document.querySelector("[data-filter-form]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

        if (filterForm && cards.length) {
            var searchInput = document.getElementById("movieSearchInput");
            var categoryFilter = document.getElementById("categoryFilter");
            var yearFilter = document.getElementById("yearFilter");
            var params = new URLSearchParams(window.location.search);
            var presetQuery = params.get("q") || "";

            if (searchInput && presetQuery) {
                searchInput.value = presetQuery;
            }

            function normalize(text) {
                return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
            }

            function applyFilters() {
                var query = normalize(searchInput ? searchInput.value : "");
                var category = categoryFilter ? categoryFilter.value : "";
                var year = yearFilter ? yearFilter.value : "";

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (category && cardCategory !== category) {
                        matched = false;
                    }

                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.hidden = !matched;
                });
            }

            [searchInput, categoryFilter, yearFilter].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilters);
                    element.addEventListener("change", applyFilters);
                }
            });

            filterForm.addEventListener("reset", function () {
                setTimeout(applyFilters, 0);
            });

            applyFilters();
        }
    });
})();
