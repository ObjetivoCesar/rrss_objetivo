import { NextResponse } from 'next/server';

/**
 * Proxy seguro para disparar el scheduler manualmente desde la UI.
 * Este endpoint agrega internamente el CRON_SECRET al llamar a /api/cron/process,
 * sin exponer el secreto al cliente/browser.
 */
export async function POST(request: Request) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/cron/process`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
      }
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
