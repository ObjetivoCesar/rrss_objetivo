const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const ZONE = process.env.BUNNY_STORAGE_ZONE;
const KEY = process.env.BUNNY_STORAGE_API_KEY;
const HOST = process.env.BUNNY_STORAGE_HOST || "br.storage.bunnycdn.com";
const PULL = process.env.BUNNY_PULLZONE_URL;

const carruselesDir = path.join(__dirname, '..', '..', '..', 'public', 'carruseles');

async function uploadFile(buffer, fileName) {
    const resp = await fetch(`https://${HOST}/${ZONE}/${fileName}`, {
        method: "PUT",
        headers: { AccessKey: KEY, "Content-Type": "image/webp" },
        body: buffer,
    });
    if (!resp.ok) throw new Error(`Bunny Error ${resp.status}: ${await resp.text()}`);
    return `${PULL}/${fileName}`;
}

async function syncCarruseles() {
    console.log("🚀 Iniciando carga de carruseles a Bunny CDN...");
    
    const folders = fs.readdirSync(carruselesDir);
    const results = {};

    for (const folder of folders) {
        const folderPath = path.join(carruselesDir, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        console.log(`\n📂 Procesando: ${folder}`);
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.webp'));
        // Ordenar numéricamente para asegurar que slide1 vaya antes que slide10 etc.
        files.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

        results[folder] = [];

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const buffer = fs.readFileSync(filePath);
            
            // Nombre en el CDN: carruseles/Carrusel_N/slide_M.webp
            const safeFolderName = folder.replace(/\s+/g, '_');
            const bunnyPath = `carruseles/${safeFolderName}/${file}`;
            
            try {
                const url = await uploadFile(buffer, bunnyPath);
                results[folder].push(url);
                console.log(`   ✅ Subido: ${bunnyPath}`);
            } catch (e) {
                console.error(`   ❌ Error en ${file}: ${e.message}`);
            }
        }
    }

    // Guardar mapeo para el siguiente script
    fs.writeFileSync(path.join(__dirname, 'carousel_urls.json'), JSON.stringify(results, null, 2));
    console.log("\n✨ Carga completada. Mapeo guardado en carousel_urls.json");
}

syncCarruseles();
