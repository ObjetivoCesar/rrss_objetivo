const dotenv = require('dotenv');
const path = require('path');

// Cargar variables antes de cualquier import de módulos del proyecto
const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

async function test() {
  console.log('🧪 Iniciando test de generación de imagen provocando FALLBACK...');
  
  // Sabotear HF para forzar fallback
  process.env.HUGGINGFACE_ACCESS_TOKEN = 'invalid_on_purpose';

  // Import dinámico para asegurar que el entorno ya está cargado
  const { generateAndUploadImage } = require('./apps/rrss-objetivo/src/lib/storage');

  const prompt = `A cute cat wearing a spacesuit, digital art style --seed ${Math.floor(Math.random() * 1000000)}`;
  const categoryId = 'social';
  
  try {
    const url = await generateAndUploadImage(prompt, categoryId);
    console.log('✅ Resultado final:', url);
    if (url.includes('supabase.co')) {
      console.log('🎉 ¡Imagen generada con Fallback y subida con éxito!');
    }
  } catch (e) {
    console.error('❌ El test falló:', e.message);
  }
}

test();
