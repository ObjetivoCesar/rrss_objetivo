import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

// Sanitizes the title so the upstream /api/save-article produces a clean URL slug.
// Removes colons, special chars and trims extra whitespace.
function sanitizeTitle(rawTitle: string): string {
  return rawTitle
    .replace(/:/g, '') // Remove colons entirely (they break URL slugs)
    .replace(/[?!¿¡]/g, '') // Remove question/exclamation marks
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Remove multiple dashes
    .trim();
}

export async function POST(req: Request) {
  try {
    const { title, category, excerpt, metaDescription, image, markdown } = await req.json();

    if (!title || !category || !markdown) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (title, category o markdown) para publicar el artículo.' },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeTitle(title);
    const slug = generateSlug(cleanTitle);

    console.log(`[SEO Publish] Publicando directamente en MySQL: "${cleanTitle}" (slug: ${slug})`);

    // Inserción directa en MySQL
    const [result] = await pool.query(
      `INSERT INTO articles 
      (title, slug, content, excerpt, cover_image, category_id, meta_description, published, published_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW())`,
      [cleanTitle, slug, markdown, excerpt, image, category, metaDescription]
    );

    console.log(`[SEO Publish] ✅ Artículo Publicado con éxito en MySQL!`, result);

    return NextResponse.json({
      success: true,
      publishedTitle: cleanTitle,
      slug: slug,
      insertId: (result as any).insertId
    });

  } catch (error: any) {
    console.error('Error enviando el artículo a MySQL:', error);
    
    // Tratamiento especial para duplicados (slug)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Ya existe un artículo con un título similar (slug duplicado). Por favor, varía ligeramente el título.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message || 'Error processing publish request' }, { status: 500 });
  }
}
