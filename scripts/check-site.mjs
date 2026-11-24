// Cross-page smoke check against a running preview of dist/.
// Loads every page at 1440 and 390 with the generated Content-Security-Policy applied, scrolls
// through it, and reports console errors, failed requests, CSP violations and sideways scroll.
// Usage: node scripts/check-site.mjs [--base http://localhost:4321]
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const arg = process.argv.indexOf('--base');
const base = arg > -1 ? process.argv[arg + 1] : 'http://localhost:4321';
const slugs = ['multi-shop-platform', 'language-school-website', 'warehouse-management-system'];
const paths = ['en', 'bg'].flatMap((l) => [`/${l}/`, `/${l}/cv/`, ...slugs.map((s) => `/${l}/work/${s}/`), `/${l}/404/`]);
paths.push('/404.html', '/');

const headers = await readFile('dist/_headers', 'utf8');
const csp = headers.match(/Content-Security-Policy:\s*(.+)/)[1].trim();

let problems = 0;

// The CV hashes: dist/cv/SHA256SUMS must match the PDFs in dist/cv/, and each CV page must
// show exactly those hashes. A mismatch means cv:pdf or the build was skipped.
const sums = (await readFile('dist/cv/SHA256SUMS', 'utf8')).trim().split('\n').map((l) => l.match(/^([0-9a-f]{64})  (\S+)$/));
if (sums.length !== 2 || sums.some((m) => !m)) {
  console.log('FAIL dist/cv/SHA256SUMS: expected two "<hash>  <file>" lines');
  problems += 1;
} else {
  for (const [, hash, name] of sums) {
    const actual = createHash('sha256').update(await readFile(`dist/cv/${name}`)).digest('hex');
    const shown = (await Promise.all(['en', 'bg'].map((l) => readFile(`dist/${l}/cv/index.html`, 'utf8')))).every((html) => html.includes(hash));
    const ok = actual === hash && shown;
    console.log(`${ok ? 'ok  ' : 'FAIL'} sha256 ${name}`);
    if (actual !== hash) console.log(`       SHA256SUMS says ${hash}, the PDF is ${actual}. Run npm run cv:pdf, then build.`);
    else if (!shown) console.log('       a CV page does not show this hash. Run npm run build.');
    problems += ok ? 0 : 1;
  }
}

const browser = await chromium.launch();
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
