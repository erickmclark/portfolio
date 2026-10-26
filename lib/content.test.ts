import { describe, expect, it } from "vitest";
import { getSiteContent, publicExperience, publicProjects } from "./content";
import type { ExperienceItem, Project } from "./types";

// The KV store is unavailable in the test environment, so getSiteContent()
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

describe("visibility helpers", () => {
  const proj = (id: string, visibility?: Project["visibility"]) =>
    ({ id, slug: id, title: id, tagline: "", description: "", tech: [], featured: false, order: 0, visibility }) as Project;
  const exp = (id: string, visibility?: ExperienceItem["visibility"]) =>
    ({ id, role: "r", company: "c", start: "", end: "", description: "", order: 0, visibility }) as ExperienceItem;

  it("publicProjects keeps public and legacy (undefined) records only", () => {
    const out = publicProjects([proj("a", "public"), proj("b", "hidden"), proj("c", "archived"), proj("d")]);
    expect(out.map((p) => p.id)).toEqual(["a", "d"]);
  });

  it("publicExperience keeps public and legacy (undefined) records only", () => {
    const out = publicExperience([exp("a", "public"), exp("b", "archived"), exp("c", "hidden"), exp("d")]);
    expect(out.map((x) => x.id)).toEqual(["a", "d"]);
  });

  it("migrated data.json defaults visibility and archives NightPivot out of public experience", async () => {
    const { projects, experience } = await getSiteContent();
    expect(projects.every((p) => p.visibility)).toBe(true);
    expect(experience.find((x) => x.company === "NightPivot")?.visibility).toBe("archived");
    expect(publicExperience(experience).some((x) => x.company === "NightPivot")).toBe(false);
    const jpm = publicExperience(experience).find((x) => x.company === "JPMorgan Chase");
    expect(jpm?.start).toBe("July 2019");
    expect(jpm?.end).toBe("August 2026");
    expect(publicProjects(projects).some((p) => p.slug.includes("deb"))).toBe(false);
  });
});

describe("publicProjectBySlug", () => {
  it("finds only public projects by slug", async () => {
    const { publicProjectBySlug } = await import("./content");
    const mk = (slug: string, visibility?: Project["visibility"]) => ({ id: slug, slug, visibility }) as Project;
    const list = [mk("a"), mk("b", "hidden"), mk("c", "archived")];
    expect(publicProjectBySlug(list, "a")?.slug).toBe("a");
    expect(publicProjectBySlug(list, "b")).toBeUndefined();
    expect(publicProjectBySlug(list, "c")).toBeUndefined();
    expect(publicProjectBySlug(list, "zz")).toBeUndefined();
  });
});
