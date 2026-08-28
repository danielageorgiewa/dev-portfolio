'use client';

/**
 * Project preview frames — design/Portfolio Atelier.dc.html lines 123-140 and
 * 359-453, design/Portfolio Atelier Mobile.dc.html lines 121-136 and 359-450.
 *
 * The media column of the first two work rows. Two different mechanisms behind
 * one tab strip, which is why this file exports two components:
 *
 *   PreviewLive   the Multi-brand platform row — three Trade Portal mock pages,
 *                 authored at 1440px, each in its own iframe, scaled to fit the
 *                 column inside a bordered viewport.
 *   PreviewShots  the B2B trade portal row — two 2x captures as background
 *                 images. Deliberately not iframes: design/HANDOFF.md § 5 says
 *                 live frames re-rendered visibly on tab switch.
 *
 * Two rules from CLAUDE.md § The five details govern both:
 *
 *   - Every target is mounted at once and crossfaded. Nothing here swaps a
 *     `src`; that caused a visible load-and-resize.
 *   - The frame hugs the active target's aspect ratio, never a fixed box.
 *     `aspect-ratio: w / h` with `width: min(100%, w * maxH / h)` for the
 *     screenshots; a measured `holderW` and the same `maxH` cap for the live
 *     frame, which has to scale a fixed 1440px document rather than an image.
 *
 * `frames` and `portalW` from design/HANDOFF.md § State Management live here.
 * They are per-row values — one active tab, one measured column — so each
 * preview owns its own rather than the two sharing a map keyed by project the
 * way the design's single component had to.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BREAKPOINT, FRAME_MAX_H } from '@/lib/tokens';
import './preview.css';

/* ── Frame config — the design's FRAMES, desktop line 319 ───────────────────
   Sources are this repo's paths, not the design's: the mock pages are served
   from /mock and the two captures live in /images. Labels are the design's own
   constants and are not in content/copy.ts — they stay English in both
   languages, which is what the running design does.
   ------------------------------------------------------------------------- */

/** The three live pages. All three are the same 1440x1500 white document. */
const RETAIL_PAGES = [
  { label: 'Homepage', src: '/mock/trade-portal-homepage.html', w: 1440, h: 1500, bg: '#ffffff' },
  { label: 'Product', src: '/mock/trade-portal-product.html', w: 1440, h: 1500, bg: '#ffffff' },
  { label: 'Account', src: '/mock/trade-portal-account.html', w: 1440, h: 1500, bg: '#ffffff' },
] as const;

/** The two captures, at their CSS px — half the file's 2x pixels. */
const B2B_PAGES = [
  { label: 'Homepage', img: '/images/b2b-homepage.png', w: 1482, h: 870 },
  { label: 'Sign in', img: '/images/b2b-signin.png', w: 520, h: 824 },
] as const;

/**
 * The design's fallback column width, used until the ResizeObserver reports.
 * It is also what the server renders, so it has to be a constant.
 */
const HOLDER_W_FALLBACK = 480;

/** `width: min(100%, w * maxH / h)` — the width at which the height cap bites. */
const capPx = (w: number, h: number, maxH: number) => `${Math.round((w * maxH) / h)}px`;

/* ── Tabs ───────────────────────────────────────────────────────────────── */

function PreviewTabs({
  pages,
  active,
  onPick,
}: {
  pages: readonly { label: string }[];
  active: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="preview__tabs">
      {pages.map((page, i) => (
        <button
          key={page.label}
          type="button"
          className="preview__tab"
          // Presence, not a value: the underline is `[data-active]`.
          data-active={i === active ? '' : undefined}
          aria-pressed={i === active}
          onClick={() => onPick(i)}
        >
          {page.label}
        </button>
      ))}
    </div>
  );
}

/* ── Shared hooks ───────────────────────────────────────────────────────── */

