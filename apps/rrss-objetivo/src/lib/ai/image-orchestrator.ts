import { ImageProvider } from "./types";
import { PixazoProvider } from "./providers/pixazo";
import { HuggingFaceProvider } from "./providers/huggingface";
import { GoogleProvider } from "./providers/google";

export class ImageOrchestrator {
  private providers: ImageProvider[] = [];

  constructor() {
    // Orden de prioridad: Pixazo (más barato) -> HF -> Google
    this.providers = [
      new PixazoProvider(),
      new HuggingFaceProvider(),
      new GoogleProvider()
    ];
  }

  async generateImage(prompt: string, options: { categoryId?: string; seed?: number } = {}): Promise<{ buffer: Buffer; provider: string }> {
    let lastError: any = null;

    // Priorización especial para blogs si se prefiere Google directamente
    if (options.categoryId === 'blog') {
        const google = this.providers.find(p => p.name === 'google');
        if (google) {
            try {
                const buffer = await google.generate(prompt, options.seed);
                return { buffer, provider: 'google' };
            } catch (e) {
                console.warn("[Orchestrator] Falló Google para blog, intentando otros...");
            }
        }
    }

    for (const provider of this.providers) {
      try {
        console.log(`[Orchestrator] Intentando con ${provider.name}...`);
        const buffer = await provider.generate(prompt, options.seed);
        return { buffer, provider: provider.name };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Orchestrator] ⚠️ Error en ${provider.name}: ${err.message}`);
        
        // Si el error es de cuota o similar, intentamos el siguiente
        if (err.message.includes("quota") || err.message.includes("credit") || err.message.includes("402") || err.message.includes("429")) {
          continue;
        }
        
        // Si es otro tipo de error grave, podríamos decidir abortar o seguir
        continue; 
      }
    }

    throw lastError || new Error("Todos los proveedores de imagen fallaron.");
  }
}

export const imageOrchestrator = new ImageOrchestrator();
