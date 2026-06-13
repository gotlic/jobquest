import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Space } from '@/lib/db';

export async function GET(req: NextRequest) {
  const spaceId = parseInt(req.headers.get('x-space-id') ?? '', 10);
  if (!spaceId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const db = await getDb();
    const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(spaceId) as Space | undefined;
    if (!space) return NextResponse.json({ error: 'Espace introuvable' }, { status: 404 });

    return NextResponse.json({
      id: space.id,
      name: space.name,
      slug: space.slug,
      settings: JSON.parse(space.settings || '{}'),
      has_serpapi: !!space.serpapi_key,
      has_ft: !!(space.ft_client_id && space.ft_client_secret),
    });
  } catch (e) {
    console.error('[GET /api/me]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
