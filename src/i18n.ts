export const LANGS = ['en', 'bg'] as const;
export type Lang = (typeof LANGS)[number];

export const SITE_URL = 'https://danielageorgieva.work';
export const CONTACT_EMAIL = 'dggeorgiewa@gmail.com';
export const GITHUB_URL = 'https://github.com/danielageorgiewa';
export const LINKEDIN_URL = 'https://bg.linkedin.com/in/daniela-georgieva-0753013a3';

export const CASE_SLUGS = [
  'multi-shop-platform',
  'language-school-website',
  'warehouse-management-system',
] as const;
export type CaseSlug = (typeof CASE_SLUGS)[number];

export const other = (lang: Lang): Lang => (lang === 'en' ? 'bg' : 'en');

/** Site paths. `page` is the path without the language prefix, e.g. '' | 'cv' | 'work/<slug>'. */
export const href = (lang: Lang, page = ''): string => `/${lang}/${page}`;
export const caseHref = (lang: Lang, slug: CaseSlug): string => href(lang, `work/${slug}`);
export const cvHref = (lang: Lang): string => href(lang, 'cv');
export const cvPdfHref = (lang: Lang): string => `/cv/daniela-georgieva-cv-${lang}.pdf`;

export function getStaticLangPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}
