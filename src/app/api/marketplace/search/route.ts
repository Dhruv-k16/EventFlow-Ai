// src/app/api/marketplace/search/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category     = searchParams.get('category');
  const city         = searchParams.get('city');
  const q            = searchParams.get('q');
  const eventDate    = searchParams.get('date');
  const qtyRequested = parseInt(searchParams.get('qty') || '0');

  try {
    const vendors = await prisma.vendor.findMany({
      where: {
        ...(category && category !== 'All' && {
          category: { equals: category, mode: 'insensitive' },
        }),
        ...(city && {
          city: { contains: city, mode: 'insensitive' },
        }),
        ...(q && {
          OR: [
            { businessName: { contains: q, mode: 'insensitive' } },
            { description:  { contains: q, mode: 'insensitive' } },
            { tagline:      { contains: q, mode: 'insensitive' } },
            { category:     { contains: q, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        portfolioItems: {
          take: 3,
          orderBy: { displayOrder: 'asc' },
          select: { id: true, title: true, imageUrl: true },
        },
        // FIX: relation name is InventoryAllocation, not dailyAvailability
        // FIX: include:false is invalid — always include, filter in JS
        inventory: {
          include: {
            InventoryAllocation: eventDate
              ? { where: { date: new Date(eventDate) } }
              : true,
          },
        },
        _count: { select: { bookings: true } },
      },
      orderBy: [{ rating: 'desc' }, { businessName: 'asc' }],
    });

    const results = vendors
      .map((vendor) => {
        if (eventDate && qtyRequested > 0) {
          const hasAvailable = vendor.inventory.some((item: any) => {
            // FIX: was dailyAvailability — now InventoryAllocation
            const record = item.InventoryAllocation?.[0];
            const taken  = record?.allocatedQty ?? 0;
            return (item.totalQuantity - taken) >= qtyRequested;
          });
          if (!hasAvailable) return null;
        }

        const { inventory, ...rest } = vendor;
        return { ...rest, inventoryCount: inventory.length };
      })
      .filter(Boolean);

    return NextResponse.json({ vendors: results, total: results.length });
  } catch (error) {
    console.error('[GET /api/marketplace/search]', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
