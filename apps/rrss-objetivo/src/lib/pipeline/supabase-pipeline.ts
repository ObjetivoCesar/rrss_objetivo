import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con SERVICE_ROLE_KEY para operaciones admin (sin RLS).
 * NUNCA usar en código accesible desde el cliente.
 * 
 * Este adapter centraliza la conexión para el módulo de pipeline.
 */
export function getSupabaseServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    return createClient(supabaseUrl, supabaseServiceKey)
}
