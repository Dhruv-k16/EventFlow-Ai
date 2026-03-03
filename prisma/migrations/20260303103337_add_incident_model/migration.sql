-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "reportedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_liveEventId_severity_idx" ON "Incident"("liveEventId", "severity");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
