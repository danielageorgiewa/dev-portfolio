// data-magnetic: the element pulls slightly toward the cursor while it is hovered.
// Mouse / trackpad only. It moves with the `translate` property, so it never fights the
// element's own `transform` transitions.
import type { Cleanup, MotionEnv } from './env';

const PULL = 0.28;
const MAX = 10;
const EASE = 0.16;

export function initMagnetic(env: MotionEnv): Cleanup | void {
  if (!env.hover) return;
  const cleanups: Cleanup[] = [];

  for (const el of document.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    const step = () => {
      x += (tx - x) * EASE;
      y += (ty - y) * EASE;
      const resting = Math.abs(tx - x) < 0.05 && Math.abs(ty - y) < 0.05;
      if (resting) {
        x = tx;
        y = ty;
      }
      el.style.translate = x || y ? `${x.toFixed(2)}px ${y.toFixed(2)}px` : '';
      frame = resting ? 0 : requestAnimationFrame(step);
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const limit = (n: number) => Math.max(-MAX, Math.min(MAX, n));
    const move = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // The rect already includes the current pull; take it out to find the resting centre.
      tx = limit((event.clientX - (r.left - x + r.width / 2)) * PULL);
      ty = limit((event.clientY - (r.top - y + r.height / 2)) * PULL);
      kick();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    cleanups.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
      el.style.translate = '';
    });
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}
