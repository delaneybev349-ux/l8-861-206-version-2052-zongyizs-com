(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-target]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(parseInt(dot.getAttribute("data-hero-target"), 10) || 0);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
        scopes.forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var results = document.querySelector("[data-filter-results]");
            if (!results) {
                return;
            }
            var items = Array.prototype.slice.call(results.querySelectorAll(".movie-card, .rank-row"));
            if (input && initial) {
                input.value = initial;
            }
            function apply() {
                var keyword = normalize(input ? input.value : "");
                var regionValue = normalize(region ? region.value : "");
                var typeValue = normalize(type ? type.value : "");
                items.forEach(function (item) {
                    var haystack = normalize([
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-genre")
                    ].join(" "));
                    var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || normalize(item.getAttribute("data-region")) === regionValue;
                    var matchType = !typeValue || normalize(item.getAttribute("data-type")) === typeValue;
                    item.hidden = !(matchKeyword && matchRegion && matchType);
                });
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (region) {
                region.addEventListener("change", apply);
            }
            if (type) {
                type.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initPlayer() {
        var video = document.querySelector("[data-player]");
        if (!video) {
            return;
        }
        var cover = document.querySelector("[data-player-cover]");
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player-button]"));
        var streamUrl = video.getAttribute("data-url");
        var bound = false;
        var hlsInstance = null;
        function bindVideo() {
            if (bound || !streamUrl) {
                return;
            }
            bound = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        try {
                            hlsInstance.destroy();
                        } catch (error) {}
                    }
                });
                return;
            }
            video.src = streamUrl;
        }
        function play() {
            bindVideo();
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener("click", play);
        });
        video.addEventListener("click", function () {
            if (!bound || video.paused) {
                play();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
