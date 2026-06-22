/**
 * sync-csv-to-db.mjs
 * 
 * Lee el CSV de planificación de Metricool y lo importa a la tabla
 * social_posts de Supabase, listo para que el motor Meta API lo procese.
 *
 * USO:
 *   node scripts/sync-csv-to-db.mjs
 *   node scripts/sync-csv-to-db.mjs --dry-run    (solo muestra lo que haría)
 *   node scripts/sync-csv-to-db.mjs --file="ruta/al/archivo.csv"
 *
 * REQUISITOS:
 *   - .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   - La tabla social_posts debe tener una columna 'brand_name' TEXT
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Leer .env.local ──────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env = {};

  if (!fs.existsSync(envPath)) {
    console.error('❌ No se encontró .env.local');
    process.exit(1);
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = value;
  }

  return env;
}

// ─── Parser CSV robusto ───────────────────────────────────

/**
 * Parsea un CSV con soporte para:
 * - Campos entre comillas con saltos de línea internos
 * - Comillas dobles escapadas ("")
 * - Delimitador coma
 */
function parseCSV(content) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let fields = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        // Comilla escapada
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else if ((char === '\n' || (char === '\r' && next === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      fields.push(current);
      if (fields.some(f => f.trim())) {
        rows.push(fields);
      }
      fields = [];
      current = '';
    } else {
      current += char;
    }
  }

  // Última fila sin newline al final
  if (current || fields.length) {
    fields.push(current);
    if (fields.some(f => f.trim())) rows.push(fields);
  }

  return rows;
}

// ─── Mapeo de columnas CSV → social_posts ────────────────

/**
 * Columnas del CSV de Metricool (en orden exacto del header):
 * Text, Date, Time, Draft, Facebook, X/Twitter, LinkedIn, GBP,
 * Instagram, Pinterest, TikTok, Youtube, Threads, Bluesky,
 * Picture Url 1..10, Shortener, First Comment Text, Video Thumbnail Url,
 * Video Cover Frame, Pinterest Board, Pinterest Pin Title, Pinterest Pin Link,
 * Pinterest Pin New Format, Instagram Post Type, Instagram Show Reel On Feed,
 * Youtube Video Title, Youtube Video Type, Youtube Video Privacy,
 * Youtube video for kids, Youtube Video Category, Youtube Video Tags,
 * GBP Post Type, Facebook Post Type, Facebook Title, Tiktok Title,
 * TikTok disable comments, TikTok disable duet, TikTok disable stitch,
 * TikTok Post Privacy, TikTok Branded Content, TikTok Your Brand,
 * TikTok Auto Add Music, Document title, LinkedIn Show link preview,
 * LinkedIn Images as Carousel, brand name
 */
