import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar .env.local desde la raíz de la app
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function runVerifications() {
  const results: { test: string; status: '✅ PASS' | '❌ FAIL'; detail: string }[] = [];

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // -----------------------------------------------------------------------
  // TEST 1: El cron rechaza requests sin Authorization
  // -----------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/cron/process`);
    if (res.status === 401) {
      results.push({ test: 'Cron Auth (sin token → 401)', status: '✅ PASS', detail: 'OK' });
    } else {
      results.push({ test: 'Cron Auth (sin token → 401)', status: '❌ FAIL', detail: `Status: ${res.status}` });
    }
  } catch (e: any) {
    results.push({ test: 'Cron Auth (sin token → 401)', status: '❌ FAIL', detail: e.message });
  }

  // -----------------------------------------------------------------------
  // TEST 2: POST update con campo prohibido → debe ser ignorado
  // -----------------------------------------------------------------------
  // Creamos un post de prueba primero
  const { data: testPost } = await supabase
    .from('social_posts')
    .insert([{ content_text: '[TEST] Verificación automática', platforms: ['facebook'], status: 'draft_ai', scheduled_for: new Date().toISOString() }])
    .select()
    .single();

  if (testPost) {
    try {
      const res = await fetch(`${BASE_URL}/api/posts/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: testPost.id, created_at: '2020-01-01T00:00:00Z' }),
      });
      const data = await res.json();
      if (!res.ok && data.error?.includes('No hay campos válidos')) {
        results.push({ test: 'Mass Assignment Protection (/posts/update)', status: '✅ PASS', detail: 'Campo prohibido rechazado' });
      } else {
        // Verificar que created_at no cambió
        const { data: reloaded } = await supabase.from('social_posts').select('created_at').eq('id', testPost.id).single();
        const unchanged = reloaded?.created_at !== '2020-01-01T00:00:00Z';
        results.push({ test: 'Mass Assignment Protection (/posts/update)', status: unchanged ? '✅ PASS' : '❌ FAIL', detail: unchanged ? 'Campo ignorado' : 'Campo fue modificado!' });
      }
    } catch (e: any) {
      results.push({ test: 'Mass Assignment Protection (/posts/update)', status: '❌ FAIL', detail: e.message });
    }

    // Limpiar post de prueba
    await supabase.from('social_posts').delete().eq('id', testPost.id);
  }

  // -----------------------------------------------------------------------
  // TEST 3: Soft Delete de un objetivo y verificar que no aparece en GET
  // -----------------------------------------------------------------------
  const { data: testObj } = await supabase
    .from('objectives')
    .insert([{ name: '[TEST] Objetivo de verificación', description: 'Borrar', emoji: '🧪', color: '#999999' }])
    .select()
    .single();

  if (testObj) {
    try {
      const delRes = await fetch(`${BASE_URL}/api/campaigns/${testObj.id}?type=objective`, { method: 'DELETE' });
      if (!delRes.ok) throw new Error(`DELETE respondió ${delRes.status}`);

      const getRes = await fetch(`${BASE_URL}/api/campaigns`);
      const allData = await getRes.json();
      const found = allData.some((o: any) => o.id === testObj.id);
      results.push({ test: 'Soft Delete (objetivo no aparece en GET)', status: found ? '❌ FAIL' : '✅ PASS', detail: found ? 'Objetivo aún visible!' : 'Archivado correctamente' });
    } catch (e: any) {
      results.push({ test: 'Soft Delete (objetivo no aparece en GET)', status: '❌ FAIL', detail: e.message });
    } finally {
      // Limpieza física del test
      await supabase.from('objectives').delete().eq('id', testObj.id);
    }
  }

  // -----------------------------------------------------------------------
  // TEST 4: Sistema de Logs (inserta un log y lo lee)
  // -----------------------------------------------------------------------
  try {
    const { error: logError } = await supabase
      .from('system_logs')
      .insert([{ service: 'verify-script', severity: 'INFO', message: '[TEST] Log de verificación automática' }]);

    if (logError) throw logError;

    const { data: recentLog } = await supabase
      .from('system_logs')
      .select('*')
      .eq('service', 'verify-script')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const ok = recentLog?.message?.includes('[TEST]');
    results.push({ test: 'Sistema de Logs (system_logs table)', status: ok ? '✅ PASS' : '❌ FAIL', detail: ok ? `Log ID: ${recentLog.id}` : 'No se encontró el log' });
  } catch (e: any) {
    results.push({ test: 'Sistema de Logs (system_logs table)', status: '❌ FAIL', detail: e.message });
  }

  // -----------------------------------------------------------------------
  // TEST 5: Recovery de posts en 'processing' — simula un post colgado
  // -----------------------------------------------------------------------
  try {
    const staleTime = new Date(Date.now() - 15 * 60 * 1000).toISOString(); // 15 min atrás
    const { data: stalePost } = await supabase
      .from('social_posts')
      .insert([{
        content_text: '[TEST] Post colgado en processing',
        platforms: ['facebook'],
        status: 'processing',
        scheduled_for: staleTime,
        updated_at: staleTime,
      }])
      .select()
      .single();

    if (stalePost) {
      // Disparar el scheduler para activar el recovery
      const trigRes = await fetch(`${BASE_URL}/api/cron/trigger`, { method: 'POST' });
      if (!trigRes.ok) {
        throw new Error(`CRON trigger falló: ${trigRes.statusText}`);
      }

      // Esperar tiempo suficiente para que Next.js dev server compile la ruta y ejecute
      await new Promise(r => setTimeout(r, 15000)); // Esperar 15s

      const { data: recovered } = await supabase
        .from('social_posts')
        .select('status')
        .eq('id', stalePost.id)
        .single();

      const wasRecovered = recovered?.status === 'pending';
      results.push({ test: 'Recovery de posts en processing', status: wasRecovered ? '✅ PASS' : '❌ FAIL', detail: wasRecovered ? 'Post recuperado a pending' : `Status actual: ${recovered?.status}` });

      // Limpiar
      await supabase.from('social_posts').delete().eq('id', stalePost.id);
    }
  } catch (e: any) {
    results.push({ test: 'Recovery de posts en processing', status: '❌ FAIL', detail: e.message });
  }

  // -----------------------------------------------------------------------
  // REPORTE FINAL
  // -----------------------------------------------------------------------
  console.log('\n════════════════════════════════════════');
  console.log('   REPORTE DE VERIFICACIÓN DEL SISTEMA');
  console.log('════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;
  results.forEach(r => {
    console.log(`${r.status}  ${r.test}`);
    if (r.detail) console.log(`         → ${r.detail}`);
    if (r.status === '✅ PASS') passed++;
    else failed++;
  });

  console.log('\n────────────────────────────────────────');
  console.log(`Total: ${passed + failed} tests | ✅ ${passed} pasaron | ❌ ${failed} fallaron`);
  console.log('────────────────────────────────────────\n');

  if (failed > 0) process.exit(1);
}

runVerifications().catch(err => {
  console.error('Error en script de verificación:', err);
  process.exit(1);
});
