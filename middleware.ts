import { NextRequest, NextResponse } from 'next/server';
import { SPACE_COOKIE, validateSpaceToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques : login, API auth, liste publique des espaces
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/spaces'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SPACE_COOKIE)?.value;
  const spaceId = token ? validateSpaceToken(token) : null;

  if (!spaceId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Injecte le spaceId dans les headers pour les API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-space-id', String(spaceId));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
