import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSiteContent, getRedis } from '@/lib/content';
import { validateSiteContent } from '@/lib/validate';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const content = await getSiteContent();
    return NextResponse.json({ content });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { content } = await request.json() as { content: unknown };
    const result = validateSiteContent(content);
    if (!result.ok) {
      return NextResponse.json(
        { error: `Invalid content: ${result.errors.join(' ')}`, errors: result.errors },
        { status: 400 }
      );
    }
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Content store (KV) is not configured' }, { status: 500 });
    }
    await redis.set('data', JSON.stringify(result.content));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
