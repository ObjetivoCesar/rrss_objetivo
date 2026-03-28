const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const files = [
  "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\public\\carruseles\\Carrusel 1\\slide_1_hook.webp",
  "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\public\\carruseles\\Carrusel 1\\slide_2_pain.webp"
];

async function run() {
  console.log("📤 Subiendo imágenes habituales a Supabase...");
  let urls = [];
  for (let i = 0; i < files.length; i++) {
    const buffer = fs.readFileSync(files[i]);
    const fileName = `carousel_fb_fix_${Date.now()}_${i}.webp`;
    const { data, error } = await supabase.storage.from('posts-assets').upload(fileName, buffer, {
      contentType: 'image/webp'
    });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('posts-assets').getPublicUrl(fileName);
    urls.push(urlData.publicUrl);
    console.log(`✅ Subida: ${urlData.publicUrl}`);
  }

  console.log("\n📦 Creando post en social_posts (Solo Facebook)...");
  const { data: post, error: postError } = await supabase.from('social_posts').insert({
    content_text: "Dominando a Google y la IA 👔 Autoridad B2B real para mentes estratégicas.",
    status: 'pending',
    scheduled_for: new Date(Date.now() - 60000).toISOString(), // 1 min ago to trigger now
    platforms: ['facebook'],
    topic: 'SEO e IA',
    category_id: 'carrusel',
    media_urls: urls,
    media_url: urls[0]
  }).select().single();

  if (postError) {
    console.error("❌ Error insertando post:", postError);
    return;
  }
  console.log(`✅ Post creado con ID: ${post.id}`);

  console.log("\n🚀 Disparando el Scheduler localmente...");
  try {
    const res = await fetch('http://localhost:3000/api/cron/trigger', { method: 'POST' });
    console.log("Status del Trigger:", res.status);
    const data = await res.json();
    console.log("Respuesta:", data);
  } catch (e) {
    console.error("❌ Error llamando al trigger local (¿Está el servidor encendido?):", e.message);
    
    // Fallback: Disparar el webhook de Make directamente si el servidor local no responde
    console.log("⚠️ Fallback: Intentando enviar directamente a Make.com...");
    const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
    const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;
    
    const mediaUrls = urls.map(url => ({
        media_type: 'IMAGE',
        url: url,
        image_url: url,
        video_url: null,
        type: 'image',
        is_link: false,
        is_image: true,
        is_video: false
    }));

    const payload = {
        api_secret: MAKE_WEBHOOK_SECRET,
        post_id: post.id,
        version: "v2-media-link-fixed-101",
        text: post.content_text,
        media_url: urls[0],
        media_urls: mediaUrls,
        post_media_category: 'carousel',
        platforms: ['facebook'],
        metadata: {},
    };

    const makeRes = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    
    if (makeRes.ok) {
        console.log("✅ Éxito directo en Make.com");
        await supabase.from('social_posts').update({ status: 'published' }).eq('id', post.id);
    } else {
        console.error("❌ Error directo en Make.com:", makeRes.status);
    }
  }
}

run();
