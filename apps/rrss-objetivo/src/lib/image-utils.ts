import sharp from 'sharp';
import fetch from 'node-fetch';

/**
 * Procesa una imagen para que cumpla con los requisitos de Instagram (1:1 o 4:5)
 * utilizando un fondo difuminado (blurred background) para rellenar los espacios.
 */
export async function processInstagramImage(
  buffer: Buffer,
  format: '1:1' | '4:5'
): Promise<Buffer> {
  const targetWidth = 1080;
  const targetHeight = format === '1:1' ? 1080 : 1350;

  console.log(`[ImageUtils] 🎨 Aplicando formato ${format} (${targetWidth}x${targetHeight})...`);

  // 1. Crear el fondo difuminado (cover para llenar todo el espacio)
  const background = await sharp(buffer)
    .resize(targetWidth, targetHeight, {
      fit: 'cover',
    })
    .blur(50) // Desenfoque más fuerte para elegancia
    .modulate({ brightness: 0.7 }) // Más oscuro para contraste
    .toBuffer();

  // 2. Redimensionar la imagen original para que quepa (contain)
  // IMPORTANTE: Mantener transparencia para la composición
  const foreground = await sharp(buffer)
    .resize(targetWidth, targetHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 } 
    })
    .png() // Asegurar canal alfa
    .toBuffer();

  // 3. Componer: Frente sobre Fondo
  return await sharp(background)
    .composite([{ input: foreground, gravity: 'center' }])
    .jpeg({ quality: 95, mozjpeg: true })
    .toBuffer();
}

/**
 * Descarga una imagen desde una URL y la procesa.
 */
export async function processImageFromUrl(
  url: string,
  format: '1:1' | '4:5'
): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Fallo al descargar imagen: ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return await processInstagramImage(buffer, format);
}
