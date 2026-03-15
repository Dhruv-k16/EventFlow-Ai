// src/app/api/vendor/route.ts  (marketplace vendor listing)
import { prisma } from '@/lib/prisma';
import { getVendorSlots, toUTCMidnight } from '@/lib/slotEngine';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const category  = searchParams.get('category');
  const query     = searchParams.get('query');

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
            // FIX: was dailyAllocations — relation name is InventoryAllocation in schema
            InventoryAllocation: { where: { date: targetDate } },
          },
        },
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { rating: 'desc' },
    });

    const results = await Promise.all(
      vendors.map(async (vendor) => {
        const slotSummary = await getVendorSlots(vendor.id, targetDate, targetDate);
        const slot = slotSummary.slots[0];

        return {
          id:              vendor.id,
          businessName:    vendor.businessName,
          category:        vendor.category,
          description:     vendor.description,
          maxEventsPerDay: vendor.maxEventsPerDay,
          rating:          Number(vendor.rating),
          location:        vendor.location,
          availableSlots:  slot.remainingSlots,
          totalSlots:      slot.totalSlots,
          isAvailable:     slot.isAvailable,
          slotLabel:       slot.displayLabel,
          inventory: vendor.inventory.map((item) => ({
            id:            item.id,
            name:          item.name,
            description:   item.description,
            totalQuantity: item.totalQuantity,
            basePrice:     Number(item.basePrice),
            unit:          item.unit,
            imageUrl:      item.imageUrl,
            // FIX: was item.dailyAllocations — now item.InventoryAllocation
            availableQty:  item.totalQuantity - ((item.InventoryAllocation as { allocatedQty: number }[])[0]?.allocatedQty ?? 0),
          })),
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error('[GET /api/vendor]', err);
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 });
  }
}
