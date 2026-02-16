// generate-responsive.js
import { readdir, access } from 'fs/promises';
import { constants } from 'fs';
import sharp from 'sharp';
import { join } from 'path';

const imageDir = './public/image';   // adapte si besoin
const sizes = [320, 640, 1280, 1920];
const concurrency = 2;

let stats = { created: 0, skipped: 0, errors: 0 };

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function processImage(file, size) {
  const filePath = join(imageDir, file);
  const baseName = file.replace(/\.\w+$/, '');
  const webpPath = join(imageDir, `${baseName}-${size}.webp`);
  const avifPath = join(imageDir, `${baseName}-${size}.avif`);

  try {
    const metadata = await sharp(filePath).metadata();
    const actualWidth =
      metadata.orientation && metadata.orientation >= 5 && metadata.orientation <= 8
        ? metadata.height
        : metadata.width;

    if (actualWidth <= size) {
      console.log(`  ⚠️  ${file} (${actualWidth}px) ≤ ${size}px → pas de réduction utile`);
      stats.skipped++;
      return;
    }

    const webpExists = await fileExists(webpPath);
    const avifExists = await fileExists(avifPath);

    if (webpExists && avifExists) {
      console.log(`  ⚡ ${baseName}-${size} déjà présent, ignoré.`);
      stats.skipped++;
      return;
    }

    // Recrée une instance sharp à chaque fois
    if (!webpExists) {
      await sharp(filePath)
        .resize(size, null, { withoutEnlargement: false })
        .webp({ quality: 85 })
        .toFile(webpPath);
      stats.created++;
    }

    if (!avifExists) {
      await sharp(filePath)
        .resize(size, null, { withoutEnlargement: false })
        .avif({ quality: 80 })
        .toFile(avifPath);
      stats.created++;
    }

    console.log(`  ✅ ${baseName}-${size}.webp/.avif généré(s).`);
  } catch (err) {
    console.error(`  ❌ Erreur pour ${baseName}-${size}: ${err.message}`);
    stats.errors++;
  }
}

async function generateResponsiveImages() {
  const files = await readdir(imageDir);

  // Correction ici : exclut seulement les fichiers se terminant par -320, -640, etc.
  const sourceImages = files.filter(f =>
    !f.match(/-\d{3,}\.(avif|webp|jpg)$/) &&
    f.match(/\.(jpg|jpeg|png|webp|avif)$/i)
  );

  console.log('📂 Images sources détectées :', sourceImages, '\n');

  const tasks = [];
  for (const file of sourceImages) {
    console.log(`📸 Traitement de ${file}...`);
    for (const size of sizes) {
      tasks.push(() => processImage(file, size));
    }
  }

  // File d’attente limitée à `concurrency`
  let index = 0;
  async function runNext() {
    if (index >= tasks.length) return;
    const task = tasks[index++];
    await task();
    await runNext();
  }

  const runners = [];
  for (let i = 0; i < concurrency; i++) runners.push(runNext());

  await Promise.all(runners);

  console.log('\n📊 Résumé :');
  console.log(`   ➕ Créées : ${stats.created}`);
  console.log(`   ⚡ Ignorées : ${stats.skipped}`);
  console.log(`   ❌ Erreurs : ${stats.errors}`);
  console.log('\n🎉 Terminé !');
}

generateResponsiveImages();
