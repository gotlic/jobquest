import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  // Security: prevent path traversal
  const safe = path.basename(filename);
  const filepath = path.join(process.cwd(), 'uploads', safe);
  try {
    const data = await readFile(filepath);
    const ext = path.extname(safe).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';
    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
