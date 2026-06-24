import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Columnas del spreadsheet tal como eran en el CSV original
export const COLUMNS = [
  "dia",
  "fecha",
  "hora",
  "formato",
  "hook_tema",
  "descripcion_visual",
  "copy_sugerido",
  "cta",
  "guion_grabacion",
  "seo_keywords",
] as const;

// Etiquetas legibles (para el frontend — mapeo inverso)
export const COLUMN_LABELS: Record<string, string> = {
  dia:                "Día",
  fecha:              "Fecha",
  hora:               "Hora",
  formato:            "Formato",
  hook_tema:          "Hook / Tema",
  descripcion_visual: "Descripción Visual",
  copy_sugerido:      "Copy Sugerido",
  cta:                "CTA",
  guion_grabacion:    "Guion Grabación",
  seo_keywords:       "SEO Keywords",
};

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {}, // Solo lectura en route handlers
      },
    }
  );
}

// ── GET: Cargar todas las filas del plan ─────────────────────────────────────
export async function GET() {
  try {
    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("brand_plan_entries")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("BRAND PLANNER GET ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (err: any) {
    console.error("BRAND PLANNER GET EXCEPTION:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST: Actualizar una celda específica ─────────────────────────────────────
// Body: { id: string, column: string, newValue: string }
export async function POST(req: NextRequest) {
  try {
    const { id, column, newValue } = await req.json();

    if (!id || !column) {
      return NextResponse.json(
        { error: "Faltan campos: id y column son requeridos." },
        { status: 400 }
      );
    }

    // Validar que la columna es una columna permitida
    if (!COLUMNS.includes(column as any)) {
      return NextResponse.json(
        { error: `Columna inválida: "${column}". Columnas válidas: ${COLUMNS.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("brand_plan_entries")
      .update({ [column]: newValue })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("BRAND PLANNER POST ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updatedRow: data });
  } catch (err: any) {
    console.error("BRAND PLANNER POST EXCEPTION:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT: Crear una nueva fila ─────────────────────────────────────────────────
// Body: objeto con los campos de la fila (sin id)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    // Filtrar solo las columnas válidas
    const newRow: Record<string, string> = {};
    COLUMNS.forEach((col) => {
      newRow[col] = body[col] ?? "";
    });

    const supabase = await getSupabase();

    const { data, error } = await supabase
      .from("brand_plan_entries")
      .insert(newRow)
      .select("*")
      .single();

    if (error) {
      console.error("BRAND PLANNER PUT ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, newRow: data });
  } catch (err: any) {
    console.error("BRAND PLANNER PUT EXCEPTION:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE: Eliminar una fila ────────────────────────────────────────────────
// Body: { id: string }
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Falta el campo: id." }, { status: 400 });
    }

    const supabase = await getSupabase();

    const { error } = await supabase
      .from("brand_plan_entries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("BRAND PLANNER DELETE ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("BRAND PLANNER DELETE EXCEPTION:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
