import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: 'apps/rrss-objetivo/.env.local' });

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

async function uploadToBunny(filePath: string, fileName: string) {
  const content = fs.readFileSync(filePath);
  const bunnyPath = `articulos/${fileName}`;
  const res = await fetch(`https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${bunnyPath}`, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'application/octet-stream' },
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

  // 1. Subir imagen genérica
  const genericLocalPath = 'c:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\apps\\rrss-objetivo\\public\\images\\blog\\cesar-reyes-trabajando.webp';
  let genericUrl = '';
  try {
    genericUrl = await uploadToBunny(genericLocalPath, 'cesar-reyes-marca-generica.webp');
    console.log(`✅ Imagen genérica subida: ${genericUrl}`);
  } catch (e) {
    console.error("Fallo al subir genérica, usando fallback manual.");
    genericUrl = `${BUNNY_PULLZONE_URL}/articulos/cesar-reyes-marca-generica.webp`;
  }

  // 2. Actualizar artículos que NO tienen URL completa (solo nombre de archivo)
  const [result] = await connection.execute(
    "UPDATE articles SET cover_image = ? WHERE cover_image NOT LIKE 'http%' OR cover_image IS NULL",
    [genericUrl]
  );

  console.log(`🚀 Se actualizaron ${(result as any).affectedRows} artículos con la imagen genérica.`);

  await connection.end();
  process.exit(0);
}

main().catch(console.error);
