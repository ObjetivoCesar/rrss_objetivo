import { NextResponse } from "next/server";
import { imageOrchestrator } from "@/lib/ai/image-orchestrator";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt');
    const seedParam = searchParams.get('seed');
    const seed = seedParam ? parseInt(seedParam) : undefined;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log(`[Image Proxy] Generating image via Orchestrator (Priority: Pixazo)...`);

    // Usamos el orquestador unificado que ya tiene Pixazo, HF y Google con fallbacks
    const result = await imageOrchestrator.generateImage(prompt, { 
      seed,
    });

    if (!result || !result.buffer || result.buffer.length === 0) {
      console.error("[Image Proxy] Received empty buffer from orchestrator");
      return NextResponse.json({ error: "Received empty image from AI" }, { status: 500 });
    }

    const { buffer, provider } = result;

    console.log(`[Image Proxy] ✅ Image ready from ${provider}! Size: ${buffer.length} bytes`);

    const headers = new Headers();
    // Detectar PNG (89 50 4E 47) o WebP (52 49 46 46)
    const contentType = buffer[0] === 0x89 && buffer[1] === 0x50 ? "image/png" : "image/webp";
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: headers
    });

  } catch (error: any) {
    console.error("Image Proxy Error:", error);
    
    // Si todos los proveedores fallan, devolvemos el error detalle
    return NextResponse.json({ 
        error: "All image providers failed", 
        details: error.message 
    }, { status: 500 });
  }
}
