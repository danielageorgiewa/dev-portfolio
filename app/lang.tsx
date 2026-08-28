'use client';

/**
 * Language state and the crossfade choreography —
 * design/Portfolio Atelier.dc.html lines 460-471 (`switchLang`) and the
 * `langFade` value in `renderVals` (line 580).
 *
 * Three of the five state fields in design/HANDOFF.md § State Management live
 * here: `lang`, `fading` and `slot`. `frames` and `portalW` belong to a single
 * project row each and stay local to the preview component.
 *
 * `slot` is here rather than with the calendar because of the rule in
 * CLAUDE.md: switching language clears the selected slot, so a slot label from
 * one language can never sit against the other language's grid. That coupling
 * is the reason the two pieces of state share an owner.
 *
 * The crossfade itself is CSS — `.lang-fade` in ./lang.css, switched by a
 * `data-fading` attribute on <html>. The design writes the same three
 * declarations inline on every translated block via `{{ langFade }}`; a class
 * plus one root attribute is the same effect without repeating the string
 * fifty times.
 *
 * ## The URL follows the state; it does not drive it
 *
 * `/en` and `/bg` (app/[lang]/layout.tsx) supply `initialLang` on load and
 * nothing more. The switch itself stays entirely client-side: a `router.push`
 * or a real <a> would remount the tree mid-fade, and that fade is a 260ms
 * choreography with the hero's scroll handler hanging off it — the page would
 * lose `fading`, lose the scroll position, and re-pin a `position:sticky` hero
 * from the top, which is about as visible as a defect gets.
 *
 * So the URL is rewritten alongside the state with `window.history
 * .replaceState`, which Next's router supports for exactly this case (its own
 * locale-switcher example is this call). It re-renders nothing. `replaceState`
 * rather than `pushState` deliberately: the toggle is mid-page state, not
 * navigation, so Back should leave the page rather than undo a language.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { copy, type Copy, type Lang } from '@/content/copy';
import { LANG_FADE_MS } from '@/lib/tokens';
import './lang.css';

/**
 * The beat between swapping the dictionary and lifting the fade. The design
 * uses 20ms: long enough for the browser to commit the new text at .22 opacity
 * before the transition back to 1 starts, so the swap itself is never visible.
 */
const SWAP_SETTLE_MS = 20;

type LangState = {
  lang: Lang;
  /** The active dictionary. `copy[lang]`, resolved once per render. */
  t: Copy;
  /** True for the length of the crossfade. Drives `.lang-fade` and the hero. */
  fading: boolean;
  switchLang: (next: Lang) => void;
  /** Selected calendar slot label, or null. Cleared by every language switch. */
  slot: string | null;
  setSlot: (slot: string | null) => void;
};

const LangCtx = createContext<LangState | null>(null);

export function useLang(): LangState {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>.');
  return ctx;
}

export function LangProvider({
  children,
  initialLang = 'en',
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [fading, setFading] = useState(false);
  const [slot, setSlot] = useState<string | null>(null);

  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  /* The document's own language attribute has to follow the toggle — it is
     what a screen reader switches voice on. app/[lang]/layout.tsx renders the
     segment's language into the served markup and this takes over from
     there, since the toggle changes the language without navigating. */
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* One attribute on the root drives every .lang-fade block on the page,
     including the fixed-position ones that sit outside .shell. */
  useEffect(() => {
    document.documentElement.toggleAttribute('data-fading', fading);
  }, [fading]);

  const switchLang = useCallback(
    (next: Lang) => {
      // Ignoring a switch that is already running is what stops a double click
      // from swapping the dictionary mid-fade and stranding `fading` at true.
      if (next === lang || fading) return;

      const at = (ms: number, fn: () => void) => {
        timers.current.push(window.setTimeout(fn, ms));
      };

      setFading(true);
      at(LANG_FADE_MS, () => {
        setLang(next);
        setSlot(null);
        // Alongside the swap, in the same beat, and without navigating. The
        // path is the whole URL this site has — one page per locale — so the
        // segment can be replaced outright rather than spliced.
        window.history.replaceState(null, '', `/${next}${window.location.hash}`);
        at(SWAP_SETTLE_MS, () => setFading(false));
      });
    },
    [lang, fading],
  );

  /* The design calls onScroll() by hand after each of those setStates, to push
     the new `fading` through the hero's inline styles. Here useHeroParallax
     takes `fading` as a dependency and re-runs — same two calls, same order. */

  const value = useMemo(
    () => ({ lang, t: copy[lang], fading, switchLang, slot, setSlot }),
    [lang, fading, switchLang, slot],
  );

  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
