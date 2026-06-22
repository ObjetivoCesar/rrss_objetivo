const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

async function uploadToBunny(localFilePath, bunnyFileName) {
  const bunnyPath = `activaqr/${bunnyFileName}`;
  console.log(`🚀 Subiendo ${bunnyFileName}...`);

  try {
    const fileStream = fs.createReadStream(localFilePath);
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
      console.log(`✅ ${bunnyFileName} subido a: ${BUNNY_PULLZONE_URL}/${bunnyPath}`);
      return `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
    } else {
      console.error(`❌ Error subiendo ${bunnyFileName}: ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
}

async function main() {
  const files = [
    {
      local: 'C:/Users/Cesar/.gemini/antigravity/brain/000d80ad-2252-44d7-af91-553149ecb134/media__1777926160869.png',
      remote: 'hidrocobre_logo.png'
    },
    {
      local: 'C:/Users/Cesar/.gemini/antigravity/brain/000d80ad-2252-44d7-af91-553149ecb134/hidrocobre_mockup_v1_1777926637398.png',
      remote: 'hidrocobre_mockup.png'
    }
  ];

  for (const file of files) {
    await uploadToBunny(file.local, file.remote);
  }
}

main();
