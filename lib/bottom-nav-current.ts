export type BottomNavItem = 'home' | 'work' | 'about' | 'contact';

/** The bottom-bar item for the current page, or null (e.g. on /privacy). */
export function currentBottomNavItem(pathname: string): BottomNavItem | null {
  const is = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (pathname === '/') return 'home';
  if (is('/work')) return 'work';
  if (is('/about')) return 'about';
  if (is('/contact')) return 'contact';
  return null;
}

export type PendingBottomNav = { key: BottomNavItem; from: string };

/** The item to show as current: the in-flight tapped item only while still on the page it was tapped on. */
export function resolveBottomNavItem(pathname: string, pending: PendingBottomNav | null): BottomNavItem | null {
  return pending && pending.from === pathname ? pending.key : currentBottomNavItem(pathname);
}

/** Only a plain primary click starts an in-app navigation worth highlighting optimistically. */
export function shouldSetPending(e: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
}): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && !e.defaultPrevented;
}
