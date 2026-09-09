export const ADMIN_SESSION_COOKIE = "little-car-museum-admin-session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export interface AdminSession {
  adminId: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  issuedAt: number;
  expiresAt: number;
}

function authSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  return secret;
}

function encode(value: string) {
  return new TextEncoder().encode(value);
}

function base64UrlEncode(value: Uint8Array) {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return base64UrlEncode(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encode(value))),
  );
}

export async function createSessionToken(
  session: Omit<AdminSession, "issuedAt" | "expiresAt">,
  now = Date.now(),
) {
  const secret = authSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET must contain at least 32 characters.");
  }

  const payload: AdminSession = {
    ...session,
    issuedAt: now,
    expiresAt: now + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = base64UrlEncode(encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, secret);
  return encodedPayload + "." + signature;
}

export async function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
) {
  if (!token) return null;
  const secret = authSecret();
  if (!secret) return null;

  const [encodedPayload, signature, ...extra] = token.split(".");
  if (!encodedPayload || !signature || extra.length > 0) return null;

  try {
    const expectedSignature = await sign(encodedPayload, secret);
    const actualBytes = base64UrlDecode(signature);
    const expectedBytes = base64UrlDecode(expectedSignature);
    if (actualBytes.length !== expectedBytes.length) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      actualBytes,
      encode(encodedPayload),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(encodedPayload)),
    ) as Partial<AdminSession>;
    if (
      typeof payload.adminId !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "EDITOR") ||
      typeof payload.issuedAt !== "number" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt <= now
    ) {
      return null;
    }
    return payload as AdminSession;
  } catch {
    return null;
  }
}
