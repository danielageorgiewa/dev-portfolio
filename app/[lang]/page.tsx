/**
 * The one page.
 *
 * Built so far: the shell, the hero, the language layer around both, the
 * about / education / languages section, the work rows, the tech stack, the
 * contact section with its slot picker, the phone's pinned booking bar and the
 * sticky header. That is every section in the design.
 * Nothing below invents copy or sections beyond design/HANDOFF.md § Screens.
 *
 * This stays a server component: LangProvider is the client boundary and the
 * sections pass through it as children, so a section only becomes client-side
 * if it asks for `useLang` itself.
 *
 * It sits under the `[lang]` segment so `/en` and `/bg` each prerender in
 * their own language — see ./layout.tsx. The segment is read once, here, and
 * handed to LangProvider as its initial value; after that the language is
 * client state exactly as it was, and the toggle rewrites the URL without
 * navigating (app/lang.tsx).
 */

import { notFound } from 'next/navigation';
import { About } from '../about';
import { BookBar } from '../bookbar';
import { Contact } from '../contact';
import { Header } from '../header';
import { Hero } from '../hero';
import { LangProvider } from '../lang';
import { LangToggle } from '../lang-toggle';
import { RevealObserver } from '../reveal';
import { Stack } from '../stack';
import { Work } from '../work';
import { isLocale } from '../site';

export { generateStaticParams } from './layout';

export default async function Home({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <LangProvider initialLang={lang}>
      {/* Fixed, z-index 80 — above the header, outside the shell. */}
      <LangToggle />

      {/* Fixed, z-index 60. Outside the shell for the reason the toggle and
          the bar are — and because the hero's scroll handler finds it by
          [data-navbar] on the document, not inside a section. */}
      <Header />

      {/* Renders nothing: one IntersectionObserver for every [data-rv] block
          on the page, wherever it sits. */}
      <RevealObserver />

      {/* Fixed, z-index 58, phone only. Outside the shell for the reason the
          toggle is — and because the hero's scroll handler finds it by
          [data-bookbar] on the document, not inside a section. */}
      <BookBar />

      <div className="shell">
        {/* Full-bleed, min-height:100vh, position:sticky; top:0. Sticky is what
            makes the following sections slide over it. */}
        <Hero />

        {/* --color-page surfaces */}
        <About />
        <Work />

        {/* the page's only second background */}
        <Stack />

        {/* --color-page again, with the blush behind it */}
        <Contact />
      </div>
    </LangProvider>
  );
}
