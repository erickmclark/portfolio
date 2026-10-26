import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getRedis: vi.fn(),
  getSiteContent: vi.fn(),
  set: vi.fn(),
  list: vi.fn(),
  del: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ isAuthenticated: m.isAuthenticated }));
vi.mock('@/lib/content', () => ({ getRedis: m.getRedis, getSiteContent: m.getSiteContent }));
vi.mock('@vercel/blob', () => ({ put: vi.fn(), del: m.del, list: m.list }));
import { PUT } from './route';

function content() {
  return {
    projects: [
      {
        id: 'p1', slug: 'one', title: 'One', tagline: '', description: '', tech: [], image: '/stale.png', featured: false, order: 0,
        images: [{ url: '/projects/new.png', alt: 'a', kind: 'screenshot' }],
      },
    ],
    about: { name: 'N', title: 'T', heroTagline: '', availableForWork: true, bio: [], skills: [] },
    contact: { email: 'a@b.co', githubUrl: '', linkedinUrl: '' },
    experience: [],
  };
}
const put = (body: unknown) =>
  new NextRequest('http://localhost/api/admin/content', { method: 'PUT', body: JSON.stringify(body) });

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  m.isAuthenticated.mockResolvedValue(true);
  m.getRedis.mockReturnValue({ set: m.set });
  m.set.mockResolvedValue('OK');
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-token');
});
afterEach(() => vi.unstubAllEnvs());

describe('PUT /api/admin/content', () => {
  it('401 when unauthenticated', async () => {
    m.isAuthenticated.mockResolvedValue(false);
    expect((await PUT(put({ content: content() }))).status).toBe(401);
    expect(m.set).not.toHaveBeenCalled();
  });

  it('400 on invalid content with no write', async () => {
    expect((await PUT(put({ content: { nope: true } }))).status).toBe(400);
    expect(m.set).not.toHaveBeenCalled();
    expect(m.list).not.toHaveBeenCalled();
  });

  it('writes content with the cover synced to images[0]', async () => {
    const res = await PUT(put({ content: content() }));
    expect(res.status).toBe(200);
    expect(JSON.parse(m.set.mock.calls[0][1]).projects[0].image).toBe('/projects/new.png');
  });

  it('never lists or deletes blobs, even with the token set and a project omitted', async () => {
    const c = content();
    c.projects = [];
    expect((await PUT(put({ content: c }))).status).toBe(200);
    expect(m.set).toHaveBeenCalled();
    expect(m.list).not.toHaveBeenCalled();
    expect(m.del).not.toHaveBeenCalled();
  });
});
