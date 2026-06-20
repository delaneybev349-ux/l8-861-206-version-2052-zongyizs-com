(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupSearch() {
    var inputs = document.querySelectorAll('[data-search-input]');
    inputs.forEach(function (input) {
      var targetName = input.getAttribute('data-target');
      var list = document.querySelector('[data-card-list="' + targetName + '"]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      input.addEventListener('input', function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          card.classList.toggle('hidden', query.length > 0 && haystack.indexOf(query) === -1);
        });
      });
    });
  }

  function setupFilters() {
    var groups = document.querySelectorAll('[data-filter-group]');
    groups.forEach(function (group) {
      var targetName = group.getAttribute('data-filter-group');
      var list = document.querySelector('[data-card-list="' + targetName + '"]');
      if (!list) {
        return;
      }
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var value = button.getAttribute('data-filter-value');
          buttons.forEach(function (item) {
            item.classList.remove('active');
          });
          button.classList.add('active');
          cards.forEach(function (card) {
            var kind = card.getAttribute('data-kind') || '';
            card.classList.toggle('hidden', value !== '全部' && kind.indexOf(value) === -1);
          });
        });
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
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
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  ready(function () {
    setupMenu();
    setupSearch();
    setupFilters();
    setupHero();
  });
})();
