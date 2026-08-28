'use client';

/**
 * Hero parallax — design/Portfolio Atelier.dc.html lines 454–518,
 * design/Portfolio Atelier Mobile.dc.html lines 470–517.
 *
 * CLAUDE.md § detail 4: written to the DOM from a passive `scroll` handler with
 * transitions off, never CSS scroll animation. It has to track the scrollbar
 * exactly, so every value below is computed and assigned in the handler — no
 * rAF throttle, no easing, no interpolation.
 *
 * The design runs *one* handler for the whole page, and this is it: the same
 * `p` reveals the sticky header past .55 (.5 on a phone) and slides the
 * phone's pinned booking bar in past .85. That is why the hook queries
 * `document` rather than a hero-scoped root — the bar and the nav are siblings
 * of the hero, not children.
 */

import { useEffect, useRef } from 'react';
import { BREAKPOINT } from '@/lib/tokens';

/**
 * The numbers the two design files disagree on. Everything else in the
 * handler — the 1.05 hero fade, the 1.9 + i*.15 stagger, the 2.6 cue fade — is
 * identical across desktop and mobile.
 */
type Tuning = {
  /** `p` is scrollY over `innerHeight * span`, clamped to 0–1. */
  span: number;
  /** px the hero column travels up at p = 1. */
  lift: number;
  /** scale subtracted from 1 at p = 1. */
  shrink: number;
  /** blush scale at rest. Matches the resting value in hero.css. */
  blushRest: number;
  /** scale added to the blush at p = 1. */
  blushGrow: number;
  /** `p` past which the sticky header is shown. */
  navAt: number;
  /** px the hidden header is parked above its place. Matches header.css. */
  navLift: number;
  /**
   * Whether the header's transform also has to carry the centring
   * translateX(-50%). The phone bar is a 440px column centred on the viewport;
   * the desktop bar is full-bleed. The handler rewrites the whole property, so
   * it owns the centring too.
   */
  navCentred: boolean;
};

const DESKTOP: Tuning = {
  span: 0.85,
  lift: 80,
  shrink: 0.26,
  blushRest: 0.5,
  blushGrow: 1.2,
  navAt: 0.55,
  navLift: 8,
  navCentred: false,
};

const MOBILE: Tuning = {
  span: 0.8,
  lift: 60,
  shrink: 0.22,
  blushRest: 0.55,
  blushGrow: 1.1,
  navAt: 0.5,
  navLift: 10,
  navCentred: true,
};

/**
 * Pinned booking bar — design/Portfolio Atelier Mobile.dc.html lines 496-501.
 * It appears once the hero is essentially gone, and slides up the same 16px
 * its resting transform in app/bookbar.css parks it at. Not part of `Tuning`:
 * the desktop design has no bar to disagree about.
 */
const BAR_AT = 0.85;
const BAR_LIFT = 16;

/**
 * The bar's slide and the header's are the automatic translation the
 * reduced-motion audit removes — see app/globals.css § Reduced motion for the
 * rule and app/reveal.css for the third gesture. Neither is scroll-coupled the
 * way the parallax above them is: each crosses a threshold and then animates
 * itself over .35s / .4s, which is an animation in every sense the preference
 * means. The opacity half is kept, so both still fade in; they just fade in
 * where they will stand. The design files run the full slide either way.
 */
const REDUCE_MOTION = '(prefers-reduced-motion: reduce)';

/** Opacity multiplier applied to the hero while a language crossfade runs. */
const FADE_OPACITY = 0.22;
const FADE_BLUR = 'blur(1.5px)';

/** `setHeroTransition` — the only moment hero elements are allowed a transition. */
const FADE_TRANSITION = 'opacity .26s ease, filter .26s ease';

/**
 * How long the transitions stay on after the crossfade ends. The design waits
 * 300ms — comfortably past the 260ms fade — before stripping them, so the last
 * frame of the fade is never cut short. After that the hero is back to
 * tracking the scrollbar with nothing interpolating.
 */
const TRANSITION_HOLD_MS = 300;

/**
 * Mounts the scroll handler.
 *
 * `fading` comes from LangProvider and is the language-crossfade flag. The
 * design's `switchLang` drives the hero's half of that crossfade by hand —
 * enable transitions → fade → swap → unfade → 300ms → disable transitions —
 * calling onScroll() after each state change to push the new opacity out. Here
 * `fading` is an effect dependency instead, so the effect re-runs on exactly
 * those two changes and does both halves in one place: it turns the
 * transitions on before writing, and schedules them off after.
 */
