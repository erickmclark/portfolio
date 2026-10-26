import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getRedis } from '@/lib/content';
import { validateSiteContent } from '@/lib/validate';
import { deleteProjectBlobs, isValidProjectId, readStoredContent } from '@/lib/project-images';

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return fail('Unauthorized', 401);
  try {
    const { id } = await params;
    if (!isValidProjectId(id)) return fail('Invalid project id.', 400);
    const redis = getRedis();
    if (!redis) return fail('Content store (KV) is not configured', 500);
    const stored = await readStoredContent(redis);
    if ('error' in stored) return fail(stored.error, 500);
    const { content } = stored;

    if ((content.projects ?? []).some((p) => p.id === id)) {
      const updated = { ...content, projects: content.projects.filter((p) => p.id !== id) };
      const result = validateSiteContent(updated);
      if (!result.ok) {
        return NextResponse.json(
          { error: `Invalid content: ${result.errors.join(' ')}`, errors: result.errors },
          { status: 400 },
        );
      }
      await redis.set('data', JSON.stringify(result.content));
    }
    // Runs even when the project is already gone, so a retry can finish cleanup.
    try {
      await deleteProjectBlobs(id);
    } catch {
      return NextResponse.json(
        {
          error: 'The project was deleted, but some of its image files could not be removed from storage and may remain there.',
          deleted: true,
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(String(e), 500);
  }
}
