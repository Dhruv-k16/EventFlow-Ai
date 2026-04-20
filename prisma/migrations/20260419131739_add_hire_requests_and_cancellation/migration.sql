/*
  Warnings:

  - You are about to drop the `PlannerStaffAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "HireRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "PlannerStaffAssignment" DROP CONSTRAINT "PlannerStaffAssignment_eventId_fkey";

-- DropForeignKey
ALTER TABLE "PlannerStaffAssignment" DROP CONSTRAINT "PlannerStaffAssignment_staffId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cancellationRequestedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "PlannerStaffAssignment";

-- CreateTable
CREATE TABLE "PlannerHireRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "plannerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "HireRequestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerHireRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannerHireRequest_plannerId_status_idx" ON "PlannerHireRequest"("plannerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerHireRequest_clientId_eventId_key" ON "PlannerHireRequest"("clientId", "eventId");

-- AddForeignKey
ALTER TABLE "PlannerHireRequest" ADD CONSTRAINT "PlannerHireRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerHireRequest" ADD CONSTRAINT "PlannerHireRequest_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "PlannerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerHireRequest" ADD CONSTRAINT "PlannerHireRequest_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
