import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { isDuplicate, type JobLike } from '@/lib/duplicate';

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();

  const candidate: JobLike = {
    title: body.title ?? '',
    company: body.company ?? '',
    location: body.location,
    url: body.url,
  };

  const existing = db.prepare('SELECT * FROM jobs WHERE status != ?').all('archived') as JobLike[];
  const best = existing
    .map(j => ({ job: j, ...isDuplicate(candidate, j) }))
    .filter(r => r.isDuplicate)
    .sort((a, b) => b.score - a.score)[0];

  if (best) {
    return NextResponse.json(
      { duplicate: best.job, score: Math.round(best.score * 100), reason: best.reason },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
