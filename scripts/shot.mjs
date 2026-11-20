// Full-page screenshot of a local page, for side-by-side checks against Figma.
// Usage: node scripts/shot.mjs <url> <width> <out.png> [--no-js] [--reduced-motion]
import { chromium } from 'playwright';
const [url, width, out, ...flags] = process.argv.slice(2);
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: Number(width), height: 900 },
  deviceScaleFactor: 1,
  javaScriptEnabled: !flags.includes('--no-js'),
  reducedMotion: flags.includes('--reduced-motion') ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('wrote', out);
