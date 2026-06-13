import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function spaceId(req: NextRequest): number {
  return parseInt(req.headers.get('x-space-id') ?? '1', 10) || 1;
}

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const sid = spaceId(req);
    const jobs = db.prepare('SELECT * FROM jobs WHERE space_id = ? ORDER BY created_at DESC').all(sid);
    return NextResponse.json(jobs);
  } catch (e) {
    console.error('[GET /api/jobs] error:', e);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = await getDb();
    const sid = spaceId(req);

    const stmt = db.prepare(`
      INSERT INTO jobs (space_id, url, title, company, location, remote, start_date, salary, contract_type,
        summary, description, contact_name, contact_email, contact_linkedin,
        network_connection, status, added_by, priority, tags)
      VALUES (@space_id, @url, @title, @company, @location, @remote, @start_date, @salary, @contract_type,
        @summary, @description, @contact_name, @contact_email, @contact_linkedin,
        @network_connection, @status, @added_by, @priority, @tags)
    `);

    const result = stmt.run({
      space_id: sid,
      url: body.url ?? null,
      title: body.title ?? '',
      company: body.company ?? '',
      location: body.location ?? null,
      remote: body.remote ?? null,
      start_date: body.start_date ?? null,
      salary: body.salary ?? null,
      contract_type: body.contract_type ?? null,
      summary: body.summary ?? null,
      description: body.description ?? null,
      contact_name: body.contact_name ?? null,
      contact_email: body.contact_email ?? null,
      contact_linkedin: body.contact_linkedin ?? null,
      network_connection: body.network_connection ?? null,
      status: body.status ?? 'todo',
      added_by: body.added_by ?? 'Équipe',
      priority: body.priority ?? 'medium',
      tags: JSON.stringify(body.tags ?? []),
    });

    const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);

    db.prepare(`
      INSERT INTO activities (job_id, type, content, author)
      VALUES (?, 'added', ?, ?)
    `).run(result.lastInsertRowid, `Offre ajoutée par ${body.added_by ?? 'Équipe'}`, body.added_by ?? 'Équipe');

    return NextResponse.json(job, { status: 201 });
  } catch (e) {
    console.error('[POST /api/jobs] error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
