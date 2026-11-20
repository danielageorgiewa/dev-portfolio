// Home · Toolbox index: rows slide up 24px one after another; chips pop in 0.03s apart.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DISTANCE, DUR, STAGGER, lift, placement, type MotionEnv } from './env';

const ROW_STAGGER = 0.09;

export function toolbox(env: MotionEnv): void {
  const index = document.querySelector<HTMLElement>('[data-toolbox-index]');
  if (!index) return;
  // Only rows still below the fold take a hidden start; anything on screen stays as it is.
  const rows = (Array.from(index.children) as HTMLElement[]).filter((row) => placement(row) === 'below');
  if (!rows.length) return;
  const chipsOf = (row: HTMLElement) => row.querySelectorAll('ul > *');
  const distance = env.desktop ? DISTANCE.reveal : DISTANCE.small;

  for (const row of rows) {
    gsap.set(row, { y: distance, opacity: 0 });
    gsap.set(chipsOf(row), { scale: 0.86, opacity: 0 });
  }
  ScrollTrigger.batch(rows, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      batch.forEach((row, i) => {
        const delay = i * ROW_STAGGER;
        gsap.to(row, { y: 0, opacity: 1, duration: DUR.reveal, ease: lift, delay, clearProps: 'transform,opacity' });
        gsap.to(chipsOf(row as HTMLElement), {
          scale: 1,
          opacity: 1,
          duration: 0.45,
          ease: 'back.out(2.2)',
          stagger: STAGGER.letters,
          delay: delay + 0.18,
          clearProps: 'transform,opacity',
        });
      });
    },
  });
}
