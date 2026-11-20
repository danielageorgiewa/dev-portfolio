// Shared motion tokens (Figma "Motion" page, node 30:11) and small helpers.
// Nothing here imports GSAP or Lenis, so it is safe in the entry bundle.

export const REDUCED = '(prefers-reduced-motion: reduce)';
export const DESKTOP = '(min-width: 768px)';
export const HOVER = '(hover: hover) and (pointer: fine)';

/** Seconds. */
export const DUR = { micro: 0.22, reveal: 0.9, hero: 1.4, count: 1.2 } as const;
export const STAGGER = { letters: 0.03, items: 0.06 } as const;
export const DISTANCE = { reveal: 24, small: 16 } as const;

/** ease/lift and ease/in-out from the Motion page. */
const LIFT_POINTS = [0.22, 0.61, 0.36, 1] as const;
const IN_OUT_POINTS = [0.65, 0, 0.35, 1] as const;
export const LIFT_CSS = `cubic-bezier(${LIFT_POINTS.join(',')})`;

/** A cubic-bezier easing as a function of t in [0, 1]. Usable as a GSAP ease. */
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (sampleX(t) - x) / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}
export const lift = bezier(...LIFT_POINTS);
export const inOut = bezier(...IN_OUT_POINTS);

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export const prefersReduced = () => window.matchMedia(REDUCED).matches;

export type Cleanup = () => void;
export interface MotionEnv {
  /** Viewport is 768px or wider. */
  desktop: boolean;
  /** A real hovering pointer (mouse / trackpad). False on touch devices. */
  hover: boolean;
  /** True only for the very first run after page load. */
  first: boolean;
}

/**
 * Runs `setup` while motion is allowed and re-runs it when the reduced-motion setting, the
 * phone / desktop breakpoint or the pointer type changes. The function `setup` returns is
 * called first, and it must put everything back in its final, static state.
 */
export function whenMotion(setup: (env: MotionEnv) => Cleanup | void): void {
  const [reduced, desktop, hover] = [REDUCED, DESKTOP, HOVER].map((q) => window.matchMedia(q));
  let cleanup: Cleanup | void;
  let first = true;
  const apply = () => {
    if (cleanup) cleanup();
    cleanup = undefined;
    if (!reduced.matches) cleanup = setup({ desktop: desktop.matches, hover: hover.matches, first });
    first = false;
  };
  for (const q of [reduced, desktop, hover]) q.addEventListener('change', apply);
  apply();
}

/** Calls `cb` once, the first time `el` enters the viewport. Returns a function that stops watching. */
export function onEnter(el: Element, cb: () => void, rootMargin = '0px 0px -8% 0px'): Cleanup {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Where an element is when a module starts: 'above' (already scrolled past), 'in' (on screen)
 * or 'below'. One-shot effects only take a "from" state when this allows it without a flash.
 */
export function placement(el: Element): 'above' | 'in' | 'below' {
  const r = el.getBoundingClientRect();
  if (r.bottom <= 0) return 'above';
  return r.top < window.innerHeight ? 'in' : 'below';
}

/** One-shot effects may start hidden when below the fold, or on screen during the first run. */
export const mayHide = (el: Element, env: MotionEnv) => {
  const p = placement(el);
  return p === 'below' || (p === 'in' && env.first);
};

export const runAll = (fns: (Cleanup | void)[]): Cleanup => () => {
  for (const fn of fns) if (fn) fn();
};
