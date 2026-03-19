import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo de audio" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("GROQ_API_KEY no configurada");
      return NextResponse.json({ error: "API Key de Groq no configurada en el servidor" }, { status: 500 });
    }

    // Convert API route formData to send to Groq
    const groqFormData = new FormData();
    groqFormData.append("file", file, "audio.webm");
    groqFormData.append("model", "whisper-large-v3");

    // Make direct fetch to Groq OpenAI compatible endpoint
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        // Note: No "Content-Type" header is strictly needed when using FormData with fetch,
        // it sets multipart boundaries automatically.
      },
      body: groqFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error al conectar con Groq");
    }

    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("Error transcribiendo audio:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
