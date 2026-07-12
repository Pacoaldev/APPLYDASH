import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const sizes = [16, 32, 48, 128];
const svgPath = path.join(root, 'public', 'applydashlogo.svg');
const outDir = path.join(root, 'extension', 'icons');

for (const size of sizes) {
  // The SVG is 1024x1536 (portrait 2:3 ratio).
  // Render at full portrait size, then crop the center square.
  const renderWidth = size;
  const renderHeight = Math.round(size * 1.5);
  const density = Math.min(Math.round(size * 1.5), 300);
  const cropTop = Math.round((renderHeight - renderWidth) / 2);

  await sharp(svgPath, { density })
    .resize(renderWidth, renderHeight, { fit: 'fill' })
    .extract({ left: 0, top: cropTop, width: renderWidth, height: renderWidth })
    .png()
    .toFile(path.join(outDir, `icon-${size}.png`));
  console.log(`Generated icon-${size}.png`);
}
