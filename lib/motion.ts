/** Pure motion helpers shared by the client motion islands. Durations in ms. */

export const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const EASE_IN_OUT = "cubic-bezier(0.65, 0, 0.35, 1)";
export const STAGGER_MS = 60;
export const PIECE_MS = 600;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Viewport rect to document coordinates, so rects captured at different scroll offsets compare correctly. */
export function docBox(r: Box, scrollX: number, scrollY: number): Box {
  return { left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height };
}

/** Stagger delay for piece `i`. Seven pieces at 60ms plus 600ms stays under the 1200ms sequence cap. */
export const staggerDelay = (i: number) => i * STAGGER_MS;

/** FLIP "invert" transform that moves a piece at `next` visually back onto `prev`. Null when nothing moved. */
export function flipDelta(prev: Box, next: Box): { x: number; y: number; sx: number; sy: number } | null {
  if (!next.width || !next.height) return null;
  const x = prev.left - next.left;
  const y = prev.top - next.top;
  const sx = prev.width / next.width;
  const sy = prev.height / next.height;
  if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5 && Math.abs(sx - 1) < 0.002 && Math.abs(sy - 1) < 0.002) return null;
  return { x, y, sx, sy };
}
