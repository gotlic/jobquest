import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

function spaceId(req: NextRequest): number {
  return parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
}

export async function GET(req: NextRequest) {
  const db = await getDb();
  const sid = spaceId(req);
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');
  const cvs = categoryId
    ? db.prepare('SELECT * FROM cvs WHERE category_id = ? AND space_id = ? ORDER BY is_default DESC, created_at DESC').all(categoryId, sid)
    : db.prepare('SELECT * FROM cvs WHERE space_id = ? ORDER BY category_id, is_default DESC, created_at DESC').all(sid);
  return NextResponse.json(cvs);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const sid = spaceId(req);
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const categoryId = formData.get('category_id') as string;
  const version = formData.get('version') as string || 'v1';
  const notes = formData.get('notes') as string || '';
  const isDefault = formData.get('is_default') === 'true';

  if (!file || !categoryId) {
    return NextResponse.json({ error: 'Fichier et catégorie requis' }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `cv_${sid}_${Date.now()}${ext}`;
  const filepath = path.join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  if (isDefault) {
    db.prepare('UPDATE cvs SET is_default = 0 WHERE category_id = ? AND space_id = ?').run(categoryId, sid);
  }

  const result = db.prepare(`
    INSERT INTO cvs (space_id, category_id, filename, original_name, version, notes, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sid, parseInt(categoryId), filename, file.name, version, notes, isDefault ? 1 : 0);

  return NextResponse.json(db.prepare('SELECT * FROM cvs WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
}
