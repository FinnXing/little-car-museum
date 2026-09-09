import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseCategoryInput } from "@/lib/admin/validation";

export async function GET() {
  return withApiErrors(async () => {
    await requireAdminSession();
    const categories = await prisma.category.findMany({
      include: { _count: { select: { vehicles: true } } },
      orderBy: [{ sortOrder: "asc" }, { nameCn: "asc" }],
    });
    return apiSuccess(categories);
  });
}

export async function POST(request: Request) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const input = parseCategoryInput(await readJsonObject(request));
    const category = await prisma.category.create({
      data: {
        slug: input.slug!,
        nameCn: input.nameCn!,
        nameEn: input.nameEn,
        iconUrl: input.iconUrl,
        description: input.description,
        sortOrder: input.sortOrder,
        enabled: input.enabled,
      },
    });
    return apiSuccess(category, 201);
  });
}
