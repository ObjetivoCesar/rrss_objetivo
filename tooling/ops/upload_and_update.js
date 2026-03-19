const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcfsexddgupnvbvntgyz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4';

const supabase = createClient(supabaseUrl, supabaseKey);

const imagesFolder = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\rrss-objetivo\\public\\images\\blog";
const bucketName = 'blog-images';

function getContentType(filename) {
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

async function uploadImages() {
  console.log("Creando bucket...");
  const { data: bucket, error: bucketErr } = await supabase.storage.createBucket(bucketName, { public: true });
  if (bucketErr && bucketErr.message !== 'The resource already exists') {
    console.error("Error creating bucket:", bucketErr);
    return null;
  }
  
  const files = fs.readdirSync(imagesFolder);
  const uploadedUrls = {};
  
  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const content = fs.readFileSync(filePath);
    
    console.log(`Subiendo ${file}...`);
    const { data, error } = await supabase.storage.from(bucketName).upload(file, content, {
      contentType: getContentType(file),
      upsert: true
    });
    
    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file);
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

    const payload = {
      title: titleMatch ? titleMatch[1] : null,
      category: categoryMatch ? categoryMatch[1] : null,
      excerpt: excerptMatch ? excerptMatch[1] : null,
      metaDescription: metaDescMatch ? metaDescMatch[1] : null,
      image: publicImgUrl || null,
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
         console.error(`Error al publicar ${filename}: ${await response.text()}`);
      } else {
         console.log(`✅ Artículo actualizado correctamente!`);
      }
    } catch(e) {
      console.error(`Error de red para ${filename}:`, e);
    }
    await new Promise(res => setTimeout(res, 1000));
  }
}

async function run() {
  const urls = await uploadImages();
  if (urls) {
    await updateArticles(urls);
  }
}

run();
