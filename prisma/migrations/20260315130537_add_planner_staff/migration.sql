-- CreateEnum
CREATE TYPE "PlannerStaffStatus" AS ENUM ('AVAILABLE', 'BUSY', 'ON_LEAVE');

-- CreateTable
CREATE TABLE "PlannerStaff" (
    "id" TEXT NOT NULL,
    "plannerProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "PlannerStaffStatus" NOT NULL DEFAULT 'AVAILABLE',
    "assignedEvents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerStaff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannerStaff_plannerProfileId_status_idx" ON "PlannerStaff"("plannerProfileId", "status");

-- AddForeignKey
ALTER TABLE "PlannerStaff" ADD CONSTRAINT "PlannerStaff_plannerProfileId_fkey" FOREIGN KEY ("plannerProfileId") REFERENCES "PlannerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
