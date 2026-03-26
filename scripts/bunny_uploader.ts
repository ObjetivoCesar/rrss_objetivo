import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: 'apps/rrss-objetivo/.env.local' });

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

const artifactDir = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\dcd02b8d-cc21-4998-a81d-9f400a49676d';

const mapping = [
  { file: 'portada_ia_ecuador_casos_reales_1774375909375.png', slug: 'ia-ecuador-casos-reales' },
  { file: 'portada_error_marketing_familiar_2026_1774378705260.png', slug: 'error-marketing-familiar-pymes' },
  { file: 'portada_seo_local_maps_2026_v2_1774379800627.png', slug: 'guia-definitiva-seo-local' },
  { file: 'portada_activaqr_networking_2026_1774380305318.png', slug: 'networking-para-ceos' },
  { file: 'portada_infraestructura_vs_bonita_2026_1774380285047.png', slug: 'arquitectura-conversion-eficiencia' }
];

async function uploadToBunny(filePath: string, fileName: string) {
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

  if (!res.ok) throw new Error(`Error Bunny: ${res.status}`);
  return `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '42903'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  for (const item of mapping) {
    const filePath = path.join(artifactDir, item.file);
    if (!fs.existsSync(filePath)) {
       console.log(`⚠️ No existe el archivo local: ${item.file}`);
       continue;
    }

    try {
      console.log(`Subiendo ${item.file}...`);
      const publicUrl = await uploadToBunny(filePath, item.file);
      console.log(`✅ URL: ${publicUrl}`);

      await connection.execute(
        "UPDATE articles SET cover_image = ? WHERE slug = ?",
        [publicUrl, item.slug]
      );
      console.log(`🚀 DB Actualizada para slug: ${item.slug}`);
    } catch (e: any) {
      console.error(`❌ Fallo en ${item.slug}: ${e.message}`);
    }
  }

  await connection.end();
  process.exit(0);
}

main().catch(console.error);
