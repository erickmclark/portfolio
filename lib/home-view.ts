import { PROJECT_CATEGORIES, VIEWS } from './types';
import type { Project, ProjectCategory, View } from './types';

export { VIEWS };
export type { View };
export const DEFAULT_VIEW: View = 'it';

export const VIEW_LABELS: Record<View, string> = {
  it: 'IT Professional',
  consultant: 'Consultant',
  builder: 'Builder',
};

type Param = string | string[] | undefined;
const first = (v: Param) => (Array.isArray(v) ? v[0] : v);

/** `?view=` value to a View; anything unknown falls back to IT Professional. */
export function parseView(value: Param): View {
  const v = first(value);
  return (VIEWS as readonly string[]).includes(v ?? '') ? (v as View) : DEFAULT_VIEW;
}

/** `?category=` value to a ProjectCategory, or null (All) when absent or unknown. */
export function parseCategory(value: Param): ProjectCategory | null {
  const v = first(value);
  return (PROJECT_CATEGORIES as readonly string[]).includes(v ?? '') ? (v as ProjectCategory) : null;
}

/** Href for the homepage with a view and optional category, keeping the URL minimal. */
export function homeHref(view: View, category?: ProjectCategory | null, hash?: string): string {
  const q = new URLSearchParams();
  if (view !== DEFAULT_VIEW) q.set('view', view);
  if (category) q.set('category', category);
  const s = q.toString();
  return `/${s ? `?${s}` : ''}${hash ? `#${hash}` : ''}`;
}

/** Featured order per view (spec 16.2), by stable Project.id. */
export const FEATURED_ORDER: Record<View, string[]> = {
  it: [
    'prj-jpmc-legal-tech',
    'prj-ai-engineering-factory',
    'prj-ai-governance-platform',
    'prj-authmatch',
    'prj-prepera',
  ],
  consultant: [
    'prj-dupars-bbq',
    'prj-angie-cares',
    'prj-jpmc-legal-tech',
    'prj-ai-governance-platform',
  ],
  builder: [
    'prj-ai-engineering-factory',
    'prj-dupars-bbq',
    'prj-angie-cares',
    'prj-authmatch',
    'prj-prepera',
    'prj-sanctionswatch',
    'prj-regulatory-intelligence',
    'prj-gen4me',
    'prj-g2-complaint-miner',
  ],
};

/** The AI Engineering Factory gets the full-width feature card only in views whose featured list includes it. */
export const FACTORY_ID = 'prj-ai-engineering-factory';
export function hasFactoryFeature(view: View, order: Record<View, string[]> = FEATURED_ORDER): boolean {
  return order[view].includes(FACTORY_ID);
}

/** The view's featured projects first, in order; every other project follows in content order. */
export function orderProjects(projects: Project[], view: View, order: Record<View, string[]> = FEATURED_ORDER): Project[] {
  const byContent = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.order - b.order;
  });
  const rank = (p: Project) => {
    const i = order[view].indexOf(p.id);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return byContent
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
    .map((x) => x.p);
}

export function filterByCategory(projects: Project[], category: ProjectCategory | null): Project[] {
  return category ? projects.filter((p) => p.category === category) : projects;
}

/**
 * Status label to show, or null. Placeholder statuses ("... to confirm") and
 * any status on client work are never rendered.
 */
export function displayStatus(project: Pick<Project, 'status' | 'relationship'>): string | null {
  if (project.relationship === 'Client Work') return null;
  const s = project.status?.trim();
  if (!s || /to confirm/i.test(s)) return null;
  return s;
}

/** Only a verified external destination (`externalUrl`, http/https) is ever linked. */
export function externalHref(project: Pick<Project, 'externalUrl'>): string | null {
  const u = project.externalUrl?.trim();
  return u && /^https?:\/\//i.test(u) ? u : null;
}

/**
 * Splits `about.bio` into narrative paragraphs, credentials and the closing
 * statement. The admin stores credentials as a "Credentials: a; b; c" entry
 * and the closing statement as the entry after it.
 */
export function splitAbout(bio: string[]): { paragraphs: string[]; credentials: string[]; closing: string | null } {
  const ci = bio.findIndex((b) => /^credentials:/i.test(b.trim()));
  if (ci === -1) return { paragraphs: bio, credentials: [], closing: null };
  const credentials = bio[ci]
    .replace(/^credentials:/i, '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    paragraphs: bio.slice(0, ci),
    credentials,
    closing: bio[ci + 1]?.trim() || null,
  };
}

/** Date range text for an experience row. An empty end reads "Present" except for JPMorgan Chase. */
export function experienceDates(item: { start: string; end: string; company: string }): string {
  if (item.end) return `${item.start}–${item.end}`;
  if (/jpmorgan/i.test(item.company)) return item.start;
  return `${item.start}–Present`;
}
