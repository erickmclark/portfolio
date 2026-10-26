import { describe, expect, it } from "vitest";
import { applyRouteImages, coverUrls, galleryImages, mergeRouteImages, moveUrls } from "./gallery-utils";
import type { Project, ProjectImage, SiteContent } from "@/lib/types";

const img = (url: string, alt = url, kind: ProjectImage["kind"] = "screenshot", caption?: string): ProjectImage => ({ url, alt, kind, ...(caption ? { caption } : {}) });

describe("mergeRouteImages", () => {
  it("keeps local alt/caption/kind but takes order and membership from the response", () => {
    const local = [img("/a", "edited a", "conceptual", "cap"), img("/b", "edited b"), img("/gone")];
    const remote = [img("/b", "old b"), img("/new", "new"), img("/a", "old a")];
    expect(mergeRouteImages(local, remote)).toEqual([
      img("/b", "edited b"),
      img("/new", "new"),
      img("/a", "edited a", "conceptual", "cap"),
    ]);
  });
  it("drops a local caption that was cleared", () => {
    const merged = mergeRouteImages([img("/a")], [{ ...img("/a"), caption: "server" }]);
    expect(merged[0].caption).toBeUndefined();
  });
});

describe("moveUrls", () => {
  const imgs = [img("/a"), img("/b"), img("/c")];
  it("swaps with neighbour", () => {
    expect(moveUrls(imgs, 1, -1)).toEqual(["/b", "/a", "/c"]);
    expect(moveUrls(imgs, 1, 1)).toEqual(["/a", "/c", "/b"]);
  });
  it("returns null at the edges", () => {
    expect(moveUrls(imgs, 0, -1)).toBeNull();
    expect(moveUrls(imgs, 2, 1)).toBeNull();
  });
});

describe("coverUrls", () => {
  const imgs = [img("/a"), img("/b"), img("/c")];
  it("moves the pick to the front", () => {
    expect(coverUrls(imgs, 2)).toEqual(["/c", "/a", "/b"]);
  });
  it("returns null for first or out of range", () => {
    expect(coverUrls(imgs, 0)).toBeNull();
    expect(coverUrls(imgs, 5)).toBeNull();
  });
});

describe("galleryImages", () => {
  it("seeds one screenshot entry from a legacy-only image, titled as alt", () => {
    expect(galleryImages({ image: "/projects/x.png", title: "X" })).toEqual([
      { url: "/projects/x.png", alt: "X", kind: "screenshot" },
    ]);
    expect(galleryImages({ image: "/projects/x.png", title: "" })[0].alt).toBe("Project image");
  });
  it("is empty when image is empty and images undefined", () => {
    expect(galleryImages({ image: "", title: "X" })).toEqual([]);
    expect(galleryImages({ title: "X" })).toEqual([]);
  });
  it("returns a defined images array unchanged, even when empty", () => {
    const empty: ProjectImage[] = [];
    expect(galleryImages({ images: empty, image: "/projects/x.png", title: "X" })).toBe(empty);
  });
});

describe("applyRouteImages", () => {
  const proj = (id: string, extra: Partial<Project> = {}): Project =>
    ({ id, slug: id, title: id, tagline: "", description: "", tech: [], featured: false, image: "", ...extra }) as Project;
  const content = (projects: Project[]) => ({ projects }) as unknown as SiteContent;

  it("applies to the latest state: newer edits and other projects are kept, only images/image change", () => {
    const latest = content([
      proj("p1", { visibility: "hidden", title: "New title", images: [img("/a", "edited alt")], image: "/a" }),
      proj("p2", { title: "Edited p2" }),
    ]);
    const out = applyRouteImages(latest, "p1", [img("/b", "srv"), img("/a", "srv a")]);
    expect(out.projects[0]).toMatchObject({ visibility: "hidden", title: "New title", image: "/b" });
    expect(out.projects[0].images).toEqual([img("/b", "srv"), img("/a", "edited alt")]);
    expect(out.projects[1]).toBe(latest.projects[1]);
  });
  it("does nothing when the project no longer exists", () => {
    const latest = content([proj("p2")]);
    expect(applyRouteImages(latest, "gone", [img("/a")])).toBe(latest);
  });
  it("clears image when the response has no images", () => {
    const out = applyRouteImages(content([proj("p1", { images: [img("/a")], image: "/a" })]), "p1", []);
    expect(out.projects[0]).toMatchObject({ images: [], image: "" });
  });
});
