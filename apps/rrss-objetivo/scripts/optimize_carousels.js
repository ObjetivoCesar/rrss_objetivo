const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', '..', '..', 'public', 'carruseles');

async function optimizeImages() {
    let optimizedCount = 0;
    let savedBytes = 0;

    // Obtener carpetas: Carrusel 1, Carrusel 2...
    const items = fs.readdirSync(baseDir);
    
    for (const item of items) {
        const itemPath = path.join(baseDir, item);
        if (fs.statSync(itemPath).isDirectory()) {
            console.log(`\nProcesando ${item}...`);
            const images = fs.readdirSync(itemPath);

            for (const img of images) {
                // Solo procesar png, jpg, jpeg (ignorar si ya hicimos webp)
                if (img.match(/\.(png|jpe?g)$/i)) {
                    const imgPath = path.join(itemPath, img);
                    const parsed = path.parse(img);
                    const webpPath = path.join(itemPath, `${parsed.name}.webp`);
                    
                    try {
                        const statsBefore = fs.statSync(imgPath);
                        
                        await sharp(imgPath)
                            .webp({ quality: 80, effort: 6 })
                            .toFile(webpPath);
                            
                        const statsAfter = fs.statSync(webpPath);
                        savedBytes += (statsBefore.size - statsAfter.size);
                        optimizedCount++;
                        
                        console.log(`  - Optimizado: ${img} (${(statsBefore.size/1024/1024).toFixed(2)}MB -> ${(statsAfter.size/1024).toFixed(2)}KB)`);
                        
                        // Eliminar la imagen original
                        fs.unlinkSync(imgPath);
                    } catch (err) {
                        console.error(`  ❌ Error optimizando ${img}: ${err.message}`);
                    }
                }
            }
        }
    }
    
    console.log(`\n🎉 Completado! Imágenes optimizadas: ${optimizedCount}`);
    console.log(`💾 Espacio ahorrado: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
