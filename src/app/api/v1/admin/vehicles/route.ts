import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { vehicleCreateData } from "@/lib/admin/vehicle-data";
import { parseVehicleInput } from "@/lib/admin/validation";

const adminVehicleInclude = {
  brand: { select: { id: true, slug: true, nameCn: true, nameEn: true } },
  categories: { include: { category: true } },
  colors: { orderBy: { sortOrder: "asc" } },
  hotspots: { orderBy: { sortOrder: "asc" } },
  assetLicenses: { include: { assetLicense: true } },
} satisfies Prisma.VehicleInclude;

export async function GET() {
  return withApiErrors(async () => {
    await requireAdminSession();
    const vehicles = await prisma.vehicle.findMany({
      include: adminVehicleInclude,
      orderBy: [{ sortOrder: "asc" }, { nameCn: "asc" }],
    });
    return apiSuccess(vehicles);
  });
}

export async function POST(request: Request) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const input = parseVehicleInput(await readJsonObject(request));
    const vehicle = await prisma.vehicle.create({
      data: vehicleCreateData(input),
      include: adminVehicleInclude,
    });
    return apiSuccess(vehicle, 201);
  });
}
