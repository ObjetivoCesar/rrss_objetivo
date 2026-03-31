import { processScheduledPosts } from './scheduler';

/**
 * Auto-Scheduler: Ejecuta el motor de publicación cada 60 segundos.
 * Se inicia automáticamente cuando el servidor Next.js arranca.
 * 
 * En producción (Vercel), esto NO funciona (serverless).
 * Para producción, configurar Vercel Cron o Make.com scheduler
 * que haga GET /api/cron/process cada minuto.
 */

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutos para ahorrar CPU en local
let intervalId: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

async function tick() {
  // Solo ejecutar si no estamos en desarrollo o si el modo dev-scheduler está forzado
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && !process.env.FORCE_DEV_SCHEDULER) {
    return;
  }

  if (isRunning) {
    console.log('[AutoScheduler] ⏳ Ciclo anterior aún en curso, saltando...');
    return;
  }

  isRunning = true;
  try {
    await processScheduledPosts();
  } catch (err: any) {
    console.error('[AutoScheduler] 💥 Error en ciclo:', err.message);
  } finally {
    isRunning = false;
  }
}

export function startAutoScheduler() {
  if (intervalId) {
    console.log('[AutoScheduler] Ya está corriendo.');
    return;
  }

  console.log(`[AutoScheduler] 🚀 Iniciado — revisando posts cada ${INTERVAL_MS / 1000}s`);
  
  // Ejecutar inmediatamente al iniciar
  tick();
  
  // Luego cada minuto
  intervalId = setInterval(tick, INTERVAL_MS);
}

export function stopAutoScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[AutoScheduler] 🛑 Detenido.');
  }
}
