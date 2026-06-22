import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'posts-assets';

async function rehostImage(url: string, fileName: string) {
  console.log(`fetching ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  const buffer = await response.buffer();

  console.log(`uploading ${fileName} to supabase...`);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return publicUrl;
}

async function main() {
  try {
    const heroUrl = await rehostImage(
      'https://scontent.floh2-1.fna.fbcdn.net/v/t39.30808-6/475317197_1133228325478817_1902977780924779584_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=2a1932&_nc_ohc=KvhW6b_FdKIQ7kNvwHqP4CE&_nc_oc=Adqp1OmVxp64tuJrNmH6W0siCwh0ekxWiYF2Q4FShWMgTVlkmhazSiDQ0BwQmFftk7Q&_nc_zt=23&_nc_ht=scontent.floh2-1.fna&_nc_gid=nijAL_2cajTWuOtzrqHsTw&_nc_ss=7a3a8&oh=00_AfyL7B4nHHMOeemnU0R83dSITKojP7XYTtL35y62cGiLAA&oe=69D1C2FF',
      'hero-clinica-abendano.jpg'
    );
    console.log('Hero URL:', heroUrl);

    const logoUrl = await rehostImage(
      'https://scontent.floh2-1.fna.fbcdn.net/v/t39.30808-6/305299086_484343100367346_8707967997158039982_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=KRnF3SQaP5QQ7kNvwGI9nlB&_nc_oc=AdpLaOWQx_f75ACkvkhEtwNzNNVRuXathTlrxkj6BnBQxyFpvvKECOChXu0J6Ulm1H8&_nc_zt=23&_nc_ht=scontent.floh2-1.fna&_nc_gid=_3dxFDZAH1XFAxj5ck47iQ&_nc_ss=7a3a8&oh=00_Afz8hNanCeZRzLa3y6VMwSgHaOki-e8RRxY-Ykf7UUcR7Q&oe=69D1A690',
      'logo-clinica-abendano.jpg'
    );
    console.log('Logo URL:', logoUrl);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
