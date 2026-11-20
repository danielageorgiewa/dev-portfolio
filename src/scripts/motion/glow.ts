// Home · Blush glow: follows the cursor slowly. Static on touch devices.
import gsap from 'gsap';
import type { Cleanup, MotionEnv } from './env';

const FOLLOW = 0.35;
const MAX_X = 260;
const MAX_Y = 160;

export function glow(env: MotionEnv): Cleanup | void {
  if (!env.hover) return;
  const glows = Array.from(document.querySelectorAll<HTMLElement>('[data-glow]'));
  if (!glows.length) return;

  const items = glows.map((el) => {
    // The glow is centred in CSS with translateX(-50%); hand that to GSAP as xPercent.
    gsap.set(el, { xPercent: -50, x: 0, y: 0 });
    return {
      el,
      host: el.parentElement as HTMLElement,
      active: false,
      xTo: gsap.quickTo(el, 'x', { duration: 1.8, ease: 'power3.out' }),
      yTo: gsap.quickTo(el, 'y', { duration: 1.8, ease: 'power3.out' }),
    };
  });

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const item = items.find((i) => i.host === entry.target);
      if (item) item.active = entry.isIntersecting;
    }
  });
  for (const item of items) io.observe(item.host);

  const limit = (n: number, max: number) => Math.max(-max, Math.min(max, n));
  const move = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    for (const item of items) {
      if (!item.active) continue;
      const host = item.host.getBoundingClientRect();
      const restX = host.left + item.el.offsetLeft;
      const restY = host.top + item.el.offsetTop + item.el.offsetHeight / 2;
      item.xTo(limit((event.clientX - restX) * FOLLOW, MAX_X));
      item.yTo(limit((event.clientY - restY) * FOLLOW, MAX_Y));
    }
  };
  window.addEventListener('pointermove', move, { passive: true });

  return () => {
    window.removeEventListener('pointermove', move);
    io.disconnect();
  };
}
