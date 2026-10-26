import { describe, expect, it } from 'vitest';
import { hashTargetId, sameDocumentHashId } from './hash-link';

describe('sameDocumentHashId', () => {
  it('returns the id when the path matches', () => {
    expect(sameDocumentHashId('/about#experience', '/about')).toBe('experience');
  });
  it('returns null for a different page', () => {
    expect(sameDocumentHashId('/about#experience', '/work')).toBeNull();
    expect(sameDocumentHashId('/about#experience', '/')).toBeNull();
  });
  it('returns null without a hash or with an empty hash', () => {
    expect(sameDocumentHashId('/about', '/about')).toBeNull();
    expect(sameDocumentHashId('/about#', '/about')).toBeNull();
  });
});

describe('hashTargetId', () => {
  it('decodes an encoded id', () => {
    expect(hashTargetId('#my%20section')).toBe('my section');
  });
  it('falls back to the raw id on a malformed escape without throwing', () => {
    expect(() => hashTargetId('#%E0')).not.toThrow();
    expect(hashTargetId('#%E0')).toBe('%E0');
  });
  it('returns null for an empty hash', () => {
    expect(hashTargetId('')).toBeNull();
    expect(hashTargetId('#')).toBeNull();
  });
});
