import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const activities = db.prepare('SELECT * FROM activities WHERE job_id = ? ORDER BY created_at ASC').all(id);
  return NextResponse.json({ ...job as object, activities });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  const body = await req.json();

  const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // These are handled separately — not real SQL columns
  const NON_COLUMNS = new Set(['note', 'author']);

  const fields = Object.keys(body)
    .filter(k => k !== 'id' && !NON_COLUMNS.has(k))
    .map(k => `${k} = @${k}`)
    .join(', ');

  if (!fields) return NextResponse.json(existing);

  db.prepare(`UPDATE jobs SET ${fields} WHERE id = @id`).run({ ...body, id });

  // Log status changes
  if (body.status && body.status !== existing.status) {
    const statusLabels: Record<string, string> = {
      todo: '📋 À explorer',
      ready: '✏️ À postuler',
      applied: '🚀 Candidature envoyée',
      followup: '📣 Relance effectuée',
      interview: '🤝 Entretien',
      offer: '🎉 Offre reçue',
      rejected: '😔 Refus',
      archived: '📦 Archivé',
    };
    db.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'status', ?, ?)
    `).run(id, `Statut → ${statusLabels[body.status] ?? body.status}`, body.author ?? 'Équipe');
  }

  if (body.note) {
    db.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'note', ?, ?)
    `).run(id, body.note, body.author ?? 'Équipe');
  }

  const updated = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await getDb();
  db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
