const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

async function uploadImage() {
  const localPath = path.join(__dirname, '../apps/rrss-objetivo/public/images/pickup_qr_sertecvaz.png');
  const fileName = 'pickup_qr_sertecvaz.png';
  const bunnyPath = `activaqr/${fileName}`;

  console.log(`🚀 Iniciando subida de ${fileName} a Bunny.net (${bunnyPath})...`);

  try {
    const fileStream = fs.createReadStream(localPath);
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${bunnyPath}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/png'
      },
      body: fileStream
    });

    if (res.ok) {
      const publicUrl = `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
      console.log(`✅ ¡Imagen subida con éxito!`);
      console.log(`🔗 URL Pública: ${publicUrl}`);
    } else {
      const errorText = await res.text();
      console.error(`❌ Error al subir a Bunny. Status: ${res.status}. Detalle: ${errorText}`);
    }
  } catch (err) {
    console.error(`❌ Error de red o archivo: ${err.message}`);
  }
}

uploadImage();
