import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const qtyRequested = parseInt(searchParams.get('qty') || '0');
  const eventDate = searchParams.get('date');

  if (!eventDate) return NextResponse.json({ error: 'Date required' }, { status: 400 });

  const targetDate = new Date(eventDate);

  try {
    const vendors = await prisma.vendor.findMany({
      where: { category: category || undefined },
      include: {
        inventory: {
          include: {
            // Change this to match your schema relation name (likely 'availabilities')
            dailyAvailability: {
              where: { date: targetDate }
            }
          }
        }
      }
    });

    const availableVendors = vendors.map((vendor: any) => {
      const filteredInventory = vendor.inventory.filter((item: any) => {
        // Match the name change here too
        const record = item.availabilities?.[0];
        const actualAvailable = item.totalQuantity - ((record?.bookedQty || 0) + (record?.holdQty || 0));
        return actualAvailable >= qtyRequested;
      });

      return { ...vendor, inventory: filteredInventory };
    }).filter(v => v.inventory.length > 0);

    return NextResponse.json(availableVendors);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}