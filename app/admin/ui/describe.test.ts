import { describe, expect, it } from 'vitest';
import { mergeDescribedBy } from './describe';

describe('mergeDescribedBy', () => {
  it('keeps the computed ids when no override is passed', () => {
    expect(mergeDescribedBy('pw-error', undefined)).toBe('pw-error');
  });
  it('merges a passed id with computed ids without duplicates', () => {
    expect(mergeDescribedBy('a', 'b a')).toBe('a b');
  });
  it('returns undefined when empty', () => {
    expect(mergeDescribedBy(undefined, false, '')).toBeUndefined();
  });
});
