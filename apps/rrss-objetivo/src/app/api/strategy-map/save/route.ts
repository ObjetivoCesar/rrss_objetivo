import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ideas, positions } = body;

    // 1. Save / Update Positions
    if (positions && typeof positions === 'object') {
      const posEntries = Object.entries(positions).map(([node_id, pos]: [string, any]) => ({
        node_id,
        pos_x: pos.x,
        pos_y: pos.y,
        updated_at: new Date().toISOString(),
      }));

      if (posEntries.length > 0) {
        const { error: posError } = await supabase
          .from('map_node_positions')
          .upsert(posEntries, { onConflict: 'node_id' });

        if (posError) throw new Error(`Error saving positions: ${posError.message}`);
      }
    }

    // 2. Save / Update Ideas
    if (ideas && Array.isArray(ideas)) {
      const ideasToInsert: any[] = [];
      const ideasToUpsert: any[] = [];

      ideas.forEach((idea: any) => {
        const payload: any = {
          node_type: idea.node_type || 'idea',
          label: idea.label || '',
          description: idea.description || '',
          parent_id: idea.parent_id || null,
          objective_id: idea.objective_id || null,
          campaign_id: idea.campaign_id || null,
          pos_x: idea.pos_x || 0,
          pos_y: idea.pos_y || 0,
          updated_at: new Date().toISOString(),
        };

        if (idea.id && idea.id.length === 36) {
          payload.id = idea.id;
          ideasToUpsert.push(payload);
        } else {
          ideasToInsert.push(payload);
        }
      });

      // Execute Upsert for existing ideas
      if (ideasToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('map_ideas')
          .upsert(ideasToUpsert, { onConflict: 'id' });
        if (upsertError) throw new Error(`Error upserting ideas: ${upsertError.message}`);
      }

      // Execute Insert for new ideas
      if (ideasToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('map_ideas')
          .insert(ideasToInsert);
        if (insertError) throw new Error(`Error inserting ideas: ${insertError.message}`);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[strategy-map SAVE API Error]:', error);
    return NextResponse.json({ error: error.message ?? 'Unknown error' }, { status: 500 });
  }
}
