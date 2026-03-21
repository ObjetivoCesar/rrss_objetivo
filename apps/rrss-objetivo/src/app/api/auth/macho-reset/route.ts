import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { logger } from '@/lib/logger';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const email = searchParams.get('email');
  const password = searchParams.get('password');

  // Segunda capa de seguridad: Solo funciona con el secreto 'MACHO'
  if (secret !== 'MACHO') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan email o password' }, { status: 400 });
  }

  try {
    logger.info('Resetting user password (MACHO MODE)', { email });

    // 1. Buscamos al usuario por email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) throw listError;

    const user = users.find(u => u.email === email);

    if (!user) {
      // Si no existe, lo creamos
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      if (createError) throw createError;
      return NextResponse.json({ status: 'success', message: `Usuario ${email} CREADO con la nueva contraseña.` });
    }

    // 2. Si existe, actualizamos su contraseña
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateError) throw updateError;

    return NextResponse.json({ status: 'success', message: `Contraseña de ${email} ACTUALIZADA correctamente.` });

  } catch (err: any) {
    logger.error('Macho Reset Error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
