document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 320) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  var hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    };

    var start = function () {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    };

    var restart = function () {
      window.clearInterval(timer);
      start();
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restart();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  var searchForms = document.querySelectorAll("[data-home-search]");

  searchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input");
      var value = input ? input.value.trim() : "";

      if (value) {
        window.location.href = "all-movies.html?q=" + encodeURIComponent(value);
      } else {
        window.location.href = "all-movies.html";
      }
    });
  });

  var panels = document.querySelectorAll("[data-filter-panel]");

  panels.forEach(function (panel) {
    var scope = panel.closest("[data-filter-scope]") || document;
    var input = panel.querySelector("[data-search-input]");
    var typeFilter = panel.querySelector("[data-type-filter]");
    var yearFilter = panel.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var emptyState = scope.querySelector("[data-empty-state]");

    if (yearFilter) {
      var years = cards.map(function (card) {
        return card.getAttribute("data-year") || "";
      }).filter(Boolean).filter(function (year, index, list) {
        return list.indexOf(year) === index;
      }).sort(function (a, b) {
        return Number(b) - Number(a);
      });

      years.forEach(function (year) {
        var option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
      });
    }

    var params = new URLSearchParams(window.location.search);

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var typeValue = typeFilter ? typeFilter.value : "";
      var yearValue = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.getAttribute("data-genre") || "",
          card.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesType = !typeValue || card.getAttribute("data-type") === typeValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matched = matchesKeyword && matchesType && matchesYear;

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    };

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });
});
