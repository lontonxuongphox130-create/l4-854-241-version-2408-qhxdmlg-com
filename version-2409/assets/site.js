(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    var scope = form.parentElement || document;
    var input = form.querySelector('[data-filter-input]');
    var region = form.querySelector('[data-filter-region]');
    var type = form.querySelector('[data-filter-type]');
    var category = form.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && input) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filter() {
      var keyword = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var categoryValue = normalize(category && category.value);

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardCategory = normalize(card.getAttribute('data-category'));
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          matched = false;
        }

        if (typeValue && cardType.indexOf(typeValue) === -1) {
          matched = false;
        }

        if (categoryValue && cardCategory.indexOf(categoryValue) === -1) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    form.addEventListener('input', filter);
    form.addEventListener('change', filter);
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });

    filter();
  });
}());
