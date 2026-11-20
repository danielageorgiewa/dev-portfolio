// Everything on the home page that needs GSAP + ScrollTrigger. This file and its imports are
// one lazy chunk, fetched after the first paint (see index.ts). Each effect lives in its own
// module, creates its tweens inside the shared gsap.context and returns a function that
// undoes any DOM changes it made itself.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { runAll, type Cleanup, type MotionEnv } from './env';
import { hashTarget, scrollToTarget } from './scroll';
import { heroScroll } from './hero';
import { glow } from './glow';
import { wordFill } from './word-fill';
import { stack } from './stack';
import { manifesto } from './manifesto';
import { marquee } from './marquee';
import { toolbox } from './toolbox';
import { ctf } from './ctf';

gsap.registerPlugin(ScrollTrigger);

export function init(env: MotionEnv, lenis?: Lenis): Cleanup {
  const cleanups: (Cleanup | void)[] = [];

  // Lenis runs on GSAP's ticker so pins and scrubs read the same scroll position each frame.
  if (lenis) {
    const tick = (time: number) => lenis.raf(time * 1000);
    const off = lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    cleanups.push(() => {
      gsap.ticker.remove(tick);
      off();
    });
  }

  const ctx = gsap.context(() => {
    for (const effect of [heroScroll, glow, wordFill, stack, manifesto, marquee, toolbox, ctf]) {
      cleanups.push(effect(env));
    }
  });

  // Fonts and late images move things: measure again once they are in.
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  if (document.readyState !== 'complete') window.addEventListener('load', refresh, { once: true });

  // The manifesto pin adds scroll length above later sections; re-align a #hash arrival.
  if (env.first && location.hash) {
    const target = hashTarget(location.hash);
    if (target) {
      ScrollTrigger.refresh();
      scrollToTarget(target, { instant: true, focus: false });
    }
  }

  return () => {
    window.removeEventListener('load', refresh);
    ctx.revert();
    runAll(cleanups)();
  };
}
