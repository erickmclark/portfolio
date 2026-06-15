import { describe, expect, it } from "vitest";
import { validateSiteContent } from "./validate";
import type { SiteContent } from "./types";

function validContent(): SiteContent {
  return {
    projects: [
      {
        id: "p-alpha",
        slug: "alpha",
        title: "Alpha",
        tagline: "First",
        description: "# Alpha",
        tech: ["TypeScript"],
        image: "/projects/alpha.png",
        featured: true,
        order: 0,
      },
    ],
    about: {
      name: "Jane Doe",
      title: "Software Engineer",
      heroTagline: "I build things.",
      availableForWork: true,
      bio: ["Paragraph one."],
      skills: ["React"],
    },
    contact: {
      email: "jane@example.com",
      githubUrl: "https://github.com/jane",
      linkedinUrl: "https://linkedin.com/in/jane",
    },
  };
}

describe("validateSiteContent", () => {
  it("accepts a well-formed SiteContent and returns it", () => {
    const result = validateSiteContent(validContent());
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.content.about.name).toBe("Jane Doe");
  });

  it("rejects a non-object payload", () => {
    const result = validateSiteContent(null);
    expect(result.ok).toBe(false);
  });

  it("rejects when about is missing", () => {
    const c = validContent() as Record<string, unknown>;
    delete c.about;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/about/i);
  });

  it("rejects when about.bio is not an array of strings", () => {
    const c = validContent();
    (c.about as unknown as Record<string, unknown>).bio = "not an array";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/bio/i);
  });

  it("rejects an empty about.name", () => {
    const c = validContent();
    c.about.name = "   ";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/name/i);
  });

  it("rejects a project with an empty slug", () => {
    const c = validContent();
    c.projects[0].slug = "";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/slug/i);
  });

  it("rejects duplicate project slugs", () => {
    const c = validContent();
    c.projects.push({ ...c.projects[0], id: "p-alpha-2", title: "Alpha 2" });
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/duplicate project slug/i);
  });

  it("rejects a project with an empty id", () => {
    const c = validContent();
    c.projects[0].id = "";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/id/i);
  });

  it("rejects duplicate project ids", () => {
    const c = validContent();
    c.projects.push({ ...c.projects[0], slug: "alpha-2" });
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/duplicate project id/i);
  });

  it("rejects a project missing a required field", () => {
    const c = validContent();
    delete (c.projects[0] as unknown as Record<string, unknown>).image;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/image/i);
  });

  it("rejects when contact.email is not a string", () => {
    const c = validContent();
    (c.contact as unknown as Record<string, unknown>).email = 42;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/email/i);
  });

  it("accepts optional project fields being absent", () => {
    const c = validContent();
    delete c.projects[0].githubUrl;
    delete c.projects[0].liveUrl;
    delete c.about.photo;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(true);
  });
});
