import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import data from '../content/data.json';
import { publicProjectBySlug, publicProjects } from './content';
import { CASE_STUDY_SECTIONS, type Project, type SiteContent, type View } from './types';
import { validateSiteContent } from './validate';
import {
  FEATURED_ORDER,
  groupByCategory,
  legacySlugRedirect,
  orderProjects,
  previewProjects,
  VIEWS,
} from './home-view';

const content = data as unknown as SiteContent;
const projects = content.projects;
const workOrder = content.home!.workOrder!;
const SIX = [
  ['prj-jpmc-operating-model', 'jpmorgan-operating-model-transformation', 'Enterprise Leadership', true],
  ['prj-jpmc-strategy-operations', 'jpmorgan-strategy-portfolio-governance', 'Enterprise Leadership', true],
  ['prj-jpmc-ai-strategy', 'jpmorgan-ai-strategy-governance', 'AI Strategy & Governance', true],
  ['prj-jpmc-decision-support', 'jpmorgan-executive-decision-support', 'Enterprise Leadership', false],
  ['prj-jpmc-workforce-talent', 'jpmorgan-workforce-strategy-talent', 'Enterprise Leadership', false],
  ['prj-jpmc-delivery-governance', 'jpmorgan-pmo-delivery-governance', 'Enterprise Leadership', false],
] as const;
const IDS = SIX.map((s) => s[0]);
const byId = (id: string) => projects.find((p) => p.id === id) as Project;

describe('content validates', () => {
  it('content/data.json passes validateSiteContent', () => {
    expect(validateSiteContent(content).ok).toBe(true);
  });
});

describe('AC1/AC2: six JPMorgan leadership records', () => {
  it.each(SIX)('%s has the required attributes and sections', (id, slug, category, featured) => {
    const p = byId(id);
    expect(p).toBeDefined();
    expect(p.slug).toBe(slug);
    expect(p.category).toBe(category);
    expect(p.featured).toBe(featured);
    expect(p.relationship).toBe('Employment');
    expect(p.status).toBe('Historical role');
    expect(p.visibility).toBe('public');
    expect(p.tech).toEqual([]);
    expect(p.images).toEqual([]);
    expect(p.image).toBe('');
    expect(p.cardCta).toEqual({ label: 'View Leadership Case Study' });
    expect(p.caseStudy?.role).toBe('Vice President, Chief of Staff — Strategy & Execution, Legal Technology, JPMorgan Chase');
    expect(p.caseStudy?.dates).toBe('July 2019–August 2026');
    expect(p.tagline.trim()).not.toBe('');
    for (const k of ['challenge', 'responsibility', 'keyDecisions', 'delivered', 'outcome', 'evidence'] as const) {
      expect((p.caseStudy?.[k] ?? '').trim(), k).not.toBe('');
    }
    expect(p.caseStudy?.intro).toBeUndefined();
  });

  it('keeps the legacy record hidden and unchanged', () => {
    const main = JSON.parse(readFileSync(new URL('./__fixtures__/legacy-legal-tech.json', import.meta.url), 'utf8'));
    const legacy = byId('prj-jpmc-legal-tech');
    expect(legacy.visibility).toBe('hidden');
    expect(legacy).toEqual(main);
  });
});

describe('strategic decisions are bold-lead paragraphs without list markup', () => {
  it.each(IDS)('%s keyDecisions', (id) => {
    const kd = byId(id).caseStudy?.keyDecisions ?? '';
    for (const line of kd.split('\n')) expect(/^\s*[-*\u2022]/.test(line) && !line.startsWith('**'), `${id}: list line "${line}"`).toBe(false);
    for (const para of kd.split(/\n\s*\n/)) expect(para.trim().startsWith('**'), `${id}: paragraph "${para.slice(0, 40)}"`).toBe(true);
  });
});

