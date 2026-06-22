import * as dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL!;
const MAKE_WEBHOOK_SECRET = process.env.MAKE_WEBHOOK_SECRET!;

async function testV2Payload() {
  const imageUrl = "https://bibliasholman.lifeway.com/wp-content/uploads/2023/08/QUE-ES-EL-TERMINO-IMAGEN-DE-DIOS-scaled.jpg";
  const postId = `test_v2_${Date.now()}`;

  const mediaUrls = [
    {
      media_type: 'IMAGE',
      url: imageUrl,
      image_url: imageUrl,
      video_url: null,
      type: 'image',
      is_link: false,
      is_image: true,
      is_video: false
    }
  ];

  const payload = {
    api_secret: MAKE_WEBHOOK_SECRET,
    post_id: postId,
    version: "v2-media-link-fixed-101", 
    text: "🚀 Prueba de Restauración Payload V2 - Inmediata",
    media_url: imageUrl,
    media_urls: mediaUrls,
    photo_urls: [imageUrl],
    video_urls: [],
    facebook_photos: [
      { 
        url: imageUrl, 
        source: imageUrl, 
        type: 'Photo',
        media_type: 'Photo'
      }
    ],
    post_media_category: 'image',
    platforms: ["facebook", "instagram"],
    metadata: {
      youtube_title: 'Prueba V2',
      youtube_description: 'Prueba de restauración',
      linkedin_title: '',
      tiktok_privacy: 'public_to_everyone',
      tiktok_disable_comment: false,
      tiktok_disable_duet: false,
    },
  };

  console.log('📤 Enviando payload V2 a Make.com...');
  console.log('Webhook URL:', MAKE_WEBHOOK_URL);
  
  try {
    const response = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      console.log('✅ ÉXITO: Make.com recibió el payload correctamente.');
      const result = await response.text();
      console.log('Respuesta de Make:', result);
    } else {
      console.error('❌ ERROR: Make.com respondió con error.', response.status);
      console.error(await response.text());
    }
  } catch (error) {
    console.error('❌ ERROR de red:', error);
  }
}

testV2Payload();
