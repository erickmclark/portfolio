import { NextRequest, NextResponse } from 'next/server';
import { del, put } from '@vercel/blob';
import { isAuthenticated } from '@/lib/auth';
import { getRedis } from '@/lib/content';
import { validateSiteContent } from '@/lib/validate';
import { IMAGE_KINDS } from '@/lib/types';
import type { Project, ProjectImage, SiteContent } from '@/lib/types';
import {
  MAX_IMAGE_BYTES,
  blobPrefix,
  ensureImages,
  isProjectBlobUrl,
  isValidProjectId,
  readStoredContent,
  sniffImageType,
  syncCover,
} from '@/lib/project-images';

type Ctx = { params: Promise<{ id: string }> };
type Redis = NonNullable<ReturnType<typeof getRedis>>;

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

type Loaded =
  | { response: NextResponse }
  | { redis: Redis; content: SiteContent; index: number; project: Project };

async function load(id: string): Promise<Loaded> {
  if (!isValidProjectId(id)) return { response: fail('Invalid project id.', 400) };
  const redis = getRedis();
  if (!redis) return { response: fail('Content store (KV) is not configured', 500) };
  const stored = await readStoredContent(redis);
  if ('error' in stored) return { response: fail(stored.error, 500) };
  const { content } = stored;
  const index = (content.projects ?? []).findIndex((p) => p.id === id);
  if (index === -1) {
    return { response: fail('Project not found. Save the project before adding images.', 404) };
  }
  return { redis, content, index, project: content.projects[index] };
}

// Applies the project change, validates the whole document and writes it.
async function commit(
  redis: Redis,
  content: SiteContent,
  index: number,
  next: Project,
): Promise<{ project: Project } | { response: NextResponse }> {
  const project = syncCover(next);
  const updated: SiteContent = {
    ...content,
    projects: content.projects.map((p, i) => (i === index ? project : p)),
  };
  const result = validateSiteContent(updated);
  if (!result.ok) {
    return {
      response: NextResponse.json(
        { error: `Invalid content: ${result.errors.join(' ')}`, errors: result.errors },
        { status: 400 },
      ),
    };
  }
  await redis.set('data', JSON.stringify(result.content));
  return { project };
}

function respond(project: Project) {
  return NextResponse.json({ images: project.images ?? [], image: project.image });
}

export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) return fail('Unauthorized', 401);
  try {
    const { id } = await params;
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return fail('An image file is required.', 400);
    if (file.size > MAX_IMAGE_BYTES) return fail('Image is too large (4 MB maximum).', 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > MAX_IMAGE_BYTES) return fail('Image is too large (4 MB maximum).', 400);
    const type = sniffImageType(bytes);
    if (!type) return fail('Unsupported image. Use PNG, JPEG, GIF, WebP or AVIF.', 400);
    const kind = (form.get('kind') as string | null) || 'screenshot';
    if (!(IMAGE_KINDS as readonly string[]).includes(kind)) {
      return fail(`kind must be one of: ${IMAGE_KINDS.join(', ')}.`, 400);
    }

    const loaded = await load(id);
    if ('response' in loaded) return loaded.response;
    const altField = form.get('alt');
    const captionField = form.get('caption');
    const blob = await put(`${blobPrefix(id)}image.${type.ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: type.contentType,
    });

    // The upload is slow: commit against a fresh read so a Save that landed meanwhile survives.
    let fresh: Loaded;
    try {
      fresh = await load(id);
    } catch (e) {
      await del(blob.url).catch(() => {});
      throw e;
    }
    if ('response' in fresh) {
      await del(blob.url).catch(() => {});
      return fresh.response;
    }
    const { redis, content, index, project } = fresh;

    const seeded = ensureImages(project);
    const image: ProjectImage = {
      url: blob.url,
      alt: (typeof altField === 'string' && altField.trim()) || project.title || 'Project image',
      kind: kind as ProjectImage['kind'],
      ...(typeof captionField === 'string' && captionField.trim() ? { caption: captionField.trim() } : {}),
    };
    let committed;
    try {
      committed = await commit(redis, content, index, { ...seeded, images: [...(seeded.images ?? []), image] });
    } catch (e) {
      await del(blob.url).catch(() => {});
      throw e;
    }
    if ('response' in committed) {
      await del(blob.url).catch(() => {});
      return committed.response;
    }
    return respond(committed.project);
  } catch (e) {
    return fail(String(e), 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) return fail('Unauthorized', 401);
  try {
    const { id } = await params;
    const body = (await request.json()) as { urls?: unknown };
    const loaded = await load(id);
    if ('response' in loaded) return loaded.response;
    const { redis, content, index, project } = loaded;

    const current = ensureImages(project).images ?? [];
    const urls = body.urls;
    if (
      !Array.isArray(urls) ||
      !urls.every((u) => typeof u === 'string') ||
      urls.length !== current.length ||
      new Set(urls).size !== urls.length ||
      !current.every((img) => urls.includes(img.url))
    ) {
      return fail('urls must list each current image url exactly once.', 400);
    }
    const byUrl = new Map(current.map((img) => [img.url, img]));
    const images = (urls as string[]).map((u) => byUrl.get(u) as ProjectImage);
    const committed = await commit(redis, content, index, { ...project, images });
    if ('response' in committed) return committed.response;
    return respond(committed.project);
  } catch (e) {
    return fail(String(e), 500);
  }
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  if (!(await isAuthenticated())) return fail('Unauthorized', 401);
  try {
    const { id } = await params;
    const body = (await request.json()) as { url?: unknown };
    if (typeof body.url !== 'string' || body.url === '') return fail('url is required.', 400);
    const url = body.url;
    const loaded = await load(id);
    if ('response' in loaded) return loaded.response;
    const { redis, content, index, project } = loaded;

    const seeded = ensureImages(project);
    const current = seeded.images ?? [];
    const inList = current.some((img) => img.url === url);
    const isBlob = isProjectBlobUrl(url, id);
    if (!inList && !isBlob) return fail('Image not found on this project.', 404);

    let result = seeded;
    if (inList) {
      const committed = await commit(redis, content, index, {
        ...seeded,
        images: current.filter((img) => img.url !== url),
      });
      if ('response' in committed) return committed.response;
      result = committed.project;
    }
    // Legacy same-origin paths live in the repo and are never deleted here.
    if (isBlob) {
      try {
        await del(url);
      } catch {
        return NextResponse.json(
          {
            error:
              'The image was removed from the project, but its file could not be deleted from storage and may remain there.',
            images: result.images ?? [],
            image: result.image,
          },
          { status: 500 },
        );
      }
    }
    return respond(result);
  } catch (e) {
    return fail(String(e), 500);
  }
}
