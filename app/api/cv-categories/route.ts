import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const DEFAULT_CATEGORIES = [
  { name: 'Amélioration Continue', color: 'blue', icon: '⚙️' },
  { name: 'Industrie', color: 'orange', icon: '🏭' },
  { name: 'Conception Produit', color: 'violet', icon: '🎨' },
  { name: 'Gestion de Projet', color: 'green', icon: '📊' },
  { name: 'Supply Chain', color: 'amber', icon: '🔗' },
  { name: 'Qualité', color: 'red', icon: '✅' },
];

export async function GET() {
  const db = getDb();

  // Seed default categories if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM cv_categories').get() as { c: number }).c;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO cv_categories (name, color, icon) VALUES (@name, @color, @icon)');
    DEFAULT_CATEGORIES.forEach(c => insert.run(c));
  }

  const categories = db.prepare('SELECT * FROM cv_categories ORDER BY id').all();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const result = db.prepare(
    'INSERT INTO cv_categories (name, color, icon) VALUES (@name, @color, @icon)'
  ).run({ name: body.name, color: body.color ?? 'violet', icon: body.icon ?? '📄' });
  return NextResponse.json(db.prepare('SELECT * FROM cv_categories WHERE id = ?').get(result.lastInsertRowid), { status: 201 });
}
