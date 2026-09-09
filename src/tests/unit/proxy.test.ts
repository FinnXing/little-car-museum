import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth/session";
import { proxy } from "@/proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin route proxy", () => {
  it("allows the login page and login endpoint without a session", async () => {
    const pageResponse = await proxy(
      new NextRequest("http://localhost/admin/login"),
    );
    const apiResponse = await proxy(
      new NextRequest("http://localhost/api/v1/admin/login"),
    );

    expect(pageResponse.status).toBe(200);
    expect(apiResponse.status).toBe(200);
  });

  it("returns a JSON error for protected API requests", async () => {
    const response = await proxy(
      new NextRequest("http://localhost/api/v1/admin/session"),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
  });

  it("redirects protected pages and accepts a valid signed session", async () => {
    vi.stubEnv("AUTH_SECRET", "a".repeat(48));
    const redirectResponse = await proxy(
      new NextRequest("http://localhost/admin/vehicles?draft=true"),
    );
    expect(redirectResponse.status).toBe(307);
    expect(redirectResponse.headers.get("location")).toContain(
      "/admin/login?next=%2Fadmin%2Fvehicles%3Fdraft%3Dtrue",
    );

    const token = await createSessionToken({
      adminId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });
    const request = new NextRequest("http://localhost/admin/vehicles");
    request.cookies.set("little-car-museum-admin-session", token);
    const response = await proxy(request);

    expect(response.status).toBe(200);
  });
});
