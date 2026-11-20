// Lenis smooth scrolling. Loaded lazily and only for mouse / trackpad users with motion
// allowed: touch devices and reduced motion keep native scrolling.
import Lenis from 'lenis';
import { setScroller } from './scroll';
import type { Cleanup } from './env';

export interface Smooth {
  lenis: Lenis;
  /** Drive Lenis from its own requestAnimationFrame loop (pages without GSAP). */
  selfDrive(): Cleanup;
  destroy(): void;
}

export function createSmooth(): Smooth {
  const lenis = new Lenis({ autoRaf: false, anchors: false, lerp: 0.11 });
  setScroller(lenis);
  return {
    lenis,
    selfDrive() {
      let frame = requestAnimationFrame(function loop(time) {
        lenis.raf(time);
        frame = requestAnimationFrame(loop);
      });
      return () => cancelAnimationFrame(frame);
    },
    destroy() {
      setScroller(null);
      lenis.destroy();
    },
  };
}
