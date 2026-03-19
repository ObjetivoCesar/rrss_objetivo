/**
 * verify-donna-fixes.js — v2
 * Tests the REAL current code and REAL db schema.
 */
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const P = '✅ PASS';
const F = '❌ FAIL';
const W = '⚠️  WARN';

async function run() {
  console.log('\n========================================');
  console.log('  DONNA FIXES v2 — VERIFICATION REPORT');
  console.log('========================================\n');

  const routePath = path.join(process.cwd(), 'apps/rrss-objetivo/src/app/api/chat/route.ts');
  const code = fs.readFileSync(routePath, 'utf8');

  // ── FIX 1: Snapshot usa social_posts, no 'posts' ───
  console.log('FIX 1: Snapshot DB — tabla correcta\n');

  const hasBrokenPosts = code.includes(".from('posts')");
  const hasSocialPosts = code.includes(".from('social_posts')");
  console.log(`  ${!hasBrokenPosts ? P : F} No hay referencia a tabla 'posts' (inexistente)`);
  console.log(`  ${hasSocialPosts ? P : F} Hay referencia a 'social_posts' (real)`);

  // Verify live — REAL columns only
  const { data: sp, error: spErr } = await supabase
    .from('social_posts')
    .select('id, status, platforms, campaign_id, objective_id')
    .limit(2);
  console.log(`  ${!spErr ? P : F} social_posts consultable con columnas reales: ${spErr?.message || 'OK'}`);

  // ── FIX 2: propose_post usa draft_ai ──────────────
  console.log('\nFIX 2: propose_post usa draft_ai\n');

  const hasDraftAi = code.includes("status: 'draft_ai'");
  console.log(`  ${hasDraftAi ? P : F} Código contiene status: 'draft_ai'`);

  // Live insert test with REAL columns
  const { data: probe, error: probeErr } = await supabase
    .from('social_posts')
    .insert([{
      content_text: '[DONNA QA] Test draft_ai. BORRAR.',
      platforms: ['instagram'],
      status: 'draft_ai',
      scheduled_for: new Date().toISOString(),
    }])
    .select('id, status')
    .single();
  
  if (!probeErr && probe) {
    console.log(`  ${P} Insert draft_ai OK — ID: ${probe.id}`);
    await supabase.from('social_posts').delete().eq('id', probe.id);
    console.log(`  ${P} Cleanup OK`);
  } else {
    console.log(`  ${F} Insert draft_ai FALLÓ: ${probeErr?.message}`);
  }

  // ── FIX 3: propose_post usa columnas reales ────────
  console.log('\nFIX 3: propose_post usa sólo columnas reales\n');

  const proposeSection = code.substring(
    code.indexOf('propose_post: tool'),
    code.indexOf('propose_post: tool') + 2500
  );

  const usesToopic = proposeSection.includes("'topic'") || proposeSection.replace(/\/\/.*/g, '').includes('topic:');
  const usesCategoryId = proposeSection.includes("'category_id'") || proposeSection.replace(/\/\/.*/g, '').includes('category_id:');
  const usesTargetMonth = proposeSection.replace(/\/\/.*/g, '').includes('target_month:') && proposeSection.includes('.insert');
  const usesContentText = proposeSection.includes('content_text');
  const forcesDraftAi = proposeSection.includes("status: 'draft_ai'");
  const hasDirectInsert = proposeSection.includes(".from('social_posts')");

  console.log(`  ${!usesToopic ? P : W} No usa columna 'topic' (no existe en DB)`);
  console.log(`  ${!usesCategoryId ? P : W} No usa columna 'category_id' (no existe en DB)`);
  console.log(`  ${!usesTargetMonth ? P : W} No usa columna 'target_month' (no existe en DB)`);
  console.log(`  ${usesContentText ? P : F} Usa 'content_text' (columna real)`);
  console.log(`  ${forcesDraftAi ? P : F} Fuerza status: 'draft_ai'`);
  console.log(`  ${hasDirectInsert ? P : W} Usa insert directo a social_posts (simplificado, sin endpoint intermediario)`);

  // ── BONUS: objectives schema ──────────────────────
  console.log('\nBONUS: Schema de objectives\n');
  const { data: obj, error: objErr } = await supabase
    .from('objectives')
    .select('id, name, description, emoji, color, archived_at')
    .limit(1);
  console.log(`  ${!objErr ? P : F} objectives accesible con columnas reales: ${objErr?.message || 'OK'}`);
  if (obj?.[0]) console.log(`  ${P} Ejemplo: ${obj[0].emoji} "${obj[0].name}"`);

  console.log('\n========================================');
  console.log('  VERIFICACIÓN COMPLETADA');
  console.log('========================================\n');
}

run().catch(e => { console.error(e); process.exit(1); });
