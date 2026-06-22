const fs = require('fs');
const path = require('path');

const AUTH = 'Bearer CesarQuotes2026';
const URL = 'https://www.cesarreyesjaramillo.com/api/webhooks/blog';

const dir = 'C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\estrategia-posicionamiento\\02-articulos';

const articles = [
  { file: 'Art-001.md', slug: 'negocio-local-centro-arriendo-gente-pasa-no-entra', tags: 'negocios-locales,arriendo,tráfico-físico,centros-comerciales,pqr-ecuador', keyword: 'negocios locales arriendo tráfico' },
  { file: 'Art-002.md', slug: 'negocio-local-fisico-redes-sociales-diferente', tags: 'negocios-locales,redes-sociales,tráfico-físico,arriendo,pqr-ecuador', keyword: 'negocios locales redes sociales vs físico' },
  { file: 'Art-003.md', slug: 'marketing-no-funcio-no-fue-herramienta-fue-falta-plan', tags: 'negocios-locales,marketing-fracasado,estrategia,desconfianza,sistema-capta', keyword: 'marketing no funciono plan estrategia' }
];

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
    let v = line.slice(i+1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1,-1);
    fm[line.slice(0,i).trim()] = v;
  }
  return fm;
}

async function publish(a) {
  const fp = path.join(dir, a.file);
  const raw = fs.readFileSync(fp);
  const bom = raw[0] === 0xEF && raw[1] === 0xBB && raw[2] === 0xBF;
  const full = bom ? raw.slice(3).toString('utf-8') : raw.toString('utf-8');
  const content = extractMarkdown(full);
  const fm = extractFrontmatter(full);
  const title = fm.title || path.basename(a.file, '.md');
  const clean = content.replace(/\s*$/, '').trim();
  const image_url = fm.image_url || '';
  const payload = { title, slug: a.slug, content: clean, excerpt: fm.excerpt || title, category: 'negocios-locales', image_url, date: '2026-05-31', tags: a.tags, metaDescription: fm.excerpt || title, keyword: a.keyword };
  console.log('=== ' + a.slug + ' ===');
  console.log('title:', title);
  console.log('image_url:', image_url);
  const res = await fetch(URL, { method:'POST', headers:{'Content-Type':'application/json','Authorization':AUTH}, body:JSON.stringify(payload) });
  console.log('  Status:', res.status, await res.text());
}

async function main() {
  for (const a of articles) { await publish(a); await new Promise(r=>setTimeout(r,500)); }
}
main().catch(console.error);