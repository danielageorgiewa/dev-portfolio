'use client';

/**
 * Sticky header — design/HANDOFF.md § 2,
 * design/Portfolio Atelier.dc.html lines 34-44,
 * design/Portfolio Atelier Mobile.dc.html lines 36-41.
 *
 * Hidden at rest and revealed by the page's scroll handler, not by CSS: the
 * same `p` that drives the hero parallax fades and slides this in past .55
 * (.5 on a phone), exactly as it slides the phone's booking bar in past .85.
 * See app/use-hero-parallax.ts — one listener for the page, which is what the
 * design runs.
 *
 * The two designs differ in what the bar holds. Desktop is brand on the left,
 * four links on the right. The phone header has no nav at all — just the
 * brand — so the whole <nav> is hidden below 900px rather than reflowed.
 *
 * `.lang-fade` goes on the nav and not on the brand, which is the design's own
 * split: `{{ langFade }}` appears on the desktop <nav> only. The name is
 * translated too, but it is a name — it holds its place through the swap.
 */

import Image from 'next/image';
import { jumpTo } from './jump-to';
import { useLang } from './lang';
import './header.css';

/** One handler per target, built once — the design's `jumpTo(id)` factory. */
const goWork = jumpTo('work');
const goStack = jumpTo('stack');
const goAbout = jumpTo('about');
const goContact = jumpTo('contact');

export function Header() {
  const { t } = useLang();

  return (
    /* `inert` until the scroll handler turns it on. The design leaves the
       hidden bar's four links in the tab order and hit-testable across the top
       of the viewport; this keeps the keyboard and the pointer out of an
       invisible control, the same call the booking bar's link got. Nothing
       sits under it while the hero is on screen — the language toggle is
       z-index 80, above it — so no pixel and no reachable target changes. */
    <div data-navbar className="header" inert>
      <span className="header__brand">
        <span className="header__avatar">
          <Image
            src="/images/daniela.jpg"
            alt={`${t.first} ${t.last}`}
            width={28}
            height={28}
          />
        </span>
        <span className="header__name">
          {t.first} {t.last}
        </span>
      </span>

      {/* Desktop only — the phone design's header carries no links. */}
      <nav className="header__nav lang-fade">
        <a className="header__link" href="#work" onClick={goWork}>
          {t.navWork}
        </a>
        <a className="header__link" href="#stack" onClick={goStack}>
          {t.navStack}
        </a>
        <a className="header__link" href="#about" onClick={goAbout}>
          {t.navAbout}
        </a>
        {/* The one sheened element in the bar. The three links beside it get
            the underline hover and no gradient — see app/header.css. */}
        <a className="header__book" href="#contact" onClick={goContact}>
          {t.navBook}
        </a>
      </nav>
    </div>
  );
}
