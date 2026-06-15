import { afterEach, describe, expect, it, vi } from "vitest";

const COOKIE_VALUE = vi.hoisted(() => ({ token: undefined as string | undefined }));

// Mock next/headers so isAuthenticated() can be exercised without a request.
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "admin_session" && COOKIE_VALUE.token
        ? { value: COOKIE_VALUE.token }
        : undefined,
  }),
}));

import { signAdminToken, verifyAdminToken, isAuthenticated } from "./auth";

vi.stubEnv("ADMIN_SECRET", "test-secret-at-least-32-bytes-long-xx");

afterEach(() => {
  COOKIE_VALUE.token = undefined;
});

describe("auth", () => {
  it("signs a token that verifies", async () => {
    const token = await signAdminToken();
    expect(token).toBeTypeOf("string");
    expect(await verifyAdminToken(token)).toBe(true);
  });

  it("rejects a tampered/garbage token", async () => {
    expect(await verifyAdminToken("not.a.jwt")).toBe(false);
  });

  it("isAuthenticated is false with no cookie", async () => {
    expect(await isAuthenticated()).toBe(false);
  });

  it("isAuthenticated is true with a valid session cookie", async () => {
    COOKIE_VALUE.token = await signAdminToken();
    expect(await isAuthenticated()).toBe(true);
  });

  it("isAuthenticated is false with an invalid session cookie", async () => {
    COOKIE_VALUE.token = "garbage";
    expect(await isAuthenticated()).toBe(false);
  });
});
