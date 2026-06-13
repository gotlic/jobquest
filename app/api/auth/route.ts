import { NextRequest, NextResponse } from 'next/server';
import { SPACE_COOKIE, createSpaceToken, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';
import type { Space } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { slug, password } = await req.json();
    if (!slug || !password) {
      return NextResponse.json({ error: 'Espace et mot de passe requis' }, { status: 400 });
    }

    const db = await getDb();
    const space = db.prepare('SELECT * FROM spaces WHERE slug = ?').get(slug) as Space | undefined;

    if (!space || space.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Espace ou mot de passe incorrect' }, { status: 401 });
    }

    const token = createSpaceToken(space.id);
    const res = NextResponse.json({ ok: true, space: { id: space.id, name: space.name, slug: space.slug } });
    res.cookies.set(SPACE_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 jours
    });
    return res;
  } catch (e) {
    console.error('[POST /api/auth]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SPACE_COOKIE);
  return res;
}