function mapRowToPost(headers, values) {
  const row = {};
  headers.forEach((h, i) => {
    row[h.trim()] = (values[i] || '').trim();
  });

  // Extraer plataformas activas
  const platforms = [];
  if (row['Facebook']?.toUpperCase()  === 'TRUE') platforms.push('facebook');
  if (row['Instagram']?.toUpperCase() === 'TRUE') platforms.push('instagram');
  if (row['LinkedIn']?.toUpperCase()  === 'TRUE') platforms.push('linkedin');
  if (row['TikTok']?.toUpperCase()    === 'TRUE') platforms.push('tiktok');
  if (row['Youtube']?.toUpperCase()   === 'TRUE') platforms.push('youtube');

  // Construir array de media URLs
  const mediaUrls = [];
  for (let i = 1; i <= 10; i++) {
    const url = row[`Picture Url ${i}`];
    if (url && url.startsWith('http')) mediaUrls.push(url);
  }

  // Detectar tipo de media principal
  const primaryUrl = mediaUrls[0] || null;
  const isVideo = primaryUrl
    ? primaryUrl.toLowerCase().includes('.mp4') || primaryUrl.toLowerCase().includes('/play/')
    : false;

  // Construir timestamp UTC
  // El CSV viene en hora local (Ecuador = UTC-5)
  let scheduledFor = null;
  if (row['Date'] && row['Time']) {
    const dateStr = `${row['Date']}T${row['Time']}-05:00`;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      scheduledFor = parsed.toISOString();
    }
  }

  // Determinar si es borrador
  const isDraft = row['Draft']?.toUpperCase() === 'TRUE';

  // Instagram Post Type
  const igPostType = row['Instagram Post Type'] || 'POST';

  // Metadatos adicionales
  const metadata = {
    instagram_post_type: igPostType,
    instagram_show_reel_on_feed: row['Instagram Show Reel On Feed']?.toUpperCase() === 'TRUE',
    youtube_title: row['Youtube Video Title'] || '',
    youtube_privacy: row['Youtube Video Privacy'] || 'public',
    tiktok_title: row['Tiktok Title'] || '',
    first_comment: row['First Comment Text'] || '',
    linkedin_carousel: row['LinkedIn Images as Carousel']?.toUpperCase() === 'TRUE',
  };

  return {
    content_text: row['Text'] || '',
    platforms,
    media_url: primaryUrl,
    media_urls: mediaUrls,
    scheduled_for: scheduledFor,
    status: isDraft ? 'draft' : 'pending',
    brand_name: row['brand name'] || 'objetivo',
    post_media_category: isVideo ? 'video' : (mediaUrls.length > 1 ? 'carousel' : 'image'),
    metadata,
    // Fingerprint para evitar duplicados
    _csv_fingerprint: `${row['Date']}_${row['Time']}_${(row['Text'] || '').slice(0, 50)}`,
  };
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArg = args.find(a => a.startsWith('--file='));

  // Ruta al CSV
  const csvPath = fileArg
    ? fileArg.split('=')[1]
    : path.resolve(
        process.cwd(),
        '../../planificacion-rrss/Plantilla de Estrategia Social Media - 📝 PLANIFICACIÓN.csv'
      );

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ No se encontró el CSV en: ${csvPath}`);
    process.exit(1);
  }

  console.log(`📂 Leyendo CSV: ${csvPath}`);
  if (isDryRun) console.log('🔍 MODO DRY-RUN: No se insertará nada en la base de datos.\n');

  // Parsear CSV
  const content = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(content);
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    console.error('❌ El CSV está vacío o no tiene encabezados.');
    process.exit(1);
  }

  console.log(`📊 Filas encontradas: ${dataRows.length}\n`);

  // Conectar a Supabase
  const env = loadEnv();
  const supabase = createClient(
    env['NEXT_PUBLIC_SUPABASE_URL'],
    env['SUPABASE_SERVICE_ROLE_KEY']
  );

  // Procesar filas
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of dataRows) {
    const post = mapRowToPost(headerRow, row);

    if (!post.content_text) {
      skipped++;
      continue;
    }

    if (!post.scheduled_for) {
      console.warn(`⚠️ Fila sin fecha válida — "${post.content_text.slice(0, 40)}..."`);
      skipped++;
      continue;
    }

    console.log(`📝 [${post.brand_name}] ${post.scheduled_for} → ${post.content_text.slice(0, 60)}...`);
    console.log(`   Plataformas: ${post.platforms.join(', ')} | Media: ${post.post_media_category}`);

    if (!isDryRun) {
      const { _csv_fingerprint, ...postData } = post;

      const { error } = await supabase
        .from('social_posts')
        .insert(postData);

      if (error) {
        // Verificar si ya existe (duplicado)
        if (error.code === '23505') {
          console.log(`   ⏭️ Ya existe en la base de datos — omitiendo.`);
          skipped++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          errors++;
        }
      } else {
        console.log(`   ✅ Insertado`);
        inserted++;
      }
    } else {
      inserted++;
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`✅ Insertados: ${inserted}`);
  console.log(`⏭️ Omitidos:  ${skipped}`);
  console.log(`❌ Errores:   ${errors}`);
  if (isDryRun) console.log(`\n💡 Ejecuta sin --dry-run para insertar realmente.`);
}

main().catch(err => {
  console.error('💥 Error fatal:', err.message);
  process.exit(1);
});
