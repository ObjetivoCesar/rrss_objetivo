const fs = require('fs');
const path = require('path');

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

const imagesFolder = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\rrss-objetivo\\public\\images\\blog";

async function uploadImages() {
  const files = fs.readdirSync(imagesFolder);
  const uploadedUrls = {};
  
  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const content = fs.readFileSync(filePath);
    
    // Simplificar el nombre para que la URL sea limpia
    const safeName = file.replace(/[^a-zA-Z0-9-_\.]/g, '_');
    const bunnyPath = `articulos/${safeName}`;
    
    console.log(`Subiendo ${file} a Bunny.net...`);
    const uploadRes = await fetch(`https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${bunnyPath}`, {
      method: 'PUT',
      headers: {
        AccessKey: BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    });
    
    if (!uploadRes.ok) {
        console.error(`Error HTTP ${uploadRes.status} al subir ${file}`);
    } else {
        const publicUrl = `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
        uploadedUrls[file] = publicUrl;
        console.log(`✅ Subido: ${publicUrl}`);
    }
  }
  return uploadedUrls;
}

const blogDir = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\blog";
const API_URL = "https://www.cesarreyesjaramillo.com/api/save-article";

const articlesMap = {
  'piloto-marketing-vs-fidelizacion.md': 'cesar-reyes-trabajando.webp',
  'mitos-cursos-seo-oficios.md': 'carpintero-qr-fidelizacion.png',
  'por-que-nadie-encuentra-tu-restaurante-en-internet.md': 'restaurante-visible-maps.png',
  'menu-por-whatsapp-pdf-te-hace-perder-clientes.md': 'whatsapp-messaging.webp',
  'como-conseguir-mas-pacientes-consultorio-medico.md': 'caso-exito-doctor.jpg'
};

async function updateArticles(uploadedUrls) {
  for (const [filename, imageName] of Object.entries(articlesMap)) {
    const filePath = path.join(blogDir, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
    if (!match) continue;

    const frontmatterStr = match[1];
    const markdownBody = match[2].trim();

    const titleMatch = frontmatterStr.match(/title:\n?\s*"([^"]+)"/);
    const categoryMatch = frontmatterStr.match(/category:\n?\s*"([^"]+)"/);
    const excerptMatch = frontmatterStr.match(/excerpt:\n?\s*"([^"]+)"/);
    const metaDescMatch = frontmatterStr.match(/meta_description:\n?\s*"([^"]+)"/);

    const publicImgUrl = uploadedUrls[imageName];
    if (!publicImgUrl) {
       console.log(`⚠️ Ignorando ${filename} porque no hay URL para la imagen ${imageName}`);
       continue;
    }

    const payload = {
      title: titleMatch ? titleMatch[1] : null,
      category: categoryMatch ? categoryMatch[1] : null,
      excerpt: excerptMatch ? excerptMatch[1] : null,
      metaDescription: metaDescMatch ? metaDescMatch[1] : null,
      image: publicImgUrl,
      markdown: markdownBody,
    };

    if (!['automatizacion', 'diseno-web', 'marketing-digital', 'asesoria', 'desarrollo-web', 'posicionamiento-marca'].includes(payload.category)) {
      payload.category = "asesoria";
    }

    console.log(`Actualizando ${payload.title}...`);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
         console.error(`❌ Error al publicar ${filename}: ${await response.text()}`);
      } else {
         console.log(`✅ Artículo actualizado correctamente en Supabase!`);
      }
    } catch(e) {
      console.error(`Error de red para ${filename}:`, e);
    }
  }
}

async function run() {
  const urls = await uploadImages();
  await updateArticles(urls);
}

run();
