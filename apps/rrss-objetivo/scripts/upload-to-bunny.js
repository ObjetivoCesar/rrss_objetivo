const fs = require('fs');
const fetch = require('node-fetch');

const BUNNY_STORAGE_ZONE = 'cesarweb';
const BUNNY_API_KEY = '90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4';
const BUNNY_STORAGE_HOST = 'br.storage.bunnycdn.com';
const BUNNY_PULLZONE_URL = 'https://cesarweb.b-cdn.net';

async function uploadFile(localPath, remoteName) {
    console.log(`🚀 Subiendo ${remoteName} a Bunny.net...`);
    const fileContent = fs.readFileSync(localPath);
    const bunnyPath = `activaqr/${remoteName}`;
    
    const url = `https://${BUNNY_STORAGE_HOST}/${BUNNY_STORAGE_ZONE}/${bunnyPath}`;
    
    const resp = await fetch(url, {
        method: 'PUT',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream'
        },
        body: fileContent
    });

    if (resp.ok) {
        const publicUrl = `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
        console.log(`✅ ¡Subida exitosa!`);
        console.log(`🔗 URL Pública: ${publicUrl}`);
        return publicUrl;
    } else {
        const text = await resp.text();
        console.error(`❌ Error subiendo ${remoteName}:`, resp.status, text);
        return null;
    }
}

async function main() {
    // Entre Ríos
    const entreRiosPath = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\606640bf-1c79-42bd-8f4d-f6f4be6d1809\\entre_rios_van_yellow_1777510847257.png';
    await uploadFile(entreRiosPath, 'cooperativa_entre_rios_loja_v2.png');

    // Estosur
    const estosurPath = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\606640bf-1c79-42bd-8f4d-f6f4be6d1809\\estosur_yellow_van_1777508586167.png';
    await uploadFile(estosurPath, 'cooperativa_estosur_loja_v2.png');
}

main();
