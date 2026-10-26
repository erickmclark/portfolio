export const SCROLL_THRESHOLD = 8;

type Input = {
  visible: boolean;
  pastHero: boolean;
  y: number;
  lastY: number;
  leftHero?: boolean;
};

export function nextBottomNavVisible({ visible, pastHero, y, lastY, leftHero }: Input): boolean {
  if (!pastHero) return false;
  if (leftHero) return true;
  const delta = y - lastY;
  if (Math.abs(delta) < SCROLL_THRESHOLD) return visible;
  return delta < 0;
}
