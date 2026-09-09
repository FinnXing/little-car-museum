import { afterEach, describe, expect, it, vi } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/session";
import {
  checkLoginRateLimit,
  loginRateLimitPolicy,
  recordLoginFailure,
  resetLoginRateLimitsForTests,
} from "@/lib/auth/rate-limit";

afterEach(() => {
  vi.unstubAllEnvs();
  resetLoginRateLimitsForTests();
});

describe("admin password and session helpers", () => {
  it("hashes passwords and rejects incorrect or malformed values", async () => {
    const encoded = await hashPassword("correct horse battery staple");

    expect(encoded).toMatch(/^scrypt\$16384\$8\$1\$/);
    await expect(
      verifyPassword("correct horse battery staple", encoded),
    ).resolves.toBe(true);
    await expect(verifyPassword("wrong password", encoded)).resolves.toBe(
      false,
    );
    await expect(
      verifyPassword("anything", "not-a-password-hash"),
    ).resolves.toBe(false);
  });

  it("signs sessions and rejects tampering and expiry", async () => {
    vi.stubEnv("AUTH_SECRET", "a".repeat(48));
    const issuedAt = 1_700_000_000_000;
    const token = await createSessionToken(
      { adminId: "admin-1", email: "admin@example.com", role: "ADMIN" },
      issuedAt,
    );

    await expect(verifySessionToken(token, issuedAt + 1_000)).resolves.toEqual({
      adminId: "admin-1",
      email: "admin@example.com",
      role: "ADMIN",
      issuedAt,
      expiresAt: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1_000,
    });
    await expect(
      verifySessionToken(token.replace(/.$/, "x"), issuedAt + 1_000),
    ).resolves.toBeNull();
    await expect(
      verifySessionToken(
        token,
        issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1_000,
      ),
    ).resolves.toBeNull();
  });
});

describe("admin login rate limit", () => {
  it("locks a key after repeated failures and allows it after the lockout", () => {
    const key = "127.0.0.1:admin@example.com";
    const now = 1_700_000_000_000;

    for (let index = 0; index < loginRateLimitPolicy.maxFailures; index += 1) {
      recordLoginFailure(key, now + index);
    }
    expect(checkLoginRateLimit(key, now + 10)).toMatchObject({
      allowed: false,
    });
    expect(
      checkLoginRateLimit(
        key,
        now + loginRateLimitPolicy.lockoutMs + loginRateLimitPolicy.maxFailures,
      ),
    ).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });
});
