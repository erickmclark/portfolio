import type { Project, SiteContent } from '@/lib/types';

/** Apply `fn` to one project in the LATEST content; `latest` is returned unchanged when the project is gone. */
function updateProject(latest: SiteContent, projectId: string, fn: (p: Project) => Project): SiteContent {
  if (!latest.projects.some((p) => p.id === projectId)) return latest;
  return { ...latest, projects: latest.projects.map((p) => (p.id === projectId ? fn(p) : p)) };
}

/** Remove a deleted project from the latest content by id. */
export function removeProject(latest: SiteContent, projectId: string): SiteContent {
  if (!latest.projects.some((p) => p.id === projectId)) return latest;
  return { ...latest, projects: latest.projects.filter((p) => p.id !== projectId) };
}

/**
 * After a slug image move, repoint only the `image` / `images[].url` values that
 * still equal `/projects/<from>.png`. Everything else on the project is untouched.
 */
export function applySlugImageMove(
  latest: SiteContent,
  projectId: string,
  from: string,
  imagePath: string,
): SiteContent {
  const old = `/projects/${from}.png`;
  return updateProject(latest, projectId, (p) => {
    if (p.images) {
      if (!p.images.some((img) => img.url === old)) return p;
      const images = p.images.map((img) => (img.url === old ? { ...img, url: imagePath } : img));
      return { ...p, images, image: images[0]?.url ?? '' };
    }
    return p.image === old ? { ...p, image: imagePath } : p;
  });
}

/** GitHub auto-fill sets title, tagline and tech only. */
export function applyGitHubFill(
  latest: SiteContent,
  projectId: string,
  fill: { title: string; tagline: string; tech: string[] },
): SiteContent {
  return updateProject(latest, projectId, (p) => ({
    ...p,
    title: fill.title,
    tagline: fill.tagline,
    tech: fill.tech,
  }));
}

/** Classify a DELETE /api/admin/projects/<id> response. `deleted === true` means KV committed but Blob cleanup failed. */
export function deleteOutcome(ok: boolean, body: unknown): 'removed' | 'removed-with-warning' | 'error' {
  if (ok) return 'removed';
  if (typeof body === 'object' && body !== null && (body as { deleted?: unknown }).deleted === true) {
    return 'removed-with-warning';
  }
  return 'error';
}

export type DeleteNotice = { projectId: string; message: string } | null;

/** Next notice after a retry for `retryId`. A retry only touches the notice if it still names that project. */
export function nextNoticeAfterRetry(
  current: DeleteNotice,
  retryId: string,
  outcome: 'removed' | 'removed-with-warning' | 'error',
  message: string,
): DeleteNotice {
  if (current?.projectId !== retryId) return current;
  return outcome === 'removed' ? null : { projectId: retryId, message };
}
