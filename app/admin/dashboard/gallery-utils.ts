import type { Project, ProjectImage, SiteContent } from '@/lib/types';

/** Mirrors the server's seeding: a legacy-only project shows its `image` as one screenshot entry. */
export function galleryImages(project: Pick<Project, 'images' | 'image' | 'title'>): ProjectImage[] {
  if (project.images !== undefined) return project.images;
  if (project.image) return [{ url: project.image, alt: project.title || 'Project image', kind: 'screenshot' }];
  return [];
}

/**
 * Apply a route response's `{ images }`: membership and order come from the
 * response, but unsaved local alt/caption/kind edits win for every url present.
 */
export function mergeRouteImages(local: ProjectImage[], remote: ProjectImage[]): ProjectImage[] {
  const byUrl = new Map(local.map((img) => [img.url, img]));
  return remote.map((img) => {
    const mine = byUrl.get(img.url);
    return mine ? { ...img, alt: mine.alt, caption: mine.caption, kind: mine.kind } : img;
  });
}

/** Urls in the order after moving `index` by `delta`; null when out of range. */
export function moveUrls(images: ProjectImage[], index: number, delta: -1 | 1): string[] | null {
  const to = index + delta;
  if (index < 0 || index >= images.length || to < 0 || to >= images.length) return null;
  const urls = images.map((i) => i.url);
  [urls[index], urls[to]] = [urls[to], urls[index]];
  return urls;
}

/** Urls with `index` moved to the front; null when already first or out of range. */
export function coverUrls(images: ProjectImage[], index: number): string[] | null {
  if (index <= 0 || index >= images.length) return null;
  const urls = images.map((i) => i.url);
  const [picked] = urls.splice(index, 1);
  return [picked, ...urls];
}

/**
 * Apply a route response to the LATEST content: only the matching project's
 * `images` and `image` change, so edits made after the request was dispatched
 * survive. Returns `latest` unchanged when the project no longer exists.
 */
export function applyRouteImages(latest: SiteContent, projectId: string, remote: ProjectImage[]): SiteContent {
  if (!latest.projects.some((p) => p.id === projectId)) return latest;
  return {
    ...latest,
    projects: latest.projects.map((p) => {
      if (p.id !== projectId) return p;
      const images = mergeRouteImages(galleryImages(p), remote);
      return { ...p, images, image: images[0]?.url ?? '' };
    }),
  };
}
