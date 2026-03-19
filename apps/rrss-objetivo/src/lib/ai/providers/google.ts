import { ImageProvider } from "../types";
import { generateGeminiImage } from "../../ai/gemini-image";

export class GoogleProvider implements ImageProvider {
  name = "google";

  async generate(prompt: string): Promise<Buffer> {
    console.log(`[Google] 🎨 Generando imagen con Gemini/Imagen...`);
    return await generateGeminiImage(prompt);
  }
}
