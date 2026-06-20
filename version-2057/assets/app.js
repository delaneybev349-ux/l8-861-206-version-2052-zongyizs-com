(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    if (slides.length > 1) {
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterInput = document.querySelector('[data-filter-input]');
    var filterCategory = document.querySelector('[data-filter-category]');
    var filterYear = document.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var q = normalize(filterInput && filterInput.value);
        var category = normalize(filterCategory && filterCategory.value);
        var year = normalize(filterYear && filterYear.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-tags'),
                card.getAttribute('data-category'),
                card.getAttribute('data-year')
            ].join(' '));
            var cardCategory = normalize(card.getAttribute('data-category'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matched = true;

            if (q && haystack.indexOf(q) === -1) {
                matched = false;
            }
            if (category && cardCategory !== category) {
                matched = false;
            }
            if (year && cardYear !== year) {
                matched = false;
            }

            card.classList.toggle('hidden-by-filter', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
    }
    [filterInput, filterCategory, filterYear].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
            applyFilters();
        }
    }

    function prepareVideo(video) {
        if (!video || video.getAttribute('data-ready') === '1') {
            return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video.hlsInstance = hls;
        } else {
            video.src = stream;
        }
        video.setAttribute('data-ready', '1');
    }

    Array.prototype.slice.call(document.querySelectorAll('.video-wrap')).forEach(function (wrap) {
        var video = wrap.querySelector('video');
        var button = wrap.querySelector('.play-overlay');

        function start() {
            prepareVideo(video);
            if (button) {
                button.classList.add('is-hidden');
            }
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
        }
    });
})();
