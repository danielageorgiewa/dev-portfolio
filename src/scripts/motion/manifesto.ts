// Home · Manifesto (Figma 148:15 annotation).
// The ruler ticks slide in from the left as the band arrives. Then, pinned for about 120% of
// the viewport and scrubbed by scroll: the letters of the big word start scattered (±40px,
// ±6°, 6px blur) and snap into place one by one with a small overshoot; the selection box
// draws around the word, the handles pop in, the size label counts up and the baseline draws
// across; the line below reveals word by word and its accent fades to red.
// Phone: no pin and no blur. The same sequence plays once when the band comes into view.
import gsap from 'gsap';
import { inOut, lift, type Cleanup, type MotionEnv } from './env';
import { splitChars, splitWords } from './split';

const PIN_LENGTH = 0.6; // of the viewport height

/** Deterministic scatter, so a refresh or resize never reshuffles the letters. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

export function manifesto(env: MotionEnv): Cleanup | void {
  const root = document.querySelector<HTMLElement>('[data-manifesto]');
  const wordText = root?.querySelector<HTMLElement>('[data-word-text]');
  if (!root || !wordText) return;
  const restore: Cleanup[] = [];

  // Ruler: ticks slide in from the left when the band arrives (not scrubbed).
  const ruler = root.querySelector<HTMLElement>('[data-ruler]');
  if (ruler) {
    const [rule, ...ticks] = Array.from(ruler.children);
    const scrollTrigger = { trigger: root, start: 'top 72%', once: true };
    gsap.from(rule, { scaleX: 0, transformOrigin: '0 50%', duration: 1.1, ease: inOut, scrollTrigger });
    gsap.from(ticks, { x: -28, opacity: 0, duration: 0.6, ease: lift, stagger: { amount: 0.9 }, scrollTrigger });
  }

  // Letters. The full stop is its own span in the markup and lands last.
  const dot = wordText.nextElementSibling as HTMLElement | null;
  const fontSize = parseFloat(getComputedStyle(wordText).fontSize) || 16;
  const dotLeft = dot?.getBoundingClientRect().left ?? 0;
  const split = splitChars(wordText);
  restore.push(split.revert);
  const letters = [...split.parts];
  if (dot) {
    dot.style.display = 'inline-block';
    const shift = dotLeft - dot.getBoundingClientRect().left;
    if (Math.abs(shift) > 0.01) dot.style.marginLeft = `${(shift / fontSize).toFixed(4)}em`;
    letters.push(dot);
    restore.push(() => {
      dot.style.display = '';
      dot.style.marginLeft = '';
    });
  }

  const random = seeded(148);
  const spread = (max: number) => (random() * 2 - 1) * max;
  const reach = env.desktop ? 40 : 14;
  const scatter = letters.map(() => ({ x: spread(reach), y: spread(reach), rotation: spread(6) }));

  const tl = gsap.timeline({
    defaults: { ease: lift },
    scrollTrigger: env.desktop
      ? {
          trigger: root,
          start: 'center center',
          end: () => `+=${Math.round(window.innerHeight * PIN_LENGTH)}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      : { trigger: root, start: 'top 60%', once: true },
  });

  tl.fromTo(
    letters,
    {
      x: (i: number) => scatter[i].x,
      y: (i: number) => scatter[i].y,
      rotation: (i: number) => scatter[i].rotation,
      opacity: 0,
    },
    {
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 1,
      duration: 0.5,
      ease: 'back.out(1.8)',
      stagger: 0.12,
    },
  );

  // Selection box draws from its top-left corner, like dragging a frame around the word.
  const selection = root.querySelector<HTMLElement>('[data-selection]');
  if (selection) {
    tl.fromTo(
      selection,
      { clipPath: 'inset(-6% 106% 106% -6%)' },
      { clipPath: 'inset(-6% -6% -6% -6%)', duration: 0.6, ease: inOut },
      '>-0.05',
    );
    if (selection.children.length) {
      tl.fromTo(
        selection.children,
        { scale: 0 },
        { scale: 1, duration: 0.3, ease: 'back.out(2.5)', stagger: 0.03 },
        '>-0.1',
      );
    }
  }

  // Size label counts up to its final value ("1323 × 238").
  for (const label of root.querySelectorAll<HTMLElement>('[data-size-label], [data-size-label-phone]')) {
    const text = label.textContent ?? '';
    const state = { p: 0 };
    const write = () => {
      label.textContent = text.replace(/\d+/g, (n) => String(Math.round(Number(n) * state.p)));
    };
    tl.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 'label');
    tl.fromTo(state, { p: 0 }, { p: 1, duration: 0.6, ease: 'power2.out', onUpdate: write }, 'label');
    restore.push(() => {
      label.textContent = text;
    });
  }

  // Baseline draws across; the "0 px off" note arrives with it.
  const baseline = root.querySelector<HTMLElement>('[data-baseline]');
  if (baseline) {
    tl.fromTo(baseline, { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.7, ease: inOut }, 'label+=0.3');
  }
  const off = root.querySelector<HTMLElement>('[data-off-label]');
  if (off) tl.fromTo(off, { opacity: 0 }, { opacity: 1, duration: 0.3 }, '>-0.2');

  // The line below reveals word by word, then its accent fades to red.
  const line = root.querySelector<HTMLElement>('[data-manifesto-line]');
  if (line) {
    const accent = line.querySelector<HTMLElement>('em');
    const base = getComputedStyle(line).color;
    const red = accent ? getComputedStyle(accent).color : base;
    const words = splitWords(line);
    restore.push(words.revert);
    tl.fromTo(words.parts, { opacity: 0 }, { opacity: 1, duration: 0.4, stagger: 0.12 }, '>');
    if (accent) tl.fromTo(accent, { color: base }, { color: red, duration: 0.5, ease: 'none' }, '>-0.1');
  }

  // A short hold at the end of the pin, so the finished composition can be read.
  tl.to({}, { duration: 0.5 });

  return () => {
    for (const fn of restore) fn();
  };
}
