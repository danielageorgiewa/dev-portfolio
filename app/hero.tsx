'use client';

/**
 * Full-bleed hero — design/Portfolio Atelier.dc.html lines 45-71, with the
 * scroll parallax of lines 473-518 attached via useHeroParallax.
 *
 * "See three projects" runs the measured jumpTo handler (app/jump-to.ts), not
 * the bare `#work` hash it carried until the booking bar needed the same
 * handler. The href stays underneath it — see that file.
 *
 * The *first* CTA goes to two different places by breakpoint: the desktop file
 * opens the calendar in a new tab, the phone file routes to #contact and the
 * slot picker, exactly as the pinned booking bar does with nothing picked.
 * That is a difference in `href`, `target` and the click handler, not in copy,
 * so it cannot be one element styled two ways: both are in the markup and one
 * is display:none per breakpoint — the call the work count label, the contact
 * footer and the booking bar itself already made. No JS has to know the
 * viewport width and the server renders the same HTML either way.
 *
 * The *second* CTA is a bare <span> in the phone file — no href, no handler,
 * so "See three projects" is not a link at all below 900px. Read as a
 * prototype slip, not a decision: it stays the anchor it is on desktop and
 * keeps `jumpTo`, taking only the phone's pixels. A <span> and an <a> with the
 * same padding, border and font measure identically, so nothing moves.
 *
 * Nothing here carries `.lang-fade`. The hero's crossfade is not the CSS one —
 * its opacity is written by the scroll handler, which multiplies the same .22
 * in itself; carrying the class as well would compound the two.
 */

import Image from 'next/image';
import { CALENDAR_URL } from './contact';
import { jumpTo } from './jump-to';
import { useHeroParallax } from './use-hero-parallax';
import { useLang } from './lang';
import './hero.css';

const goWork = jumpTo('work');
const goContact = jumpTo('contact');

export function Hero() {
  const { t, fading } = useLang();

  useHeroParallax(fading);

  return (
    <section className="hero">
      {/* The two background layers. Both are decorative. */}
      <div data-blush className="hero__blush" aria-hidden />
      <div className="hero__dots" aria-hidden />

      <div data-hero className="hero__content">
        <div className="hero__portrait">
          <Image
            src="/images/daniela.jpg"
            alt={`${t.first} ${t.last}`}
            width={132}
            height={132}
            loading="eager"
          />
        </div>

        <div data-eyebrow className="hero__eyebrow">
          {t.role}
        </div>

        {/* First name roman, surname italic, on their own lines. */}
        <h1 className="hero__name">
          {t.first}
          <br />
          <span className="hero__surname">{t.last}</span>
        </h1>

        <p data-bio className="hero__bio">
          {t.bio}
        </p>

        <div data-cta className="hero__ctas">
          {/* Above 900px: straight out to the calendar. */}
          <a
            className="hero__cta hero__cta--solid hero__cta--desktop"
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener"
          >
            {t.book30}
          </a>

          {/* Below 900px: down to the picker instead. */}
          <a
            className="hero__cta hero__cta--solid hero__cta--phone"
            href="#contact"
            onClick={goContact}
          >
            {t.book30}
          </a>

          <a className="hero__cta hero__cta--outline" href="#work" onClick={goWork}>
            {t.seeWork}
          </a>
        </div>

        <div data-meta className="hero__meta">
          <span>{t.stat1}</span>
          <span>{t.stat2}</span>
          <span>{t.stat3}</span>
        </div>
      </div>

      <div data-scrollcue className="hero__cue">
        {t.scroll}
        <span className="hero__cue-rule" aria-hidden />
      </div>
    </section>
  );
}
