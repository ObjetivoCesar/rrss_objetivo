import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const payload = {
    api_secret: process.env.MAKE_WEBHOOK_SECRET,
    post_id: "de28e56c-aa03-41f2-90d6-f3042b95df44",
    version: "v2-media-link-fixed-101",
    text: "Testing the flow",
    media_url: "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.8099409466553767.webp",
    media_urls: [
      { media_type: 'IMAGE', url: "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.8099409466553767.webp" },
      { media_type: 'IMAGE', url: "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.8481221219366432.webp" },
      { media_type: 'IMAGE', url: "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.3529509825944208.webp" }
    ],
    photo_urls: [
      "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.8099409466553767.webp",
      "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.8481221219366432.webp",
      "https://fcfsexddgupnvbvntgyz.supabase.co/storage/v1/object/public/posts-assets/0.3529509825944208.webp"
    ],
    video_urls: [],
    facebook_photos: [],
    post_media_category: 'carousel',
    platforms: ['facebook', 'instagram']
  };

  console.log("Sending payload...");
  const res = await fetch(process.env.MAKE_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
main();
