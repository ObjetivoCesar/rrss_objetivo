import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Cargar variables desde la app
const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontrados en', envPath);
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Re-implementación local de realizeMediaUrls para evitar dependencias circulares/hoisting
async function realizeMediaUrlsLocal(urls: string[], categoryId: string): Promise<string[]> {
  const realized: string[] = [];
  const BUCKET = 'posts-assets';

  for (const url of urls) {
    if (url.includes('image-proxy?prompt=')) {
      try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://dummy.com${url}`);
        const prompt = urlObj.searchParams.get('prompt');
        const seedStr = urlObj.searchParams.get('seed');
        const seed = seedStr ? parseInt(seedStr) : undefined;

        if (prompt) {
          // Lógica de hashing para buscar si ya existe
          const content = `${prompt}${seed || ''}`;
          const hash = crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
          const fileName = `ai_${hash}.webp`;

          console.log(`[Script] Buscando hash ${hash} para el prompt...`);

          // Verificar si ya existe
          const { data: files } = await supabaseAdmin.storage.from(BUCKET).list('', {
            search: fileName
          });

          if (files && files.length > 0) {
            const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
            console.log(`[Script] ♻️  Encontrada imagen existente!: ${data.publicUrl}`);
            realized.push(data.publicUrl);
            continue;
          }

          // Si no existe, intentamos realizarla de verdad (esto llamará a HF via el proxy o directo)
          // Pero en este script, mejor solo intentamos "re-vincular" si el usuario vio que ya estaba en Supabase.
          // O simplemente devolvemos la URL absoluta del proxy para que al menos sea válida para Make.
        }
      } catch (e) {
        console.error("Error parseando proxy URL:", e);
      }
    }
    
    // Si no es proxy o no pudimos realizarla, asegurar URL absoluta
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rrss.objetivo.ai";
    realized.push(url.startsWith('http') ? url : `${appUrl}${url}`);
  }
  return realized;
}

async function run() {
  console.log('🚀 Iniciando script de recuperación de URLs...');
  
  const { data: posts, error } = await supabaseAdmin
    .from('social_posts')
    .select('id, media_urls, category_id, media_url')
    .ilike('media_url', '%image-proxy%');

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`📊 Encontrados ${posts?.length || 0} posts con proxies.`);

  for (const post of posts || []) {
    const realized = await realizeMediaUrlsLocal(post.media_urls, post.category_id);
    
    if (realized[0] !== post.media_url) {
      console.log(`✅ Actualizando post ${post.id} -> ${realized[0]}`);
      await supabaseAdmin.from('social_posts').update({
        media_urls: realized,
        media_url: realized[0]
      }).eq('id', post.id);
    } else {
      console.log(`ℹ️ Post ${post.id} no cambió.`);
    }
  }
  
  console.log('🏁 Proceso completado.');
}

run();
