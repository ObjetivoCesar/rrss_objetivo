import { processScheduledPosts } from './scheduler';

/**
 * Auto-Scheduler: Ejecuta el motor de publicación cada 60 segundos.
 * Se inicia automáticamente cuando el servidor Next.js arranca.
 * 
 * En producción (Vercel), esto NO funciona (serverless).
 * Para producción, configurar Vercel Cron o Make.com scheduler
 * que haga GET /api/cron/process cada minuto.
 */

const INTERVAL_MS = 60 * 1000; // 1 minuto
let intervalId: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

async function tick() {
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
