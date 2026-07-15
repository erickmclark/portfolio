import { readFileSync } from 'fs';
import { join } from 'path';
import { cache } from 'react';
import { Redis } from '@upstash/redis';
import type { SiteContent } from './types';

const CONTENT_KEY = 'data';

function readFile(): SiteContent {
  const raw = readFileSync(join(process.cwd(), 'content', 'data.json'), 'utf-8');
  return JSON.parse(raw) as SiteContent;
}

/**
 * Returns an Upstash Redis client, or null when the KV env vars are absent
 * (e.g. local dev). `automaticDeserialization: false` makes it behave like the
 * old Netlify Blobs store — a string goes in, a string comes back — so we keep
 * the explicit JSON.parse / JSON.stringify on both read and write paths.
 */
export function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token, automaticDeserialization: false });
}

/**
 * Reads live site content from Upstash Redis (or the local data.json fallback).
 * Always fresh: public pages use `export const dynamic = 'force-dynamic'`, so
 * admin saves appear on the site immediately with no cache to bust.
 *
 * Wrapped in React `cache()` for per-request dedupe only — layout plus every
 * section component share one Redis read per request, with no persistence
 * across requests (unlike `unstable_cache`, which was intentionally dropped).
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  let content: SiteContent | null = null;
  try {
    const redis = getRedis();
    if (redis) {
      const raw = await redis.get<string>(CONTENT_KEY);
      if (raw && typeof raw === 'string') content = JSON.parse(raw) as SiteContent;
    }
  } catch {
    // KV unavailable (local dev without env vars) — fall through
  }
  content ??= readFile();
  // Legacy data saved before the experience field existed
  content.experience ??= [];
  return content;
});
