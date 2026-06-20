(function () {
  window.initMoviePlayer = function (mediaSource) {
    var video = document.querySelector('[data-player-video]');
    var button = document.querySelector('[data-player-button]');
    var wrap = document.querySelector('[data-player-wrap]');
    var started = false;
    var hlsInstance = null;

    if (!video || !mediaSource) {
      return;
    }

    function begin() {
      if (button) {
        button.classList.add('hidden');
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      video.controls = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(mediaSource);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
              hlsInstance = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaSource;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = mediaSource;
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        begin();
      });
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        begin();
      }
    });

    if (wrap) {
      wrap.addEventListener('click', function (event) {
        if (event.target === wrap) {
          begin();
        }
      });
    }
  };
})();
