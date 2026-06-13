import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function spaceId(req: NextRequest): number {
  return parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
}

const DEFAULT_CATEGORIES = [
  { name: 'Amélioration Continue', color: 'blue', icon: '⚙️' },
  { name: 'Industrie', color: 'orange', icon: '🏭' },
  { name: 'Conception Produit', color: 'violet', icon: '🎨' },
  { name: 'Gestion de Projet', color: 'green', icon: '📊' },
  { name: 'Supply Chain', color: 'amber', icon: '🔗' },
  { name: 'Qualité', color: 'red', icon: '✅' },
];

export async function GET(req: NextRequest) {
  const db = await getDb();
  const sid = spaceId(req);

  // Seed default categories for this space if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM cv_categories WHERE space_id = ?').get(sid) as { c: number }).c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, @name, @color, @icon)');
    DEFAULT_CATEGORIES.forEach(c => {
      db.prepare('INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, ?, ?, ?)').run(sid, c.name, c.color, c.icon);
    });
    // Suppress unused variable warning
    void insert;
  }

  const categories = db.prepare('SELECT * FROM cv_categories WHERE space_id = ? ORDER BY id').all(sid);
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const sid = spaceId(req);
  const result = db.prepare(
    'INSERT INTO cv_categories (space_id, name, color, icon) VALUES (?, ?, ?, ?)'
  ).run(sid, body.name, body.color ?? 'violet', body.icon ?? '📄');
  return NextResponse.json(db.prepare('SELECT * FROM cv_categories WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
}
