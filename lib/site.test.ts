import { describe, expect, it } from 'vitest';
import { absoluteImageUrl } from './site';

describe('absoluteImageUrl', () => {
  it('keeps an absolute Blob URL as-is', () => {
    const url = 'https://x.public.blob.vercel-storage.com/projects/_about/photo-abc.png';
    expect(absoluteImageUrl(url, 'https://www.example.com')).toBe(url);
  });
  it('prefixes the site origin for a same-origin path', () => {
    expect(absoluteImageUrl('/about-profile.png', 'https://www.example.com')).toBe('https://www.example.com/about-profile.png');
    expect(absoluteImageUrl('/about-profile.png', 'https://www.example.com/')).toBe('https://www.example.com/about-profile.png');
  });
});
