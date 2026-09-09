import { prisma } from "@/lib/db/prisma";
import { notFound, withApiErrors } from "@/lib/api/response";
import { requireAdminSession } from "@/lib/admin/request";
import { getObjectStorage } from "@/lib/storage/object-storage";

interface AssetRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: AssetRouteContext) {
  return withApiErrors(async () => {
    await requireAdminSession();
    const { id } = await params;
    const asset = await prisma.assetObject.findUnique({ where: { id } });
    if (!asset) throw notFound("没有找到该上传文件。");

    let body: Uint8Array;
    try {
      body = await getObjectStorage().getObject(asset.storageKey);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        throw notFound("上传文件已不存在。");
      }
      throw error;
    }
    return new Response(body as BodyInit, {
      headers: {
        "content-type": asset.mimeType,
        "content-length": String(body.byteLength),
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.safeName)}`,
        "cache-control": "private, no-store",
      },
    });
  });
}
