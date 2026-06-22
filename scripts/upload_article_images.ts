import fs from 'fs';
import path from 'path';

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

const images = [
  { file: 'art1-1.webp', article: 'Art-001.md', type: 'portada' },
  { file: 'art1-2.webp', article: 'Art-001.md', type: 'interna' },
  { file: 'art2-1.webp', article: 'Art-002.md', type: 'portada' },
  { file: 'art2-2.webp', article: 'Art-002.md', type: 'interna' },
  { file: 'art3-1.webp', article: 'Art-003.md', type: 'portada' },
  { file: 'art3-2.webp', article: 'Art-003.md', type: 'interna' },
];

const articlesDir = 'C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\estrategia-posicionamiento\\02-articulos';

async function uploadToBunny(filePath, fileName) {
  const content = fs.readFileSync(filePath);
  const bunnyPath = `articulos/${fileName}`;
  
  const res = await fetch(`https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${bunnyPath}`, {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: content,
  });

  if (!res.ok) throw new Error(`Error Bunny: ${res.status} - ${await res.text()}`);
  return `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
}

async function main() {
  const results = [];
  
  for (const img of images) {
    const filePath = path.join(articlesDir, img.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ No existe: ${img.file}`);
      continue;
    }

    try {
      console.log(`Subiendo ${img.file}...`);
      const url = await uploadToBunny(filePath, img.file);
      console.log(`✅ ${img.file} → ${url}`);
      
      // Delete local file after successful upload
      fs.unlinkSync(filePath);
      console.log(`🗑️ Eliminado local: ${img.file}`);
      
      results.push({ file: img.file, article: img.article, type: img.type, url });
    } catch (err) {
      console.error(`❌ Error con ${img.file}: ${err.message}`);
    }
  }

  console.log('\n📋 RESUMEN DE URLs:');
  for (const r of results) {
    console.log(`${r.article} (${r.type}): ${r.url}`);
  }
}

main().catch(console.error);