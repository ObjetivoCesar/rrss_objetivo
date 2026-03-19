import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Usamos SERVICE_ROLE para que el motor pueda saltarse RLS y actualizar estados
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
