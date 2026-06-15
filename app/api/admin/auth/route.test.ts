import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/admin/auth", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("ADMIN_SECRET", "test-secret-at-least-32-bytes-long-xx");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/admin/auth", () => {
  it("returns 200 and sets a session cookie for the correct password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "hunter2");
    const res = await POST(req({ password: "hunter2" }));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });

    const cookie = res.cookies.get("admin_session");
    expect(cookie?.value).toBeTruthy();
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("strict");
  });

  it("returns 401 for a wrong password", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "hunter2");
    const res = await POST(req({ password: "wrong" }));

    expect(res.status).toBe(401);
    expect(res.cookies.get("admin_session")).toBeUndefined();
  });

  it("returns 500 when ADMIN_PASSWORD is not configured", async () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    const res = await POST(req({ password: "anything" }));

    expect(res.status).toBe(500);
  });
});
