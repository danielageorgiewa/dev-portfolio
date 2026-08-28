'use client';

/**
 * About + education + languages — design/Portfolio Atelier.dc.html lines 72–105,
 * design/Portfolio Atelier Mobile.dc.html lines 70–105.
 *
 * The mobile design splits this into two sections, #about and #education. They
 * are one section here with a two-column grid that collapses; the ids both
 * survive so either design's anchors resolve. Nothing links to #education in
 * either file — it is kept because the mobile design has it.
 *
 * `.lang-fade` sits on the grid, which is where the design puts {{ langFade }}
 * on desktop. This is the first block on the page to opt in — the hero is
 * exempt because the scroll handler writes its opacity itself.
 *
 * `data-rv` marks the two reveal targets: they start hidden and are lifted by
 * the page's one IntersectionObserver (app/reveal.tsx, app/reveal.css).
 */

import { useLang } from './lang';
import './about.css';

export function About() {
  const { t } = useLang();

  return (
    <section id="about" className="section section--about">
      <div className="about__grid lang-fade">
        <div data-rv className="about__col">
          <div className="about__kicker">{t.aboutKicker}</div>
          <p className="about__lead">{t.aboutLead}</p>
          <p className="about__body">{t.aboutBody}</p>
        </div>

        <div data-rv id="education" className="about__col about__col--aside">
          <div className="about__kicker">{t.eduKicker}</div>
          <div className="about__list">
            {t.education.map((e) => (
              <div key={e.title}>
                <div className="about__edu-title">{e.title}</div>
                <div className="about__edu-sub">{e.sub}</div>
              </div>
            ))}
          </div>

          <div className="about__langs">
            <div className="about__kicker">{t.langKicker}</div>
            <div className="about__lang-list">
              {t.languages.map((l) => (
                <div key={l.name} className="about__lang">
                  <span className="about__lang-name">{l.name}</span>
                  <span className="about__lang-level">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
