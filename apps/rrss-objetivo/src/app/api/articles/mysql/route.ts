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

    // Fetch the article's core data from the custom 'articles' table
    const [rows] = await connection.execute<any[]>(
      `SELECT
        id,
        title,
        slug,
        published_at,
        content,
        meta_description as seo_description
      FROM articles
      WHERE id = ?
      LIMIT 1`,
      [articleId]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = rows[0];

    return NextResponse.json({
      article: {
        ...article,
        categories: 'General', // No custom categories table found yet
        seo_title: article.title,
        seo_description: article.seo_description,
        focus_keyword: null,
      }
    });

  } catch (error: any) {
    console.error('[MySQL Article API]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
