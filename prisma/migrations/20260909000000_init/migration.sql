-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DisplayType" AS ENUM ('REAL_3D', 'GENERIC_3D', 'IMAGE_SET', 'STATIC_IMAGE');

-- CreateEnum
CREATE TYPE "EnergyType" AS ENUM ('FUEL', 'ELECTRIC', 'HYBRID', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('MODEL', 'IMAGE', 'TEXTURE', 'AUDIO', 'LOGO');

-- CreateEnum
CREATE TYPE "AssetReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameCn" TEXT NOT NULL,
    "nameEn" TEXT,
    "iconUrl" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameCn" TEXT NOT NULL,
    "nameEn" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countryRegion" TEXT,
    "logoUrl" TEXT,
    "descriptionChild" TEXT,
    "pronunciationAudioUrl" TEXT,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "assetLicenseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "brandId" TEXT,
    "nameCn" TEXT NOT NULL,
    "nameEn" TEXT,
    "childName" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayType" "DisplayType" NOT NULL,
    "isRealModel" BOOLEAN NOT NULL DEFAULT false,
    "energyType" "EnergyType",
    "seatCount" INTEGER,
    "childDescription" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "highModelUrl" TEXT,
    "lowModelUrl" TEXT,
    "fallbackImageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pronunciationAudioUrl" TEXT,
    "defaultCamera" JSONB,
    "isHot" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleCategory" (
    "vehicleId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("vehicleId","categoryId")
);

-- CreateTable
CREATE TABLE "VehicleColor" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "nameCn" TEXT NOT NULL,
    "colorValue" TEXT NOT NULL,
    "materialNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOfficialColor" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VehicleColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "partName" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "descriptionChild" TEXT,
    "audioUrl" TEXT,
    "cameraPosition" JSONB,
    "cameraTarget" JSONB,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Hotspot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLicense" (
    "id" TEXT NOT NULL,
    "assetName" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "authorName" TEXT NOT NULL,
    "sourcePageUrl" TEXT NOT NULL,
    "originalDownloadUrl" TEXT,
    "licenseName" TEXT NOT NULL,
    "licenseUrl" TEXT,
    "licenseFileUrl" TEXT,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "allowPublicDisplay" BOOLEAN NOT NULL DEFAULT false,
    "allowModification" BOOLEAN NOT NULL DEFAULT false,
    "allowCommercialUse" BOOLEAN NOT NULL DEFAULT false,
    "attributionRequired" BOOLEAN NOT NULL DEFAULT false,
    "attributionText" TEXT,
    "containsTrademark" BOOLEAN NOT NULL DEFAULT false,
    "modifications" TEXT,
    "sourceScreenshotUrl" TEXT,
    "reviewStatus" "AssetReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleAssetLicense" (
    "vehicleId" TEXT NOT NULL,
    "assetLicenseId" TEXT NOT NULL,

    CONSTRAINT "VehicleAssetLicense_pkey" PRIMARY KEY ("vehicleId","assetLicenseId")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_slug_key" ON "Vehicle"("slug");

-- CreateIndex
CREATE INDEX "Vehicle_status_sortOrder_idx" ON "Vehicle"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "Vehicle_brandId_status_idx" ON "Vehicle"("brandId", "status");

-- CreateIndex
CREATE INDEX "VehicleCategory_categoryId_vehicleId_idx" ON "VehicleCategory"("categoryId", "vehicleId");

-- CreateIndex
CREATE INDEX "VehicleColor_vehicleId_sortOrder_idx" ON "VehicleColor"("vehicleId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleColor_vehicleId_nameCn_key" ON "VehicleColor"("vehicleId", "nameCn");

-- CreateIndex
CREATE INDEX "Hotspot_vehicleId_enabled_sortOrder_idx" ON "Hotspot"("vehicleId", "enabled", "sortOrder");

-- CreateIndex
CREATE INDEX "AssetLicense_reviewStatus_assetType_idx" ON "AssetLicense"("reviewStatus", "assetType");

-- CreateIndex
CREATE INDEX "VehicleAssetLicense_assetLicenseId_vehicleId_idx" ON "VehicleAssetLicense"("assetLicenseId", "vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_assetLicenseId_fkey" FOREIGN KEY ("assetLicenseId") REFERENCES "AssetLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategory" ADD CONSTRAINT "VehicleCategory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleCategory" ADD CONSTRAINT "VehicleCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleColor" ADD CONSTRAINT "VehicleColor_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleAssetLicense" ADD CONSTRAINT "VehicleAssetLicense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleAssetLicense" ADD CONSTRAINT "VehicleAssetLicense_assetLicenseId_fkey" FOREIGN KEY ("assetLicenseId") REFERENCES "AssetLicense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
