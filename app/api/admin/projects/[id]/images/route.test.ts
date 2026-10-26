import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  isAuthenticated: vi.fn(),
  getRedis: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  get: vi.fn(),
  set: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({ isAuthenticated: m.isAuthenticated }));
vi.mock('@/lib/content', () => ({ getRedis: m.getRedis }));
vi.mock('@vercel/blob', () => ({ put: m.put, del: m.del }));

import { POST, PATCH, DELETE } from './route';

const HOST = 'https://qdghepacnxxksvfb.public.blob.vercel-storage.com';
const A = `${HOST}/projects/p1/image-a.png`;
const B = `${HOST}/projects/p1/image-b.png`;
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3];

function content(project: Record<string, unknown> = {}) {
  return {
    projects: [
      { id: 'p1', slug: 'one', title: 'One', tagline: '', description: '', tech: [], image: '', featured: false, order: 0, ...project },
    ],
    about: { name: 'N', title: 'T', heroTagline: '', availableForWork: true, bio: [], skills: [] },
    contact: { email: 'a@b.co', githubUrl: '', linkedinUrl: '' },
    experience: [],
  };
}
const img = (url: string) => ({ url, alt: 'alt', kind: 'screenshot' });
const ctx = (id = 'p1') => ({ params: Promise.resolve({ id }) });
const written = () => JSON.parse(m.set.mock.calls[0][1]);

function upload(bytes: number[] | Uint8Array, extra: Record<string, string> = {}) {
  const form = new FormData();
  form.append('file', new File([new Uint8Array(bytes)], 'x.png', { type: 'image/png' }));
  for (const [k, v] of Object.entries(extra)) form.append(k, v);
  return new NextRequest('http://localhost/api/admin/projects/p1/images', { method: 'POST', body: form });
}
const json = (method: string, body: unknown) =>
  new NextRequest('http://localhost/api/admin/projects/p1/images', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  m.isAuthenticated.mockResolvedValue(true);
  m.getRedis.mockReturnValue({ get: m.get, set: m.set });
  m.get.mockResolvedValue(JSON.stringify(content()));
  m.set.mockResolvedValue('OK');
  m.put.mockResolvedValue({ url: A });
  m.del.mockResolvedValue(undefined);
});

describe('auth', () => {
  it('returns 401 on every method without touching KV or Blob', async () => {
    m.isAuthenticated.mockResolvedValue(false);
    const results = [
      await POST(upload(PNG), ctx()),
      await PATCH(json('PATCH', { urls: [] }), ctx()),
      await DELETE(json('DELETE', { url: A }), ctx()),
    ];
    expect(results.map((r) => r.status)).toEqual([401, 401, 401]);
    expect(m.getRedis).not.toHaveBeenCalled();
    expect(m.put).not.toHaveBeenCalled();
    expect(m.del).not.toHaveBeenCalled();
  });
});

describe('POST', () => {
  it('uploads to the project folder and appends the image, syncing the cover', async () => {
    const res = await POST(upload(PNG, { alt: 'Dashboard' }), ctx());
    expect(res.status).toBe(200);
    const [path, , opts] = m.put.mock.calls[0];
    expect(path).toBe('projects/p1/image.png');
    expect(opts).toMatchObject({ access: 'public', addRandomSuffix: true, contentType: 'image/png' });
    const saved = written().projects[0];
    expect(saved.images).toEqual([{ url: A, alt: 'Dashboard', kind: 'screenshot' }]);
    expect(saved.image).toBe(A);
    expect(await res.json()).toEqual({ images: saved.images, image: A });
  });

  it('seeds images from a legacy-only project first', async () => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: '/projects/one.png' })));
    await POST(upload(PNG), ctx());
    const saved = written().projects[0];
    expect(saved.images.map((i: { url: string }) => i.url)).toEqual(['/projects/one.png', A]);
    expect(saved.image).toBe('/projects/one.png');
  });

  it('rejects oversize, non-image and SVG bytes before any Blob call', async () => {
    const big = new Uint8Array(4 * 1024 * 1024 + 1);
    big.set(PNG);
    const svg = [...'<svg xmlns="http://www.w3.org/2000/svg"/>'].map((c) => c.charCodeAt(0));
    for (const bytes of [big, new Uint8Array([1, 2, 3]), svg]) {
      expect((await POST(upload(bytes), ctx())).status).toBe(400);
    }
    expect(m.put).not.toHaveBeenCalled();
    expect(m.set).not.toHaveBeenCalled();
  });

  it('rejects a bad kind and a missing file', async () => {
    expect((await POST(upload(PNG, { kind: 'photo' }), ctx())).status).toBe(400);
    const empty = new NextRequest('http://localhost/x', { method: 'POST', body: new FormData() });
    expect((await POST(empty, ctx())).status).toBe(400);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown project, and 400 for a malformed id', async () => {
    expect((await POST(upload(PNG), ctx('nope'))).status).toBe(404);
    expect((await POST(upload(PNG), ctx('a/b'))).status).toBe(400);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('deletes the uploaded blob when the KV write fails', async () => {
    m.set.mockRejectedValue(new Error('kv down'));
    const res = await POST(upload(PNG), ctx());
    expect(res.status).toBe(500);
    expect(m.del).toHaveBeenCalledWith(A);
  });
});

