import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    // Check if ID belongs to an objective or campaign by requesting campaigns first
    const { data: campaign, error: cError } = await supabase
      .from("campaigns")
      .select("*, objectives(*)")
      .eq("id", id)
      .single();

    if (campaign) {
      // It's a campaign, fetch its posts
      const { data: posts } = await supabase
        .from("social_posts")
        .select("*")
        .eq("campaign_id", id)
        .order("created_at", { ascending: false });
        
      return NextResponse.json({ ...campaign, posts: posts || [] });
    }

    // Not a campaign, maybe an objective
    const { data: objective, error: oError } = await supabase
      .from("objectives")
      .select("*, campaigns(*)")
      .eq("id", id)
      .single();

    if (objective) {
      return NextResponse.json(objective);
    }

    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching detail:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { type, ...updates } = body; // type needed to know which table
    
    if (type !== 'objective' && type !== 'campaign') {
      return NextResponse.json({ error: "Tipo 'objective' o 'campaign' requerido" }, { status: 400 });
    }

    const table = type === 'objective' ? 'objectives' : 'campaigns';
    
    // Lista blanca de campos permitidos (Mass assignment protection)
    const allowedObjectiveFields = ['name', 'description', 'color', 'emoji', 'archived_at'];
    const allowedCampaignFields = ['name', 'description', 'status', 'objective_id', 'archived_at'];
    const allowedFields = type === 'objective' ? allowedObjectiveFields : allowedCampaignFields;

    const safeUpdates: any = {};
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No hay campos válidos para actualizar" }, { status: 400 });
    }
    
    const { data, error } = await supabase
      .from(table)
      .update(safeUpdates)
      .eq("id", id)
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating record:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const fallbackObjId = url.searchParams.get("fallback");
    
    if (type !== 'objective' && type !== 'campaign') {
      return NextResponse.json({ error: "Query param type='objective' o 'campaign' requerido" }, { status: 400 });
    }

    const table = type === 'objective' ? 'objectives' : 'campaigns';

    // Manejar herencia / reasignación si se provee un fallback id
    if (type === 'objective' && fallbackObjId && fallbackObjId !== id) {
      // Reasignamos las campañas al nuevo objetivo
      await supabase
        .from('campaigns')
        .update({ objective_id: fallbackObjId })
        .eq("objective_id", id);
        
      // Intentamos reasignar los posts (si tienen objective_id)
      await supabase
        .from('social_posts')
        .update({ objective_id: fallbackObjId })
        .eq("objective_id", id);
    }
    
    // Soft delete en lugar de borrado físico
    const { error } = await supabase
      .from(table)
      .update({ archived_at: new Date().toISOString() })
      .eq("id", id);
      
    if (error) throw error;
    return NextResponse.json({ success: true, message: "Archivado correctamente" });
  } catch (error) {
    console.error("Error deleting record:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
