import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getRepoInfo } from '@/lib/github';

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  const match = url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }
  const [, owner, repo] = match;
  try {
    const info = await getRepoInfo(owner, repo.replace(/\.git$/, ''));
    return NextResponse.json(info);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
