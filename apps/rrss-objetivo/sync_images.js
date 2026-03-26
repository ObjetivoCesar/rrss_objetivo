const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const ZONE = process.env.BUNNY_STORAGE_ZONE;
const KEY = process.env.BUNNY_STORAGE_API_KEY;
const HOST = process.env.BUNNY_STORAGE_HOST || "br.storage.bunnycdn.com";
const PULL = process.env.BUNNY_PULLZONE_URL;

const imagesDir = 'C:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/public/imagenes para los artículos/Optimizadas';
const csvPath = 'c:/Users/Cesar/Documents/GRUPO EMPRESARIAL REYES/PROYECTOS/RRSS_objetivo/BLOG_ESTRATEGICO_2026.csv';

function normalize(str) {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ' ').trim();
}

async function uploadToBunny(buffer, fileName) {
    const resp = await fetch(`https://${HOST}/${ZONE}/${fileName}`, {
        method: "PUT",
        headers: { AccessKey: KEY, "Content-Type": "image/webp" },
        body: buffer,
    });
    if (!resp.ok) throw new Error(`Bunny Error: ${resp.status}`);
    return `${PULL}/${fileName}`;
}

function parseCSV(content) {
    const rows = []; let currentRow = []; let currentField = ''; let inQuotes = false;
    for (let i = 0; i < content.length; i++) {
        const char = content[i]; const nextChar = content[i+1];
        if (inQuotes) {
            if (char === '"') { if (nextChar === '"') { currentField += '"'; i++; } else inQuotes = false; }
            else currentField += char;
        } else {
            if (char === '"') inQuotes = true;
            else if (char === ',') { currentRow.push(currentField); currentField = ''; }
            else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentField); rows.push(currentRow); currentRow = []; currentField = '';
                if (char === '\r') i++;
            } else currentField += char;
        }
    }
    if (currentField || currentRow.length > 0) { currentRow.push(currentField); rows.push(currentRow); }
    return rows;
}

function stringifyCSV(rows) {
    return rows.map(row => row.map(f => {
        const s = f || '';
        if (s.includes(',') || s.includes('"') || s.includes('\n')) return `"${s.replace(/"/g, '""')}"`;
        return s;
    }).join(',')).join('\n');
}

async function startSync() {
    console.log("🚀 Image Sync 4.0 (Final Coverage)...");
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCSV(csvContent);
    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const slugIdx = headers.indexOf('Slug');
    const thumbIdx = headers.indexOf('Thumbnail');

    const files = fs.readdirSync(imagesDir);
    const updates = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const id = row[idIdx];
        const slug = row[slugIdx];
        if (!id || !slug) continue;

        let bestFile = null;
        
        // Manual Mapping based on LS output
        if (id == 1) bestFile = 'portada_final Como usar la IA en mi negocio en Ecuador.webp';
        else if (id == 2) bestFile = 'imagen_2_error_sobrino.webp';
        else if (id == 3) bestFile = 'Guía Definitiva de WhatsApp y CRM con IA_faro_portada.webp';
        else if (id == 4) bestFile = 'imagen_4_whatsapp_crm.webp';
        else if (id == 5) bestFile = 'imagen_5_ecommerce_2026.webp';
        else if (id == 6) bestFile = 'imagen_6_tarjetas_papel.webp';
        else if (id == 7) bestFile = 'El Síndrome de la Madrugada _vigilante_portada.webp';
        else if (id == 8) bestFile = 'imagen_8_adios_excel.webp';
        else if (id == 9) bestFile = 'marketing_en_verde.webp';
        else if (id == 11) bestFile = 'IA_Ecuador_Corporate.webp';
        else if (id == 12) bestFile = 'latido_portada_Tomapedidos vs Closer con IA.webp';
        else if (id == 13) bestFile = 'Autoridad_Digital_B2B_CyberTech.webp';
        else if (id == 15) bestFile = 'networking_b2b.webp';
        else if (id == 17) bestFile = 'Menú_Digital_ceviche_menu.webp';
        else if (id == 18) bestFile = 'costo_impresion.webp';
        else if (id == 19) bestFile = 'bolon_gourmet.webp';
        else if (id == 20) bestFile = 'fila_cero.webp';
        else if (id == 21) bestFile = 'Networking Digital_alquimia_portada.webp';
        else if (id == 22) bestFile = 'el_88_basura.webp';
        else if (id == 23) bestFile = 'captura_datos.webp';
        else if (id == 24) bestFile = 'cierre_ventas.webp';
        else if (id == 10) bestFile = 'IA_Ecuador_Corporate.webp'; // Fallback for 10
        
        if (bestFile) {
            console.log(`📦 ID ${id}: Found ${bestFile}`);
            try {
                const buffer = fs.readFileSync(path.join(imagesDir, bestFile));
                const bunnyName = `${slug}.webp`.replace(/[^a-z0-9.-]/g, '');
                const url = await uploadToBunny(buffer, bunnyName);
                console.log(`   🚀 Uploaded: ${url}`);
                row[thumbIdx] = url;
                updates.push({ id, slug, url });
            } catch (e) { console.error(`   ❌ Error ${id}: ${e.message}`); }
        } else {
             console.warn(`   ⚠️ ID ${id}: NO FILE FOUND`);
        }
    }

    fs.writeFileSync(csvPath, stringifyCSV(rows));
    console.log("\n✨ Strategic CSV Updated Locally with All URLs.");

    console.log("\n🗄️ Attempting final MySQL Batch...");
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 5000
        });

        for (const up of updates) {
            await connection.execute('UPDATE articles SET cover_image = ? WHERE id = ?', [up.url, up.id]);
            process.stdout.write(".");
        }
        console.log("\n🏁 Done.");
    } catch (e) {
        console.error(`\n❌ DB Timeout. The CSV is ready at ${csvPath}.`);
    } finally { if (connection) await connection.end(); }
}

startSync();
