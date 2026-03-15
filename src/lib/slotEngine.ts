// src/lib/slotEngine.ts
import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

type DB = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;

export function toUTCMidnight(date: Date | string): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

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

export interface SlotAvailability {
  date:              string;
  totalSlots:        number;
  confirmedCount:    number;
  remainingSlots:    number;
  isManuallyBlocked: boolean;
  isAvailable:       boolean;
  displayLabel:      string;
}

export interface VendorSlotSummary {
  vendorId:        string;
  maxEventsPerDay: number;
  slots:           SlotAvailability[];
}

export async function getVendorSlots(
  vendorId:  string,
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<VendorSlotSummary> {
  const start = toUTCMidnight(startDate);
  const end   = toUTCMidnight(endDate);
  const dates = expandDateRange(start, end);

  const vendor = await db.vendor.findUnique({
    where: { id: vendorId }, select: { maxEventsPerDay: true },
  });
  if (!vendor) throw new Error(`Vendor ${vendorId} not found`);

  const confirmedBookings = await db.booking.findMany({
    where: {
      vendorId,
      status: 'CONFIRMED',
      event:  { startDate: { lte: end }, endDate: { gte: start } },
    },
    include: { event: { select: { startDate: true, endDate: true } } },
  });

  const blocks = await db.vendorAvailabilityBlock.findMany({
    where: { vendorId, startDate: { lte: end }, endDate: { gte: start } },
  });

  const slots: SlotAvailability[] = dates.map((date) => {
    const dateStr = date.toISOString().split('T')[0];

    const confirmedCount = confirmedBookings.filter((booking: { event: { startDate: Date; endDate: Date } }) => {
      const evStart = toUTCMidnight(booking.event.startDate);
      const evEnd   = toUTCMidnight(booking.event.endDate);
      return date >= evStart && date <= evEnd;
    }).length;

    const isManuallyBlocked = blocks.some((block: { startDate: Date; endDate: Date }) => {
      const bStart = toUTCMidnight(block.startDate);
      const bEnd   = toUTCMidnight(block.endDate);
      return date >= bStart && date <= bEnd;
    });

    const remainingSlots = Math.max(0, vendor.maxEventsPerDay - confirmedCount);
    const isAvailable    = !isManuallyBlocked && remainingSlots > 0;

    let displayLabel: string;
    if (isManuallyBlocked)      displayLabel = 'Unavailable';
    else if (remainingSlots === 0) displayLabel = 'Fully booked';
    else if (remainingSlots === 1) displayLabel = '1 slot available';
    else                           displayLabel = `${remainingSlots} slots available`;

    return { date: dateStr, totalSlots: vendor.maxEventsPerDay, confirmedCount, remainingSlots, isManuallyBlocked, isAvailable, displayLabel };
  });

  return { vendorId, maxEventsPerDay: vendor.maxEventsPerDay, slots };
}

export async function checkVendorCapacity(
  vendorId:  string,
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<{ canAccept: boolean; reason?: string }> {
  try {
    const summary     = await getVendorSlots(vendorId, startDate, endDate, db);
    const blockedDays = summary.slots.filter(s => !s.isAvailable);
    if (blockedDays.length === 0) return { canAccept: true };

    const manuallyBlocked = blockedDays.filter(s => s.isManuallyBlocked);
    const fullyBooked     = blockedDays.filter(s => !s.isManuallyBlocked && s.remainingSlots === 0);

    if (manuallyBlocked.length > 0) {
      return { canAccept: false, reason: `Vendor is unavailable on: ${manuallyBlocked.map(s => s.date).join(', ')}` };
    }
    return { canAccept: false, reason: `Vendor is fully booked on: ${fullyBooked.map(s => s.date).join(', ')}` };
  } catch (err: any) {
    return { canAccept: false, reason: err.message };
  }
}

export async function checkInventoryAvailability(
  items: { inventoryItemId: string; quantity: number }[],
  startDate: Date | string,
  endDate:   Date | string,
  db: DB = prisma
): Promise<{ available: boolean; conflicts: string[] }> {
  const start     = toUTCMidnight(startDate);
  const end       = toUTCMidnight(endDate);
  const dates     = expandDateRange(start, end);
  const conflicts: string[] = [];

  for (const requested of items) {
    const invItem = await db.inventoryItem.findUnique({ where: { id: requested.inventoryItemId } });
    if (!invItem) { conflicts.push(`Item ${requested.inventoryItemId} not found`); continue; }

    for (const date of dates) {
      const allocation = await db.inventoryAllocation.findUnique({
        where: { inventoryItemId_date: { inventoryItemId: requested.inventoryItemId, date } },
      });
      const allocated = allocation?.allocatedQty ?? 0;
      const available = invItem.totalQuantity - allocated;
      if (available < requested.quantity) {
        conflicts.push(`"${invItem.name}" has only ${available} available on ${date.toISOString().split('T')[0]} (requested: ${requested.quantity})`);
      }
    }
  }

  return { available: conflicts.length === 0, conflicts };
}

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
        where:  { inventoryItemId_date: { inventoryItemId: item.inventoryItemId, date } },
        update: { allocatedQty: { increment: item.quantity } },
        create: {
          // FIX: InventoryAllocation has no @default(uuid()) — must supply id
          id:              crypto.randomUUID(),
          inventoryItemId: item.inventoryItemId,
          date,
          allocatedQty:    item.quantity,
        },
      });
    }
  }
}

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
        where: { inventoryItemId: item.inventoryItemId, date },
        data:  { allocatedQty: { decrement: item.quantity } },
      });
    }
  }
}
