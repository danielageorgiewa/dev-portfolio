'use client';

/**
 * Pinned booking bar — design/HANDOFF.md § 8,
 * design/Portfolio Atelier Mobile.dc.html lines 211-218.
 *
 * Phone only: the desktop file has no `[data-bookbar]` at all, so this is the
 * one element on the page with no desktop counterpart. It is still rendered
 * there and hidden by breakpoint, the call the hero's stat3 pair, the work
 * count label and the contact footer already made — no JS has to know the
 * viewport width and the server renders the same HTML either way.
 *
 * Its behaviour changes with `slot`: with nothing picked it reads *Book a
 * 30-minute call* and scrolls to #contact; once a time is picked it becomes
 * *Continue · <slot>* and links out to the calendar. The design writes those
 * as two <sc-if> branches over one identical anchor, so they collapse to one
 * element with derived props.
 *
 * It is shown by the page's scroll handler, not by CSS — `useHeroParallax`
 * fades and slides it in past p > .85 off the same `p` that drives the hero.
 *
 * No `.lang-fade`. The label is translated, but the design's bar carries no
 * `{{ langFade }}` and the crossfade's list is exactly where that appears.
 */

import { CALENDAR_URL } from './contact';
import { jumpTo } from './jump-to';
import { useLang } from './lang';
import './bookbar.css';

const goContact = jumpTo('contact');

export function BookBar() {
  const { t, slot } = useLang();

  return (
    /* Hidden at rest — opacity 0, translated 16px down, pointer-events off —
       and `inert` until the handler turns it on, so the keyboard cannot land
       on an invisible link. The design leaves it focusable; hiding it costs
       nothing and no pixel changes. */
    <div data-bookbar className="bookbar" inert>
      <a
        className="bookbar__cta"
        href={slot ? CALENDAR_URL : '#contact'}
        target={slot ? '_blank' : undefined}
        rel={slot ? 'noopener' : undefined}
        onClick={slot ? undefined : goContact}
      >
        {slot ? `${t.confirmWith} · ${slot}` : t.book30}
      </a>
    </div>
  );
}
