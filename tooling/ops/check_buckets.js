const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcfsexddgupnvbvntgyz.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZnNleGRkZ3VwbnZidm50Z3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTc5MDksImV4cCI6MjA3NjczMzkwOX0.lPj2Q984Mc62ZqEEWyVNZxMHNzpX_DeknFjSgVFGSb4';

const supabase = createClient(supabaseUrl, supabaseKey);

const imagesFolder = "C:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\rrss-objetivo\\public\\images\\blog";

async function uploadImages() {
  const files = fs.readdirSync(imagesFolder);
  
  for (const file of files) {
    const filePath = path.join(imagesFolder, file);
    const content = fs.readFileSync(filePath);
    
    // Attempt to upload to a bucket named 'blog-images' or 'public'
    // Let's first try to list buckets to see what exists
    const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
    if (bucketsErr) console.error("Could not list buckets", bucketsErr);
    else console.log("Buckets:", buckets.map(b => b.name));

    // For now, let's just create a 'blog-images' bucket if it doesn't exist, though it must ideally be public.
    // Or we just output the bucket info to decide next steps.
    break;
  }
}

uploadImages();
