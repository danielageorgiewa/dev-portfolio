// Fontsource's Inter subsets leave out most arrows (→ ← ↗ ↘ ×), so they would fall back
// to a system font. This cuts a tiny arrows-only subset from the full Inter files.
// Run once after an Inter update: node scripts/subset-arrows.mjs
import { readFile, writeFile } from 'node:fs/promises';
import subsetFont from 'subset-font';
const chars = '←↑→↓↔↖↗↘↙';
for (const [name, weight] of [['Light', 300], ['Regular', 400], ['Medium', 500]]) {
  const src = await readFile(`node_modules/inter-ui/web/Inter-${name}.woff2`);
  const out = await subsetFont(src, chars, { targetFormat: 'woff2' });
  await writeFile(`src/assets/fonts/inter-arrows-${weight}.woff2`, out);
  console.log(weight, out.length, 'bytes');
}
