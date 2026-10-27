import { describe, expect, it } from 'vitest';
import {
  APPROACH,
  CAPABILITIES,
  CONTACT,
  DEFAULT_CONTACT_PAGE,
  DEFAULT_HOME,
  DEFAULT_SITE,
  FACTORY_SECOND_CTA,
  defaultCardCtas,
  withContentDefaults,
} from './home-copy';
import { FEATURED_ORDER, VIEW_LABELS } from './home-view';
import { CONTACT_INTENTS } from './contact';
import type { SiteContent } from './types';

const base = (): SiteContent => ({
  projects: [
    { id: 'prj-ai-engineering-factory', slug: 'f', title: 'F', tagline: '', description: '', tech: [], featured: true, order: 0 },
    { id: 'prj-ai-governance-platform', slug: 'g', title: 'G', tagline: '', description: '', tech: [], featured: true, order: 1 },
    { id: 'prj-authmatch', slug: 'a', title: 'A', tagline: '', description: '', tech: [], featured: true, order: 2 },
    { id: 'prj-unknown', slug: 'u', title: 'U', tagline: '', description: '', tech: [], featured: false, order: 3 },
  ],
  about: { name: 'n', title: 't', heroTagline: '', availableForWork: true, bio: [], skills: [] },
  contact: { email: 'e@x.io', githubUrl: '', linkedinUrl: '' },
  experience: [],
});

describe('defaults', () => {
  it('equal the in-code constants and the pre-change copy', () => {
    expect(DEFAULT_HOME.capabilities).toEqual(CAPABILITIES);
    expect(DEFAULT_HOME.viewLabels).toEqual(VIEW_LABELS);
    expect(DEFAULT_HOME.workOrder).toEqual(FEATURED_ORDER);
    expect(DEFAULT_HOME.approach.steps.map((s) => s.title)).toEqual(APPROACH.steps.map((s) => s.title));
    expect(DEFAULT_CONTACT_PAGE.heading).toBe(CONTACT.heading);
    expect(DEFAULT_CONTACT_PAGE.topics).toEqual(Object.fromEntries(CONTACT_INTENTS.map((i) => [i.id, i.label])));
    expect(DEFAULT_SITE.seo.contact).toEqual({ title: 'Contact', description: CONTACT.intro });
    expect(DEFAULT_SITE.privacy.sections.map((s) => s.id)).toEqual([
      'operator', 'collected', 'use', 'providers', 'cookies', 'sensitive', 'retention', 'outside-us', 'security',
      'children', 'contact', 'changes',
    ]);
    expect(DEFAULT_SITE.privacy.sections[1].paragraphs[0]).toContain("inquiry type's questions");
    expect(DEFAULT_SITE.privacy.sections.find((x) => x.id === 'contact')?.paragraphs[0]).toBe(
      'You can ask what you have sent through this site, ask for a correction, or ask for deletion by emailing {email}. Requests are answered within 30 days.',
    );
    expect(DEFAULT_SITE.notFound).toEqual({
      eyebrow: '404',
      heading: 'Page not found',
      body: "The page you're looking for doesn't exist or may have moved.",
      cta: 'Back home',
    });
  });

  it('give every default project the card buttons spec section 6 lists', () => {
    expect(defaultCardCtas('prj-authmatch')).toEqual({ cardCta: { label: 'Explore AuthMatch AI' } });
    expect(defaultCardCtas('prj-unknown')).toEqual({ cardCta: { label: 'View case study' } });
    expect(defaultCardCtas('prj-ai-governance-platform').cardCta).toEqual({
      label: 'Request an Overview',
      href: '/contact?type=product&product=AI+Strategy+%26+Governance+Platform',
    });
    expect(defaultCardCtas('prj-ai-engineering-factory').cardSecondaryCta).toEqual(FACTORY_SECOND_CTA);
  });
});

describe('withContentDefaults', () => {
  it('fills missing groups and every project cardCta', () => {
    const out = withContentDefaults(base());
    expect(out.home).toEqual(DEFAULT_HOME);
    expect(out.site).toEqual(DEFAULT_SITE);
    expect(out.contactPage).toEqual(DEFAULT_CONTACT_PAGE);
    expect(out.projects.every((p) => p.cardCta)).toBe(true);
    expect(out.projects[0].cardSecondaryCta).toEqual(FACTORY_SECOND_CTA);
  });

  it('never overwrites a present group or cardCta', () => {
    const c = base();
    const home = structuredClone(DEFAULT_HOME);
    home.profileLine = 'Custom line';
    c.home = home;
    c.contactPage = { ...structuredClone(DEFAULT_CONTACT_PAGE), heading: 'Custom heading' };
    c.projects[2].cardCta = { label: 'Custom' };
    const out = withContentDefaults(c);
    expect(out.home.profileLine).toBe('Custom line');
    expect(out.contactPage.heading).toBe('Custom heading');
    expect(out.projects[2].cardCta).toEqual({ label: 'Custom' });
  });

  it('hands out clones: mutating a result never changes the defaults or later results', () => {
    const first = withContentDefaults(base());
    first.home.hero.it.h1 = 'mutated';
    first.home.capabilities.it.pop();
    first.site.footer.name = 'mutated';
    first.contactPage.topics.general = 'mutated';
    const second = withContentDefaults(base());
    expect(second.home.hero.it.h1).toBe(DEFAULT_HOME.hero.it.h1);
    expect(second.home.hero.it.h1).not.toBe('mutated');
    expect(second.home.capabilities.it).toHaveLength(7);
    expect(second.site.footer.name).toBe('Erick Clark, MBA, MS, PMP, PSM I');
    expect(second.contactPage.topics.general).toBe('General Inquiry');
  });

  it('does not mutate its input', () => {
    const c = base();
    withContentDefaults(c);
    expect(c.home).toBeUndefined();
    expect(c.projects[0].cardCta).toBeUndefined();
  });
});
