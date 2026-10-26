import { CASE_STUDY_SECTIONS, type Project } from '@/lib/types';

export type ProjectStamp = 'HIDDEN' | 'ARCHIVED' | 'FEATURED' | 'SLUG';

/** Stamps shown on an index row, in display order. SLUG marks a missing or duplicate slug. */
export function projectStamps(project: Pick<Project, 'visibility' | 'featured'>, slugBlocked: boolean): ProjectStamp[] {
  const stamps: ProjectStamp[] = [];
  if (slugBlocked) stamps.push('SLUG');
  if (project.visibility === 'hidden') stamps.push('HIDDEN');
  if (project.visibility === 'archived') stamps.push('ARCHIVED');
  if (project.featured) stamps.push('FEATURED');
  return stamps;
}

/** How many of the case-study sections have non-blank text. */
export function caseStudyFilledCount(caseStudy: Project['caseStudy']): number {
  if (!caseStudy) return 0;
  return CASE_STUDY_SECTIONS.filter((key) => (caseStudy[key] ?? '').trim() !== '').length;
}

/** The id to select after `deletedId` is removed: the next row, else the previous, else null. */
export function selectionAfterDelete(ids: string[], deletedId: string): string | null {
  const i = ids.indexOf(deletedId);
  if (i === -1) return null;
  return ids[i + 1] ?? ids[i - 1] ?? null;
}
