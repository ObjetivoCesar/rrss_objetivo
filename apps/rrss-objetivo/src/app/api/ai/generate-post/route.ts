import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/ai/prompts";

export async function POST(req: Request) {
  try {
    const { message, platform, targetMonth, topic, style, categoryId } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || "deepseek-reasoner";

    if (!apiKey) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY no configurada" }, { status: 500 });
    }

    const systemPrompt = `
      ${buildSystemPrompt(platform || "instagram", parseInt(targetMonth as string), categoryId)}
      NICHO SELECCIONADO: ${topic || "Negocios Locales Ecuador"}
      ${style?.name ? `ESTILO VISUAL DE IMAGEN: ${style.name} (${style.promptSuffix})` : ""}
    `;

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("DeepSeek Error:", data);
      return NextResponse.json({ error: "Error en la API de DeepSeek", details: data }, { status: response.status });
    }

    const content = data.choices[0].message.content;

    return NextResponse.json({ content });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
