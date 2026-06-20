(function () {
    var searchReady = false;
    var searchCallbacks = [];

    function loadSearch(callback) {
        if (window.siteSearchIndex) {
            callback();
            return;
        }
        searchCallbacks.push(callback);
        if (searchReady) {
            return;
        }
        searchReady = true;
        var script = document.createElement("script");
        script.src = "./assets/search-index.js";
        script.onload = function () {
            searchCallbacks.splice(0).forEach(function (item) {
                item();
            });
        };
        document.head.appendChild(script);
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });
        window.setInterval(function () {
            show((current + 1) % slides.length);
        }, 5200);
    }

    function setupLocalFilter() {
        var input = document.querySelector("[data-filter-input]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        function applyFilter() {
            var keyword = normalizeText(input.value);
            cards.forEach(function (card) {
                var text = normalizeText(card.getAttribute("data-search-text"));
                card.classList.toggle("is-hidden-by-filter", keyword && text.indexOf(keyword) === -1);
            });
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");
        if (initial) {
            input.value = initial;
        }
        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    function setupHeaderSearch() {
        var input = document.querySelector("[data-search-input]");
        var panel = document.querySelector("[data-search-results]");
        if (!input || !panel) {
            return;
        }
        function closePanel() {
            panel.classList.remove("is-open");
            panel.innerHTML = "";
        }
        function renderResults() {
            var keyword = normalizeText(input.value);
            if (!keyword) {
                closePanel();
                return;
            }
            loadSearch(function () {
                var results = (window.siteSearchIndex || []).filter(function (item) {
                    return normalizeText(item.text).indexOf(keyword) !== -1;
                }).slice(0, 8);
                panel.innerHTML = "";
                results.forEach(function (item) {
                    var link = document.createElement("a");
                    var title = document.createElement("strong");
                    var meta = document.createElement("span");
                    link.className = "search-result";
                    link.href = item.url;
                    title.textContent = item.title;
                    meta.textContent = item.meta;
                    link.appendChild(title);
                    link.appendChild(meta);
                    panel.appendChild(link);
                });
                panel.classList.toggle("is-open", results.length > 0);
            });
        }
        input.addEventListener("input", renderResults);
        input.addEventListener("focus", renderResults);
        document.addEventListener("click", function (event) {
            if (!panel.contains(event.target) && event.target !== input) {
                closePanel();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupLocalFilter();
        setupHeaderSearch();
    });
})();
