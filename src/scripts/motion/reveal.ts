// data-reveal / data-reveal-group: fade up when the element enters the screen.
// data-rise-lines: each child is a line that rises from a mask, one after another.
// Attribute driven, no GSAP. See README.md in this folder.
import { DISTANCE, DUR, LIFT_CSS, STAGGER, mayHide, onEnter, type Cleanup, type MotionEnv } from './env';

const LINE_STAGGER = 0.12;

export function initReveal(env: MotionEnv): Cleanup {
  const cleanups: Cleanup[] = [];
  const canAnimate = typeof document.body.animate === 'function';

  const groups: { trigger: HTMLElement; targets: HTMLElement[]; stagger: number; distance: number }[] = [];
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal]')) {
    groups.push({ trigger: el, targets: [el], stagger: 0, distance: Number(el.dataset.reveal) || DISTANCE.small });
  }
  for (const el of document.querySelectorAll<HTMLElement>('[data-reveal-group]')) {
    groups.push({
      trigger: el,
      targets: Array.from(el.children) as HTMLElement[],
      stagger: Number(el.dataset.revealGroup) || STAGGER.items,
      distance: DISTANCE.small,
    });
  }

  for (const { trigger, targets, stagger, distance } of groups) {
    if (!canAnimate || !targets.length || !mayHide(trigger, env)) continue;
    const from = { opacity: '0', transform: `translateY(${distance}px)` };
    const clear = () => {
      for (const t of targets) {
        t.style.opacity = '';
        t.style.transform = '';
      }
    };
    for (const t of targets) Object.assign(t.style, from);
    const animations: Animation[] = [];
    const stop = onEnter(trigger, () => {
      targets.forEach((t, i) => {
        animations.push(
          t.animate([from, { opacity: 1, transform: 'none' }], {
            duration: DUR.reveal * 1000,
            delay: i * stagger * 1000,
            easing: LIFT_CSS,
            fill: 'backwards',
          }),
        );
      });
      clear();
    });
    cleanups.push(() => {
      stop();
      for (const a of animations) a.cancel();
      clear();
    });
  }

  for (const el of document.querySelectorAll<HTMLElement>('[data-rise-lines]')) {
    if (!canAnimate || !el.children.length || !mayHide(el, env)) continue;
    const lines = Array.from(el.children) as HTMLElement[];
    const inners = lines.map((line) => {
      const inner = document.createElement('span');
      inner.style.cssText = 'display:block;transform:translateY(125%)';
      inner.append(...line.childNodes);
      line.append(inner);
      line.style.clipPath = 'inset(-0.1em -0.5em -0.22em)';
      return inner;
    });
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      lines.forEach((line, i) => {
        line.append(...inners[i].childNodes);
        inners[i].remove();
        line.style.clipPath = '';
      });
    };
    const animations: Animation[] = [];
    const stop = onEnter(el, () => {
      inners.forEach((inner, i) => {
        animations.push(
          inner.animate([{ transform: 'translateY(125%)' }, { transform: 'none' }], {
            duration: DUR.reveal * 1000,
            delay: i * LINE_STAGGER * 1000,
            easing: LIFT_CSS,
            fill: 'backwards',
          }),
        );
        inner.style.transform = '';
      });
      Promise.all(animations.map((a) => a.finished)).then(restore, () => {});
    }, '0px 0px -15% 0px');
    cleanups.push(() => {
      stop();
      for (const a of animations) a.cancel();
      restore();
    });
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}
