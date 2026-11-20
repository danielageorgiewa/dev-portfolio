// Case study · Warehouse management system, English. Word for word from Figma (53:23 desktop,
// 81:257 phone). Do not rewrite, shorten or "improve" anything here; ask Daniela if something
// has to change. Dates and production claims are exactly as Figma has them.
// Strings marked "Not in Figma" are functional (alt text, accessible names).
import type { CaseContent } from '../case';

export const warehouse: CaseContent = {
  slug: 'warehouse-management-system',
  author: 'Daniela Georgieva',
  intro: {
    back: 'All work',
    kicker: 'Case study · 03',
    title: 'Warehouse management <em>system</em>',
    lead: 'A rooflight manufacturer ran stock for several websites and a trade portal from one shared spreadsheet. Orders slipped through and counts went wrong. I took the new warehouse management system live and moved the business onto it step by step. The spreadsheet is retired, and the system now talks to every site directly. It has run in production since August 2026, and I ship and maintain it myself.',
    facts: [
      { key: 'Client', value: 'Aperta* · Rooflight manufacturer' },
      { key: 'What I did', value: 'Build, rollout and running it' },
      { key: 'Delivered', value: 'Stock, orders, loadings and a daily health check' },
      { key: 'Built with', chips: ['TypeScript', 'Node', 'PostgreSQL', 'Next.js', 'Docker'] },
    ],
  },
  screens: {
    // Figma names four tabs (TODAY, ORDERS, STOCK, HEALTH) but draws only the Today screen
    // (53:207), so there are no redacted Orders, Stock or Health composites to export yet.
    // When they exist, add { id: 'orders', label: 'ORDERS' }, { id: 'stock', label: 'STOCK' }
    // and { id: 'health', label: 'HEALTH' } here, their alt texts below and their images in
    // src/components/case/warehouse/Screens.astro. The 4s cycle starts by itself once there is
    // more than one tab (src/scripts/case-warehouse.ts).
    tabs: [{ id: 'today', label: 'TODAY' }],
    caption: 'Screens shown with demo data.',
    // Not in Figma.
    tablistLabel: 'Screens',
    alt: {
      today: 'Today screen of the warehouse management system with demo data, the client logo redacted',
    },
    openLabel: 'Open the screenshot at full size',
  },
  started: {
    kicker: 'Where it started',
    heading: 'Five sales channels ran off one spreadsheet.',
    text: 'Every sale and delivery went into the same sheet, typed by hand or written by an old script, with no record of who changed a number or why.',
    foundKicker: 'What I counted in the old setup',
    rows: [
      { value: '47', label: 'order lines took stock off the wrong product' },
      { value: '~216', label: 'orders likely lost because order numbers clashed across sites' },
      { value: '3,417', label: 'order lines with product codes the sheet did not recognise' },
      { value: '0', label: 'automated checks on the stock logic' },
      { value: 'None', label: 'record of who changed stock, or why' },
    ],
  },
  changes: {
    kicker: 'What changed',
    heading: 'What changed for <em>the team.</em>',
    cards: [
      {
        number: '01',
        title: 'Every channel sells from one stock count',
        text: 'The three websites and the trade portal all read the same numbers from the system.',
        vignette: {
          kind: 'channels',
          labels: {
            channel1: 'Site 1',
            channel2: 'Site 2',
            channel3: 'Site 3',
            channel4: 'Trade portal',
            stock: 'Stock · ELB 24',
            count: '52',
            caption: 'one count for every channel',
          },
        },
      },
      {
        number: '02',
        title: 'Mistakes are traced in seconds',
        text: 'Every stock movement records who made it and why.',
        vignette: {
          kind: 'stock-log',
          labels: {
            title: 'Stock log',
            change1: '−2',
            code1: 'ELB 24',
            reason1: 'Order 1042',
            who1: 'Daniela',
            change2: '+40',
            code2: 'ELB 25',
            reason2: 'Delivery',
            who2: 'Warehouse',
            change3: '−1',
            code3: 'SKY 60',
            reason3: 'Damaged',
            who3: 'Warehouse',
          },
        },
      },
      {
        number: '03',
        title: 'Missing orders are caught within a day',
        text: 'A daily check compares each site’s orders with the system and flags anything that didn’t arrive.',
        vignette: {
          kind: 'daily-check',
          labels: {
            title: 'Daily check · 06:00',
            name1: 'Site 1',
            count1: '18/18',
            name2: 'Site 2',
            count2: '9/9',
            name3: 'Trade portal',
            count3: '6/6',
            name4: 'Site 3',
            count4: '11/12',
            pill: '1 missing',
          },
        },
      },
      {
        number: '04',
        title: 'The switch-over didn’t stop sales',
        text: 'The new system ran next to the spreadsheet and took over one channel at a time.',
        vignette: {
          kind: 'switch-over',
          labels: {
            old: 'Spreadsheet',
            new: 'New system',
            channel1: 'Site 1',
            channel2: 'Site 2',
            channel3: 'Site 3',
            channel4: 'Trade portal',
          },
        },
      },
    ],
  },
  results: {
    kicker: 'Results',
    heading: 'Every channel now has accurate stock.',
    numbers: [
      { value: '47 → 0', label: 'sales taking stock off the wrong product' },
      { value: '5', label: 'sales channels on one stock count' },
      { value: '0 → 659', label: 'automated checks on the stock logic' },
    ],
    method: 'Counted from the old spreadsheet and the new system’s own records.',
    // The band is project/sis (#8e1b24) in Figma, not the default ink.
    tone: 'project-sis',
  },
  built: {
    kicker: 'How it is built',
    heading: 'I handled every layer.',
    steps: [
      { number: '01', title: 'Orders in', text: 'Every site and the portal send each order the moment it is placed' },
      { number: '02', title: 'Checks', text: 'Each order is applied exactly once, even if it arrives twice' },
      { number: '03', title: 'Ledger', text: 'PostgreSQL, every stock movement kept with who and why' },
      { number: '04', title: 'Dashboard', text: 'Today, orders, stock, loadings and health for the team' },
      {
        number: '05',
        title: 'Server',
        text: 'Docker on a private server, backed up every night, released through GitHub Actions with a one-step rollback',
      },
    ],
  },
  next: {
    kicker: 'Next case study',
    // Set without italics in this band (53:183).
    title: 'One platform, nine shops, <em>a luxury look.</em>',
  },
  footer: {
    left: '© Daniela Georgieva',
    right: '* Client names are placeholders and client logos are redacted for privacy. Real names on request.',
  },
};
