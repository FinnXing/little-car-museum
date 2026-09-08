export type ContentStatus =
  "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";

export type DisplayType =
  "REAL_3D" | "GENERIC_3D" | "IMAGE_SET" | "STATIC_IMAGE";

export type EnergyType = "FUEL" | "ELECTRIC" | "HYBRID" | "OTHER";

export interface Category {
  id: string;
  slug: string;
  nameCn: string;
  nameEn?: string;
  iconUrl?: string;
  description?: string;
  sortOrder: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  slug: string;
  nameCn: string;
  nameEn?: string;
  aliases: string[];
  countryRegion?: string;
  logoUrl?: string;
  descriptionChild?: string;
  pronunciationAudioUrl?: string;
  isHot: boolean;
  sortOrder: number;
  status: ContentStatus;
  assetLicenseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface CameraConfig {
  position: Vector3;
  target: Vector3;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  fov?: number;
}

export interface VehicleColor {
  id: string;
  nameCn: string;
  colorValue: string;
  materialNames: string[];
  isOfficialColor: boolean;
  sortOrder: number;
}

export interface Hotspot {
  id: string;
  partName: string;
  position: Vector3;
  descriptionChild?: string;
  audioUrl?: string;
  cameraPosition?: Vector3;
  cameraTarget?: Vector3;
  enabled: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  brandId?: string;
  categoryIds: string[];
  nameCn: string;
  nameEn?: string;
  childName?: string;
  aliases: string[];
  tags?: string[];
  displayType: DisplayType;
  isRealModel: boolean;
  energyType?: EnergyType;
  seatCount?: number;
  childDescription: string;
  coverImageUrl: string;
  thumbnailUrl?: string;
  highModelUrl?: string;
  lowModelUrl?: string;
  fallbackImageUrls: string[];
  pronunciationAudioUrl?: string;
  defaultCamera?: CameraConfig;
  colors: VehicleColor[];
  hotspots: Hotspot[];
  isHot: boolean;
  sortOrder: number;
  status: ContentStatus;
  assetLicenseIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type AssetType = "MODEL" | "IMAGE" | "TEXTURE" | "AUDIO" | "LOGO";

export type AssetReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AssetLicense {
  id: string;
  assetName: string;
  assetType: AssetType;
  authorName: string;
  sourcePageUrl: string;
  originalDownloadUrl?: string;
  licenseName: string;
  licenseUrl?: string;
  licenseFileUrl?: string;
  acquiredAt: string;
  allowPublicDisplay: boolean;
  allowModification: boolean;
  allowCommercialUse: boolean;
  attributionRequired: boolean;
  attributionText?: string;
  containsTrademark: boolean;
  modifications?: string;
  sourceScreenshotUrl?: string;
  reviewStatus: AssetReviewStatus;
  createdAt: string;
  updatedAt: string;
}
