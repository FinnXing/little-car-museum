import { validationError } from "@/lib/api/response";

const WINDOW_MS = 60 * 1000;
const MAX_UPLOADS = 30;
const attempts = new Map<string, { count: number; startedAt: number }>();

export function consumeUploadSlot(key: string, now = Date.now()) {
  const current = attempts.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now });
    return;
  }
  if (current.count >= MAX_UPLOADS) {
    const retryAfter = Math.ceil(
      (WINDOW_MS - (now - current.startedAt)) / 1000,
    );
    throw validationError(`上传过于频繁，请 ${retryAfter} 秒后再试。`);
  }
  current.count += 1;
}

export function resetUploadRateLimitForTests() {
  attempts.clear();
}
