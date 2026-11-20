// Rough scroll smoothness check: wheel-scrolls a page and reports frame times and how far
// the page moves. Usage: node scripts/scroll-perf.mjs <url> [cpuSlowdown=4]
import { chromium } from 'playwright';
const [url, slow = '4'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const cdp = await page.context().newCDPSession(page);
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(slow) });
await page.evaluate(() => {
  window.__f = [];
  let last = performance.now();
  requestAnimationFrame(function loop(t) {
    window.__f.push(t - last);
    last = t;
    requestAnimationFrame(loop);
  });
});
await page.mouse.move(700, 450);
const t0 = Date.now();
for (let i = 0; i < 120; i++) {
  await page.mouse.wheel(0, 100);
  await page.waitForTimeout(16);
}
const elapsed = Date.now() - t0;
await page.waitForTimeout(600);
const r = await page.evaluate(() => {
  const f = window.__f.slice().sort((a, b) => a - b);
  const q = (p) => f[Math.floor(f.length * p)];
  return { frames: f.length, median: q(0.5), p95: q(0.95), worst: f[f.length - 1], over33: f.filter((x) => x > 33).length, y: scrollY };
});
console.log(url, `wheel 12000px in ${elapsed}ms ->`, JSON.stringify(r, (k, v) => (typeof v === 'number' ? Math.round(v) : v)));
await browser.close();
