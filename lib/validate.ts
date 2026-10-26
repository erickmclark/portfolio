import type { SiteContent } from './types';
import { isAbsoluteHttpsUrl, isAllowedImageUrl } from './image-url';
import { CONTACT_INTENT_IDS } from './contact';
import {
  CASE_STUDY_SECTIONS,
  ICON_KEYS,
  IMAGE_KINDS,
  PROJECT_CATEGORIES,
  PROJECT_RELATIONSHIPS,
  VIEWS,
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

/** Display string: non-empty and already trimmed. */
function isText(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== '' && v === v.trim();
}

/** `#fragment`, a same-origin path, an absolute https URL, or (when allowed) the literal `resume`. */
function isAllowedHref(v: unknown, allowResume = false): boolean {
  if (!isText(v)) return false;
  if (allowResume && v === 'resume') return true;
  if (v.startsWith('#')) return v.length > 1;
  return isAllowedImageUrl(v);
}

function hasExactKeys(v: Record<string, unknown>, keys: readonly string[]): boolean {
  const have = Object.keys(v);
  return have.length === keys.length && keys.every((k) => have.includes(k));
}

function validateTexts(obj: Record<string, unknown>, keys: readonly string[], where: string, errors: string[]) {
  for (const k of keys) {
    if (!isText(obj[k])) errors.push(`${where}.${k} must be a non-empty trimmed string.`);
  }
}

function validateCta(v: unknown, where: string, errors: string[], allowResume = false) {
  if (!isObject(v)) {
    errors.push(`${where} must be an object.`);
    return;
  }
  if (!isText(v.label)) errors.push(`${where}.label must be a non-empty trimmed string.`);
  if (!isAllowedHref(v.href, allowResume)) {
    errors.push(`${where}.href must be a #fragment, a same-origin path or an https URL${allowResume ? ' (or "resume")' : ''}.`);
  }
}

/** Returns the record when it has exactly the three view keys; otherwise records an error. */
function viewRecord(v: unknown, where: string, errors: string[]): Record<string, unknown> | null {
  if (!isObject(v) || !hasExactKeys(v, VIEWS)) {
    errors.push(`${where} must be an object with exactly the keys: ${VIEWS.join(', ')}.`);
    return null;
  }
  return v;
}

function validateUniqueTitles(items: unknown[], where: string, errors: string[]) {
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (!isObject(it) || !isText(it.title)) return;
    if (seen.has(it.title)) errors.push(`${where}[${i}].title "${it.title}" is duplicated — titles must be unique.`);
    seen.add(it.title);
  });
}

function validateTitleBodyList(v: unknown, where: string, errors: string[], opts: { exact?: number; min?: number; unique?: boolean }) {
  if (!Array.isArray(v)) {
    errors.push(`${where} must be an array.`);
    return;
  }
  if (opts.exact !== undefined && v.length !== opts.exact) errors.push(`${where} must have exactly ${opts.exact} items.`);
  if (opts.min !== undefined && v.length < opts.min) errors.push(`${where} must have at least ${opts.min} item.`);
  v.forEach((it, i) => {
    if (!isObject(it)) {
      errors.push(`${where}[${i}] must be an object.`);
      return;
    }
    validateTexts(it, ['title', 'body'], `${where}[${i}]`, errors);
  });
  if (opts.unique) validateUniqueTitles(v, where, errors);
}

