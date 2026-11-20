// Home · Statement: word fill on scroll. Every word starts faint and goes to ink as the
// paragraph passes the middle of the screen. Only opacity is animated: the words take the
// ink colour and a faint opacity, which reads the same as the faint colour in the design.
import gsap from 'gsap';
import type { Cleanup } from './env';
import { splitWords } from './split';

const FAINT = 0.36;

export function wordFill(): Cleanup | void {
  const el = document.querySelector<HTMLElement>('[data-word-fill]');
  if (!el) return;
  const split = splitWords(el);
  if (!split.parts.length) return split.revert;
  // The second half is faint by colour in the static design; while scrubbing, opacity does that job.
  const tinted = Array.from(el.children) as HTMLElement[];
  for (const child of tinted) child.style.color = 'inherit';

  gsap.fromTo(
    split.parts,
    { opacity: FAINT },
    {
      opacity: 1,
      ease: 'none',
      duration: 1,
      stagger: 0.35,
      scrollTrigger: { trigger: el, start: 'top 72%', end: 'bottom 46%', scrub: true },
    },
  );

  return () => {
    for (const child of tinted) child.style.color = '';
    split.revert();
  };
}
