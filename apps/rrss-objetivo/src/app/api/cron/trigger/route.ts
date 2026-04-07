import { NextResponse } from 'next/server';
import { processScheduledPosts } from '@/lib/scheduler';

/**
 * POST /api/cron/trigger
 *
 * Proxy seguro para disparar el scheduler desde la UI sin exponer CRON_SECRET.
 * Llama directamente a processScheduledPosts() en el servidor, evitando 
 * el problema de fetch interno entre funciones serverless de Vercel.
 */
export async function POST() {
  try {
    await processScheduledPosts();
    return NextResponse.json({
      success: true,
      message: 'Scheduler ejecutado correctamente.',
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
