(function () {
  function closestScope(input) {
    return input.closest('[data-search-scope]') || document;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateSearch(input) {
    var scope = closestScope(input);
    var query = normalize(input.value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' '));
      var match = !query || haystack.indexOf(query) !== -1;
      card.classList.toggle('is-hidden', !match);
      if (match) {
        visible += 1;
      }
    });

    var counter = scope.querySelector('[data-result-count]');
    if (counter) {
      counter.textContent = visible + ' 部影片';
    }
  }

  function bindSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        updateSearch(input);
      });
    });

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('[data-search-input]');
        if (input) {
          var target = document.querySelector('[data-search-scope] [data-search-input]');
          if (target && target !== input) {
            target.value = input.value;
            updateSearch(target);
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            updateSearch(input);
          }
        }
      });
    });
  }

  function bindMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function bindHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

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
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function bindPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-hls-src]'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      var source = shell.getAttribute('data-hls-src');
      var hlsInstance = null;

      function load() {
        if (!video || !source) {
          return;
        }
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        video.setAttribute('data-ready', '1');
        video.setAttribute('controls', 'controls');
      }

      function play() {
        load();
        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          } else {
            video.pause();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            shell.classList.remove('is-playing');
          }
        });
        window.addEventListener('beforeunload', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMenu();
    bindSearch();
    bindHero();
    bindPlayers();
  });
})();
