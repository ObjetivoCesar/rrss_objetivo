const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

async function testGenerateImages() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  // Probar con v1 si v1beta falla
  const client = new GoogleGenAI({ apiKey }); 

  try {
    // Probar varios IDs de modelo
    const modelsToTest = [
      "imagen-3.0-generate-001",
      "imagen-3.0-fast-generate-001",
      "imagen-4.0-fast-generate-001"
    ];

    for (const modelId of modelsToTest) {
      console.log(`🧪 Probando ${modelId}...`);
      try {
        const result = await client.models.generateImages({
          model: modelId,
          prompt: "A beautiful sunset over the mountains",
        });

        if (result.images && result.images.length > 0) {
          console.log(`✅ ${modelId} exitoso!`);
          return;
        }
      } catch (e) {
        console.log(`❌ ${modelId} falló: ${e.message}`);
      }
    }
  } catch (e) {
    console.error('❌ Error fatal:', e.message);
  }
}

testGenerateImages();
