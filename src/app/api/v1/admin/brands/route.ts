import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseBrandInput } from "@/lib/admin/validation";

export async function GET() {
  return withApiErrors(async () => {
    await requireAdminSession();
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { vehicles: true } } },
      orderBy: [{ sortOrder: "asc" }, { nameCn: "asc" }],
    });
    return apiSuccess(brands);
  });
}

export async function POST(request: Request) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const input = parseBrandInput(await readJsonObject(request));
    const brand = await prisma.brand.create({
      data: {
        slug: input.slug!,
        nameCn: input.nameCn!,
        nameEn: input.nameEn,
        aliases: input.aliases,
        countryRegion: input.countryRegion,
        logoUrl: input.logoUrl,
        descriptionChild: input.descriptionChild,
        pronunciationAudioUrl: input.pronunciationAudioUrl,
        isHot: input.isHot,
        sortOrder: input.sortOrder,
        status: input.status,
        assetLicenseId: input.assetLicenseId,
      },
    });
    return apiSuccess(brand, 201);
  });
}
