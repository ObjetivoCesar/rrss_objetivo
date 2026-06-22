import fs from 'fs';
import path from 'path';

// Leer .env.local manualmente
const envPath = './.env.local';
let webhookUrl = '';
let secret = 'mi_super_secreto_123';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('MAKE_WEBHOOK_URL=')) {
      webhookUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.trim().startsWith('MAKE_WEBHOOK_SECRET=')) {
      secret = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  }
}

const payload = {
  api_secret: secret,
  version: "v2-media-link-fixed-101",
  post_id: "entrerios-" + Date.now(),
  text: "Compartiendo con nuestros amigos de Entre Rios",
  media_url: "https://cesarweb.b-cdn.net/activaqr/entre%20rios.webp",
  media_urls: [
    {
      media_type: "IMAGE",
      url: "https://cesarweb.b-cdn.net/activaqr/entre%20rios.webp",
      is_image: true,
      is_video: false
    }
  ],
  post_media_category: "image",
  platforms: ["facebook"],
  metadata: {
    location: "Entre Rios",
    source: "antigravity-bridge"
  }
};

console.log("🚀 Lanzando POST de Entre Rios a Facebook...");
console.log("URL Webhook:", webhookUrl);

async function run() {
  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await resp.text();
    console.log("✅ Respuesta de Make:", resp.status, result);
  } catch (e) {
    console.error("❌ Error en el puente:", e.message);
  }
}

run();
