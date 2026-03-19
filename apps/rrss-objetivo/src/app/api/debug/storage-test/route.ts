import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Endpoint de diagnóstico: prueba completamente el flujo de Storage.
 * GET /api/debug/storage-test
 */
export async function GET() {
  const log: string[] = [];
  
  try {
    // 1. Verificar credenciales
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hfToken = process.env.HUGGINGFACE_ACCESS_TOKEN;
    log.push(`[1] Supabase URL: ${supabaseUrl ? "OK (" + supabaseUrl.substring(0, 25) + "...)" : "MISSING!"}`);
    log.push(`[1] HF Token: ${hfToken ? "OK" : "MISSING!"}`);

    // 2. Listar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) {
      log.push(`[2] Error listando buckets: ${bucketsError.message}`);
    } else {
      log.push(`[2] Buckets disponibles: ${buckets.map(b => b.name + (b.public ? "(público)" : "(privado)")).join(", ")}`);
    }

    // 3. Intentar subir un archivo de prueba pequeño al bucket correcto
    const testBuffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"); // 1x1 pixel PNG
    const testFileName = `test-${Date.now()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('posts-assets')   // ← BUCKET CORRECTO
      .upload(testFileName, testBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      log.push(`[3] ERROR SUBIENDO IMAGEN: ${uploadError.message}`);
      log.push(`[3] Causa posible: Verificar que el bucket 'posts-assets' tiene acceso público.`);
    } else {
      log.push(`[3] ✅ Subida exitosa a 'posts-assets'! Path: ${uploadData.path}`);
      
      // 4. Verificar URL pública
      const { data: urlData } = supabaseAdmin.storage.from('posts-assets').getPublicUrl(testFileName);
      log.push(`[4] ✅ URL Pública: ${urlData.publicUrl}`);
      
      // 5. Limpiar archivo de prueba
      await supabaseAdmin.storage.from('posts-assets').remove([testFileName]);
      log.push(`[5] Archivo de prueba eliminado`);
    }

    // 6. Probar conexión con Hugging Face
    if (hfToken) {
      log.push(`[6] Probando conexión HF...`);
      const hfResp = await fetch('https://huggingface.co/api/whoami', {
        headers: { Authorization: `Bearer ${hfToken}` }
      });
      const hfData = await hfResp.json();
      if (hfResp.ok) {
        log.push(`[6] HF OK: Usuario ${hfData.name}, plan ${hfData.orgs?.length > 0 ? 'org' : 'personal'}`);
      } else {
        log.push(`[6] HF ERROR: ${JSON.stringify(hfData)}`);
      }
    }

  } catch (err: any) {
    log.push(`[ERROR CRÍTICO]: ${err.message}`);
  }

  return NextResponse.json({ log }, { status: 200 });
}
