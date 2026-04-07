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
  // Lanzar el scheduler de forma asíncrona (fire-and-forget)
  // No hacemos await para no bloquear la respuesta HTTP.
  processScheduledPosts().catch(err => {
    console.error('[trigger] Error en scheduler (background):', err.message);
  });

  // Responder inmediatamente con 200 — el scheduler corre en background
  return NextResponse.json({
    success: true,
    message: 'Scheduler iniciado en background.',
    timestamp: new Date().toISOString(),
  });
}
