import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

// GET: List all articles from MySQL
export async function GET() {
  try {
    console.log('[MySQL] Intentando obtener artículos...');
    const [rows]: any = await pool.query(
      'SELECT id, title, slug, content, excerpt, cover_image, category_id, meta_description, published FROM articles ORDER BY published_at DESC'
    );
    console.log(`[MySQL] Éxito: ${Array.isArray(rows) ? rows.length : 0} artículos encontrados.`);
    if (rows.length > 0) console.log('[MySQL] Primer título:', rows[0].title);
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[MySQL Get Articles] ERROR CRÍTICO:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing article in MySQL
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, slug, content, excerpt, cover_image, category_id, meta_description } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required for updates' }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE articles SET 
        title = ?, 
        slug = ?, 
        content = ?, 
        excerpt = ?, 
        cover_image = ?, 
        category_id = ?, 
        meta_description = ? 
      WHERE id = ?`,
      [title, slug, content, excerpt, cover_image, category_id, meta_description, id]
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[MySQL Update Article] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