describe('PATCH', () => {
  beforeEach(() => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: A, images: [img(A), img(B)] })));
  });

  it('reorders and updates the cover', async () => {
    const res = await PATCH(json('PATCH', { urls: [B, A] }), ctx());
    expect(res.status).toBe(200);
    const saved = written().projects[0];
    expect(saved.images.map((i: { url: string }) => i.url)).toEqual([B, A]);
    expect(saved.image).toBe(B);
  });

  it.each([[[A]], [[A, A]], [[A, 'https://x.example/z.png']], [[A, B, B]]])('rejects non-permutation %j', async (urls) => {
    expect((await PATCH(json('PATCH', { urls }), ctx())).status).toBe(400);
    expect(m.set).not.toHaveBeenCalled();
  });
});

describe('DELETE', () => {
  it('writes KV before deleting a project blob', async () => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: A, images: [img(A), img(B)] })));
    const order: string[] = [];
    m.set.mockImplementation(async () => { order.push('set'); });
    m.del.mockImplementation(async () => { order.push('del'); });
    const res = await DELETE(json('DELETE', { url: A }), ctx());
    expect(res.status).toBe(200);
    expect(order).toEqual(['set', 'del']);
    expect(m.del).toHaveBeenCalledWith(A);
    expect(written().projects[0].image).toBe(B);
  });

  it('only unlists a legacy path and never deletes files', async () => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: '/projects/one.png' })));
    const res = await DELETE(json('DELETE', { url: '/projects/one.png' }), ctx());
    expect(res.status).toBe(200);
    expect(m.del).not.toHaveBeenCalled();
    expect(written().projects[0].image).toBe('');
  });

  it('retry of an already-unlisted project blob just deletes it', async () => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: B, images: [img(B)] })));
    const res = await DELETE(json('DELETE', { url: A }), ctx());
    expect(res.status).toBe(200);
    expect(m.set).not.toHaveBeenCalled();
    expect(m.del).toHaveBeenCalledWith(A);
  });

  it('404s on a foreign url without deleting', async () => {
    const res = await DELETE(json('DELETE', { url: `${HOST}/projects/other/x.png` }), ctx());
    expect(res.status).toBe(404);
    expect(m.del).not.toHaveBeenCalled();
  });

  it('reports a storage failure after the KV write', async () => {
    m.get.mockResolvedValue(JSON.stringify(content({ image: A, images: [img(A)] })));
    m.del.mockRejectedValue(new Error('blob down'));
    const res = await DELETE(json('DELETE', { url: A }), ctx());
    expect(res.status).toBe(500);
    expect(m.set).toHaveBeenCalled();
    expect((await res.json()).error).toMatch(/removed from the project/);
  });
});

describe('store failures fail closed', () => {
  it('500 when KV is not configured', async () => {
    m.getRedis.mockReturnValue(null);
    expect((await PATCH(json('PATCH', { urls: [] }), ctx())).status).toBe(500);
  });
  it('500 when the read throws or the key is empty', async () => {
    m.get.mockRejectedValueOnce(new Error('x'));
    expect((await PATCH(json('PATCH', { urls: [] }), ctx())).status).toBe(500);
    m.get.mockResolvedValueOnce(null);
    expect((await PATCH(json('PATCH', { urls: [] }), ctx())).status).toBe(500);
    expect(m.set).not.toHaveBeenCalled();
  });
});
