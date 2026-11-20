// In-page navigation: anchor links scroll to their section below the sticky header.
// Uses Lenis when it is running, the browser's own smooth scrolling otherwise, and an instant
// jump under prefers-reduced-motion. Without JavaScript the links are plain hash links and
// `scroll-padding-top` in base.css does the offset.
import { prefersReduced } from './env';

interface Scroller {
  scrollTo(target: number, options?: { immediate?: boolean }): void;
  /** Re-measures the page; Lenis clamps to the scroll length it last measured. */
  resize(): void;
}
let scroller: Scroller | null = null;
/** Called by smooth.ts when Lenis starts or stops. */
export const setScroller = (s: Scroller | null) => {
  scroller = s;
};

const headerOffset = () => document.querySelector<HTMLElement>('[data-site-header]')?.offsetHeight ?? 0;

export function scrollToTarget(target: HTMLElement, { instant = false, focus = true } = {}): void {
  const top = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - headerOffset()));
  const jump = instant || prefersReduced();
  scroller?.resize();
  if (scroller && !jump) scroller.scrollTo(top);
  else if (scroller) scroller.scrollTo(top, { immediate: true });
  else window.scrollTo({ top, behavior: jump ? 'auto' : 'smooth' });

  if (focus) {
    // Move keyboard and screen reader focus with the scroll.
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.setAttribute('data-scroll-target', '');
    }
    target.focus({ preventScroll: true });
  }
}

const samePage = (url: URL) =>
  url.origin === location.origin && url.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');

export const hashTarget = (hash: string): HTMLElement | null => {
  if (hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

/** Scrolls to `#id` on this page, or opens `href` if the section lives on another page. */
export function goTo(href: string): void {
  const url = new URL(href, location.href);
  const target = samePage(url) ? hashTarget(url.hash) : null;
  if (!target) {
    location.assign(url.href);
    return;
  }
  if (url.hash !== location.hash) history.pushState(null, '', url.hash);
  scrollToTarget(target);
}

export function initAnchors(): void {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (!samePage(url)) return;
    const target = hashTarget(url.hash);
    if (!target) return;
    event.preventDefault();
    if (url.hash !== location.hash) history.pushState(null, '', url.hash);
    scrollToTarget(target);
  });

  // Back / forward between hashes on the same page.
  window.addEventListener('popstate', () => {
    const target = hashTarget(location.hash);
    if (target) scrollToTarget(target, { focus: false });
  });
}
