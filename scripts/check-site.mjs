// Cross-page smoke check against a running preview of dist/.
// Loads every page at 1440 and 390 with the generated Content-Security-Policy applied, scrolls
// through it, and reports console errors, failed requests, CSP violations and sideways scroll.
// Usage: node scripts/check-site.mjs [--base http://localhost:4321]
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const arg = process.argv.indexOf('--base');
const base = arg > -1 ? process.argv[arg + 1] : 'http://localhost:4321';
const slugs = ['multi-shop-platform', 'language-school-website', 'warehouse-management-system'];
const paths = ['en', 'bg'].flatMap((l) => [`/${l}/`, `/${l}/cv/`, ...slugs.map((s) => `/${l}/work/${s}/`), `/${l}/404/`]);
paths.push('/404.html', '/');

const headers = await readFile('dist/_headers', 'utf8');
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)[1].trim();

const browser = await chromium.launch();
let problems = 0;
for (const width of [1440, 390]) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.route('**/*', async (route) => {
    const req = route.request();
    if (req.resourceType() !== 'document') return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, headers: { ...res.headers(), 'content-security-policy': csp } });
  });
  for (const path of paths) {
    const page = await ctx.newPage();
    const issues = [];
    page.on('console', (m) => {
      // The booking widget asks for /api/availability, which only exists on Netlify.
      if (m.type() === 'error' && !/api\/availability|status of 404/.test(m.text() + m.location().url)) issues.push(`console: ${m.text()}`);
    });
    page.on('pageerror', (e) => issues.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => issues.push(`failed: ${r.url()}`));
    page.on('response', (r) => {
      if (r.status() >= 400 && !/\/api\//.test(r.url()) && !/404/.test(path)) issues.push(`${r.status()}: ${r.url()}`);
    });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) issues.push(`sideways scroll: ${overflow}px`);
    console.log(`${issues.length ? 'FAIL' : 'ok  '} ${width} ${path}`);
    for (const i of [...new Set(issues)]) console.log(`       ${i}`);
    problems += issues.length;
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exit(problems ? 1 : 0);
