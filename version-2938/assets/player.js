import { H as Hls } from './video-vendor-dru42stk.js';

function startPlayer(shell) {
  const video = shell.querySelector('video');
  const overlay = shell.querySelector('[data-player-overlay]');
  const btn = shell.querySelector('[data-player-btn]');
  if (!video || !btn) return;

  const src = shell.dataset.src;
  let started = false;
  let hls = null;

  function play() {
    if (started) {
      video.play().catch(() => {});
      return;
    }
    started = true;
    if (overlay) overlay.style.display = 'none';
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;

    if (src && src.endsWith('.m3u8') && Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (src) {
      video.src = src;
      video.play().catch(() => {});
    }
  }

  btn.addEventListener('click', play);
  shell.addEventListener('click', (ev) => {
    if (!started && ev.target !== btn) play();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-player-shell]').forEach(startPlayer);
});
