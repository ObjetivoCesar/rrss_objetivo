import { GoogleGenAI } from "@google/genai";
import { getAllUniqueGeminiKeys } from "../pipeline/pipeline-llm/utils/gemini-keys";

/**
 * Genera una imagen utilizando la API de Google (Imagen 4 Fast).
 * Sirve como fallback cuando Hugging Face no tiene créditos o falla.
 * Implementa rotación agresiva de llaves en caso de 429.
 */
export async function generateGeminiImage(prompt: string): Promise<Buffer> {
  const keys = getAllUniqueGeminiKeys();
  if (keys.length === 0) {
    throw new Error('No Google AI API keys configured.');
  }

  const models = ["imagen-4.0-fast-generate-001", "imagen-3.0-fast-generate-001"];
  let lastError: any = null;

  // Barajar llaves para distribuir carga
  const shuffledKeys = [...keys].sort(() => Math.random() - 0.5);

  for (const apiKey of shuffledKeys) {
    const client = new GoogleGenAI({ apiKey });

    for (const modelId of models) {
      try {
        console.log(`[Gemini-Image] 🎨 Intentando con ${modelId} y llave ${apiKey.substring(0, 8)}...`);
        const result = await client.models.generateImages({
          model: modelId,
          prompt: prompt,
          config: { numberOfImages: 1 }
        });

        const response = result as any;
        const generatedImages = response.generatedImages || response.images || [];

        if (generatedImages && generatedImages.length > 0) {
          const image = generatedImages[0];
          if (image.image?.base64 || image.base64) {
            return Buffer.from(image.image?.base64 || image.base64, 'base64');
          }
          if (image.image?.bytes || image.bytes) {
            return Buffer.from(image.image?.bytes || image.bytes);
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini-Image] ⚠️ Falló ${modelId} (${apiKey.substring(0, 8)}): ${err.message}`);
        
        // Si no es un error de cuota o modelo no encontrado, es un error real
        if (!err.message.includes('quota') && !err.message.includes('RESOURCE_EXHAUSTED') && !err.message.includes('NOT_FOUND')) {
          throw err;
        }
        // Si es cuota/no encontrado, seguir con el siguiente modelo/llave
      }
    }
  }

  throw lastError || new Error("Agotadas todas las llaves y modelos de Google Imagen.");
}
