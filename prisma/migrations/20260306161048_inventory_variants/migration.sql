-- AlterTable
ALTER TABLE "BookingItem" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN     "hasVariants" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "totalQuantity" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "InventoryVariant" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "totalQuantity" INTEGER NOT NULL DEFAULT 0,
    "bookedQuantity" INTEGER NOT NULL DEFAULT 0,
    "priceOverride" DECIMAL(12,2),
    "color" TEXT,
    "material" TEXT,
    "dimensions" TEXT,
    "attributes" JSONB,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariantAvailability" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bookedQty" INTEGER NOT NULL DEFAULT 0,
    "holdQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VariantAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryVariant_itemId_idx" ON "InventoryVariant"("itemId");

-- CreateIndex
CREATE INDEX "InventoryVariant_itemId_name_idx" ON "InventoryVariant"("itemId", "name");

-- CreateIndex
CREATE INDEX "VariantAvailability_date_idx" ON "VariantAvailability"("date");

-- CreateIndex
CREATE UNIQUE INDEX "VariantAvailability_variantId_date_key" ON "VariantAvailability"("variantId", "date");

-- CreateIndex
CREATE INDEX "BookingItem_variantId_idx" ON "BookingItem"("variantId");

-- AddForeignKey
ALTER TABLE "InventoryVariant" ADD CONSTRAINT "InventoryVariant_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariantAvailability" ADD CONSTRAINT "VariantAvailability_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "InventoryVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "InventoryVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
