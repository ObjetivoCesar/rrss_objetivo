/**
 * Next.js Instrumentation Hook
 * Se ejecuta UNA VEZ cuando el servidor arranca.
 * Aquí iniciamos el auto-scheduler para publicar posts automáticamente.
 */
export async function register() {
  // Solo ejecutar en el runtime de Node.js (servidor), no en Edge
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startAutoScheduler } = await import('./lib/auto-scheduler');
    startAutoScheduler();
    console.log('[Instrumentation] ✅ Auto-scheduler registrado.');
  }
}
