import { getAdminSession } from "@/lib/auth/cookies";
import { apiSuccess, ApiRequestError, withApiErrors } from "@/lib/api/response";

export async function GET() {
  return withApiErrors(async () => {
    const session = await getAdminSession();
    if (!session) {
      throw new ApiRequestError("UNAUTHORIZED", "请先登录管理员账号。", 401);
    }
    return apiSuccess({ admin: session });
  });
}
