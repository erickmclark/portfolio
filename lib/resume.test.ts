import { describe, expect, it } from 'vitest';
import { resumeDownloadHref } from '@/lib/resume';

const BLOB = 'https://qdghepacnxxksvfb.public.blob.vercel-storage.com/projects/_about/resume-abc123.pdf';

describe('resumeDownloadHref', () => {
  it('adds download=1 to a Vercel Blob URL', () => {
    expect(resumeDownloadHref(BLOB)).toBe(`${BLOB}?download=1`);
  });
  it('preserves existing params and hash', () => {
    expect(resumeDownloadHref(`${BLOB}?a=b#page=2`)).toBe(`${BLOB}?a=b&download=1#page=2`);
  });
  it('overwrites an existing download param', () => {
    expect(resumeDownloadHref(`${BLOB}?download=0&a=b`)).toBe(`${BLOB}?download=1&a=b`);
  });
  it('leaves same-origin paths unchanged', () => {
    expect(resumeDownloadHref('/Erick-Clark-Resume-2026.pdf')).toBe('/Erick-Clark-Resume-2026.pdf');
  });
  it('leaves other absolute URLs unchanged', () => {
    expect(resumeDownloadHref('https://example.com/r.pdf')).toBe('https://example.com/r.pdf');
    expect(resumeDownloadHref('http://a.public.blob.vercel-storage.com/r.pdf')).toBe('http://a.public.blob.vercel-storage.com/r.pdf');
  });
  it('does not match look-alike hosts', () => {
    for (const u of [
      'https://evil-public.blob.vercel-storage.com.attacker.com/r.pdf',
      'https://public.blob.vercel-storage.com.attacker.com/r.pdf',
      'https://attacker.com/?x=.public.blob.vercel-storage.com',
      'https://attacker.com/.public.blob.vercel-storage.com',
      'https://x.public.blob.vercel-storage.com@attacker.com/r.pdf',
    ]) {
      expect(resumeDownloadHref(u)).toBe(u);
    }
  });
  it('returns empty and malformed input unchanged without throwing', () => {
    for (const u of ['', 'not a url', '//', 'https://', ':::']) {
      expect(resumeDownloadHref(u)).toBe(u);
    }
  });
});
