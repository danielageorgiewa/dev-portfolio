import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { copy } from '@/content/copy';
import { instrumentSerif, interTight } from '../fonts';
import { LOCALES, SITE_URL, isLocale } from '../site';
import '../globals.css';

/**
 * Root layout, under the locale segment.
 *
 * CLAUDE.md § Known gaps names a locale route segment as "a sensible
 * production addition, not part of the design", and that is what this is:
 * `/en` and `/bg`, both prerendered, so `danielageorgieva.work/bg` serves
 * Bulgarian markup with `<html lang="bg">` already on it rather than swapping
 * to it after hydration. Nothing else about the language layer changes — the
 * segment supplies `LangProvider`'s initial value and nothing more. See
 * app/lang.tsx for why the toggle must not navigate.
 *
 * This is the root layout: it renders <html> and <body>, and there is no
 * app/layout.tsx. Only one layout may own those elements, and it has to be
 * the one that knows the language. `/` is redirected to `/en` in
 * next.config.ts.
 */

/** Both locales, prerendered. No runtime, no middleware. */
export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }));
}

/**
 * Anything that is not `en` or `bg` is a 404, decided at build. Left at its
 * default (`true`) an unknown segment would be rendered on demand, which is a
 * server — the one thing this build does not have and should not acquire.
 */
export const dynamicParams = false;

/**
 * Title and description are composed from content/copy.ts in the requested
 * language — never retyped and never re-translated, per CLAUDE.md. The title
 * is `first last — role`; the description is the hero bio, which is what the
 * page has always carried.
 */
export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const t = copy[lang];

  return {
    metadataBase: new URL(SITE_URL),
    title: `${t.first} ${t.last} — ${t.role}`,
    description: t.bio,
    alternates: {
      canonical: `/${lang}`,
      // x-default is what `/` resolves to — the same default the redirect in
      // next.config.ts picks, told to a crawler that never follows it.
      languages: { en: '/en', bg: '/bg', 'x-default': '/en' },
    },
    openGraph: {
      type: 'website',
      url: `/${lang}`,
      siteName: `${t.first} ${t.last}`,
      title: `${t.first} ${t.last} — ${t.role}`,
      description: t.bio,
      locale: lang === 'bg' ? 'bg_BG' : 'en_GB',
      images: [
        {
          url: `/og-${lang}.png`,
          width: 1200,
          height: 630,
          alt: `${t.first} ${t.last} — ${t.role}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t.first} ${t.last} — ${t.role}`,
      description: t.bio,
      images: [`/og-${lang}.png`],
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f2f0ed',
};

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  /* The served markup carries the right language before a line of JS runs —
     the whole point of putting the locale in the route. LangProvider keeps
     documentElement.lang in step from there, for the toggle. */
  return (
    <html lang={lang} className={`${instrumentSerif.variable} ${interTight.variable}`}>
      <body>{children}</body>
    </html>
  );
}
