import { describe, expect, it } from 'vitest';
import {
  displayStatus,
  experienceDates,
  externalHref,
  hasFactoryFeature,
  filterByCategory,
  categoryAnchorId,
  groupByCategory,
  homeHref,
  workHref,
  orderProjects,
  parseCategory,
  parseView,
  splitAbout,
  viewHref,
} from './home-view';
import type { Project } from './types';

const p = (id: string, order: number, extra: Partial<Project> = {}): Project => ({
  id,
  slug: id,
  title: id,
  tagline: '',
  description: '',
  tech: [],
  featured: false,
  order,
  ...extra,
});

describe('parseView', () => {
  it('defaults to it and rejects unknown values', () => {
    expect(parseView(undefined)).toBe('it');
    expect(parseView('nope')).toBe('it');
    expect(parseView('consultant')).toBe('consultant');
    expect(parseView(['builder', 'it'])).toBe('builder');
  });
});

describe('parseCategory / homeHref', () => {
  it('accepts only known categories', () => {
    expect(parseCategory('AI & SaaS Products')).toBe('AI & SaaS Products');
    expect(parseCategory('bogus')).toBeNull();
    expect(parseCategory(undefined)).toBeNull();
  });
  it('builds minimal hrefs', () => {
    expect(homeHref('it')).toBe('/');
    expect(homeHref('builder', null, 'work')).toBe('/?view=builder#work');
    expect(homeHref('it', 'AI & SaaS Products', 'work')).toBe('/?category=AI+%26+SaaS+Products#work');
  });
});

describe('orderProjects', () => {
  const list = [
    p('prj-prepera', 1, { featured: true }),
    p('prj-dupars-bbq', 2),
    p('prj-ai-engineering-factory', 3),
    p('prj-other', 0),
    p('prj-jpmc-legal-tech', 4),
  ];
  it('puts the view featured ids first and keeps every project', () => {
    const it = orderProjects(list, 'it').map((x) => x.id);
    expect(it.slice(0, 3)).toEqual(['prj-jpmc-legal-tech', 'prj-ai-engineering-factory', 'prj-prepera']);
    expect(it).toHaveLength(list.length);
    const c = orderProjects(list, 'consultant').map((x) => x.id);
    expect(c.slice(0, 2)).toEqual(['prj-dupars-bbq', 'prj-jpmc-legal-tech']);
    expect(c).toHaveLength(list.length);
  });
  it('does not mutate the input', () => {
    const copy = [...list];
    orderProjects(list, 'builder');
    expect(list).toEqual(copy);
  });
});

describe('filterByCategory', () => {
  it('returns everything for All and filters otherwise', () => {
    const l = [p('a', 0, { category: 'Enterprise Leadership' }), p('b', 1, { category: 'AI & SaaS Products' })];
    expect(filterByCategory(l, null)).toHaveLength(2);
    expect(filterByCategory(l, 'AI & SaaS Products').map((x) => x.id)).toEqual(['b']);
  });
});

describe('displayStatus', () => {
  it('suppresses placeholder statuses in any case', () => {
    expect(displayStatus({ status: 'Status to confirm', relationship: 'Independent Product' })).toBeNull();
    expect(displayStatus({ status: 'Delivered scope TO CONFIRM', relationship: 'Independent Product' })).toBeNull();
    expect(displayStatus({ status: '  ', relationship: 'Independent Product' })).toBeNull();
    expect(displayStatus({ relationship: 'Independent Product' })).toBeNull();
  });
  it('never shows a status on client work', () => {
    expect(displayStatus({ status: 'Live', relationship: 'Client Work' })).toBeNull();
  });
  it('keeps real statuses', () => {
    expect(displayStatus({ status: 'In Development', relationship: 'Company Product' })).toBe('In Development');
    expect(displayStatus({ status: 'MVP', relationship: 'Independent Product' })).toBe('MVP');
  });
});

describe('externalHref', () => {
  it('uses externalUrl only, http(s) only', () => {
    expect(externalHref({ externalUrl: 'https://x.com' })).toBe('https://x.com');
    expect(externalHref({ externalUrl: 'javascript:alert(1)' })).toBeNull();
    expect(externalHref({})).toBeNull();
  });
});

