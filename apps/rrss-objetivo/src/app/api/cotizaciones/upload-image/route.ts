import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const BUCKET = "posts-assets"; // Bucket correcto según src/lib/storage.ts

/**
 * POST /api/cotizaciones/upload-image
 * Descarga una imagen desde una URL externa (ej: Facebook CDN, etc.)
 * y la sube permanentemente a Supabase Storage.
 * Retorna la URL pública estable del servidor propio.
 */
export async function POST(req: Request) {
  try {
    const { url, filename: customFilename } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, message: "Se requiere una URL válida." },
        { status: 400 }
      );
    }

    // 1. Descargar la imagen desde la URL externa
    const imageRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CesarBot/1.0)",
      },
    });

    if (!imageRes.ok) {
      return NextResponse.json(
        { success: false, message: `No se pudo descargar la imagen: HTTP ${imageRes.status}` },
        { status: 400 }
      );
    }

    // 2. Detectar el tipo de contenido
    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
      ? "webp"
      : contentType.includes("gif")
      ? "gif"
      : "jpg";

    // 3. Generar nombre de archivo limpio y único
    const slug = customFilename
      ? customFilename.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-")
      : `logo-cliente-${Date.now()}`;
    const filename = `cotizaciones/${slug}.${ext}`;

    // 4. Obtener el buffer de la imagen
    const buffer = await imageRes.arrayBuffer();

    // 5. Subir a Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType,
        upsert: true, // sobreescribir si ya existe el mismo slug
      });

    if (uploadError) {
      console.error("[upload-image] Supabase upload error:", uploadError);
      return NextResponse.json(
        { success: false, message: uploadError.message },
        { status: 500 }
      );
    }

    // 6. Obtener la URL pública permanente
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename,
      contentType,
    });
  } catch (error: any) {
    console.error("[upload-image] Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message || "Error interno." },
      { status: 500 }
    );
  }
}
