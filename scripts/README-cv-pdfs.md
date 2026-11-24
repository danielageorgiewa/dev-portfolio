# CV PDFs and their hashes

The two CV PDFs are the CV pages printed with their print styles. They are committed in
`public/cv/` together with their SHA-256 hashes, and the CV pages show those hashes so anyone
holding a copy of the PDF (an emailed one, for example) can check it against the site.

```
public/cv/daniela-georgieva-cv-en.pdf
public/cv/daniela-georgieva-cv-bg.pdf
public/cv/SHA256SUMS            hashes of the two current PDFs
public/cv/SHA256SUMS.history    hashes of every PDF that was replaced
```

## After any change to the CV copy

```
npm run build      # the PDFs are printed from dist/
npm run cv:pdf     # writes the PDFs, SHA256SUMS and, if a hash changed, a history line
npm run build      # the CV pages now show the new hashes
node scripts/check-site.mjs --base <preview url>
```

Then commit the PDFs, `SHA256SUMS` and `SHA256SUMS.history` with the copy change.

`cv:pdf` starts its own `astro preview`. If one is already running, pass it instead:
`npm run cv:pdf -- --base http://127.0.0.1:<port>`.

## One A4 page

Each PDF must be exactly one A4 page. The script prints where the sheet ends, in pt of the
842 pt page, and exits 1 if either PDF has more than one page. In that case **nothing is
written**: `public/cv/` keeps the last good PDFs and hashes.

The PDF can be shorter than the screen CV. In `src/content/cv.*.ts` a skill group can be
`screenOnly` (left out of the PDF), `printOnly` (only in the PDF) or carry `itemsPrint` (a
shorter line for the PDF).

## Same content, same bytes

The same CV content always gives the same PDF bytes, so the hash of an emailed PDF keeps
matching the site. Chromium stamps the time of the run and its own name and version into the
PDF; the last step of `build-cv-pdfs.mjs` (`normalisePdf`) replaces them with fixed values:

| Field                     | Value                                      |
| ------------------------- | ------------------------------------------ |
| `CreationDate`, `ModDate` | `CV_DATE`, the one date constant in the script |
| `Producer`, `Creator`     | `danielageorgieva.work`                    |

Chromium writes no document ID today; if it starts to, the script stops with an error
instead of producing a PDF whose hash changes on every run.

**Update `CV_DATE` only when the CV copy changes.** A new date changes both hashes.

To confirm: run `npm run cv:pdf` twice with no changes. Both runs print the same hashes and
nothing is added to the history. A different Chromium (a Playwright upgrade) can lay the page
out differently and so change the bytes; the old hash then goes to the history like any other.

## SHA256SUMS

`cv:pdf` writes `public/cv/SHA256SUMS` in `sha256sum` format, two spaces between hash and name:

```
<hash>  daniela-georgieva-cv-en.pdf
<hash>  daniela-georgieva-cv-bg.pdf
```

so this works in a folder that holds the three files:

```
sha256sum -c SHA256SUMS          # Linux
shasum -a 256 -c SHA256SUMS      # macOS
```

This file is the only source of the hashes. `src/cv-sums.ts` reads it at build time for the CV
pages, and the build fails if a PDF has no line in it. **Never type a hash by hand.**

`scripts/check-site.mjs` fails if `dist/cv/SHA256SUMS` does not match the PDFs in `dist/cv/`,
or if a CV page does not show both hashes.

## SHA256SUMS.history

When `cv:pdf` produces a PDF with a new hash, the hash it replaces is appended to
`public/cv/SHA256SUMS.history`, one line per retired PDF:

```
<date retired>  <language>  <hash>
```

A CV sent out before a change can still be checked against this file. **Lines are only ever
appended. Never rewrite or delete one.** The lines up to 24 November 2026 were taken from the
PDFs in the git history when the file was created.

## On the CV page

`src/components/cv/Checksums.astro` shows, under the download buttons, each PDF's file name
(a link to it), `SHA-256`, the full 64 characters and a Copy button, then one line on how to
check a copy and a link to `SHA256SUMS.history`. It is hidden in print, so it is not in the
PDF. The Copy button (`src/scripts/copy.ts`, part of the bundled script, so the
Content-Security-Policy needs no new hash) shows only when JavaScript runs. Its strings are
in `download.verify` in `src/content/cv.*.ts`.

`netlify.toml` serves both hash files as `text/plain`, so they open in the browser.

## After a deploy

```
cd "$(mktemp -d)"
for f in daniela-georgieva-cv-en.pdf daniela-georgieva-cv-bg.pdf SHA256SUMS; do
  curl -sO "https://danielageorgieva.work/cv/$f"
done
shasum -a 256 -c SHA256SUMS
```
