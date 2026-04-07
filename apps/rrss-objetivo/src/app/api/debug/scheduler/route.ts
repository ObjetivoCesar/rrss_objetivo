import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * GET /api/debug/scheduler
 * Diagnóstico completo del scheduler: logs recientes, posts fallidos y estado del entorno.
 * SOLO para uso interno de debugging. No expone secretos.
 */
export async function GET() {
  const diagnostics: Record<string, any> = {};

  // 1. Estado de variables de entorno críticas (sin revelar valores)
  diagnostics.env = {
    MAKE_WEBHOOK_URL: process.env.MAKE_WEBHOOK_URL
      ? `✅ Configurada (${process.env.MAKE_WEBHOOK_URL.slice(0, 40)}...)`
      : '❌ NO CONFIGURADA — El webhook fallará',
    MAKE_WEBHOOK_SECRET: process.env.MAKE_WEBHOOK_SECRET
      ? '✅ Configurada'
      : '⚠️ No configurada (opcional)',
    CRON_SECRET: process.env.CRON_SECRET
      ? '✅ Configurada'
      : '⚠️ No configurada',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? '✅ Configurada'
      : '❌ NO CONFIGURADA — El scheduler no puede escribir',
  };

  // 2. Posts en estado problemático
  const { data: pendingPosts } = await supabaseAdmin
    .from('social_posts')
    .select('id, status, scheduled_for, platforms, content_text, error_log, updated_at')
    .in('status', ['pending', 'processing', 'failed'])
    .is('archived_at', null)
    .order('updated_at', { ascending: false })
    .limit(10);

  diagnostics.posts = pendingPosts?.map(p => ({
    id: p.id,
    status: p.status,
    scheduled_for: p.scheduled_for,
    scheduled_for_local: p.scheduled_for
      ? new Date(p.scheduled_for).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })
      : null,
    is_past_due: p.scheduled_for ? new Date(p.scheduled_for) <= new Date() : false,
    platforms: p.platforms,
    content_preview: p.content_text?.slice(0, 60) + '...',
    error_log: p.error_log || null,
    updated_at: p.updated_at,
  })) || [];

  // 3. Últimos 20 logs del scheduler
  const { data: logs } = await supabaseAdmin
    .from('system_logs')
    .select('severity, message, created_at')
    .eq('service', 'scheduler')
    .order('created_at', { ascending: false })
    .limit(20);

  diagnostics.recent_logs = logs || [];

  // 4. Hora actual del servidor
  diagnostics.server_time = {
    utc: new Date().toISOString(),
    ecuador: new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
