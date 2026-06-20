(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startHero() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(index);
                startHero();
            });
        });

        startHero();
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var sortSelect = document.querySelector('[data-card-sort]');
    var cardList = document.querySelector('[data-card-list]');

    function filterCards() {
        if (!cardList) {
            return;
        }

        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-title') || '').toLowerCase();
            card.hidden = keyword !== '' && text.indexOf(keyword) === -1;
        });
    }

    function sortCards() {
        if (!cardList || !sortSelect) {
            return;
        }

        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-card]'));
        var mode = sortSelect.value;

        cards.sort(function (a, b) {
            if (mode === 'newest') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }

            if (mode === 'rating') {
                var ar = Number((a.querySelector('figcaption strong') || {}).textContent || 0);
                var br = Number((b.querySelector('figcaption strong') || {}).textContent || 0);
                return br - ar;
            }

            return 0;
        });

        cards.forEach(function (card) {
            cardList.appendChild(card);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards();
            filterCards();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('video.site-player'));

        players.forEach(function (video) {
            var item = video.querySelector('source');
            var stream = item ? item.getAttribute('src') : video.getAttribute('data-stream');

            if (!stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            }
        });
    }

    setupPlayers();

    var playButton = document.querySelector('[data-play-now]');

    if (playButton) {
        playButton.addEventListener('click', function () {
            var player = document.querySelector('video.site-player');

            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var attempt = player.play();

                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
        });
    }

    function searchText(item) {
        return [
            item.title,
            item.oneLine,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.categoryName,
            (item.tags || []).join(' ')
        ].join(' ').toLowerCase();
    }

    function renderSearchPage() {
        var box = document.querySelector('[data-search-results]');

        if (!box || !window.SITE_INDEX) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get('q') || '').trim();
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-title]');
        var subtitle = document.querySelector('[data-search-subtitle]');
        var root = document.body.getAttribute('data-root') || './';

        if (input) {
            input.value = keyword;
        }

        var list = window.SITE_INDEX;

        if (keyword) {
            var lower = keyword.toLowerCase();
            list = list.filter(function (item) {
                return searchText(item).indexOf(lower) !== -1;
            });

            if (title) {
                title.textContent = '搜索结果';
            }

            if (subtitle) {
                subtitle.textContent = '与“' + keyword + '”相关的影视内容';
            }
        } else {
            list = list.slice(0, 48);
        }

        if (!list.length) {
            box.innerHTML = '<div class="search-empty">未找到匹配内容，可尝试更换关键词。</div>';
            return;
        }

        box.innerHTML = list.map(function (item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<a class="movie-card" href="' + root + item.link + '">' +
                '<figure>' +
                    '<img src="' + root + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<figcaption><strong>' + escapeHtml(item.rating) + '</strong><span>' + escapeHtml(item.year) + '</span></figcaption>' +
                '</figure>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<h2>' + escapeHtml(item.title) + '</h2>' +
                    '<p>' + escapeHtml(item.oneLine) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</a>';
        }).join('');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderSearchPage();
})();
