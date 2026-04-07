import { NextResponse } from 'next/server';

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const { platform, type } = await req.json();

    if (!MAKE_WEBHOOK_URL || !MAKE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Faltan credenciales de Make.com en el servidor' }, { status: 500 });
    }

    const testAssets = {
      image: "https://cesarweb.b-cdn.net/ia-ecuador-casos-reales.webp",
      logo: "https://cesarweb.b-cdn.net/logo-rbe-objetivo-rrss.webp",
      video: "https://cesarweb.b-cdn.net/clientes.mp4"
    };

    let payload: any = {
      api_secret: MAKE_WEBHOOK_SECRET,
      post_id: `test_${platform}_${type}_${Date.now()}`,
      version: "v2-marketing-hub-test",
      text: `Test de ${type} en ${platform} — Enviado desde el Centro de Control de Marketing`,
      platforms: [platform],
    };

    // Configure payload based on type
    if (type === 'image') {
      payload.media_url = testAssets.image;
      payload.media_urls = [testAssets.image];
      payload.post_media_category = 'image';
    } else if (type === 'carousel') {
      payload.media_url = testAssets.image;
      payload.media_urls = [testAssets.image, testAssets.logo];
      payload.post_media_category = 'carousel';
    } else if (type === 'video') {
      payload.media_url = testAssets.video;
      payload.media_urls = [{
        media_type: 'VIDEO',
        url: testAssets.video,
        type: 'video',
        video_url: testAssets.video
      }];
      payload.video_url = testAssets.video;
      payload.post_media_category = 'video';
    } else if (type === 'text') {
      payload.post_media_category = 'image'; // Standard for text-only in some Make scenarios
    }

    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.text();

    if (response.ok) {
      return NextResponse.json({ message: 'Prueba enviada con éxito', details: result });
    } else {
      return NextResponse.json({ error: `Error en Make.com: ${result}` }, { status: response.status });
    }

  } catch (error: any) {
    console.error('Error en API de prueba de marketing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
