import { prisma } from "@/lib/db/prisma";
import { apiSuccess, withApiErrors } from "@/lib/api/response";
import { requireAdminSession } from "@/lib/admin/request";
import { getObjectStorage } from "@/lib/storage/object-storage";

export async function GET() {
  return withApiErrors(async () => {
    await requireAdminSession();
    const assets = await prisma.assetObject.findMany({
      include: {
        uploadedBy: { select: { id: true, email: true, displayName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const storage = getObjectStorage();
    return apiSuccess(
      assets.map((asset) => ({
        ...asset,
        publicUrl: storage.publicUrl(asset.storageKey),
        downloadUrl: `/api/v1/admin/assets/${asset.id}`,
      })),
    );
  });
}
