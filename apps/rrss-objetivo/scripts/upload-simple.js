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
        return `${BUNNY_PULLZONE_URL}/${bunnyPath}`;
    }
    return null;
}

async function main() {
    const path = 'C:\\Users\\Cesar\\.gemini\\antigravity\\brain\\9fca20af-34c9-4a31-922a-036d89041a77\\rosso_since_2000_qr_1778706017842.png';
    const url = await uploadFile(path, 'rosso-since-2000.png');
    console.log(`🔗 URL: ${url}`);
}

main();
