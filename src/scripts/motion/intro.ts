// Hero load sequence (Home · Portrait / First name / Last name / Actions).
// Runs from the entry bundle with the Web Animations API, so it never waits for GSAP.
// The elements are covered by `html.js-intro` (styles/motion.css) from the first paint until
// this starts; every animation fills backwards, so nothing flashes and nothing stays hidden.
import { DISTANCE, DUR, LIFT_CSS, STAGGER, type Cleanup } from './env';
import { splitChars, type Split } from './split';

const LAST_NAME_DELAY = 0.15;
const ACTIONS_DELAY = 0.5;

export function heroIntro(): Cleanup | void {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  if (!hero || typeof hero.animate !== 'function') return;
  // Arrived part-way down the page (reload, back button, #hash): nothing to introduce.
  if (window.scrollY > hero.offsetHeight * 0.5) return;

  const animations: Animation[] = [];
  const undo: Cleanup[] = [];
  const ms = (s: number) => Math.round(s * 1000);

  // Names: letters rise from a mask, 0.03s apart; the last name starts 0.15s later.
  // Desktop only: on phones the name is the largest paint, so it shows straight away
  // (it is not covered in motion.css either) and only the portrait and buttons animate.
  const names: [string, number][] = window.matchMedia('(min-width: 768px)').matches
    ? [
        ['[data-hero-first]', 0],
        ['[data-hero-last]', LAST_NAME_DELAY],
      ]
    : [];
  for (const [selector, delay] of names) {
    const el = hero.querySelector<HTMLElement>(selector);
    if (!el) continue;
    const split: Split = splitChars(el);
    // The mask: room for italic overhang and descenders, nothing below that.
    el.style.clipPath = 'inset(-0.2em -0.4em -0.28em)';
    split.parts.forEach((letter, i) => {
      animations.push(
        letter.animate([{ transform: 'translateY(135%)' }, { transform: 'none' }], {
          duration: ms(DUR.reveal),
          delay: ms(delay + i * STAGGER.letters),
          easing: LIFT_CSS,
          fill: 'backwards',
        }),
      );
    });
    undo.push(() => {
      split.revert();
      el.style.clipPath = '';
    });
  }

  // Portrait: scales in from 0.9 while the ring draws around it, 0.9s.
  const portrait = hero.querySelector<HTMLElement>('[data-hero-portrait]');
  if (portrait) {
    animations.push(
      portrait.animate(
        [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, offset: 0.4 },
          { opacity: 1, transform: 'none' },
        ],
        { duration: ms(DUR.reveal), easing: LIFT_CSS, fill: 'backwards' },
      ),
    );
    const ring = drawRing(portrait, ms(DUR.reveal));
    if (ring) {
      animations.push(ring.animation);
      undo.push(ring.undo);
    }
  }

  // Actions: fade up 24px.
  const actions = hero.querySelector<HTMLElement>('[data-hero-actions]');
  if (actions) {
    animations.push(
      actions.animate(
        [
          { opacity: 0, transform: `translateY(${DISTANCE.reveal}px)` },
          { opacity: 1, transform: 'none' },
        ],
        { duration: ms(DUR.reveal), delay: ms(ACTIONS_DELAY), easing: LIFT_CSS, fill: 'backwards' },
      ),
    );
  }

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    for (const a of animations) a.cancel();
    for (const fn of undo) fn();
  };
  Promise.all(animations.map((a) => a.finished)).then(finish, finish);
  return finish;
}

/**
 * The ring is the first layer of the portrait's box-shadow. While it draws, that layer is made
 * transparent and an SVG circle of the same size and colour is stroked in its place.
 */
function drawRing(portrait: HTMLElement, duration: number): { animation: Animation; undo: Cleanup } | null {
  const layers = getComputedStyle(portrait).boxShadow.split(/,(?![^(]*\))/).map((s) => s.trim());
  const match = layers[0]?.match(/^(rgba?\([^)]*\)|#\w+|\w+) 0px 0px 0px ([\d.]+)px$/);
  if (!match) return null;
  const [, colour, widthPx] = match;
  const width = parseFloat(widthPx);
  const size = portrait.offsetWidth;
  if (!size || !width) return null;

  const box = size + width * 2;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${box} ${box}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = `position:absolute;left:${-width}px;top:${-width}px;width:${box}px;height:${box}px;transform:rotate(-90deg);pointer-events:none;overflow:visible`;
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', String(box / 2));
  circle.setAttribute('cy', String(box / 2));
  circle.setAttribute('r', String(size / 2 + width / 2));
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', colour);
  circle.setAttribute('stroke-width', String(width));
  circle.setAttribute('pathLength', '1');
  circle.setAttribute('stroke-dasharray', '1');
  svg.append(circle);

  const previous = { position: portrait.style.position, boxShadow: portrait.style.boxShadow };
  if (getComputedStyle(portrait).position === 'static') portrait.style.position = 'relative';
  portrait.style.boxShadow = [`0 0 0 ${width}px transparent`, ...layers.slice(1)].join(', ');
  portrait.append(svg);

  const animation = circle.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
    duration,
    easing: 'cubic-bezier(0.65,0,0.35,1)',
    fill: 'both',
  });
  return {
    animation,
    undo: () => {
      svg.remove();
      portrait.style.position = previous.position;
      portrait.style.boxShadow = previous.boxShadow;
    },
  };
}
