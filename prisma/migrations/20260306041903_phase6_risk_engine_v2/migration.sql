/*
  Warnings:

  - You are about to drop the column `aiExplanation` on the `RiskSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `eventId` on the `RiskSnapshot` table. All the data in the column will be lost.
  - Added the required column `targetId` to the `RiskSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetType` to the `RiskSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RiskSnapshot" DROP CONSTRAINT "RiskSnapshot_eventId_fkey";

-- DropIndex
DROP INDEX "RiskSnapshot_eventId_idx";

-- DropIndex
DROP INDEX "RiskSnapshot_riskScore_idx";

-- AlterTable
ALTER TABLE "LiveEvent" ADD COLUMN     "changeRequestCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "RiskSnapshot" DROP COLUMN "aiExplanation",
DROP COLUMN "eventId",
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "alerts" JSONB,
ADD COLUMN     "recommendations" JSONB,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'PLANNER',
ADD COLUMN     "targetId" TEXT NOT NULL,
ADD COLUMN     "targetType" TEXT NOT NULL,
ADD COLUMN     "weatherData" JSONB;

-- CreateIndex
CREATE INDEX "RiskSnapshot_targetId_targetType_idx" ON "RiskSnapshot"("targetId", "targetType");

-- CreateIndex
CREATE INDEX "RiskSnapshot_targetId_createdAt_idx" ON "RiskSnapshot"("targetId", "createdAt");
