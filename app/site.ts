import type { Lang } from '@/content/copy';

/**
 * The deploy origin, in one place.
 *
 * Not from `process.env` on purpose: this build has no environment reads
 * anywhere and nothing here changes between environments — the canonical URL
 * is a fact about the site rather than about the machine that built it.
 *
 * `.work`, not `.dev`: Daniela named this domain on 2026-08-28 and was buying
 * it that day. **It did not resolve when this was written** — if the metadata
 * looks wrong in a link preview, check the domain is registered and pointed
 * before looking anywhere else. It is the only value in the build that
 * depends on something outside the repo.
 *
 * Read by app/[lang]/layout.tsx (metadataBase), app/sitemap.ts and
 * app/robots.ts.
 */
export const SITE_URL = 'https://danielageorgieva.work';

/** The two locale routes. Their order is the order they were designed in. */
export const LOCALES = ['en', 'bg'] as const;

/** Narrows a raw route segment to a language the dictionaries actually have. */
export function isLocale(v: string): v is Lang {
  return (LOCALES as readonly string[]).includes(v);
}
