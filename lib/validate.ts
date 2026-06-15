import type { SiteContent } from './types';

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; errors: string[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

export function validateSiteContent(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(input)) {
    return { ok: false, errors: ['Content must be an object.'] };
  }

  // ── about ──────────────────────────────────────────────────────────────
  const about = input.about;
  if (!isObject(about)) {
    errors.push('about is missing or not an object.');
  } else {
    if (typeof about.name !== 'string' || about.name.trim() === '') {
      errors.push('about.name must be a non-empty string.');
    }
    if (typeof about.title !== 'string') errors.push('about.title must be a string.');
    if (typeof about.heroTagline !== 'string') errors.push('about.heroTagline must be a string.');
    if (typeof about.availableForWork !== 'boolean') errors.push('about.availableForWork must be a boolean.');
    if (about.photo !== undefined && typeof about.photo !== 'string') errors.push('about.photo must be a string when present.');
    if (!isStringArray(about.bio)) errors.push('about.bio must be an array of strings.');
    if (!isStringArray(about.skills)) errors.push('about.skills must be an array of strings.');
  }

  // ── contact ────────────────────────────────────────────────────────────
  const contact = input.contact;
  if (!isObject(contact)) {
    errors.push('contact is missing or not an object.');
  } else {
    if (typeof contact.email !== 'string') errors.push('contact.email must be a string.');
    if (typeof contact.githubUrl !== 'string') errors.push('contact.githubUrl must be a string.');
    if (typeof contact.linkedinUrl !== 'string') errors.push('contact.linkedinUrl must be a string.');
  }

  // ── projects ───────────────────────────────────────────────────────────
  const projects = input.projects;
  if (!Array.isArray(projects)) {
    errors.push('projects must be an array.');
  } else {
    const seenSlugs = new Set<string>();
    const seenIds = new Set<string>();
    projects.forEach((p, i) => {
      const where = `projects[${i}]`;
      if (!isObject(p)) {
        errors.push(`${where} must be an object.`);
        return;
      }
      if (typeof p.id !== 'string' || p.id.trim() === '') {
        errors.push(`${where}.id must be a non-empty string.`);
      } else if (seenIds.has(p.id)) {
        errors.push(`Duplicate project id "${p.id}" — ids must be unique.`);
      } else {
        seenIds.add(p.id);
      }
      if (typeof p.slug !== 'string' || p.slug.trim() === '') {
        errors.push(`${where}.slug must be a non-empty string.`);
      } else if (seenSlugs.has(p.slug)) {
        errors.push(`Duplicate project slug "${p.slug}" — slugs must be unique.`);
      } else {
        seenSlugs.add(p.slug);
      }
      if (typeof p.title !== 'string') errors.push(`${where}.title must be a string.`);
      if (typeof p.tagline !== 'string') errors.push(`${where}.tagline must be a string.`);
      if (typeof p.description !== 'string') errors.push(`${where}.description must be a string.`);
      if (!isStringArray(p.tech)) errors.push(`${where}.tech must be an array of strings.`);
      if (p.image !== undefined && typeof p.image !== 'string') errors.push(`${where}.image must be a string when present.`);
      if (typeof p.featured !== 'boolean') errors.push(`${where}.featured must be a boolean.`);
      if (typeof p.order !== 'number') errors.push(`${where}.order must be a number.`);
      if (p.githubUrl !== undefined && typeof p.githubUrl !== 'string') errors.push(`${where}.githubUrl must be a string when present.`);
      if (p.liveUrl !== undefined && typeof p.liveUrl !== 'string') errors.push(`${where}.liveUrl must be a string when present.`);
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, content: input as unknown as SiteContent };
}
