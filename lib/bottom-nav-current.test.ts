import { describe, expect, it } from 'vitest';
import { currentBottomNavItem } from './bottom-nav-current';

describe('currentBottomNavItem', () => {
  it('highlights nothing on the homepage', () => {
    expect(currentBottomNavItem('/')).toBeNull();
  });
  it('maps work, its case studies, about and contact', () => {
    expect(currentBottomNavItem('/work')).toBe('work');
    expect(currentBottomNavItem('/work/some-project')).toBe('work');
    expect(currentBottomNavItem('/about')).toBe('about');
    expect(currentBottomNavItem('/contact')).toBe('contact');
  });
  it('does not match look-alike prefixes or other pages', () => {
    expect(currentBottomNavItem('/workshop')).toBeNull();
    expect(currentBottomNavItem('/privacy')).toBeNull();
  });
});
