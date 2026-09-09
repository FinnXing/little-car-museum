import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseBrandInput } from "@/lib/admin/validation";

interface BrandRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: BrandRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const input = parseBrandInput(await readJsonObject(request), {
      partial: true,
    });
    const brand = await prisma.brand.update({ where: { id }, data: input });
    return apiSuccess(brand);
  });
}

export async function DELETE(_request: Request, { params }: BrandRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    await prisma.brand.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  });
}
