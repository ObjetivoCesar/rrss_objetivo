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
  console.log("📤 Subiendo exactamente 2 láminas...");
  let urls = [];
  for (let i = 0; i < files.length; i++) {
    const buffer = fs.readFileSync(files[i]);
    const fileName = `final_test_2_slides_${Date.now()}_${i}.webp`;
    await supabase.storage.from('posts-assets').upload(fileName, buffer, { 
      contentType: 'image/webp',
      upsert: true 
    });
    const { data: urlData } = supabase.storage.from('posts-assets').getPublicUrl(fileName);
    urls.push(urlData.publicUrl);
  }

  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: `test_2_photos_${Date.now()}`,
    version: "v3-final-dual-test",
    text: "TEST: Carrusel de 2 Láminas 👔 Autoridad B2B.",
    media_url: urls[0],
    media_urls: urls.map(url => ({ url, media_type: 'IMAGE', is_image: true })),
    facebook_photos: urls.map((url, i) => ({ 
      url: url, 
      filename: `slide_${i + 1}.webp`
    })), 
    post_media_category: 'carousel',
    platforms: ['instagram', 'facebook']
  };

  console.log("🚀 Enviando prueba a Make...");
  const res = await fetch(MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (res.ok) {
    console.log("✅ ¡Enviado! Revisa el historial de Make.");
  } else {
    const text = await res.text();
    console.error("❌ Error:", res.status, text);
  }
}

run();
