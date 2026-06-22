import fs from 'fs';
import path from 'path';

// Leer .env.local manualmente para no depender de dotenv
const envPath = './.env.local';
let webhookUrl = '';
let secret = 'mi_super_secreto_123';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.startsWith('MAKE_WEBHOOK_URL=')) {
      webhookUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.startsWith('MAKE_WEBHOOK_SECRET=')) {
      secret = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  }
}

if (!webhookUrl) {
  console.error("❌ No se encontró MAKE_WEBHOOK_URL en .env.local");
  process.exit(1);
}

const payload = {
  api_secret: secret,
  version: "v2-media-link-fixed-101",
  post_id: "test-manual-" + Date.now(),
  text: "Prueba de mapeo directo 🚀 #objetivo",
  media_url: "https://vz-4b4d1e2c-063.b-cdn.net/7d9b7651-96ba-4098-b47a-e4502f880c98/play_720p.mp4",
  media_urls: [
    {
      media_type: "VIDEO",
      url: "https://vz-4b4d1e2c-063.b-cdn.net/7d9b7651-96ba-4098-b47a-e4502f880c98/play_720p.mp4",
      is_image: false,
      is_video: true
    }
  ],
  post_media_category: "video",
  platforms: ["instagram"],
  metadata: {
    youtube_title: "Test",
    youtube_description: "Test Desc"
  }
};

console.log("🚀 Enviando señal a Make.com...");
console.log("URL:", webhookUrl);

async function run() {
  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await resp.text();
    console.log("✅ Respuesta de Make:", resp.status, result);
    console.log("\n💡 RECUERDA: En Make, usa 'media_url' (singular) para el filtro 'Does not contain .mp4'");
  } catch (e) {
    console.error("❌ Error enviando:", e.message);
  }
}

run();
