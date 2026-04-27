import { NextResponse } from "next/server";
import { optimizeImageForInstagram } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de imagen obligatoria" },
        { status: 400 }
      );
    }

    const optimizedUrl = await optimizeImageForInstagram(imageUrl);

    return NextResponse.json({
      message: "Imagen optimizada correctamente",
      url: optimizedUrl
    });
  } catch (error: any) {
    console.error("Error en API de optimización:", error);
    return NextResponse.json(
      { error: "Error al optimizar la imagen: " + error.message },
      { status: 500 }
    );
  }
}
