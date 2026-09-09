import { listPublicCategories } from "@/lib/api/public";
import { apiSuccess, withApiErrors } from "@/lib/api/response";

export async function GET() {
  return withApiErrors(async () => apiSuccess(await listPublicCategories()));
}
