import { readFileSync } from 'fs';
import { join } from 'path';
import { unstable_cache } from 'next/cache';
import type { SiteContent } from './types';

function readFile(): SiteContent {
  const raw = readFileSync(join(process.cwd(), 'content', 'data.json'), 'utf-8');
  return JSON.parse(raw) as SiteContent;
}

/**
 * Reads the live site content straight from Netlify Blobs (or the local
 * data.json fallback). Uncached — use this where freshness matters, e.g. the
 * admin editor reading content to edit, and in tests.
 */
export async function getSiteContentUncached(): Promise<SiteContent> {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('site-content');
    const raw = await store.get('data');
    if (raw && typeof raw === 'string') return JSON.parse(raw) as SiteContent;
  } catch {
    // Blobs unavailable (local dev without netlify dev) — fall through
  }
  return readFile();
}

/**
 * Cached across requests so ordinary page views don't hit Netlify Blobs on
 * every render. The admin save route calls `revalidateTag('site-content')`,
 * so published edits appear immediately. The 60s `revalidate` is a safety net
 * that re-reads Blobs after a code redeploy (whose prerender would otherwise
 * be pinned to the committed data.json seed). Use this in all public pages.
 */
export const getSiteContent = unstable_cache(
  getSiteContentUncached,
  ['site-content'],
  { tags: ['site-content'], revalidate: 60 },
);
