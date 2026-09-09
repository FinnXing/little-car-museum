import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_ADMIN_PATHS = new Set(["/admin/login", "/api/v1/admin/login"]);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (PUBLIC_ADMIN_PATHS.has(pathname)) return NextResponse.next();

  const session = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/v1/admin/")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "请先登录管理员账号。",
          requestId: crypto.randomUUID(),
        },
      },
      { status: 401 },
    );
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};