export function useHeroParallax(fading = false) {
  /** True once a fade has been seen, so the first mount does not schedule an
      unfade for a fade that never happened. */
  const faded = useRef(false);

  useEffect(() => {
    const q = (sel: string) => document.querySelector<HTMLElement>(sel);
    const hero = q('[data-hero]');
    const blush = q('[data-blush]');
    const cue = q('[data-scrollcue]');

    // Order is load-bearing. The index sets the fade rate (1.9 + i * .15), so
    // the meta row clears first and the bio last — the column empties from the
    // bottom up.
    const staged = [q('[data-bio]'), q('[data-eyebrow]'), q('[data-cta]'), q('[data-meta]')];

    // Both breakpoints. Its transform differs between them, so the writes go
    // through `t` like the hero's do.
    const nav = q('[data-navbar]');

    // Phone only, and hidden by breakpoint rather than by this handler — above
    // 900px the bar is display:none and every write below is inert.
    const bar = q('[data-bookbar]');

    // The elements the crossfade is allowed to transition. The blush and the
    // scroll cue are deliberately not among them — the design leaves both
    // snapping with the scrollbar throughout.
    const heroEls = [hero, ...staged].filter((el): el is HTMLElement => el !== null);
    const setHeroTransition = (on: boolean) => {
      heroEls.forEach(el => {
        el.style.transition = on ? FADE_TRANSITION : '';
      });
    };

    // Read per event rather than subscribed to: the branch is a property read
    // with no layout cost, and it cannot go stale across a resize the way a
    // captured boolean would.
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);

    // Read per event for the reason `mq` is: a property read with no layout
    // cost, and the user can flip the preference without reloading.
    const reduce = window.matchMedia(REDUCE_MOTION);

    const onScroll = () => {
      const t = mq.matches ? MOBILE : DESKTOP;
      const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * t.span)));
      const f = fading ? FADE_OPACITY : 1;

      if (hero) {
        hero.style.transform = `translateY(${-p * t.lift}px) scale(${1 - p * t.shrink})`;
        hero.style.opacity = String((1 - p * 1.05) * f);
        hero.style.filter = fading ? FADE_BLUR : 'none';
      }
      if (blush) {
        blush.style.transform = `translate(-50%,-50%) scale(${t.blushRest + p * t.blushGrow})`;
      }
      staged.forEach((el, i) => {
        if (el) el.style.opacity = String((1 - p * (1.9 + i * 0.15)) * f);
      });
      if (cue) cue.style.opacity = String(1 - p * 2.6);

      if (nav) {
        const on = p > t.navAt;
        nav.style.opacity = on ? '1' : '0';
        const lift = reduce.matches ? 0 : t.navLift;
        const centre = t.navCentred ? 'translateX(-50%) ' : '';
        nav.style.transform = `${centre}translateY(${on ? 0 : -lift}px)`;
        // Not the design's, which leaves the hidden bar's four links focusable
        // and hit-testable across the top of the viewport. Guarded for the
        // reason the bar's is — `inert` moves focus and re-runs focus scoping.
        if (nav.inert === on) nav.inert = !on;
      }

      if (bar) {
        const on = p > BAR_AT;
        bar.style.opacity = on ? '1' : '0';
        bar.style.pointerEvents = on ? 'auto' : 'none';
        const lift = reduce.matches ? 0 : BAR_LIFT;
        bar.style.transform = `translateX(-50%) translateY(${on ? 0 : lift}px)`;
        // Not the design's, which leaves the hidden bar's link focusable. The
        // three lines above are; this one keeps the keyboard out of an
        // invisible control, and changes no pixel. Guarded because `inert`
        // moves focus and re-runs focus scoping, unlike a style write.
        if (bar.inert === on) bar.inert = !on;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    // Order is the design's: transitions on *before* the faded opacity is
    // written, so that write animates instead of snapping.
    if (fading) {
      faded.current = true;
      setHeroTransition(true);
    }

    // The design calls the handler once on mount, and again after every
    // `fading` change. Re-running the effect on `fading` does both.
    onScroll();

    // Coming out of a fade, hold the transitions a beat, then strip them so
    // the hero is back to tracking the scrollbar exactly. A second switch
    // inside that window re-runs the effect, and the cleanup cancels the strip
    // — which is correct: the new fade wants the transitions left on.
    let hold: number | undefined;
    if (!fading && faded.current) {
      faded.current = false;
      hold = window.setTimeout(() => setHeroTransition(false), TRANSITION_HOLD_MS);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(hold);
    };
  }, [fading]);
}
