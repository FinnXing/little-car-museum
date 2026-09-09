import type {
  AssetReviewStatus,
  AssetType,
  ContentStatus,
  DisplayType,
  EnergyType,
} from "@/types";
import { validationError } from "@/lib/api/response";
import {
  optionalBoolean,
  optionalInteger,
  optionalNullableString,
  optionalString,
  requiredString,
  stringList,
} from "./request";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DISPLAY_TYPES = new Set<DisplayType>([
  "REAL_3D",
  "GENERIC_3D",
  "IMAGE_SET",
  "STATIC_IMAGE",
]);
const ENERGY_TYPES = new Set<EnergyType>([
  "FUEL",
  "ELECTRIC",
  "HYBRID",
  "OTHER",
]);
const CONTENT_STATUSES = new Set<ContentStatus>([
  "DRAFT",
  "PENDING_REVIEW",
  "PUBLISHED",
  "UNPUBLISHED",
  "ARCHIVED",
]);
const ASSET_TYPES = new Set<AssetType>([
  "MODEL",
  "IMAGE",
  "TEXTURE",
  "AUDIO",
  "LOGO",
]);
const ASSET_REVIEW_STATUSES = new Set<AssetReviewStatus>([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

function slugValue(body: Record<string, unknown>, required: boolean) {
  const value = required
    ? requiredString(body, "slug", "slug")
    : optionalString(body, "slug", "slug");
  if (value && !SLUG_PATTERN.test(value)) {
    throw validationError("slug 只能包含小写字母、数字和连字符。");
  }
  return value;
}

function enumValue<T extends string>(
  body: Record<string, unknown>,
  key: string,
  label: string,
  values: Set<T>,
  required: boolean,
) {
  const value = required
    ? requiredString(body, key, label)
    : optionalString(body, key, label);
  if (value && !values.has(value as T)) {
    throw validationError(`${label} 取值不受支持。`);
  }
  return value as T | undefined;
}

export interface CategoryInput {
  slug?: string;
  nameCn?: string;
  nameEn?: string;
  iconUrl?: string | null;
  description?: string | null;
  sortOrder?: number;
  enabled?: boolean;
}

export function parseCategoryInput(
  body: Record<string, unknown>,
  { partial = false } = {},
): CategoryInput {
  return {
    slug: slugValue(body, !partial),
    nameCn: partial
      ? optionalString(body, "nameCn", "中文名称")
      : requiredString(body, "nameCn", "中文名称"),
    nameEn: optionalString(body, "nameEn", "英文名称"),
    iconUrl: optionalNullableString(body, "iconUrl", "图标地址"),
    description: optionalNullableString(body, "description", "描述"),
    sortOrder: optionalInteger(body, "sortOrder", "排序值"),
    enabled: optionalBoolean(
      body,
      "enabled",
      "启用状态",
      partial ? undefined : true,
    ),
  };
}

export interface BrandInput {
  slug?: string;
  nameCn?: string;
  nameEn?: string;
  aliases?: string[];
  countryRegion?: string | null;
  logoUrl?: string | null;
  descriptionChild?: string | null;
  pronunciationAudioUrl?: string | null;
  isHot?: boolean;
  sortOrder?: number;
  status?: ContentStatus;
  assetLicenseId?: string | null;
}

export function parseBrandInput(
  body: Record<string, unknown>,
  { partial = false } = {},
): BrandInput {
  return {
    slug: slugValue(body, !partial),
    nameCn: partial
      ? optionalString(body, "nameCn", "中文名称")
      : requiredString(body, "nameCn", "中文名称"),
    nameEn: optionalString(body, "nameEn", "英文名称"),
    aliases:
      body.aliases === undefined
        ? undefined
        : stringList(body, "aliases", "别名"),
    countryRegion: optionalNullableString(body, "countryRegion", "国家或地区"),
    logoUrl: optionalNullableString(body, "logoUrl", "Logo 地址"),
    descriptionChild: optionalNullableString(
      body,
      "descriptionChild",
      "儿童版简介",
    ),
    pronunciationAudioUrl: optionalNullableString(
      body,
      "pronunciationAudioUrl",
      "名称语音地址",
    ),
    isHot: optionalBoolean(
      body,
      "isHot",
      "热门状态",
      partial ? undefined : false,
    ),
    sortOrder: optionalInteger(
      body,
      "sortOrder",
      "排序值",
      partial ? undefined : 0,
    ),
    status: enumValue(body, "status", "发布状态", CONTENT_STATUSES, false),
    assetLicenseId: optionalNullableString(body, "assetLicenseId", "许可证 ID"),
  };
}

export interface VehicleColorInput {
  nameCn: string;
  colorValue: string;
  materialNames: string[];
  isOfficialColor: boolean;
  sortOrder: number;
}

export interface HotspotInput {
  partName: string;
  position: Record<string, number>;
  descriptionChild?: string;
  audioUrl?: string;
  cameraPosition?: Record<string, number>;
  cameraTarget?: Record<string, number>;
  enabled: boolean;
  sortOrder: number;
}

function vectorValue(value: unknown, label: string) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw validationError(`${label} 必须是包含 x、y、z 的对象。`);
  }
  const vector = value as Record<string, unknown>;
  if (
    typeof vector.x !== "number" ||
    typeof vector.y !== "number" ||
    typeof vector.z !== "number" ||
    !Number.isFinite(vector.x) ||
    !Number.isFinite(vector.y) ||
    !Number.isFinite(vector.z)
  ) {
    throw validationError(`${label} 必须是包含有效数字 x、y、z 的对象。`);
  }
  return { x: vector.x, y: vector.y, z: vector.z };
}

