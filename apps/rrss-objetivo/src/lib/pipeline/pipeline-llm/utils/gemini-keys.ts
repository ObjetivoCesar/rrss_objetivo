/**
 * Utility to rotate Gemini API keys to avoid quota limits.
 * Uses a pseudo-random rotation per request to distribute load across keys.
 */
/**
 * Recolecta todas las llaves de Gemini disponibles en el entorno.
 */
export function getAllUniqueGeminiKeys(): string[] {
  const keys: string[] = [];
  
  const mainKeys = process.env.GOOGLE_AI_API_KEYS || process.env.GOOGLE_AI_API_KEY || '';
  if (mainKeys) {
    keys.push(...mainKeys.split(',').map(k => k.trim()).filter(Boolean));
  }

  for (let i = 2; i <= 10; i++) {
    const k = process.env[`GOOGLE_AI_API_KEY_${i}`];
    if (k) keys.push(k.trim());
  }
  
  return Array.from(new Set(keys));
}

export function getNextGeminiKey(): string {
  const keys = getAllUniqueGeminiKeys();
  if (keys.length === 0) {
    throw new Error('No Google AI API keys configured.');
  }
  const index = Math.floor(Math.random() * keys.length);
  return keys[index];
}
