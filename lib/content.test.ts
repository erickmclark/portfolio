import { describe, expect, it } from "vitest";
import { getSiteContent } from "./content";

// Netlify Blobs is unavailable in the test environment, so getSiteContent()
// should transparently fall back to reading content/data.json.
describe("getSiteContent (file fallback)", () => {
  it("returns the parsed site content shape", async () => {
    const content = await getSiteContent();

    expect(Array.isArray(content.projects)).toBe(true);
    expect(content.about).toBeTruthy();
    expect(content.about.name).toBeTypeOf("string");
    expect(content.about.name.length).toBeGreaterThan(0);
    expect(content.contact.email).toBeTypeOf("string");
  });

  it("every project carries the required fields", async () => {
    const { projects } = await getSiteContent();
    for (const p of projects) {
      expect(p.slug).toBeTypeOf("string");
      expect(p.title).toBeTypeOf("string");
      expect(p.image).toBeTypeOf("string");
      expect(Array.isArray(p.tech)).toBe(true);
    }
  });
});
