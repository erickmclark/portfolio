import { describe, expect, it } from 'vitest';
import type { Project, SiteContent } from '@/lib/types';
import { applyGitHubFill, applySlugImageMove, deleteOutcome, nextNoticeAfterRetry, removeProject } from './project-updates';

const proj = (id: string, extra: Partial<Project> = {}): Project => ({
  id,
  slug: id,
  title: id,
  tagline: '',
  description: '',
  tech: [],
  featured: false,
  order: 0,
  ...extra,
});
const site = (projects: Project[]) => ({ projects }) as unknown as SiteContent;

describe('removeProject', () => {
  it('removes by id and keeps in-flight edits on other projects', () => {
    const b = proj('b', { visibility: 'hidden' });
    const latest = site([proj('a'), b]);
    const next = removeProject(latest, 'a');
    expect(next.projects).toEqual([b]);
    expect(next.projects[0]).toBe(b);
  });
  it('returns latest unchanged when the project is gone', () => {
    const latest = site([proj('b')]);
    expect(removeProject(latest, 'a')).toBe(latest);
  });
});

describe('applySlugImageMove', () => {
  it('changes only matching entries and keeps a newer visibility edit', () => {
    const a = proj('a', {
      visibility: 'hidden',
      title: 'Edited while moving',
      image: '/projects/old.png',
      images: [
        { url: '/projects/old.png', alt: 'x', kind: 'screenshot' },
        { url: 'https://blob/other.png', alt: 'y', kind: 'screenshot' },
      ],
    });
    const b = proj('b', { image: '/projects/old.png' });
    const next = applySlugImageMove(site([a, b]), 'a', 'old', '/projects/new.png');
    const na = next.projects[0];
    expect(na.visibility).toBe('hidden');
    expect(na.title).toBe('Edited while moving');
    expect(na.images?.map((i) => i.url)).toEqual(['/projects/new.png', 'https://blob/other.png']);
    expect(na.image).toBe('/projects/new.png');
    expect(next.projects[1]).toBe(b);
  });
  it('leaves a cover that was reordered away untouched', () => {
    const a = proj('a', {
      image: 'https://blob/other.png',
      images: [
        { url: 'https://blob/other.png', alt: 'y', kind: 'screenshot' },
        { url: '/projects/old.png', alt: 'x', kind: 'screenshot' },
      ],
    });
    const na = applySlugImageMove(site([a]), 'a', 'old', '/projects/new.png').projects[0];
    expect(na.image).toBe('https://blob/other.png');
    expect(na.images?.[1].url).toBe('/projects/new.png');
  });
  it('replaces legacy image when images is undefined, only if it still matches', () => {
    const a = proj('a', { image: '/projects/old.png' });
    expect(applySlugImageMove(site([a]), 'a', 'old', '/projects/new.png').projects[0].image).toBe('/projects/new.png');
    const changed = proj('a', { image: 'https://blob/z.png' });
    const latest = site([changed]);
    expect(applySlugImageMove(latest, 'a', 'old', '/projects/new.png').projects[0]).toBe(changed);
  });
  it('returns latest unchanged when the project is gone', () => {
    const latest = site([proj('b')]);
    expect(applySlugImageMove(latest, 'a', 'old', '/projects/new.png')).toBe(latest);
  });
});

describe('applyGitHubFill', () => {
  it('sets only title, tagline and tech; newer edits survive', () => {
    const a = proj('a', { visibility: 'hidden', description: 'newer', slug: 'newer-slug', title: 'Old' });
    const b = proj('b');
    const next = applyGitHubFill(site([a, b]), 'a', { title: 'T', tagline: 'G', tech: ['ts'] });
    expect(next.projects[0]).toEqual({ ...a, title: 'T', tagline: 'G', tech: ['ts'] });
    expect(next.projects[0].visibility).toBe('hidden');
    expect(next.projects[1]).toBe(b);
  });
  it('returns latest unchanged when the project is gone', () => {
    const latest = site([proj('b')]);
    expect(applyGitHubFill(latest, 'a', { title: 'T', tagline: 'G', tech: [] })).toBe(latest);
  });
});

describe('deleteOutcome', () => {
  it('returns removed when ok', () => {
    expect(deleteOutcome(true, { ok: true })).toBe('removed');
  });
  it('returns removed-with-warning when not ok and deleted is true', () => {
    expect(deleteOutcome(false, { error: 'cleanup failed', deleted: true })).toBe('removed-with-warning');
  });
  it('returns error for a 500 body without the deleted flag', () => {
    expect(deleteOutcome(false, { error: 'boom' })).toBe('error');
  });
  it('returns error when deleted is the string "true"', () => {
    expect(deleteOutcome(false, { deleted: 'true' })).toBe('error');
  });
  it('returns error for a 401 body', () => {
    expect(deleteOutcome(false, { error: 'Unauthorized' })).toBe('error');
  });
  it('returns error for the empty object produced by a failed JSON parse', () => {
    expect(deleteOutcome(false, {})).toBe('error');
  });
});

describe('nextNoticeAfterRetry', () => {
  const cur = { projectId: 'a', message: 'old' };
  it('clears the notice when the retry succeeded for the same project', () => {
    expect(nextNoticeAfterRetry(cur, 'a', 'removed', '')).toBeNull();
  });
  it('replaces the message when the retry failed for the same project', () => {
    expect(nextNoticeAfterRetry(cur, 'a', 'error', 'again')).toEqual({ projectId: 'a', message: 'again' });
    expect(nextNoticeAfterRetry(cur, 'a', 'removed-with-warning', 'warn')).toEqual({ projectId: 'a', message: 'warn' });
  });
  it('leaves a newer notice for another project untouched', () => {
    const newer = { projectId: 'b', message: 'newer' };
    expect(nextNoticeAfterRetry(newer, 'a', 'removed', '')).toBe(newer);
    expect(nextNoticeAfterRetry(newer, 'a', 'error', 'x')).toBe(newer);
  });
  it('does not re-show an older notice after it was cleared', () => {
    expect(nextNoticeAfterRetry(null, 'a', 'error', 'x')).toBeNull();
  });
});
