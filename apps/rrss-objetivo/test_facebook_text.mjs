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
    if (line.trim().startsWith('MAKE_WEBHOOK_URL=')) {
      webhookUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    }
    if (line.trim().startsWith('MAKE_WEBHOOK_SECRET=')) {
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
  post_id: "test-fb-text-" + Date.now(),
  text: "Prueba de publicación de SOLO TEXTO a Facebook 🚀 #objetivo #test",
  media_url: "", // Vacío para que el filtro de Make detecte que no es video/imagen
  media_urls: [],
  post_media_category: "text",
  platforms: ["facebook"],
  metadata: {
    test_mode: true,
    source: "antigravity-agent"
  }
};

console.log("🚀 Enviando señal de TEXTO a Facebook en Make.com...");
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
    console.log("\n💡 Enviado como 'facebook' con categoría 'text'.");
  } catch (e) {
    console.error("❌ Error enviando:", e.message);
  }
}

run();
