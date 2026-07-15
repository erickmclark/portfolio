import type { MetadataRoute } from 'next';
import { getSiteContent } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();

  const lastModified = new Date();

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified, changeFrequency: 'weekly', priority: 1 },
    ...projectRoutes,
  ];
}
