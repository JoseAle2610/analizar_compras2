// Script para generar íconos PWA a partir del favicon.svg
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '..', 'public');
const faviconSvg = path.join(publicDir, 'favicon.svg');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(faviconSvg);
  
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  
  console.log('✓ Generado pwa-192x192.png');
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  
  console.log('✓ Generado pwa-512x512.png');
  
  console.log('\n✅ Íconos PWA generados correctamente en /public/');
}

generateIcons().catch(console.error);
