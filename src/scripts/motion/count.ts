// data-count: counts a number up (or down) when the element enters the screen, 1.2s, ease lift.
//   "31 → 100"  the last number counts from the first one (31 → 31 … 31 → 100)
//   "9 → 1"     same, downwards
//   "2.9 s"     counts from 0 with the same decimals; "2,9 с" keeps the comma
//   "5"         counts from 0
// The final number stays in the flow (transparent) and keeps its width; the counting number
// is laid over it, so nothing around it moves. The element must hold plain text only.
// Give the element `font-variant-numeric: tabular-nums` in CSS for the steadiest digits.
import { DUR, lift, mayHide, onEnter, type Cleanup, type MotionEnv } from './env';

const NUMBER = /\d+(?:[.,]\d+)?/g;

interface Parsed {
  before: string;
  token: string;
  after: string;
  from: number;
  to: number;
  decimals: number;
  comma: boolean;
}

export function parseCount(text: string): Parsed | null {
  const matches = Array.from(text.matchAll(NUMBER));
  if (!matches.length) return null;
  const toNumber = (s: string) => Number(s.replace(',', '.'));
  const range = matches.length > 1 && /→|->/.test(text);
  const target = range ? matches[matches.length - 1] : matches[0];
  const token = target[0];
  const index = target.index ?? 0;
  const fraction = token.split(/[.,]/)[1];
  return {
    before: text.slice(0, index),
    token,
    after: text.slice(index + token.length),
    from: range ? toNumber(matches[0][0]) : 0,
    to: toNumber(token),
    decimals: fraction ? fraction.length : 0,
    comma: token.includes(','),
  };
}

const format = (value: number, p: Parsed) => {
  const s = value.toFixed(p.decimals);
  return p.comma ? s.replace('.', ',') : s;
};

export function initCount(env: MotionEnv): Cleanup {
  const cleanups: Cleanup[] = [];

  for (const el of document.querySelectorAll<HTMLElement>('[data-count]')) {
    if (el.children.length || !mayHide(el, env)) continue;
    const original = el.textContent ?? '';
    const parsed = parseCount(original);
    if (!parsed || parsed.from === parsed.to) continue;

    // A leading number followed by a unit grows to the left of the unit; otherwise to the right.
    const alignEnd = parsed.before.trim() === '' && parsed.after.trim() !== '';
    const box = document.createElement('span');
    box.style.cssText = 'position:relative;display:inline-block;white-space:nowrap';
    const final = document.createElement('span');
    final.style.opacity = '0';
    final.textContent = parsed.token;
    const live = document.createElement('span');
    live.setAttribute('aria-hidden', 'true');
    live.style.cssText = `position:absolute;top:0;${alignEnd ? 'right' : 'left'}:0`;
    live.textContent = format(parsed.from, parsed);
    box.append(final, live);
    el.replaceChildren(parsed.before, box, parsed.after);

    let frame = 0;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      cancelAnimationFrame(frame);
      el.textContent = original;
    };
    const stop = onEnter(el, () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / (DUR.count * 1000));
        live.textContent = format(parsed.from + (parsed.to - parsed.from) * lift(t), parsed);
        if (t < 1) frame = requestAnimationFrame(tick);
        else restore();
      };
      frame = requestAnimationFrame(tick);
    }, '0px 0px -12% 0px');
    cleanups.push(() => {
      stop();
      restore();
    });
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}
