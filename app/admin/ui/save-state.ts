import type { Project } from '@/lib/types';

export type SaveInputs = {
  saving: boolean;
  saveError: string;
  pending: number;
  dirty: boolean;
  saved: boolean;
  blockedSlugs: number;
};

// Same rules projects-tab.tsx applies: an empty slug, or a slug used more than once, blocks Save.
export function countBlockedSlugs(projects: Pick<Project, 'slug'>[]): number {
  const counts = new Map<string, number>();
  for (const p of projects) {
    const key = p.slug.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return projects.filter((p) => {
    const key = p.slug.trim();
    return key === '' || (counts.get(key) ?? 0) > 1;
  }).length;
}

export type SaveState =
  | 'saving'
  | 'failed'
  | 'blocked'
  | 'waiting'
  | 'unsaved'
  | 'saved'
  | 'clean';

export function deriveSaveState(i: SaveInputs): SaveState {
  if (i.saving) return 'saving';
  if (i.saveError) return 'failed';
  if (i.dirty && i.blockedSlugs > 0) return 'blocked';
  if (i.pending > 0) return 'waiting';
  if (i.dirty) return 'unsaved';
  if (i.saved) return 'saved';
  return 'clean';
}

export function saveSentence(state: SaveState, i: Pick<SaveInputs, 'saveError' | 'blockedSlugs'>): string {
  switch (state) {
    case 'saving': return 'Saving…';
    case 'failed': return i.saveError;
    case 'blocked': return `Save blocked: fix the slug on ${i.blockedSlugs} project${i.blockedSlugs === 1 ? '' : 's'}`;
    case 'waiting': return 'Waiting for changes to finish…';
    case 'unsaved': return 'Unsaved changes';
    case 'saved': return 'Saved. Changes are live.';
    default: return 'No changes';
  }
}

export function saveDisabled(i: SaveInputs): boolean {
  return i.saving || !i.dirty || i.pending > 0 || i.blockedSlugs > 0;
}
