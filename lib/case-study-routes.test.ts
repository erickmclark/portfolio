import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Project, SiteContent } from "./types";

const proj = (slug: string, visibility?: Project["visibility"]): Project =>
  ({ id: `id-${slug}`, slug, title: slug, tagline: "t", description: "", tech: [], featured: false, order: 0, visibility }) as Project;

let projects: Project[] = [];
vi.mock("@/lib/content", async (orig) => {
  const actual = await orig<typeof import("./content")>();
  return { ...actual, getSiteContent: async () => ({ projects }) as unknown as SiteContent };
});

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  permanentRedirect: (url: string) => redirectMock(url),
}));

beforeEach(() => {
  redirectMock.mockClear();
  projects = [proj("pub"), proj("hid", "hidden"), proj("arc", "archived")];
});

describe("/projects/[slug] legacy redirect", () => {
  it("permanently redirects a public project to /work/<slug>", async () => {
    const { default: Page } = await import("@/app/projects/[slug]/page");
    await expect(Page({ params: Promise.resolve({ slug: "pub" }) })).rejects.toThrow("REDIRECT:/work/pub");
  });
  it.each(["hid", "arc", "missing"])("404s without redirecting for %s", async (slug) => {
    const { default: Page } = await import("@/app/projects/[slug]/page");
    await expect(Page({ params: Promise.resolve({ slug }) })).rejects.toThrow("NOT_FOUND");
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("/work/[slug]", () => {
  it.each(["hid", "arc", "missing"])("404s for %s", async (slug) => {
    const { default: Page } = await import("@/app/work/[slug]/page");
    await expect(Page({ params: Promise.resolve({ slug }) })).rejects.toThrow("NOT_FOUND");
  });
  it("renders for a public project", async () => {
    const { default: Page } = await import("@/app/work/[slug]/page");
    await expect(Page({ params: Promise.resolve({ slug: "pub" }) })).resolves.toBeTruthy();
  });
  it("shows description as Overview only when the project has no case-study sections", async () => {
    const { default: Page } = await import("@/app/work/[slug]/page");
    const texts = (n: unknown, out: string[] = []): string[] => {
      if (typeof n === "string") out.push(n);
      else if (Array.isArray(n)) n.forEach((c) => texts(c, out));
      else if (n && typeof n === "object" && "props" in n) {
        const props = (n as { props: Record<string, unknown> }).props;
        if (typeof props.body === "string") out.push(props.body);
        texts(props.children, out);
      }
      return out;
    };
    projects = [
      { ...proj("bare"), description: "BARE_DESC_TEXT" },
      { ...proj("full"), description: "FULL_DESC_TEXT", caseStudy: { challenge: "A challenge." } },
    ];
    const bare = texts(await Page({ params: Promise.resolve({ slug: "bare" }) })).join("\n");
    const full = texts(await Page({ params: Promise.resolve({ slug: "full" }) })).join("\n");
    expect(bare).toContain("BARE_DESC_TEXT");
    expect(full).not.toContain("FULL_DESC_TEXT");
    expect(full).toContain("A challenge.");
  });
});

describe("sitemap", () => {
  it("lists home, public /work/* and /contact only", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/work/pub"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/contact"))).toBe(true);
    expect(urls.some((u) => u.includes("/projects/"))).toBe(false);
    expect(urls.some((u) => u.includes("hid") || u.includes("arc"))).toBe(false);
  });
});
