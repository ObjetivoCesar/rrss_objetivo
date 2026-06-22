/**
 * fix-articles.js
 * ─────────────────────────────────────────────────────────────
 * 1. BORRA el artículo de prueba "como-impulsar-tus-negocios-locales-2026"
 * 2. UPSERT (INSERT o UPDATE si slug ya existe) Art-001 y Art-002
 *    para que queden con el contenido correcto en la web.
 * ─────────────────────────────────────────────────────────────
 */

const fs   = require('fs');
const path = require('path');

const AUTH    = 'Bearer CesarQuotes2026';
const BASE    = 'https://www.cesarreyesjaramillo.com/api/webhooks/blog';
const DIR     = 'C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\estrategia-posicionamiento\\02-articulos';

// ── Artículos a publicar (UPSERT) ──────────────────────────
const articles = [
  {
    file:    'Art-001.md',
    slug:    'negocio-local-centro-arriendo-gente-pasa-no-entra',
    tags:    'negocios-locales,arriendo,tráfico-físico,centros-comerciales,pqr-ecuador',
    keyword: 'negocios locales arriendo tráfico',
    date:    '2026-05-31',
  },
  {
    file:    'Art-002.md',
    slug:    'negocio-local-fisico-redes-sociales-diferente',
    tags:    'negocios-locales,redes-sociales,tráfico-físico,arriendo,pqr-ecuador',
    keyword: 'negocios locales redes sociales vs físico',
    date:    '2026-05-31',
  },
];

// ── Slug a ELIMINAR (artículo de prueba) ───────────────────
const SLUG_TO_DELETE = 'como-impulsar-tus-negocios-locales-2026';

// ── Helpers ────────────────────────────────────────────────
function extractMarkdown(content) {
  const m = content.match(/^---[\s\S]*?---\n/);
  return m ? content.slice(m[0].length).trim() : content.trim();
}

function extractFrontmatter(content) {
  const m = content.match(/^---([\s\S]*?)---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    let v = line.slice(i + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[line.slice(0, i).trim()] = v;
  }
  return fm;
}

// ── DELETE artículo de prueba ──────────────────────────────
async function deleteTestArticle() {
  console.log(`\n🗑️  Intentando eliminar artículo de prueba: ${SLUG_TO_DELETE}`);
  try {
    const res = await fetch(`${BASE}?slug=${SLUG_TO_DELETE}`, {
      method: 'DELETE',
      headers: { 'Authorization': AUTH },
    });
    const text = await res.text();
    if (res.status === 200 || res.status === 204) {
      console.log(`  ✅ Eliminado correctamente (${res.status})`);
    } else if (res.status === 404) {
      console.log(`  ℹ️  No encontrado (quizás ya fue borrado): ${text}`);
    } else {
      console.log(`  ⚠️  Respuesta inesperada (${res.status}): ${text}`);
      console.log('     → Si el API no soporta DELETE, deberás borrarlo manualmente desde la BD.');
    }
  } catch (e) {
    console.error('  ❌ Error de red:', e.message);
  }
}

// ── UPSERT artículo ────────────────────────────────────────
async function upsert(a) {
  const fp  = path.join(DIR, a.file);
  const raw = fs.readFileSync(fp);
  const bom = raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF;
  const full    = bom ? raw.slice(3).toString('utf-8') : raw.toString('utf-8');
  const content = extractMarkdown(full);
  const fm      = extractFrontmatter(full);
  const title   = fm.title || path.basename(a.file, '.md');
  const payload = {
    title,
    slug:            a.slug,
    content:         content.replace(/\s*$/, '').trim(),
    excerpt:         fm.excerpt || title,
    category:        'negocios-locales',
    image_url:       fm.image_url || '',
    date:            a.date,
    tags:            a.tags,
    metaDescription: fm.excerpt || title,
    keyword:         a.keyword,
    upsert:          true,   // le pedimos al servidor que haga UPDATE si ya existe
  };

  console.log(`\n📤 Publicando (UPSERT): ${a.slug}`);
  console.log(`   title:     ${title}`);
  console.log(`   image_url: ${payload.image_url}`);

  const res  = await fetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': AUTH },
    body:    JSON.stringify(payload),
  });
  const text = await res.text();
  console.log(`   Status: ${res.status}  →  ${text}`);
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  await deleteTestArticle();

  for (const a of articles) {
    await upsert(a);
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\n✅ Script finalizado. Verifica las URLs:\n');
  console.log('  • https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/negocio-local-centro-arriendo-gente-pasa-no-entra');
  console.log('  • https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/negocio-local-fisico-redes-sociales-diferente');
  console.log('  • https://www.cesarreyesjaramillo.com/blog/marketing-para-pymes/como-impulsar-tus-negocios-locales-2026  (debe dar 404)');
}

main().catch(console.error);
