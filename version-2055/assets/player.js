(function () {
    window.setupPlayer = function (videoId, coverId, sourceUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var hls = null;
        var loaded = false;
        if (!video || !cover || !sourceUrl) {
            return;
        }
        function attachSource() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }
        function startPlayback() {
            attachSource();
            cover.classList.add("is-hidden");
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }
        cover.addEventListener("click", startPlayback);
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
