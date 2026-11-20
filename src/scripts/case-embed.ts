// Expandable frames around the embedded site screens on the case study pages.
// Loaded by src/components/case/EmbedFrame.astro, so only on pages that have a frame.
//
// The HTML and CSS already hold both sizes: an inline script next to each frame marks it
// `data-embed-state="collapsed"` before first paint, and the sizes follow from that attribute.
// This file adds the behaviour:
//   - the Expand / Shrink button (it is `hidden` in the HTML and only shown from here, so it is
//     never a dead control);
//   - the wheel rule. Collapsed, the inner page only scrolls after a click, a tap or focus
//     inside the frame (`data-embed-active`); until then the wheel and a swipe move the page.
//     Expanded, the inner page scrolls and hands over to the page at either end;
//   - the scroll cue: a thin progress bar on the right edge, shown only when there is
//     something to scroll;
//   - the scrolling box is a tab stop while it scrolls (arrows, PageUp / PageDown, Space);
//   - on expand and shrink the inner scroll position is kept in proportion and the frame is
//     kept in view.
// Every state change fires a bubbling `case:embed` event on the frame
// ({ detail: { state, active } }), for scripts like the warehouse tab cycle.
import { DESKTOP, prefersReduced } from './motion/env';
import { scrollToTarget } from './motion/scroll';

/** Longer than the CSS transition (0.26s). */
const SETTLE_MS = 320;

function initEmbed(root: HTMLElement) {
  const frame = root.querySelector<HTMLElement>('[data-embed-frame]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-embed-toggle]');
  const label = root.querySelector<HTMLElement>('[data-embed-label]');
  const bar = root.querySelector<HTMLElement>('[data-embed-bar]');
  const probe = root.querySelector<HTMLElement>('[data-embed-probe]');
  const scroller = root.querySelector<HTMLElement>('[data-embed-scroll]');
  const thumb = bar?.firstElementChild as HTMLElement | null;
  if (!frame || !toggle || !label || !bar || !probe || !scroller || !thumb) return;

  const desktop = window.matchMedia(DESKTOP);
  const expanded = () => root.dataset.embedState === 'expanded';
  const active = () => 'embedActive' in root.dataset;
  const max = () => scroller.scrollHeight - scroller.clientHeight;

  /** Share of the inner page scrolled, 0 to 1. Frozen while the frame changes size. */
  let ratio = 0;
  let frozenUntil = 0;
  const frozen = () => performance.now() < frozenUntil;

  const drawBar = () => {
    const track = bar.clientHeight;
    const size = Math.max(16, (scroller.clientHeight / scroller.scrollHeight) * track);
    thumb.style.height = `${size}px`;
    thumb.style.transform = `translateY(${ratio * (track - size)}px)`;
  };

  /** Bring the attributes, the tab stop, the cue and the button in line with what is on screen. */
  const sync = () => {
    const scrollable = max() > 1;
    root.toggleAttribute('data-embed-scrollable', scrollable);
    // Smooth scrolling keeps off the frame only while the inner page takes the wheel.
    root.toggleAttribute('data-lenis-prevent', scrollable && (expanded() || active()));
    if (scrollable) scroller.tabIndex = 0;
    else scroller.removeAttribute('tabindex');
    bar.hidden = !scrollable;
    if (scrollable) drawBar();
    // On a phone a capture that already fits the collapsed frame has nothing to expand to.
    toggle.hidden = !(expanded() || desktop.matches || probe.offsetHeight > frame.offsetHeight + 1);
  };
  const emit = () =>
    root.dispatchEvent(
      new CustomEvent('case:embed', { bubbles: true, detail: { state: root.dataset.embedState, active: active() } }),
    );

  scroller.addEventListener(
    'scroll',
    () => {
      if (!frozen()) ratio = max() > 0 ? Math.min(1, scroller.scrollTop / max()) : 0;
      if (!bar.hidden) drawBar();
    },
    { passive: true },
  );
  // The frame or the page inside it changed size: keep the same place on the inner page.
  const sizes = new ResizeObserver(() => {
    if (frozen() && max() > 0) scroller.scrollTop = ratio * max();
    sync();
  });
  sizes.observe(scroller);
  if (scroller.firstElementChild) sizes.observe(scroller.firstElementChild);

  // Interaction: a click or tap inside, or focus, lets the inner page scroll while collapsed.
  const setActive = (on: boolean) => {
    if (on === active()) return;
    root.toggleAttribute('data-embed-active', on);
    sync();
    emit();
  };
  const inFrame = (target: EventTarget | null) => target instanceof Node && frame.contains(target);
  root.addEventListener('click', (event) => inFrame(event.target) && setActive(true));
  root.addEventListener('focusin', (event) => inFrame(event.target) && setActive(true));
  document.addEventListener('pointerdown', (event) => {
    if (!(event.target instanceof Node && root.contains(event.target))) setActive(false);
  });
  document.addEventListener('focusin', (event) => {
    if (!(event.target instanceof Node && root.contains(event.target))) setActive(false);
  });
  new IntersectionObserver((entries) => {
    if (!entries[entries.length - 1].isIntersecting) setActive(false);
  }).observe(root);

  toggle.addEventListener('click', () => {
    const to = expanded() ? 'collapsed' : 'expanded';
    frozenUntil = performance.now() + SETTLE_MS + 80;
    root.dataset.embedState = to;
    toggle.setAttribute('aria-expanded', String(to === 'expanded'));
    label.textContent = (to === 'expanded' ? toggle.dataset.shrink : toggle.dataset.expand) ?? '';
    sync();
    emit();
    const settle = () => {
      if (max() > 0) scroller.scrollTop = ratio * max();
      sync();
      // The frame grows and shrinks downwards, so its top normally stays where it was. If it
      // ended up under the header or off screen, bring it back.
      const top = root.getBoundingClientRect().top;
      const header = document.querySelector<HTMLElement>('[data-site-header]')?.offsetHeight ?? 0;
      if (top < header - 1 || top > window.innerHeight - 120) scrollToTarget(root, { focus: false });
    };
    if (prefersReduced()) settle();
    else window.setTimeout(settle, SETTLE_MS);
  });
  desktop.addEventListener('change', sync);

  root.dataset.embedReady = '';
  sync();
}

if (typeof document !== 'undefined') {
  document.querySelectorAll<HTMLElement>('[data-embed]').forEach(initEmbed);
}
