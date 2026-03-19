import { ImageProvider } from "../types";

export class PixazoProvider implements ImageProvider {
  name = "pixazo";

  async generate(prompt: string, seed?: number): Promise<Buffer> {
    const apiKey = process.env.PIXAZO_API_KEY;
    if (!apiKey) {
      throw new Error("PIXAZO_API_KEY is not configured");
    }

    console.log(`[Pixazo] 🎨 Generando imagen via SDXL (Free), prompt: "${prompt.substring(0, 50)}..."`);

    // Endpoint obtenido de la captura del usuario para SDXL v1.0
    const res = await fetch("https://gateway.pixazo.ai/getImage/v1/getSDXLImage", {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
      body: JSON.stringify({
        prompt: prompt,
        negative_prompt: "Low-quality, blurry image, with any other birds or animals. Avoid abstract or cartoonish styles, dark or gloomy atmosphere, unnecessary objects or distractions in the background, harsh lighting, and unnatural colors.",
        height: 1024,
        width: 1024,
        num_steps: 20,
        guidance_scale: 5,
        seed: seed || 40
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      // Si el error es 404, puede que el endpoint requiera un formato diferente o el API Key sea para otro gateway
      throw new Error(`Pixazo SDXL error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    
    // Según la captura, la salida es { "imageUrl": "..." }
    if (data.imageUrl) {
      console.log(`[Pixazo] 🔗 Imagen generada en: ${data.imageUrl}`);
      const imgRes = await fetch(data.imageUrl);
      if (!imgRes.ok) throw new Error("No se pudo descargar la imagen desde imageUrl de Pixazo");
      const arrayBuffer = await imgRes.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    console.log("[Pixazo] Respuesta inesperada:", JSON.stringify(data));
    throw new Error("Pixazo SDXL no devolvió 'imageUrl' en la respuesta.");
  }
}
