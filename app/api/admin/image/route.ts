import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { putRepoImage } from '@/lib/github';

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { slug, imageBase64, sha } = await request.json() as {
      slug: string;
      imageBase64: string;
      sha?: string;
    };
    const imagePath = await putRepoImage(slug, imageBase64, sha);
    return NextResponse.json({ imagePath });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
