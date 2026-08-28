import type { MetadataRoute } from 'next';
import { SITE_URL } from './site';

/**
 * Nothing on this site is private and nothing is generated per request, so
 * the rule is the whole file: crawl everything, and here is the sitemap.
 *
 * `/mock/*` is deliberately *not* disallowed. Those pages are the previews'
 * own content, served from this origin and iframed into the work section; a
 * crawler reaching one reaches a page the site genuinely serves.
 *
 * Prerendered at build like every other route — no runtime.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
