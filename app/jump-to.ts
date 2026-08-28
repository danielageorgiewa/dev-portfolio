'use client';

/**
 * In-page nav — design/Portfolio Atelier.dc.html lines 335-358,
 * design/Portfolio Atelier Mobile.dc.html lines 334-357.
 *
 * CLAUDE.md § detail 5 and design/HANDOFF.md § Scroll behaviour: a hash link
 * plus `scroll-margin-top` would do this in a plain web app, but the design was
 * authored inside a host that swallows hash navigation, so the offset is
 * measured, the sticky-header height subtracted, and scrollTo called by hand.
 * `prefers-reduced-motion` turns the smoothness off.
 *
 * Two things the design's handler carries are deliberately not here, both
 * artefacts of that host rather than of the design:
 *
 *   - the loop that walks ancestors looking for whichever one actually
 *     scrolls. Nothing in this build scrolls but the document — `.shell` sets
 *     no overflow — so the loop can only ever fall through to the document
 *     branch it already has.
 *   - the trailing `doc.scrollTop = top`, an unconditional legacy fallback
 *     that runs *after* scrollTo and so cancels the smooth scroll the line
 *     above it just started. § Scroll behaviour asks for smooth; the prototype
 *     jumps. Spec over prototype, as with the preview crossfade's .42s.
 *
 * The href stays on the anchor underneath. It is what a middle-click, a
 * "copy link address" and a JS-off load use, and it is also the accessible
 * name's target — the handler only takes over the click.
 */

import { BREAKPOINT, HEADER_H } from '@/lib/tokens';

/** Anything with preventDefault. Keeps this usable from a React synthetic
    event without importing React's type into a non-component module. */
type Preventable = { preventDefault: () => void };

/**
 * Returns the click handler that scrolls to `#id`, mirroring the design's
 * `jumpTo(id)` factory — one handler per target, built at render.
 */
export function jumpTo(id: string) {
  return (e?: Preventable) => {
    const el = document.getElementById(id);
    if (!el) return;
    e?.preventDefault();

    const behavior: ScrollBehavior = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
      ? 'auto'
      : 'smooth';

    // 76 above the breakpoint, 64 below — the two sticky-header heights. Read
    // per call rather than captured, so a resize cannot leave it stale.
    const header = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`).matches
      ? HEADER_H.mobile
      : HEADER_H.desktop;

    const doc = document.scrollingElement ?? document.documentElement;
    const top = el.getBoundingClientRect().top + (window.scrollY || doc.scrollTop) - header;

    window.scrollTo({ top, behavior });
  };
}
