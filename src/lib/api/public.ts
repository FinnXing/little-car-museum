import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  AssetLicense,
  Brand,
  Category,
  PaginatedData,
  VehicleDetail,
  VehicleSummary,
} from "@/types";
import type {
  AssetLicense as PrismaAssetLicense,
  Brand as PrismaBrand,
  Category as PrismaCategory,
} from "@prisma/client";

const PUBLIC_STATUS = "PUBLISHED" as const;

const vehicleSummaryArgs = {
  include: {
    brand: {
      select: { id: true, slug: true, nameCn: true, nameEn: true },
    },
    categories: { select: { categoryId: true } },
  },
} satisfies Prisma.VehicleDefaultArgs;

const vehicleDetailArgs = {
  include: {
    brand: true,
    categories: { include: { category: true } },
    colors: { orderBy: { sortOrder: "asc" } },
    hotspots: { orderBy: { sortOrder: "asc" } },
    assetLicenses: {
      where: {
        assetLicense: { reviewStatus: "APPROVED", allowPublicDisplay: true },
      },
      include: { assetLicense: true },
    },
  },
} satisfies Prisma.VehicleDefaultArgs;

type VehicleSummaryRecord = Prisma.VehicleGetPayload<typeof vehicleSummaryArgs>;
type VehicleDetailRecord = Prisma.VehicleGetPayload<typeof vehicleDetailArgs>;

export type VehicleSort = "sortOrder" | "newest" | "name" | "relevance";

export interface VehicleListOptions {
  page: number;
  pageSize: number;
  categorySlug?: string;
  brandSlug?: string;
  displayType?: "REAL_3D" | "GENERIC_3D" | "IMAGE_SET" | "STATIC_IMAGE";
  isHot?: boolean;
  keyword?: string;
  sort?: VehicleSort;
}

function isoDate(value: Date) {
  return value.toISOString();
}

export function mapCategory(category: PrismaCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    nameCn: category.nameCn,
    nameEn: category.nameEn ?? undefined,
    iconUrl: category.iconUrl ?? undefined,
    description: category.description ?? undefined,
    sortOrder: category.sortOrder,
    enabled: category.enabled,
    createdAt: isoDate(category.createdAt),
    updatedAt: isoDate(category.updatedAt),
  };
}

export function mapBrand(brand: PrismaBrand): Brand {
  return {
    id: brand.id,
    slug: brand.slug,
    nameCn: brand.nameCn,
    nameEn: brand.nameEn ?? undefined,
    aliases: brand.aliases,
    countryRegion: brand.countryRegion ?? undefined,
    logoUrl: brand.logoUrl ?? undefined,
    descriptionChild: brand.descriptionChild ?? undefined,
    pronunciationAudioUrl: brand.pronunciationAudioUrl ?? undefined,
    isHot: brand.isHot,
    sortOrder: brand.sortOrder,
    status: brand.status,
    assetLicenseId: brand.assetLicenseId ?? undefined,
    createdAt: isoDate(brand.createdAt),
    updatedAt: isoDate(brand.updatedAt),
  };
}

export function mapAssetLicense(license: PrismaAssetLicense): AssetLicense {
  return {
    id: license.id,
    assetName: license.assetName,
    assetType: license.assetType,
    authorName: license.authorName,
    sourcePageUrl: license.sourcePageUrl,
    originalDownloadUrl: license.originalDownloadUrl ?? undefined,
    licenseName: license.licenseName,
    licenseUrl: license.licenseUrl ?? undefined,
    licenseFileUrl: license.licenseFileUrl ?? undefined,
    acquiredAt: isoDate(license.acquiredAt),
    allowPublicDisplay: license.allowPublicDisplay,
    allowModification: license.allowModification,
    allowCommercialUse: license.allowCommercialUse,
    attributionRequired: license.attributionRequired,
    attributionText: license.attributionText ?? undefined,
    containsTrademark: license.containsTrademark,
    modifications: license.modifications ?? undefined,
    sourceScreenshotUrl: license.sourceScreenshotUrl ?? undefined,
    reviewStatus: license.reviewStatus,
    createdAt: isoDate(license.createdAt),
    updatedAt: isoDate(license.updatedAt),
  };
}

