import { NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/scheduler';

// ⏱️ Extender el timeout a 60 segundos para dar tiempo al webhook de Make.com


// Este endpoint puede ser llamado por un CRON externo (como pg_cron de Supabase o Vercel Cron)
// para despertar al motor cada minuto.
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    await processScheduledPosts();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