function parseColors(value: unknown): VehicleColorInput[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError("颜色必须是数组。");
  return value.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw validationError(`第 ${index + 1} 个颜色格式不正确。`);
    }
    const color = entry as Record<string, unknown>;
    const nameCn = requiredString(color, "nameCn", "颜色名称");
    const colorValue = requiredString(color, "colorValue", "颜色值");
    return {
      nameCn,
      colorValue,
      materialNames: stringList(color, "materialNames", "材质名称", [])!,
      isOfficialColor: optionalBoolean(
        color,
        "isOfficialColor",
        "官方颜色状态",
        false,
      )!,
      sortOrder: optionalInteger(color, "sortOrder", "颜色排序值", 0)!,
    };
  });
}

function parseHotspots(value: unknown): HotspotInput[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw validationError("热点必须是数组。");
  return value.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw validationError(`第 ${index + 1} 个热点格式不正确。`);
    }
    const hotspot = entry as Record<string, unknown>;
    return {
      partName: requiredString(hotspot, "partName", "部件名称"),
      position: vectorValue(hotspot.position, "热点位置"),
      descriptionChild: optionalString(
        hotspot,
        "descriptionChild",
        "儿童版说明",
      ),
      audioUrl: optionalString(hotspot, "audioUrl", "热点语音地址"),
      cameraPosition:
        hotspot.cameraPosition === undefined
          ? undefined
          : vectorValue(hotspot.cameraPosition, "热点相机位置"),
      cameraTarget:
        hotspot.cameraTarget === undefined
          ? undefined
          : vectorValue(hotspot.cameraTarget, "热点相机目标"),
      enabled: optionalBoolean(hotspot, "enabled", "热点启用状态", true)!,
      sortOrder: optionalInteger(hotspot, "sortOrder", "热点排序值", 0)!,
    };
  });
}

export interface VehicleInput {
  slug?: string;
  brandId?: string | null;
  categoryIds?: string[];
  nameCn?: string;
  nameEn?: string;
  childName?: string;
  aliases?: string[];
  tags?: string[];
  displayType?: DisplayType;
  isRealModel?: boolean;
  energyType?: EnergyType;
  seatCount?: number;
  childDescription?: string;
  coverImageUrl?: string;
  thumbnailUrl?: string | null;
  highModelUrl?: string | null;
  lowModelUrl?: string | null;
  fallbackImageUrls?: string[];
  pronunciationAudioUrl?: string | null;
  defaultCamera?: unknown;
  colors?: VehicleColorInput[];
  hotspots?: HotspotInput[];
  isHot?: boolean;
  sortOrder?: number;
  status?: ContentStatus;
  assetLicenseIds?: string[];
}