function mapVehicleSummary(vehicle: VehicleSummaryRecord): VehicleSummary {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    brandId: vehicle.brandId ?? undefined,
    brand: vehicle.brand
      ? {
          id: vehicle.brand.id,
          slug: vehicle.brand.slug,
          nameCn: vehicle.brand.nameCn,
          nameEn: vehicle.brand.nameEn ?? undefined,
        }
      : undefined,
    categoryIds: vehicle.categories.map((entry) => entry.categoryId),
    nameCn: vehicle.nameCn,
    nameEn: vehicle.nameEn ?? undefined,
    childName: vehicle.childName ?? undefined,
    displayType: vehicle.displayType,
    isRealModel: vehicle.isRealModel,
    coverImageUrl: vehicle.coverImageUrl,
    thumbnailUrl: vehicle.thumbnailUrl ?? undefined,
    isHot: vehicle.isHot,
    sortOrder: vehicle.sortOrder,
    status: vehicle.status,
    createdAt: isoDate(vehicle.createdAt),
    updatedAt: isoDate(vehicle.updatedAt),
  };
}

function mapVehicleDetail(vehicle: VehicleDetailRecord): VehicleDetail {
  return {
    id: vehicle.id,
    slug: vehicle.slug,
    brandId: vehicle.brandId ?? undefined,
    categoryIds: vehicle.categories.map((entry) => entry.categoryId),
    nameCn: vehicle.nameCn,
    nameEn: vehicle.nameEn ?? undefined,
    childName: vehicle.childName ?? undefined,
    aliases: vehicle.aliases,
    tags: vehicle.tags,
    displayType: vehicle.displayType,
    isRealModel: vehicle.isRealModel,
    energyType: vehicle.energyType ?? undefined,
    seatCount: vehicle.seatCount ?? undefined,
    childDescription: vehicle.childDescription,
    coverImageUrl: vehicle.coverImageUrl,
    thumbnailUrl: vehicle.thumbnailUrl ?? undefined,
    highModelUrl: vehicle.highModelUrl ?? undefined,
    lowModelUrl: vehicle.lowModelUrl ?? undefined,
    fallbackImageUrls: vehicle.fallbackImageUrls,
    pronunciationAudioUrl: vehicle.pronunciationAudioUrl ?? undefined,
    defaultCamera: vehicle.defaultCamera
      ? (vehicle.defaultCamera as unknown as VehicleDetail["defaultCamera"])
      : undefined,
    colors: vehicle.colors.map((color) => ({
      id: color.id,
      nameCn: color.nameCn,
      colorValue: color.colorValue,
      materialNames: color.materialNames,
      isOfficialColor: color.isOfficialColor,
      sortOrder: color.sortOrder,
    })),
    hotspots: vehicle.hotspots.map((hotspot) => ({
      id: hotspot.id,
      partName: hotspot.partName,
      position:
        hotspot.position as unknown as VehicleDetail["hotspots"][number]["position"],
      descriptionChild: hotspot.descriptionChild ?? undefined,
      audioUrl: hotspot.audioUrl ?? undefined,
      cameraPosition: hotspot.cameraPosition
        ? (hotspot.cameraPosition as unknown as VehicleDetail["hotspots"][number]["cameraPosition"])
        : undefined,
      cameraTarget: hotspot.cameraTarget
        ? (hotspot.cameraTarget as unknown as VehicleDetail["hotspots"][number]["cameraTarget"])
        : undefined,
      enabled: hotspot.enabled,
    })),
    isHot: vehicle.isHot,
    sortOrder: vehicle.sortOrder,
    status: vehicle.status,
    assetLicenseIds: vehicle.assetLicenses.map((entry) => entry.assetLicenseId),
    createdAt: isoDate(vehicle.createdAt),
    updatedAt: isoDate(vehicle.updatedAt),
    brand: vehicle.brand ? mapBrand(vehicle.brand) : undefined,
    categories: vehicle.categories.map((entry) => mapCategory(entry.category)),
    licenses: vehicle.assetLicenses.map((entry) =>
      mapAssetLicense(entry.assetLicense),
    ),
  };
}

