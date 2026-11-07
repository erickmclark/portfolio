import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import { LEGACY_SLUG_REDIRECTS } from "@/lib/home-view";

describe("legacy /work slug redirects in next.config", () => {
  it("emits a permanent config redirect for every LEGACY_SLUG_REDIRECTS entry", async () => {
    const redirects = (await nextConfig.redirects?.()) ?? [];
    const entries = Object.entries(LEGACY_SLUG_REDIRECTS);
    expect(entries.length).toBeGreaterThan(0);
    for (const [legacy, target] of entries) {
      const match = redirects.find((r) => r.source === `/work/${legacy}`);
      expect(match, `missing redirect for ${legacy}`).toBeDefined();
      expect(match).toMatchObject({ destination: `/work/${target}`, permanent: true });
    }
  });
});
