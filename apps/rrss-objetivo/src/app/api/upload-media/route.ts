import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Required for streaming large files

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'donna-chat';

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
    }

    // Configuración de Bunny.net desde variables de entorno
    const STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE;
    const API_KEY = process.env.BUNNY_STORAGE_API_KEY;
    const HOST = process.env.BUNNY_STORAGE_HOST || 'br.storage.bunnycdn.com';

    if (!STORAGE_ZONE || !API_KEY) {
      console.error('[Bunny Proxy] Error: Configuración faltante');
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
    }

    // Ruta final en Bunny: STORAGE_ZONE / folder / timestamp-filename
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const bunnyPath = `${folder}/${Date.now()}-${cleanFileName}`;
    const url = `https://${HOST}/${STORAGE_ZONE}/${bunnyPath}`;

    console.log(`[Bunny Proxy] Subiendo a: ${url}`);

    // Leer el archivo como Buffer/Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Bunny Proxy] Error de Bunny:', errorText);
      throw new Error(`Error en el almacenamiento central: ${response.statusText}`);
    }

    // URL pública final (usando el Pull Zone)
    const PULLZONE_URL = process.env.BUNNY_PULLZONE_URL;
    if (!PULLZONE_URL) {
      throw new Error('Falta BUNNY_PULLZONE_URL en el servidor');
    }

    const publicUrl = `${PULLZONE_URL.replace(/\/$/, '')}/${bunnyPath}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName: cleanFileName 
    });

  } catch (error: any) {
    console.error('[Bunny Proxy] Crítico:', error);
    return NextResponse.json({ 
      error: error.message || 'Error interno del servidor' 
    }, { status: 500 });
  }
}
