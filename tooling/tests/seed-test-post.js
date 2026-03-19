require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function crearPostTest() {
  console.log("🚀 Creando post de prueba en Supabase...");
  
  const { data, error } = await supabase
    .from('social_posts')
    .insert([
      {
        content_text: "¡Prueba Real! Este es el primer post automático inyectado desde el nuevo Cerebro RRSS hacia Facebook. 🚀✨ #RRSSObjetivo #Automation",
        media_url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=1080&h=1080&fit=crop", 
        platforms: ['facebook'],
        scheduled_for: new Date(Date.now() + 60000).toISOString(), // Programado para dentro de 1 minuto
        status: 'pending'
      }
    ])
    .select();

  if (error) {
    console.error("❌ Error al insertar en Supabase:", error.message);
  } else {
    console.log("✅ Post de prueba creado con ID:", data[0].id);
    console.log("🕒 Programado para:", data[0].scheduled_for);
    console.log("\nSiguiente paso: Ejecuta el script de simulación para disparar este post a Make.");
  }
}

crearPostTest();
