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

import { POST } from './route';

const URL_ = 'https://x.public.blob.vercel-storage.com/projects/_about/photo-abc.png';
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3];
const PDF = [...'%PDF-1.7'].map((c) => c.charCodeAt(0));

function content() {
  return {
    projects: [],
    about: { name: 'N', title: 'T', heroTagline: '', availableForWork: true, bio: [], skills: [], photo: '/profile.png' },
    contact: { email: 'a@b.co', githubUrl: '', linkedinUrl: '' },
    experience: [],
  };
}
function req(fields: { kind?: string; bytes?: number[] | Uint8Array; type?: string }) {
  const form = new FormData();
  if (fields.kind) form.append('kind', fields.kind);
  if (fields.bytes) form.append('file', new File([new Uint8Array(fields.bytes)], 'f', { type: fields.type ?? 'image/png' }));
  return new NextRequest('http://localhost/api/admin/about/assets', { method: 'POST', body: form });
}

beforeEach(() => {
  Object.values(m).forEach((f) => f.mockReset());
  m.isAuthenticated.mockResolvedValue(true);
  m.getRedis.mockReturnValue({ get: m.get, set: m.set });
  m.get.mockResolvedValue(JSON.stringify(content()));
  m.set.mockResolvedValue('OK');
  m.put.mockResolvedValue({ url: URL_ });
  m.del.mockResolvedValue(undefined);
});

describe('POST /api/admin/about/assets', () => {
  it('401s without a session and touches nothing', async () => {
    m.isAuthenticated.mockResolvedValue(false);
    const res = await POST(req({ kind: 'photo', bytes: PNG }));
    expect(res.status).toBe(401);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('rejects a bad kind and a missing file', async () => {
    expect((await POST(req({ kind: 'x', bytes: PNG }))).status).toBe(400);
    expect((await POST(req({ kind: 'photo' }))).status).toBe(400);
  });

  it('rejects a non-image photo by magic bytes despite an image MIME type', async () => {
    const res = await POST(req({ kind: 'photo', bytes: PDF, type: 'image/png' }));
    expect(res.status).toBe(400);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('rejects a non-PDF resume despite a pdf MIME type', async () => {
    const res = await POST(req({ kind: 'resume', bytes: PNG, type: 'application/pdf' }));
    expect(res.status).toBe(400);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('enforces size limits', async () => {
    const bigPhoto = new Uint8Array(4 * 1024 * 1024 + 1);
    bigPhoto.set(PNG);
    expect((await POST(req({ kind: 'photo', bytes: bigPhoto }))).status).toBe(400);
    const bigPdf = new Uint8Array(4 * 1024 * 1024 + 1);
    bigPdf.set(PDF);
    expect((await POST(req({ kind: 'resume', bytes: bigPdf, type: 'application/pdf' }))).status).toBe(400);
    expect(m.put).not.toHaveBeenCalled();
  });

  it('stores the photo under projects/_about and writes about.photo', async () => {
    const res = await POST(req({ kind: 'photo', bytes: PNG }));
    expect(res.status).toBe(200);
    expect(m.put.mock.calls[0][0]).toBe('projects/_about/photo.png');
    expect(m.put.mock.calls[0][2]).toMatchObject({ access: 'public', addRandomSuffix: true, contentType: 'image/png' });
    expect(JSON.parse(m.set.mock.calls[0][1]).about.photo).toBe(URL_);
    expect(await res.json()).toMatchObject({ url: URL_, about: { photo: URL_, name: 'N' } });
    expect(m.del).not.toHaveBeenCalled();
  });

  it('stores the resume and writes about.resumeUrl, leaving photo intact', async () => {
    m.put.mockResolvedValue({ url: 'https://x.public.blob.vercel-storage.com/projects/_about/resume-abc.pdf' });
    const res = await POST(req({ kind: 'resume', bytes: PDF, type: 'application/pdf' }));
    expect(res.status).toBe(200);
    expect(m.put.mock.calls[0][0]).toBe('projects/_about/resume.pdf');
    const about = JSON.parse(m.set.mock.calls[0][1]).about;
    expect(about.resumeUrl).toMatch(/resume-abc\.pdf$/);
    expect(about.photo).toBe('/profile.png');
  });

  it('500s and removes the new blob when KV cannot be read', async () => {
    m.get.mockRejectedValue(new Error('down'));
    const res = await POST(req({ kind: 'photo', bytes: PNG }));
    expect(res.status).toBe(500);
    expect(m.del).toHaveBeenCalledWith(URL_);
    expect(m.set).not.toHaveBeenCalled();
  });

  it('500s and removes the new blob when the KV write fails', async () => {
    m.set.mockRejectedValue(new Error('down'));
    const res = await POST(req({ kind: 'photo', bytes: PNG }));
    expect(res.status).toBe(500);
    expect(m.del).toHaveBeenCalledWith(URL_);
  });
});
