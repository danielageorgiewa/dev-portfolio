import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { cspHeaders } from './scripts/csp-headers.mjs';

export default defineConfig({
  site: 'https://danielageorgieva.work',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // Only the real pages: no 404s and no root redirect page.
      filter: (page) => !/\/404\/?$/.test(page) && new URL(page).pathname !== '/',
      i18n: { defaultLocale: 'en', locales: { en: 'en', bg: 'bg' } },
    }),
    // Writes dist/_headers with a Content-Security-Policy that lists the hash of every
    // inline script in the built pages. Keep it last so it sees the finished output.
    cspHeaders(),
  ],
});
