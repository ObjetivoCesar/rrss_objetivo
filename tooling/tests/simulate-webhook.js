require('dotenv').config();

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET || "mi_super_secreto_123";

/**
 * Función que simula al Backend/Cron enviando un post programado a Make.
 */
async function dispararAMake() {
  if (!MAKE_WEBHOOK_URL) {
    console.error("❌ ERROR: No has definido MAKE_WEBHOOK_URL en el archivo .env");
    return;
  }

  // Payload estructurado según la Skill "make-automation"
  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: `post-test-${Date.now()}`,
    text: "🚀 ¡Hola desde el simulador del backend! Probando automatización de RRSS. #Prueba #OmniEditor",
    // En API reales de Make, pasamos un enlace crudo (ej. foto de Unsplash para prueba)
    media_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1080&h=1080&fit=crop", 
    platforms: ["facebook"] // Array con opciones: facebook, instagram, twitter
  };

  console.log("📤 Disparando webhook a Make.com...");
  console.log(JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log("✅ ¡Make.com recibió el webhook exitosamente HTTP 200!");
      // Nota: Aquí Make toma el control. Make publicará y luego Make nos llamará de vuelta
    } else {
      console.error(`❌ Make respondió con error HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("🔥 Falla de conexión con Make:", error.message);
  }
}

dispararAMake();
