/**
 * The two typefaces — design/HANDOFF.md § Typography.
 *
 * The design files pull these from Google Fonts at runtime:
 *   Instrument+Serif:ital@0;1 & Inter+Tight:wght@300;400;500
 *
 * next/font/google downloads and self-hosts them at build time instead, so the
 * built page has no request to fonts.googleapis.com and no swap flash. The
 * axes are exactly the ones the design asks for — nothing extra, since every
 * unused weight is dead bytes.
 *
 * Both are exposed as CSS variables so app/tokens.css can point --font-display
 * and --font-body at them and the rest of the build only ever names the token.
 */

import { Instrument_Serif, Inter_Tight } from 'next/font/google';

/** Display: name, section headings, project titles, education, italic notes. */
export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-instrument-serif',
});

/**
 * Body: everything else.
 * Cyrillic is loaded alongside Latin — the Bulgarian dictionary is half the
 * copy, and without it БГ falls back to a system face mid-page.
 */
export const interTight = Inter_Tight({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-inter-tight',
});
