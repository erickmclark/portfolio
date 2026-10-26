import { describe, expect, it } from 'vitest';
import { currentBottomNavItem, resolveBottomNavItem, shouldSetPending, type PendingBottomNav } from './bottom-nav-current';

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

const plain = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false };

describe('shouldSetPending', () => {
  it('accepts a plain primary click', () => {
    expect(shouldSetPending(plain)).toBe(true);
  });
  it('ignores modified, non-primary and default-prevented clicks', () => {
    expect(shouldSetPending({ ...plain, metaKey: true })).toBe(false);
    expect(shouldSetPending({ ...plain, ctrlKey: true })).toBe(false);
    expect(shouldSetPending({ ...plain, shiftKey: true })).toBe(false);
    expect(shouldSetPending({ ...plain, altKey: true })).toBe(false);
    expect(shouldSetPending({ ...plain, button: 1 })).toBe(false);
    expect(shouldSetPending({ ...plain, defaultPrevented: true })).toBe(false);
  });
});

describe('resolveBottomNavItem', () => {
  const pending: PendingBottomNav = { key: 'work', from: '/' };
  it('shows the tapped item only while still on the page it was tapped on', () => {
    expect(resolveBottomNavItem('/', pending)).toBe('work');
    expect(resolveBottomNavItem('/work', pending)).toBe('work');
    expect(resolveBottomNavItem('/about', pending)).toBe('about');
  });
  it('tap, navigate, back: once pending is cleared the homepage highlights nothing', () => {
    expect(resolveBottomNavItem('/', null)).toBeNull();
  });
  it('falls back to the pathname with no pending tap', () => {
    expect(resolveBottomNavItem('/contact', null)).toBe('contact');
  });
});
