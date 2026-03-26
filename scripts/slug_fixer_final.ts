import mysql from 'mysql2/promise';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config({ path: 'apps/rrss-objetivo/.env.local' });

function sanitizeTitle(rawTitle: string): string {
  return rawTitle
    .replace(/:/g, '')
    .replace(/[?!¿¡]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '42903'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  for (const row of records) {
    const rawTitle = row.Título;
    const shortSlug = row.Slug;

    if (!shortSlug || !rawTitle) continue;

    const title = sanitizeTitle(rawTitle);
    
    try {
      const [result] = await connection.execute(
        "UPDATE articles SET slug = ? WHERE title = ?",
        [shortSlug, title]
      );
      if ((result as any).affectedRows > 0) {
        console.log(`✅ ${shortSlug}`);
      } else {
        // Segundo intento con Título tal cual del CSV (sin sanitizar)
         const [result2] = await connection.execute(
            "UPDATE articles SET slug = ? WHERE title = ?",
            [shortSlug, rawTitle]
          );
          if ((result2 as any).affectedRows > 0) {
             console.log(`✅ ${shortSlug} (Match raw)`);
          } else {
             console.log(`⚠️ Fallo: ${title.substring(0, 20)}`);
          }
      }
    } catch (e: any) {
      console.error(`❌ Error: ${e.message}`);
    }
  }

  await connection.end();
}

main().catch(console.error);
