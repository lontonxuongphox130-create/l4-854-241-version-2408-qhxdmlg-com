(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function render(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function schedule() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        render(index + 1);
      }, 5000);
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        schedule();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        schedule();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        render(i);
        schedule();
      });
    });

    render(0);
    schedule();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var search = root.querySelector('[data-search-input]');
    var year = root.querySelector('[data-year-filter]');
    var region = root.querySelector('[data-region-filter]');
    var type = root.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));

    function applyFilters() {
      var query = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-keywords') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();

        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }
        if (regionValue && card.getAttribute('data-region') !== regionValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }
        card.classList.toggle('is-filter-hidden', !matched);
      });
    }

    [search, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  });
})();
