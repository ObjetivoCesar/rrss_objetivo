import fs from 'fs';
import { parse } from 'csv-parse/sync';

async function main() {
  const csvPath = 'BLOG_ESTRATEGICO_2026.csv';
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const articles = parse(fileContent, { columns: true, skip_empty_lines: true, relax_quotes: true });

  const bunnyBase = "https://cesarweb.b-cdn.net/articulos";
  const genericImg = `${bunnyBase}/cesar-reyes-marca-generica.webp`;
  
  const mappingImg = {
    'ia-ecuador-casos-reales': `${bunnyBase}/portada_ia_ecuador_casos_reales_1774375909375.png`,
    'error-marketing-familiar-pymes': `${bunnyBase}/portada_error_marketing_familiar_2026_1774378705260.png`,
    'guia-definitiva-seo-local': `${bunnyBase}/portada_seo_local_maps_2026_v2_1774379800627.png`,
    'networking-para-ceos': `${bunnyBase}/portada_activaqr_networking_2026_1774380305318.png`,
    'arquitectura-conversion-eficiencia': `${bunnyBase}/portada_infraestructura_vs_bonita_2026_1774380285047.png`
  };

  const pillars = ['ia-ecuador-casos-reales', 'guia-definitiva-seo-local', 'crm-whatsapp-ia-ecuador', 'catalogos-digitales-ecommerce-2026', 'estrategia-seo-b2b-autoridad', 'arquitectura-conversion-eficiencia'];

  const rows: any[] = [];
  let startDate = new Date('2026-03-25');

  articles.forEach((art: any, index: number) => {
    const slug = art.Slug;
    const title = art.Titulo;
    const dateStr = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000).toLocaleDateString('es-EC');
    const img = mappingImg[slug as keyof typeof mappingImg] || genericImg;
    const isPillar = pillars.includes(slug);
    const type = isPillar ? 'Carrusel (8 slides)' : 'Imagen + Hook';

    // Contenido de slides para pilares
    const slidesContent = isPillar ? `L1: Gancho Disruptivo | L2: Dolo/Estadística | L3: Agitación | L4: Solución César | L5: Paso 1 | L6: Paso 2 | L7: Beneficio | L8: CTA WhatsApp` : '';

    // Post AM (LinkedIn / Facebook)
    rows.push({
      Fecha: dateStr,
      Hora: '07:30 AM',
      Plataforma: 'LinkedIn/FB',
      Tipo: type,
      Articulo: title,
      Slug: slug,
      Imagen: img,
      Contenido: art.Post_LI || `Gancho: ¿Sabías que ${title} es clave para tu Pyme? Descubre la arquitectura de conversión en mi blog: https://www.cesarreyesjaramillo.com/blog/${slug}`,
      Slides: slidesContent
    });

    // Post PM (Instagram)
    rows.push({
      Fecha: dateStr,
      Hora: '08:00 PM',
      Plataforma: 'Instagram',
      Tipo: type,
      Articulo: title,
      Slug: slug,
      Imagen: img,
      Contenido: art.Post_IG || `Visual impact: ${title}. Tira lo viejo y pásate a la automatización. Link en bio.`,
      Slides: slidesContent
    });
  });

  const headers = ['Fecha', 'Hora', 'Plataforma', 'Tipo', 'Articulo', 'Slug', 'Imagen', 'Contenido', 'Slides'];
  let csvOutput = headers.join(',') + '\n';
  rows.forEach(r => {
    const line = headers.map(h => {
      let val = r[h] || '';
      if (typeof val === 'string' && (val.includes(',') || val.includes('\n') || val.includes('"'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
    csvOutput += line + '\n';
  });

  fs.writeFileSync('REVISION_FINAL_48_POSTS.csv', csvOutput);
  console.log("🚀 Sábana de 48 posts generada en REVISION_FINAL_48_POSTS.csv");
}

main().catch(console.error);
