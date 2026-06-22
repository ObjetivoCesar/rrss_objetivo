-- ============================================================
-- RRSS OBJETIVO — Motor de Publicación Automático
-- Supabase pg_cron + pg_net Configuration
-- 
-- QUÉ HACE: Cada minuto, Supabase llama directamente a la API
-- de producción en Vercel para procesar posts pendientes.
-- 
-- RESULTADO: Make.com SOLO se activa cuando hay un post listo.
-- Zero operaciones de polling. Zero costos de espera.
-- ============================================================

-- ✅ URL VERIFICADA (200 OK confirmado el 2026-04-26)
-- https://rrss-objetivo-rrss-objetivo.vercel.app/api/cron/process

-- ============================================================
-- FIX: Reemplazar el job antiguo con la URL correcta
-- ============================================================
SELECT cron.unschedule('rrss-dispatch-scheduler');

SELECT cron.schedule(
  'rrss-dispatch-scheduler',
  '* * * * *',
  $$
  SELECT net.http_get(
    url     := 'https://rrss-objetivo-rrss-objetivo.vercel.app/api/cron/process',
    headers := jsonb_build_object(
      'Authorization', 'Bearer test-secret-12345',
      'Content-Type',  'application/json'
    )
  );
  $$
);

-- ============================================================
-- VERIFICACIÓN: Confirma que el job quedó registrado
-- ============================================================
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'rrss-dispatch-scheduler';

-- ============================================================
-- MONITOREO: Ver el historial de ejecuciones (últimas 20)
-- ============================================================
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'rrss-dispatch-scheduler')
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- ============================================================
-- APAGAR EL JOB (si algún día necesitas pausar)
-- ============================================================
-- SELECT cron.unschedule('rrss-dispatch-scheduler');
