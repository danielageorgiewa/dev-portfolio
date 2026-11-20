<!--
MOTION UTILITIES: attribute API (works on every page, no page script needed)

  data-reveal                 Fades up 16px when it enters the screen (0.9s, ease lift).
                              data-reveal="24" changes the distance in px.
  data-reveal-group           Its direct children fade up 16px one after another (0.06s apart).
                              data-reveal-group="0.1" changes the stagger in seconds.
  data-rise-lines             Each direct child is a line that rises from a mask, 0.12s apart
                              (children should be display:block).
  data-count                  Counts to the number in its text when it enters, 1.2s, ease lift.
                              "31 → 100" counts the last number up from the first; "9 → 1" and
                              "47 → 0" count down; "2.9 s" and "5" count from 0 ("2,9 с" keeps
                              the comma). Plain text only (no child elements). Width never
                              changes while counting; add font-variant-numeric: tabular-nums
                              in CSS for the steadiest digits.
  data-magnetic               Pulls slightly toward the cursor on hover (mouse only).
  data-autoplay-inview        On a <video>: plays muted on loop while on screen, pauses when
                              off screen. Never autoplays under reduced motion (it gets
                              controls instead). Use preload="none" and a poster.
  data-lenis-prevent          Put on any element that scrolls on its own (a scrolling panel,
                              a slider's inner pages) so smooth scrolling leaves it alone.
  a[href="#id"]               Same-page hash links scroll smoothly below the sticky header.
                              Nothing to add.

Rules these follow, so pages using them stay correct:
  - With JavaScript off, or under prefers-reduced-motion, nothing above does anything and the
    markup shows as written. Never hide these elements in CSS.
  - Elements on screen at load animate straight away; `html.js-intro` (styles/motion.css)
    covers them from the first paint so there is no flash. Do not put data-reveal on the
    page's largest above-the-fold image or heading (it would delay LCP).
  - data-reveal and data-reveal-group set an inline transform until they have played. Do not
    put them on an element that needs its own CSS transform; wrap it instead.
-->

# Motion

All scroll and load animation. Wired from `src/scripts/main.ts` through `index.ts`.

## How it loads

1. An inline script in `<head>` (`layouts/Base.astro`) adds `html.js`, and `html.js-intro`
   when motion is allowed. `js-intro` hides the elements that animate on load; it is removed
   by the entry script, or after 3s if the script never arrives.
2. The entry bundle (`index.ts` and its static imports) has no libraries. It runs the hero
   load sequence, the attribute utilities, the header reveal, anchor scrolling and the flag.
3. After the page has loaded and the browser is idle, `smooth.ts` (Lenis, mouse and trackpad
   only) and `home.ts` (GSAP + ScrollTrigger, home page only) are fetched as separate chunks.

Everything decorative runs inside `whenMotion()` (`env.ts`): it is skipped under
`prefers-reduced-motion: reduce` and torn down or set up again when that setting, the 768px
breakpoint or the pointer type changes. Every module returns a cleanup that restores the
original markup.

## Modules

| File | What it does |
| --- | --- |
| `env.ts` | Motion tokens from the Figma Motion page, `whenMotion`, `onEnter`, easing functions |
| `split.ts` | Letter and word splitting that keeps the text accessible and the kerning exact |
| `intro.ts` | Hero load: portrait scale-in and ring draw, name letters, actions (Web Animations API) |
| `reveal.ts` | `data-reveal`, `data-reveal-group`, `data-rise-lines` |
| `count.ts` | `data-count` |
| `magnetic.ts` | `data-magnetic` |
| `autoplay.ts` | `data-autoplay-inview` |
| `header.ts` | Toggles `.is-visible` on `[data-site-header="reveal"]` after the hero |
| `scroll.ts` | Anchor links, `scrollToTarget`, `goTo` |
| `flag.ts` | Hidden flag: console line and typing it (the flag itself is only in devtools) |
| `smooth.ts` | Lenis |
| `home.ts` | GSAP chunk entry; runs the modules below |
| `hero.ts` | Portrait parallax and last name slide on scroll |
| `glow.ts` | Blush glow follows the cursor |
| `word-fill.ts` | About statement word fill |
| `stack.ts` | Work stacking cards (desktop) |
| `manifesto.ts` | Manifesto sequence (pinned on desktop, plays once on phone) |
| `marquee.ts` | Toolbox marquee with scroll velocity |
| `toolbox.ts` | Toolbox index rows and chips |
| `ctf.ts` | Scroll-scrubbed flag typing |

The Start CTA pulse, the CTF cursor blink and the hint fade are CSS in `styles/motion.css`.
