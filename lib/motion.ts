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

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

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

/** 0 when the element's top is at `startFrac` of the viewport height, 1 at `endFrac`. */
export function scrollProgress(top: number, vh: number, startFrac: number, endFrac: number): number {
  const start = vh * startFrac;
  const end = vh * endFrac;
  return clamp01((start - top) / (start - end));
}

const SPREAD = 0.08;

/** Per-piece progress for overall progress `t`: piece `i` of `n` starts a little later than the one before. */
export function pieceProgress(t: number, i: number, n: number): number {
  const delay = i * SPREAD;
  return clamp01((t - delay) / (1 - SPREAD * (n - 1)));
}

/** Entry offsets (px) pieces fly in from, cycling so neighbours come from different sides. */
const OFFSETS = [
  [-48, 0],
  [0, -40],
  [48, 0],
  [0, 40],
  [-40, 32],
  [40, -32],
  [0, 48],
] as const;

export function assemblyPiece(t: number, i: number, n: number): { x: number; y: number; opacity: number } {
  const p = pieceProgress(t, i, n);
  const [ox, oy] = OFFSETS[i % OFFSETS.length];
  const k = 1 - p;
  return { x: ox * k, y: oy * k, opacity: p };
}

/** Step `i` (0-based) of `count` is lit once progress passes its threshold, in order. */
export function stepLit(t: number, i: number, count: number): boolean {
  return t >= 0.3 + (0.6 * i) / Math.max(1, count - 1);
}
