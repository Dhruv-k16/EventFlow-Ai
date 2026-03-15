// src/app/api/vendor/bookings/route.ts
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
  try {
    const { searchParams } = new URL(req.url);
    const vendorId = user.vendorId ?? searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json({ error: 'No vendor profile associated with this account' }, { status: 400 });
    }

    const statusFilter = searchParams.get('status');
    const activeStatuses: BookingStatus[] = [
      BookingStatus.REQUESTED,
      BookingStatus.MEETING_PHASE_1,
      BookingStatus.CONFIRMATION_PENDING,
      BookingStatus.MEETING_PHASE_2,
      BookingStatus.CONFIRMED,
    ];

    const bookings = await prisma.booking.findMany({
      where: {
        vendorId,
        status: statusFilter ? (statusFilter as BookingStatus) : { in: activeStatuses },
      },
      include: {
        event:         true,
        items:         { include: { inventoryItem: true } },
        MeetingRecord: { orderBy: { phase: 'asc' } }, // FIX: was meetings
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error('[GET /api/vendor/bookings]', err);
    return NextResponse.json({ error: 'Failed to fetch vendor bookings' }, { status: 500 });
  }
}, ['VENDOR', 'ADMIN']);
