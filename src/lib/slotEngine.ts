// src/lib/slotEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Pure slot calculation engine. Zero Next.js or HTTP dependencies.
// All functions accept Prisma tx or prisma client — usable inside transactions.
//
// SRS rules implemented here:
//   RemainingSlots = maxEventsPerDay - ConfirmedBookingsOnDate
//   Marketplace display: "X event booking slots available"
//   Fully booked  → isAvailable = false
//   Manual block  → isAvailable = false
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

// Type alias so we can accept either prisma or a transaction client
type DB = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Normalise any date to midnight UTC (for consistent DB comparisons) */
export function toUTCMidnight(date: Date | string): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Expand a date range into an array of midnight-UTC Date objects.
 * e.g. "2026-09-20" → "2026-09-22"  produces [Sep 20, Sep 21, Sep 22]
 */
export function expandDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = toUTCMidnight(startDate);
  const end     = toUTCMidnight(endDate);

  while (current <= end) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

// ── Core Slot Types ───────────────────────────────────────────────────────────

export interface SlotAvailability {
  date:            string;   // ISO date "YYYY-MM-DD"
  totalSlots:      number;   // vendor.maxEventsPerDay
  confirmedCount:  number;   // CONFIRMED bookings on this date
  remainingSlots:  number;   // totalSlots - confirmedCount
  isManuallyBlocked: boolean;
  isAvailable:     boolean;  // false if blocked OR remainingSlots === 0
  // SRS display text
  displayLabel:    string;   // "3 slots available" / "Fully booked" / "Unavailable"
}

export interface VendorSlotSummary {
  vendorId:        string;
  maxEventsPerDay: number;
  slots:           SlotAvailability[];
}

// ── Engine Functions ──────────────────────────────────────────────────────────

/**
 * Calculate slot availability for a vendor across a date range.
 * Returns one SlotAvailability entry per calendar day.
 */
