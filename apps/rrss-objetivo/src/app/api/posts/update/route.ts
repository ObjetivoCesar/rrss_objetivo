import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { realizeMediaUrls } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, ...rawUpdates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Lista blanca de campos permitidos
    const ALLOWED_FIELDS = ['content_text', 'platforms', 'scheduled_for', 'status', 'media_urls', 'metadata', 'category_id'];
    const updates: any = {};
    for (const key of Object.keys(rawUpdates)) {
      if (ALLOWED_FIELDS.includes(key)) updates[key] = rawUpdates[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos válidos para actualizar' }, { status: 400 });
    }

    // 🌉 REALIZAR IMÁGENES: Si se están actualizando media_urls, asegurar que sean permanentes
    if (updates.media_urls) {
      // Necesitamos el category_id para saber dónde subir (blog vs social)
      // Si no viene en el body, asumimos 'social' o lo buscamos, pero por ahora 
      // pasamos el category_id del body si existe, o 'educativo' como fallback seguro.
      updates.media_urls = await realizeMediaUrls(updates.media_urls, updates.category_id || 'educativo');
      updates.media_url = updates.media_urls[0] || null;
    }

    const { data, error } = await supabaseAdmin
      .from('social_posts')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
