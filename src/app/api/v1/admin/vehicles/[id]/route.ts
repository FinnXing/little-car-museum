import { prisma } from "@/lib/db/prisma";
import { apiSuccess, notFound, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { vehicleUpdateData } from "@/lib/admin/vehicle-data";
import { parseVehicleInput } from "@/lib/admin/validation";

interface VehicleRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: VehicleRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw notFound("没有找到这辆汽车。");
    return apiSuccess(vehicle);
  });
}

export async function PATCH(request: Request, { params }: VehicleRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const input = parseVehicleInput(await readJsonObject(request), {
      partial: true,
    });
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: vehicleUpdateData(input),
    });
    return apiSuccess(vehicle);
  });
}

export async function DELETE(
  _request: Request,
  { params }: VehicleRouteContext,
) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    return apiSuccess({ deleted: true, vehicle });
  });
}
