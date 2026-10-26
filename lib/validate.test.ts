import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { validateSiteContent } from "./validate";
import type { SiteContent } from "./types";
import { DEFAULT_CONTACT_PAGE, DEFAULT_HOME, DEFAULT_SITE, withContentDefaults } from "./home-copy";

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

  describe("home, site and contactPage groups", () => {
    const full = () => {
      const c = validContent();
      c.home = structuredClone(DEFAULT_HOME);
      c.site = structuredClone(DEFAULT_SITE);
      c.contactPage = structuredClone(DEFAULT_CONTACT_PAGE);
      return c;
    };
    const errorsOf = (c: unknown) => {
      const r = validateSiteContent(c);
      return r.ok ? "" : r.errors.join(" | ");
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mutate = (fn: (c: any) => void) => {
      const c = full();
      fn(c);
      return errorsOf(c);
    };

    it("accepts legacy content without the new groups", () => {
      expect(validateSiteContent(validContent()).ok).toBe(true);
    });

    it("accepts the complete defaults", () => {
      expect(validateSiteContent(full()).ok).toBe(true);
    });

    it("accepts withContentDefaults(data.json)", () => {
      const data = JSON.parse(readFileSync(join(process.cwd(), "content", "data.json"), "utf-8"));
      expect(validateSiteContent(withContentDefaults(data)).ok).toBe(true);
    });

    it("rejects a partial group", () => {
      expect(mutate((c) => delete c.home.about)).toMatch(/home\.about/);
      expect(mutate((c) => delete c.site.seo)).toMatch(/site\.seo/);
      expect(mutate((c) => delete c.contactPage.intro)).toMatch(/contactPage\.intro/);
    });

    it("rejects empty or untrimmed display strings but allows a missing tertiary", () => {
      expect(mutate((c) => (c.home.profileLine = " "))).toMatch(/home\.profileLine/);
      expect(mutate((c) => (c.site.footer.name = " Erick"))).toMatch(/site\.footer\.name/);
      expect(mutate((c) => delete c.home.hero.builder.tertiary)).toBe("");
      expect(mutate((c) => delete c.home.hero.it.tertiaryExternal)).toBe("");
    });

    it("requires exactly the three view keys and the six contact topics", () => {
      expect(mutate((c) => delete c.home.hero.builder)).toMatch(/home\.hero/);
      expect(mutate((c) => (c.home.viewLabels.extra = "x"))).toMatch(/home\.viewLabels/);
      expect(mutate((c) => delete c.contactPage.topics.speaking)).toMatch(/contactPage\.topics/);
      expect(mutate((c) => (c.contactPage.topics.other = "x"))).toMatch(/contactPage\.topics/);
    });

    it("enforces capability shape: 7 items, one band, known icon, unique titles", () => {
      expect(mutate((c) => c.home.capabilities.it.pop())).toMatch(/exactly 7/);
      expect(mutate((c) => delete c.home.capabilities.it[5].band)).toMatch(/exactly one capability with band/);
      expect(mutate((c) => (c.home.capabilities.it[0].band = true))).toMatch(/exactly one capability with band/);
      expect(mutate((c) => (c.home.capabilities.it[0].icon = "nope"))).toMatch(/\.icon must be one of/);
      expect(mutate((c) => (c.home.capabilities.it[1].title = c.home.capabilities.it[0].title))).toMatch(/duplicated/);
    });

    it("enforces principles, steps, toolkit, workOrder and privacy section rules", () => {
      expect(mutate((c) => c.home.pointOfView.principles.pop())).toMatch(/exactly 3/);
      expect(mutate((c) => (c.home.pointOfView.principles[1].title = c.home.pointOfView.principles[0].title))).toMatch(/duplicated/);
      expect(mutate((c) => (c.home.approach.steps = []))).toMatch(/at least 1/);
      expect(mutate((c) => (c.home.toolkit[1].group = c.home.toolkit[0].group))).toMatch(/group names must be unique/);
      expect(mutate((c) => (c.home.toolkit[0].items = [1]))).toMatch(/items must be an array of strings/);
      expect(mutate((c) => (c.home.workOrder.it = ["a", "a"]))).toMatch(/duplicated/);
      expect(mutate((c) => (c.home.workOrder.it = [""]))).toMatch(/home\.workOrder\.it\[0\]/);
      expect(mutate((c) => (c.site.privacy.sections[0].id = "Bad Id"))).toMatch(/sections\[0\]\.id/);
      expect(mutate((c) => (c.site.privacy.sections[1].id = c.site.privacy.sections[0].id))).toMatch(/duplicated/);
    });

    it("rejects unsafe or malformed hrefs", () => {
      for (const bad of ["javascript:alert(1)", "data:text/html,x", "http://example.com", "//evil.com", "mailto:a@b.c"]) {
        expect(mutate((c) => (c.home.hero.it.primary.href = bad))).toMatch(/primary\.href/);
      }
      expect(mutate((c) => (c.home.hero.it.tertiary.href = "resume"))).toMatch(/tertiary\.href/);
      for (const ok of ["#work", "/contact?type=advisory", "https://example.com/x", "resume"]) {
        expect(mutate((c) => (c.home.hero.it.primary.href = ok))).toBe("");
      }
    });

    it("validates project card buttons", () => {
      const withCard = (card: unknown, second?: unknown) => {
        const c = validContent();
        Object.assign(c.projects[0], { cardCta: card, cardSecondaryCta: second });
        return errorsOf(c);
      };
      expect(withCard({ label: "Go" })).toBe("");
      expect(withCard({ label: "Go", href: "/contact?type=product" }, { label: "More", href: "https://example.com" })).toBe("");
      expect(withCard({ label: "" })).toMatch(/cardCta\.label/);
      expect(withCard({ label: "Go", href: "javascript:x" })).toMatch(/cardCta\.href/);
      expect(withCard({ label: "Go" }, { label: "More", href: "resume" })).toMatch(/cardSecondaryCta\.href/);
      expect(withCard({ label: "Go" }, { label: "More" })).toMatch(/cardSecondaryCta\.href/);
    });
  });
});

