(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('[data-menu-button]');
  var mobileMenu = qs('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var filterPanel = qs('[data-filter-panel]');
  var movieList = qs('[data-movie-list]');
  if (filterPanel && movieList) {
    var searchInput = qs('#movieSearch');
    var categoryFilter = qs('#categoryFilter');
    var regionFilter = qs('#regionFilter');
    var yearFilter = qs('#yearFilter');
    var cards = qsa('.movie-card', movieList);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query && searchInput) {
      searchInput.value = query;
    }

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      var keyword = normalize(searchInput && searchInput.value);
      var category = normalize(categoryFilter && categoryFilter.value);
      var region = normalize(regionFilter && regionFilter.value);
      var year = normalize(yearFilter && yearFilter.value);

      cards.forEach(function (card) {
        var visible = true;
        if (keyword && cardText(card).indexOf(keyword) === -1) {
          visible = false;
        }
        if (category && normalize(card.getAttribute('data-category')) !== category) {
          visible = false;
        }
        if (region && normalize(card.getAttribute('data-region')) !== region) {
          visible = false;
        }
        if (year && normalize(card.getAttribute('data-year')) !== year) {
          visible = false;
        }
        card.classList.toggle('hidden-card', !visible);
      });
    }

    [searchInput, categoryFilter, regionFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  qsa('.js-player').forEach(function (player) {
    var video = qs('video', player);
    var startButton = qs('.player-start', player);
    var status = qs('.player-status', player);
    var videoUrl = player.getAttribute('data-video');
    var started = false;
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function playVideo() {
      if (!video || !videoUrl) {
        setStatus('暂时无法播放，请稍后再试。');
        return;
      }

      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
        } else {
          setStatus('暂时无法播放，请更换浏览器后重试。');
          started = false;
          return;
        }
      }

      if (startButton) {
        startButton.classList.add('hidden');
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (startButton) {
            startButton.classList.remove('hidden');
          }
          setStatus('播放未开始，请再次点击。');
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    player.addEventListener('click', function (event) {
      if (event.target === player) {
        playVideo();
      }
    });

    if (video) {
      video.addEventListener('playing', function () {
        setStatus('');
      });
      video.addEventListener('error', function () {
        if (started) {
          setStatus('播放遇到问题，请稍后再试。');
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
