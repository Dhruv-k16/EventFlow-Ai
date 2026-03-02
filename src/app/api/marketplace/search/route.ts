// src/app/api/marketplace/search/route.ts
// ✅ Fixed for v2 schema:
//   - dailyAvailability → dailyAllocations
//   - allocatedQty only (no holdQty — SRS: no soft locks)
//   - Added slot availability (maxEventsPerDay - confirmedBookingsOnDate)
//   - Added VendorAvailabilityBlock check
//   - Vendor include now explicit

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Local shapes for Prisma result callbacks (resolved properly after `prisma generate`)
type InvItemWithAlloc = {
  id: string; vendorId: string; name: string; description: string | null;
  totalQuantity: number; basePrice: number | { toString(): string };
  unit: string; imageUrl: string | null;
  dailyAllocations: { allocatedQty: number }[];
};
type VendorRow = {
  id: string; businessName: string; category: string; description: string | null;
  maxEventsPerDay: number; rating: number | { toString(): string }; location: string | null;
  inventory: InvItemWithAlloc[];
  availabilityBlocks: { id: string }[];
  bookings: { id: string }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category  = searchParams.get('category');
  const query     = searchParams.get('query');
  const qty       = parseInt(searchParams.get('qty') || '1');
  const eventDate = searchParams.get('date');

  if (!eventDate) {
    return NextResponse.json({ error: 'date is required (ISO format)' }, { status: 400 });
  }

  const targetDate = new Date(eventDate);
  targetDate.setUTCHours(0, 0, 0, 0);

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        ...(category ? { category } : {}),
      },
      include: {
        inventory: {
          where: query
            ? { name: { contains: query, mode: 'insensitive' } }
            : {},
          include: {
            dailyAllocations: { // ✅ Fixed: was dailyAvailability
              where: { date: targetDate },
            },
          },
        },
        // Check manual availability blocks
        availabilityBlocks: {
          where: {
            startDate: { lte: targetDate },
            endDate:   { gte: targetDate },
          },
        },
        // Count confirmed bookings on this date for slot calculation
        bookings: {
          where: {
            status: 'CONFIRMED',
            event:  {
              startDate: { lte: targetDate },
              endDate:   { gte: targetDate },
            },
          },
          select: { id: true },
        },
      },
    });

    const results = vendors
      .map((vendor: VendorRow) => {
        // ── Slot availability (SRS core) ─────────────────────────────────
        const confirmedBookingsOnDate = vendor.bookings.length;
        const availableSlots  = Math.max(0, vendor.maxEventsPerDay - confirmedBookingsOnDate);
        const isManuallyBlocked = vendor.availabilityBlocks.length > 0;
        const isAvailable     = !isManuallyBlocked && availableSlots > 0;

        // ── Inventory availability ────────────────────────────────────────
        const availableInventory = vendor.inventory.filter((item: InvItemWithAlloc) => {
          const allocation   = item.dailyAllocations[0]; // ✅ Fixed field name
          const allocated    = allocation?.allocatedQty ?? 0;
          const available    = item.totalQuantity - allocated;
          return available >= qty;
        });

        return {
          id:              vendor.id,
          businessName:    vendor.businessName,
          category:        vendor.category,
          description:     vendor.description,
          maxEventsPerDay: vendor.maxEventsPerDay,
          rating:          Number(vendor.rating),
          location:        vendor.location,
          // SRS: display slot info on marketplace
          availableSlots,
          totalSlots:      vendor.maxEventsPerDay,
          isAvailable,
          isManuallyBlocked,
          inventory:       availableInventory.map((item: InvItemWithAlloc) => ({
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
        };
      })
      .filter((v: { inventory: unknown[] }) => v.inventory.length > 0);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[GET /api/marketplace/search]', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
