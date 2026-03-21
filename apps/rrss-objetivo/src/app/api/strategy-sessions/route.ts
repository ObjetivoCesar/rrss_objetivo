import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

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
  const { id, name, description, nodes, edges } = body;
  const supabase = await createClient();

  if (!name || !nodes || !edges) {
    return NextResponse.json({ error: 'Missing required fields: name, nodes, edges' }, { status: 400 });
  }

  if (id) {
    logger.info('Updating strategy session', { id, name });
    const { data, error } = await supabase
      .from('strategy_sessions')
      .update({ name, description, nodes, edges, updated_at: new Date().toISOString() })
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
      .insert({ name, description, nodes, edges })
      .select()
      .single();

    if (error) {
      logger.error('Error creating strategy session', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  }
}
