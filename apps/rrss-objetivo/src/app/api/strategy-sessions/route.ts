import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/strategy-sessions — list sessions with pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = await createClient();
  
  logger.info('Fetching strategy sessions', { limit, offset });

  const { data, error, count } = await supabase
    .from('strategy_sessions')
    .select('id, name, description, created_at, updated_at', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    logger.error('Error fetching strategy sessions', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      total: count,
      limit,
      offset
    }
  });
}

// POST /api/strategy-sessions — create or update a session
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, description, nodes, edges, new_objective_name, objective_id: provided_objective_id } = body;
  const supabase = await createClient();

  if (!name || !nodes || !edges) {
    return NextResponse.json({ error: 'Missing required fields: name, nodes, edges' }, { status: 400 });
  }
  
  let final_objective_id = provided_objective_id;

  // Insertar el nuevo objetivo si viene del frontend
  if (new_objective_name) {
    logger.info('Creating new objective from Strategy Planner', { new_objective_name });
    
    // Check if it exists just in case
    const { data: existingObj } = await supabase.from('objectives').select('id').ilike('name', new_objective_name).maybeSingle();
    
    if (existingObj) {
      final_objective_id = existingObj.id;
    } else {
      const { data: newObj, error: objError } = await supabase
        .from('objectives')
        .insert([{ name: new_objective_name, description: 'Creado desde el Strategy Planner', emoji: '🎯', color: '#10b981' }])
        .select()
        .single();
        
      if (!objError && newObj) {
        final_objective_id = newObj.id;
      } else {
        logger.error('Failed to create new objective', objError);
      }
    }
  }

  if (id) {
    logger.info('Updating strategy session', { id, name });
    const { data, error } = await supabase
      .from('strategy_sessions')
      .update({ 
        name, 
        description, 
        nodes, 
        edges, 
        objective_id: final_objective_id,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating strategy session', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } else {
    logger.info('Creating new strategy session', { name });
    const { data, error } = await supabase
      .from('strategy_sessions')
      .insert({ 
        name, 
        description, 
        nodes, 
        edges, 
        objective_id: final_objective_id 
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating strategy session', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  }
}
