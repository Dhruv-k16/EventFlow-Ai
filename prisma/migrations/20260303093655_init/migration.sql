-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VENDOR', 'PLANNER', 'CLIENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'MEETING_PHASE_1', 'CONFIRMATION_PENDING', 'MEETING_PHASE_2', 'CONFIRMED', 'REJECTED_CAPACITY', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "StaffStatus" AS ENUM ('AVAILABLE', 'ON_SITE', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlannerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT,
    "maxEventsPerDay" INTEGER NOT NULL DEFAULT 3,
    "bio" TEXT,
    "yearsExperience" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlannerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "maxEventsPerDay" INTEGER NOT NULL DEFAULT 2,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorAvailabilityBlock" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorAvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalQuantity" INTEGER NOT NULL,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'per unit',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAllocation" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "allocatedQty" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InventoryAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isMultiDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "guestCount" INTEGER,
    "description" TEXT,
    "clientId" TEXT NOT NULL,
    "plannerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "eventId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "depositPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtBooking" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRecord" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "meetingLink" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "wage" DECIMAL(10,2) NOT NULL,
    "status" "StaffStatus" NOT NULL DEFAULT 'AVAILABLE',
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAssignment" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "role" TEXT,

    CONSTRAINT "StaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveEvent" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concludedAt" TIMESTAMP(3),

    CONSTRAINT "LiveEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveTask" (
    "id" TEXT NOT NULL,
    "liveEventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "assignedTo" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "delayReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskSnapshot" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "factors" JSONB NOT NULL,
    "aiExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialSummary" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalRevenue" DECIMAL(12,2) NOT NULL,
    "totalCosts" DECIMAL(12,2) NOT NULL,
    "projectedProfit" DECIMAL(12,2) NOT NULL,
    "depositCollected" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PlannerProfile_userId_key" ON "PlannerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_userId_key" ON "Vendor"("userId");

-- CreateIndex
CREATE INDEX "Vendor_category_idx" ON "Vendor"("category");

-- CreateIndex
CREATE INDEX "VendorAvailabilityBlock_vendorId_startDate_endDate_idx" ON "VendorAvailabilityBlock"("vendorId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "InventoryItem_vendorId_idx" ON "InventoryItem"("vendorId");

-- CreateIndex
CREATE INDEX "InventoryItem_vendorId_name_idx" ON "InventoryItem"("vendorId", "name");

-- CreateIndex
CREATE INDEX "InventoryAllocation_date_idx" ON "InventoryAllocation"("date");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryAllocation_inventoryItemId_date_key" ON "InventoryAllocation"("inventoryItemId", "date");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_clientId_idx" ON "Event"("clientId");

-- CreateIndex
CREATE INDEX "Event_plannerId_idx" ON "Event"("plannerId");

-- CreateIndex
CREATE INDEX "Booking_vendorId_status_idx" ON "Booking"("vendorId", "status");

-- CreateIndex
CREATE INDEX "Booking_eventId_idx" ON "Booking"("eventId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");

-- CreateIndex
CREATE INDEX "BookingItem_inventoryItemId_idx" ON "BookingItem"("inventoryItemId");

-- CreateIndex
CREATE INDEX "MeetingRecord_bookingId_idx" ON "MeetingRecord"("bookingId");

-- CreateIndex
CREATE INDEX "Staff_vendorId_idx" ON "Staff"("vendorId");

-- CreateIndex
CREATE INDEX "StaffAssignment_staffId_startTime_endTime_idx" ON "StaffAssignment"("staffId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "StaffAssignment_eventId_idx" ON "StaffAssignment"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveEvent_eventId_key" ON "LiveEvent"("eventId");

-- CreateIndex
CREATE INDEX "LiveEvent_isActive_idx" ON "LiveEvent"("isActive");

-- CreateIndex
CREATE INDEX "LiveTask_liveEventId_status_idx" ON "LiveTask"("liveEventId", "status");

-- CreateIndex
CREATE INDEX "LiveTask_scheduledAt_idx" ON "LiveTask"("scheduledAt");

-- CreateIndex
CREATE INDEX "RiskSnapshot_eventId_idx" ON "RiskSnapshot"("eventId");

-- CreateIndex
CREATE INDEX "RiskSnapshot_riskScore_idx" ON "RiskSnapshot"("riskScore");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialSummary_eventId_key" ON "FinancialSummary"("eventId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlannerProfile" ADD CONSTRAINT "PlannerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorAvailabilityBlock" ADD CONSTRAINT "VendorAvailabilityBlock_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAllocation" ADD CONSTRAINT "InventoryAllocation_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_plannerId_fkey" FOREIGN KEY ("plannerId") REFERENCES "PlannerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingItem" ADD CONSTRAINT "BookingItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingRecord" ADD CONSTRAINT "MeetingRecord_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAssignment" ADD CONSTRAINT "StaffAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveEvent" ADD CONSTRAINT "LiveEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveTask" ADD CONSTRAINT "LiveTask_liveEventId_fkey" FOREIGN KEY ("liveEventId") REFERENCES "LiveEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskSnapshot" ADD CONSTRAINT "RiskSnapshot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialSummary" ADD CONSTRAINT "FinancialSummary_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
