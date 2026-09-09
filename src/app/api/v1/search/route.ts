import { listPublicVehicles } from "@/lib/api/public";
import { parseVehicleListOptions } from "@/lib/api/query";
import { apiSuccess, withApiErrors } from "@/lib/api/response";

export async function GET(request: Request) {
  return withApiErrors(async () =>
    apiSuccess(
      await listPublicVehicles(
        parseVehicleListOptions(request, { requireKeyword: true }),
      ),
    ),
  );
}
