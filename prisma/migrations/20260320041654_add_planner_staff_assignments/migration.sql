-- CreateTable
CREATE TABLE "PlannerStaffAssignment" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "task" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlannerStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlannerStaffAssignment_staffId_idx" ON "PlannerStaffAssignment"("staffId");

-- CreateIndex
CREATE INDEX "PlannerStaffAssignment_eventId_idx" ON "PlannerStaffAssignment"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerStaffAssignment_staffId_eventId_key" ON "PlannerStaffAssignment"("staffId", "eventId");

-- AddForeignKey
ALTER TABLE "PlannerStaffAssignment" ADD CONSTRAINT "PlannerStaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "PlannerStaff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerStaffAssignment" ADD CONSTRAINT "PlannerStaffAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
