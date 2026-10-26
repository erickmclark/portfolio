import { del, list } from '@vercel/blob';
import type { Project, ProjectImage, SiteContent } from './types';

export { isAllowedImageUrl } from './image-url';

/** Vercel function request bodies cap at 4.5 MB; stay under it. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com';

/** Blob folder for About assets; reserved so no project id can ever address it. */
export const ABOUT_ASSET_FOLDER = '_about';
export const MAX_RESUME_BYTES = 4 * 1024 * 1024;

export function isValidProjectId(id: string): boolean {
  return typeof id === 'string' && ID_PATTERN.test(id) && id !== ABOUT_ASSET_FOLDER;
}

/** Blob path (before the random suffix) for an About asset. */
export function aboutAssetPath(kind: 'photo' | 'resume', ext?: string): string {
  return kind === 'resume'
    ? `projects/${ABOUT_ASSET_FOLDER}/resume.pdf`
    : `projects/${ABOUT_ASSET_FOLDER}/photo.${ext ?? 'png'}`;
}

/** Blob path for a résumé: a per-upload folder keeps each URL distinct and the last segment (the download filename) readable. */
export function resumeAssetPath(name: string | undefined, unique: string): string {
  const slug = (typeof name === 'string' ? name : '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return `projects/${ABOUT_ASSET_FOLDER}/resume/${unique}/${slug ? `${slug}-Resume` : 'Resume'}.pdf`;
}

/** True when the bytes start with the PDF magic number. */
export function sniffPdf(bytes: Uint8Array): boolean {
  return bytes.length >= 5 && [...'%PDF-'].every((c, i) => bytes[i] === c.charCodeAt(0));
}

export function blobPrefix(projectId: string): string {
  return `projects/${projectId}/`;
}

export function isProjectBlobUrl(url: string, projectId: string): boolean {
  try {
    const u = new URL(url);
    return (
      u.protocol === 'https:' &&
      u.hostname.endsWith(BLOB_HOST_SUFFIX) &&
      u.pathname.startsWith(`/${blobPrefix(projectId)}`)
    );
  } catch {
    return false;
  }
}

/** Keeps legacy `image` equal to the first gallery image. */
export function syncCover(project: Project): Project {
  if (!Array.isArray(project.images)) return { ...project };
  return { ...project, image: project.images[0]?.url ?? '' };
}

/** Seeds `images` from legacy `image` when the project has no gallery yet. */
export function ensureImages(project: Project): Project {
  if (project.images !== undefined) return { ...project };
  const images: ProjectImage[] = project.image
    ? [{ url: project.image, alt: project.title || 'Project image', kind: 'screenshot' }]
    : [];
  return { ...project, images };
}

export function sniffImageType(bytes: Uint8Array): { ext: string; contentType: string } | null {
  const at = (i: number) => bytes[i];
  const ascii = (start: number, s: string) =>
    bytes.length >= start + s.length && [...s].every((c, i) => at(start + i) === c.charCodeAt(0));
  if (bytes.length >= 8 && at(0) === 0x89 && ascii(1, 'PNG') && at(4) === 0x0d && at(5) === 0x0a && at(6) === 0x1a && at(7) === 0x0a) {
    return { ext: 'png', contentType: 'image/png' };
  }
  if (bytes.length >= 3 && at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) {
    return { ext: 'jpg', contentType: 'image/jpeg' };
  }
  if (ascii(0, 'GIF87a') || ascii(0, 'GIF89a')) return { ext: 'gif', contentType: 'image/gif' };
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return { ext: 'webp', contentType: 'image/webp' };
  if (ascii(4, 'ftyp') && (ascii(8, 'avif') || ascii(8, 'avis'))) {
    return { ext: 'avif', contentType: 'image/avif' };
  }
  return null;
}

export async function deleteProjectBlobs(projectId: string): Promise<void> {
  const prefix = blobPrefix(projectId);
  const urls: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor });
    urls.push(...page.blobs.map((b) => b.url));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  if (urls.length > 0) await del(urls);
}

/**
 * Strict read for read-modify-write: unlike getSiteContent(), never falls back to
 * content/data.json, so a KV outage cannot overwrite live content with the seed.
 */
export async function readStoredContent(
  redis: { get: <T>(key: string) => Promise<T | null> },
): Promise<{ content: SiteContent } | { error: string }> {
  let raw: string | null;
  try {
    raw = await redis.get<string>('data');
  } catch {
    return { error: 'Could not read content from the store.' };
  }
  if (!raw) return { error: 'Content store is empty; refusing to modify it.' };
  return { content: (typeof raw === 'string' ? JSON.parse(raw) : raw) as SiteContent };
}