describe('splitAbout', () => {
  it('separates credentials and closing statement', () => {
    const r = splitAbout(['one', 'two', 'Credentials: MBA; PMP', 'Closing.']);
    expect(r).toEqual({ paragraphs: ['one', 'two'], credentials: ['MBA', 'PMP'], closing: 'Closing.' });
  });
  it('passes plain bios through', () => {
    expect(splitAbout(['a', 'b'])).toEqual({ paragraphs: ['a', 'b'], credentials: [], closing: null });
  });
});

describe('experienceDates', () => {
  it('never renders now/Present for JPMorgan', () => {
    expect(experienceDates({ start: 'July 2019', end: '', company: 'JPMorgan Chase' })).toBe('July 2019');
    expect(experienceDates({ start: 'July 2019', end: 'August 2026', company: 'JPMorgan Chase' })).toBe('July 2019–August 2026');
  });
  it('uses Present for other open roles', () => {
    expect(experienceDates({ start: '2026', end: '', company: 'Clark Strategic Systems LLC' })).toBe('2026–Present');
  });
});

describe('hasFactoryFeature', () => {
  it('is true only for views that feature the Factory', () => {
    expect(hasFactoryFeature('it')).toBe(true);
    expect(hasFactoryFeature('builder')).toBe(true);
    expect(hasFactoryFeature('consultant')).toBe(false);
  });
});

describe('custom featured order', () => {
  it('orderProjects and hasFactoryFeature honour an order argument', () => {
    const projects = [p('a', 0), p('b', 1), p('prj-ai-engineering-factory', 2)];
    const order = { it: ['b', 'a'], consultant: [], builder: ['prj-ai-engineering-factory'] };
    expect(orderProjects(projects, 'it', order).map((x) => x.id)).toEqual(['b', 'a', 'prj-ai-engineering-factory']);
    expect(orderProjects(projects, 'builder', order)[0].id).toBe('prj-ai-engineering-factory');
    expect(hasFactoryFeature('it', order)).toBe(false);
    expect(hasFactoryFeature('builder', order)).toBe(true);
  });
});

describe('workHref', () => {
  it('keeps the URL minimal and preserves view and category', () => {
    expect(workHref('it')).toBe('/work');
    expect(workHref('builder')).toBe('/work?view=builder');
    expect(workHref('it', 'AI & SaaS Products')).toBe('/work?category=AI+%26+SaaS+Products');
    expect(workHref('consultant', 'AI & SaaS Products')).toBe('/work?view=consultant&category=AI+%26+SaaS+Products');
  });
});

describe('viewHref', () => {
  it('adds no query for the default view', () => {
    expect(viewHref('/work', 'it')).toBe('/work');
    expect(viewHref('/', 'it')).toBe('/');
  });
  it('carries consultant and builder views', () => {
    expect(viewHref('/about', 'consultant')).toBe('/about?view=consultant');
    expect(viewHref('/', 'builder')).toBe('/?view=builder');
  });
});

describe('categoryAnchorId', () => {
  it('makes URL-safe ids from category names', () => {
    expect(categoryAnchorId('AI & SaaS Products')).toBe('ai-saas-products');
    expect(categoryAnchorId('Web & App Development')).toBe('web-app-development');
  });
});

describe('groupByCategory', () => {
  const list = [
    p('a', 1, { category: 'AI & SaaS Products' }),
    p('b', 2, { category: 'Enterprise Leadership' }),
    p('c', 3),
    p('d', 4, { category: 'AI & SaaS Products' }),
  ];

  it('orders groups by first appearance and keeps project order', () => {
    const g = groupByCategory(list);
    expect(g.map((x) => x.label)).toEqual(['AI & SaaS Products', 'Enterprise Leadership', 'Other work']);
    expect(g[0].projects.map((x) => x.id)).toEqual(['a', 'd']);
    expect(g[0].id).toBe('ai-saas-products');
  });

  it('puts uncategorized projects in a final Other work group and loses none', () => {
    const g = groupByCategory(list);
    expect(g[g.length - 1].projects.map((x) => x.id)).toEqual(['c']);
    expect(g.flatMap((x) => x.projects)).toHaveLength(list.length);
  });

  it('renders no group for an empty category and no Other group when all are categorized', () => {
    expect(groupByCategory([])).toEqual([]);
    expect(groupByCategory([p('a', 1, { category: 'Enterprise Leadership' })]).map((x) => x.label)).toEqual(['Enterprise Leadership']);
  });
});
