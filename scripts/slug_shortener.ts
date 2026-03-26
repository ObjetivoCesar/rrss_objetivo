import pool from '../apps/rrss-objetivo/src/lib/mysql';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

function sanitizeTitle(rawTitle: string): string {
  return rawTitle
    .replace(/:/g, '')
    .replace(/[?!¿¡]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  console.log(`🚀 Iniciando acortamiento de slugs para ${records.length} artículos...`);

  for (const row of records) {
    const rawTitle = row.Título;
    const shortSlug = row.Slug; // Columna 10

    if (!shortSlug || !rawTitle) continue;

    const title = sanitizeTitle(rawTitle);
    console.log(`Intentando match: "${title.substring(0, 30)}..." -> ${shortSlug}`);

    try {
      const [result] = await pool.query(
        "UPDATE articles SET slug = ? WHERE title = ?",
        [shortSlug, title]
      );
      if ((result as any).affectedRows > 0) {
        console.log(`✅ Actualizado: ${shortSlug}`);
      } else {
        console.log(`⚠️ No se encontró: "${title.substring(0,20)}..."`);
      }
    } catch (e: any) {
      console.error(`❌ Error en ${title}:`, e.message);
    }
  }

  await pool.end();
  console.log("\n✨ Slugs optimizados!");
  process.exit(0);
}

main().catch(console.error);
