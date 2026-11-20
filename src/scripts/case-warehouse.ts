// Warehouse case study · Screens: the tabs cycle every 4s while the section is in view.
// Loaded by src/components/case/warehouse/Screens.astro, on that page only.
//
// The tabs themselves (ARIA, keyboard, one panel at a time) belong to the shared
// components/case/Screens.astro; this file only asks it for the next tab through its
// `case:select` hook. With JavaScript off every panel is on the page and nothing cycles.
//
// The cycle runs only when all of these hold:
//   there is more than one tab, the section is on screen, the pointer is not over it, focus is
//   not inside it, the page is visible, the visitor has not picked a tab, and
//   prefers-reduced-motion is not set (then it never starts).
// A manual choice (click, tap or arrow keys on a tab) stops it for the rest of the visit.

const CYCLE_MS = 4000;
const REDUCED = '(prefers-reduced-motion: reduce)';

function initCycle(root: HTMLElement): void {
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-tab]'));
  if (tabs.length < 2) return;

  const reduced = window.matchMedia(REDUCED);
  let inView = false;
  let hovered = false;
  let focused = false;
  let chosen = false;
  let timer: number | undefined;

  const canRun = () => inView && !hovered && !focused && !chosen && !document.hidden && !reduced.matches;

  const stop = () => {
    window.clearTimeout(timer);
    timer = undefined;
  };
  const step = () => {
    timer = undefined;
    if (!canRun()) return;
    const index = tabs.findIndex((tab) => tab.dataset.tab === root.dataset.activeTab);
    root.dispatchEvent(new CustomEvent('case:select', { detail: { index: index + 1 } }));
    timer = window.setTimeout(step, CYCLE_MS);
  };
  /** Start or stop to match the conditions. A restart always waits a full interval. */
  const sync = () => {
    if (!canRun()) stop();
    else if (timer === undefined) timer = window.setTimeout(step, CYCLE_MS);
  };
  const choose = () => {
    chosen = true;
    stop();
  };

  for (const tab of tabs) {
    tab.addEventListener('click', choose);
    tab.addEventListener('keydown', (event) => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(event.key)) choose();
    });
  }
  root.addEventListener('pointerenter', (event) => {
    // A touch has no hover to end, so only a mouse or pen pauses by hovering.
    if (event.pointerType === 'touch') return;
    hovered = true;
    sync();
  });
  root.addEventListener('pointerleave', () => {
    hovered = false;
    sync();
  });
  root.addEventListener('focusin', () => {
    focused = true;
    sync();
  });
  root.addEventListener('focusout', (event) => {
    focused = root.contains(event.relatedTarget as Node | null);
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);

  new IntersectionObserver(
    (entries) => {
      inView = entries[entries.length - 1].isIntersecting;
      sync();
    },
    { threshold: 0.25 },
  ).observe(root);
}

document.querySelectorAll<HTMLElement>('[data-screens]').forEach(initCycle);
