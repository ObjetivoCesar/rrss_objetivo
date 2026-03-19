require('dotenv').config({ path: 'c:\\Users\\Cesar\\Documents\\GRUPO EMPRESARIAL REYES\\PROYECTOS\\RRSS_objetivo\\apps\\rrss-objetivo\\.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixDB() {
  try {
    // 1. Delete test article
    console.log('Deleting Test Article Debug...');
    const { data: delData, error: delError } = await supabase
      .from('articles')
      .delete()
      .match({ slug: 'test-article-debug' });
    
    if (delError) console.error('Delete error:', delError);
    else console.log('Deleted successfully.');

    // 2. Fix broken slug
    // Let's find the broken slug first
    console.log('\nFinding broken article...');
    const { data: searchData, error: searchErr } = await supabase
      .from('articles')
      .select('id, title, slug')
      .ilike('title', 'Contactos Digitales%');
    
    if (searchErr) console.error('Search error:', searchErr);
    else if (searchData && searchData.length > 0) {
       console.log('Found:', searchData[0]);
       
       const cleanSlug = searchData[0].slug.replace(/:/g, ''); // the actual problem
       // But wait, what if the slug in Supabase is already URL-encoded or has other issues? Let's just create a completely clean slug from title.
       let newSlug = searchData[0].title
         .toLowerCase()
         .replace(/:/g, '')
         .replace(/[?!¿¡]/g, '')
         .replace(/[\s_]+/g, '-')
         .replace(/[áäâà]/g, 'a')
         .replace(/[éëêè]/g, 'e')
         .replace(/[íïîì]/g, 'i')
         .replace(/[óöôò]/g, 'o')
         .replace(/[úüûù]/g, 'u')
         .replace(/ñ/g, 'n')
         .replace(/[^a-z0-9-]/g, '')
         .replace(/-+/g, '-')
         .replace(/(^-|-$)/g, '');

       console.log(`Updating slug to: ${newSlug}`);
       
       const { data: upData, error: upErr } = await supabase
         .from('articles')
         .update({ slug: newSlug })
         .eq('id', searchData[0].id);
         
       if (upErr) console.error('Update error:', upErr);
       else console.log('Updated successfully.');
    } else {
       console.log('Broken article not found.');
    }

  } catch(e) {
    console.error(e);
  }
}
fixDB();
