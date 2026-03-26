import { createClient } from '@supabase/supabase-admin'; // Asumiendo que existe o usamos fetch
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config({ path: 'apps/rrss-objetivo/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

// Para evitar dependencias pesadas en el script, usamos fetch directamente hacia la API de Supabase
async function insertPost(post: any) {
  const res = await fetch(`${supabaseUrl}/rest/v1/social_posts`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(post)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error Supabase: ${res.status} - ${err}`);
  }
  return res.json();
}

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  console.log(`🚀 Iniciando inyección social para ${records.length} artículos...`);

  // Spread de 90 días hacia atrás hasta hoy
  const totalDays = 90;
  
  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const daysAgo = Math.floor(((records.length - 1 - i) / records.length) * totalDays);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    // Inyectar para LinkedIn
    if (row.Post_LI && row.Post_LI.trim()) {
      const liPost = {
        content_text: row.Post_LI,
        platforms: ['linkedin'],
        status: 'pending', // Listo para que el scheduler lo tome
        scheduled_for: date.toISOString(),
        category_id: row.Tipo === 'Pilar' ? 'educativo' : 'noticias',
        topic: row.Silo,
        metadata: {
           linkedin_title: row.Título,
           source_slug: row.Slug
        }
      };
      try {
        await insertPost(liPost);
        console.log(`✅ [LI] Inyectado: ${row.Título.substring(0, 30)}...`);
      } catch (e: any) {
        console.error(`❌ [LI] Error en ${row.Título}: ${e.message}`);
      }
    }

    // Inyectar para Instagram
    if (row.Post_IG && row.Post_IG.trim()) {
      const igPost = {
        content_text: row.Post_IG,
        platforms: ['instagram'],
        status: 'pending',
        scheduled_for: date.toISOString(),
        category_id: row.Post_IG.includes('[CARRUSEL]') ? 'carrusel' : 'educativo',
        topic: row.Silo,
        metadata: {
           source_slug: row.Slug
        }
      };
      try {
        await insertPost(igPost);
        console.log(`✅ [IG] Inyectado: ${row.Título.substring(0, 30)}...`);
      } catch (e: any) {
        console.error(`❌ [IG] Error en ${row.Título}: ${e.message}`);
      }
    }
  }

  console.log("\n✨ Inyección social completada.");
}

main().catch(console.error);
