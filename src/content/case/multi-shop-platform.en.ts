// Case study · Multi-shop platform, English. Word for word from Figma (54:37 desktop, 81:94 phone).
// Do not rewrite, shorten or "improve" anything here; ask Daniela if something has to change.
// Strings marked "Not in Figma" are functional (alt text, accessible names, input labels).
import type { CaseContent } from '../case';

export const multiShop: CaseContent = {
  slug: 'multi-shop-platform',
  author: 'Daniela Georgieva',
  intro: {
    back: 'All work',
    kicker: 'Case study · 01',
    title: 'One platform, nine shops, <em>a luxury look.</em>',
    lead: 'A rooflight manufacturer runs nine online shops across several brands and countries: seven on WordPress and WooCommerce, two on Shopify, each maintained separately. I’m moving all nine onto one platform, starting with the flagship shop, and giving each brand a consistent identity.',
    facts: [
      { key: 'Client', value: 'Aperta* · Lightwell* and eight more shops' },
      { key: 'What I did', value: 'Brand identity, design, build and rollout' },
      { key: 'Delivered', value: 'One platform for every shop' },
      { key: 'Built with', chips: ['Medusa', 'Next.js', 'Payload', 'PostgreSQL', 'Docker'] },
    ],
  },
  screens: {
    // Figma draws three tabs: HOMEPAGE, PRODUCT, CUSTOM SIZE. Only the Homepage screen is drawn
    // (54:201), so there is no redacted Product composite to export yet. When it exists, add
    // { id: 'product', label: 'PRODUCT' } here, its alt below and its image in
    // src/components/case/multi-shop/Screens.astro.
    tabs: [
      { id: 'homepage', label: 'HOMEPAGE' },
      { id: 'custom-size', label: 'CUSTOM SIZE' },
    ],
    caption: 'Shown with the client’s permission.',
    // Not in Figma.
    tablistLabel: 'Screens',
    alt: {
      homepage: 'Homepage of the new online shop, with the client logo redacted',
    },
    openLabel: 'Open the screenshot at full size',
  },
  started: {
    kicker: 'Where it started',
    heading: 'Every change had to be made nine times.',
    text: 'Each shop ran its own WordPress or Shopify setup and plugins, with its own copy of the same products. The sites broke, went down and loaded slowly, and each one needed its own security patching. Price changes, legal text and bug fixes were repeated shop by shop.',
    foundKicker: 'What I found across the shops',
    rows: [
      { value: '9', label: 'shops on two different shop systems' },
      { value: '7 to 9 ×', label: 'the same fix, legal text or tracking change, once per shop' },
      { value: '~600', label: 'products, mostly the same few designs in different sizes' },
      { value: 'By hand', label: 'pricing for made-to-measure sizes' },
    ],
  },
  changes: {
    kicker: 'What changed',
    heading: 'What changes for the <em>business.</em>',
    cards: [
      {
        number: '01',
        title: 'Changes are made once, not nine times',
        text: 'All nine shops run on one codebase and one admin, whatever the brand or country.',
        vignette: {
          kind: 'fan-out',
          labels: { fix: 'fix: VAT on invoices', shop: 'Shop' },
        },
      },
      {
        number: '02',
        title: 'Every size can rank on Google',
        text: 'Each size has its own page, so someone searching for 1000 × 2000 lands right on it, with price and stock.',
        vignette: {
          kind: 'size-rows',
          labels: {
            url: '/flat-roof-window/1000x2000',
            size1: '800 × 800 mm',
            pill1: 'In stock',
            size2: '1000 × 2000 mm',
            pill2: '2 left',
            size3: '1200 × 1200 mm',
            pill3: 'Made to order',
          },
        },
      },
      {
        number: '03',
        title: 'The shop never sells what isn’t in stock',
        text: 'Stock comes live from the warehouse system, for every size.',
        vignette: {
          kind: 'stock-link',
          labels: {
            warehouse: 'Warehouse',
            count: '27',
            page: 'Product page',
            size: '1000 × 2000 mm',
            pill: '27 in stock',
          },
        },
      },
      {
        number: '04',
        title: 'Custom sizes are priced instantly',
        text: 'Pricing used to be done by hand. Now customers type their opening, see it drawn to scale and get a price and lead time on the spot.',
        vignette: {
          kind: 'custom-size',
          labels: {
            width: 'Width',
            widthValue: '1000 mm',
            length: 'Length',
            lengthValue: '2000 mm',
            widthDim: '1000',
            lengthDim: '2000',
            pill: 'Price and lead time ready',
          },
        },
      },
    ],
  },
  results: {
    kicker: 'Results',
    heading: 'Built for all nine shops, rolled out one at a time.',
    numbers: [
      { value: '9 → 1', label: 'shops onto one platform' },
      { value: '1', label: 'catalogue for every brand and country' },
      { value: '1', label: 'place to edit content for all shops' },
    ],
  },
  built: {
    kicker: 'How it is built',
    heading: 'I handled every layer.',
    steps: [
      { number: '01', title: 'Catalogue', text: 'Medusa, one product list, prices per market' },
      { number: '02', title: 'Shop front', text: 'Next.js, one codebase for every domain' },
      { number: '03', title: 'Content', text: 'Payload, one space per shop' },
      { number: '04', title: 'Stock', text: 'Live from the warehouse management system' },
      { number: '05', title: 'Server', text: 'Docker on a private server' },
    ],
  },
  next: {
    kicker: 'Next case study',
    title: 'Language school website',
  },
  footer: {
    left: '© Daniela Georgieva',
    right: '* Client names are placeholders and client logos are redacted for privacy. Real names on request.',
  },
};

/**
 * Custom size demo (the CUSTOM SIZE tab). The tab is not drawn in Figma; the words are the
 * ones on change card 04 ("Width", "Length", "mm"). `drawing` is not in Figma: the accessible
 * name of the drawing, with {w} and {l} replaced by the typed values.
 */
export const customSize = {
  width: 'Width',
  length: 'Length',
  unit: 'mm',
  drawing: 'Opening drawn to scale: {w} × {l} mm',
};
