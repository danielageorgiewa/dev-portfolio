// Crops the hero portrait from the full-size photo (square 1060px at x 107, y 32, as in Figma node 43:67).
// Usage: node scripts/crop-portrait.mjs <path-to-photo-full.jpg>
import sharp from 'sharp';
const src = process.argv[2];
if (!src) throw new Error('Pass the path to photo-full.jpg');
await sharp(src).extract({ left: 107, top: 32, width: 1060, height: 1060 }).resize(880, 880).jpeg({ quality: 88, mozjpeg: true }).toFile('src/assets/portrait.jpg');
console.log('wrote src/assets/portrait.jpg');
