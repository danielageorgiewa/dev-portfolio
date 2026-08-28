/**
 * The subset of design tokens that JavaScript needs as numbers.
 *
 * app/tokens.css is canonical for anything CSS can express. These four values
 * exist here because the behaviour in design/HANDOFF.md § Interactions is
 * measured in JS, not declared in CSS:
 *
 *   - In-page nav computes the target offset and subtracts the sticky-header
 *     height before scrollTo({ behavior }). Not a bare hash link — the design
 *     was authored inside a host that swallows hash navigation.
 *   - The reveal observer fires at a threshold the two design files disagree
 *     on (.14 desktop, .1 phone) and unobserves after.
 *   - The layout switches at 900px: mobile design is authoritative below,
 *     desktop above.
 *
 * Kept deliberately small. If a value can live in CSS, it lives in CSS.
 */

/** Sticky-header height subtracted from scroll targets. */
export const HEADER_H = { desktop: 76, mobile: 64 } as const;

/** Mobile design is authoritative below this width, desktop at or above it. */
export const BREAKPOINT = 900;

/** IntersectionObserver threshold for [data-rv] section reveals. */
export const REVEAL_THRESHOLD = { desktop: 0.14, mobile: 0.1 } as const;

/** Language crossfade duration, ms. Matches --duration-micro-slow. */
export const LANG_FADE_MS = 260;

/**
 * Preview frame height cap. The live frame scales a 1440px document down until
 * it fits the column or hits this, whichever binds first, and the screenshot
 * frames use it as the width cap `w * maxH / h`. The two design files disagree
 * (`MAXH`, desktop line 331 / mobile line 330), so this is a pair too.
 */
export const FRAME_MAX_H = { desktop: 430, mobile: 380 } as const;
