import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all objectives, their campaigns, and count of posts per campaign
    const { data: objectives, error: objError } = await supabase
      .from("objectives")
      .select(`
        *,
        campaigns (
          *,
          social_posts (count)
        )
      `)
      .is('archived_at', null)
      .is('campaigns.archived_at', null)
      .order('created_at', { ascending: false });

    if (objError) throw objError;

    // Transform data to a cleaner structure for the frontend
    const formattedData = objectives.map(obj => {
      return {
        ...obj,
        campaigns: obj.campaigns.map((camp: any) => ({
          ...camp,
          postsCount: camp.social_posts?.[0]?.count || 0,
        })).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching objectives:", error);
    return NextResponse.json({ error: "No se pudieron obtener los objetivos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body; // 'objective' | 'campaign'

    if (type === 'objective') {
      const { name, description, color, emoji } = body;
      if (!name) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

      const { data, error } = await supabase
        .from("objectives")
        .insert([{ name, description, color, emoji }])
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json(data);
    } 
    
    if (type === 'campaign') {
      const { objective_id, name, description } = body;
      if (!objective_id || !name) return NextResponse.json({ error: "ID del objetivo y nombre requeridos" }, { status: 400 });

      const { data, error } = await supabase
        .from("campaigns")
        .insert([{ objective_id, name, description, status: 'active' }])
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Tipo de acción inválido" }, { status: 400 });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
