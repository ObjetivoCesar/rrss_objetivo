import { NextRequest, NextResponse } from "next/server";
import { generateAndUploadImage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const { prompt, categoryId = "blog" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "El prompt es obligatorio" }, { status: 400 });
    }

    const imageUrl = await generateAndUploadImage(prompt, categoryId);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error("[API] ❌ Error generando imagen:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
