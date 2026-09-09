import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as upload } from "@/app/api/v1/admin/assets/upload/route";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/admin/request";
import { getObjectStorage } from "@/lib/storage/object-storage";

vi.mock("@/lib/db/prisma", () => ({
  prisma: { assetObject: { create: vi.fn() } },
}));
vi.mock("@/lib/admin/request", () => ({
  requireAdminSession: vi.fn(),
}));
vi.mock("@/lib/storage/upload-rate-limit", () => ({
  consumeUploadSlot: vi.fn(),
}));
vi.mock("@/lib/storage/object-storage", () => ({
  checksumSha256: vi.fn(() => "checksum"),
  createObjectKey: vi.fn(() => "assets/image/2026/09/09/random-car.png"),
  getObjectStorage: vi.fn(),
}));

const assetRecord = {
  id: "asset-1",
  storageKey: "assets/image/2026/09/09/random-car.png",
  originalName: "car.png",
  safeName: "car.png",
  assetType: "IMAGE" as const,
  quality: null,
  mimeType: "image/png",
  sizeBytes: 8,
  checksumSha256: "checksum",
  uploadedById: "admin-1",
  createdAt: new Date("2026-09-09T00:00:00.000Z"),
};

const storage = {
  putObject: vi.fn(),
  deleteObject: vi.fn(),
  getObject: vi.fn(),
  publicUrl: vi.fn(() => null),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdminSession).mockResolvedValue({
    adminId: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    issuedAt: Date.now(),
    expiresAt: Date.now() + 60_000,
  });
  vi.mocked(getObjectStorage).mockReturnValue(storage);
  vi.mocked(prisma.assetObject.create).mockResolvedValue(assetRecord);
});

afterEach(() => {
  vi.mocked(storage.putObject).mockReset();
  vi.mocked(storage.deleteObject).mockReset();
});

function requestFor(file: File, assetType = "IMAGE") {
  const form = new FormData();
  form.append("file", file);
  form.append("assetType", assetType);
  const request = new Request("http://localhost/api/v1/admin/assets/upload", {
    method: "POST",
  });
  Object.defineProperty(request, "formData", {
    value: () => Promise.resolve(form),
  });
  return request;
}

describe("admin asset upload route", () => {
  it("stores a validated file and records its uploader", async () => {
    const response = await upload(
      requestFor(
        new File(
          [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
          "../car.png",
          { type: "image/png" },
        ),
      ),
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { id: "asset-1", downloadUrl: "/api/v1/admin/assets/asset-1" },
    });
    expect(storage.putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: assetRecord.storageKey,
        contentType: "image/png",
      }),
    );
    expect(prisma.assetObject.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        uploadedById: "admin-1",
        assetType: "IMAGE",
      }),
    });
  });

  it("returns a typed error for invalid file content", async () => {
    const response = await upload(
      requestFor(
        new File([new Uint8Array([1, 2, 3])], "car.png", { type: "image/png" }),
      ),
    );
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      success: false,
      error: { code: "FILE_TYPE_NOT_ALLOWED" },
    });
    expect(storage.putObject).not.toHaveBeenCalled();
  });
});
