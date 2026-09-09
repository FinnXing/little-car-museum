import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseLicenseInput } from "@/lib/admin/validation";

interface LicenseRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: LicenseRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const input = parseLicenseInput(await readJsonObject(request), {
      partial: true,
    });
    const license = await prisma.assetLicense.update({
      where: { id },
      data: input,
    });
    return apiSuccess(license);
  });
}

export async function DELETE(
  _request: Request,
  { params }: LicenseRouteContext,
) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    await prisma.assetLicense.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  });
}
