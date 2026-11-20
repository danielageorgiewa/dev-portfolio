// Case study copy model, shared by the three studies. Text is word for word from Figma;
// each study has one file per language in ./case/<slug>.<lang>.ts.
// To add a study: write the two content files, register them in `studies` below, and (if the
// study has its own Screens / vignettes / extra section) register those components in
// src/components/case/registry.ts. See src/components/case/README.md.
import { CASE_SLUGS, LANGS, type CaseSlug, type Lang } from '../i18n';
import { multiShop as multiShopEn } from './case/multi-shop-platform.en';
import { multiShop as multiShopBg } from './case/multi-shop-platform.bg';
import { school as schoolEn } from './case/language-school-website.en';
import { school as schoolBg } from './case/language-school-website.bg';
import { warehouse as warehouseEn } from './case/warehouse-management-system.en';
import { warehouse as warehouseBg } from './case/warehouse-management-system.bg';

/** One fact column under the lead: a text value, or a row of stack chips. */
export interface CaseFact {
  key: string;
  value?: string;
  chips?: string[];
}

/** A tab of the Screens section. `id` names the slot the study's Screens component fills. */
export interface CaseScreenTab {
  id: string;
  /** As typed in Figma (the tabs are set in capitals there). */
  label: string;
}

/**
 * What a change card's mini interface shows. `kind` picks the drawing in the study's
 * Vignette component; `labels` are the words inside it, from Figma, keyed by the component.
 */
export interface CaseVignette {
  kind: string;
  labels: Record<string, string>;
}

export interface CaseChangeCard {
  number: string;
  title: string;
  text: string;
  vignette: CaseVignette;
}

export interface CaseNumber {
  /** Counted by the motion script (`data-count`), e.g. '9 → 1'. */
  value: string;
  label: string;
}

export interface CaseContent {
  slug: CaseSlug;
  /** Used for the page <title> after the heading. Not in Figma as a title, it is the name in the footer. */
  author: string;
  intro: {
    /** "All work" link. Figma puts it in the header on desktop and above the kicker on phone. */
    back: string;
    kicker: string;
    /** Page heading. The italic tail is wrapped in <em>. Also the <title>, with the tags stripped. */
    title: string;
    /** Intro sentence. Also the meta description. */
    lead: string;
    /** Optional measure of the lead in px (default 760), for when the browser breaks a line that only just fits differently from Figma. */
    leadWidth?: number;
    facts: CaseFact[];
  };
  screens: {
    tabs: CaseScreenTab[];
    caption: string;
    /** Not in Figma: accessible name of the tab list. */
    tablistLabel: string;
    /** Not in Figma: alt text per image tab, keyed by tab id. */
    alt: Record<string, string>;
    /** Not in Figma: accessible name of the link that opens a screenshot at full size. */
    openLabel: string;
    /**
     * Before and after slider (language school). `before` / `after` are the labels drawn in
     * Figma. Not in Figma: `handle` is the slider's accessible name, `valueText` its spoken
     * value with {n} (percent of the old site shown) and {m} (percent of the new one).
     */
    compare?: { before: string; after: string; handle: string; valueText: string };
  };
  started: {
    kicker: string;
    heading: string;
    text: string;
    foundKicker: string;
    rows: { value: string; label: string }[];
  };
  changes: {
    kicker: string;
    /** The italic tail is wrapped in <em>. */
    heading: string;
    cards: CaseChangeCard[];
  };
  /**
   * Optional extra section between "What changed" and "Results" (language school: "The editor").
   * Not in Figma: `alt` and `openLabel` for its screenshot.
   */
  editor?: { kicker: string; heading: string; text: string; alt: string; openLabel: string };
  results: {
    kicker: string;
    heading: string;
    numbers: CaseNumber[];
    /** Optional list of measured values under the big numbers (language school: Lighthouse metrics). */
    metrics?: { label: string; value: string }[];
    /** Optional small line under the numbers saying where they come from (warehouse). */
    method?: string;
    /** Optional band colour, a token name without the dashes in front, e.g. 'project-sis'. Default: text-ink. */
    tone?: string;
  };
  built: {
    kicker: string;
    heading: string;
    /** `wrap`: the title may break onto two lines, where Figma sets it so (titles are one line by default). */
    steps: { number: string; title: string; text: string; wrap?: boolean }[];
  };
  next: {
    kicker: string;
    /** Title of the next case study as the band shows it. */
    title: string;
  };
  footer: {
    left: string;
    /** The footnote about placeholder client names. On every page with client work. */
    right: string;
  };
}

const studies: Partial<Record<CaseSlug, Record<Lang, CaseContent>>> = {
  'multi-shop-platform': { en: multiShopEn, bg: multiShopBg },
  'language-school-website': { en: schoolEn, bg: schoolBg },
  'warehouse-management-system': { en: warehouseEn, bg: warehouseBg },
};

/** Slugs that have content, in site order. The route builds a page per language for each. */
export const caseSlugs = (): CaseSlug[] => CASE_SLUGS.filter((slug) => slug in studies);

export function getCase(lang: Lang, slug: CaseSlug): CaseContent {
  const study = studies[slug];
  if (!study) throw new Error(`No case study content for "${slug}"`);
  return study[lang];
}

/** multi-shop → language school → warehouse → multi-shop. */
export const nextCaseSlug = (slug: CaseSlug): CaseSlug =>
  CASE_SLUGS[(CASE_SLUGS.indexOf(slug) + 1) % CASE_SLUGS.length];

/** Heading without its inline tags, for <title> and Open Graph. */
export const plainText = (html: string): string => html.replace(/<[^>]+>/g, '');

export function getCaseStaticPaths() {
  return LANGS.flatMap((lang) => caseSlugs().map((slug) => ({ params: { lang, slug } })));
}
