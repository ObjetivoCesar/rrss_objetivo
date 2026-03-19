import { supabaseAdmin } from './supabase-admin';

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export async function logSystem(
  service: string,
  severity: LogSeverity,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    const { error } = await supabaseAdmin
      .from('system_logs')
      .insert([
        {
          service,
          severity,
          message,
          metadata: metadata || {}
        }
      ]);

    if (error) {
      console.error('❌ [Logger] Error guardando log en Supabase:', error.message);
    }
  } catch (err: any) {
    console.error('❌ [Logger] Excepción guardando log:', err.message);
  }
}
