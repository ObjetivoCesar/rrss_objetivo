import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: "No id provided" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase credentials missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from("social_posts").update({ archived_at: new Date().toISOString() }).eq("id", id).select();

    if (error) {
      console.error("Supabase Delete Error:", error);
      return NextResponse.json({ error: "Error al borrar en Supabase", details: error }, { status: 500 });
    }

    if (!data || data.length === 0) {
       console.log("Supabase DELETE advierte: No se afectaron filas. ¿El ID existe o RLS interfiere silenciosamente?", id);
       return NextResponse.json({ error: "Post no encontrado en BD o no pudo borrarse" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: data });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
