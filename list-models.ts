const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const envPath = path.join(process.cwd(), 'apps', 'rrss-objetivo', '.env.local');
dotenv.config({ path: envPath });

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  const client = new GoogleGenAI({ apiKey });

  try {
    console.log('--- Listado de Modelos Google AI ---');
    const response = await client.models.list();
    console.log(JSON.stringify(response, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

listModels();
