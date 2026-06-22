import { NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { MetaApiClient, getSocialAccount } from '@/lib/meta-api/client';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

async function logDebug(message: string, severity: 'info' | 'error' | 'warn' = 'info') {
  if (severity === 'error') logger.error(message);
  else if (severity === 'warn') logger.warn(message);
  else logger.info(message);
}

/**
 * Webhook de QStash para publicar Reels de Instagram una vez procesados.
 * 
 * Flujo:
 * 1. El scheduler sube el video a Meta y obtiene el `container_id`.
 * 2. El scheduler encola este endpoint en QStash con 60s de delay.
 * 3. QStash llama a este endpoint.
 * 4. Verificamos el status_code del contenedor en Meta.
 * 5. Si está FINISHED, publicamos.
 * 6. Si está IN_PROGRESS, re-encolamos para 30s más.
 * 7. Actualizamos Supabase.
 */

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { containerId, igUserId, brandName, sourcePostId, attempt = 1 } = body;

    if (!containerId || !igUserId || !brandName) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    await logDebug(`[QStash] Verificando contenedor ${containerId} (Intento ${attempt})`);

    // 1. Obtener credenciales
    const account = await getSocialAccount(brandName, 'instagram');
    const client = new MetaApiClient(account.access_token);

    // 2. Verificar estado en Meta
    const statusRes = await client.get(`/${containerId}`, { fields: 'status_code,status' });
    const statusCode = (statusRes as any).status_code;

    await logDebug(`[QStash] Estado de ${containerId}: ${statusCode}`);

    if (statusCode === 'FINISHED') {
      // 3. ¡Publicar!
      const publishRes = await client.post(`/${igUserId}/media_publish`, { creation_id: containerId });
      
      await logDebug(`[QStash] ✅ Reel publicado con éxito: ${publishRes.id}`);
      
      // Actualizar Supabase si tenemos el postId original
      if (sourcePostId) {
        await supabaseAdmin
          .from('social_posts')
          .update({ 
            status: 'published',
            updated_at: new Date().toISOString(),
            error_log: null
          })
          .eq('id', sourcePostId);
      }
      
      return NextResponse.json({ success: true, postId: publishRes.id });
    } 
    
    if (statusCode === 'IN_PROGRESS' || statusCode === 'PUBLISHED' /* a veces pasa */) {
      if (attempt >= 10) {
        await logDebug(`[QStash] ❌ Timeout: El contenedor ${containerId} lleva demasiado tiempo procesándose.`);
        return NextResponse.json({ error: 'Timeout' }, { status: 500 });
      }

      // Re-encolar con QStash para dentro de 30 segundos
      const qstashToken = process.env.QSTASH_TOKEN;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      
      if (qstashToken && appUrl) {
        await fetch(`https://qstash.upstash.io/v2/publish/${appUrl}/api/qstash/instagram`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${qstashToken}`,
            'Content-Type': 'application/json',
            'Upstash-Delay': '30s'
          },
          body: JSON.stringify({
            containerId,
            igUserId,
            brandName,
            sourcePostId,
            attempt: attempt + 1
          })
        });
        await logDebug(`[QStash] 🔄 Re-encolado contenedor ${containerId} para dentro de 30s`);
        return NextResponse.json({ success: true, message: 'Re-encolado' });
      }
    }

    // Si hay error o expiró
    await logDebug(`[QStash] ❌ Contenedor ${containerId} falló en Meta con estado: ${statusCode}`);
    return NextResponse.json({ error: `Estado inválido: ${statusCode}` }, { status: 400 });

  } catch (error: any) {
    await logDebug(`[QStash] 💥 Error no controlado: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Proteger el endpoint con la firma criptográfica de QStash (solo QStash puede llamarlo)
// Descomentar cuando QSTASH_CURRENT_SIGNING_KEY y QSTASH_NEXT_SIGNING_KEY estén en .env
// export const POST = verifySignatureAppRouter(handler);

export const POST = handler;
