import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

function sanitizeTitle(rawTitle: string): string {
  return rawTitle
    .replace(/:/g, '')
    .replace(/[?!¿¡]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(req: Request) {
  try {
    const { title, category, excerpt, metaDescription, image, markdown, hub_url, parent_silo, published_at, slug: explicitSlug } = await req.json();

    // 🔴 VALIDACIÓN DONNA AI: Todo artículo debe tener un Hub de destino asignado
    if (!hub_url) {
      return NextResponse.json(
        { 
          error: 'Falta el Hub de destino (hub_url). Según la Matriz Maestra 2026, cada artículo debe apuntar a una de las 15 páginas pilar antes de publicarse.',
          code: 'MISSING_HUB_URL'
        },
        { status: 422 }
      );
    }
    if (!parent_silo) {
      return NextResponse.json(
        { 
          error: 'Falta el Silo (parent_silo). El artículo debe asignarse a uno de los 5 silos: marketing-para-pymes, automatizacion-de-ventas, posicionamiento-en-google, activaqr-gastronomia, o activaqr-networking.',
          code: 'MISSING_SILO'
        },
        { status: 422 }
      );
    }

    if (!title || !markdown) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (título o contenido) para publicar.' },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeTitle(title);
    const slug = explicitSlug ? generateSlug(explicitSlug) : generateSlug(cleanTitle);

    // Si el markdown comienza con un H1 (# Título), lo quitamos para evitar duplicidad
    let processedMarkdown = markdown;
    if (processedMarkdown.trim().startsWith('# ')) {
      processedMarkdown = processedMarkdown.replace(/^#\s+.*\n?/, '').trim();
    }

    console.log(`[SEO Publish] Intentando publicar: "${cleanTitle}" (slug: ${slug})`);

    // 🔍 SCHEMA AWARENESS: Consultamos las columnas reales de la tabla 'articles'
    // Esto evita errores 500 si la tabla no tiene 'category_id', 'excerpt', etc.
    const [columns] = await pool.query("SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = 'articles'");
    const availableColumns = (columns as any[]).map(c => c.COLUMN_NAME.toLowerCase());

    const fields: string[] = ['id', 'title', 'slug', 'content', 'published', 'published_at'];
    const customDate = published_at ? new Date(published_at) : new Date();
    const values: any[] = [crypto.randomUUID(), cleanTitle, slug, processedMarkdown, 1, customDate];

    // Añadimos campos opcionales solo si existen en la tabla
    if (availableColumns.includes('meta_description')) {
      fields.push('meta_description');
      values.push(metaDescription || '');
    }
    if (availableColumns.includes('excerpt')) {
      fields.push('excerpt');
      values.push(excerpt || '');
    }
    if (availableColumns.includes('cover_image')) {
      fields.push('cover_image');
      values.push(image || '');
    }
    // category_id suele ser un INT. Si nos pasan un string, intentamos ignorarlo si no es numérico
    // o simplemente no lo insertamos si la tabla espera un ID real que no tenemos.
    if (availableColumns.includes('category_id') && !isNaN(parseInt(category))) {
      fields.push('category_id');
      values.push(parseInt(category));
    }
    // 🗺️ MATRIZ MAESTRA 2026: Guardamos siempre hub_url y parent_silo para el motor de interlinking
    if (availableColumns.includes('hub_url') && hub_url) {
      fields.push('hub_url');
      values.push(hub_url);
    }
    if (availableColumns.includes('parent_silo') && parent_silo) {
      fields.push('parent_silo');
      values.push(parent_silo);
    }

    const query = `INSERT INTO articles (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    try {
      const [result] = await pool.query(query, values);
      console.log(`[SEO Publish] ✅ Publicado con éxito. ID: ${(result as any).insertId}`);

      return NextResponse.json({
        success: true,
        publishedTitle: cleanTitle,
        slug: slug,
        insertId: (result as any).insertId
      });

    } catch (dbError: any) {
      if (dbError.code === 'ER_DUP_ENTRY') {
        console.error(`[SEO Publish] 409 Conflict: El slug '${slug}' ya existe.`);
        return NextResponse.json({ 
          error: `Ya existe un artículo con un título similar (URL: ${slug}). Por favor, cambia ligeramente el título en el editor para que sea único.`,
          code: 'CONFLICT'
        }, { status: 409 });
      }
      throw dbError;
    }

  } catch (error: any) {
    console.error('[SEO Publish] ❌ Error crítico:', error);
    return NextResponse.json({ error: `Error en el servidor: ${error.message}` }, { status: 500 });
  }
}
