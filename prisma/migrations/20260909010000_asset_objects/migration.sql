-- CreateTable
CREATE TABLE "AssetObject" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "safeName" TEXT NOT NULL,
    "assetType" "AssetType" NOT NULL,
    "quality" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetObject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetObject_storageKey_key" ON "AssetObject"("storageKey");
CREATE INDEX "AssetObject_assetType_createdAt_idx" ON "AssetObject"("assetType", "createdAt");
CREATE INDEX "AssetObject_uploadedById_createdAt_idx" ON "AssetObject"("uploadedById", "createdAt");

-- AddForeignKey
ALTER TABLE "AssetObject" ADD CONSTRAINT "AssetObject_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
