import { beforeEach, describe, expect, it, vi } from 'vitest';

const blob = vi.hoisted(() => ({ list: vi.fn(), del: vi.fn() }));
vi.mock('@vercel/blob', () => blob);

import {
  blobPrefix,
  deleteProjectBlobs,
  ensureImages,
  aboutAssetPath,
  sniffPdf,
  isAllowedImageUrl,
  isProjectBlobUrl,
  isValidProjectId,
  sniffImageType,
  syncCover,
} from './project-images';
import type { Project } from './types';

const base: Project = {
  id: 'p1', slug: 's', title: 'T', tagline: '', description: '', tech: [], image: '', featured: false, order: 0,
};

beforeEach(() => {
  blob.list.mockReset();
  blob.del.mockReset();
});

describe('isAllowedImageUrl', () => {
  it.each(['/projects/a.png', 'https://x.example/a.png'])('allows %s', (u) => {
    expect(isAllowedImageUrl(u)).toBe(true);
  });
  it.each(['', 'http://x.example/a.png', 'data:image/png;base64,AA', 'javascript:alert(1)', 'a.png', '//evil.example/a.png', '/\\evil.example'])(
    'rejects %j',
    (u) => expect(isAllowedImageUrl(u)).toBe(false),
  );
});

describe('syncCover / ensureImages', () => {
  it('syncs image to the first gallery url, or empty', () => {
    const img = { url: '/a.png', alt: 'a', kind: 'screenshot' as const };
    expect(syncCover({ ...base, image: '/old.png', images: [img] }).image).toBe('/a.png');
    expect(syncCover({ ...base, image: '/old.png', images: [] }).image).toBe('');
  });
  it('leaves image alone when images is undefined', () => {
    expect(syncCover({ ...base, image: '/old.png' }).image).toBe('/old.png');
  });
  it('seeds images from the legacy image', () => {
    expect(ensureImages({ ...base, image: '/a.png' }).images).toEqual([{ url: '/a.png', alt: 'T', kind: 'screenshot' }]);
    expect(ensureImages(base).images).toEqual([]);
    expect(ensureImages({ ...base, images: [] }).images).toEqual([]);
  });
});

describe('sniffImageType', () => {
  const t = (...b: number[]) => sniffImageType(new Uint8Array(b));
  const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));
  it('detects formats by magic bytes', () => {
    expect(t(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)?.ext).toBe('png');
    expect(t(0xff, 0xd8, 0xff, 0xe0)?.contentType).toBe('image/jpeg');
    expect(t(...ascii('GIF89a'))?.ext).toBe('gif');
    expect(t(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP'))?.ext).toBe('webp');
    expect(t(0, 0, 0, 0x1c, ...ascii('ftypavif'))?.ext).toBe('avif');
  });
  it('rejects svg, html and empty', () => {
    expect(t(...ascii('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeNull();
    expect(t(...ascii('<html>'))).toBeNull();
    expect(t()).toBeNull();
  });
});

describe('ids and blob urls', () => {
  it('checks ids and builds the prefix', () => {
    expect(isValidProjectId('p-1_a')).toBe(true);
    expect(isValidProjectId('../x')).toBe(false);
    expect(isValidProjectId('')).toBe(false);
    expect(blobPrefix('p1')).toBe('projects/p1/');
  });
  it('recognises only blob urls under the project folder', () => {
    const host = 'https://qdghepacnxxksvfb.public.blob.vercel-storage.com';
    expect(isProjectBlobUrl(`${host}/projects/p1/image-x.png`, 'p1')).toBe(true);
    expect(isProjectBlobUrl(`${host}/projects/p2/image-x.png`, 'p1')).toBe(false);
    expect(isProjectBlobUrl(`${host}/projects/p10/a.png`, 'p1')).toBe(false);
    expect(isProjectBlobUrl('https://evil.example/projects/p1/a.png', 'p1')).toBe(false);
    expect(isProjectBlobUrl('/projects/p1/a.png', 'p1')).toBe(false);
  });
});

describe('blob cleanup', () => {
  it('deleteProjectBlobs paginates and deletes in one call', async () => {
    blob.list
      .mockResolvedValueOnce({ blobs: [{ url: 'u1' }], hasMore: true, cursor: 'c' })
      .mockResolvedValueOnce({ blobs: [{ url: 'u2' }], hasMore: false });
    await deleteProjectBlobs('p1');
    expect(blob.list).toHaveBeenNthCalledWith(1, { prefix: 'projects/p1/', cursor: undefined });
    expect(blob.list).toHaveBeenNthCalledWith(2, { prefix: 'projects/p1/', cursor: 'c' });
    expect(blob.del).toHaveBeenCalledWith(['u1', 'u2']);
  });
  it('skips del when nothing is stored', async () => {
    blob.list.mockResolvedValue({ blobs: [], hasMore: false });
    await deleteProjectBlobs('p1');
    expect(blob.del).not.toHaveBeenCalled();
  });
});

describe('about assets', () => {
  it('builds paths under the reserved _about folder', () => {
    expect(aboutAssetPath('photo', 'jpg')).toBe('projects/_about/photo.jpg');
    expect(aboutAssetPath('resume')).toBe('projects/_about/resume.pdf');
  });
  it('never treats _about as a project id', () => {
    expect(isValidProjectId('_about')).toBe(false);
    expect(isValidProjectId('about')).toBe(true);
  });
  it('sniffPdf checks the %PDF- magic number', () => {
    expect(sniffPdf(new TextEncoder().encode('%PDF-1.4 x'))).toBe(true);
    expect(sniffPdf(new TextEncoder().encode('%PDF'))).toBe(false);
    expect(sniffPdf(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe(false);
  });
});
