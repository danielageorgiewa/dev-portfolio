// Before and after slider on the language school case study (Screens section).
// Loaded by src/components/case/school/Screens.astro, on that page only.
//
// The HTML already holds both screenshots, the labels and a real <input type="range">. An inline
// script next to the markup switches the CSS to the overlaid layout before first paint; this
// file makes it move:
//   - drag the handle (mouse, touch or pen), or drag anywhere on the frame;
//   - arrow keys, Home and End on the range input, which is what screen readers see;
//   - on first view the handle sweeps in from the right and stops in the middle. Any press
//     takes over at once, and nothing sweeps under prefers-reduced-motion.
// Both pages are children of one scrolling box, so a single scroll position moves both.
// One position, 0 to 100, is written to `--pos` on the slider: the share of the frame, from the
// left, that shows the old site.
import { lift, onEnter, placement, prefersReduced } from './motion/env';

const REST = 50;
const SWEEP_FROM = 100;
const SWEEP_MS = 1100;
/** A touch on the frame only becomes a drag after this much sideways travel (px). */
const TOUCH_SLOP = 8;

function initCompare(root: HTMLElement) {
  const range = root.querySelector<HTMLInputElement>('[data-compare-range]');
  const handle = root.querySelector<HTMLElement>('[data-compare-handle]');
  const scroller = root.querySelector<HTMLElement>('[data-compare-scroll]');
  if (!range || !handle || !scroller) return;
  const valueText = range.dataset.valueText ?? '';

  let frame = 0;
  const set = (value: number, fromInput = false) => {
    const pos = Math.min(100, Math.max(0, value));
    const n = Math.round(pos);
    root.style.setProperty('--pos', `${pos}%`);
    if (!fromInput) range.value = String(n);
    range.setAttribute('aria-valuetext', valueText.replace('{n}', String(n)).replace('{m}', String(100 - n)));
  };
  const stopSweep = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  // Keyboard and assistive technology: the range input does the work.
  range.addEventListener('input', () => {
    stopSweep();
    set(range.valueAsNumber, true);
  });

  // Pointer: one handler for mouse, touch and pen.
  const fromPointer = (event: PointerEvent) => {
    const box = root.getBoundingClientRect();
    return ((event.clientX - box.left) / box.width) * 100;
  };
  let dragId: number | null = null;
  let pending: { id: number; x: number } | null = null;
  const start = (event: PointerEvent) => {
    dragId = event.pointerId;
    pending = null;
    root.dataset.dragging = '';
    try {
      root.setPointerCapture(event.pointerId);
    } catch {
      // The pointer is already gone; the drag simply ends on the next pointerup.
    }
    range.focus({ preventScroll: true });
    set(fromPointer(event));
  };
  const end = (event: PointerEvent) => {
    if (pending?.id === event.pointerId) pending = null;
    if (dragId !== event.pointerId) return;
    dragId = null;
    delete root.dataset.dragging;
  };
  root.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    stopSweep();
    const onHandle = handle.contains(event.target as Node);
    if (event.pointerType === 'touch' && !onHandle) {
      // A finger on the frame may be scrolling the page: wait until it moves sideways.
      pending = { id: event.pointerId, x: event.clientX };
      return;
    }
    event.preventDefault();
    start(event);
  });
  root.addEventListener('pointermove', (event) => {
    if (dragId === event.pointerId) set(fromPointer(event));
    else if (pending?.id === event.pointerId && Math.abs(event.clientX - pending.x) > TOUCH_SLOP) start(event);
  });
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);

  // When a page is taller than the frame, the box scrolls on its own: keep smooth scrolling
  // off it and let the keyboard reach it.
  const syncScrollable = () => {
    const scrollable = scroller.scrollHeight > scroller.clientHeight + 1;
    scroller.toggleAttribute('data-lenis-prevent', scrollable);
    if (scrollable) scroller.tabIndex = 0;
    else scroller.removeAttribute('tabindex');
  };
  // Watch the frame and the pages inside it: either changing size can start or end scrolling.
  const sizes = new ResizeObserver(syncScrollable);
  sizes.observe(scroller);
  if (scroller.firstElementChild) sizes.observe(scroller.firstElementChild);
  syncScrollable();

  // First view: sweep in from the right. The inline script has already put the handle there.
  if (!prefersReduced() && placement(root) !== 'above') {
    set(SWEEP_FROM);
    onEnter(
      root,
      () => {
        const began = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - began) / SWEEP_MS);
          set(SWEEP_FROM + (REST - SWEEP_FROM) * lift(t));
          frame = t < 1 ? requestAnimationFrame(tick) : 0;
        };
        frame = requestAnimationFrame(tick);
      },
      '0px 0px -25% 0px',
    );
  } else {
    set(REST);
  }
  root.dataset.ready = '';
}

if (typeof document !== 'undefined') {
  document.querySelectorAll<HTMLElement>('[data-compare]').forEach(initCompare);
}
