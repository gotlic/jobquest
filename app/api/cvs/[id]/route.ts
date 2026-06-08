import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const cv = db.prepare('SELECT * FROM cvs WHERE id = ?').get(id) as { filename: string } | undefined;
  if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await unlink(path.join(process.cwd(), 'uploads', cv.filename));
  } catch { /* file might not exist */ }

  db.prepare('DELETE FROM cvs WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
