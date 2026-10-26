import { afterEach, describe, expect, it, vi } from "vitest";
import { PHOTO_MAX_BYTES, resolvePhoto } from "./share-card";

function stubFetch(type: string | null, ok = true, body: Uint8Array<ArrayBuffer> = new Uint8Array([1, 2, 3]), length?: number) {
  const headers: Record<string, string> = {};
  if (type) headers["content-type"] = type;
  if (length !== undefined) headers["content-length"] = String(length);
  const fetch = vi.fn().mockResolvedValue(new Response(body, { status: ok ? 200 : 404, headers }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
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

  it("passes a timeout signal to fetch", async () => {
    const fetch = stubFetch("image/png");
    await resolvePhoto("/about.png");
    expect(fetch).toHaveBeenCalledWith(expect.any(String), { signal: expect.any(AbortSignal) });
  });

  it("returns null when content-length is over the limit", async () => {
    stubFetch("image/png", true, new Uint8Array([1, 2, 3]), PHOTO_MAX_BYTES + 1);
    expect(await resolvePhoto("/about.png")).toBeNull();
  });

  it("returns null when the body runs over the limit without a content-length", async () => {
    stubFetch("image/png", true, new Uint8Array(PHOTO_MAX_BYTES + 1));
    expect(await resolvePhoto("/about.png")).toBeNull();
  });

  it("accepts a photo exactly at the limit", async () => {
    stubFetch("image/png", true, new Uint8Array(PHOTO_MAX_BYTES));
    expect((await resolvePhoto("/about.png"))?.startsWith("data:image/png;base64,")).toBe(true);
  });
});
