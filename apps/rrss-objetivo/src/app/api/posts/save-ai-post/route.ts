import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getOptimalScheduleDate } from "@/lib/pipeline/scheduling-strategy";
import { realizeMediaUrls, generateAndUploadImage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    let {
      content,
      targetMonth,
      topic,
      platforms,
      categoryId,
      media_urls,
      status = "pending",
      campaign_id = null,
      objective_id = null,
      scheduled_for = null,
      metadata = {}
    } = body;

    // Validación básica
    if (!content || !targetMonth || !topic || !platforms || !categoryId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // 🌉 REALIZAR IMÁGENES: Convertir URLs de proxy a URLs permanentes en Storage
    const realizedUrls = await realizeMediaUrls(media_urls || [], categoryId);

    // Generar fecha óptima de publicación si no se proporciona manualmente
    const scheduledFor = scheduled_for 
      ? new Date(scheduled_for) 
      : await getOptimalScheduleDate(platforms);

    // Extraer campos adicionales para las nuevas columnas
    const contentType = metadata.content_type || "text";
    const isEvergreen = metadata.is_evergreen || false;
    const videoUrl = metadata.youtube_url || (contentType === 'video' ? realizedUrls[0] : null);
    const linkUrl = metadata.link_url || null;
    const linkPreview = metadata.link_preview || null;

    // Insertar en Supabase
    const { data, error } = await supabase
      .from("social_posts")
      .insert([
        {
          content_text: content,
          target_month: targetMonth,
          topic: topic,
          platforms: platforms,
          category_id: categoryId,
          media_urls: realizedUrls,
          media_url: realizedUrls[0] || null,
          status: status,
          scheduled_for: scheduledFor.toISOString(),
          campaign_id: campaign_id,
          objective_id: objective_id,
          content_type: contentType,
          video_url: videoUrl,
          link_url: linkUrl,
          link_preview: linkPreview,
          is_evergreen: isEvergreen,
          metadata: {
            ...metadata,
            source: metadata.source || 'editor',
            node_id: metadata.node_id || null
          }
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error al guardar en Supabase:", error);
      return NextResponse.json(
        { error: "Error al guardar el post en la base de datos" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Post guardado correctamente", post: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error procesando la solicitud:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
