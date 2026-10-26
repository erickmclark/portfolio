import { describe, expect, it } from "vitest";
import { PIN_WINDOW_MS, shouldKeepPinning, shouldResetScroll } from "@/lib/scroll-reset";

const base = { pathname: "/about", lastPathname: "/", hash: "", pushedPath: "/about" };

describe("shouldResetScroll", () => {
  it("skips the initial load", () => {
    expect(shouldResetScroll({ ...base, lastPathname: null })).toBe(false);
  });
  it("resets on a push to a new pathname", () => {
    expect(shouldResetScroll(base)).toBe(true);
  });
  it("skips back/forward traversal (no push)", () => {
    expect(shouldResetScroll({ ...base, pushedPath: null })).toBe(false);
  });
  it("skips a traversal after a stale push to another page", () => {
    expect(shouldResetScroll({ ...base, pushedPath: "/" })).toBe(false);
  });
  it("skips when a hash is present", () => {
    expect(shouldResetScroll({ ...base, hash: "#experience" })).toBe(false);
  });
  it("skips the same pathname (query change)", () => {
    expect(shouldResetScroll({ ...base, pathname: "/", lastPathname: "/" })).toBe(false);
  });
});

describe("shouldKeepPinning", () => {
  it("pins inside the window", () => {
    expect(shouldKeepPinning(0, false)).toBe(true);
    expect(shouldKeepPinning(PIN_WINDOW_MS - 1, false)).toBe(true);
  });
  it("stops when the window ends", () => {
    expect(shouldKeepPinning(PIN_WINDOW_MS, false)).toBe(false);
  });
  it("stops on user scroll intent", () => {
    expect(shouldKeepPinning(10, true)).toBe(false);
  });
});
