const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuraciones de Bunny
const BUNNY_API_KEY = "90197f22-eb2d-4e71-8d5b3893666a-3c2c-44b4"; // De .env.local
const BUNNY_HOST = "br.storage.bunnycdn.com";
const BUNNY_ZONE = "cesarweb";

const baseLocalDir = path.join(__dirname, '..', '..', '..', 'public', 'carruseles');

async function uploadFile(localFilePath, remotePathStr) {
    const fileData = fs.readFileSync(localFilePath);
    
    const encodePath = remotePathStr.split('/').map(segment => encodeURIComponent(segment)).join('/');
    
    const options = {
        hostname: BUNNY_HOST,
        path: `/${encodePath}`,
        method: 'PUT',
        headers: {
            'AccessKey': BUNNY_API_KEY,
            'Content-Type': 'application/octet-stream',
            'Content-Length': fileData.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if(res.statusCode === 201 || res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error(`Failed to upload: ${res.statusCode} ${data}`));
                }
            });
        });
        
        req.on('error', (e) => {
            reject(e);
        });
        
        req.write(fileData);
        req.end();
    });
}

async function startUpload() {
    let folders = [];
    try {
        folders = fs.readdirSync(baseLocalDir);
    } catch(e) {
        console.log("No existe public/carruseles o no se puede leer");
        return;
    }
    
    let uploadedCount = 0;
    
    for (const folder of folders) {
        const folderPath = path.join(baseLocalDir, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            console.log(`\nRevisando ${folder}...`);
            const files = fs.readdirSync(folderPath);
            for (const file of files) {
                if (file.endsWith('.webp')) {
                    const localFilePath = path.join(folderPath, file);
                    // ej: cesarweb/carruseles/Carrusel 1/archivo.webp
                    const remotePath = `${BUNNY_ZONE}/carruseles/${folder}/${file}`;
                    try {
                        console.log(`Subiendo: ${folder}/${file}...`);
                        await uploadFile(localFilePath, remotePath);
                        console.log(` ✅ OK`);
                        uploadedCount++;
                    } catch(e) {
                        console.error(` ❌ ERROR subiendo ${file}:`, e.message);
                    }
                }
            }
        }
    }
    console.log(`\n🎉 Completado. Imágenes WebP subidas a BunnyCDN: ${uploadedCount}`);
}

startUpload();
