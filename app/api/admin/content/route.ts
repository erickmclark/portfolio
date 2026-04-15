import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getRepoFile, putRepoFile } from '@/lib/github';
import type { SiteContent } from '@/lib/types';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content, sha } = await getRepoFile('content/data.json');
    return NextResponse.json({ content, sha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content, sha } = await request.json() as { content: SiteContent; sha: string };
    const newSha = await putRepoFile('content/data.json', content, sha, 'content: update via admin panel');
    return NextResponse.json({ ok: true, sha: newSha });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
