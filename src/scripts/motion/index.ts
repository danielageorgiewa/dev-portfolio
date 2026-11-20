// Motion entry. Called once from scripts/main.ts.
//
// Two tiers:
//   1. This file and its static imports are the entry bundle: small, no libraries. It runs
//      the hero load sequence and the attribute utilities (data-reveal, data-reveal-group,
//      data-rise-lines, data-count, data-magnetic, data-autoplay-inview), the header reveal,
//      anchor scrolling and the hidden flag.
//   2. GSAP + ScrollTrigger (home page only) and Lenis are fetched after the first paint,
//      when the browser is idle.
//
// Everything decorative sits inside whenMotion(): it is skipped under prefers-reduced-motion
// and torn down / set up again if that setting, the breakpoint or the pointer type changes.
import { runAll, whenMotion, type Cleanup } from './env';
import { initAnchors } from './scroll';
import { initHeader } from './header';
import { initFlag } from './flag';
import { initAutoplay } from './autoplay';
import { heroIntro } from './intro';
import { initReveal } from './reveal';
import { initCount } from './count';
import { initMagnetic } from './magnetic';

const HOME_HOOKS =
  '[data-hero],[data-glow],[data-word-fill],[data-stack],[data-manifesto],[data-marquee],[data-toolbox-index],[data-ctf]';

/** Resolves once the page has loaded and the main thread is idle (or after 2.5s at the latest). */
function idle(): Promise<void> {
  return new Promise((resolve) => {
    const cap = window.setTimeout(resolve, 2500);
    const go = () => {
      const done = () => {
        clearTimeout(cap);
        resolve();
      };
      if ('requestIdleCallback' in window) requestIdleCallback(done, { timeout: 800 });
      else setTimeout(done, 120);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });
}

export function boot(): void {
  const root = document.documentElement;

  // Functional behaviour: always on.
  initHeader();
  initAnchors();
  initFlag();
  initAutoplay();

  // Tier 1.
  whenMotion((env) =>
    runAll([env.first ? heroIntro() : undefined, initReveal(env), initCount(env), initMagnetic(env)]),
  );
  // The start states are in place (or motion is off): lift the first-paint cover.
  root.classList.remove('js-intro');

  // Tier 2.
  const isHome = document.querySelector(HOME_HOOKS) !== null;
  const ready = idle();
  whenMotion((env) => {
    let cancelled = false;
    const cleanups: Cleanup[] = [];
    (async () => {
      await ready;
      if (cancelled) return;
      const [smoothModule, homeModule] = await Promise.all([
        env.hover ? import('./smooth') : null,
        isHome ? import('./home') : null,
      ]);
      if (cancelled) return;
      const smooth = smoothModule?.createSmooth();
      if (homeModule) cleanups.push(homeModule.init(env, smooth?.lenis));
      else if (smooth) cleanups.push(smooth.selfDrive());
      if (smooth) cleanups.push(smooth.destroy);
    })().catch((error) => console.error('[motion]', error));
    return () => {
      cancelled = true;
      runAll(cleanups)();
    };
  });
}
