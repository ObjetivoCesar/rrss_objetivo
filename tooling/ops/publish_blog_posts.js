const fs = require('fs');
const path = require('path');

const blogDir = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\blog";

const articles = [
  'piloto-marketing-vs-fidelizacion.md',
  'mitos-cursos-seo-oficios.md',
  'por-que-nadie-encuentra-tu-restaurante-en-internet.md',
  'menu-por-whatsapp-pdf-te-hace-perder-clientes.md',
  'como-conseguir-mas-pacientes-consultorio-medico.md'
];

const API_URL = "https://www.cesarreyesjaramillo.com/api/save-article";

async function parseAndSend(filename) {
  const filePath = path.join(blogDir, filename);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse Frontmatter
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.error(`Could not parse frontmatter in ${filename}`);
    return;
  }

  const frontmatterStr = match[1];
  const markdownBody = match[2].trim();

  // Extract variables
  const titleMatch = frontmatterStr.match(/title:\n?\s*"([^"]+)"/);
  const categoryMatch = frontmatterStr.match(/category:\n?\s*"([^"]+)"/);
  const excerptMatch = frontmatterStr.match(/excerpt:\n?\s*"([^"]+)"/);
  const metaDescMatch = frontmatterStr.match(/meta_description:\n?\s*"([^"]+)"/);
  const imageMatch = frontmatterStr.match(/image_url:\n?\s*"([^"]+)"/);

  const payload = {
    title: titleMatch ? titleMatch[1] : null,
    category: categoryMatch ? categoryMatch[1] : null,
    excerpt: excerptMatch ? excerptMatch[1] : null,
    metaDescription: metaDescMatch ? metaDescMatch[1] : null,
    image: imageMatch ? imageMatch[1] : null,
    markdown: markdownBody,
  };

  // Adjust categories if they use different names to what the endpoint expects
  // Allowed: automatizacion, diseno-web, marketing-digital, asesoria, desarrollo-web, posicionamiento-marca.
  if (!['automatizacion', 'diseno-web', 'marketing-digital', 'asesoria', 'desarrollo-web', 'posicionamiento-marca'].includes(payload.category)) {
      payload.category = "asesoria"; // fallback just in case
  }

  // Set the specific images we discussed, assuming we use relative paths or place holder for now since the custom images are in /public/images/blog/ in his nextjs app.
  // We'll trust the frontmatter image for the pilot ones, but for the new ones, let's use the local paths we set or general paths:
  const BUNNY = "https://cesarweb.b-cdn.net/articulos";
  if (filename === 'piloto-marketing-vs-fidelizacion.md') {
      payload.image = `${BUNNY}/cesar-reyes-trabajando.webp`;
  } else if (filename === 'mitos-cursos-seo-oficios.md') {
      payload.image = `${BUNNY}/carpintero-qr-fidelizacion.png`;
  } else if (filename === 'por-que-nadie-encuentra-tu-restaurante-en-internet.md') {
      payload.image = `${BUNNY}/restaurante-visible-maps.png`;
  } else if (filename === 'menu-por-whatsapp-pdf-te-hace-perder-clientes.md') {
      payload.image = `${BUNNY}/whatsapp-messaging.webp`;
  } else if (filename === 'como-conseguir-mas-pacientes-consultorio-medico.md') {
      payload.image = `${BUNNY}/caso-exito-doctor.jpg`;
  }

  console.log(`Sending ${payload.title}...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
       const err = await response.text();
       console.error(`Failed to publish ${filename}: ${response.status} ${err}`);
    } else {
       const resJson = await response.json();
       console.log(`✅ Success for ${filename}!`, resJson);
    }
  } catch(e) {
    console.error(`Network error for ${filename}:`, e);
  }
}

async function run() {
  for (const file of articles) {
    await parseAndSend(file);
    // slight delay to prevent rate liming
    await new Promise(res => setTimeout(res, 1000));
  }
}

run();
