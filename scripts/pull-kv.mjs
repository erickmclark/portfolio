// Pull the live content from the Upstash KV store ('data' key) into content/data.json.
//
// The reverse of seed-kv.mjs — run this to snapshot admin-dashboard edits back
// into the repo before reseeding, so the two sources can't drift.
//
// Usage:
//   vercel env pull .env.local      # fetches KV_REST_API_URL / KV_REST_API_TOKEN
//   node scripts/pull-kv.mjs
import { readFileSync, writeFileSync } from 'fs';
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
const raw = await redis.get('data');
if (!raw || typeof raw !== 'string') {
  console.error('KV key "data" is empty — nothing to pull.');
  process.exit(1);
}

const content = JSON.parse(raw);
writeFileSync(new URL('../content/data.json', import.meta.url), JSON.stringify(content, null, 2) + '\n');
console.log('Pulled KV key "data" into content/data.json. Projects:', content.projects.map((p) => p.slug).join(', '));
