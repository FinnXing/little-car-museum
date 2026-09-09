import { extname } from "node:path";
import { ApiRequestError, validationError } from "@/lib/api/response";
import type { AssetType } from "@/types";

export type ModelQuality = "HIGH" | "LOW";

const ASSET_TYPES = new Set<AssetType>([
  "MODEL",
  "IMAGE",
  "TEXTURE",
  "AUDIO",
  "LOGO",
]);

const MIME_BY_EXTENSION: Record<string, string[]> = {
  ".glb": ["model/gltf-binary", "application/octet-stream"],
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".avif": ["image/avif"],
  ".mp3": ["audio/mpeg", "audio/mp3"],
  ".m4a": ["audio/mp4", "audio/x-m4a"],
  ".ogg": ["audio/ogg", "application/ogg"],
  ".wav": ["audio/wav", "audio/x-wav"],
};

const TYPE_EXTENSIONS: Record<AssetType, string[]> = {
  MODEL: [".glb"],
  IMAGE: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  TEXTURE: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
  AUDIO: [".mp3", ".m4a", ".ogg", ".wav"],
  LOGO: [".jpg", ".jpeg", ".png", ".webp", ".avif"],
};

const DEFAULT_LIMITS_MB = {
  HIGH: 50,
  LOW: 20,
  IMAGE: 5,
  AUDIO: 10,
  LICENSE: 10,
} as const;

function limitFromEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function hasValidHeader(extension: string, bytes: Uint8Array) {
  switch (extension) {
    case ".glb":
      return bytes.length >= 4 && ascii(bytes, 0, 4) === "glTF";
    case ".png":
      return (
        bytes.length >= 8 &&
        bytes[0] === 0x89 &&
        ascii(bytes, 1, 3) === "PNG" &&
        bytes[4] === 0x0d &&
        bytes[5] === 0x0a &&
        bytes[6] === 0x1a &&
        bytes[7] === 0x0a
      );
    case ".jpg":
    case ".jpeg":
      return (
        bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff
      );
    case ".webp":
      return (
        bytes.length >= 12 &&
        ascii(bytes, 0, 4) === "RIFF" &&
        ascii(bytes, 8, 4) === "WEBP"
      );
    case ".avif":
      return (
        bytes.length >= 12 &&
        ascii(bytes, 4, 4) === "ftyp" &&
        [ascii(bytes, 8, 4), ascii(bytes, 12, 4)].some(
          (brand) => brand === "avif" || brand === "avis",
        )
      );
    case ".wav":
      return (
        bytes.length >= 12 &&
        ascii(bytes, 0, 4) === "RIFF" &&
        ascii(bytes, 8, 4) === "WAVE"
      );
    case ".ogg":
      return bytes.length >= 4 && ascii(bytes, 0, 4) === "OggS";
    case ".mp3":
      return (
        (bytes.length >= 3 && ascii(bytes, 0, 3) === "ID3") ||
        (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)
      );
    case ".m4a":
      return bytes.length >= 12 && ascii(bytes, 4, 4) === "ftyp";
    default:
      return false;
  }
}

export function parseUploadAssetType(
  value: FormDataEntryValue | null,
): AssetType {
  if (typeof value !== "string" || !ASSET_TYPES.has(value as AssetType)) {
    throw validationError("素材类型不受支持。");
  }
  return value as AssetType;
}

export function parseModelQuality(
  value: FormDataEntryValue | null,
  assetType: AssetType,
): ModelQuality | undefined {
  if (assetType !== "MODEL") return undefined;
  if (value === null || value === "") return "HIGH";
  if (value !== "HIGH" && value !== "LOW")
    throw validationError("模型清晰度只能是 HIGH 或 LOW。");
  return value;
}

export function maxUploadBytes(assetType: AssetType, quality?: ModelQuality) {
  if (assetType === "MODEL") {
    const envName =
      quality === "LOW" ? "MAX_LOW_MODEL_SIZE_MB" : "MAX_HIGH_MODEL_SIZE_MB";
    const fallback =
      quality === "LOW" ? DEFAULT_LIMITS_MB.LOW : DEFAULT_LIMITS_MB.HIGH;
    return limitFromEnv(envName, fallback) * 1024 * 1024;
  }
  if (assetType === "AUDIO")
    return (
      limitFromEnv("MAX_AUDIO_SIZE_MB", DEFAULT_LIMITS_MB.AUDIO) * 1024 * 1024
    );
  return (
    limitFromEnv("MAX_IMAGE_SIZE_MB", DEFAULT_LIMITS_MB.IMAGE) * 1024 * 1024
  );
}

export function sanitizeOriginalName(name: string) {
  const normalized = name.normalize("NFKC");
  const extension = extname(normalized).toLowerCase();
  const base = normalized
    .slice(0, Math.max(0, normalized.length - extension.length))
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, 80);
  return `${base || "upload"}${extension}`;
}

export function validateUploadFile({
  name,
  mimeType,
  size,
  bytes,
  assetType,
  quality,
}: {
  name: string;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
  assetType: AssetType;
  quality?: ModelQuality;
}) {
  const extension = extname(name).toLowerCase();
  if (!TYPE_EXTENSIONS[assetType].includes(extension)) {
    throw new ApiRequestError(
      "FILE_TYPE_NOT_ALLOWED",
      `不允许上传 ${assetType} 类型的 ${extension || "该文件"} 文件。`,
    );
  }
  const allowedMimes = MIME_BY_EXTENSION[extension] ?? [];
  if (!mimeType || !allowedMimes.includes(mimeType.toLowerCase())) {
    throw new ApiRequestError(
      "FILE_TYPE_NOT_ALLOWED",
      "文件 MIME 类型与扩展名不匹配。",
    );
  }
  const maxBytes = maxUploadBytes(assetType, quality);
  if (size <= 0 || size > maxBytes) {
    throw new ApiRequestError(
      "FILE_TOO_LARGE",
      `文件大小必须大于 0 且不超过 ${(maxBytes / 1024 / 1024).toFixed(0)}MB。`,
    );
  }
  if (!hasValidHeader(extension, bytes)) {
    throw new ApiRequestError(
      "FILE_TYPE_NOT_ALLOWED",
      "文件头校验失败，文件内容与扩展名不匹配。",
    );
  }
  return {
    extension,
    safeName: sanitizeOriginalName(name),
    maxBytes,
  };
}
