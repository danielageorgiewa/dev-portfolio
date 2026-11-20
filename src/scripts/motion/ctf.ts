// Home · CTF flag: scroll-scrubbed typing. While the block crosses the screen, scroll
// progress maps to how many characters are shown (about one per 30px, less on short screens
// so the flag always finishes on screen). The prompt line types first; scrolling back deletes.
// When the flag is complete the cursor blinks and the hint fades in (styles/motion.css,
// driven by data-ctf-state). Without JavaScript the full flag is simply there.
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './env';

const PX_PER_CHAR = 30;
const PROMPT_WEIGHT = 0.3; // a prompt character takes 30% of a flag character's scroll
const START = 0.92; // the flag line starts typing when its top is at 92% of the viewport
const STOP = 0.36; // and is finished by the time its top reaches 36% of the viewport

function toChars(el: HTMLElement): HTMLElement[] {
  return Array.from(el.textContent ?? '').map((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    if (ch === ' ') span.style.whiteSpace = 'pre';
    return span;
  });
}

export function ctf(): Cleanup | void {
  const root = document.querySelector<HTMLElement>('[data-ctf]');
  const flag = root?.querySelector<HTMLElement>('[data-ctf-flag]');
  if (!root || !flag) return;
  const prompt = root.querySelector<HTMLElement>('[data-ctf-prompt]');
  const line = flag.parentElement ?? flag;

  const restore: Cleanup[] = [];
  /**
   * Replaces the text of `el` (or of each child span, when it has them) with per-character
   * spans. The full text stays available to screen readers in a visually hidden span.
   */
  const prepare = (el: HTMLElement): HTMLElement[] => {
    const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
    restore.push(() => el.replaceChildren(...original));
    const text = el.textContent;
    if (!el.children.length) {
      const holder = document.createElement('span');
      holder.textContent = text;
      el.replaceChildren(holder);
    }
    const chars: HTMLElement[] = [];
    for (const leaf of Array.from(el.children) as HTMLElement[]) {
      const spans = toChars(leaf);
      chars.push(...spans);
      leaf.replaceChildren(...spans);
      leaf.setAttribute('aria-hidden', 'true');
    }
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;
    // A zero-width space keeps the line box (and so the layout) when no character is shown.
    el.prepend(sr, '\u200B');
    return chars;
  };

  const promptChars = prompt ? prepare(prompt) : [];
  const flagChars = prepare(flag);

  const total = promptChars.length * PROMPT_WEIGHT + flagChars.length;
  let shownPrompt = -1;
  let shownFlag = -1;
  const render = (progress: number) => {
    const units = progress >= 1 ? total : progress * total;
    const p = Math.min(promptChars.length, Math.floor(units / PROMPT_WEIGHT + 1e-6));
    const f = progress >= 1 ? flagChars.length : Math.max(0, Math.floor(units - promptChars.length * PROMPT_WEIGHT + 1e-6));
    if (p !== shownPrompt) {
      // Prompt characters keep their space, so the prompt never reflows.
      promptChars.forEach((c, i) => (c.style.visibility = i < p ? '' : 'hidden'));
      shownPrompt = p;
    }
    if (f !== shownFlag) {
      // Flag characters collapse, so the cursor sits right after the last typed one.
      flagChars.forEach((c, i) => (c.style.display = i < f ? '' : 'none'));
      shownFlag = f;
    }
    root.dataset.ctfState = f >= flagChars.length ? 'done' : 'typing';
  };

  const trigger = ScrollTrigger.create({
    trigger: line,
    start: () => `top ${START * 100}%`,
    end: () => {
      const room = window.innerHeight * (START - STOP);
      return `+=${Math.round(Math.max(160, Math.min(total * PX_PER_CHAR, room)))}`;
    },
    onUpdate: (self) => render(self.progress),
    onRefresh: (self) => render(self.progress),
  });
  render(trigger.progress);

  return () => {
    trigger.kill();
    delete root.dataset.ctfState;
    for (const fn of restore) fn();
  };
}
