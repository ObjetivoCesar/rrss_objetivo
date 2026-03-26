import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const ZONE = process.env.BUNNY_STORAGE_ZONE;
  const KEY = process.env.BUNNY_STORAGE_API_KEY;
  const HOST = process.env.BUNNY_STORAGE_HOST || "br.storage.bunnycdn.com";
  const PULL = process.env.BUNNY_PULLZONE_URL;

  if (!ZONE || !KEY || !PULL) {
    return NextResponse.json({ success: false, error: 'Bunny.net credentials missing' }, { status: 500 });
  }

  try {
    console.log(`[Media/Sync] 🐰 Iniciando sincronización profunda con Bunny.net (${ZONE})...`);
    
    const allFiles: any[] = [];

    // Función recursiva para listar archivos
    async function listRecursive(path = '') {
      const url = `https://${HOST}/${ZONE}/${path}${path ? '/' : ''}`;
      console.log(`[Media/Sync] 📂 Listando: ${url}`);
      
      const resp = await fetch(url, {
        method: "GET",
        headers: { 
          'AccessKey': KEY as string, 
          "Accept": "application/json" 
        } as HeadersInit,
      });

      if (!resp.ok) return;

      const items = await resp.json();
      for (const item of items) {
        const fullPath = path ? `${path}/${item.ObjectName}` : item.ObjectName;
        if (item.IsDirectory) {
          await listRecursive(fullPath);
        } else {
          allFiles.push({ ...item, RelativePath: fullPath });
        }
      }
    }

    await listRecursive('');

    console.log(`[Media/Sync] ✅ Encontrados ${allFiles.length} archivos en total.`);

    if (allFiles.length === 0) {
      return NextResponse.json({ success: true, count: 0, totalFound: 0 });
    }

    // 2. Preparar registros para Supabase
    const assetsToInsert = allFiles.map((f: any) => ({
      filename: f.ObjectName,
      url: `${PULL}/${f.RelativePath}`,
      type: f.ObjectName.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
      category: f.RelativePath.includes('/') ? f.RelativePath.split('/')[0] : 'general',
      size: f.Length,
      metadata: { synced: true, path: f.RelativePath, lastSync: new Date().toISOString() }
    }));

    // 3. Upsert en Supabase
    // Dividir en bloques si son muchos para evitar límites de Supabase
    const chunkSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < assetsToInsert.length; i += chunkSize) {
      const chunk = assetsToInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('media_assets')
        .upsert(chunk, { onConflict: 'url' })
        .select();

      if (error) {
        console.error("[Media/Sync] Error in batch upsert:", error);
        continue;
      }
      insertedCount += data?.length || 0;
    }

    return NextResponse.json({ 
      success: true, 
      count: insertedCount,
      totalFound: allFiles.length
    });

  } catch (error: any) {
    console.error('[Media/Sync] ❌ Error Crítico:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
