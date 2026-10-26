import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { moveRepoImage } from '@/lib/github';

// Rename a project's image to follow a changed slug.
export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { fromSlug, toSlug } = await request.json() as {
      fromSlug: string;
      toSlug: string;
    };
    const result = await moveRepoImage(fromSlug, toSlug);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
