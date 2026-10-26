import { describe, expect, it } from "vitest";
import { nextBottomNavVisible, SCROLL_THRESHOLD } from "@/lib/bottom-nav-visibility";

describe("nextBottomNavVisible", () => {
  it("is hidden while the hero is in view", () => {
    expect(nextBottomNavVisible({ visible: true, pastHero: false, y: 100, lastY: 300 })).toBe(false);
  });
  it("shows on leaving the hero even while scrolling down", () => {
    expect(nextBottomNavVisible({ visible: false, pastHero: true, y: 900, lastY: 300, leftHero: true })).toBe(true);
  });
  it("hides on scroll down past the hero", () => {
    expect(nextBottomNavVisible({ visible: true, pastHero: true, y: 900, lastY: 800 })).toBe(false);
  });
  it("returns on scroll up", () => {
    expect(nextBottomNavVisible({ visible: false, pastHero: true, y: 800, lastY: 900 })).toBe(true);
  });
  it("keeps state for movement under the threshold", () => {
    const d = SCROLL_THRESHOLD - 1;
    expect(nextBottomNavVisible({ visible: true, pastHero: true, y: 500 + d, lastY: 500 })).toBe(true);
    expect(nextBottomNavVisible({ visible: false, pastHero: true, y: 500 - d, lastY: 500 })).toBe(false);
  });
});
