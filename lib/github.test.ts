import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRepoInfo, putRepoImage, moveRepoImage } from "./github";

beforeEach(() => {
  vi.stubEnv("GITHUB_TOKEN", "test-token");
  vi.stubEnv("GITHUB_OWNER", "erickmclark");
  vi.stubEnv("GITHUB_REPO", "portfolio");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 404,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("getRepoInfo", () => {
  it("formats the title and tech list from the GitHub API", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ name: "my-cool-repo", description: "Does cool things" })
      )
      .mockResolvedValueOnce(jsonResponse({ TypeScript: 100, CSS: 20 }));
    vi.stubGlobal("fetch", fetchMock);

    const info = await getRepoInfo("erickmclark", "my-cool-repo");

    expect(info.title).toBe("My Cool Repo");
    expect(info.tagline).toBe("Does cool things");
    expect(info.tech).toEqual(["TypeScript", "CSS"]);
  });

  it("throws when the repo is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({}, false))
        .mockResolvedValueOnce(jsonResponse({}, false))
    );
    await expect(getRepoInfo("erickmclark", "nope")).rejects.toThrow(/not found/i);
  });
});

describe("putRepoImage", () => {
  it("fetches the existing SHA, then PUTs base64 content", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ sha: "existing-sha" })) // GET existing file
      .mockResolvedValueOnce(jsonResponse({ content: { sha: "new-sha" } })); // PUT
    vi.stubGlobal("fetch", fetchMock);

    const result = await putRepoImage(
      "prepera",
      "data:image/png;base64,AAAA"
    );

    expect(result).toBe("/projects/prepera.png");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // The PUT body strips the data-URI prefix and includes the fetched SHA.
    const putBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(putBody.content).toBe("AAAA");
    expect(putBody.sha).toBe("existing-sha");
  });

  it("uploads without a SHA when the file does not yet exist", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, false)) // GET 404 — no existing file
      .mockResolvedValueOnce(jsonResponse({ content: { sha: "new-sha" } }));
    vi.stubGlobal("fetch", fetchMock);

    await putRepoImage("brand-new", "data:image/png;base64,BBBB");

    const putBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(putBody.content).toBe("BBBB");
    expect(putBody.sha).toBeUndefined();
  });
});

describe("moveRepoImage", () => {
  it("copies the source file to the new slug path then deletes the old one", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ content: "AA\nAA\n", sha: "src-sha" })) // GET source
      .mockResolvedValueOnce(jsonResponse({}, false)) // GET dest — 404, no existing file
      .mockResolvedValueOnce(jsonResponse({ content: { sha: "dest-sha" } })) // PUT dest
      .mockResolvedValueOnce(jsonResponse({ commit: { sha: "del-sha" } })); // DELETE source
    vi.stubGlobal("fetch", fetchMock);

    const result = await moveRepoImage("old-slug", "new-slug");

    expect(result).toEqual({ moved: true, imagePath: "/projects/new-slug.png" });
    expect(fetchMock).toHaveBeenCalledTimes(4);

    // Source GET hits the old path; dest PUT writes the whitespace-stripped content.
    expect(fetchMock.mock.calls[0][0]).toContain("public/projects/old-slug.png");
    expect(fetchMock.mock.calls[2][0]).toContain("public/projects/new-slug.png");
    expect(fetchMock.mock.calls[2][1].method).toBe("PUT");
    expect(JSON.parse(fetchMock.mock.calls[2][1].body).content).toBe("AAAA");

    // The DELETE targets the old path with the source SHA.
    expect(fetchMock.mock.calls[3][0]).toContain("public/projects/old-slug.png");
    expect(fetchMock.mock.calls[3][1].method).toBe("DELETE");
    expect(JSON.parse(fetchMock.mock.calls[3][1].body).sha).toBe("src-sha");
  });

  it("is a no-op when the source file does not exist", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({}, false)); // GET source 404
    vi.stubGlobal("fetch", fetchMock);

    const result = await moveRepoImage("never-uploaded", "renamed");

    expect(result).toEqual({ moved: false, imagePath: "/projects/renamed.png" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