export function parseVehicleInput(
  body: Record<string, unknown>,
  { partial = false } = {},
): VehicleInput {
  const categoryIds =
    body.categoryIds === undefined
      ? undefined
      : stringList(body, "categoryIds", "分类 ID");
  if (!partial && (!categoryIds || categoryIds.length === 0)) {
    throw validationError("至少关联一个分类。");
  }

  const displayType = enumValue(
    body,
    "displayType",
    "展示类型",
    DISPLAY_TYPES,
    !partial,
  );
  const energyType = enumValue(
    body,
    "energyType",
    "能源类型",
    ENERGY_TYPES,
    false,
  );
  const status = enumValue(body, "status", "发布状态", CONTENT_STATUSES, false);
  const seatCount = optionalInteger(
    body,
    "seatCount",
    "座位数",
    partial ? undefined : 0,
  );
  if (seatCount !== undefined && seatCount < 0) {
    throw validationError("座位数不能为负数。");
  }

  return {
    slug: slugValue(body, !partial),
    brandId: optionalNullableString(body, "brandId", "品牌 ID"),
    categoryIds,
    nameCn: partial
      ? optionalString(body, "nameCn", "中文名称")
      : requiredString(body, "nameCn", "中文名称"),
    nameEn: optionalString(body, "nameEn", "英文名称"),
    childName: optionalString(body, "childName", "儿童名称"),
    aliases:
      body.aliases === undefined
        ? undefined
        : stringList(body, "aliases", "别名"),
    tags:
      body.tags === undefined ? undefined : stringList(body, "tags", "标签"),
    displayType,
    isRealModel: optionalBoolean(
      body,
      "isRealModel",
      "真实车型状态",
      partial ? undefined : false,
    ),
    energyType,
    seatCount: seatCount || undefined,
    childDescription: partial
      ? optionalString(body, "childDescription", "儿童版介绍")
      : requiredString(body, "childDescription", "儿童版介绍"),
    coverImageUrl: partial
      ? optionalString(body, "coverImageUrl", "封面地址")
      : requiredString(body, "coverImageUrl", "封面地址"),
    thumbnailUrl: optionalNullableString(body, "thumbnailUrl", "缩略图地址"),
    highModelUrl: optionalNullableString(body, "highModelUrl", "高清模型地址"),
    lowModelUrl: optionalNullableString(body, "lowModelUrl", "低清模型地址"),
    fallbackImageUrls:
      body.fallbackImageUrls === undefined
        ? undefined
        : stringList(body, "fallbackImageUrls", "降级图片地址"),
    pronunciationAudioUrl: optionalNullableString(
      body,
      "pronunciationAudioUrl",
      "名称语音地址",
    ),
    defaultCamera: body.defaultCamera,
    colors: parseColors(body.colors),
    hotspots: parseHotspots(body.hotspots),
    isHot: optionalBoolean(
      body,
      "isHot",
      "热门状态",
      partial ? undefined : false,
    ),
    sortOrder: optionalInteger(
      body,
      "sortOrder",
      "排序值",
      partial ? undefined : 0,
    ),
    status,
    assetLicenseIds:
      body.assetLicenseIds === undefined
        ? undefined
        : stringList(body, "assetLicenseIds", "许可证 ID"),
  };
}

export interface LicenseInput {
  assetName?: string;
  assetType?: AssetType;
  authorName?: string;
  sourcePageUrl?: string;
  originalDownloadUrl?: string | null;
  licenseName?: string;
  licenseUrl?: string | null;
  licenseFileUrl?: string | null;
  acquiredAt?: Date;
  allowPublicDisplay?: boolean;
  allowModification?: boolean;
  allowCommercialUse?: boolean;
  attributionRequired?: boolean;
  attributionText?: string | null;
  containsTrademark?: boolean;
  modifications?: string | null;
  sourceScreenshotUrl?: string | null;
  reviewStatus?: AssetReviewStatus;
}

export function parseLicenseInput(
  body: Record<string, unknown>,
  { partial = false } = {},
): LicenseInput {
  const acquiredAtValue = body.acquiredAt;
  const acquiredAt =
    acquiredAtValue === undefined ||
    acquiredAtValue === null ||
    acquiredAtValue === ""
      ? undefined
      : new Date(String(acquiredAtValue));
  if (acquiredAt && Number.isNaN(acquiredAt.getTime())) {
    throw validationError("获取日期格式不正确。");
  }
  if (!partial && !acquiredAt) {
    throw validationError("获取日期不能为空。");
  }

  return {
    assetName: partial
      ? optionalString(body, "assetName", "素材名称")
      : requiredString(body, "assetName", "素材名称"),
    assetType: enumValue(body, "assetType", "素材类型", ASSET_TYPES, !partial),
    authorName: partial
      ? optionalString(body, "authorName", "作者")
      : requiredString(body, "authorName", "作者"),
    sourcePageUrl: partial
      ? optionalString(body, "sourcePageUrl", "来源详情页")
      : requiredString(body, "sourcePageUrl", "来源详情页"),
    originalDownloadUrl: optionalNullableString(
      body,
      "originalDownloadUrl",
      "原始下载地址",
    ),
    licenseName: partial
      ? optionalString(body, "licenseName", "许可证名称")
      : requiredString(body, "licenseName", "许可证名称"),
    licenseUrl: optionalNullableString(body, "licenseUrl", "许可证地址"),
    licenseFileUrl: optionalNullableString(
      body,
      "licenseFileUrl",
      "许可证副本地址",
    ),
    acquiredAt,
    allowPublicDisplay: optionalBoolean(
      body,
      "allowPublicDisplay",
      "允许公开展示",
      partial ? undefined : false,
    ),
    allowModification: optionalBoolean(
      body,
      "allowModification",
      "允许修改",
      partial ? undefined : false,
    ),
    allowCommercialUse: optionalBoolean(
      body,
      "allowCommercialUse",
      "允许商业使用",
      partial ? undefined : false,
    ),
    attributionRequired: optionalBoolean(
      body,
      "attributionRequired",
      "需要署名",
      partial ? undefined : false,
    ),
    attributionText: optionalNullableString(
      body,
      "attributionText",
      "署名文本",
    ),
    containsTrademark: optionalBoolean(
      body,
      "containsTrademark",
      "包含商标",
      partial ? undefined : false,
    ),
    modifications: optionalNullableString(body, "modifications", "修改说明"),
    sourceScreenshotUrl: optionalNullableString(
      body,
      "sourceScreenshotUrl",
      "来源截图地址",
    ),
    reviewStatus: enumValue(
      body,
      "reviewStatus",
      "审核状态",
      ASSET_REVIEW_STATUSES,
      false,
    ),
  };
}

