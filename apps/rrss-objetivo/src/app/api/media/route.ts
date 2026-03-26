import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('filename', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, assets: data });
  } catch (error: any) {
    console.error('[API/Media] Error fetching assets:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const asset = await req.json();

    const { data, error } = await supabase
      .from('media_assets')
      .insert([
        {
          filename: asset.filename,
          url: asset.url,
          type: asset.type || (asset.url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'),
          category: asset.category || 'general',
          size: asset.size,
          metadata: asset.metadata || {}
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, asset: data?.[0] });
  } catch (error: any) {
    console.error('[API/Media] Error creating asset:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) throw new Error('Missing asset ID');

    const { error } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API/Media] Error deleting asset:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
