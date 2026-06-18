(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        var scope = document.querySelector("[data-filter-scope]");

        if (scope) {
            var input = scope.querySelector("[data-search-input]");
            var year = scope.querySelector("[data-filter-year]");
            var category = scope.querySelector("[data-filter-category]");
            var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
            var params = new URLSearchParams(window.location.search);

            if (input && params.get("q")) {
                input.value = params.get("q");
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilters() {
                var query = normalize(input ? input.value : "");
                var selectedYear = normalize(year ? year.value : "");
                var selectedCategory = normalize(category ? category.value : "");

                items.forEach(function (item) {
                    var haystack = normalize([
                        item.dataset.title,
                        item.dataset.region,
                        item.dataset.type,
                        item.dataset.category,
                        item.dataset.tags,
                        item.textContent
                    ].join(" "));
                    var yearOk = !selectedYear || normalize(item.dataset.year).indexOf(selectedYear) !== -1;
                    var categoryOk = !selectedCategory || normalize(item.dataset.category) === selectedCategory;
                    var queryOk = !query || haystack.indexOf(query) !== -1;
                    item.classList.toggle("is-hidden", !(yearOk && categoryOk && queryOk));
                });
            }

            [input, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }
    });
})();
