import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession } from "@/lib/admin/request";

interface VehicleRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: VehicleRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: "UNPUBLISHED" },
    });
    return apiSuccess(vehicle);
  });
}
