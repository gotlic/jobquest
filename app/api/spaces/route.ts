import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Space } from '@/lib/db';
import { hashPassword, validateSpaceToken, SPACE_COOKIE } from '@/lib/auth';

function getSpaceId(req: NextRequest): number | null {
  const id = parseInt(req.headers.get('x-space-id') ?? '', 10);
  return isNaN(id) || id <= 0 ? null : id;
}

/** GET public : liste des espaces (nom + slug, sans données sensibles) */
export async function GET() {
  try {
    const db = await getDb();
    const spaces = db.prepare('SELECT id, name, slug FROM spaces ORDER BY id').all();
    return NextResponse.json(spaces);
  } catch (e) {
    console.error('[GET /api/spaces]', e);
    return NextResponse.json([], { status: 500 });
  }
}

/** POST : créer un nouvel espace (requiert d'être authentifié) */
export async function POST(req: NextRequest) {
  const spaceId = getSpaceId(req);
  if (!spaceId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const body = await req.json();
    const name = String(body.name ?? '').trim();
    const slug = String(body.slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    const password = String(body.password ?? '');

    if (!name || !slug || !password) {
      return NextResponse.json({ error: 'Nom, slug et mot de passe requis' }, { status: 400 });
    }

    const db = await getDb();
    const existing = db.prepare('SELECT id FROM spaces WHERE slug = ?').get(slug);
    if (existing) return NextResponse.json({ error: 'Cet identifiant est déjà pris' }, { status: 409 });

    const result = db.prepare(
      'INSERT INTO spaces (slug, name, password_hash) VALUES (?, ?, ?)'
    ).run(slug, name, hashPassword(password));

    const space = db.prepare('SELECT id, name, slug FROM spaces WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(space, { status: 201 });
  } catch (e) {
    console.error('[POST /api/spaces]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/** PATCH : mettre à jour les paramètres de l'espace courant */
export async function PATCH(req: NextRequest) {
  const spaceId = getSpaceId(req);
  if (!spaceId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const body = await req.json();
    const db = await getDb();
    const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(spaceId) as Space | undefined;
    if (!space) return NextResponse.json({ error: 'Espace introuvable' }, { status: 404 });

    const updates: Record<string, unknown> = {};

    if ('settings' in body) {
      const current = JSON.parse(space.settings || '{}');
      updates.settings = JSON.stringify({ ...current, ...body.settings });
    }
    if ('serpapi_key' in body) updates.serpapi_key = body.serpapi_key ?? '';
    if ('ft_client_id' in body) updates.ft_client_id = body.ft_client_id ?? '';
    if ('ft_client_secret' in body) updates.ft_client_secret = body.ft_client_secret ?? '';

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 });
    }

    const fields = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
    db.prepare(`UPDATE spaces SET ${fields} WHERE id = @id`).run({ ...updates, id: spaceId });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[PATCH /api/spaces]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/** DELETE : supprimer un espace (requiert le mot de passe de l'espace à supprimer) */
export async function DELETE(req: NextRequest) {
  const currentSpaceId = getSpaceId(req);
  if (!currentSpaceId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  try {
    const body = await req.json();
    const targetId = parseInt(body.id ?? '', 10);
    const password = String(body.password ?? '');

    if (!targetId || !password) {
      return NextResponse.json({ error: 'id et mot de passe requis' }, { status: 400 });
    }

    const db = await getDb();
    const total = (db.prepare('SELECT COUNT(*) as c FROM spaces').get() as { c: number }).c;
    if (total <= 1) {
      return NextResponse.json({ error: 'Impossible de supprimer le dernier espace' }, { status: 400 });
    }

    const target = db.prepare('SELECT * FROM spaces WHERE id = ?').get(targetId) as Space | undefined;
    if (!target) return NextResponse.json({ error: 'Espace introuvable' }, { status: 404 });
    if (target.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
    }

    // Supprimer toutes les données de l'espace
    db.prepare('DELETE FROM jobs WHERE space_id = ?').run(targetId);
    db.prepare('DELETE FROM feed_blocklist WHERE space_id = ?').run(targetId);
    db.prepare('DELETE FROM cvs WHERE space_id = ?').run(targetId);
    db.prepare('DELETE FROM cv_categories WHERE space_id = ?').run(targetId);
    db.prepare('DELETE FROM cover_letters WHERE space_id = ?').run(targetId);
    db.prepare('DELETE FROM spaces WHERE id = ?').run(targetId);

    const res = NextResponse.json({ ok: true });
    // Si l'utilisateur supprime son propre espace, déconnecter
    if (targetId === currentSpaceId) {
      res.cookies.delete(SPACE_COOKIE);
    }
    return res;
  } catch (e) {
    console.error('[DELETE /api/spaces]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
