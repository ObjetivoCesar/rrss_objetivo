import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const articleId = searchParams.get('id');

  if (!articleId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    // Fetch the article's core WP post data
    const [rows] = await connection.execute<any[]>(
      `SELECT 
        ID,
        post_title,
        post_name AS slug, 
        post_status,
        post_date,
        post_excerpt,
        post_modified
      FROM wp_posts 
      WHERE ID = ? 
        AND post_type = 'post' 
        AND post_status IN ('publish','draft')
      LIMIT 1`,
      [articleId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = rows[0];

    // Try to get Yoast SEO meta for this article
    const [metaRows] = await connection.execute<any[]>(
      `SELECT meta_key, meta_value FROM wp_postmeta 
       WHERE post_id = ? AND meta_key IN ('_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_focuskw', 'rank_math_focus_keyword', '_thumbnail_id')`,
      [articleId]
    );

    const meta: Record<string, string> = {};
    metaRows.forEach((row: any) => { meta[row.meta_key] = row.meta_value; });

    // Get categories for this post
    const [catRows] = await connection.execute<any[]>(
      `SELECT t.name FROM wp_terms t
       INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
       INNER JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
       WHERE tr.object_id = ? AND tt.taxonomy = 'category'`,
      [articleId]
    );

    const categories = catRows.map((r: any) => r.name).join(', ');

    return NextResponse.json({
      article: {
        ...article,
        categories,
        seo_title: meta['_yoast_wpseo_title'] || meta['rank_math_focus_keyword'] || null,
        seo_description: meta['_yoast_wpseo_metadesc'] || null,
        focus_keyword: meta['_yoast_wpseo_focuskw'] || meta['rank_math_focus_keyword'] || null,
      }
    });

  } catch (error: any) {
    console.error('[MySQL Article API]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
