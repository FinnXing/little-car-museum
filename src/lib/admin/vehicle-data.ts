import type { Prisma } from "@prisma/client";
import type { HotspotInput, VehicleInput } from "./validation";

function jsonValue(value: unknown) {
  return value as Prisma.InputJsonValue;
}

function colorCreateData(input: NonNullable<VehicleInput["colors"]>) {
  return input.map((color) => ({
    nameCn: color.nameCn,
    colorValue: color.colorValue,
    materialNames: color.materialNames,
    isOfficialColor: color.isOfficialColor,
    sortOrder: color.sortOrder,
  }));
}

function hotspotCreateData(input: HotspotInput[]) {
  return input.map((hotspot) => ({
    partName: hotspot.partName,
    position: jsonValue(hotspot.position),
    descriptionChild: hotspot.descriptionChild,
    audioUrl: hotspot.audioUrl,
    cameraPosition: hotspot.cameraPosition
      ? jsonValue(hotspot.cameraPosition)
      : undefined,
    cameraTarget: hotspot.cameraTarget
      ? jsonValue(hotspot.cameraTarget)
      : undefined,
    enabled: hotspot.enabled,
    sortOrder: hotspot.sortOrder,
  }));
}

function relationCreates(input: VehicleInput) {
  return {
    categories: {
      create: (input.categoryIds ?? []).map((categoryId) => ({
        category: { connect: { id: categoryId } },
      })),
    },
    colors: { create: colorCreateData(input.colors ?? []) },
    hotspots: { create: hotspotCreateData(input.hotspots ?? []) },
    assetLicenses: {
      create: (input.assetLicenseIds ?? []).map((assetLicenseId) => ({
        assetLicense: { connect: { id: assetLicenseId } },
      })),
    },
  };
}

export function vehicleCreateData(
  input: VehicleInput,
): Prisma.VehicleCreateInput {
  return {
    slug: input.slug!,
    nameCn: input.nameCn!,
    nameEn: input.nameEn,
    childName: input.childName,
    aliases: input.aliases ?? [],
    tags: input.tags ?? [],
    displayType: input.displayType!,
    isRealModel: input.isRealModel ?? false,
    energyType: input.energyType,
    seatCount: input.seatCount,
    childDescription: input.childDescription!,
    coverImageUrl: input.coverImageUrl!,
    thumbnailUrl: input.thumbnailUrl,
    highModelUrl: input.highModelUrl,
    lowModelUrl: input.lowModelUrl,
    fallbackImageUrls: input.fallbackImageUrls ?? [],
    pronunciationAudioUrl: input.pronunciationAudioUrl,
    defaultCamera:
      input.defaultCamera === undefined
        ? undefined
        : jsonValue(input.defaultCamera),
    isHot: input.isHot ?? false,
    sortOrder: input.sortOrder ?? 0,
    status: input.status ?? "DRAFT",
    brand: input.brandId ? { connect: { id: input.brandId } } : undefined,
    ...relationCreates(input),
  };
}

export function vehicleUpdateData(
  input: VehicleInput,
): Prisma.VehicleUpdateInput {
  const data: Prisma.VehicleUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.nameCn !== undefined) data.nameCn = input.nameCn;
  if (input.nameEn !== undefined) data.nameEn = input.nameEn;
  if (input.childName !== undefined) data.childName = input.childName;
  if (input.aliases !== undefined) data.aliases = input.aliases;
  if (input.tags !== undefined) data.tags = input.tags;
  if (input.displayType !== undefined) data.displayType = input.displayType;
  if (input.isRealModel !== undefined) data.isRealModel = input.isRealModel;
  if (input.energyType !== undefined) data.energyType = input.energyType;
  if (input.seatCount !== undefined) data.seatCount = input.seatCount;
  if (input.childDescription !== undefined) {
    data.childDescription = input.childDescription;
  }
  if (input.coverImageUrl !== undefined)
    data.coverImageUrl = input.coverImageUrl;
  if (input.thumbnailUrl !== undefined) data.thumbnailUrl = input.thumbnailUrl;
  if (input.highModelUrl !== undefined) data.highModelUrl = input.highModelUrl;
  if (input.lowModelUrl !== undefined) data.lowModelUrl = input.lowModelUrl;
  if (input.fallbackImageUrls !== undefined) {
    data.fallbackImageUrls = input.fallbackImageUrls;
  }
  if (input.pronunciationAudioUrl !== undefined) {
    data.pronunciationAudioUrl = input.pronunciationAudioUrl;
  }
  if (input.defaultCamera !== undefined) {
    data.defaultCamera = jsonValue(input.defaultCamera);
  }
  if (input.isHot !== undefined) data.isHot = input.isHot;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.status !== undefined) data.status = input.status;
  if (input.brandId !== undefined) {
    data.brand = input.brandId
      ? { connect: { id: input.brandId } }
      : { disconnect: true };
  }
  if (input.categoryIds !== undefined) {
    data.categories = {
      deleteMany: {},
      create: input.categoryIds.map((categoryId) => ({
        category: { connect: { id: categoryId } },
      })),
    };
  }
  if (input.colors !== undefined) {
    data.colors = {
      deleteMany: {},
      create: colorCreateData(input.colors),
    };
  }
  if (input.hotspots !== undefined) {
    data.hotspots = {
      deleteMany: {},
      create: hotspotCreateData(input.hotspots),
    };
  }
  if (input.assetLicenseIds !== undefined) {
    data.assetLicenses = {
      deleteMany: {},
      create: input.assetLicenseIds.map((assetLicenseId) => ({
        assetLicense: { connect: { id: assetLicenseId } },
      })),
    };
  }
  return data;
}
