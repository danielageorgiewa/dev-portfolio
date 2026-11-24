// Renders the two CV PDFs from the CV pages with their print styles (headless Chromium).
//
//   node scripts/build-cv-pdfs.mjs                       serves dist/ with `astro preview` (run `npm run build` first)
//   node scripts/build-cv-pdfs.mjs --base http://localhost:4321    uses a site that is already running
//
// Writes public/cv/daniela-georgieva-cv-{en,bg}.pdf and fails (exit 1) unless each one is
// exactly one A4 page. The PDFs are committed; see scripts/README-cv-pdfs.md.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'cv');
const LANGS = ['en', 'bg'];
const A4_PT = { width: 595, height: 842 };

const args = process.argv.slice(2);
const baseArg = args.includes('--base') ? args[args.indexOf('--base') + 1] : undefined;
if (args.includes('--base') && !baseArg) {
  console.error('Usage: node scripts/build-cv-pdfs.mjs [--base <url>]');
  process.exit(2);
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });

async function waitFor(url, child, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (child.exitCode !== null) throw new Error(`astro preview exited with code ${child.exitCode}`);
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

/** Starts `astro preview` on a free port against the existing dist/. */
async function startPreview() {
  if (!existsSync(join(ROOT, 'dist', 'en', 'cv', 'index.html'))) {
    throw new Error('dist/en/cv/index.html not found. Run `npm run build` first, or pass --base <url>.');
  }
  const port = await freePort();
  const child = spawn(
    process.execPath,
    [join(ROOT, 'node_modules', 'astro', 'bin', 'astro.mjs'), 'preview', '--port', String(port), '--host', '127.0.0.1'],
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
  );
  const base = `http://127.0.0.1:${port}`;
  await waitFor(`${base}/en/cv`, child);
  return { base, stop: () => child.kill('SIGTERM') };
}

/** Page count of a Chromium PDF: page objects are written uncompressed. */
function countPages(pdf) {
  const text = pdf.toString('latin1');
  return (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) ?? []).length;
}

let server;
let browser;
let failed = false;
try {
  let base = baseArg;
  if (!base) {
    server = await startPreview();
    base = server.base;
  }
  base = base.replace(/\/+$/, '');

  await mkdir(OUT_DIR, { recursive: true });
  browser = await chromium.launch();
  // Reduced motion: the load animation is skipped, so the page is in its final state.
  const context = await browser.newContext({ reducedMotion: 'reduce' });

  for (const lang of LANGS) {
    const url = `${base}/${lang}/cv`;
    const file = join(OUT_DIR, `daniela-georgieva-cv-${lang}.pdf`);
    const page = await context.newPage();
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (!res || !res.ok()) throw new Error(`${url} answered ${res ? res.status() : 'nothing'}`);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(() => document.fonts.ready);

    // Where the sheet ends (bottom padding included), in pt from the top of the 842 pt page.
    const endPt = await page.evaluate(() => {
      const sheet = document.querySelector('.cv');
      return sheet ? (sheet.getBoundingClientRect().bottom + window.scrollY) * 0.75 : 0;
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });
    await writeFile(file, pdf);
    await page.close();

    const pages = countPages(await readFile(file));
    const ok = pages === 1;
    failed ||= !ok;
    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${file.replace(ROOT + '/', '')}: ${pages} page${pages === 1 ? '' : 's'}, ` +
        `${(pdf.length / 1024).toFixed(0)} KB, sheet ends at ${endPt.toFixed(0)} of ${A4_PT.height} pt`,
    );
    if (!ok) console.error(`     ${lang.toUpperCase()} CV must be exactly one A4 page.`);
  }
} catch (err) {
  failed = true;
  console.error(err instanceof Error ? err.message : err);
} finally {
  await browser?.close();
  server?.stop();
}
process.exit(failed ? 1 : 0);