function validateHome(home: unknown, errors: string[]) {
  if (!isObject(home)) {
    errors.push('home must be an object when present.');
    return;
  }
  validateTexts(home, ['profileLine', 'selectorLabel'], 'home', errors);

  const labels = viewRecord(home.viewLabels, 'home.viewLabels', errors);
  if (labels) for (const v of VIEWS) if (!isText(labels[v])) errors.push(`home.viewLabels.${v} must be a non-empty trimmed string.`);

  const hero = viewRecord(home.hero, 'home.hero', errors);
  if (hero) {
    for (const v of VIEWS) {
      const h = hero[v];
      const where = `home.hero.${v}`;
      if (!isObject(h)) {
        errors.push(`${where} must be an object.`);
        continue;
      }
      validateTexts(h, ['h1', 'body'], where, errors);
      validateCta(h.primary, `${where}.primary`, errors, true);
      validateCta(h.secondary, `${where}.secondary`, errors, true);
      if (h.tertiary !== undefined) validateCta(h.tertiary, `${where}.tertiary`, errors);
      if (h.tertiaryExternal !== undefined && typeof h.tertiaryExternal !== 'boolean') {
        errors.push(`${where}.tertiaryExternal must be a boolean when present.`);
      }
    }
  }

  const head = home.capabilitiesHead;
  if (!isObject(head)) errors.push('home.capabilitiesHead must be an object.');
  else validateTexts(head, ['eyebrow', 'heading', 'lede'], 'home.capabilitiesHead', errors);

  const caps = viewRecord(home.capabilities, 'home.capabilities', errors);
  if (caps) {
    for (const v of VIEWS) {
      const list = caps[v];
      const where = `home.capabilities.${v}`;
      if (!Array.isArray(list)) {
        errors.push(`${where} must be an array.`);
        continue;
      }
      if (list.length !== 7) errors.push(`${where} must have exactly 7 capabilities.`);
      let bands = 0;
      list.forEach((c, i) => {
        const cw = `${where}[${i}]`;
        if (!isObject(c)) {
          errors.push(`${cw} must be an object.`);
          return;
        }
        validateTexts(c, ['title', 'body'], cw, errors);
        if (!isOneOf(c.icon, ICON_KEYS)) errors.push(`${cw}.icon must be one of: ${ICON_KEYS.join(', ')}.`);
        if (c.band !== undefined && typeof c.band !== 'boolean') errors.push(`${cw}.band must be a boolean when present.`);
        if (c.band === true) bands++;
      });
      if (bands !== 1) errors.push(`${where} must have exactly one capability with band: true.`);
      validateUniqueTitles(list, where, errors);
    }
  }

  const approach = home.approach;
  if (!isObject(approach)) {
    errors.push('home.approach must be an object.');
  } else {
    validateTexts(approach, ['eyebrow', 'heading', 'intro', 'cta'], 'home.approach', errors);
    validateTitleBodyList(approach.steps, 'home.approach.steps', errors, { min: 1 });
  }

  const work = home.work;
  if (!isObject(work)) errors.push('home.work must be an object.');
  else validateTexts(work, ['eyebrow', 'heading', 'intro'], 'home.work', errors);

  const order = viewRecord(home.workOrder, 'home.workOrder', errors);
  if (order) {
    for (const v of VIEWS) {
      const list = order[v];
      const where = `home.workOrder.${v}`;
      if (!Array.isArray(list)) {
        errors.push(`${where} must be an array of project ids.`);
        continue;
      }
      const seen = new Set<string>();
      list.forEach((id, i) => {
        if (!isText(id)) errors.push(`${where}[${i}] must be a non-empty trimmed string.`);
        else if (seen.has(id)) errors.push(`${where}[${i}] "${id}" is duplicated — ids must be unique.`);
        else seen.add(id);
      });
    }
  }

  const pov = home.pointOfView;
  if (!isObject(pov)) {
    errors.push('home.pointOfView must be an object.');
  } else {
    validateTexts(pov, ['eyebrow', 'heading'], 'home.pointOfView', errors);
    validateTitleBodyList(pov.principles, 'home.pointOfView.principles', errors, { exact: 3, unique: true });
  }

  const about = home.about;
  if (!isObject(about)) errors.push('home.about must be an object.');
  else validateTexts(about, ['eyebrow', 'heading', 'closingLabel'], 'home.about', errors);

  if (!Array.isArray(home.toolkit)) {
    errors.push('home.toolkit must be an array.');
  } else {
    const seen = new Set<string>();
    home.toolkit.forEach((g, i) => {
      const where = `home.toolkit[${i}]`;
      if (!isObject(g)) {
        errors.push(`${where} must be an object.`);
        return;
      }
      if (!isText(g.group)) errors.push(`${where}.group must be a non-empty trimmed string.`);
      else if (seen.has(g.group)) errors.push(`${where}.group "${g.group}" is duplicated — group names must be unique.`);
      else seen.add(g.group);
      if (!isStringArray(g.items)) errors.push(`${where}.items must be an array of strings.`);
    });
  }

  const exp = home.experience;
  if (!isObject(exp)) errors.push('home.experience must be an object.');
  else validateTexts(exp, ['eyebrow', 'heading', 'cta'], 'home.experience', errors);
}

