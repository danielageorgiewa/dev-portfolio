'use client';

/**
 * Tech stack — design/Portfolio Atelier.dc.html lines 162–191,
 * design/Portfolio Atelier Mobile.dc.html lines 154–177.
 *
 * Three cards, each a titled list of tool names. Desktop is a three-column
 * grid with a flex header row (heading left, note right); below 900px it is
 * one column and the header stacks.
 *
 * The group titles are copy (`t.frontend` / `t.backend` / `t.infra`); the tool
 * names are not. They are constants in the design's own logic (`stack`,
 * desktop line 546) and are absent from content/copy.ts in both languages, so
 * they are constants here too — the same call as the preview tab labels.
 * Translating "PostgreSQL" would be inventing copy.
 *
 * `data-rv` is on each card: the design reveals the three cards, not the
 * header.
 */

import { useLang } from './lang';
import './stack.css';

/** design/Portfolio Atelier.dc.html line 546 — order and spelling verbatim. */
const GROUPS = [
  ['HTML & CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind'],
  ['Node', 'Medusa v2', 'PostgreSQL', 'SQL'],
  ['Git', 'GitHub Actions', 'Docker', 'Linux', 'Bash / Zsh', 'Claude Code'],
];

export function Stack() {
  const { t } = useLang();
  const titles = [t.frontend, t.backend, t.infra];

  return (
    <section id="stack" className="section section--alt section--stack">
      <div className="section__inner lang-fade">
        <div className="stack__head">
          <div>
            <div className="stack__kicker">{t.stackKicker}</div>
            <h2 className="stack__title">{t.stackTitle}</h2>
          </div>
          <p className="stack__note">{t.stackNote}</p>
        </div>

        <div className="stack__grid">
          {GROUPS.map((items, i) => (
            // Index, for the same reason the work rows are: the title is
            // translated, and keying on it would remount every card — and so
            // drop the `data-revealed` the observer wrote — on a language
            // switch. GROUPS fixes the order.
            <div key={i} data-rv className="stack__card">
              <div className="stack__card-head">
                <span className="stack__card-title">{titles[i]}</span>
              </div>
              <div className="stack__items">
                {items.map((name) => (
                  <div key={name} className="stack__item">
                    <span className="stack__item-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
