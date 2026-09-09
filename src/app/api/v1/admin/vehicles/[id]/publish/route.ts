import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  ApiRequestError,
  notFound,
  withApiErrors,
} from "@/lib/api/response";
import { requireAdminSession } from "@/lib/admin/request";
import { validateVehicleForPublish } from "@/lib/admin/validation";

interface VehicleRouteContext {
  params: Promise<{ id: string }>;
}

const publishInclude = {
  categories: { select: { categoryId: true } },
  assetLicenses: {
    include: {
      assetLicense: {
        select: {
          reviewStatus: true,
          allowPublicDisplay: true,
          authorName: true,
          sourcePageUrl: true,
          licenseName: true,
          licenseUrl: true,
          licenseFileUrl: true,
          acquiredAt: true,
        },
      },
    },
  },
};

export async function POST(_request: Request, { params }: VehicleRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: publishInclude,
    });
    if (!vehicle) throw notFound("没有找到这辆汽车。");

    const errors = validateVehicleForPublish(vehicle);
    if (errors.length > 0) {
      throw new ApiRequestError(
        "PUBLISH_CHECK_FAILED",
        `发布校验未通过：${errors.join("；")}。`,
        422,
      );
    }

    const published = await prisma.vehicle.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    return apiSuccess(published);
  });
}
