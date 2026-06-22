import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const BUCKET = "posts-assets";
const FOLDER = "cotizaciones/borradores";

export async function GET() {
  try {
    const { data: files, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(FOLDER, {
        limit: 100,
        sortBy: { column: 'updated_at', order: 'desc' },
      });

    if (error) {
      throw error;
    }

    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    // Recuperamos los datos de cada uno para poder mostrar previsualizaciones
    const drafts = await Promise.all(
      jsonFiles.map(async (file) => {
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from(BUCKET)
          .download(`${FOLDER}/${file.name}`);

        if (downloadError || !fileData) return null;

        const text = await fileData.text();
        const parsed = JSON.parse(text);

        return {
          filename: file.name,
          updated_at: file.updated_at,
          data: parsed
        };
      })
    );

    return NextResponse.json({
      success: true,
      drafts: drafts.filter(Boolean)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    if (!payload.id) {
      return NextResponse.json({ success: false, message: "ID / Slug (dr-cliente) requerido" }, { status: 400 });
    }

    const filename = `${FOLDER}/${payload.id}.json`;
    const jsonStr = JSON.stringify(payload, null, 2);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filename, Buffer.from(jsonStr, 'utf-8'), {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    return NextResponse.json({
      success: true,
      message: "Borrador guardado exitosamente."
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
