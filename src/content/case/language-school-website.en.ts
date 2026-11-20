// Case study · Language school website, English. Word for word from Figma (48:10 desktop, 72:49 phone).
// Do not rewrite, shorten or "improve" anything here; ask Daniela if something has to change.
// Strings marked "Not in Figma" are functional (alt text, accessible names).
import type { CaseContent } from '../case';

export const school: CaseContent = {
  slug: 'language-school-website',
  author: 'Daniela Georgieva',
  intro: {
    back: 'All work',
    kicker: 'Case study · 02',
    title: 'Language school <em>website</em>',
    lead: 'A long-established language school had a website and a look that didn’t do it justice. I gave the school a brand identity, then designed, built and now host its new site.',
    facts: [
      { key: 'Client', value: 'LingvoMost* · Language school' },
      { key: 'What I did', value: 'Brand identity, design, build and hosting' },
      { key: 'Delivered', value: 'Website and content editor' },
      { key: 'Built with', chips: ['Figma', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'] },
    ],
  },
  screens: {
    // Figma draws the two tabs, DESKTOP and PHONE. Each holds one before and after slider with
    // the full-page captures (src/components/case/school/Screens.astro).
    tabs: [
      { id: 'desktop', label: 'DESKTOP' },
      { id: 'phone', label: 'PHONE' },
    ],
    caption: 'Both sites captured the same week, old on the left and new on the right. Photos are stand-ins.',
    compare: {
      before: 'BEFORE',
      after: 'AFTER',
      // Not in Figma: the slider's accessible name, its spoken value ({n} is 0 to 100) and the
      // name of the box the two pages scroll in.
      handle: 'Before and after: how much of the old site is shown',
      valueText: '{n}% old site, {m}% new site',
      scroll: 'Old and new homepage, top to bottom. Scroll to move down both pages together.',
    },
    // Not in Figma.
    tablistLabel: 'Screens',
    alt: {
      before: 'The whole homepage of the old school website on a computer. The client logo is redacted and the photos are stand-ins.',
      after: 'The whole homepage of the new school website on a computer. The client logo is redacted and the photos are stand-ins.',
      beforePhone: 'The whole homepage of the old school website on a phone. The client logo is redacted and the photos are stand-ins.',
      afterPhone: 'The whole homepage of the new school website on a phone. The client logo is redacted and the photos are stand-ins.',
    },
    openLabel: 'Open the screenshot at full size',
    frame: {
      expand: 'Expand',
      shrink: 'Shrink',
    },
  },
  started: {
    kicker: 'Where it started',
    heading: 'A good school stuck with a slow, dated website.',
    text: 'The school had grown for over twenty years and the website hadn’t kept up. On a phone, pages were slow and hard to read, and finding a course took far too long.',
    foundKicker: 'What I measured on the old site',
    rows: [
      { value: '31 / 100', label: 'Google speed score on desktop. 54 on mobile.' },
      { value: '33 s', label: 'for the main image to appear on a slow phone connection' },
      { value: '228', label: 'serious accessibility problems on five key pages' },
      { value: '80 of 120', label: 'pages without a main heading for search engines' },
      { value: 'F', label: 'security rating for the site’s settings' },
      { value: 'No', label: 'cookie consent, while tracking already ran' },
    ],
  },
  changes: {
    kicker: 'What changed',
    heading: 'What changed for <em>the school.</em>',
    cards: [
      {
        number: '01',
        title: 'A brand as established as the school',
        text: 'I built one clear identity from the school’s own materials and used it on every page.',
        vignette: {
          kind: 'brand-kit',
          labels: { type: 'Aa', primary: 'Enrol', secondary: 'Courses' },
        },
      },
      {
        number: '02',
        title: 'Enquiries go to the right office',
        text: 'A three-step form takes course questions and translation requests, files included, and sends each one to the office that handles it.',
        vignette: {
          kind: 'enquiry',
          labels: {
            step1: 'Topic',
            step2: 'Details',
            step3: 'Send',
            step3Number: '3',
            toast: 'Sent to the school office',
            toastNote: 'with 2 files attached',
          },
        },
      },
      {
        number: '03',
        title: 'Courses are quick to find',
        text: 'Visitors filter by language, age and level and enrol straight from the course page.',
        vignette: {
          kind: 'course-finder',
          labels: {
            chip1: 'English',
            chip2: 'Adults',
            chip3: 'B1',
            chip4: 'Online',
            result1: 'English B1 · Adults',
            result2: 'English B2 · Adults',
            enrol: 'Enrol',
          },
        },
      },
      {
        number: '04',
        title: 'The homepage loads in 2.9 seconds on a phone',
        text: 'On a slow connection, the old site took 33 seconds to show its main content.',
        vignette: {
          kind: 'speed',
          labels: {
            title: 'Main content on screen · phone',
            old: 'Old site',
            oldValue: '33.0 s',
            new: 'New site',
            newValue: '2.9 s',
          },
        },
      },
    ],
  },
  editor: {
    kicker: 'The editor',
    heading: 'The staff run the site themselves.',
    text: 'Courses, prices, dates and news live in Payload, a content editor I set up in Bulgarian. The live preview shows the page changing as they type, so nothing is published until it looks right.',
    // Not in Figma.
    alt: 'The content editor with a course open: the form on the left, the live preview of the page on the right. The client logo is redacted.',
    openLabel: 'Open the screenshot at full size',
  },
  results: {
    kicker: 'Results',
    heading: 'Faster and easier to use.',
    numbers: [
      { value: '31 → 100', label: 'Google speed score, desktop' },
      { value: '54 → 95', label: 'Google speed score, mobile' },
      { value: '85 → 100', label: 'Accessibility score, mobile' },
    ],
    metrics: [
      { label: 'Performance, phone', value: '54 → 95' },
      { label: 'Performance, computer', value: '31 → 100' },
      { label: 'Accessibility, phone', value: '85 → 100' },
      { label: 'Accessibility, computer', value: '83 → 100' },
      { label: 'Largest Contentful Paint, phone', value: '33.0 s → 2.9 s' },
      { label: 'Largest Contentful Paint, computer', value: '5.6 s → 0.7 s' },
      { label: 'Total Blocking Time, computer', value: '520 ms → 0 ms' },
      { label: 'Cumulative Layout Shift, computer', value: '0.268 → 0' },
    ],
    // The band colour in Figma is project/ea.
    tone: 'project-ea',
    method:
      'Lighthouse lab scores for the homepage. Old site: live, via PageSpeed Insights. New site: production build before launch, median of three runs.',
  },
  built: {
    kicker: 'How it is built',
    heading: 'I handled every layer.',
    steps: [
      { number: '01', title: 'Design', text: 'Figma, with a design system the code reuses' },
      { number: '02', title: 'Website', text: 'Next.js, fast pages built ahead of time' },
      { number: '03', title: 'Editor', text: 'Payload CMS, in Bulgarian, with live preview' },
      { number: '04', title: 'Data', text: 'PostgreSQL, backed up every night' },
      { number: '05', title: 'Server', text: 'Docker on a private server, deployed automatically' },
    ],
  },
  next: {
    kicker: 'Next case study',
    title: 'Warehouse management system',
  },
  footer: {
    left: '© Daniela Georgieva',
    right: '* Client names are placeholders and client logos are redacted for privacy. Real names on request.',
  },
};
