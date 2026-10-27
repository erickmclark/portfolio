import { describe, expect, it } from 'vitest';
import type { Capability, HeroCopy, Project } from '@/lib/types';
import { DEFAULT_HOME } from '@/lib/home-copy';
import { validateSiteContent } from '@/lib/validate';
import {
  addUnique, applyCardCtas, effectiveCardCtas, errorFor, errorsUnder, moveItem, nextSectionId,
  parseLines, parseParagraphs, removeAt, setBand, unorderedProjects, withTertiary, withTertiaryExternal,
} from './content-edit';

const caps = (): Capability[] => DEFAULT_HOME.capabilities.it.map((c) => ({ ...c }));
const project = (over: Partial<Project> = {}): Project => ({
  id: 'p1', slug: 'p1', title: 'P', tagline: '', description: '', tech: [], featured: false, order: 0, ...over,
});

describe('moveItem / removeAt', () => {
  it('swaps neighbours and clamps at the ends', () => {
    expect(moveItem(['a', 'b', 'c'], 1, -1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'c', 'b']);
    expect(moveItem(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 1, 1)).toEqual(['a', 'b']);
  });
  it('does not mutate and removes by index', () => {
    const src = ['a', 'b', 'c'];
    moveItem(src, 0, 1);
    expect(src).toEqual(['a', 'b', 'c']);
    expect(removeAt(src, 1)).toEqual(['a', 'c']);
  });
});

describe('setBand', () => {
  it('leaves exactly one band, moved to the chosen row', () => {
    const next = setBand(caps(), 0);
    expect(next.filter((c) => c.band)).toHaveLength(1);
    expect(next[0].band).toBe(true);
    expect(next.length).toBe(7);
  });
  it('produces content the validator accepts', () => {
    const home = structuredClone(DEFAULT_HOME);
    home.capabilities.it = setBand(home.capabilities.it, 2);
    const errs = validateErrors(home);
    expect(errs.filter((e) => e.includes('band'))).toEqual([]);
  });
});

describe('hero tertiary', () => {
  const hero: HeroCopy = { ...DEFAULT_HOME.hero.it };
  it('clearing drops the tertiary and external flag', () => {
    const out = withTertiary(hero, undefined);
    expect('tertiary' in out).toBe(false);
    expect('tertiaryExternal' in out).toBe(false);
  });
  it('external flag only with a tertiary', () => {
    const noThird = withTertiary(hero, undefined);
    expect('tertiaryExternal' in withTertiaryExternal(noThird, true)).toBe(false);
    expect(withTertiaryExternal(hero, false).tertiaryExternal).toBeUndefined();
    expect(withTertiaryExternal(hero, true).tertiaryExternal).toBe(true);
  });
});

describe('ordered list helpers', () => {
  it('unorderedProjects and addUnique', () => {
    const ps = [{ id: 'a' }, { id: 'b' }];
    expect(unorderedProjects(ps, ['a'])).toEqual([{ id: 'b' }]);
    expect(addUnique(['a'], 'a')).toEqual(['a']);
    expect(addUnique(['a'], 'b')).toEqual(['a', 'b']);
  });
  it('nextSectionId is valid and unused', () => {
    const id = nextSectionId(['section-2', 'x']);
    expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    expect(['section-2', 'x']).not.toContain(id);
  });
  it('parses paragraphs and lines', () => {
    expect(parseParagraphs(' a\nb \n\n\n c ')).toEqual(['a\nb', 'c']);
    expect(parseLines(' a \n\n b')).toEqual(['a', 'b']);
  });
});

describe('error selection', () => {
  const errs = ['home.hero.it.h1 must be x.', 'home.hero.it.primary.href must be y.', 'home.capabilities.it must have exactly one z.', 'home.hero.itx.h1 q'];
  it('matches exact fields only', () => {
    expect(errorFor(errs, 'home.hero.it.h1')).toBe(errs[0]);
    expect(errorFor(errs, 'home.hero.it')).toBeUndefined();
  });
  it('collects beneath a path without prefix collisions', () => {
    expect(errorsUnder(errs, 'home.hero.it')).toEqual([errs[0], errs[1]]);
  });
});

describe('card buttons', () => {
  const factory = { id: 'prj-ai-engineering-factory' };
  it('shows defaults when nothing is stored', () => {
    expect(effectiveCardCtas(project(factory)).secondary?.label).toBe('Discuss AI-assisted engineering');
  });
  it('writing a label preserves the Factory second button', () => {
    const p = project(factory);
    const eff = effectiveCardCtas(p);
    const saved = applyCardCtas(p, { ...eff, label: 'See the Factory' });
    expect(saved.cardCta).toEqual({ label: 'See the Factory' });
    expect(saved.cardSecondaryCta?.label).toBe('Discuss AI-assisted engineering');
  });
  it('keeps a stored secondary when only the primary changes', () => {
    const p = project({ cardCta: { label: 'A' }, cardSecondaryCta: { label: 'B', href: '/contact' } });
    const saved = applyCardCtas(p, { ...effectiveCardCtas(p), label: 'A2', href: '/x' });
    expect(saved.cardCta).toEqual({ label: 'A2', href: '/x' });
    expect(saved.cardSecondaryCta).toEqual({ label: 'B', href: '/contact' });
  });
  it('a stored cardCta without a secondary stays without one', () => {
    const p = project({ ...factory, cardCta: { label: 'A' } });
    expect(effectiveCardCtas(p).secondary).toBeUndefined();
    expect('cardSecondaryCta' in applyCardCtas(p, effectiveCardCtas(p))).toBe(false);
  });
  it('removing the secondary removes it', () => {
    const p = project({ cardCta: { label: 'A' }, cardSecondaryCta: { label: 'B', href: '/c' } });
    const saved = applyCardCtas(p, { label: 'A', href: '' });
    expect('cardSecondaryCta' in saved).toBe(false);
  });
});

function validateErrors(home: typeof DEFAULT_HOME): string[] {
  const r = validateSiteContent({
    projects: [], about: { name: 'n', title: 't', heroTagline: 'h', availableForWork: true, bio: [], skills: [] },
    contact: { email: 'a@b.co', githubUrl: 'https://github.com/a', linkedinUrl: 'https://linkedin.com/in/a' },
    experience: [], home,
  });
  return r.ok ? [] : r.errors;
}
