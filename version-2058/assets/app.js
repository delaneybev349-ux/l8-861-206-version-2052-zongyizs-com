(function () {
  var body = document.body;
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
      body.classList.toggle('menu-open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
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

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    show(0);
    start();
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var filterForms = document.querySelectorAll('[data-filter-form]');

  function matchValue(value, needle) {
    return !needle || value.indexOf(needle) !== -1;
  }

  function applyFilter(scope) {
    var keywordInput = scope.querySelector('[data-filter-keyword]');
    var regionInput = scope.querySelector('[data-filter-region]');
    var typeInput = scope.querySelector('[data-filter-type]');
    var yearInput = scope.querySelector('[data-filter-year]');
    var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
    var region = regionInput ? regionInput.value.trim().toLowerCase() : '';
    var type = typeInput ? typeInput.value.trim().toLowerCase() : '';
    var year = yearInput ? yearInput.value.trim().toLowerCase() : '';
    var cards = document.querySelectorAll('[data-movie-card]');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-year') || '',
        card.getAttribute('data-genre') || '',
        card.getAttribute('data-tags') || ''
      ].join(' ').toLowerCase();
      var show = matchValue(haystack, keyword) &&
        matchValue((card.getAttribute('data-region') || '').toLowerCase(), region) &&
        matchValue((card.getAttribute('data-type') || '').toLowerCase(), type) &&
        matchValue((card.getAttribute('data-year') || '').toLowerCase(), year);

      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    var noResults = document.querySelector('[data-no-results]');
    if (noResults) {
      noResults.style.display = visible ? 'none' : 'block';
    }
  }

  filterForms.forEach(function (scope) {
    var inputs = scope.querySelectorAll('input, select');
    var keywordInput = scope.querySelector('[data-filter-keyword]');

    if (keywordInput && query) {
      keywordInput.value = query;
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', function () {
        applyFilter(scope);
      });
      input.addEventListener('change', function () {
        applyFilter(scope);
      });
    });

    applyFilter(scope);
  });

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-trigger]');
    var hlsInstance;

    function begin() {
      if (!video) {
        return;
      }

      var url = player.getAttribute('data-video-url');
      if (!url) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (video.getAttribute('data-ready') !== '1') {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        video.setAttribute('data-ready', '1');
      }

      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        begin();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
