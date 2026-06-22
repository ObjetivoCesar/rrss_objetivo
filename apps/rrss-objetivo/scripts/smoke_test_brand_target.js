import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

async function testBrandTarget() {
  const dsKey = process.env.DEEPSEEK_API_KEY;
  if (!dsKey) {
    console.error("No DEEPSEEK_API_KEY found in .env.local");
    return;
  }
  const dsp = createDeepSeek({ apiKey: dsKey });
  
  const testCases = [
    { text: "César: hazme un carrusel sobre cómo funciona nuestro CRM de Hexadent." },
    { text: "César: créame un post hablando de cómo manejo el TDAH en mi día a día empresarial." },
    { text: "César: quiero un post promocionando las tarjetas con NFC por $60." },
    { text: "César: haz un guion sobre los 3 peores errores de marketing." }
  ];

  for (const tc of testCases) {
    const reasonerPrompt = `Eres el Agente Razonador de Donna. Tu única misión es clasificar la intención de César y estructurar un plan de acción JSON.
CONTEXTO RECIENTE:
${tc.text}

Devuelve ÚNICAMENTE un JSON válido (sin markdown) con esta estructura exacta:
{
  "mode": 1, 
  "intent_summary": "Qué quiere el usuario brevemente",
  "detected_skill": "none" | "carousel-engine" | "video-script-engine" | "seo-master" | "humanizer" | "visual-slides-pro" | "donna-memory",
  "brand_target": "cesar_reyes" | "objetivo" | "activaqr" | "preguntar",
  "primary_action": "none"
}

REGLA PARA brand_target:
- Si el contexto indica claramente para qué marca es el contenido/acción, asígnala ("cesar_reyes", "objetivo", "activaqr").
- Si es ambiguo o el usuario no especificó la marca, DEBES poner "preguntar".`;

    const { text } = await generateText({
      model: dsp('deepseek-chat'),
      messages: [{ role: 'user', content: reasonerPrompt }]
    });

    console.log(`Input: ${tc.text}`);
    console.log(`Output: ${text}`);
    console.log('---');
  }
}

testBrandTarget().catch(console.error);