function validateSite(site: unknown, errors: string[]) {
  if (!isObject(site)) {
    errors.push('site must be an object when present.');
    return;
  }
  const footer = site.footer;
  if (!isObject(footer)) errors.push('site.footer must be an object.');
  else validateTexts(footer, ['name', 'descriptor', 'line', 'location', 'availability', 'copyright'], 'site.footer', errors);

  const privacy = site.privacy;
  if (!isObject(privacy)) {
    errors.push('site.privacy must be an object.');
  } else {
    validateTexts(privacy, ['eyebrow', 'title', 'intro'], 'site.privacy', errors);
    if (!Array.isArray(privacy.sections)) {
      errors.push('site.privacy.sections must be an array.');
    } else {
      const seen = new Set<string>();
      privacy.sections.forEach((sec, i) => {
        const where = `site.privacy.sections[${i}]`;
        if (!isObject(sec)) {
          errors.push(`${where} must be an object.`);
          return;
        }
        if (typeof sec.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(sec.id)) {
          errors.push(`${where}.id must match ^[a-z][a-z0-9-]*$.`);
        } else if (seen.has(sec.id)) {
          errors.push(`${where}.id "${sec.id}" is duplicated — ids must be unique.`);
        } else {
          seen.add(sec.id);
        }
        if (!isText(sec.title)) errors.push(`${where}.title must be a non-empty trimmed string.`);
        if (!Array.isArray(sec.paragraphs)) errors.push(`${where}.paragraphs must be an array of strings.`);
        else sec.paragraphs.forEach((para, j) => {
          if (!isText(para)) errors.push(`${where}.paragraphs[${j}] must be a non-empty trimmed string.`);
        });
      });
    }
  }

  const nf = site.notFound;
  if (!isObject(nf)) errors.push('site.notFound must be an object.');
  else validateTexts(nf, ['eyebrow', 'heading', 'body', 'cta'], 'site.notFound', errors);

  const seo = site.seo;
  if (!isObject(seo)) {
    errors.push('site.seo must be an object.');
  } else {
    for (const k of ['home', 'contact', 'privacy']) {
      const e = seo[k];
      if (!isObject(e)) errors.push(`site.seo.${k} must be an object.`);
      else validateTexts(e, ['title', 'description'], `site.seo.${k}`, errors);
    }
  }
}

function validateContactPage(page: unknown, errors: string[]) {
  if (!isObject(page)) {
    errors.push('contactPage must be an object when present.');
    return;
  }
  validateTexts(page, ['heading', 'intro'], 'contactPage', errors);
  const topics = page.topics;
  if (!isObject(topics) || !hasExactKeys(topics, CONTACT_INTENT_IDS)) {
    errors.push(`contactPage.topics must be an object with exactly the keys: ${CONTACT_INTENT_IDS.join(', ')}.`);
  } else {
    for (const id of CONTACT_INTENT_IDS) {
      if (!isText(topics[id])) errors.push(`contactPage.topics.${id} must be a non-empty trimmed string.`);
    }
  }
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
    else if (about.photo !== undefined && about.photo !== '' && !isAllowedImageUrl(about.photo)) errors.push('about.photo must be a same-origin path or an https URL.');
    if (about.resumeUrl !== undefined && typeof about.resumeUrl !== 'string') errors.push('about.resumeUrl must be a string when present.');
    else if (about.resumeUrl !== undefined && about.resumeUrl !== '' && !isAllowedImageUrl(about.resumeUrl)) errors.push('about.resumeUrl must be a same-origin path or an https URL.');
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
      else if (typeof p.externalUrl === 'string' && p.externalUrl !== '' && !isAbsoluteHttpsUrl(p.externalUrl)) errors.push(`${where}.externalUrl must be an absolute https URL.`);
      if (p.cardCta !== undefined) {
        if (!isObject(p.cardCta)) {
          errors.push(`${where}.cardCta must be an object when present.`);
        } else {
          if (!isText(p.cardCta.label)) errors.push(`${where}.cardCta.label must be a non-empty trimmed string.`);
          if (p.cardCta.href !== undefined && !isAllowedHref(p.cardCta.href)) {
            errors.push(`${where}.cardCta.href must be a #fragment, a same-origin path or an https URL when present.`);
          }
        }
      }
      if (p.cardSecondaryCta !== undefined) validateCta(p.cardSecondaryCta, `${where}.cardSecondaryCta`, errors);
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

  // ── home / site / contactPage ──────────────────────────────────────────
  // Each group is absent (defaults apply at read time) or complete.
  if (input.home !== undefined) validateHome(input.home, errors);
  if (input.site !== undefined) validateSite(input.site, errors);
  if (input.contactPage !== undefined) validateContactPage(input.contactPage, errors);

  if (errors.length > 0) return { ok: false, errors };
  const content = input as unknown as SiteContent;
  return { ok: true, content: { ...content, experience: content.experience ?? [] } };
}
