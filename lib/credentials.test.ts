import { describe, expect, it } from "vitest";
import { formatCredentials } from "./credentials";

describe("formatCredentials", () => {
  it("joins comma-separated items with a middle dot", () => {
    expect(formatCredentials("MBA, MS, PMP, PSM I")).toBe("MBA · MS · PMP · PSM I");
  });
  it("trims and drops empty items", () => {
    expect(formatCredentials("  MBA ,, MS ,")).toBe("MBA · MS");
  });
  it.each([undefined, "", "  ", ","])("returns empty for %j", (v) => {
    expect(formatCredentials(v)).toBe("");
  });
});
