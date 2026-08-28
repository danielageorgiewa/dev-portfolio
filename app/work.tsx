'use client';

/**
 * Selected work — design/Portfolio Atelier.dc.html lines 106–161,
 * design/Portfolio Atelier Mobile.dc.html lines 106–153.
 *
 * Three rows. Desktop is a two-column grid whose columns swap sides on the
 * odd row (the design's `order:` flip); below 900px it is one column with the
 * media above the text and no flip.
 *
 * Each project's media differs, and the design picks it by matching the
 * project name against a bilingual regex (`frameKey`, line 359). Here it is
 * keyed by index instead — same three answers, but it cannot be broken by a
 * translation, and `content/copy.ts` fixes the order:
 *
 *   0  Multi-brand platform  → live Trade Portal pages in an iframe
 *   1  B2B trade portal      → the two B2B screenshots
 *   2  OurMoney              → the two phone shots, side by side
 *
 * The first two are ./preview.tsx; the phone shots are small enough to live
 * here.
 *
 * The design's third branch — `noShots`, a striped placeholder box holding
 * `p.slot` — is unreachable: all three projects have media in both languages.
 * It is not built.
 */

import Image from 'next/image';
import { useLang } from './lang';
import { PreviewLive, PreviewShots } from './preview';
import './work.css';

export function Work() {
  const { t } = useLang();

  return (
    <section id="work" className="section section--work">
      <div className="section__inner lang-fade">
        <div className="work__head">
          <h2 className="work__title">
            <span className="work__title-em">{t.workTitleA}</span> {t.workTitleB}
          </h2>
          {/* The phone design uses the shortened count. Both are rendered and
              one is hidden per breakpoint, so no JS has to know the width. */}
          <span className="work__count work__count--long">{t.workCount}</span>
          <span className="work__count work__count--short">{t.workCountShort}</span>
        </div>

        {t.projects.map((p, i) => (
          <article
            // Index, not `p.name`. The name is translated, so keying on it
            // remounts both portal rows on every language switch: the preview
            // resets to its first tab and — because `data-revealed` is written
            // to the DOM, not rendered — the row loses its reveal and cannot
            // get it back, the observer having already unobserved it. The
            // order is fixed by content/copy.ts, which is what makes the index
            // stable.
            key={i}
            data-rv
            className={`work__row${i % 2 === 1 ? ' work__row--flip' : ''}`}
          >
            <div className="work__media">
              {i === 0 && <PreviewLive />}
              {i === 1 && <PreviewShots />}
              {i === 2 && (
                <div className="work__shots">
                  <Image
                    className="work__shot"
                    src="/images/ourmoney-dashboard.png"
                    alt="OurMoney dashboard"
                    width={1080}
                    height={2400}
                  />
                  <Image
                    className="work__shot work__shot--offset"
                    src="/images/ourmoney-goals.png"
                    alt="OurMoney goals"
                    width={1080}
                    height={2400}
                  />
                </div>
              )}
            </div>

            <div className="work__text">
              <div className="work__kind">{p.kind}</div>
              <h3 className="work__name">{p.name}</h3>
              <p className="work__what">{p.what}</p>
              <p className="work__built">{p.built}</p>
              {/* CLAUDE.md § Hard rules: the italic disclaimer stays on the
                  first two projects. OurMoney has no `note` key at all — the
                  dictionary is `as const`, so the third project's type does
                  not carry the property and `in` is the narrowing that works. */}
              {'note' in p && <p className="work__note">{p.note}</p>}
              <div className="work__tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="work__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
