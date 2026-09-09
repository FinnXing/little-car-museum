import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession, readJsonObject } from "@/lib/admin/request";
import { parseLicenseInput } from "@/lib/admin/validation";

export async function GET() {
  return withApiErrors(async () => {
    await requireAdminSession();
    const licenses = await prisma.assetLicense.findMany({
      include: { _count: { select: { vehicles: true, brands: true } } },
      orderBy: [{ updatedAt: "desc" }, { assetName: "asc" }],
    });
    return apiSuccess(licenses);
  });
}

export async function POST(request: Request) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const input = parseLicenseInput(await readJsonObject(request));
    const license = await prisma.assetLicense.create({
      data: {
        assetName: input.assetName!,
        assetType: input.assetType!,
        authorName: input.authorName!,
        sourcePageUrl: input.sourcePageUrl!,
        originalDownloadUrl: input.originalDownloadUrl,
        licenseName: input.licenseName!,
        licenseUrl: input.licenseUrl,
        licenseFileUrl: input.licenseFileUrl,
        acquiredAt: input.acquiredAt!,
        allowPublicDisplay: input.allowPublicDisplay,
        allowModification: input.allowModification,
        allowCommercialUse: input.allowCommercialUse,
        attributionRequired: input.attributionRequired,
        attributionText: input.attributionText,
        containsTrademark: input.containsTrademark,
        modifications: input.modifications,
        sourceScreenshotUrl: input.sourceScreenshotUrl,
        reviewStatus: input.reviewStatus,
      },
    });
    return apiSuccess(license, 201);
  });
}
