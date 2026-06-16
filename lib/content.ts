import { readFileSync } from 'fs';
import { join } from 'path';
import type { SiteContent } from './types';

function readFile(): SiteContent {
  const raw = readFileSync(join(process.cwd(), 'content', 'data.json'), 'utf-8');
  return JSON.parse(raw) as SiteContent;
}

/**
 * Reads live site content from Netlify Blobs (or the local data.json fallback).
 * Always fresh: public pages use `export const dynamic = 'force-dynamic'`, so
 * admin saves appear on the site immediately with no cache to bust.
 */
export async function getSiteContent(): Promise<SiteContent> {
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
