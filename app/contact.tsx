'use client';

/**
 * Contact + calendar — design/Portfolio Atelier.dc.html lines 192–221,
 * design/Portfolio Atelier Mobile.dc.html lines 178–210.
 *
 * Availability chip, two-line heading, sub-line, the six-slot picker, the
 * echoed selection beside the confirm pill, and the footer row.
 *
 * `slot` is not local state: switching language clears it (CLAUDE.md), so it
 * lives in app/lang.tsx next to `lang` — the coupling is the reason the two
 * share an owner. This component reads `slot` / `setSlot` from `useLang()`.
 *
 * The two designs disagree about the footer more than anywhere else on the
 * page. Desktop is one centred flex row — three links, each `label ↗`, then
 * the location string. The phone is a vertical list of full-width rows, each
 * `label … handle ↗` with a rule under it, then an uppercase footer line. Both
 * are rendered and hidden by breakpoint, the call the hero's `stat3` /
 * `stat3short` pair and the work count label already made: no JS has to know
 * the viewport width and the server renders the same HTML either way.
 *
 * The confirm pill is desktop-only — below 900px the phone design moves it
 * into the pinned booking bar, which is its own step.
 */

import { useLang } from './lang';
import './contact.css';

/** design/Portfolio Atelier.dc.html line 552. Constants in the design's own
    logic, not copy — the day names beside them are `t.days`. */
const HOURS = ['09:00', '11:00', '14:00', '15:30', '10:30', '16:00'];

/** The booking page both designs link out to, from every confirm affordance. */
export const CALENDAR_URL = 'https://calendar.app.google/44Wm5fa65HyQirNQA';

export function Contact() {
  const { t, slot, setSlot } = useLang();

  /* Desktop labels the email link with the address itself; the phone labels it
     `t.emailLabel` and puts the address in the handle column. Only the third
     entry differs, but all three carry both so the markup stays uniform. */
  const socials = [
    {
      label: 'GitHub',
      labelMobile: 'GitHub',
      handle: '@danielageorgiewa',
      href: 'https://github.com/danielageorgiewa',
    },
    {
      label: 'LinkedIn',
      labelMobile: 'LinkedIn',
      handle: '/in/daniela-georgieva',
      href: 'https://bg.linkedin.com/in/daniela-georgieva-0753013a3',
    },
    {
      label: 'd.georgieva@xtrmnd.com',
      labelMobile: t.emailLabel,
      handle: 'd.georgieva@xtrmnd.com',
      href: 'mailto:d.georgieva@xtrmnd.com',
    },
  ];

  return (
    <section id="contact" className="section section--contact">
      {/* Decorative. Sits behind the column, clipped by the section. */}
      <div className="contact__blush" aria-hidden />

      <div className="contact__inner lang-fade">
        <div className="contact__chip">
          <span className="contact__dot" aria-hidden />
          {t.available}
        </div>

        <h2 data-rv className="contact__title">
          {t.contactA}
          <br />
          <span className="contact__title-em">{t.contactB}</span>
        </h2>

        <p className="contact__sub">
          {t.contactSubA}
          <em>{t.contactSubEm}</em>
          {t.contactSubB}
        </p>

        {/* The design's slots are divs with an onClick. These are buttons, for
            the reason the language toggle's and the preview tabs' are: picking
            a time is a control and the keyboard has to reach it. `aria-pressed`
            is what carries the selected state to assistive tech and, being the
            state the design paints anyway, is also the styling hook. */}
        <div className="contact__slots">
          {HOURS.map((hour, i) => {
            const label = `${t.days[i]} ${hour}`;
            return (
              <button
                // Index, not the label: the day name is translated, so keying
                // on the label would remount all six on a language switch.
                key={i}
                type="button"
                className="contact__slot"
                aria-pressed={slot === label}
                onClick={() => setSlot(label)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="contact__confirm-row">
          {slot && <span className="contact__picked">{slot}</span>}
          <a
            className="contact__confirm"
            href={CALENDAR_URL}
            target="_blank"
            rel="noopener"
          >
            {t.confirm}
          </a>
        </div>

        <div className="contact__footer">
          {socials.map((s) => (
            <a
              key={s.href}
              className="contact__social"
              href={s.href}
              target="_blank"
              rel="noopener"
            >
              <span className="contact__social-label">{s.label}</span>
              <span className="contact__social-label-m">{s.labelMobile}</span>
              <span className="contact__social-meta">
                <span className="contact__social-handle">{s.handle}</span>
                <span className="contact__social-arrow" aria-hidden>
                  ↗
                </span>
              </span>
            </a>
          ))}

          {/* Desktop's last item in the same flex row; hidden below 900px,
              where t.footer takes over outside the list. */}
          <span className="contact__location">{t.location}</span>
        </div>

        <div className="contact__footer-note">{t.footer}</div>
      </div>
    </section>
  );
}
