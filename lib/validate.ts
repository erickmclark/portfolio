import type { SiteContent } from './types';
import { isAllowedImageUrl } from './image-url';
import {
  CASE_STUDY_SECTIONS,
  IMAGE_KINDS,
  PROJECT_CATEGORIES,
  PROJECT_RELATIONSHIPS,
  VISIBILITIES,
} from './types';

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; errors: string[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === 'string');
}

function isOneOf(v: unknown, allowed: readonly string[]): boolean {
  return typeof v === 'string' && allowed.includes(v);
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
    if (about.resumeUrl !== undefined && typeof about.resumeUrl !== 'string') errors.push('about.resumeUrl must be a string when present.');
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
      else if (typeof p.image === 'string' && p.image !== '' && !isAllowedImageUrl(p.image)) errors.push(`${where}.image must be a same-origin path or an https URL.`);
      if (typeof p.featured !== 'boolean') errors.push(`${where}.featured must be a boolean.`);
      if (typeof p.order !== 'number') errors.push(`${where}.order must be a number.`);
      if (p.githubUrl !== undefined && typeof p.githubUrl !== 'string') errors.push(`${where}.githubUrl must be a string when present.`);
      if (p.liveUrl !== undefined && typeof p.liveUrl !== 'string') errors.push(`${where}.liveUrl must be a string when present.`);
      if (p.category !== undefined && !isOneOf(p.category, PROJECT_CATEGORIES)) {
        errors.push(`${where}.category must be one of: ${PROJECT_CATEGORIES.join(', ')}.`);
      }
      if (p.relationship !== undefined && !isOneOf(p.relationship, PROJECT_RELATIONSHIPS)) {
        errors.push(`${where}.relationship must be one of: ${PROJECT_RELATIONSHIPS.join(', ')}.`);
      }
      if (p.status !== undefined && typeof p.status !== 'string') errors.push(`${where}.status must be a string when present.`);
      if (p.visibility !== undefined && !isOneOf(p.visibility, VISIBILITIES)) {
        errors.push(`${where}.visibility must be one of: ${VISIBILITIES.join(', ')}.`);
      }
      if (p.externalUrl !== undefined && typeof p.externalUrl !== 'string') errors.push(`${where}.externalUrl must be a string when present.`);
      if (p.caseStudy !== undefined) {
        if (!isObject(p.caseStudy)) {
          errors.push(`${where}.caseStudy must be an object when present.`);
        } else {
          for (const [key, value] of Object.entries(p.caseStudy)) {
            if (!(CASE_STUDY_SECTIONS as readonly string[]).includes(key)) {
              errors.push(`${where}.caseStudy.${key} is not a known section.`);
            } else if (typeof value !== 'string') {
              errors.push(`${where}.caseStudy.${key} must be a string.`);
            }
          }
        }
      }
      if (p.images !== undefined) {
        if (!Array.isArray(p.images)) {
          errors.push(`${where}.images must be an array when present.`);
        } else {
          p.images.forEach((img, j) => {
            const iw = `${where}.images[${j}]`;
            if (!isObject(img)) {
              errors.push(`${iw} must be an object.`);
              return;
            }
            if (typeof img.url !== 'string' || img.url.trim() === '') errors.push(`${iw}.url must be a non-empty string.`);
            else if (!isAllowedImageUrl(img.url)) errors.push(`${iw}.url must be a same-origin path or an https URL.`);
            if (typeof img.alt !== 'string' || img.alt.trim() === '') errors.push(`${iw}.alt must be a non-empty string.`);
            if (img.caption !== undefined && typeof img.caption !== 'string') errors.push(`${iw}.caption must be a string when present.`);
            if (!isOneOf(img.kind, IMAGE_KINDS)) errors.push(`${iw}.kind must be one of: ${IMAGE_KINDS.join(', ')}.`);
          });
        }
      }
    });
  }

  // ── experience ─────────────────────────────────────────────────────────
  // Absent on legacy data — treated as an empty list.
  const experience = input.experience;
  if (experience !== undefined) {
    if (!Array.isArray(experience)) {
      errors.push('experience must be an array.');
    } else {
      const seenIds = new Set<string>();
      experience.forEach((x, i) => {
        const where = `experience[${i}]`;
        if (!isObject(x)) {
          errors.push(`${where} must be an object.`);
          return;
        }
        if (typeof x.id !== 'string' || x.id.trim() === '') {
          errors.push(`${where}.id must be a non-empty string.`);
        } else if (seenIds.has(x.id)) {
          errors.push(`Duplicate experience id "${x.id}" — ids must be unique.`);
        } else {
          seenIds.add(x.id);
        }
        if (typeof x.role !== 'string' || x.role.trim() === '') errors.push(`${where}.role must be a non-empty string.`);
        if (typeof x.company !== 'string' || x.company.trim() === '') errors.push(`${where}.company must be a non-empty string.`);
        if (typeof x.start !== 'string') errors.push(`${where}.start must be a string.`);
        if (typeof x.end !== 'string') errors.push(`${where}.end must be a string.`);
        if (typeof x.description !== 'string') errors.push(`${where}.description must be a string.`);
        if (typeof x.order !== 'number') errors.push(`${where}.order must be a number.`);
        if (x.visibility !== undefined && !isOneOf(x.visibility, VISIBILITIES)) {
          errors.push(`${where}.visibility must be one of: ${VISIBILITIES.join(', ')}.`);
        }
      });
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  const content = input as unknown as SiteContent;
  return { ok: true, content: { ...content, experience: content.experience ?? [] } };
}