/**
 * The height cap, 430 desktop / 380 phone — one of the handful of numbers the
 * two design files disagree on. Read off a matchMedia rather than a resize
 * listener, and it starts at the desktop value because that is what the server
 * renders and hydration has to match.
 */
function useFrameMaxH() {
  const [maxH, setMaxH] = useState<number>(FRAME_MAX_H.desktop);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const read = () => setMaxH(mq.matches ? FRAME_MAX_H.mobile : FRAME_MAX_H.desktop);

    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);

  return maxH;
}

/* ── Live preview — the Multi-brand platform row ─────────────────────────── */

/**
 * Three iframes of a 1440px document, all mounted, `transform: scale()`d down
 * to whatever the column allows and cropped by the bordered viewport.
 *
 * The scale needs the column's width as a number, which only the DOM knows, so
 * this is the one preview with a ResizeObserver behind it — `portalW` in
 * design/HANDOFF.md § State Management.
 */
export function PreviewLive() {
  const [active, setActive] = useState(0);
  const [holderW, setHolderW] = useState(HOLDER_W_FALLBACK);
  const holderRef = useRef<HTMLDivElement>(null);
  const maxH = useFrameMaxH();

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;

    const read = () => setHolderW(el.clientWidth || HOLDER_W_FALLBACK);

    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The design's fitFor(): whichever of the two caps binds first. All three
  // pages are the same size, so the active one only decides the background.
  const page = RETAIL_PAGES[active];
  const scale = Math.min(holderW / page.w, maxH / page.h);

  return (
    <div className="preview">
      <PreviewTabs pages={RETAIL_PAGES} active={active} onPick={setActive} />

      {/* The measured box. Full width, so it reports the column, not the frame. */}
      <div ref={holderRef} className="preview__holder">
        <div
          className="preview__screen preview__screen--live"
          style={{
            width: `${Math.round(page.w * scale)}px`,
            height: `${Math.round(page.h * scale)}px`,
            background: page.bg,
          }}
        >
          {RETAIL_PAGES.map((p, i) => (
            <iframe
              key={p.src}
              className="preview__layer preview__layer--live"
              src={p.src}
              title="Live page preview"
              scrolling="no"
              style={{
                width: `${p.w}px`,
                height: `${p.h}px`,
                transform: `scale(${Math.min(holderW / p.w, maxH / p.h).toFixed(4)})`,
                opacity: i === active ? 1 : 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Screenshot preview — the B2B trade portal row ───────────────────────── */

/**
 * Two captures as background images on divs that *are* the fitted image —
 * `aspect-ratio` on one axis and a capped width on the other, so the border
 * hugs the picture and there is never a mat inside it. A wide 1482x870 frame
 * sits next to a tall 520x824 one; a fixed box would letterbox one of them,
 * which CLAUDE.md § The five details records as already rejected.
 *
 * Both caps are handed to CSS as custom properties rather than computed here,
 * because they depend only on the breakpoint. That keeps this component free
 * of a media query and means the phone cap applies on the first paint instead
 * of after an effect.
 */
export function PreviewShots() {
  const [active, setActive] = useState(0);

  return (
    <div className="preview">
      <PreviewTabs pages={B2B_PAGES} active={active} onPick={setActive} />

      <div className="preview__holder">
        <div className="preview__screen preview__screen--shots">
          {B2B_PAGES.map((p, i) => (
            <div
              key={p.img}
              role="img"
              aria-label="Page screenshot"
              // Only the visible capture is announced; the design leaves all of
              // them exposed, which reads as two identical images in a row.
              aria-hidden={i === active ? undefined : true}
              className="preview__layer preview__layer--shot"
              data-active={i === active ? '' : undefined}
              style={
                {
                  backgroundImage: `url(${p.img})`,
                  aspectRatio: `${p.w} / ${p.h}`,
                  '--frame-cap': capPx(p.w, p.h, FRAME_MAX_H.desktop),
                  '--frame-cap-mobile': capPx(p.w, p.h, FRAME_MAX_H.mobile),
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
