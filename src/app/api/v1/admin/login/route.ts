import { prisma } from "@/lib/db/prisma";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/auth/rate-limit";
import { setAdminSession } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";
import {
  apiSuccess,
  ApiRequestError,
  validationError,
  withApiErrors,
} from "@/lib/api/response";

interface LoginPayload {
  email?: unknown;
  password?: unknown;
}

function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isLoginPayload(value: unknown): value is LoginPayload {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  return withApiErrors(async () => {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      throw validationError("登录请求格式不正确。");
    }

    if (!isLoginPayload(payload)) {
      throw validationError("登录请求格式不正确。");
    }

    const email =
      typeof payload.email === "string"
        ? payload.email.trim().toLowerCase()
        : "";
    const password =
      typeof payload.password === "string" ? payload.password : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw validationError("请输入有效的管理员邮箱。");
    }
    if (password.length < 8 || password.length > 200) {
      throw validationError("密码长度应为 8 到 200 个字符。");
    }

    const rateLimitKey = requestIp(request) + ":" + email;
    const rateLimit = checkLoginRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      throw new ApiRequestError(
        "UNAUTHORIZED",
        `登录尝试过多，请 ${rateLimit.retryAfterSeconds} 秒后再试。`,
        429,
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
    const passwordMatches = admin
      ? await verifyPassword(password, admin.passwordHash)
      : false;

    if (!admin || !admin.isActive || !passwordMatches) {
      recordLoginFailure(rateLimitKey);
      throw new ApiRequestError("UNAUTHORIZED", "邮箱或密码不正确。", 401);
    }

    clearLoginFailures(rateLimitKey);
    await setAdminSession({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return apiSuccess({
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  });
}
