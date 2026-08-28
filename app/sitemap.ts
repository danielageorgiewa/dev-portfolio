import type { MetadataRoute } from 'next';
import { LOCALES, SITE_URL } from './site';

/**
 * Two URLs — `/en` and `/bg` — each naming the other as its `hreflang`
 * alternate. There is no third page: the design is one page per language and
 * every section on it is an in-page anchor, not a route.
 *
 * `/` is not listed. It is a 307 to `/en` (next.config.ts), and a sitemap
 * should carry the destination rather than the redirect.
 *
 * No `lastModified`: the honest value is the last content change, which this
 * build has no source for, and `new Date()` would stamp every entry with the
 * build time and tell a crawler the page changed when only the deploy did.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map(l => [l, `${SITE_URL}/${l}`]));

  return LOCALES.map(lang => ({
    url: `${SITE_URL}/${lang}`,
    alternates: { languages },
  }));
}
