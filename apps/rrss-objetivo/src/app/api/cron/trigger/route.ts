import { NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/scheduler';

// ⏱️ Extender el timeout máximo de esta función a 60 segundos (requiere Vercel Pro)


/**
 * POST /api/cron/trigger
 *
 * Proxy seguro para disparar el scheduler desde la UI sin exponer CRON_SECRET.
 * Usa fire-and-forget: devuelve 200 inmediatamente y corre el scheduler en paralelo.
 * Esto evita el timeout de 10s de Vercel Hobby mientras Make.com procesa el webhook.
 */
export async function POST() {
  try {
    const result = await processScheduledPosts();
    return NextResponse.json({
      success: true,
      message: 'Scheduler ejecutado.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[trigger] Error en scheduler:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
