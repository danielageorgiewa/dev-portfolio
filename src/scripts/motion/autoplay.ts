// data-autoplay-inview on a <video>: plays muted on loop while it is on screen and pauses
// when it leaves. Under reduced motion it never autoplays; the video gets controls instead,
// so the visitor can still play it.
import { REDUCED } from './env';

export function initAutoplay(): void {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video[data-autoplay-inview]'));
  if (!videos.length) return;
  const reduced = window.matchMedia(REDUCED);
  const visible = new WeakSet<HTMLVideoElement>();

  const sync = (video: HTMLVideoElement) => {
    if (reduced.matches) {
      video.pause();
      video.controls = true;
      return;
    }
    video.controls = false;
    if (visible.has(video)) video.play().catch(() => {});
    else video.pause();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) visible.add(video);
        else visible.delete(video);
        sync(video);
      }
    },
    { threshold: 0.25 },
  );
  for (const video of videos) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.removeAttribute('autoplay');
    io.observe(video);
  }
  reduced.addEventListener('change', () => videos.forEach(sync));
}
