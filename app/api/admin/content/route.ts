import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSiteContent } from '@/lib/content';
import type { SiteContent } from '@/lib/types';

async function getStore() {
  const { getStore: netlifyGetStore } = await import('@netlify/blobs');
  return netlifyGetStore('site-content');
}

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
    const { content } = await request.json() as { content: SiteContent };
    const store = await getStore();
    await store.set('data', JSON.stringify(content));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
