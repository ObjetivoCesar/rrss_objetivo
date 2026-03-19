const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

async function testPredict() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const client = new GoogleGenAI({ apiKey });
  const modelId = "imagen-3.0-generate-001";

  try {
    console.log(`🧪 Testando predict con ${modelId}...`);
    // Intentar llamar a predict si existe
    if (typeof client.models.predict === 'function') {
      const response = await client.models.predict({
        model: modelId,
        instances: [{ prompt: "A beautiful sunset over the mountains" }]
      });
      console.log('✅ Predict exitoso:', JSON.stringify(response, null, 2));
    } else {
      console.log('❌ client.models.predict no es una función.');
      // Listar métodos disponibles en client.models
      console.log('Métodos en client.models:', Object.keys(client.models));
    }
  } catch (e) {
    console.error('❌ Error en predict:', e.message);
  }
}

testPredict();
