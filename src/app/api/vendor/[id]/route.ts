// src/app/api/vendors/[id]/route.ts
// GET /api/vendors/:id?date=2026-09-20
// Full vendor profile + inventory + slot info for a specific date.

import { prisma } from '@/lib/prisma';
import { getVendorSlots, toUTCMidnight } from '@/lib/slotEngine';
import { NextRequest, NextResponse } from 'next/server';

// Local shapes for Prisma result callbacks (resolved properly after `prisma generate`)
type InvItem = {
  id: string; vendorId: string; name: string; description: string | null;
  totalQuantity: number; basePrice: number | { toString(): string };
  unit: string; imageUrl: string | null;
  dailyAllocations: { allocatedQty: number }[];
};
type StaffRow  = { id: string; name: string; role: string; status: string };
type BlockRow  = { id: string; startDate: Date; endDate: Date; reason: string | null };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const targetDate = dateParam ? toUTCMidnight(dateParam) : toUTCMidnight(new Date());

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            dailyAllocations: {
              where: { date: targetDate },
            },
          },
          orderBy: { name: 'asc' },
        },
        staff: {
          orderBy: { name: 'asc' },
        },
        availabilityBlocks: {
          where: {
            endDate: { gte: new Date() }, // Only future/active blocks
          },
          orderBy: { startDate: 'asc' },
        },
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Slot summary for the requested date
    const slotSummary = await getVendorSlots(id, targetDate, targetDate);
    const slot = slotSummary.slots[0];

    return NextResponse.json({
      id:              vendor.id,
      businessName:    vendor.businessName,
      category:        vendor.category,
      description:     vendor.description,
      maxEventsPerDay: vendor.maxEventsPerDay,
      rating:          Number(vendor.rating),
      location:        vendor.location,
      contactEmail:    vendor.user.email,
      // Slot info
      availableSlots:  slot.remainingSlots,
      totalSlots:      slot.totalSlots,
      isAvailable:     slot.isAvailable,
      slotLabel:       slot.displayLabel,
      // Inventory with live availability
      inventory: vendor.inventory.map((item: InvItem) => ({
        id:            item.id,
        vendorId:      item.vendorId,
        name:          item.name,
        description:   item.description,
        totalQuantity: item.totalQuantity,
        basePrice:     Number(item.basePrice),
        unit:          item.unit,
        imageUrl:      item.imageUrl,
        availableQty:  item.totalQuantity - (item.dailyAllocations[0]?.allocatedQty ?? 0),
      })),
      // Staff roster
      staff: vendor.staff.map((s: StaffRow) => ({
        id:     s.id,
        name:   s.name,
        role:   s.role,
        status: s.status,
      })),
      // Active availability blocks (so clients know why a date is blocked)
      availabilityBlocks: vendor.availabilityBlocks.map((b: BlockRow) => ({
        id:        b.id,
        startDate: b.startDate.toISOString().split('T')[0],
        endDate:   b.endDate.toISOString().split('T')[0],
        reason:    b.reason,
      })),
    });
  } catch (err) {
    console.error('[GET /api/vendors/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 });
  }
}
