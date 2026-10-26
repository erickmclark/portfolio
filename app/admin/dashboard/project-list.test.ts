import { describe, expect, it } from 'vitest';
import { caseStudyFilledCount, projectStamps, selectionAfterDelete } from './project-list';

describe('projectStamps', () => {
  it('is empty for a public, unfeatured, valid project', () => {
    expect(projectStamps({ featured: false }, false)).toEqual([]);
    expect(projectStamps({ visibility: 'public', featured: false }, false)).toEqual([]);
  });
  it('lists slug, visibility and featured in order', () => {
    expect(projectStamps({ visibility: 'hidden', featured: true }, true)).toEqual(['SLUG', 'HIDDEN', 'FEATURED']);
    expect(projectStamps({ visibility: 'archived', featured: false }, false)).toEqual(['ARCHIVED']);
  });
});

describe('caseStudyFilledCount', () => {
  it('is 0 when absent', () => expect(caseStudyFilledCount(undefined)).toBe(0));
  it('counts non-blank sections only', () => {
    expect(caseStudyFilledCount({ role: 'Lead', dates: '  ', outcome: 'x' })).toBe(2);
  });
});

describe('selectionAfterDelete', () => {
  const ids = ['a', 'b', 'c'];
  it('selects the next neighbour', () => expect(selectionAfterDelete(ids, 'b')).toBe('c'));
  it('falls back to the previous at the end', () => expect(selectionAfterDelete(ids, 'c')).toBe('b'));
  it('selects the next when deleting the first', () => expect(selectionAfterDelete(ids, 'a')).toBe('b'));
  it('is null for the only project or an unknown id', () => {
    expect(selectionAfterDelete(['a'], 'a')).toBeNull();
    expect(selectionAfterDelete(ids, 'z')).toBeNull();
  });
});
