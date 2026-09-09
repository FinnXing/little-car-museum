import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseCategoryInput } from "@/lib/admin/validation";

interface CategoryRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: CategoryRouteContext,
) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const input = parseCategoryInput(await readJsonObject(request), {
      partial: true,
    });
    const category = await prisma.category.update({
      where: { id },
      data: input,
    });
    return apiSuccess(category);
  });
}

export async function DELETE(
  _request: Request,
  { params }: CategoryRouteContext,
) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    await prisma.category.delete({ where: { id } });
    return apiSuccess({ deleted: true });
  });
}
