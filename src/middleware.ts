import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => { // ✅ Sem tipagem explícita — inferido pelo auth()
  const { pathname } = req.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedUserRoute =
    pathname.startsWith('/cart') || pathname.startsWith('/profile')
  const isAdminLogin = pathname === '/admin/login'
  const isUserLogin = pathname === '/login'

  if (isAdminLogin) {
    if (req.auth?.user?.isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
    return NextResponse.next()
  }

  // ✅ Usuário já logado tentando acessar /login → vai para home
  if (isUserLogin && req.auth) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAdminRoute) {
    if (!req.auth) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    if (!req.auth.user?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url))
    }
  }

  if (isProtectedUserRoute && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url)) // ✅ Redireciona para login de usuário
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/cart/:path*',
    '/profile/:path*',
    '/login',  
  ],
}