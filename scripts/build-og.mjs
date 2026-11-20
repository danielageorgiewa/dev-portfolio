// Renders one Open Graph image (1200x630) per page into public/og/.
// It opens each built page (so the site's own fonts and tokens are loaded), reads the
// page heading, and screenshots a card drawn with it. Run after a build, then build again:
//   npm run build && npm run og && npm run build
// Usage: npm run preview (in another terminal), then node scripts/build-og.mjs --base http://localhost:4321
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const SLUGS = ['multi-shop-platform', 'language-school-website', 'warehouse-management-system'];
const PAGES = ['', 'cv', ...SLUGS.map((s) => `work/${s}`)];
const LABEL = {
  en: { '': 'Portfolio', cv: 'CV', work: 'Case study' },
  bg: { '': 'Портфолио', cv: 'CV', work: 'Казус' },
};

const arg = process.argv.indexOf('--base');
let base = arg > -1 ? process.argv[arg + 1] : null;
let server;
if (!base) {
  const port = 4391;
  server = spawn('npx', ['astro', 'preview', '--port', String(port)], { stdio: 'ignore' });
  base = `http://localhost:${port}`;
  await new Promise((r) => setTimeout(r, 4000));
}

await mkdir('public/og', { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, javaScriptEnabled: false })).newPage();
try {
  for (const lang of ['en', 'bg']) {
    for (const p of PAGES) {
      await page.goto(`${base}/${lang}/${p}`, { waitUntil: 'networkidle' });
      await page.evaluate(
        ({ label, isHome }) => {
          const h1 = document.querySelector('h1');
          // Home: the two-line name. Other pages: the page heading as written.
          const heading = isHome
            ? [...h1.children].map((c) => (c.tagName === 'EM' ? `<em>${c.textContent}</em>` : c.textContent)).join(' ')
            : h1.innerHTML;
          const name = document.querySelector('meta[property="og:site_name"]').content;
          document.body.innerHTML = `
            <div class="og">
              <p class="og__top"><span class="og__dot"></span>${isHome ? label : name}</p>
              <p class="og__title display">${heading}</p>
              <p class="og__bottom">${isHome ? 'danielageorgieva.work' : `${label} · danielageorgieva.work`}</p>
            </div>
            <style>
              html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--bg-linen); }
              .og { box-sizing: border-box; width: 1200px; height: 630px; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between;
                background: radial-gradient(60% 70% at 50% 60%, rgb(168 135 124 / .28), rgb(168 135 124 / 0) 100%), var(--bg-linen); }
              .og__top, .og__bottom { margin: 0; font: 500 20px/1 var(--font-body); letter-spacing: .22em; text-transform: uppercase; color: var(--site-muted); display: flex; align-items: center; gap: 14px; }
              .og__dot { width: 12px; height: 12px; border-radius: 50%; background: var(--accent-crimson); }
              .og__title { margin: 0; font-size: ${isHome ? 150 : 96}px; line-height: 1; letter-spacing: -0.022em; color: var(--text-primary); max-width: 1000px; text-wrap: balance; }
              .og__title * { all: unset; }
              .og__title em { font-style: italic; }
            </style>`;
        },
        { label: LABEL[lang][p.startsWith('work/') ? 'work' : p], isHome: p === '' },
      );
      await page.evaluate(() => document.fonts.ready);
      const out = `public/og/${lang}${p ? `-${p.replace(/\//g, '-')}` : ''}.png`;
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1200, height: 630 } });
      console.log('wrote', out);
    }
  }
} finally {
  await browser.close();
  server?.kill();
}
