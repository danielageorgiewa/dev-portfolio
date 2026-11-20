// Home · Portrait and Last name, scroll part: the portrait drifts up slower than the page
// and the last name slides right as the hero scrolls away. (The load part is intro.ts.)
import gsap from 'gsap';
import type { MotionEnv } from './env';

export function heroScroll(env: MotionEnv): void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero) return;
  const scrollTrigger = () => ({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true });

  const portrait = hero.querySelector('[data-hero-portrait]');
  if (portrait) gsap.to(portrait, { y: env.desktop ? 72 : 32, ease: 'none', scrollTrigger: scrollTrigger() });

  const last = hero.querySelector('[data-hero-last]');
  if (last) gsap.to(last, { x: env.desktop ? 40 : 16, ease: 'none', scrollTrigger: scrollTrigger() });
}
