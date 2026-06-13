import { NextRequest, NextResponse } from 'next/server';

export const SPACE_COOKIE = 'jq_space';
const TOKEN_SECRET = process.env.TOKEN_SECRET ?? 'jq_tok_s3cr3t_d3f4ult_k3y_2024';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/** Valide le token HMAC-SHA256 via Web Crypto (compatible Edge Runtime) */
async function validateToken(token: string): Promise<number | null> {
  try {
    const dot = token.indexOf('.');
    if (dot === -1) return null;
    const payload = token.substring(0, dot);
    const sig = token.substring(dot + 1);
    if (sig.length !== 64) return null; // HMAC-SHA256 = 32 octets = 64 hex

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(TOKEN_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = hexToBytes(sig);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, enc.encode(payload));
    if (!valid) return null;

    const id = parseInt(payload, 10);
    return isNaN(id) || id <= 0 ? null : id;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Routes publiques
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/api/spaces'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SPACE_COOKIE)?.value;
  const spaceId = token ? await validateToken(token) : null;

  if (!spaceId) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Injecte le spaceId pour les API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-space-id', String(spaceId));
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
