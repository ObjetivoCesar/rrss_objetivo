import { supabaseAdmin } from './supabase-admin';
import { createHash } from 'crypto';
import { imageOrchestrator } from './ai/image-orchestrator';
import sharp from 'sharp';

const BUCKET = 'posts-assets';

/**
 * Genera un hash determinístico para un prompt y seed.
 */
function getFilenameHash(prompt: string, seed?: number): string {
  const content = `${prompt}${seed || ''}`;
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * Genera una imagen y la sube directamente a Storage.
 * Usa un orquestador que maneja múltiples proveedores (Pixazo, HF, Google) con fallbacks.
 */
export async function generateAndUploadImage(
  prompt: string,
  categoryId: string,
  seed?: number
): Promise<string> {
  const hash = getFilenameHash(prompt, seed);
  const fileName = `ai_${hash}.webp`;

  // 1. Verificar si ya existe en Supabase para ahorrar créditos
  try {
    const { data: files } = await supabaseAdmin.storage.from(BUCKET).list('', {
      search: fileName
    });
    
    if (files && files.length > 0) {
      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
      console.log(`[Storage] ♻️ Reusando imagen existente en Supabase: ${data.publicUrl}`);
      return data.publicUrl;
    }
  } catch (e) {
    console.warn("[Storage] Error verificando existencia, procediendo a generar:", e);
  }

  // 2. Generar imagen usando el orquestador (maneja fallbacks automáticamente)
  const { buffer, provider } = await imageOrchestrator.generateImage(prompt, { 
    categoryId, 
    seed 
  });
  
  // 3. Optimizar imagen con Sharp antes de subir
  console.log(`[Storage] ⚡ Optimizando imagen de ${provider} (${buffer.length} bytes)...`);
  const optimizedBuffer = await sharp(buffer)
    .webp({ quality: 80 })
    .toBuffer();
  
  console.log(`[Storage] ✅ Imagen optimizada: ${optimizedBuffer.length} bytes (Reducción: ${Math.round((1 - optimizedBuffer.length / buffer.length) * 100)}%)`);

  // 4. Subir imagen generada
  if (categoryId === "blog") {
    return await uploadToBunny(optimizedBuffer, fileName);
  } else {
    return await uploadToSupabase(optimizedBuffer, fileName);
  }
}

/**
 * Sube un Buffer a Supabase Storage (Bucket: posts-assets).
 */
export async function uploadToSupabase(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  console.log(
    `[Storage] ☁️  Subiendo a Supabase (${BUCKET}): ${fileName} (${buffer.length} bytes)`
  );

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(fileName, buffer as any, {
      contentType: "image/webp",
      upsert: true,
    });

  if (error) {
    console.error("[Storage] ❌ Error en Supabase Upload:", JSON.stringify(error));
    throw new Error(`Supabase Upload Error: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(fileName);
  console.log(`[Storage] ✅ URL pública Supabase: ${data.publicUrl}`);
  return data.publicUrl;
}

/**
 * Sube un Buffer a Bunny.net Storage (artículos de blog — almacenamiento permanente).
 */
export async function uploadToBunny(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ZONE = process.env.BUNNY_STORAGE_ZONE;
  const KEY = process.env.BUNNY_STORAGE_API_KEY;
  const HOST = process.env.BUNNY_STORAGE_HOST || "br.storage.bunnycdn.com";
  const PULL = process.env.BUNNY_PULLZONE_URL;

  if (!ZONE || !KEY || !PULL) {
    console.warn("[Storage] ⚠️ Bunny.net no configurado. Usando Supabase como respaldo.");
    return await uploadToSupabase(buffer, fileName);
  }

  console.log(`[Storage] 🐰 Subiendo a Bunny.net: ${fileName}`);

  try {
    const resp = await fetch(`https://${HOST}/${ZONE}/${fileName}`, {
      method: "PUT",
      headers: { AccessKey: KEY, "Content-Type": "image/webp" },
      body: buffer as any,
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`[Storage] ❌ Bunny.net falló (${resp.status}): ${text}. Usando Supabase como respaldo.`);
      return await uploadToSupabase(buffer, fileName);
    }

    const bunnyUrl = `${PULL}/${fileName}`;
    console.log(`[Storage] ✅ URL Bunny.net: ${bunnyUrl}`);
    return bunnyUrl;
  } catch (err: any) {
    console.error(`[Storage] ❌ Error de red en Bunny.net: ${err.message}. Usando Supabase.`);
    return await uploadToSupabase(buffer, fileName);
  }
}

/**
 * Elimina un archivo del bucket de Supabase Storage.
 */
export async function deleteFromSupabase(fileName: string): Promise<boolean> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([fileName]);

  if (error) {
    console.error("[Storage] ❌ Error eliminando de Supabase:", error.message);
    return false;
  }
  console.log(`[Storage] 🗑️ Eliminado de Supabase: ${fileName}`);
  return true;
}

/**
 * Realiza URLs de proxy a URLs permanentes.
 */
export async function realizeMediaUrls(
  urls: string[],
  categoryId: string
): Promise<string[]> {
  if (!urls || !Array.isArray(urls)) return [];

  const realized: string[] = [];

  for (const url of urls) {
    const isProxy = url.includes('/api/ai/image-proxy');
    
    if (isProxy) {
      try {
        console.log(`[Storage] 🔗 Realizando imagen desde proxy: ${url.substring(0, 80)}...`);
        
        const urlObj = new URL(url, 'https://objetivo.ai'); 
        const prompt = urlObj.searchParams.get('prompt');
        const seedStr = urlObj.searchParams.get('seed');
        const seed = seedStr ? parseInt(seedStr) : undefined;

        if (prompt) {
          const permanentUrl = await generateAndUploadImage(prompt, categoryId, seed);
          realized.push(permanentUrl);
        } else {
          realized.push(url);
        }
      } catch (err: any) {
        console.error(`[Storage] ❌ Error realizando imagen desde proxy:`, err.message);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rrss.objetivo.ai";
        const absoluteUrl = url.startsWith('http') ? url : `${appUrl}${url}`;
        realized.push(absoluteUrl);
      }
    } else {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://rrss.objetivo.ai";
      const validUrl = url.startsWith('/') ? `${appUrl}${url}` : url;
      realized.push(validUrl);
    }
  }

  return realized;
}
