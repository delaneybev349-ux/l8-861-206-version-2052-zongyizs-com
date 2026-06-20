import { H as Hls } from './hls.js';

const video = document.querySelector('[data-player]');
const overlay = document.querySelector('[data-play-overlay]');
let hlsInstance = null;
let initialized = false;

const bindSource = () => {
  if (!video || initialized) {
    return;
  }

  const source = video.dataset.src;

  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
  } else {
    video.src = source;
  }

  initialized = true;
};

const startPlayback = async () => {
  if (!video) {
    return;
  }

  bindSource();

  try {
    await video.play();
  } catch (error) {
    video.controls = true;
  }
};

if (overlay) {
  overlay.addEventListener('click', startPlayback);
}

if (video) {
  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', () => {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', () => {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('loadedmetadata', () => {
    video.controls = true;
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
