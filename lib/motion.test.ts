import { describe, expect, it } from "vitest";
import { docBox, flipDelta, staggerDelay } from "./motion";

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
});
