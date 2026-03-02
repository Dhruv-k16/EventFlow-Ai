// src/app/api/vendors/route.ts
// GET /api/vendors?date=2026-09-20&category=Catering&query=elite
// Returns all vendors with their slot availability for the requested date.
// SRS: Marketplace must display slot count per vendor.

import { prisma } from '@/lib/prisma';
import { getVendorSlots, toUTCMidnight } from '@/lib/slotEngine';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam  = searchParams.get('date');
  const category   = searchParams.get('category');
  const query      = searchParams.get('query');

  if (!dateParam) {
    return NextResponse.json({ error: 'date is required (YYYY-MM-DD)' }, { status: 400 });
  }

  const targetDate = toUTCMidnight(dateParam);

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        ...(category && category !== 'All' ? { category } : {}),
        ...(query ? { businessName: { contains: query, mode: 'insensitive' } } : {}),
      },
      include: {
        inventory: {
          include: {
            dailyAllocations: {
              where: { date: targetDate },
            },
          },
        },
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Compute slot availability for each vendor in parallel
    const results = await Promise.all(
      vendors.map(async (vendor: {
        id: string;
        businessName: string;
        category: string;
        description: string | null;
        maxEventsPerDay: number;
        rating: { toNumber: () => number } | number;
        location: string | null;
        inventory: {
          id: string; vendorId: string; name: string; description: string | null;
          totalQuantity: number; basePrice: { toNumber: () => number } | number;
          unit: string; imageUrl: string | null;
          dailyAllocations: { allocatedQty: number }[];
        }[];
      }) => {
        const slotSummary = await getVendorSlots(
          vendor.id,
          targetDate,
          targetDate
        );
        const slot = slotSummary.slots[0]; // single day requested

        return {
          id:              vendor.id,
          businessName:    vendor.businessName,
          category:        vendor.category,
          description:     vendor.description,
          maxEventsPerDay: vendor.maxEventsPerDay,
          rating:          Number(vendor.rating),
          location:        vendor.location,
          // SRS slot fields
          availableSlots:  slot.remainingSlots,
          totalSlots:      slot.totalSlots,
          isAvailable:     slot.isAvailable,
          slotLabel:       slot.displayLabel,
          // Inventory with availability baked in
          inventory: vendor.inventory.map((item: {
            id: string; vendorId: string; name: string; description: string | null;
            totalQuantity: number; basePrice: { toNumber: () => number } | number;
            unit: string; imageUrl: string | null;
            dailyAllocations: { allocatedQty: number }[];
          }) => ({
            id:            item.id,
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
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error('[GET /api/vendors]', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
