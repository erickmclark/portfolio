import { afterEach, describe, expect, it, vi } from "vitest";
import { resolvePhoto } from "./share-card";

function stubFetch(type: string | null, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      headers: new Headers(type ? { "content-type": type } : {}),
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    }),
  );
}

// Satori only decodes png, apng, gif, jpeg and webp; anything else throws and 500s the card.
describe("resolvePhoto", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns null for image/avif", async () => {
    stubFetch("image/avif");
    expect(await resolvePhoto("/about.avif")).toBeNull();
  });

  it("returns null for image/svg+xml", async () => {
    stubFetch("image/svg+xml");
    expect(await resolvePhoto("/about.svg")).toBeNull();
  });

  it("returns a data URI for image/png", async () => {
    stubFetch("image/png");
    const out = await resolvePhoto("/about.png");
    expect(out?.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("strips content-type parameters", async () => {
    stubFetch("image/jpeg; charset=binary");
    const out = await resolvePhoto("/about.jpg");
    expect(out?.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("returns null for a non-OK response", async () => {
    stubFetch("image/png", false);
    expect(await resolvePhoto("/about.png")).toBeNull();
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await resolvePhoto("/about.png")).toBeNull();
  });
});
