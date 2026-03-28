const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../apps/rrss-objetivo/.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026_SCHEDULED.csv';
  console.log(`📖 Leyendo ${csvPath}...`);
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const records = parse(fileContent, { columns: true, skip_empty_lines: true });

  console.log(`🚀 Iniciando inyección maestra para ${records.length} días de contenido estratégico...`);

  for (const row of records) {
    const scheduledAt = row.Scheduled_At;
    const title = row.Título;
    const silo = row.Silo;
    const slug = row.Slug;

    // 1. LinkedIn
    if (row.Post_LI && row.Post_LI.trim()) {
      await inject(row.Post_LI, ['linkedin'], scheduledAt, silo, title, slug);
    }
    // 2. Instagram
    if (row.Post_IG && row.Post_IG.trim()) {
      await inject(row.Post_IG, ['instagram'], scheduledAt, silo, title, slug);
    }
    // 3. Facebook
    if (row.Post_FB && row.Post_FB.trim()) {
      await inject(row.Post_FB, ['facebook'], scheduledAt, silo, title, slug);
    }
  }

  console.log("\n✨ Inyección Estratégica completada con éxito.");
}

async function inject(content, platforms, date, silo, title, slug) {
  const post = {
    content_text: content,
    platforms: platforms,
    status: 'pending',
    scheduled_for: date,
    category_id: content.includes('[CARRUSEL]') ? 'carrusel' : 'educativo',
    topic: silo,
    metadata: {
       source_slug: slug,
       title: title,
       original_id: slug
    }
  };

  const { error } = await supabase.from('social_posts').insert(post);
  
  if (error) {
    console.error(`❌ Error inyectando [${platforms}] ${title}:`, error.message);
  } else {
    console.log(`✅ [${platforms}] Inyectado para ${date}`);
  }
}

main().catch(console.error);
