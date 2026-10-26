/**
 * Canonical, absolute site URL — single source of truth for metadata,
 * the sitemap, robots, and Open Graph tags.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment (e.g. the Vercel project's
 * production URL). The literal fallback only applies if that var is unset.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iamerickclark.com';

/** Absolute URL for a stored image: an https URL (Blob) is used as-is, a same-origin path gets the site origin. */
export function absoluteImageUrl(photo: string, siteUrl: string = SITE_URL): string {
  if (/^https:\/\//i.test(photo)) return photo;
  return `${siteUrl.replace(/\/$/, '')}${photo.startsWith('/') ? '' : '/'}${photo}`;
}
