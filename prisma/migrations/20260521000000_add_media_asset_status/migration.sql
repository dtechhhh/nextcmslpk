-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'ACTIVE');

-- Add status to existing media. Existing rows predate the upload confirmation flow,
-- so treat them as active while keeping new uploads in UPLOADING by default.
ALTER TABLE "media_assets" ADD COLUMN "status" "MediaStatus";
UPDATE "media_assets" SET "status" = 'ACTIVE';
ALTER TABLE "media_assets" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "media_assets" ALTER COLUMN "status" SET DEFAULT 'UPLOADING';

-- CreateIndex
CREATE INDEX "media_assets_tenant_id_status_idx" ON "media_assets"("tenant_id", "status");