interface PublishableVehicle {
  status: ContentStatus;
  slug: string;
  nameCn: string;
  childDescription: string;
  coverImageUrl: string;
  displayType: DisplayType;
  isRealModel: boolean;
  brandId: string | null;
  highModelUrl: string | null;
  lowModelUrl: string | null;
  fallbackImageUrls: string[];
  categories: unknown[];
  assetLicenses: Array<{
    assetLicense: {
      reviewStatus: AssetReviewStatus;
      allowPublicDisplay: boolean;
      authorName: string;
      sourcePageUrl: string;
      licenseName: string;
      licenseUrl: string | null;
      licenseFileUrl: string | null;
      acquiredAt: Date;
    };
  }>;
}

export function validateVehicleForPublish(vehicle: PublishableVehicle) {
  const errors: string[] = [];
  if (!vehicle.nameCn.trim()) errors.push("名称不能为空");
  if (!SLUG_PATTERN.test(vehicle.slug)) errors.push("slug 格式不正确");
  if (vehicle.categories.length === 0) errors.push("至少关联一个分类");
  if (!vehicle.childDescription.trim()) errors.push("儿童版介绍不能为空");
  if (!vehicle.coverImageUrl.trim()) errors.push("封面图不能为空");

  if (vehicle.status === "ARCHIVED") errors.push("已归档汽车不能发布");
  if (vehicle.isRealModel && !vehicle.brandId) {
    errors.push("真实车型必须关联品牌");
  }

  switch (vehicle.displayType) {
    case "REAL_3D":
      if (!vehicle.isRealModel) {
        errors.push("REAL_3D 必须标记为真实车型");
      }
      if (!vehicle.highModelUrl && !vehicle.lowModelUrl) {
        errors.push("3D 车型至少需要一套模型资源");
      }
      break;
    case "GENERIC_3D":
      if (vehicle.isRealModel) {
        errors.push("GENERIC_3D 不能标记为真实车型");
      }
      if (!vehicle.highModelUrl && !vehicle.lowModelUrl) {
        errors.push("通用 3D 车型至少需要一套模型资源");
      }
      break;
    case "IMAGE_SET":
      if (vehicle.fallbackImageUrls.length < 3) {
        errors.push("图片组至少需要 3 张不同角度的图片");
      }
      break;
    case "STATIC_IMAGE":
      if (vehicle.fallbackImageUrls.length < 1) {
        errors.push("静态图片车型至少需要一张图片");
      }
      break;
    default:
      errors.push("展示类型不能为空");
  }

  if (vehicle.assetLicenses.length === 0) {
    errors.push("至少关联一条素材许可证");
  }
  const incompleteLicense = vehicle.assetLicenses.find(
    ({ assetLicense }) =>
      !assetLicense.authorName.trim() ||
      !assetLicense.sourcePageUrl.trim() ||
      !assetLicense.licenseName.trim() ||
      (!assetLicense.licenseUrl?.trim() &&
        !assetLicense.licenseFileUrl?.trim()) ||
      !assetLicense.acquiredAt,
  );
  if (incompleteLicense) {
    errors.push("素材许可证必须补齐作者、来源、许可证链接或副本和获取日期");
  }
  const rejectedLicense = vehicle.assetLicenses.find(
    ({ assetLicense }) =>
      assetLicense.reviewStatus !== "APPROVED" ||
      !assetLicense.allowPublicDisplay,
  );
  if (rejectedLicense) {
    errors.push("所有关联素材许可证必须审核通过并允许公开展示");
  }
  if (vehicle.isRealModel && vehicle.assetLicenses.length === 0) {
    errors.push("真实车型必须关联素材许可证");
  }

  return errors;
}
