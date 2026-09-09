import { getAdminSession } from "@/lib/auth/cookies";
import { ApiRequestError, validationError } from "@/lib/api/response";

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    throw new ApiRequestError("UNAUTHORIZED", "请先登录管理员账号。", 401);
  }
  return session;
}

export async function readJsonObject(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw validationError("请求内容必须是有效的 JSON。");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw validationError("请求内容格式不正确。");
  }
  return body as Record<string, unknown>;
}

export function requiredString(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw validationError(`${label}不能为空。`);
  }
  return value.trim();
}

export function optionalString(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw validationError(`${label}格式不正确。`);
  return value.trim();
}

export function optionalNullableString(
  body: Record<string, unknown>,
  key: string,
  label: string,
) {
  const value = body[key];
  if (value === null) return null;
  return optionalString(body, key, label);
}

export function optionalBoolean(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fallback?: boolean,
) {
  const value = body[key];
  if (value === undefined) return arguments.length >= 4 ? fallback : false;
  if (typeof value !== "boolean") throw validationError(`${label}格式不正确。`);
  return value;
}

export function optionalInteger(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fallback?: number,
) {
  const value = body[key];
  if (value === undefined || value === null || value === "") {
    return arguments.length >= 4 ? fallback : 0;
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw validationError(`${label}必须是整数。`);
  }
  return value;
}

export function stringList(
  body: Record<string, unknown>,
  key: string,
  label: string,
  fallback?: string[],
) {
  const value = body[key];
  if (value === undefined || value === null) {
    return arguments.length >= 4 ? fallback : [];
  }
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string" || entry.trim() === "")
  ) {
    throw validationError(`${label}必须是非空字符串数组。`);
  }
  return value.map((entry) => entry.trim());
}
