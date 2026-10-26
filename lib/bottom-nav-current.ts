export type BottomNavItem = 'work' | 'about' | 'contact';

/** The bottom-bar item for the current page, or null (e.g. on the homepage). */
export function currentBottomNavItem(pathname: string): BottomNavItem | null {
  const is = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (is('/work')) return 'work';
  if (is('/about')) return 'about';
  if (is('/contact')) return 'contact';
  return null;
}
