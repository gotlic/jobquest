import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json();
  const fields = Object.keys(body).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE cover_letters SET ${fields}, updated_at = datetime('now') WHERE id = @id`).run({ ...body, id });
  return NextResponse.json(db.prepare('SELECT * FROM cover_letters WHERE id = ?').get(id));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM cover_letters WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
