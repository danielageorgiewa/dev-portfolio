'use client';

/**
 * EN / БГ toggle — design/Portfolio Atelier.dc.html lines 21-32.
 *
 * The design writes four <sc-if> branches: an active and an inactive spelling
 * of each option, picked by `isEn` / `isBg`. Both spellings of an option carry
 * the same onClick, so the four collapse to two controls with a modifier
 * class, which is what `.map` below does.
 *
 * The labels are not translated — `EN` and `БГ` read the same in both
 * languages — so this is the one piece of text on the page that does not
 * carry `.lang-fade`.
 */

import { useLang } from './lang';
import { type Lang } from '@/content/copy';
import './lang-toggle.css';

const OPTIONS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'bg', label: 'БГ' },
];

export function LangToggle() {
  const { lang, switchLang } = useLang();

  return (
    <div className="langtoggle">
      <div className="langtoggle__pill" role="group" aria-label="Language">
        {OPTIONS.map(({ code, label }) => (
          <button
            key={code}
            type="button"
            /* The label is written in the language it selects, so it needs its
               own lang attribute — otherwise a screen reader reads БГ with an
               English voice. */
            lang={code}
            className={
              'langtoggle__opt' + (code === lang ? ' langtoggle__opt--active' : '')
            }
            aria-pressed={code === lang}
            onClick={() => switchLang(code)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
