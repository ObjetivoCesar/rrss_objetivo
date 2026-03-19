import { ImageProvider } from "../types";

export class HuggingFaceProvider implements ImageProvider {
  name = "huggingface";
  private MODEL_ID = "black-forest-labs/FLUX.1-schnell";

  async generate(prompt: string, seed?: number): Promise<Buffer> {
    const hfToken = process.env.HUGGINGFACE_ACCESS_TOKEN;
    if (!hfToken) {
      throw new Error("HUGGINGFACE_ACCESS_TOKEN is not configured");
    }

    console.log(`[HuggingFace] 🎨 Generando imagen, prompt: "${prompt.substring(0, 50)}..."`);
    const hfUrl = `https://router.huggingface.co/hf-inference/models/${this.MODEL_ID}`;
    
    const res = await fetch(hfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          seed: seed || Math.floor(Math.random() * 1000000),
          width: 1024,
          height: 1024
        }
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HF error (${res.status}): ${errorText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
