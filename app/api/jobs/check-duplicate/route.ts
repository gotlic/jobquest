import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isDuplicate, type JobLike } from '@/lib/duplicate';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();
    const sid = parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;

    const candidate: JobLike = {
      title: body.title ?? '',
      company: body.company ?? '',
      location: body.location,
      url: body.url,
    };

    const existing = db.prepare('SELECT * FROM jobs WHERE status != ? AND space_id = ?').all('archived', sid);
    const safeExisting = existing.map(j => ({
      title: (j.title as string) ?? '',
      company: (j.company as string) ?? '',
      location: j.location as string | null,
      url: j.url as string | null,
      ...j,
    })) as JobLike[];

    const best = safeExisting
      .map(j => ({ job: j, ...isDuplicate(candidate, j) }))
      .filter(r => r.isDuplicate)
      .sort((a, b) => b.score - a.score)[0];

    if (best) {
      return NextResponse.json(
        { duplicate: best.job, score: best.score, reason: best.reason },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[check-duplicate] error:', e);
    return NextResponse.json({ ok: true }); // En cas d'erreur, on laisse passer (pas de blocage)
  }
}
