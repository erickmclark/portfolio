/**
 * Canonical, absolute site URL — single source of truth for metadata,
 * the sitemap, robots, and Open Graph tags.
 *
 * Set NEXT_PUBLIC_SITE_URL in the environment (e.g. the Vercel project's
 * production URL). The literal fallback only applies if that var is unset.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iamerickclark.com';
