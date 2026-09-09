import { getPublicVehicleBySlug } from "@/lib/api/public";
import { apiSuccess, notFound, withApiErrors } from "@/lib/api/response";

interface VehicleRouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: VehicleRouteContext) {
  return withApiErrors(async () => {
    const { slug } = await params;
    const vehicle = await getPublicVehicleBySlug(slug);
    if (!vehicle) throw notFound("没有找到这辆汽车。");
    return apiSuccess(vehicle);
  });
}
