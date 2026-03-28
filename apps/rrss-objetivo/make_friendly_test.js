const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const files = [
  "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\public\\carruseles\\Carrusel 1\\slide_1_hook.webp",
  "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\public\\carruseles\\Carrusel 1\\slide_2_pain.webp"
];

async function run() {
  console.log("📤 Subiendo imágenes...");
  let urls = [];
  for (let i = 0; i < files.length; i++) {
    const buffer = fs.readFileSync(files[i]);
    const fileName = `make_friendly_fix_${Date.now()}_${i}.webp`;
    await supabase.storage.from('posts-assets').upload(fileName, buffer, { contentType: 'image/webp' });
    const { data: urlData } = supabase.storage.from('posts-assets').getPublicUrl(fileName);
    urls.push(urlData.publicUrl);
  }

  const { data: post } = await supabase.from('social_posts').insert({
    content_text: "Dominando a Google y la IA 👔 Autoridad B2B real para mentes estratégicas.",
    status: 'pending',
    scheduled_for: new Date().toISOString(),
    platforms: ['facebook'],
    topic: 'SEO e IA',
    category_id: 'carrusel',
    media_urls: urls,
    media_url: urls[0]
  }).select().single();

  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: post.id,
    version: "v2-media-link-fixed-102-friendly",
    text: post.content_text,
    media_url: urls[0],
    media_urls: urls.map(url => ({ url, media_type: 'IMAGE', is_image: true })), // Array de objetos (Legacy)
    photo_urls: urls, // <--- NUEVO: Array de strings (Friendly)
    video_urls: [],
    post_media_category: 'image',
    platforms: ['facebook'],
    metadata: {
      youtube_title: 'Demo',
      youtube_description: 'Demo',
      linkedin_title: '',
      tiktok_privacy: 'public_to_everyone',
      tiktok_disable_comment: false,
      tiktok_disable_duet: false,
    },
  };

  console.log("🚀 Enviando payload Make-friendly...");
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (res.ok) {
    console.log("✅ ¡Éxito en Make! Status:", res.status);
    await supabase.from('social_posts').update({ status: 'published' }).eq('id', post.id);
  } else {
    const text = await res.text();
    console.error("❌ Error en Make:", res.status, text);
    await supabase.from('social_posts').update({ status: 'failed', error_log: text }).eq('id', post.id);
  }
}

run();
