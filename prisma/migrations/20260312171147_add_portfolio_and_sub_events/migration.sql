-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('SINGLE', 'MULTI_FUNCTION');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "allocatedBudget" DECIMAL(12,2),
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "time" TEXT,
ADD COLUMN     "totalBudget" DECIMAL(12,2),
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "venueName" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "totalReviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearsInBusiness" INTEGER;

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "eventType" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PortfolioItem_vendorId_displayOrder_idx" ON "PortfolioItem"("vendorId", "displayOrder");

-- CreateIndex
CREATE INDEX "Event_parentId_idx" ON "Event"("parentId");

-- CreateIndex
CREATE INDEX "Vendor_category_city_idx" ON "Vendor"("category", "city");

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