export async function getVendorSlots(
  vendorId:  string,
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<VendorSlotSummary> {
  const start = toUTCMidnight(startDate);
  const end   = toUTCMidnight(endDate);
  const dates = expandDateRange(start, end);

  // Fetch vendor capacity
  const vendor = await db.vendor.findUnique({
    where:  { id: vendorId },
    select: { maxEventsPerDay: true },
  });

  if (!vendor) throw new Error(`Vendor ${vendorId} not found`);

  // Fetch all CONFIRMED bookings that overlap ANY day in the range
  const confirmedBookings = await db.booking.findMany({
    where: {
      vendorId,
      status: 'CONFIRMED',
      event: {
        startDate: { lte: end },
        endDate:   { gte: start },
      },
    },
    include: {
      event: { select: { startDate: true, endDate: true } },
    },
  });

  // Fetch manual availability blocks that overlap the range
  const blocks = await db.vendorAvailabilityBlock.findMany({
    where: {
      vendorId,
      startDate: { lte: end },
      endDate:   { gte: start },
    },
  });

  // ── Build per-day slot map ─────────────────────────────────────────────────
  const slots: SlotAvailability[] = dates.map((date) => {
    const dateStr = date.toISOString().split('T')[0];

    // Count CONFIRMED bookings that cover this day
    const confirmedCount = confirmedBookings.filter((booking: { event: { startDate: Date; endDate: Date } }) => {
      const evStart = toUTCMidnight(booking.event.startDate);
      const evEnd   = toUTCMidnight(booking.event.endDate);
      return date >= evStart && date <= evEnd;
    }).length;

    // Check manual blocks
    const isManuallyBlocked = blocks.some((block: { startDate: Date; endDate: Date }) => {
      const bStart = toUTCMidnight(block.startDate);
      const bEnd   = toUTCMidnight(block.endDate);
      return date >= bStart && date <= bEnd;
    });

    const remainingSlots = Math.max(0, vendor.maxEventsPerDay - confirmedCount);
    const isAvailable    = !isManuallyBlocked && remainingSlots > 0;

    // SRS display label
    let displayLabel: string;
    if (isManuallyBlocked) {
      displayLabel = 'Unavailable';
    } else if (remainingSlots === 0) {
      displayLabel = 'Fully booked';
    } else if (remainingSlots === 1) {
      displayLabel = '1 slot available';
    } else {
      displayLabel = `${remainingSlots} slots available`;
    }

    return {
      date: dateStr,
      totalSlots:      vendor.maxEventsPerDay,
      confirmedCount,
      remainingSlots,
      isManuallyBlocked,
      isAvailable,
      displayLabel,
    };
  });

  return {
    vendorId,
    maxEventsPerDay: vendor.maxEventsPerDay,
    slots,
  };
}

/**
 * Check if a vendor can accept a booking for a specific date range.
 * Used during booking creation and capacity validation.
 * Returns { canAccept, reason } — never throws.
 */
export async function checkVendorCapacity(
  vendorId:  string,
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<{ canAccept: boolean; reason?: string }> {
  try {
    const summary = await getVendorSlots(vendorId, startDate, endDate, db);

    // All days in the range must have at least 1 slot
    const blockedDays = summary.slots.filter(s => !s.isAvailable);

    if (blockedDays.length === 0) {
      return { canAccept: true };
    }

    const manuallyBlocked = blockedDays.filter(s => s.isManuallyBlocked);
    const fullyBooked     = blockedDays.filter(s => !s.isManuallyBlocked && s.remainingSlots === 0);

    if (manuallyBlocked.length > 0) {
      return {
        canAccept: false,
        reason:    `Vendor is unavailable on: ${manuallyBlocked.map(s => s.date).join(', ')}`,
      };
    }

    return {
      canAccept: false,
      reason:    `Vendor is fully booked on: ${fullyBooked.map(s => s.date).join(', ')}`,
    };
  } catch (err: any) {
    return { canAccept: false, reason: err.message };
  }
}

/**
 * Check if inventory items have sufficient stock for a date range.
 * Accounts for all CONFIRMED bookings that overlap the range.
 */
export async function checkInventoryAvailability(
  items: { inventoryItemId: string; quantity: number }[],
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<{ available: boolean; conflicts: string[] }> {
  const start  = toUTCMidnight(startDate);
  const end    = toUTCMidnight(endDate);
  const dates  = expandDateRange(start, end);
  const conflicts: string[] = [];

  for (const requested of items) {
    const invItem = await db.inventoryItem.findUnique({
      where: { id: requested.inventoryItemId },
    });
    if (!invItem) {
      conflicts.push(`Item ${requested.inventoryItemId} not found`);
      continue;
    }

    // Check each day in the range
    for (const date of dates) {
      const allocation = await db.inventoryAllocation.findUnique({
        where: {
          inventoryItemId_date: {
            inventoryItemId: requested.inventoryItemId,
            date,
          },
        },
      });

      const allocated = allocation?.allocatedQty ?? 0;
      const available = invItem.totalQuantity - allocated;

      if (available < requested.quantity) {
        conflicts.push(
          `"${invItem.name}" has only ${available} available on ${date.toISOString().split('T')[0]} (requested: ${requested.quantity})`
        );
      }
    }
  }

  return { available: conflicts.length === 0, conflicts };
}

/**
 * Allocate inventory across all days in a date range.
 * Only called when booking transitions to CONFIRMED.
 * Must be called inside a Prisma transaction.
 */
export async function allocateInventory(
  items: { inventoryItemId: string; quantity: number }[],
  startDate: Date | string,
  endDate:   Date | string,
  db: DB
): Promise<void> {
  const dates = expandDateRange(toUTCMidnight(startDate), toUTCMidnight(endDate));

  for (const item of items) {
    for (const date of dates) {
      await db.inventoryAllocation.upsert({
        where: {
          inventoryItemId_date: {
            inventoryItemId: item.inventoryItemId,
            date,
          },
        },
        update: { allocatedQty: { increment: item.quantity } },
        create: {
          inventoryItemId: item.inventoryItemId,
          date,
          allocatedQty:    item.quantity,
        },
      });
    }
  }
}

/**
 * Release inventory allocation across all days in a date range.
 * Called when a CONFIRMED booking is CANCELLED.
 * Must be called inside a Prisma transaction.
 */
export async function releaseInventory(
  items: { inventoryItemId: string; quantity: number }[],
  startDate: Date | string,
  endDate:   Date | string,
  db: DB
): Promise<void> {
  const dates = expandDateRange(toUTCMidnight(startDate), toUTCMidnight(endDate));

  for (const item of items) {
    for (const date of dates) {
      await db.inventoryAllocation.updateMany({
        where: {
          inventoryItemId: item.inventoryItemId,
          date,
        },
        data: {
          // Clamp to 0 — never go negative
          allocatedQty: { decrement: item.quantity },
        },
      });
    }
  }
}
