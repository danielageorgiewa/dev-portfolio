// Crops a Figma composite export down to the frame itself.
// download_assets exports a frame that has a drop shadow together with a margin for the
// shadow (parent background on the left and below). The frame sits top right in the export.
// Usage: node scripts/crop-composite.mjs <export.png> <out.png> <frameCssWidth> <frameCssHeight> [scale=2]
import sharp from 'sharp';
const [src, out, w, h, scale = '2'] = process.argv.slice(2);
const s = Number(scale);
const meta = await sharp(src).metadata();
const width = Math.round(Number(w) * s);
const height = Math.round(Number(h) * s);
if (meta.width < width || meta.height < height) throw new Error(`export ${meta.width}x${meta.height} is smaller than the frame`);
await sharp(src).extract({ left: meta.width - width, top: 0, width, height }).png().toFile(out);
console.log(`${out}: ${width}x${height} (export was ${meta.width}x${meta.height})`);
