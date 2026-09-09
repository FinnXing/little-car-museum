import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError } from "@/lib/api/response";
import {
  maxUploadBytes,
  parseModelQuality,
  parseUploadAssetType,
  sanitizeOriginalName,
  validateUploadFile,
} from "@/lib/storage/upload";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("asset upload validation", () => {
  it("accepts a GLB with matching MIME and header and sanitizes its name", () => {
    const result = validateUploadFile({
      name: "../我的车.glb",
      mimeType: "model/gltf-binary",
      size: 16,
      bytes: new Uint8Array([0x67, 0x6c, 0x54, 0x46, 2, 0, 0, 0]),
      assetType: "MODEL",
      quality: "LOW",
    });

    expect(result.safeName).toBe("我的车.glb");
    expect(maxUploadBytes("MODEL", "LOW")).toBe(20 * 1024 * 1024);
  });

  it("rejects spoofed headers, mismatched types, and oversized files", () => {
    expect(() =>
      validateUploadFile({
        name: "car.glb",
        mimeType: "model/gltf-binary",
        size: 8,
        bytes: new Uint8Array(8),
        assetType: "MODEL",
        quality: "HIGH",
      }),
    ).toThrowError(ApiRequestError);

    expect(() =>
      validateUploadFile({
        name: "car.png",
        mimeType: "image/jpeg",
        size: 8,
        bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        assetType: "IMAGE",
      }),
    ).toThrowError("MIME");

    vi.stubEnv("MAX_IMAGE_SIZE_MB", "0.00001");
    expect(() =>
      validateUploadFile({
        name: "car.png",
        mimeType: "image/png",
        size: 100,
        bytes: new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        assetType: "IMAGE",
      }),
    ).toThrowError("文件大小");
  });

  it("parses supported asset types and model qualities", () => {
    expect(parseUploadAssetType("AUDIO")).toBe("AUDIO");
    expect(parseModelQuality(null, "MODEL")).toBe("HIGH");
    expect(parseModelQuality("LOW", "MODEL")).toBe("LOW");
    expect(parseModelQuality("LOW", "IMAGE")).toBeUndefined();
    expect(() => parseUploadAssetType("VIDEO")).toThrowError(ApiRequestError);
    expect(() => parseModelQuality("MEDIUM", "MODEL")).toThrowError(
      ApiRequestError,
    );
    expect(sanitizeOriginalName("../../bad name?.PNG")).toBe("bad-name.png");
  });
});
