import { describe, expect, it } from 'vitest';
import { countBlockedSlugs, deriveSaveState, saveDisabled, saveSentence, type SaveInputs } from './save-state';

const base: SaveInputs = { saving: false, saveError: '', pending: 0, dirty: false, saved: false, blockedSlugs: 0 };
const s = (o: Partial<SaveInputs>) => ({ ...base, ...o });
const sentence = (i: SaveInputs) => saveSentence(deriveSaveState(i), i);

describe('save sentence', () => {
  it('covers all seven states', () => {
    expect(sentence(base)).toBe('No changes');
    expect(sentence(s({ dirty: true }))).toBe('Unsaved changes');
    expect(sentence(s({ dirty: true, pending: 1 }))).toBe('Waiting for changes to finish…');
    expect(sentence(s({ saving: true, dirty: true }))).toBe('Saving…');
    expect(sentence(s({ saved: true }))).toBe('Saved. Changes are live.');
    expect(sentence(s({ dirty: true, saveError: 'Save failed: boom' }))).toBe('Save failed: boom');
    expect(sentence(s({ dirty: true, blockedSlugs: 2 }))).toBe('Save blocked: fix the slug on 2 projects');
    expect(sentence(s({ dirty: true, blockedSlugs: 1 }))).toBe('Save blocked: fix the slug on 1 project');
  });
  it('disables Save while blocked, pending, saving or clean', () => {
    expect(saveDisabled(s({ dirty: true }))).toBe(false);
    expect(saveDisabled(s({ dirty: true, blockedSlugs: 1 }))).toBe(true);
    expect(saveDisabled(s({ dirty: true, pending: 1 }))).toBe(true);
    expect(saveDisabled(s({ dirty: true, saving: true }))).toBe(true);
    expect(saveDisabled(base)).toBe(true);
  });
});

describe('countBlockedSlugs', () => {
  it('counts empty and duplicate slugs, trimmed', () => {
    expect(countBlockedSlugs([{ slug: 'a' }, { slug: 'b' }])).toBe(0);
    expect(countBlockedSlugs([{ slug: 'a' }, { slug: ' a ' }, { slug: '' }, { slug: '  ' }, { slug: 'c' }])).toBe(4);
  });
});
