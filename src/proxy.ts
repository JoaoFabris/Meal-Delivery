import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET!,
    salt:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
  });

  console.log('[proxy] pathname:', pathname);
  console.log('[proxy] token:', JSON.stringify(token));
  console.log(
    '[proxy] cookies:',
    req.cookies.getAll().map((c) => c.name),
  );

  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedUserRoute =
    pathname.startsWith('/cart') || pathname.startsWith('/profile');
  const isAdminLogin = pathname === '/admin/login';
  const isUserLogin = pathname === '/login';

  if (isAdminLogin) {
    if (token?.isAdmin)
      return NextResponse.redirect(new URL('/admin', req.url));
    return NextResponse.next();
  }

  if (isUserLogin && token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isAdminRoute) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));
    if (!token.isAdmin)
      return NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', req.url),
      );
  }

  if (isProtectedUserRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/cart',
    '/cart/:path*',
    '/profile',
    '/profile/:path*',
    '/login',
  ],
};
