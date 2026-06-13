import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function spaceId(req: NextRequest): number {
  return parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catId = parseInt(id, 10);
  if (!catId) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const db = await getDb();
  const sid = spaceId(req);

  const cat = db.prepare('SELECT id FROM cv_categories WHERE id = ? AND space_id = ?').get(catId, sid);
  if (!cat) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  // CVs supprimés en cascade (ON DELETE CASCADE)
  // Lettres de motivation : category_id → NULL (ON DELETE SET NULL)
  db.prepare('DELETE FROM cv_categories WHERE id = ? AND space_id = ?').run(catId, sid);

  return NextResponse.json({ ok: true });
}
