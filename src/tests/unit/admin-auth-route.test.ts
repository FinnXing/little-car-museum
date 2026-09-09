import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as login } from "@/app/api/v1/admin/login/route";
import { prisma } from "@/lib/db/prisma";
import {
  clearLoginFailures,
  resetLoginRateLimitsForTests,
} from "@/lib/auth/rate-limit";
import { setAdminSession } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";

vi.mock("@/lib/db/prisma", () => ({
  prisma: { admin: { findUnique: vi.fn() } },
}));
vi.mock("@/lib/auth/cookies", () => ({
  setAdminSession: vi.fn(),
}));
vi.mock("@/lib/auth/password", () => ({
  verifyPassword: vi.fn(),
}));

const adminRecord = {
  id: "admin-1",
  email: "admin@example.com",
  passwordHash: "scrypt$16384$8$1$salt$key",
  role: "ADMIN" as const,
  isActive: true,
  displayName: null,
  lastLoginAt: null,
  createdAt: new Date("2026-09-09T00:00:00.000Z"),
  updatedAt: new Date("2026-09-09T00:00:00.000Z"),
};

afterEach(() => {
  resetLoginRateLimitsForTests();
});

describe("admin login route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(adminRecord);
    vi.mocked(verifyPassword).mockResolvedValue(true);
  });

  it("creates a session for valid credentials", async () => {
    const response = await login(
      new Request("http://localhost/api/v1/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: " ADMIN@EXAMPLE.COM ",
          password: "password123",
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: {
        admin: { id: "admin-1", email: "admin@example.com", role: "ADMIN" },
      },
    });
    expect(setAdminSession).toHaveBeenCalledWith({
      adminId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("does not reveal whether an email exists", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);

    const response = await login(
      new Request("http://localhost/api/v1/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: "missing@example.com",
          password: "password123",
        }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED", message: "邮箱或密码不正确。" },
    });
    expect(setAdminSession).not.toHaveBeenCalled();
  });

  it("returns 429 after repeated failures for the same email and IP", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);
    const request = () =>
      login(
        new Request("http://localhost/api/v1/admin/login", {
          method: "POST",
          body: JSON.stringify({
            email: "admin@example.com",
            password: "password123",
          }),
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": "192.0.2.1",
          },
        }),
      );

    for (let index = 0; index < 5; index += 1) {
      expect((await request()).status).toBe(401);
    }
    expect((await request()).status).toBe(429);
    clearLoginFailures("192.0.2.1:admin@example.com");
  });
});
