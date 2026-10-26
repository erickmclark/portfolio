import { readFileSync } from "fs";
import { join } from "path";
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
    experience: [
      {
        id: "x-one",
        role: "Software Engineer",
        company: "Acme",
        start: "2023",
        end: "",
        description: "Built things.",
        order: 0,
      },
    ],
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
    delete (c.projects[0] as unknown as Record<string, unknown>).tagline;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/tagline/i);
  });

  it("rejects a project whose image is present but not a string", () => {
    const c = validContent();
    (c.projects[0] as unknown as Record<string, unknown>).image = 5;
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
    delete c.projects[0].image;
    delete c.about.photo;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(true);
  });

  it("accepts legacy content with no experience field and defaults it to []", () => {
    const c = validContent() as unknown as Record<string, unknown>;
    delete c.experience;
    const result = validateSiteContent(c);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.content.experience).toEqual([]);
  });

  it("rejects an experience entry with an empty role", () => {
    const c = validContent();
    c.experience[0].role = "  ";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/role/i);
  });

  it("rejects duplicate experience ids", () => {
    const c = validContent();
    c.experience.push({ ...c.experience[0] });
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/duplicate experience id/i);
  });

  it("rejects a non-array experience field", () => {
    const c = validContent() as unknown as Record<string, unknown>;
    c.experience = "nope";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/experience/i);
  });

  it("accepts a project with every new content-spec field", () => {
    const c = validContent();
    Object.assign(c.projects[0], {
      category: "AI & SaaS Products",
      relationship: "Independent Product",
      status: "MVP",
      visibility: "hidden",
      externalUrl: "https://example.com",
      caseStudy: { challenge: "A", outcome: "" },
      images: [{ url: "/a.png", alt: "Alt", caption: "Cap", kind: "conceptual" }],
    });
    c.experience[0].visibility = "archived";
    expect(validateSiteContent(c).ok).toBe(true);
  });

  const badProject: Array<[string, Record<string, unknown>, RegExp]> = [
    ["bad category", { category: "Other" }, /category/],
    ["bad relationship", { relationship: "Freelance" }, /relationship/],
    ["non-string status", { status: 3 }, /status/],
    ["bad visibility", { visibility: "private" }, /visibility/],
    ["non-string externalUrl", { externalUrl: 5 }, /externalUrl/],
    ["http externalUrl", { externalUrl: "http://example.com" }, /externalUrl must be an absolute https URL/],
    ["relative externalUrl", { externalUrl: "/work" }, /externalUrl must be an absolute https URL/],
    ["javascript externalUrl", { externalUrl: "javascript:alert(1)" }, /externalUrl must be an absolute https URL/],
    ["non-object caseStudy", { caseStudy: "text" }, /caseStudy/],
    ["non-string section", { caseStudy: { challenge: 1 } }, /caseStudy\.challenge/],
    ["unknown section", { caseStudy: { bogus: "x" } }, /caseStudy\.bogus/],
    ["non-array images", { images: "x.png" }, /images/],
    ["image missing url", { images: [{ alt: "a", kind: "screenshot" }] }, /url/],
    ["image missing alt", { images: [{ url: "/a.png", kind: "screenshot" }] }, /alt/],
    ["image empty alt", { images: [{ url: "/a.png", alt: " ", kind: "screenshot" }] }, /alt/],
    ["http image url", { images: [{ url: "http://x.example/a.png", alt: "a", kind: "screenshot" }] }, /same-origin path or an https URL/],
    ["protocol-relative image url", { images: [{ url: "//x.example/a.png", alt: "a", kind: "screenshot" }] }, /same-origin path or an https URL/],
    ["javascript legacy image", { image: "javascript:alert(1)" }, /image must be a same-origin path or an https URL/],
    ["image bad kind", { images: [{ url: "/a.png", alt: "a", kind: "photo" }] }, /kind/],
    ["image non-string caption", { images: [{ url: "/a.png", alt: "a", kind: "screenshot", caption: 1 }] }, /caption/],
  ];
  it.each(badProject)("rejects a project with %s", (_name, patch, pattern) => {
    const c = validContent();
    Object.assign(c.projects[0], patch);
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(pattern);
  });

  it("accepts an empty externalUrl", () => {
    const c = validContent();
    Object.assign(c.projects[0], { externalUrl: "" });
    expect(validateSiteContent(c).ok).toBe(true);
  });

  it("rejects an experience entry with a bad visibility", () => {
    const c = validContent();
    (c.experience[0] as unknown as Record<string, unknown>).visibility = "gone";
    const result = validateSiteContent(c);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toMatch(/visibility/);
  });

  it("accepts an empty legacy image and https/same-origin gallery urls", () => {
    const c = validContent();
    c.projects[0].image = "";
    c.projects[0].images = [
      { url: "https://qdghepacnxxksvfb.public.blob.vercel-storage.com/projects/p-alpha/a.png", alt: "a", kind: "screenshot" },
      { url: "/projects/alpha.png", alt: "b", kind: "conceptual" },
    ];
    expect(validateSiteContent(c).ok).toBe(true);
  });

  it("still validates the shipped content/data.json", () => {
    const data = JSON.parse(readFileSync(join(process.cwd(), "content", "data.json"), "utf-8"));
    const result = validateSiteContent(data);
    expect(result.ok).toBe(true);
  });
});
