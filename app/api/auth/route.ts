import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE, AUTH_TOKEN, APP_PASSWORD } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password !== APP_PASSWORD) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, AUTH_TOKEN, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // 30 jours
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
