(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                document.body.classList.add("menu-open");
            } else {
                panel.setAttribute("hidden", "");
                document.body.classList.remove("menu-open");
            }
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search-form").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer;
        function activate(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("active", thumbIndex === index);
            });
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }
        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.addEventListener("click", function () {
                activate(thumbIndex);
                restart();
            });
        });
        activate(0);
        restart();
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupCategoryFilter() {
        var input = document.querySelector("[data-category-filter]");
        var grid = document.querySelector("[data-filter-grid]");
        var count = document.querySelector("[data-filter-count]");
        if (!input || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        function update() {
            var keyword = normalize(input.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type")
                ].join(" "));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + " 部";
            }
        }
        input.addEventListener("input", update);
        update();
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"poster-gradient\"></span>",
            "<span class=\"score-badge\">" + escapeHtml(movie.score) + "</span>",
            "<span class=\"play-chip\">播放</span>",
            "</a>",
            "<div class=\"card-body\">",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
            "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"tag-row\">" + tags + "</div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-results]");
        if (!root || !window.MOVIES_INDEX) {
            return;
        }
        var form = document.querySelector("[data-search-panel]");
        var qInput = document.querySelector("[data-search-q]");
        var categorySelect = document.querySelector("[data-search-category]");
        var yearSelect = document.querySelector("[data-search-year]");
        var typeSelect = document.querySelector("[data-search-type]");
        var count = document.querySelector("[data-search-count]");
        var params = new URLSearchParams(window.location.search);
        if (qInput) {
            qInput.value = params.get("q") || "";
        }
        if (categorySelect && params.get("category")) {
            categorySelect.value = params.get("category");
        }
        function uniqueOptions(key) {
            var seen = {};
            window.MOVIES_INDEX.forEach(function (movie) {
                if (movie[key]) {
                    seen[movie[key]] = true;
                }
            });
            return Object.keys(seen).sort().slice(0, 160);
        }
        if (categorySelect && categorySelect.options.length <= 1) {
            uniqueOptions("category").forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                categorySelect.appendChild(option);
            });
        }
        if (yearSelect && yearSelect.options.length <= 1) {
            uniqueOptions("year").reverse().forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                yearSelect.appendChild(option);
            });
        }
        if (typeSelect && typeSelect.options.length <= 1) {
            uniqueOptions("type").forEach(function (value) {
                var option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                typeSelect.appendChild(option);
            });
        }
        function apply() {
            var query = normalize(qInput && qInput.value);
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var results = window.MOVIES_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags && movie.tags.join(" "),
                    movie.oneLine
                ].join(" "));
                return (!query || haystack.indexOf(query) !== -1)
                    && (!category || movie.category === category)
                    && (!year || movie.year === year)
                    && (!type || movie.type === type);
            }).slice(0, 240);
            if (count) {
                count.textContent = results.length + " 部";
            }
            if (!results.length) {
                root.innerHTML = "<div class=\"search-empty\">没有找到匹配内容，请更换关键词或筛选条件。</div>";
                return;
            }
            root.innerHTML = results.map(movieCard).join("");
        }
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
        }
        [qInput, categorySelect, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayer() {
        var video = document.getElementById("moviePlayer");
        if (!video) {
            return;
        }
        var sourceEl = video.querySelector("source");
        var source = sourceEl ? sourceEl.getAttribute("src") : video.getAttribute("src");
        var overlay = document.querySelector("[data-play-overlay]");
        var action = document.querySelector("[data-player-action]");
        var hlsInstance = null;
        var attached = false;
        function attach() {
            if (attached || !source) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }
        function start() {
            attach();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", start);
        }
        if (action) {
            action.addEventListener("click", start);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupSearchForms();
        setupHero();
        setupCategoryFilter();
        setupSearchPage();
        setupPlayer();
    });
})();