describe('AC3: content rules', () => {
  const banned: [string, RegExp][] = [
    ['$', /\$/], ['%', /%/], ['digit products', /\d\s*products/i], ['164', /164/], ['nine', /\bnine\b/i],
    ['seven products', /seven products/i], ['employer-confidential', /employer-confidential/i],
    ['Figures are omitted', /Figures are omitted/i], ['hands-on', /hands-on/i], ['transformational', /transformational/i],
    ['optimiz', /optimiz/i], ['[Owner', /\[Owner/], ['[GAP', /\[GAP/], ['P- tag', /\bP-\d*/], ['AWS', /\bAWS\b/],
    ['independent products', /Prepera|AuthMatch|SanctionsWatch|Gen4Me|\bG2\b|Factory|Regulatory Intelligence|Governance Platform/],
  ];
  it.each(IDS)('%s has no banned content', (id) => {
    const p = byId(id);
    const text = [p.tagline, p.description, ...Object.values(p.caseStudy ?? {})].join('\n');
    for (const [name, re] of banned) expect(re.test(text), `${id}: ${name}`).toBe(false);
  });
});

describe('AC4: featured lists', () => {
  it('IT starts with A, B, C in data.json and FEATURED_ORDER', () => {
    expect(workOrder.it.slice(0, 3)).toEqual(IDS.slice(0, 3));
    expect(FEATURED_ORDER.it.slice(0, 3)).toEqual(IDS.slice(0, 3));
  });
  it('D, E, F are in no featured list and not in the IT preview', () => {
    const def = IDS.slice(3);
    for (const v of VIEWS) {
      for (const id of def) {
        expect(FEATURED_ORDER[v]).not.toContain(id);
        expect(workOrder[v]).not.toContain(id);
      }
    }
    const preview = previewProjects(orderProjects(publicProjects(projects), 'it'), 3, false);
    expect(preview.map((p) => p.id)).toEqual(IDS.slice(0, 3));
  });
  it('consultant and builder lists are unchanged from origin/main', () => {
    const main = JSON.parse(readFileSync(new URL('./__fixtures__/main-work-order.json', import.meta.url), 'utf8'));
    for (const v of ['consultant', 'builder'] as View[]) {
      expect(workOrder[v]).toEqual(main[v]);
      expect(FEATURED_ORDER[v]).toEqual(main[v]);
    }
  });
});

describe('AC5: /work grouping and next order', () => {
  it.each(VIEWS)('view %s lists the six in order within their groups', (view) => {
    const groups = groupByCategory(orderProjects(publicProjects(projects), view));
    const ent = groups.find((g) => g.label === 'Enterprise Leadership');
    const ai = groups.find((g) => g.label === 'AI Strategy & Governance');
    expect(ent?.projects.map((p) => p.id)).toEqual([IDS[0], IDS[1], IDS[3], IDS[4], IDS[5]]);
    expect(ai?.projects[0].id).toBe(IDS[2]);
  });
  it('public array order walks A to F for the next link', () => {
    const pub = publicProjects(projects).map((p) => p.id);
    const start = pub.indexOf(IDS[0]);
    expect(pub.slice(start, start + 6)).toEqual([...IDS]);
  });
});

describe('AC6: routing', () => {
  it('legacy slug redirects and all six slugs resolve', () => {
    expect(legacySlugRedirect('jpmorgan-legal-technology')).toBe('jpmorgan-strategy-portfolio-governance');
    expect(publicProjectBySlug(projects, 'jpmorgan-legal-technology')).toBeUndefined();
    for (const s of SIX) expect(publicProjectBySlug(projects, s[1])?.id).toBe(s[0]);
  });
});

describe('evidence section', () => {
  it('is a known case-study section placed after outcome', () => {
    const i = CASE_STUDY_SECTIONS.indexOf('outcome');
    expect(CASE_STUDY_SECTIONS[i + 1]).toBe('evidence');
    expect(CASE_STUDY_SECTIONS[i + 2]).toBe('learned');
  });
});

describe('exp-jpmc', () => {
  it('carries the approved description', () => {
    const e = content.experience.find((x) => x.id === 'exp-jpmc');
    expect(e?.description).toBe(
      "Owned Legal Technology's annual strategy cycle and multi-year roadmap and directed annual financial and workforce planning across a global technology portfolio. Led the redesign of the product operating model, developed and operationalized the AI strategy and governance model, and prepared executive strategy materials and decision support for senior Legal and Technology leadership.",
    );
  });
});

describe('quick facts on the six records', () => {
  const FP = 'Teams in the US, UK and India';
  const FACTS: Record<string, [string, string[]]> = {
    'prj-jpmc-operating-model': ['9 partner functions aligned', ['Enterprise Transformation', 'Technology Strategy']],
    'prj-jpmc-strategy-operations': ['Annual cycle \u00b7 multi-year roadmap', ['Technology Strategy', 'Technology Business Operations']],
    'prj-jpmc-ai-strategy': ['8 evaluation considerations \u00b7 4-step governance lifecycle', ['AI Strategy', 'Technology Strategy']],
    'prj-jpmc-decision-support': ['Annual \u00b7 quarterly \u00b7 monthly reviews', ['Technology Business Operations', 'Technology Strategy']],
    'prj-jpmc-workforce-talent': ['Annual plan \u00b7 4 scenario types', ['Technology Business Operations', 'Technology Strategy']],
    'prj-jpmc-delivery-governance': ['Led PMs, Scrum Masters and BAs', ['Technology Business Operations', 'Enterprise Transformation']],
  };
  it.each(Object.entries(FACTS))('%s carries footprint, scale and relevantTo', (id, [scale, relevantTo]) => {
    const cs = byId(id).caseStudy!;
    expect(cs.footprint).toBe(FP);
    expect(cs.scale).toBe(scale);
    expect(cs.relevantTo).toEqual(relevantTo);
  });

  it('AI strategy record uses first person in keyDecisions and description', () => {
    const p = byId('prj-jpmc-ai-strategy');
    for (const text of [p.caseStudy!.keyDecisions!, p.description]) {
      expect(text).toContain('I evaluated each opportunity');
      expect(text).toContain('I compared opportunities');
      expect(text).not.toContain('We evaluated');
      expect(text).not.toContain('We compared');
    }
  });
});
