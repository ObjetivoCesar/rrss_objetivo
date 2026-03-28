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

const baseDir = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\public\\carruseles\\Carrusel 1\\";
const files = [
  "slide_1_hook.webp",
  "slide_2_pain.webp",
  "slide_3_agitation.webp",
  "slide_4_solution.webp",
  "slide_5_step1.webp",
  "slide_6_step2.webp",
  "slide_7_result.webp",
  "slide_8_cta.webp"
];

async function run() {
  console.log(`📤 Subiendo ${files.length} láminas para el carrusel completo...`);
  let urls = [];
  for (let i = 0; i < files.length; i++) {
    const fullPath = path.join(baseDir, files[i]);
    const buffer = fs.readFileSync(fullPath);
    const fileName = `full_carousel_${Date.now()}_${i}.webp`;
    const { error } = await supabase.storage.from('posts-assets').upload(fileName, buffer, { 
      contentType: 'image/webp',
      upsert: true 
    });
    
    if (error) {
      console.error(`❌ Error subiendo ${files[i]}:`, error.message);
      continue;
    }
    
    const { data: urlData } = supabase.storage.from('posts-assets').getPublicUrl(fileName);
    urls.push(urlData.publicUrl);
    console.log(`✅ [${i+1}/${files.length}] ${files[i]} -> OK`);
  }

  console.log(`📊 URLs generadas: ${urls.length}`);

  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: `test_full_${Date.now()}`,
    version: "v3-full-8-slides-fixed",
    text: "TEST: Carrusel Completo de 8 Láminas 👔 Autoridad B2B real.",
    media_url: urls[0],
    media_urls: urls.map(url => ({ url, media_type: 'IMAGE', is_image: true, type: 'photo' })),
    photo_urls: urls,
    facebook_photos: urls.map(url => ({ 
      url: url, 
      source: url, 
      type: 'Photo', 
      media_type: 'Photo' 
    })), 
    post_media_category: 'carousel',
    platforms: ['instagram', 'facebook'],
    metadata: {
      youtube_title: 'Autoridad B2B',
      youtube_description: 'Test',
    },
  };

  console.log("🚀 Enviando a Make...");
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (res.ok) {
    console.log("✅ ¡Webhook enviado con éxito! Status:", res.status);
  } else {
    const text = await res.text();
    console.error("❌ Error en Make:", res.status, text);
  }
}

run();