export function buildPublicVehicleWhere(
  options: Pick<
    VehicleListOptions,
    "categorySlug" | "brandSlug" | "displayType" | "isHot" | "keyword"
  >,
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { status: PUBLIC_STATUS };

  if (options.categorySlug) {
    where.categories = {
      some: {
        category: { slug: options.categorySlug, enabled: true },
      },
    };
  }

  if (options.brandSlug) {
    where.brand = { slug: options.brandSlug, status: PUBLIC_STATUS };
  }

  if (options.displayType) {
    where.displayType = options.displayType;
  }

  if (options.isHot !== undefined) {
    where.isHot = options.isHot;
  }

  if (options.keyword) {
    where.OR = [
      { nameCn: { contains: options.keyword, mode: "insensitive" } },
      { nameEn: { contains: options.keyword, mode: "insensitive" } },
      { childName: { contains: options.keyword, mode: "insensitive" } },
      { aliases: { has: options.keyword } },
      { tags: { has: options.keyword } },
    ];
  }

  return where;
}

function orderByFor(sort: VehicleSort | undefined) {
  switch (sort) {
    case "newest":
      return [
        { createdAt: "desc" },
        { nameCn: "asc" },
      ] satisfies Prisma.VehicleOrderByWithRelationInput[];
    case "name":
      return [
        { nameCn: "asc" },
        { sortOrder: "asc" },
      ] satisfies Prisma.VehicleOrderByWithRelationInput[];
    case "relevance":
      return [
        { nameCn: "asc" },
      ] satisfies Prisma.VehicleOrderByWithRelationInput[];
    default:
      return [
        { sortOrder: "asc" },
        { nameCn: "asc" },
      ] satisfies Prisma.VehicleOrderByWithRelationInput[];
  }
}

export async function listPublicCategories() {
  const categories = await prisma.category.findMany({
    where: {
      enabled: true,
      vehicles: { some: { vehicle: { status: PUBLIC_STATUS } } },
    },
    orderBy: [{ sortOrder: "asc" }, { nameCn: "asc" }],
  });
  return categories.map(mapCategory);
}

export async function listPublicBrands() {
  const brands = await prisma.brand.findMany({
    where: {
      status: PUBLIC_STATUS,
      vehicles: { some: { status: PUBLIC_STATUS } },
    },
    orderBy: [{ sortOrder: "asc" }, { nameCn: "asc" }],
  });
  return brands.map(mapBrand);
}

export async function getPublicBrandBySlug(slug: string) {
  const brand = await prisma.brand.findFirst({
    where: {
      slug,
      status: PUBLIC_STATUS,
      vehicles: { some: { status: PUBLIC_STATUS } },
    },
  });
  return brand ? mapBrand(brand) : null;
}

export async function listPublicVehicles(
  options: VehicleListOptions,
): Promise<PaginatedData<VehicleSummary>> {
  const where = buildPublicVehicleWhere(options);
  const [total, vehicles] = await prisma.$transaction([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      ...vehicleSummaryArgs,
      where,
      orderBy: orderByFor(options.sort),
      skip: (options.page - 1) * options.pageSize,
      take: options.pageSize,
    }),
  ]);

  return {
    items: vehicles.map(mapVehicleSummary),
    page: options.page,
    pageSize: options.pageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / options.pageSize),
  };
}

export async function getRandomPublicVehicle() {
  const where: Prisma.VehicleWhereInput = { status: PUBLIC_STATUS };
  const count = await prisma.vehicle.count({ where });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const vehicle = await prisma.vehicle.findFirst({
    ...vehicleDetailArgs,
    where,
    skip,
  });
  return vehicle ? mapVehicleDetail(vehicle) : null;
}

export async function getPublicVehicleBySlug(slug: string) {
  const vehicle = await prisma.vehicle.findFirst({
    ...vehicleDetailArgs,
    where: { slug, status: PUBLIC_STATUS },
  });
  return vehicle ? mapVehicleDetail(vehicle) : null;
}

export async function listPublicLicenses() {
  const licenses = await prisma.assetLicense.findMany({
    where: { reviewStatus: "APPROVED", allowPublicDisplay: true },
    orderBy: [{ assetName: "asc" }],
  });
  return licenses.map(mapAssetLicense);
}
