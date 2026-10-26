import type { MetadataRoute } from 'next';
import { getSiteContent, publicProjects } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();

  const lastModified = new Date();

  const projectRoutes: MetadataRoute.Sitemap = publicProjects(projects).map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    { url: BASE, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/work`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    ...projectRoutes,
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
