import { getRandomPublicVehicle } from "@/lib/api/public";
import { apiSuccess, notFound, withApiErrors } from "@/lib/api/response";

export async function GET() {
  return withApiErrors(async () => {
    const vehicle = await getRandomPublicVehicle();
    if (!vehicle) throw notFound("现在还没有可展示的汽车。");
    return apiSuccess(vehicle);
  });
}
