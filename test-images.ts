const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

async function testGenerateImages() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const client = new GoogleGenAI({ apiKey });
  const modelId = "imagen-3.0-generate-001";

  try {
    console.log(`🧪 Testando generateImages con ${modelId}...`);
    // Según la estructura típica de GenAI JS SDK para imágenes
    const result = await client.models.generateImages({
      model: modelId,
      prompt: "A beautiful sunset over the mountains",
      config: {
        number_of_images: 1,
        include_rai_reason: true
      }
    });

    if (result.images && result.images.length > 0) {
      console.log('✅ generateImages exitoso!');
      const image = result.images[0];
      if (image.base64) {
        console.log(`Base64 length: ${image.base64.length}`);
      } else if (image.bytes) {
        console.log(`Bytes length: ${image.bytes.length}`);
      }
    } else {
      console.log('❌ No se recibieron imágenes:', JSON.stringify(result, null, 2));
    }
  } catch (e) {
    console.error('❌ Error en generateImages:', e.message);
    // Ver el error completo
    console.error(e);
  }
}

testGenerateImages();
