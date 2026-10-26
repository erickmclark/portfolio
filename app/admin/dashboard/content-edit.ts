import { defaultCardCtas } from '@/lib/home-copy';
import type { Capability, Cta, HeroCopy, Project } from '@/lib/types';

/** Move the item at `index` by one place. Out-of-range moves return an unchanged copy. */
export function moveItem<T>(list: readonly T[], index: number, delta: -1 | 1): T[] {
  const to = index + delta;
  const next = [...list];
  if (index < 0 || index >= list.length || to < 0 || to >= list.length) return next;
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

export function removeAt<T>(list: readonly T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

export function replaceAt<T>(list: readonly T[], index: number, item: T): T[] {
  return list.map((it, i) => (i === index ? item : it));
}

/** The band is a radio-like choice: exactly the item at `index` carries it. */
export function setBand(caps: readonly Capability[], index: number): Capability[] {
  return caps.map((c, i) => {
    const { band: _band, ...rest } = c;
    void _band;
    return i === index ? { ...rest, band: true } : rest;
  });
}

/** Set or clear the optional third hero action. Clearing also drops the external flag. */
export function withTertiary(hero: HeroCopy, tertiary: Cta | undefined): HeroCopy {
  const { tertiary: _t, tertiaryExternal: _e, ...rest } = hero;
  void _t;
  void _e;
  if (!tertiary) return rest;
  return { ...rest, tertiary, ...(hero.tertiaryExternal ? { tertiaryExternal: true } : {}) };
}

export function withTertiaryExternal(hero: HeroCopy, external: boolean): HeroCopy {
  const { tertiaryExternal: _e, ...rest } = hero;
  void _e;
  return external && hero.tertiary ? { ...rest, tertiaryExternal: true } : rest;
}

/** Project ids that exist and are not yet in the order. */
export function unorderedProjects<P extends { id: string }>(projects: readonly P[], order: readonly string[]): P[] {
  const used = new Set(order);
  return projects.filter((p) => !used.has(p.id));
}

export function addUnique(list: readonly string[], id: string): string[] {
  return list.includes(id) ? [...list] : [...list, id];
}

/** A privacy-section id that is valid (^[a-z][a-z0-9-]*$) and not yet used. */
export function nextSectionId(ids: readonly string[]): string {
  let n = ids.length + 1;
  while (ids.includes(`section-${n}`)) n++;
  return `section-${n}`;
}

/** Blank-line separated text to trimmed, non-empty paragraphs. */
export function parseParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

/** One entry per line, trimmed, blanks dropped. */
export function parseLines(text: string): string[] {
  return text.split('\n').map((l) => l.trim()).filter(Boolean);
}

const hasPrefix = (msg: string, path: string, seps: string[]) => seps.some((s) => msg.startsWith(path + s));

/** The first validator message about exactly this field (`<path> must ...`). */
export function errorFor(errors: readonly string[], path: string): string | undefined {
  return errors.find((m) => hasPrefix(m, path, [' ']));
}

/** Every message at or beneath a path. */
export function errorsUnder(errors: readonly string[], path: string): string[] {
  return errors.filter((m) => hasPrefix(m, path, [' ', '.', '[']));
}

/** Strip the dotted path from a validator message for display. */
export function readable(msg: string): string {
  return msg.replace(/^[\w.[\]-]+ /, '').replace(/^./, (c) => c.toUpperCase());
}

export type CardCtaValues = {
  label: string;
  href: string;
  secondary?: { label: string; href: string };
};

/** What the homepage card shows now: stored values, or the defaults when nothing is stored. */
export function effectiveCardCtas(project: Pick<Project, 'id' | 'cardCta' | 'cardSecondaryCta'>): CardCtaValues {
  const d = defaultCardCtas(project.id);
  const stored = !!project.cardCta;
  const cta = project.cardCta ?? d.cardCta!;
  const secondary = stored ? project.cardSecondaryCta : d.cardSecondaryCta;
  return { label: cta.label, href: cta.href ?? '', ...(secondary ? { secondary: { ...secondary } } : {}) };
}

/**
 * Write both card buttons from the current values. A stored `cardCta` without
 * `cardSecondaryCta` means "no second button", so the secondary is always written
 * out together with the primary and never dropped by accident.
 */
export function applyCardCtas(project: Project, next: CardCtaValues): Project {
  const { cardCta: _c, cardSecondaryCta: _s, ...rest } = project;
  void _c;
  void _s;
  return {
    ...rest,
    cardCta: next.href === '' ? { label: next.label } : { label: next.label, href: next.href },
    ...(next.secondary ? { cardSecondaryCta: { ...next.secondary } } : {}),
  };
}
