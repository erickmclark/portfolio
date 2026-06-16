import type { MetadataRoute } from 'next';
import { getSiteContent } from '@/lib/content';

const BASE = 'https://clarkport.netlify.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${BASE}/projects/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: BASE, changeFrequency: 'weekly', priority: 1 },
    ...projectRoutes,
  ];
}