describe("about photo and resumeUrl", () => {
  const withAbout = (patch: Record<string, unknown>) => {
    const c = validContent();
    return { ...c, about: { ...c.about, ...patch } };
  };
  it.each([
    [{ photo: "/profile.png", resumeUrl: "/Erick-Clark-Resume-2026.pdf" }],
    [{ photo: "https://x.public.blob.vercel-storage.com/projects/_about/photo-a.png", resumeUrl: "https://x.public.blob.vercel-storage.com/projects/_about/resume-a.pdf" }],
    [{ photo: "", resumeUrl: "" }],
    [{}],
  ])("accepts %j", (patch) => {
    expect(validateSiteContent(withAbout(patch)).ok).toBe(true);
  });
  it.each([
    ["photo", "http://x.com/a.png"],
    ["photo", "javascript:alert(1)"],
    ["photo", "//evil.com/a.png"],
    ["photo", "a.png"],
    ["resumeUrl", "http://x.com/r.pdf"],
    ["resumeUrl", "data:application/pdf;base64,AAAA"],
    ["resumeUrl", "resume.pdf"],
  ])("rejects about.%s = %s", (key, value) => {
    const result = validateSiteContent(withAbout({ [key]: value }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain(`about.${key}`);
  });
});

describe("about.credentials and optional site.footer.name", () => {
  const withAbout = (patch: Record<string, unknown>) => {
    const c = validContent();
    return { ...c, about: { ...c.about, ...patch } };
  };
  it.each([[{}], [{ credentials: "" }], [{ credentials: "MBA, MS, PMP, PSM I" }], [{ credentials: "x".repeat(120) }]])("accepts %j", (patch) => {
    expect(validateSiteContent(withAbout(patch)).ok).toBe(true);
  });
  it.each([[5], [" MBA"], ["MBA "], ["x".repeat(121)]])("rejects about.credentials = %j", (value) => {
    const result = validateSiteContent(withAbout({ credentials: value }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.join(" ")).toContain("about.credentials");
  });
  const withFooter = (mutate: (f: Record<string, unknown>) => void) => {
    const c = { ...validContent(), site: structuredClone(DEFAULT_SITE) };
    mutate(c.site.footer as Record<string, unknown>);
    return validateSiteContent(c);
  };
  it("accepts footer.name present or absent", () => {
    expect(withFooter(() => {}).ok).toBe(true);
    expect(withFooter((f) => delete f.name).ok).toBe(true);
  });
  it.each([[""], [" "], [" Erick"], [3]])("rejects footer.name = %j", (value) => {
    const r = withFooter((f) => (f.name = value));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(" ")).toContain("site.footer.name");
  });
  it("still requires the other footer fields", () => {
    const r = withFooter((f) => delete f.descriptor);
    expect(r.ok).toBe(false);
  });
});
