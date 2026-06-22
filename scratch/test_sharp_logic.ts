import { processImageFromUrl } from '../apps/rrss-objetivo/src/lib/image-utils';
import fs from 'fs';
import path from 'path';

async function testSharp() {
  console.log("🧪 Probando lógica de Sharp...");
  const testImage = "https://static.vecteezy.com/system/resources/thumbnails/007/951/005/small/globe-glass-on-grass-with-sunshine-environment-concept-free-photo.jpg";
  
  try {
    console.log("📥 Descargando y procesando imagen...");
    const buffer = await processImageFromUrl(testImage, '1:1');
    
    const outputPath = path.resolve(__dirname, 'test_result_1-1.jpg');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Imagen procesada guardada en: ${outputPath}`);
    console.log(`📏 Tamaño: ${buffer.length} bytes`);
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

testSharp();
