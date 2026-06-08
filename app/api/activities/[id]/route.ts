import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await getDb();
    db.prepare('DELETE FROM activities WHERE id = ?').run(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[DELETE /api/activities] error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
