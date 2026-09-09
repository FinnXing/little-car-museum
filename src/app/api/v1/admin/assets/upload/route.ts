import { prisma } from "@/lib/db/prisma";
import {
  apiSuccess,
  ApiRequestError,
  validationError,
  withApiErrors,
} from "@/lib/api/response";
import { requireAdminSession } from "@/lib/admin/request";
import {
  checksumSha256,
  createObjectKey,
  getObjectStorage,
} from "@/lib/storage/object-storage";
import { consumeUploadSlot } from "@/lib/storage/upload-rate-limit";
import {
  maxUploadBytes,
  parseModelQuality,
  parseUploadAssetType,
  validateUploadFile,
} from "@/lib/storage/upload";

export async function POST(request: Request) {
  return withApiErrors(async () => {
    const session = await requireAdminSession();
    consumeUploadSlot(session.adminId);

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      throw validationError("上传请求必须使用 multipart/form-data。");
    }

    const fileEntry = formData.get("file");
    if (
      !fileEntry ||
      typeof fileEntry === "string" ||
      typeof fileEntry.arrayBuffer !== "function"
    ) {
      throw validationError("请选择要上传的文件。");
    }
    const assetType = parseUploadAssetType(formData.get("assetType"));
    const quality = parseModelQuality(formData.get("quality"), assetType);
    const file = fileEntry as File;
    const originalName = file.name || "upload";
    const declaredSize = Number(file.size);
    const maxBytes = maxUploadBytes(assetType, quality);
    if (!Number.isFinite(declaredSize) || declaredSize <= 0) {
      throw validationError("文件大小不正确。");
    }
    if (declaredSize > maxBytes) {
      throw new ApiRequestError(
        "FILE_TOO_LARGE",
        `文件大小必须不超过 ${(maxBytes / 1024 / 1024).toFixed(0)}MB。`,
      );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateUploadFile({
      name: originalName,
      mimeType: file.type,
      size: bytes.byteLength,
      bytes: bytes.slice(0, 32),
      assetType,
      quality,
    });
    const objectKey = createObjectKey(assetType, validated.safeName);
    const storage = getObjectStorage();
    await storage.putObject({
      key: objectKey,
      body: bytes,
      contentType: file.type,
    });

    try {
      const asset = await prisma.assetObject.create({
        data: {
          storageKey: objectKey,
          originalName,
          safeName: validated.safeName,
          assetType,
          quality,
          mimeType: file.type,
          sizeBytes: bytes.byteLength,
          checksumSha256: checksumSha256(bytes),
          uploadedById: session.adminId,
        },
      });
      return apiSuccess(
        {
          ...asset,
          publicUrl: storage.publicUrl(objectKey),
          downloadUrl: `/api/v1/admin/assets/${asset.id}`,
        },
        201,
      );
    } catch (error) {
      await storage.deleteObject(objectKey).catch(() => undefined);
      throw error;
    }
  });
}
