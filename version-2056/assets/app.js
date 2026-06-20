(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.hasAttribute('hidden') === false;
      if (isOpen) {
        mobileNav.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      } else {
        mobileNav.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      }
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var slideIndex = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === slideIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === slideIndex);
    });
  }

  function startSlides() {
    if (slideTimer || slides.length < 2) {
      return;
    }
    slideTimer = window.setInterval(function () {
      showSlide(slideIndex + 1);
    }, 4600);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showSlide(i);
      if (slideTimer) {
        window.clearInterval(slideTimer);
        slideTimer = null;
      }
      startSlides();
    });
  });

  showSlide(0);
  startSlides();

  var filterForm = document.querySelector('[data-filter-panel]');
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var keywordInput = filterForm.querySelector('[data-filter-keyword]');
    var regionSelect = filterForm.querySelector('[data-filter-region]');
    var typeSelect = filterForm.querySelector('[data-filter-type]');
    var genreSelect = filterForm.querySelector('[data-filter-genre]');
    var emptyState = document.querySelector('[data-empty-state]');

    function matchText(source, query) {
      return !query || source.indexOf(query) !== -1;
    }

    function runFilter() {
      var keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
      var region = regionSelect && regionSelect.value || '';
      var type = typeSelect && typeSelect.value || '';
      var genre = genreSelect && genreSelect.value || '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.genre, card.dataset.tags].join(' ').toLowerCase();
        var ok = matchText(text, keyword);
        if (region) {
          ok = ok && card.dataset.region.indexOf(region) !== -1;
        }
        if (type) {
          ok = ok && card.dataset.type.indexOf(type) !== -1;
        }
        if (genre) {
          ok = ok && card.dataset.genre.indexOf(genre) !== -1;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.style.display = visible ? 'none' : 'block';
      }
    }

    [keywordInput, regionSelect, typeSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }

  var searchRoot = document.querySelector('[data-search-root]');
  if (searchRoot && typeof SearchItems !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = searchRoot.querySelector('[data-search-input]');
    var results = searchRoot.querySelector('[data-search-results]');
    var empty = searchRoot.querySelector('[data-search-empty]');

    if (input) {
      input.value = query;
    }

    function cardTemplate(item) {
      return '<article class="movie-card">' +
        '<a class="poster-link" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">' +
        '<img loading="lazy" src="' + item.image + '" alt="' + escapeHtml(item.title) + '">' +
        '<span class="card-badge">' + escapeHtml(item.region) + '</span>' +
        '</a>' +
        '<div class="card-body">' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span><strong>' + item.rating + '</strong></div>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.line) + '</p>' +
        '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>' +
        '</div>' +
        '</article>';
    }

    function escapeHtml(text) {
      return String(text).replace(/[&<>"]/g, function (mark) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[mark];
      });
    }

    function renderSearch(value) {
      var q = value.trim().toLowerCase();
      var list = SearchItems.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.genre, item.line, item.tags.join(' ')].join(' ').toLowerCase();
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 160);

      if (results) {
        results.innerHTML = list.map(cardTemplate).join('');
      }
      if (empty) {
        empty.style.display = list.length ? 'none' : 'block';
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        renderSearch(input.value);
      });
    }

    renderSearch(query);
  }

  var playerBoxes = Array.prototype.slice.call(document.querySelectorAll('.player-box'));
  playerBoxes.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-mask');
    var source = video && video.getAttribute('data-hls-src');
    var hls = null;

    function prepare() {
      if (!video || !source || video.dataset.ready === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      video.dataset.ready = '1';
    }

    function play() {
      prepare();
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
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
        box.classList.add('is-playing');
      });
    }
  });
})();
