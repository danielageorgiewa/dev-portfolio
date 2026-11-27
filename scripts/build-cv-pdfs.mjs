// Renders the two CV PDFs from the CV pages with their print styles (headless Chromium).
//
//   node scripts/build-cv-pdfs.mjs                       serves dist/ with `astro preview` (run `npm run build` first)
//   node scripts/build-cv-pdfs.mjs --base http://localhost:4321    uses a site that is already running
//
// Writes public/cv/daniela-georgieva-cv-{en,bg}.pdf and fails (exit 1) unless each one is
// exactly one A4 page. Nothing is written when either PDF fails.
//
// The PDFs are normalised so the same CV content always gives the same bytes, and their
// SHA-256 hashes go to public/cv/SHA256SUMS (the CV pages read them from there). A hash that
// is replaced is appended to public/cv/SHA256SUMS.history, so older copies stay checkable.
// Everything here is committed; see scripts/README-cv-pdfs.md.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'cv');
const LANGS = ['en', 'bg'];
const A4_PT = { width: 595, height: 842 };
const SUMS = join(OUT_DIR, 'SHA256SUMS');
const HISTORY = join(OUT_DIR, 'SHA256SUMS.history');
const pdfName = (lang) => `daniela-georgieva-cv-${lang}.pdf`;

// The date written into both PDFs (CreationDate and ModDate). Change it only when the CV
// copy changes: a new date changes the bytes, and so the hash, of both PDFs.
const CV_DATE = '2026-11-27';
const PDF_INFO = {
  Creator: 'danielageorgieva.work',
  Producer: 'danielageorgieva.work',
  CreationDate: `D:${CV_DATE.replaceAll('-', '')}000000+00'00'`,
  ModDate: `D:${CV_DATE.replaceAll('-', '')}000000+00'00'`,
};

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

/**
 * Makes the PDF bytes depend on the CV content only: Chromium stamps the time of the run
 * into the document information, and its own name and version. Those four values are set to
 * the constants above, and the cross-reference table is moved to match the new lengths.
 */
function normalisePdf(pdf) {
  const src = pdf.toString('latin1'); // one char per byte
  const startxref = src.match(/startxref\s+(\d+)\s+%%EOF\s*$/);
  if (!startxref) throw new Error('PDF has no startxref');
  const xrefAt = Number(startxref[1]);
  const table = src.slice(xrefAt).match(/^xref\n0 (\d+)\n((?:\d{10} \d{5} [nf] \n)+)trailer\n/);
  if (!table) throw new Error('PDF has no plain cross-reference table (Chromium changed its output?)');
  const trailer = src.slice(xrefAt + table[0].length, startxref.index);
  if (/\/ID\b/.test(trailer)) throw new Error('PDF has a document ID, which normalisePdf does not fix yet');
  const info = trailer.match(/\/Info (\d+) 0 R/);
  if (!info) throw new Error('PDF has no Info dictionary');
  const entries = table[2].match(/\d{10} \d{5} [nf] \n/g);
  const infoAt = Number(entries[Number(info[1])].slice(0, 10));
  const infoEnd = src.indexOf('endobj', infoAt);
  const before = src.slice(infoAt, infoEnd);
  let after = before;
  for (const [key, value] of Object.entries(PDF_INFO)) {
    const field = new RegExp(`/${key} \\((?:[^()\\\\]|\\\\.)*\\)`);
    if (!field.test(after)) throw new Error(`PDF Info has no ${key}`);
    after = after.replace(field, () => `/${key} (${value})`);
  }
  const shift = after.length - before.length;
  const moved = (offset) => String(offset > infoAt ? offset + shift : offset).padStart(10, '0');
  const newTable = entries.map((e) => (e[17] === 'n' ? moved(Number(e.slice(0, 10))) + e.slice(10) : e)).join('');
  const out =
    src.slice(0, infoAt) +
    after +
    src.slice(infoEnd, xrefAt) +
    `xref\n0 ${table[1]}\n${newTable}trailer\n` +
    trailer +
    `startxref\n${Number(moved(xrefAt))}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

/** Hashes in a sha256sum file, by file name. */
function parseSums(text) {
  const sums = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([0-9a-f]{64}) [ *](.+)$/);
    if (m) sums[m[2]] = m[1];
  }
  return sums;
}

/**
 * Writes the PDFs and SHA256SUMS. A hash that changes is first appended to
 * SHA256SUMS.history as "date retired, language, hash". That file is only ever appended to.
 */
async function publish(pdfs) {
  const old = existsSync(SUMS) ? parseSums(await readFile(SUMS, 'utf8')) : {};
  const history = existsSync(HISTORY) ? await readFile(HISTORY, 'utf8') : '';
  const today = new Date().toISOString().slice(0, 10);
  let retired = '';
  let sums = '';
  for (const { lang, pdf } of pdfs) {
    const file = join(OUT_DIR, pdfName(lang));
    const hash = sha256(pdf);
    // Before SHA256SUMS existed, the PDF on disk is the published one.
    const previous = old[pdfName(lang)] ?? (existsSync(file) ? sha256(await readFile(file)) : undefined);
    if (previous && previous !== hash && !history.includes(previous)) {
      retired += `${today}  ${lang}  ${previous}\n`;
      console.log(`     ${lang.toUpperCase()} hash changed: ${previous} moved to SHA256SUMS.history`);
    }
    sums += `${hash}  ${pdfName(lang)}\n`;
    await writeFile(file, pdf);
    console.log(`     sha256 ${hash}  ${pdfName(lang)}`);
  }
  if (retired) await appendFile(HISTORY, retired);
  await writeFile(SUMS, sums);
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

  const rendered = [];
  for (const lang of LANGS) {
    const url = `${base}/${lang}/cv`;
    const file = join(OUT_DIR, pdfName(lang));
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

    const pdf = normalisePdf(
      await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        tagged: true,
      }),
    );
    await page.close();
    rendered.push({ lang, pdf });

    const pages = countPages(pdf);
    const ok = pages === 1;
    failed ||= !ok;
    console.log(
      `${ok ? 'ok  ' : 'FAIL'} ${file.replace(ROOT + '/', '')}: ${pages} page${pages === 1 ? '' : 's'}, ` +
        `${(pdf.length / 1024).toFixed(0)} KB, sheet ends at ${endPt.toFixed(0)} of ${A4_PT.height} pt`,
    );
    if (!ok) console.error(`     ${lang.toUpperCase()} CV must be exactly one A4 page.`);
  }
  if (failed) console.error('Nothing written: public/cv/ still has the last good PDFs.');
  else await publish(rendered);
} catch (err) {
  failed = true;
  console.error(err instanceof Error ? err.message : err);
} finally {
  await browser?.close();
  server?.stop();
}
process.exit(failed ? 1 : 0);
