import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Rutas de API que son públicas (webhooks de Make.com, callbacks de auth, etc.)
const PUBLIC_API_ROUTES = [
  '/api/qstash',
  '/api/auth',
  '/api/cron',
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set({ name, value, ...options })
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and getUser. A simple mistake could make it very hard to debug issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  if (!user) {
    // Rutas de login y auth → siempre públicas
    if (pathname.startsWith('/login') || pathname.startsWith('/auth')) {
      return supabaseResponse
    }

    // Rutas de API públicas (webhooks externos, cron, etc.)
    const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))
    if (isPublicApi) {
      return supabaseResponse
    }

    // Rutas de API privadas → retornar 401 JSON (no redirect)
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'No autorizado. Sesión requerida.' },
        { status: 401 }
      )
    }

    // Páginas protegidas → redirigir al login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy the cookies from supabaseResponse, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
  // 4. Finally, return myNewResponse, otherwise causes issues with the cookies!

  return supabaseResponse
}
