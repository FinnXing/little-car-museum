import { clearAdminSession } from "@/lib/auth/cookies";
import { apiSuccess, withApiErrors } from "@/lib/api/response";

export async function POST() {
  return withApiErrors(async () => {
    await clearAdminSession();
    return apiSuccess({ loggedOut: true });
  });
}
