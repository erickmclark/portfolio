import { describe, expect, it } from "vitest";
import { assemblyPiece, docBox, flipDelta, pieceProgress, scrollProgress, staggerDelay, stepLit } from "./motion";

const box = (left: number, top: number, width: number, height: number) => ({ left, top, width, height });

describe("motion helpers", () => {
  it("staggers seven pieces so the whole sequence stays within 1200ms", () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(6)).toBe(360);
    expect(staggerDelay(6) + 600).toBeLessThanOrEqual(1200);
  });

  it("flipDelta inverts a move and returns null when nothing moved", () => {
    expect(flipDelta(box(10, 20, 100, 50), box(10, 20, 100, 50))).toBeNull();
    expect(flipDelta(box(0, 0, 200, 100), box(50, 30, 100, 50))).toEqual({ x: -50, y: -30, sx: 2, sy: 2 });
    expect(flipDelta(box(0, 0, 10, 10), box(0, 0, 0, 0))).toBeNull();
  });

  it("docBox makes rects captured at different scroll offsets comparable", () => {
    const before = docBox(box(0, 177, 100, 50), 0, 0);
    const after = docBox(box(0, -123, 100, 50), 0, 300);
    expect(flipDelta(before, after)).toBeNull();
    // viewport-only comparison (the old behaviour) reports a phantom 300px move
    expect(flipDelta(box(0, 177, 100, 50), box(0, -123, 100, 50))).toEqual({ x: 0, y: 300, sx: 1, sy: 1 });
  });

  it("scrollProgress clamps and maps start to end", () => {
    expect(scrollProgress(900, 1000, 0.85, 0.25)).toBe(0);
    expect(scrollProgress(850, 1000, 0.85, 0.25)).toBe(0);
    expect(scrollProgress(550, 1000, 0.85, 0.25)).toBeCloseTo(0.5);
    expect(scrollProgress(100, 1000, 0.85, 0.25)).toBe(1);
  });

  it("pieces complete by t=1 and later pieces start later", () => {
    for (let i = 0; i < 7; i++) expect(pieceProgress(1, i, 7)).toBe(1);
    expect(pieceProgress(0.1, 0, 7)).toBeGreaterThan(pieceProgress(0.1, 5, 7));
    expect(assemblyPiece(0, 0, 7)).toEqual({ x: -48, y: 0, opacity: 0 });
    expect(assemblyPiece(1, 3, 7)).toEqual({ x: 0, y: 0, opacity: 1 });
  });

  it("steps light in order and all are lit at the end", () => {
    const at = (t: number) => [0, 1, 2].map((i) => stepLit(t, i, 3));
    expect(at(0)).toEqual([false, false, false]);
    expect(at(0.3)).toEqual([true, false, false]);
    expect(at(0.6)).toEqual([true, true, false]);
    expect(at(1)).toEqual([true, true, true]);
  });
});
