import { readFileSync } from 'fs';
import { join } from 'path';
import type { SiteContent } from './types';

export function getSiteContent(): SiteContent {
  const raw = readFileSync(join(process.cwd(), 'content', 'data.json'), 'utf-8');
  return JSON.parse(raw) as SiteContent;
}
