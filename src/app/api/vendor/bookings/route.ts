import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vendorId = searchParams.get('vendorId');

  if (!vendorId) return NextResponse.json({ error: 'Vendor ID required' }, { status: 400 });

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        vendorId,
        status: BookingStatus.PENDING,
      },
      include: {
        event: true,
        items: { include: { inventoryItem: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vendor bookings' }, { status: 500 });
  }
}