// Home · Project cards: stacking cards.
// Each card sticks 80px from the top (position: sticky, so there are no pin spacers and no
// layout change) and the next one slides over it. The covered card scales to 0.94 and
// darkens; the screenshot drifts up inside its card. The last card has nothing after it in
// the list, so it never sticks and leaves with the section.
// Desktop only: on phone the cards are taller than the screen and simply scroll.
// Numbers are counted by count.ts (data-count).
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { clamp01, type Cleanup, type MotionEnv } from './env';

const PIN_TOP = 80;
const BOTTOM_ROOM = 24;
const COVERED_SCALE = 0.94;
const COVERED_SHADE = 0.42;
const DRIFT = 28;

export function stack(env: MotionEnv): Cleanup | void {
  const list = document.querySelector<HTMLElement>('[data-stack]');
  if (!list || !env.desktop) return;
  const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-stack-card]'));
  if (cards.length < 2) return;

  const shots = cards.map((card) => card.querySelector<HTMLElement>('[data-shot]'));
  const shades = cards.map((card, i) => {
    if (i === cards.length - 1) return null;
    const shade = document.createElement('span');
    shade.setAttribute('aria-hidden', 'true');
    shade.style.cssText =
      'position:absolute;inset:0;background:var(--text-ink);opacity:0;pointer-events:none;border-radius:inherit';
    card.append(shade);
    return shade;
  });

  // Natural (unstuck) layout, measured from sizes only: sticky and scale do not change these.
  let naturalTop: number[] = [];
  let height: number[] = [];
  let stickTop: number[] = [];
  let gap = 0;
  const measure = () => {
    gap = parseFloat(getComputedStyle(list).rowGap) || 0;
    let y = 0;
    naturalTop = [];
    height = cards.map((card) => card.offsetHeight);
    stickTop = [];
    cards.forEach((card, i) => {
      naturalTop.push(y);
      y += height[i] + gap;
      // A card taller than the screen sticks higher, so its bottom edge stays reachable.
      stickTop.push(Math.min(PIN_TOP, window.innerHeight - height[i] - BOTTOM_ROOM));
      card.style.position = 'sticky';
      card.style.top = `${stickTop[i]}px`;
      card.style.transformOrigin = '50% 0';
      card.style.willChange = 'transform';
    });
  };

  const update = () => {
    const viewport = window.innerHeight;
    const listTop = list.getBoundingClientRect().top;
    cards.forEach((card, i) => {
      const top = listTop + naturalTop[i];
      const shot = shots[i];
      if (shot) {
        // +DRIFT as the card enters, 0 where it sticks, -DRIFT once it is being covered.
        const travel = Math.max(1, viewport - stickTop[i]);
        const drift = Math.max(-1, Math.min(1, (top - stickTop[i]) / travel)) * DRIFT;
        shot.style.transform = `translate3d(0,${drift.toFixed(2)}px,0)`;
      }
      const shade = shades[i];
      if (!shade) return;
      const nextTop = listTop + naturalTop[i + 1];
      const from = stickTop[i] + height[i] + gap;
      const to = stickTop[i + 1];
      const covered = clamp01((from - nextTop) / Math.max(1, from - to));
      card.style.transform = covered ? `scale(${(1 - (1 - COVERED_SCALE) * covered).toFixed(4)})` : '';
      shade.style.opacity = (covered * COVERED_SHADE).toFixed(3);
    });
  };

  measure();
  update();
  const trigger = ScrollTrigger.create({
    trigger: list,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: update,
    onToggle: update,
    onRefresh: () => {
      measure();
      update();
    },
  });
  const resize = new ResizeObserver(() => {
    measure();
    update();
  });
  for (const card of cards) resize.observe(card);

  return () => {
    resize.disconnect();
    trigger.kill();
    cards.forEach((card, i) => {
      card.style.position = '';
      card.style.top = '';
      card.style.transform = '';
      card.style.transformOrigin = '';
      shades[i]?.remove();
      const shot = shots[i];
      if (shot) shot.style.transform = '';
    });
  };
}
