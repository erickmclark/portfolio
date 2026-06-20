// Seed the Upstash KV content store ('data' key) from content/data.json.
//
// Usage (after the Vercel↔Upstash integration is provisioned):
//   vercel env pull .env.local      # fetches KV_REST_API_URL / KV_REST_API_TOKEN
//   node scripts/seed-kv.mjs
//
// Idempotent: overwrites the 'data' key with the current content/data.json.
import { readFileSync } from 'fs';
import { Redis } from '@upstash/redis';

// Load .env.local (Node doesn't do this automatically).
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // no .env.local — rely on the ambient environment
}

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error('Missing KV_REST_API_URL / KV_REST_API_TOKEN. Run: vercel env pull .env.local');
  process.exit(1);
}

const redis = new Redis({ url, token, automaticDeserialization: false });
const content = JSON.parse(readFileSync(new URL('../content/data.json', import.meta.url), 'utf8'));

await redis.set('data', JSON.stringify(content));
const back = JSON.parse(await redis.get('data'));
console.log('Seeded KV key "data". Projects:', back.projects.map((p) => p.slug).join(', '));
