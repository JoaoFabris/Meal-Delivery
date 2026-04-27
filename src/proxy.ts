import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  const isAdminRoute = pathname.startsWith('/admin')
  const isProtectedUserRoute =
    pathname.startsWith('/cart') || pathname.startsWith('/profile')
  const isAdminLogin = pathname === '/admin/login'
  const isUserLogin = pathname === '/login'

  if (isAdminLogin) {
    if (token?.isAdmin) return NextResponse.redirect(new URL('/admin', req.url))
    return NextResponse.next()
  }

  if (isUserLogin && token) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAdminRoute) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    if (!token.isAdmin) return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url))
  }

  if (isProtectedUserRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/cart/:path*',
    '/profile/:path*',
    '/login',
  ],
}