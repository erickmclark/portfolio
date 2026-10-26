import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getRedis: vi.fn(),
  list: vi.fn(),
  del: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ isAuthenticated: m.isAuthenticated }));
vi.mock('@/lib/content', () => ({ getRedis: m.getRedis }));
vi.mock('@vercel/blob', () => ({ list: m.list, del: m.del, put: vi.fn() }));

import { DELETE } from './route';

function project(id: string) {
  return { id, slug: id, title: id, tagline: '', description: '', tech: [], image: '', featured: false, order: 0 };
}
const content = () => ({
  projects: [project('p1'), project('p2')],
  about: { name: 'N', title: 'T', heroTagline: '', availableForWork: true, bio: [], skills: [] },
  contact: { email: 'a@b.co', githubUrl: '', linkedinUrl: '' },
  experience: [],
});
const req = () => new NextRequest('http://localhost/api/admin/projects/p1', { method: 'DELETE' });
const ctx = (id = 'p1') => ({ params: Promise.resolve({ id }) });
let order: string[];

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  order = [];
  m.isAuthenticated.mockResolvedValue(true);
  m.getRedis.mockReturnValue({ get: m.get, set: m.set });
  m.get.mockResolvedValue(JSON.stringify(content()));
  m.set.mockImplementation(async () => { order.push('set'); });
  m.list.mockImplementation(async () => { order.push('list'); return { blobs: [{ url: 'u1' }], hasMore: false }; });
  m.del.mockImplementation(async () => { order.push('del'); });
});

describe('DELETE /api/admin/projects/[id]', () => {
  it('401 with no KV or Blob calls', async () => {
    m.isAuthenticated.mockResolvedValue(false);
    expect((await DELETE(req(), ctx())).status).toBe(401);
    expect(m.getRedis).not.toHaveBeenCalled();
    expect(m.list).not.toHaveBeenCalled();
    expect(m.del).not.toHaveBeenCalled();
  });

  it('400 on a bad id with no calls', async () => {
    expect((await DELETE(req(), ctx('a/b'))).status).toBe(400);
    expect(m.get).not.toHaveBeenCalled();
    expect(m.list).not.toHaveBeenCalled();
  });

  it('writes KV without the project before touching Blob', async () => {
    const res = await DELETE(req(), ctx());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(JSON.parse(m.set.mock.calls[0][1]).projects.map((p: { id: string }) => p.id)).toEqual(['p2']);
    expect(m.list).toHaveBeenCalledWith({ prefix: 'projects/p1/', cursor: undefined });
    expect(m.del).toHaveBeenCalledWith(['u1']);
    expect(order).toEqual(['set', 'list', 'del']);
  });

  it('cleans the prefix and returns 200 when the project is not in KV', async () => {
    const res = await DELETE(req(), ctx('gone'));
    expect(res.status).toBe(200);
    expect(m.set).not.toHaveBeenCalled();
    expect(m.list).toHaveBeenCalledWith({ prefix: 'projects/gone/', cursor: undefined });
    expect(m.del).toHaveBeenCalledWith(['u1']);
  });

  it('500 with no Blob call when the KV read throws, is empty, or KV is missing', async () => {
    m.get.mockRejectedValueOnce(new Error('x'));
    expect((await DELETE(req(), ctx())).status).toBe(500);
    m.get.mockResolvedValueOnce(null);
    expect((await DELETE(req(), ctx())).status).toBe(500);
    m.getRedis.mockReturnValueOnce(null);
    expect((await DELETE(req(), ctx())).status).toBe(500);
    expect(m.set).not.toHaveBeenCalled();
    expect(m.list).not.toHaveBeenCalled();
    expect(m.del).not.toHaveBeenCalled();
  });

  it('500 after the write when blob deletion fails', async () => {
    m.del.mockRejectedValue(new Error('blob down'));
    const res = await DELETE(req(), ctx());
    expect(res.status).toBe(500);
    expect(m.set).toHaveBeenCalled();
    expect((await res.json()).error).toMatch(/project was deleted, but removing its images failed/);
  });
});
