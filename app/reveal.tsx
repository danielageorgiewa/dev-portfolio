'use client';

/**
 * The reveal observer — design/Portfolio Atelier.dc.html lines 505–511,
 * design/Portfolio Atelier Mobile.dc.html lines 507–515.
 *
 * One IntersectionObserver for the page, armed a frame after mount, that adds
 * `data-revealed` to each `[data-rv]` block as it comes into view and then
 * unobserves it. The hidden and revealed states themselves are CSS —
 * ./reveal.css — so nothing here writes a style.
 *
 * Renders nothing. It exists as a component rather than a hook because the
 * blocks it observes belong to four different sections and no one of them
 * owns it; page.tsx mounts it once alongside them. The rAF the design uses is
 * kept: it is what lets the observer query a document that has finished its
 * first paint, and it also means this component's position in the tree does
 * not matter.
 *
 * The two design files disagree on the threshold — .14 desktop, .1 phone — so
 * the observer is rebuilt on a breakpoint change, the way the parallax handler
 * re-reads its tuning per event. Blocks already revealed are not re-observed.
 */

import { useEffect } from 'react';
import { BREAKPOINT, REVEAL_THRESHOLD } from '@/lib/tokens';
import './reveal.css';

export function RevealObserver() {
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    let obs: IntersectionObserver | null = null;

    const arm = () => {
      obs?.disconnect();
      const threshold = mq.matches ? REVEAL_THRESHOLD.mobile : REVEAL_THRESHOLD.desktop;

      obs = new IntersectionObserver(
        entries =>
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            (entry.target as HTMLElement).dataset.revealed = '';
            // Once lifted, a block stays lifted. The design unobserves for the
            // same reason: scrolling back past it must not re-hide it.
            obs?.unobserve(entry.target);
          }),
        { threshold },
      );

      document
        .querySelectorAll<HTMLElement>('[data-rv]:not([data-revealed])')
        .forEach(el => obs?.observe(el));
    };

    const frame = requestAnimationFrame(arm);
    mq.addEventListener('change', arm);

    return () => {
      cancelAnimationFrame(frame);
      mq.removeEventListener('change', arm);
      obs?.disconnect();
    };
  }, []);

  return null;
}
