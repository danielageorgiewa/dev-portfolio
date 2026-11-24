// SHA-256 hashes of the CV PDFs, read at build time from public/cv/SHA256SUMS.
// scripts/build-cv-pdfs.mjs writes that file; a hash is never typed by hand.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cvPdfHref, type Lang } from './i18n';

export const CV_SUMS_HISTORY_HREF = '/cv/SHA256SUMS.history';

const sums = new Map<string, string>();
for (const line of readFileSync(join(process.cwd(), 'public', 'cv', 'SHA256SUMS'), 'utf8').split('\n')) {
  const match = line.match(/^([0-9a-f]{64}) [ *](.+)$/);
  if (match) sums.set(match[2], match[1]);
}

export const cvPdfName = (lang: Lang): string => cvPdfHref(lang).split('/').pop() as string;

/** Fails the build when the PDF has no line in SHA256SUMS (run `npm run cv:pdf`). */
export function cvPdfSha256(lang: Lang): string {
  const hash = sums.get(cvPdfName(lang));
  if (!hash) throw new Error(`public/cv/SHA256SUMS has no hash for ${cvPdfName(lang)}. Run npm run cv:pdf.`);
  return hash;
}
