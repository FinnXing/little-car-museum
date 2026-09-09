const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface LoginAttempt {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
}

const attempts = new Map<string, LoginAttempt>();

function prune(now: number) {
  for (const [key, attempt] of attempts) {
    if (
      attempt.blockedUntil <= now &&
      attempt.firstFailureAt + WINDOW_MS <= now
    ) {
      attempts.delete(key);
    }
  }
}

export function checkLoginRateLimit(key: string, now = Date.now()) {
  prune(now);
  const attempt = attempts.get(key);
  if (!attempt || attempt.blockedUntil <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return {
    allowed: false,
    retryAfterSeconds: Math.ceil((attempt.blockedUntil - now) / 1000),
  };
}

export function recordLoginFailure(key: string, now = Date.now()) {
  const current = attempts.get(key);
  const attempt =
    current && current.firstFailureAt + WINDOW_MS > now
      ? current
      : { failures: 0, firstFailureAt: now, blockedUntil: 0 };

  attempt.failures += 1;
  if (attempt.failures >= MAX_FAILURES) {
    attempt.blockedUntil = now + LOCKOUT_MS;
  }
  attempts.set(key, attempt);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

export function resetLoginRateLimitsForTests() {
  attempts.clear();
}

export const loginRateLimitPolicy = {
  windowMs: WINDOW_MS,
  maxFailures: MAX_FAILURES,
  lockoutMs: LOCKOUT_MS,
} as const;
