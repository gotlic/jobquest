import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

/** Normalise pour comparaison : minuscules, sans accents, alphanumérique seul */
function normKey(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = db.prepare('SELECT * FROM feed_blocklist ORDER BY created_at DESC').all();
    return NextResponse.json(rows);
  } catch (e) {
    console.error('[blocklist GET]', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kind = body?.kind;
    const label = String(body?.label ?? '').trim();
    if ((kind !== 'company' && kind !== 'offer') || !label) {
      return NextResponse.json({ error: 'kind (company|offer) et label requis' }, { status: 400 });
    }
    const value = normKey(String(body?.value ?? label));
    if (!value) return NextResponse.json({ error: 'Valeur vide' }, { status: 400 });

    const db = await getDb();
    db.prepare('INSERT OR IGNORE INTO feed_blocklist (kind, value, label) VALUES (?, ?, ?)').run(kind, value, label);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[blocklist POST]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });
    const db = await getDb();
    db.prepare('DELETE FROM feed_blocklist WHERE id = ?').run(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[blocklist DELETE]', e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
